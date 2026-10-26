// Generates music takes with Lyria through OpenRouter.
//
//   node scripts/audio/generate-music.mjs                 # one take of every track with no take yet
//   node scripts/audio/generate-music.mjs map-r1 story    # one more take of these
//   node scripts/audio/generate-music.mjs --takes 2 map-r1
//
// Raw takes land in audio/raw/music/<id>-<n>.mp3 (not committed). Choose a take in
// audio/music.json ("take": n), then run scripts/audio/process-audio.mjs.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateMusic, keyUsage } from './openrouter.mjs';

const spec = JSON.parse(readFileSync(new URL('../../audio/music.json', import.meta.url), 'utf8'));
const RAW = join('audio', 'raw', 'music');
mkdirSync(RAW, { recursive: true });

const args = process.argv.slice(2);
const takesAt = args.indexOf('--takes');
const takes = takesAt >= 0 ? Number(args.splice(takesAt, 2)[1]) : 1;
const existing = (id) => readdirSync(RAW).filter((f) => f.startsWith(`${id}-`) && /^\d+\.mp3$/.test(f.slice(id.length + 1)));
const ids = args.length ? args : Object.keys(spec.tracks).filter((id) => !existing(id).length);
for (const id of ids) if (!spec.tracks[id]) throw new Error(`Unknown track ${id}`);

export const promptFor = (id) => [spec.style, spec.tracks[id].calm ? spec.calm : '', spec.tracks[id].prompt].filter(Boolean).join(' ');

const jobs = ids.flatMap((id) => Array.from({ length: takes }, () => id));
const before = await keyUsage();
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const id = jobs[next++];
    let n = 1;
    while (existsSync(join(RAW, `${id}-${n}.mp3`))) n++;
    const file = join(RAW, `${id}-${n}.mp3`);
    writeFileSync(file, ''); // reserve the take number for parallel workers
    try {
      const { audio, cost } = await generateMusic(spec.model, promptFor(id));
      writeFileSync(file, audio);
      console.log(`✓ ${file} (${(audio.length / 1024).toFixed(0)} KB, $${cost})`);
    } catch (e) {
      rmSync(file, { force: true });
      console.error(`✗ ${id}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`Batch spend: $${((await keyUsage()) - before).toFixed(3)}`);
