// Listens to music takes with an audio-understanding model and writes a review per take.
//
//   node scripts/audio/review-music.mjs                 # every take without a review
//   node scripts/audio/review-music.mjs map-r1-2        # just these takes
//
// Reviews land beside the takes in audio/raw/music/<take>.review.md. They inform the
// choice of take in audio/music.json; a person still has the final say.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { keyUsage, listen } from './openrouter.mjs';

const spec = JSON.parse(readFileSync(new URL('../../audio/music.json', import.meta.url), 'utf8'));
const RAW = join('audio', 'raw', 'music');
const args = process.argv.slice(2);
const takes = (args.length ? args : readdirSync(RAW).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)))
  .filter((t) => args.length || !existsSync(join(RAW, `${t}.review.md`)));

const brief = (id) => {
  const t = spec.tracks[id];
  return `Where it plays: ${t.use} Brief: ${t.prompt}${t.calm ? ` It must suit quiet thinking: ${spec.calm}` : ''}`;
};

const PROMPT = (id) => `You are a strict, experienced game-audio director for a premium, family-friendly storybook chess game with animal characters.
${brief(id)}
Listen to the whole track and report, with timestamps:
1. Instruments actually heard, tempo, key/mode and structure.
2. Any vocals, choir, humming or speech-like sounds (this must be instrumental).
3. Audible generative artifacts: warbling, smeared transients, timbre morphing, metallic phasing, distortion, clipping, pitch drift, sudden cuts or glitches.
4. Mix problems: harsh highs, muddy lows, sudden loud moments, unbalanced levels.
5. Fit to the brief and to its place in the game. For thinking music, say whether it would distract.
6. The opening and the ending: is there a clean start, and does it resolve and ring out, or cut off?
Then give scores out of 10 for brief fit, production quality, and (for menu or map tracks) melody.
Finish with exactly one line of JSON: {"fit": n, "quality": n, "vocals": true|false, "artifactsSevere": true|false, "endsCleanly": true|false, "verdict": "keep"|"retake", "fix": "short note"}`;

const before = await keyUsage();
let next = 0;
async function worker() {
  while (next < takes.length) {
    const take = takes[next++];
    const id = take.replace(/-\d+$/, '');
    if (!spec.tracks[id]) continue;
    try {
      const { text } = await listen(PROMPT(id), [join(RAW, `${take}.mp3`)]);
      writeFileSync(join(RAW, `${take}.review.md`), text);
      console.log(`${take}: ${text.trim().split('\n').pop()}`);
    } catch (e) {
      console.error(`✗ ${take}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`Review spend: $${((await keyUsage()) - before).toFixed(3)}`);
