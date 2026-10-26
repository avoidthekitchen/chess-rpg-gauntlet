// Generates sound-effect and ambience takes with Seed Audio through OpenRouter.
//
//   node scripts/audio/generate-sfx.mjs                     # 3 takes of every sound with none yet
//   node scripts/audio/generate-sfx.mjs --takes 2 hit fly   # more takes of these
//
// Raw takes land in audio/raw/sfx/<name>-<n>.mp3 (not committed). Choose takes in
// audio/sfx-choices.json, then run scripts/audio/process-audio.mjs.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateSpeech, keyUsage } from './openrouter.mjs';

const spec = JSON.parse(readFileSync(new URL('../../audio/sfx.json', import.meta.url), 'utf8'));
const RAW = join('audio', 'raw', 'sfx');
mkdirSync(RAW, { recursive: true });
const all = { ...spec.sounds, ...spec.ambience };
const promptFor = (name) => `${spec.ambience[name] ? spec.ambienceStyle : spec.style} ${all[name].prompt}`;

const args = process.argv.slice(2);
const takesAt = args.indexOf('--takes');
const takes = takesAt >= 0 ? Number(args.splice(takesAt, 2)[1]) : 3;
const has = (name) => readdirSync(RAW).some((f) => new RegExp(`^${name}-\\d+\\.mp3$`).test(f));
const names = args.length ? args : Object.keys(all).filter((n) => !has(n));
for (const n of names) if (!all[n]) throw new Error(`Unknown sound ${n}`);

const jobs = names.flatMap((n) => Array.from({ length: takes }, () => n));
const before = await keyUsage();
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const name = jobs[next++];
    let n = 1;
    while (existsSync(join(RAW, `${name}-${n}.mp3`))) n++;
    const file = join(RAW, `${name}-${n}.mp3`);
    writeFileSync(file, '');
    try {
      const { audio } = await generateSpeech({ model: spec.model, input: promptFor(name), response_format: 'mp3' });
      writeFileSync(file, audio);
      console.log(`✓ ${file}`);
    } catch (e) {
      rmSync(file, { force: true });
      console.error(`✗ ${name}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`Batch spend: $${((await keyUsage()) - before).toFixed(3)}`);
