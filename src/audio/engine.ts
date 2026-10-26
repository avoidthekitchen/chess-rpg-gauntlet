import { store } from '../store';
import manifest from './audioManifest.json';
import { AUDIO_CHANNELS, AUDIO_KEY, parseAudioSettings, sliderGain, type AudioChannel, type AudioSettings } from './settings';
import { MUSIC_REST, SPOT_GAP, type Soundscape } from './soundtrack';
import { voiceKey } from './voiceRoles';
import type { VoiceLine } from './voiceScript';

/**
 * The game's sound: four channels (music, ambience, effects, voices) on one Web Audio graph.
 * Music and ambience beds stream through a few long-lived media elements, so long tracks
 * never sit decoded in memory; effects, scattered ambience and voices are short buffers.
 * Everything fails quietly: a missing file or a browser without Web Audio plays nothing.
 */

interface Manifest { sfx: Record<string, number>; music: string[]; beds: string[]; spots: string[]; voices: Record<string, string[]> }
const MANIFEST = manifest as Manifest;
const VOICED = new Map(Object.entries(MANIFEST.voices).map(([role, keys]) => [role, new Set(keys)]));
const base = () => `${import.meta.env.BASE_URL}audio/`;

/** Music under speech drops by about 8 dB, ambience by 5 dB; stingers take music lower still. */
const DUCK = { music: 0.4, ambience: 0.55, stinger: 0.25 };
/** Seconds: track changes, first fade-in, ambience bed crossfades, and the pause before music returns after speech. */
const FADE = { out: 1.2, in: 2.2, bed: 3, unduck: 0.6 };
/** Decoded voices and scattered ambience kept in memory; effects are always kept. */
const RECENT_BUFFERS = 32;

/** Every effect the game plays. The audio tests check this list against what ships. */
export const SFX_NAMES = [
  'place', 'hop', 'stomp', 'stomp-land', 'hit', 'fly', 'check', 'promote', 'hint', 'nudge', 'swish', 'unswish',
  'page', 'book', 'tap', 'confetti', 'star', 'sting-wave', 'sting-win', 'sting-chapter', 'sting-lost', 'sting-mate',
] as const;
export type SfxName = (typeof SFX_NAMES)[number];

export interface SfxOptions {
  gain?: number;
  /** Playback rate: above 1 is higher and shorter. */
  rate?: number;
  /** -1 (left) to 1 (right). */
  pan?: number;
  /** Seconds from now. */
  delay?: number;
  /** Small random pitch drift, so repeated sounds don't machine-gun. Off for musical stingers. */
  vary?: boolean;
  /** Lower the music under a musical stinger. */
  duck?: boolean;
}

/**
 * A long-lived media element wired once into the graph. Slots are reused by changing their
 * source: iOS only lets an element play after a tap has started it once, and a media
 * element can be connected to Web Audio only once.
 */
interface Slot { el: HTMLAudioElement; gain: GainNode; channel: 'music' | 'ambience'; id: string | null; url: string; generation: number; timer: number; resting: boolean; primed: boolean }

/** A tenth of a second of silence, used to unlock each slot inside the first tap. */
function silence() {
  const data = new DataView(new ArrayBuffer(44 + 800));
  const text = (at: number, s: string) => { for (let i = 0; i < s.length; i++) data.setUint8(at + i, s.charCodeAt(i)); };
  text(0, 'RIFF'); data.setUint32(4, 36 + 800, true); text(8, 'WAVEfmt '); data.setUint32(16, 16, true);
  data.setUint16(20, 1, true); data.setUint16(22, 1, true); data.setUint32(24, 8000, true); data.setUint32(28, 8000, true);
  data.setUint16(32, 1, true); data.setUint16(34, 8, true); text(36, 'data'); data.setUint32(40, 800, true);
  for (let i = 0; i < 800; i++) data.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([data], { type: 'audio/wav' }));
}

