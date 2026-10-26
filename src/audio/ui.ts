import { audio } from './engine';
import { AUDIO_CHANNELS, type AudioChannel } from './settings';
import { COURSE_LESSONS } from '../game/curriculum';
import { NARRATOR, voiceKey } from './voiceRoles';
import './audio.css';

/**
 * Sound in the HTML layer: a mute toggle that any screen can show, a soft tap for every
 * button, the volume sliders in Settings, and a "speaking" glow on whoever is talking.
 */

const SPEAKER = '<path d="M4 9h3l4-4v14l-4-4H4z" fill="currentColor"/>';
const WAVES = '<path d="M14.5 8.5a5 5 0 0 1 0 7M17 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
const CROSS = '<path d="M15 9.5l5 5M20 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
const icon = (muted: boolean) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${SPEAKER}${muted ? CROSS : WAVES}</svg>`;

/** A mute button; every copy on screen stays in step with the setting. */
export function soundToggle(extra = '') {
  const muted = audio.settings.muted;
  return `<button type="button" class="sound-toggle ${extra}" data-sound-toggle aria-pressed="${muted}" aria-label="Mute sound" title="${muted ? 'Sound is off' : 'Sound is on'}">${icon(muted)}</button>`;
}

/** The story pages' Read aloud control; `setReadAloud` flips it while a page is being read. */
export function readAloudButton(reading = false) {
  return `<button type="button" class="read-aloud" data-action="read" aria-pressed="${reading}">${icon(false)}<span>${reading ? 'Stop reading' : 'Read aloud'}</span></button>`;
}
export function setReadAloud(root: HTMLElement, reading: boolean) {
  for (const b of root.querySelectorAll<HTMLButtonElement>('.read-aloud')) {
    b.setAttribute('aria-pressed', String(reading));
    b.querySelector('span')!.textContent = reading ? 'Stop reading' : 'Read aloud';
  }
}

/** Marks a dialogue element with the recording it belongs to, so it can glow while spoken. */
export function voiceAttr(role: string | undefined, line: string) {
  return audio.hasVoice(role, line) ? ` data-voice="${role}:${voiceKey(role!, line)}"` : '';
}

const LABELS: Record<AudioChannel, string> = { music: 'Music', ambience: 'Ambience', effects: 'Sound effects', voices: 'Voices' };

/** The Settings section: four channel sliders and the master switch. */
export function soundSettings() {
  const s = audio.settings;
  return `<fieldset class="sound-settings"><legend>Sound</legend>
    <label class="sound-master"><input type="checkbox" data-sound-master ${s.muted ? '' : 'checked'}/> <span>Play sound</span></label>
    <div class="sound-sliders${s.muted ? ' muted' : ''}">${AUDIO_CHANNELS.map((c) => `<label><span>${LABELS[c]}</span><input type="range" min="0" max="100" step="1" value="${Math.round(s[c] * 100)}" data-audio-channel="${c}" aria-label="${LABELS[c]} volume"/><output>${Math.round(s[c] * 100)}</output></label>`).join('')}</div>
    <p class="journey-help">Music and voices start after your first tap. Sound settings are saved on this device.</p></fieldset>`;
}

function refreshControls() {
  const s = audio.settings;
  for (const el of document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]')) {
    if (el.getAttribute('aria-pressed') === String(s.muted)) continue;
    el.setAttribute('aria-pressed', String(s.muted));
    el.title = s.muted ? 'Sound is off' : 'Sound is on';
    el.innerHTML = icon(s.muted);
  }
  for (const el of document.querySelectorAll<HTMLInputElement>('[data-sound-master]')) el.checked = !s.muted;
  for (const el of document.querySelectorAll<HTMLElement>('.sound-sliders')) el.classList.toggle('muted', s.muted);
}

/** A short sample of a channel, played when its slider is let go. */
function preview(channel: AudioChannel) {
  if (channel === 'effects') audio.sfx('place');
  else if (channel === 'voices') void audio.speak(NARRATOR, COURSE_LESSONS[0].before[0]);
}

// While a line is spoken, every element showing it glows; re-rendered copies glow too.
let speaking: string | null = null;
let observer: MutationObserver | null = null;
function applySpeaking() {
  for (const el of document.querySelectorAll('.speaking')) if ((el as HTMLElement).dataset.voice !== speaking) el.classList.remove('speaking');
  if (speaking) for (const el of document.querySelectorAll(`[data-voice="${speaking}"]`)) el.classList.add('speaking');
}
export function setSpeaking(key: string | null) {
  speaking = key;
  applySpeaking();
  if (key && !observer) {
    let queued = false;
    observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; applySpeaking(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } else if (!key && observer) {
    observer.disconnect();
    observer = null;
  }
}

let installed = false;
/** Wires the shared sound controls once, at start-up. */
export function installAudioUi() {
  if (installed) return;
  installed = true;
  audio.subscribe(refreshControls);
  audio.onSpeaking = setSpeaking;
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const toggle = target.closest('[data-sound-toggle]');
    if (toggle) {
      audio.toggleMute();
      if (!audio.settings.muted) audio.sfx('tap');
      return;
    }
    const button = target.closest<HTMLButtonElement>('button');
    if (button && !button.disabled && !button.hasAttribute('data-silent')) audio.sfx('tap', { gain: 0.6 });
  }, { capture: true });
  document.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    const channel = el.dataset.audioChannel as AudioChannel | undefined;
    if (channel) {
      audio.set({ [channel]: Number(el.value) / 100 }, false);
      const out = el.parentElement?.querySelector('output');
      if (out) out.textContent = el.value;
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.matches('[data-sound-master]')) audio.set({ muted: !el.checked });
    const channel = el.dataset.audioChannel as AudioChannel | undefined;
    if (channel) { audio.set({ [channel]: Number(el.value) / 100 }); preview(channel); }
  });
}
