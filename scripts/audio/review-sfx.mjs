// Compares the takes of each sound effect side by side and suggests which to use.
//
//   node scripts/audio/review-sfx.mjs                 # every sound without a review
//   node scripts/audio/review-sfx.mjs hit place       # just these
//
// Reviews land in audio/raw/sfx/<name>.review.md and inform audio/sfx-choices.json.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { keyUsage, listen } from './openrouter.mjs';

const spec = JSON.parse(readFileSync(new URL('../../audio/sfx.json', import.meta.url), 'utf8'));
const RAW = join('audio', 'raw', 'sfx');
const all = { ...spec.sounds, ...spec.ambience };
const args = process.argv.slice(2);
const names = (args.length ? args : Object.keys(all)).filter((n) => args.length || !existsSync(join(RAW, `${n}.review.md`)));

const PROMPT = (name) => `You are a strict sound designer for a premium, cozy, family-friendly storybook chess game: a wooden board, animal-figure pieces with gentle cartoon personality.
Sound: "${name}". Where it plays: ${all[name].use} Brief: ${all[name].prompt}
Each clip is a different take of this sound. For each take: describe exactly what you hear, how well it fits the brief and the game, and any problems (voices or speech, music where none was asked, harshness, hiss, clicks, distortion, double hits, baked-in echo, abrupt cuts, too long or too short).
${name.startsWith('bed-') ? 'This is a background bed that loops for minutes: it must be steady and unobtrusive, with no single sounds that would be noticed on repeat.' : ''}
Then rank the takes. Finish with exactly one line of JSON: {"ranking": ["A", ...], "usable": ["A", ...], "best": "A", "scores": {"A": n, ...}, "note": "short note"}`;

const before = await keyUsage();
let next = 0;
async function worker() {
  while (next < names.length) {
    const name = names[next++];
    const takes = readdirSync(RAW).filter((f) => new RegExp(`^${name}-\\d+\\.mp3$`).test(f)).sort();
    if (!takes.length) continue;
    try {
      const model = name.startsWith('spot-') ? 'google/gemini-3.8-flash' : undefined;
      const { text } = await listen(PROMPT(name), takes.map((t) => join(RAW, t)), model);
      const legend = takes.map((t, i) => `${String.fromCharCode(65 + i)} = ${t}`).join(', ');
      writeFileSync(join(RAW, `${name}.review.md`), `${legend}\n\n${text}`);
      console.log(`${name} (${legend}): ${text.trim().split('\n').pop()}`);
    } catch (e) {
      console.error(`✗ ${name}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
console.log(`Review spend: $${((await keyUsage()) - before).toFixed(3)}`);
