// Turns chosen raw takes into the game's audio files and manifest.
//
//   node scripts/audio/process-audio.mjs              # music, effects, ambience and voices
//   node scripts/audio/process-audio.mjs voices sfx   # only these groups
//
// Inputs: audio/raw/ (not committed), choices in audio/music.json ("take", "trim") and
// audio/sfx-choices.json, voice checks in audio/raw/voice/. Outputs public/audio/ and
// src/audio/audioManifest.json. Needs ffmpeg with libmp3lame and rubberband.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTs } from './load-ts.mjs';

const OUT = join('public', 'audio');
const RAW = join('audio', 'raw');
const MANIFEST = join('src', 'audio', 'audioManifest.json');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const groups = process.argv.slice(2);
const want = (g) => !groups.length || groups.includes(g);

/** Loudness targets (LUFS), from docs/design/audio.md#mixing. */
const TARGET = { theme: -18, lesson: -21, review: -20, bed: -28, spot: -27, voice: -17, effect: -18 };

function ffmpeg(args) {
  return execFileSync('ffmpeg', ['-hide_banner', '-y', '-loglevel', 'error', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * A gain filter that brings a chain's output to a loudness target. Long clips use a
 * measured, linear EBU R128 loudnorm; clips too short to measure (under ~1 s) are set by
 * their peak, 14 dB above the target, and never above `peak`.
 */
function loudness(input, filters, target, peak = -1.5) {
  const pre = filters ? `${filters},` : '';
  if (duration(input) >= 1.2) {
    const res = spawn(['-hide_banner', '-nostats', '-i', input, '-af', `${pre}loudnorm=I=${target}:TP=${peak}:LRA=20:print_format=json`, '-f', 'null', '-']);
    const m = JSON.parse(res.slice(res.lastIndexOf('{'), res.lastIndexOf('}') + 1));
    // Linear mode keeps the dynamics exactly as recorded and only moves the level.
    if (Number.isFinite(Number(m.input_i)) && Number(m.input_i) > -70) {
      return `loudnorm=I=${target}:TP=${peak}:LRA=20:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    }
  }
  // Short clicks and taps are heard by their peak, so variants of one sound match by peak.
  const res = spawn(['-hide_banner', '-nostats', '-i', input, '-af', `${pre}volumedetect`, '-f', 'null', '-']);
  const max = Number(/max_volume: (-?[\d.]+) dB/.exec(res)?.[1] ?? 0);
  return `volume=${(Math.min(target + 14, peak) - max).toFixed(2)}dB`;
}
function spawn(args) {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stderr;
}

function duration(file) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));
}

/** Encodes with a filter chain normalized to a loudness target. Short clips are peak-limited instead. */
function render(input, output, { filters = [], target, mono = false, rate, bitrate, peak = -1.5 }) {
  mkdirSync(join(output, '..'), { recursive: true });
  const chain = filters.filter(Boolean).join(',');
  const norm = loudness(input, chain, target, peak);
  const args = ['-i', input, '-af', [chain, norm, `aresample=${rate}`].filter(Boolean).join(','), '-ac', mono ? '1' : '2', '-codec:a', 'libmp3lame'];
  args.push(...(bitrate ? ['-b:a', bitrate] : ['-q:a', '6']));
  ffmpeg([...args, '-map_metadata', '-1', '-id3v2_version', '0', output]);
}

/** The loudest sample of a file, in dBFS. */
function peakDb(input) {
  const res = spawn(['-hide_banner', '-nostats', '-i', input, '-af', 'volumedetect', '-f', 'null', '-']);
  return Number(/max_volume: (-?[\d.]+) dB/.exec(res)?.[1] ?? 0);
}

/** Leading and trailing silence trimmed, a whisper of lead-in kept, and a soft tail. */
const trimSilence = (threshold = -50, tail = 0.05) =>
  `silenceremove=start_periods=1:start_threshold=${threshold}dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=${threshold}dB:start_silence=${tail},areverse`;

const manifest = existsSync(MANIFEST) ? json(MANIFEST) : { sfx: {}, music: [], beds: [], spots: [], voices: {} };

if (want('music')) {
  const spec = json(join('audio', 'music.json'));
  manifest.music = [];
  for (const [id, track] of Object.entries(spec.tracks)) {
    if (!track.take) continue;
    const input = join(RAW, 'music', `${id}-${track.take}.mp3`);
    if (!existsSync(input)) { console.warn(`- ${id}: take ${track.take} missing`); continue; }
    const [start, end] = track.trim ?? [0, duration(input)];
    const fade = track.fadeOut ?? 2.5;
    const target = id.startsWith('lesson') ? TARGET.lesson : id.startsWith('review') ? TARGET.review : TARGET.theme;
    // Thinking and challenge music is gently levelled, so swells never pull focus from the board.
    const level = /^(lesson|review)/.test(id) ? 'acompressor=threshold=-22dB:ratio=2.5:attack=300:release=2500:knee=6' : '';
    const filters = [`atrim=${start}:${end}`, 'asetpts=PTS-STARTPTS', level, 'afade=t=in:d=0.08', `afade=t=out:st=${Math.max(0, end - start - fade)}:d=${fade}`];
    render(input, join(OUT, 'music', `${id}.mp3`), { filters, target, rate: 44100, peak: -1 });
    manifest.music.push(id);
    console.log(`✓ music/${id}.mp3 (take ${track.take}, ${(end - start).toFixed(0)}s)`);
  }
  for (const f of existsSync(join(OUT, 'music')) ? readdirSync(join(OUT, 'music')) : []) if (!manifest.music.includes(f.slice(0, -4))) rmSync(join(OUT, 'music', f));
}

if (want('sfx') || want('ambience')) {
  const choices = json(join('audio', 'sfx-choices.json'));
  // Effects no longer chosen leave the manifest (their old files are removed below).
  if (want('sfx')) for (const name of Object.keys(manifest.sfx)) if (!choices[name]) delete manifest.sfx[name];
  const spec = json(join('audio', 'sfx.json'));
  for (const [name, choice] of Object.entries(choices)) {
    const isBed = name.startsWith('bed-'), isSpot = name.startsWith('spot-');
    if ((isBed || isSpot) ? !want('ambience') && groups.length : !want('sfx') && groups.length) continue;
    if (!spec.sounds[name] && !spec.ambience[name]) throw new Error(`audio/sfx-choices.json names unknown sound ${name}`);
    const sources = choice.takes.map((t) => join(RAW, 'sfx', `${name}-${t}.mp3`));
    // Silence is judged against each take's own peak, so quiet, distant sounds survive.
    const filters = (extra = [], input = sources[0]) => [
      choice.trim ? `atrim=${choice.trim[0]}:${choice.trim[1]}` : '', 'asetpts=PTS-STARTPTS',
      isBed ? '' : trimSilence(Math.max(-75, peakDb(input) - (choice.depth ?? 42))),
      choice.highpass ? `highpass=f=${choice.highpass}` : 'highpass=f=40',
      choice.lowpass ? `lowpass=f=${choice.lowpass}` : '',
      // A cap on length cuts any long noise tail; the fade below smooths the cut.
      choice.length ? `atrim=0:${choice.length},asetpts=PTS-STARTPTS` : '',
      ...extra,
    ];
    if (isBed) {
      const input = sources[0];
      const len = duration(input);
      render(input, join(OUT, 'ambience', `${name}.mp3`), { filters: filters(['afade=t=in:d=0.5', `afade=t=out:st=${len - 0.5}:d=0.5`]), target: TARGET.bed + (choice.gain ?? 0), rate: 44100, bitrate: '96k' });
      console.log(`✓ ambience/${name}.mp3`);
      continue;
    }
    if (isSpot) {
      render(sources[0], join(OUT, 'ambience', `${name}.mp3`), { filters: filters(['afade=t=in:d=0.01', 'areverse,afade=t=in:d=0.25,areverse']), target: TARGET.spot + (choice.gain ?? 0), rate: 44100, bitrate: '96k', mono: true });
      console.log(`✓ ambience/${name}.mp3`);
      continue;
    }
    for (const old of existsSync(join(OUT, 'sfx')) ? readdirSync(join(OUT, 'sfx')).filter((f) => f.startsWith(`${name}-`) && /^\d+\.mp3$/.test(f.slice(name.length + 1))) : []) rmSync(join(OUT, 'sfx', old));
    sources.forEach((input, i) => {
      render(input, join(OUT, 'sfx', `${name}-${i + 1}.mp3`), { filters: filters(['afade=t=in:d=0.004', 'areverse,afade=t=in:d=0.04,areverse'], input), target: TARGET.effect + (choice.gain ?? 0), rate: 44100, bitrate: '128k', mono: !choice.stereo, peak: -1 });
    });
    manifest.sfx[name] = sources.length;
    console.log(`✓ sfx/${name} ×${sources.length}`);
  }
  // The choices file is the whole list: anything not chosen leaves the manifest and the build.
  const chosen = (prefix) => Object.keys(choices).filter((n) => prefix.test(n)).sort();
  manifest.beds = chosen(/^bed-/);
  manifest.spots = chosen(/^spot-/);
  const keepAmbience = new Set([...manifest.beds, ...manifest.spots].map((n) => `${n}.mp3`));
  for (const f of existsSync(join(OUT, 'ambience')) ? readdirSync(join(OUT, 'ambience')) : []) if (!keepAmbience.has(f)) rmSync(join(OUT, 'ambience', f));
  const keepSfx = new Set(Object.entries(manifest.sfx).flatMap(([name, n]) => Array.from({ length: n }, (_, k) => `${name}-${k + 1}.mp3`)));
  for (const f of existsSync(join(OUT, 'sfx')) ? readdirSync(join(OUT, 'sfx')) : []) if (!keepSfx.has(f)) rmSync(join(OUT, 'sfx', f));
}

/**
 * Room tones for voices, as synthesized impulse responses (deterministic): a dry impulse
 * followed by a diffuse, filtered noise tail.
 */
function writeImpulse(file, { seconds, predelay, wetDb, lowpass, highpass = 0 }) {
  const sr = 24000, n = Math.round(seconds * sr);
  let seed = 7;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 * 2 - 1; };
  const ir = new Float32Array(n);
  ir[0] = 1;
  const lp = Math.exp(-2 * Math.PI * lowpass / sr), hp = highpass ? Math.exp(-2 * Math.PI * highpass / sr) : 0;
  let l = 0, h = 0, prev = 0;
  for (let i = Math.round(predelay * sr); i < n; i++) {
    const t = i / sr, env = Math.exp(-6.9 * t / seconds) * Math.min(1, (t - predelay) / 0.01);
    l = (1 - lp) * rand() + lp * l;
    const x = hp ? hp * (h + l - prev) : l;
    prev = l; h = x;
    ir[i] += env * x;
  }
  // Scale the tail so its energy sits `wetDb` below the direct sound.
  let energy = 0;
  for (let i = 1; i < n; i++) energy += ir[i] ** 2;
  const g = Math.sqrt(10 ** (wetDb / 10) / energy);
  for (let i = 1; i < n; i++) ir[i] *= g;
  const data = Buffer.alloc(44 + n * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 4, 4); data.write('WAVE', 8); data.write('fmt ', 12);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(3, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(sr, 24);
  data.writeUInt32LE(sr * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(32, 34); data.write('data', 36); data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) data.writeFloatLE(ir[i], 44 + i * 4);
  writeFileSync(file, data);
  return file;
}

/** Rooms, applied before levelling: the stone hall of the Lich King's keep. Tails sit `wetDb` under the voice. */
const ROOMS = {
  hall: { seconds: 1.6, predelay: 0.025, wetDb: -12, lowpass: 3500, highpass: 120 },
};
function colour(input, output, room) {
  const ir = writeImpulse(join(RAW, `ir-${room}.wav`), ROOMS[room]);
  // Pad first, so the room rings out instead of stopping with the last word.
  spawn(['-hide_banner', '-y', '-i', input, '-i', ir, '-filter_complex', `[0:a]apad=pad_dur=${ROOMS[room].seconds + 0.2}[v];[v][1:a]afir=irnorm=-1[out]`, '-map', '[out]', '-c:a', 'pcm_f32le', output]);
  return output;
}

if (want('voices')) {
  const cast = json(join('audio', 'voices.json'));
  const { voiceScript } = await loadTs('/src/audio/voiceScript.ts');
  const { voiceKey } = await loadTs('/src/audio/voiceRoles.ts');
  const voices = {};
  let missing = 0;
  for (const { role, line } of voiceScript()) {
    const key = voiceKey(role, line);
    const record = join(RAW, 'voice', role, `${key}.json`);
    const chosen = existsSync(record) ? json(record).chosen : null;
    if (!chosen) { missing++; continue; }
    const output = join(OUT, 'voice', role, `${key}.mp3`);
    let input = join(RAW, 'voice', role, `${key}-${chosen}.wav`);
    const post = cast.roles[role].post;
    const trimmed = join(RAW, 'voice', role, `${key}-trim.wav`);
    // Clicks out first, then silence trimmed gently enough to keep soft final consonants.
    spawn(['-hide_banner', '-y', '-i', input, '-af', `adeclick,${trimSilence(Math.max(-75, peakDb(input) - 55), 0.2)},highpass=f=70,afade=t=in:d=0.025`, '-c:a', 'pcm_f32le', trimmed]);
    input = post ? colour(trimmed, join(RAW, 'voice', role, `${key}-room.wav`), post) : trimmed;
    // Rooms ring out into their padding; trim what is left of it, keeping the tail.
    render(input, output, { filters: [post ? trimSilence(Math.max(-70, peakDb(input) - 55), 0.25) : '', 'areverse,afade=t=in:d=0.08,areverse'], target: TARGET.voice, mono: true, rate: 24000, bitrate: '48k' });
    (voices[role] ??= []).push(key);
  }
  // Recordings of lines that changed or were removed are deleted, never played.
  for (const role of existsSync(join(OUT, 'voice')) ? readdirSync(join(OUT, 'voice')) : []) {
    for (const f of readdirSync(join(OUT, 'voice', role))) if (!voices[role]?.includes(f.slice(0, -4))) rmSync(join(OUT, 'voice', role, f));
  }
  for (const keys of Object.values(voices)) keys.sort();
  manifest.voices = Object.fromEntries(Object.entries(voices).sort());
  console.log(`✓ voices: ${Object.values(voices).flat().length} lines${missing ? `, ${missing} without an accepted take` : ''}`);
}

manifest.music.sort();
writeFileSync(MANIFEST, `${JSON.stringify({ sfx: Object.fromEntries(Object.entries(manifest.sfx).sort()), music: manifest.music, beds: manifest.beds, spots: manifest.spots, voices: manifest.voices }, null, 1)}\n`);
console.log(`✓ ${MANIFEST}`);