class AudioEngine {
  private saved: AudioSettings | null = null;
  /** Read on first use, so importing the engine never touches storage. */
  get settings(): AudioSettings { return (this.saved ??= parseAudioSettings(store.get(AUDIO_KEY))); }
  /** Told which recording is playing (`role:key`), or null when the voice falls silent. */
  onSpeaking: (key: string | null) => void = () => {};
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus = {} as Record<AudioChannel, GainNode>;
  private duck = {} as Record<'music' | 'ambience', GainNode>;
  private kept = new Map<string, Promise<AudioBuffer | null>>();
  private recent = new Map<string, Promise<AudioBuffer | null>>();
  private lastVariant = new Map<string, number>();
  private listeners = new Set<() => void>();
  private unlocked = false;
  private blank: string | null = null;
  private scape: Soundscape | null = null;
  private musicSlots: Slot[] = [];
  private bedSlots: Slot[] = [];
  private music: Slot | null = null;
  private bed: Slot | null = null;
  private bedTimer = 0;
  private spotTimer = 0;
  private spotKey = '';
  private voice: { source: AudioBufferSourceNode; token: number } | null = null;
  private voiceToken = 0;
  private ducks: number[] = [];
  /** Effects not yet started, so leaving a screen can cancel them. */
  private pending = new Map<AudioBufferSourceNode, number>();
  private effectsEpoch = 0;
  private hiddenPaused: HTMLAudioElement[] = [];

  /** Builds the audio graph once. Safe to call before any user gesture. */
  start() {
    if (this.ctx || typeof window === 'undefined') return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor({ latencyHint: 'interactive' });
    } catch {
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    // A gentle limiter keeps stacked sounds (a capture under a stinger) from clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 6; limiter.ratio.value = 8; limiter.attack.value = 0.003; limiter.release.value = 0.2;
    this.master.connect(limiter).connect(ctx.destination);
    for (const channel of AUDIO_CHANNELS) this.bus[channel] = ctx.createGain();
    this.duck.music = ctx.createGain();
    this.duck.ambience = ctx.createGain();
    this.bus.music.connect(this.duck.music).connect(this.master);
    this.bus.ambience.connect(this.duck.ambience).connect(this.master);
    this.bus.effects.connect(this.master);
    this.bus.voices.connect(this.master);
    this.musicSlots = this.slots(2, 'music');
    this.bedSlots = this.slots(2, 'ambience');
    this.apply(true);

    // Browsers allow sound only inside a tap. On touch screens only the end of a tap counts,
    // so every tap retries: it restarts refused streams and unlocks any player not yet
    // unlocked by playing silence through it.
    const unlock = () => {
      if (!this.ctx) return;
      if (this.ctx.state !== 'running') void this.ctx.resume().catch(() => {});
      if (!this.unlocked) { this.unlocked = true; this.resumeScape(); this.notify(); }
      else this.retryStreams();
      for (const slot of [...this.musicSlots, ...this.bedSlots]) {
        if (slot.primed || slot.id) continue;
        slot.el.src = this.blank ??= silence();
        void slot.el.play().then(() => { slot.primed = true; if (!slot.id) slot.el.pause(); }, () => {});
      }
    };
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown']) window.addEventListener(type, unlock, { capture: true, passive: true });
    ctx.addEventListener('statechange', () => this.notify());
    document.addEventListener('visibilitychange', () => this.onVisibility());
    // Every effect is small; decode them up front so the first move already clicks.
    for (const [name, variants] of Object.entries(MANIFEST.sfx)) for (let i = 1; i <= variants; i++) void this.buffer(`sfx/${name}-${i}.mp3`, true);
  }

  /** True once the browser lets us play (after the first tap or key press). */
  get running() { return this.ctx?.state === 'running'; }

  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { for (const fn of this.listeners) fn(); }

  /** Changes settings. Slider drags pass `save: false` and save once on release. */
  set(change: Partial<AudioSettings>, save = true) {
    this.saved = { ...this.settings, ...change };
    if (save) store.set(AUDIO_KEY, JSON.stringify(this.settings));
    this.apply();
    // Silenced voices stop mid-line; silenced streams pause so they stop downloading.
    if (change.muted === true || change.voices === 0) this.hush();
    for (const slot of [this.music, this.bed]) if (slot && !this.on(slot.channel)) slot.el.pause();
    this.retryStreams();
    this.notify();
  }

  /** Whether a channel can be heard at all. */
  private on(channel: AudioChannel) { return !this.settings.muted && this.settings[channel] > 0; }

  /** Whether voices are switched on (sound not muted and the voices slider above zero). */
  get voicesOn() { return this.on('voices'); }

  /** True when a recorded line would be heard if spoken now. */
  get canSpeak() { return this.running && this.on('voices'); }

  toggleMute() { this.set({ muted: !this.settings.muted }); }

  private apply(now = false) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime, tc = now ? 0.001 : 0.06;
    this.master.gain.setTargetAtTime(this.settings.muted ? 0 : 1, t, tc);
    for (const channel of AUDIO_CHANNELS) this.bus[channel].gain.setTargetAtTime(sliderGain(this.settings[channel]), t, tc);
  }

  /** Moves a gain to a value, replacing anything already scheduled on it. */
  private glide(param: AudioParam, value: number, delay: number, timeConstant: number) {
    const t = this.ctx!.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.setTargetAtTime(value, t + delay, timeConstant);
  }

  // ---------- music and ambience ----------

  /** Sets the music and ambience for a screen. The same track carries on across screens. */
  setScape(scape: Soundscape) {
    const same = this.scape && JSON.stringify(this.scape) === JSON.stringify(scape);
    this.scape = scape;
    if (!same) this.resumeScape();
  }

  private resumeScape() {
    const scape = this.scape;
    if (!scape || !this.ctx || !this.unlocked) return;
    this.playMusic(scape.music && MANIFEST.music.includes(scape.music) ? scape.music : null, scape.musicLevel);
    this.playBed(scape.bed && MANIFEST.beds.includes(scape.bed) ? scape.bed : null, scape.ambienceLevel);
    const spots = scape.spots.filter((s) => MANIFEST.spots.includes(s)).join(',');
    if (spots !== this.spotKey) { this.spotKey = spots; this.scheduleSpot(); }
  }

  /** Restarts the current music and bed if the browser refused them, but never cuts a track's rest short. */
  private retryStreams() {
    if (document.hidden || !this.scape || !this.unlocked) return;
    if (this.music?.el.paused && !this.music.resting) this.play(this.music, this.scape.musicLevel, FADE.in);
    if (this.bed?.el.paused) this.play(this.bed, this.scape.ambienceLevel, FADE.in);
  }

  private slots(count: number, channel: Slot['channel']): Slot[] {
    const ctx = this.ctx!, bus = this.bus[channel];
    const out: Slot[] = [];
    for (let i = 0; i < count; i++) {
      const el = new Audio();
      el.preload = 'auto';
      try {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(el).connect(gain).connect(bus);
        const slot: Slot = { el, gain, channel, id: null, url: '', generation: 0, timer: 0, resting: false, primed: false };
        el.addEventListener('error', () => { if (slot.id) console.info(`Optional audio missing: ${slot.id}`); });
        out.push(slot);
      } catch { /* this browser can't stream into Web Audio: no music, effects still play */ }
    }
    return out;
  }

  private fade(slot: Slot, level: number, seconds: number, from = slot.gain.gain.value) {
    const t = this.ctx!.currentTime, g = slot.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(from, t);
    g.linearRampToValueAtTime(level, t + seconds);
  }

  /** Loads a track into a slot and starts it, fading in once it actually plays. */
  private load(slot: Slot, id: string, folder: string, level: number, fade: number) {
    window.clearTimeout(slot.timer);
    slot.generation++;
    slot.id = id;
    slot.resting = false;
    this.fade(slot, 0, 0.01);
    // The file is fetched only when the channel can be heard (play sets the source).
    slot.url = `${base()}${folder}/${id}.mp3`;
    if (this.on(slot.channel)) slot.el.src = slot.url;
    else slot.el.pause();
    this.play(slot, level, fade);
  }

  private play(slot: Slot, level: number, fade: number) {
    // A silenced channel stays paused; turning it back on starts it here.
    if (!this.on(slot.channel)) return;
    if (slot.url && slot.el.getAttribute('src') !== slot.url) slot.el.src = slot.url;
    // A paused slot starts from silence, so a retried or resumed play fades in rather than jumps.
    const from = slot.el.paused ? 0 : undefined;
    if (from === 0) this.fade(slot, 0, 0, 0);
    const generation = slot.generation;
    void slot.el.play().then(() => { slot.primed = true; if (slot.generation === generation) this.fade(slot, level, fade, from); }, () => {});
  }

  /** Fades a slot out and frees it, unless it has been given a new track in the meantime. */
  private release(slot: Slot, seconds = FADE.out) {
    window.clearTimeout(slot.timer);
    const generation = slot.generation;
    this.fade(slot, 0, seconds);
    window.setTimeout(() => {
      if (slot.generation !== generation) return;
      slot.el.pause();
      slot.id = null;
    }, seconds * 1000 + 100);
  }

  /** A slot other than `busy`: a free one if possible, else whichever is fading out. */
  private spare(slots: Slot[], busy: Slot | null) {
    return slots.find((s) => s !== busy && !s.id) ?? slots.find((s) => s !== busy) ?? null;
  }

  private playMusic(id: string | null, level: number) {
    const current = this.music;
    if (current && current.id === id) {
      // A play the browser refused earlier (a background tab, a strict autoplay rule) is retried with a fade-in.
      if (current.el.paused && !current.resting) this.play(current, level, FADE.in);
      else this.fade(current, level, 1);
      return;
    }
    if (current) this.release(current);
    this.music = null;
    if (!id) return;
    const slot = this.spare(this.musicSlots, current);
    if (!slot) return;
    this.music = slot;
    this.load(slot, id, 'music', level, FADE.in);
    // Tracks are composed with real endings: play through, rest a moment, then begin again.
    const generation = slot.generation;
    slot.el.onended = () => {
      if (slot.generation !== generation) return;
      slot.resting = true;
      slot.timer = window.setTimeout(() => {
        if (slot.generation !== generation || this.music !== slot) return;
        slot.resting = false;
        slot.el.currentTime = 0;
        // In a hidden tab, start from the top when the player returns instead.
        if (document.hidden) { this.hiddenPaused.push(slot.el); return; }
        if (this.on('music')) void slot.el.play().catch(() => {});
      }, MUSIC_REST * 1000);
    };
  }

  private playBed(id: string | null, level: number) {
    const current = this.bed;
    if (current && current.id === id) {
      if (current.el.paused) this.play(current, level, FADE.in);
      else this.fade(current, level, 1);
      return;
    }
    window.clearInterval(this.bedTimer);
    if (current) this.release(current, 1.5);
    this.bed = null;
    if (!id) return;
    const first = this.spare(this.bedSlots, current);
    if (!first) return;
    this.bed = first;
    this.load(first, id, 'ambience', level, FADE.in);
    // Beds are steady textures: overlap the end of one pass with the start of the next.
    this.bedTimer = window.setInterval(() => {
      const bed = this.bed;
      if (!bed || !Number.isFinite(bed.el.duration) || bed.el.paused) return;
      if (bed.el.duration - bed.el.currentTime > FADE.bed) return;
      const next = this.spare(this.bedSlots, bed);
      if (!next) return;
      this.bed = next;
      this.load(next, id, 'ambience', this.scape?.ambienceLevel ?? level, FADE.bed);
      this.release(bed, FADE.bed);
    }, 200);
  }

  private scheduleSpot() {
    window.clearTimeout(this.spotTimer);
    if (!this.spotKey) return;
    const wait = SPOT_GAP.min + Math.random() * (SPOT_GAP.max - SPOT_GAP.min);
    this.spotTimer = window.setTimeout(() => {
      const spots = this.spotKey.split(',');
      if (this.running && !document.hidden && spots[0] && this.on('ambience')) {
        const name = spots[Math.floor(Math.random() * spots.length)];
        void this.playBuffer(`ambience/${name}.mp3`, this.bus.ambience, { gain: (0.5 + Math.random() * 0.4) * (this.scape?.ambienceLevel ?? 1), pan: (Math.random() * 2 - 1) * 0.7, vary: true });
      }
      this.scheduleSpot();
    }, wait * 1000);
  }

  private onVisibility() {
    if (!this.ctx) return;
    if (document.hidden) {
      this.hiddenPaused = [this.music, this.bed].filter((s): s is Slot => !!s && !s.el.paused).map((s) => s.el);
      for (const el of this.hiddenPaused) el.pause();
      void this.ctx.suspend().catch(() => {});
    } else {
      const paused = this.hiddenPaused;
      this.hiddenPaused = [];
      void this.ctx.resume().catch(() => {});
      const slots = [...this.musicSlots, ...this.bedSlots];
      for (const el of paused) if (this.on(slots.find((s) => s.el === el)?.channel ?? 'music')) void el.play().catch(() => {});
    }
  }

  // ---------- effects ----------

  /** Decodes a file once. Effects stay cached; voices and scattered ambience keep only the most recent. */
  private buffer(path: string, keep = false): Promise<AudioBuffer | null> {
    const cache = keep ? this.kept : this.recent;
    let pending = cache.get(path);
    if (pending) {
      cache.delete(path);
      cache.set(path, pending);
      return pending;
    }
    const ctx = this.ctx;
    pending = !ctx ? Promise.resolve(null) : fetch(`${base()}${path}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => {
        // Forget a failure, so a network hiccup doesn't silence this sound for the session.
        if (cache.get(path) === pending) cache.delete(path);
        console.info(`Optional audio missing: ${path}`);
        return null;
      });
    cache.set(path, pending);
    if (!keep) while (this.recent.size > RECENT_BUFFERS) this.recent.delete(this.recent.keys().next().value!);
    return pending;
  }

  private async playBuffer(path: string, bus: GainNode, o: SfxOptions = {}, keep = false, current = () => true): Promise<AudioBufferSourceNode | null> {
    const buffer = await this.buffer(path, keep);
    const ctx = this.ctx;
    if (!buffer || !ctx || !this.running || !current()) return null;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = (o.rate ?? 1) * (o.vary === false ? 1 : 1 + (Math.random() - 0.5) * 0.05);
    const gain = ctx.createGain();
    gain.gain.value = o.gain ?? 1;
    let tail: AudioNode = source.connect(gain);
    if (o.pan && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, o.pan));
      tail = tail.connect(panner);
    }
    tail.connect(bus);
    const at = ctx.currentTime + (o.delay ?? 0);
    source.start(at);
    this.pending.set(source, at);
    source.addEventListener('ended', () => this.pending.delete(source));
    return source;
  }

  /**
   * Cancels effects that are still loading or scheduled for later, such as a lesson's
   * fanfare and star chimes when the player leaves straight away. Sounds already playing finish.
   */
  cancelEffects() {
    this.effectsEpoch++;
    const now = this.ctx?.currentTime ?? 0;
    for (const [source, at] of this.pending) if (at > now) try { source.stop(); } catch { /* already ended */ }
  }

  /** Plays a sound effect by name, picking one of its recorded variants. */
  sfx(name: SfxName, o: SfxOptions = {}) {
    const variants = MANIFEST.sfx[name];
    if (!variants || !this.running || this.settings.muted) return;
    let pick = 1 + Math.floor(Math.random() * variants);
    if (variants > 1 && pick === this.lastVariant.get(name)) pick = (pick % variants) + 1;
    this.lastVariant.set(name, pick);
    const epoch = this.effectsEpoch;
    void this.playBuffer(`sfx/${name}-${pick}.mp3`, this.bus.effects, o, true, () => epoch === this.effectsEpoch).then((source) => {
      // An inaudible stinger must not hollow out the music.
      if (!source || !o.duck || this.settings.effects === 0) return;
      // Duck when the stinger actually starts; a cancelled stinger never ducks.
      window.setTimeout(() => {
        if (!this.pending.has(source)) return;
        this.duckFor(DUCK.stinger);
        source.addEventListener('ended', () => this.unduck(DUCK.stinger));
      }, (o.delay ?? 0) * 1000);
    });
  }

  // ---------- voices ----------

  hasVoice(role: string | undefined, line: string) {
    return !!role && !!VOICED.get(role)?.has(voiceKey(role, line));
  }

  /** Warms the cache for lines that are about to be spoken. */
  prefetch(lines: (VoiceLine | null | undefined)[]) {
    if (!this.ctx) return;
    for (const v of lines) if (v && this.hasVoice(v.role, v.line)) void this.buffer(`voice/${v.role}/${voiceKey(v.role, v.line)}.mp3`);
  }

  /** True while a recorded line is playing. */
  get speaking() { return this.voice !== null; }

  /**
   * Speaks a recorded line, interrupting any line already playing. Resolves true when it
   * finishes, false if there's no recording, sound is off, or another line cut in.
   */
  async speak(role: string | undefined, line: string, onStart?: (seconds: number) => void): Promise<boolean> {
    if (!role || !this.hasVoice(role, line)) return false;
    const token = ++this.voiceToken;
    this.stopSource();
    if (!this.running || this.settings.muted || this.settings.voices === 0) return false;
    const buffer = await this.buffer(`voice/${role}/${voiceKey(role, line)}.mp3`);
    if (!buffer || token !== this.voiceToken || !this.running) return false;
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.bus.voices);
    this.voice = { source, token };
    this.duckFor(DUCK.music);
    source.start();
    this.onSpeaking(`${role}:${voiceKey(role, line)}`);
    onStart?.(buffer.duration);
    return new Promise((resolve) => {
      source.addEventListener('ended', () => {
        this.unduck(DUCK.music);
        if (this.voice?.source === source) { this.voice = null; this.onSpeaking(null); }
        resolve(token === this.voiceToken);
      });
    });
  }

  /** Stops the line being spoken and cancels any sequence waiting on it. */
  hush() {
    this.voiceToken++;
    this.stopSource();
  }

  private stopSource() {
    const v = this.voice;
    this.voice = null;
    if (!v) return;
    this.onSpeaking(null);
    try { v.source.stop(); } catch { /* already ended */ }
  }

  /**
   * Reads lines in order with a short breath between them, calling `onLine` with the
   * index being spoken (null when done). It gives way if any other line starts.
   * Returns a function that stops the reading.
   */
  readAloud(lines: (VoiceLine | null)[], onLine: (index: number | null) => void, gap = 0.35): () => void {
    let stopped = false;
    const run = async () => {
      for (let i = 0; i < lines.length && !stopped; i++) {
        const v = lines[i];
        if (!v || !this.hasVoice(v.role, v.line)) continue;
        await this.audible(() => stopped);
        if (stopped) break;
        const before = this.voiceToken;
        const done = await this.speak(v.role, v.line, () => { if (!stopped) onLine(i); });
        if (stopped) break;
        // Hidden mid-load, with no other line cutting in: read this line again on return.
        if (!done && document.hidden && this.voiceToken === before + 1) { i--; continue; }
        if (!done) break;
        const after = this.voiceToken;
        await new Promise((r) => window.setTimeout(r, gap * 1000));
        if (this.voiceToken !== after || this.speaking) break;
      }
      if (!stopped) { stopped = true; onLine(null); }
    };
    // Start on the next microtask, so the caller holds the stop handle before any callback,
    // even when no line has a recording and the reading ends at once.
    void Promise.resolve().then(run);
    return () => {
      if (stopped) return;
      stopped = true;
      this.hush();
      onLine(null);
    };
  }

  /** Waits while the tab is hidden, then briefly for the audio to resume, so a reading pauses rather than ends. */
  private async audible(stopped: () => boolean) {
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    while (!stopped() && document.hidden) await sleep(250);
    for (let i = 0; i < 8 && !stopped() && !this.running; i++) await sleep(125);
  }

  private duckFor(level: number) {
    this.ducks.push(level);
    this.applyDuck();
  }

  private unduck(level: number) {
    const i = this.ducks.indexOf(level);
    if (i >= 0) this.ducks.splice(i, 1);
    this.applyDuck();
  }

  /** The deepest active duck wins; music returns only after a short pause, so it doesn't swell between lines. */
  private applyDuck() {
    if (!this.ctx) return;
    const level = this.ducks.length ? Math.min(...this.ducks) : 1;
    const down = level < 1;
    this.glide(this.duck.music.gain, level, down ? 0 : FADE.unduck, down ? 0.06 : 0.35);
    this.glide(this.duck.ambience.gain, down ? DUCK.ambience : 1, down ? 0 : FADE.unduck, down ? 0.08 : 0.35);
  }
}

export const audio = new AudioEngine();
