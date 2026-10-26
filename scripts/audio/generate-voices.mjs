// Records every voiced line (src/audio/voiceScript.ts) with the cast in audio/voices.json,
// then transcribes each take and re-records lines whose words do not match.
//
//   node scripts/audio/generate-voices.mjs               # every line with no accepted take
//   node scripts/audio/generate-voices.mjs hob lich      # only these roles
//   node scripts/audio/generate-voices.mjs --redo hob    # record these roles again
//   node scripts/audio/generate-voices.mjs --retry       # more takes for lines that never matched
//
// Takes land in audio/raw/voice/<role>/<key>-<n>.wav with a <key>.json check record
// (not committed). Run scripts/audio/process-audio.mjs voices to publish them.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTs } from './load-ts.mjs';
import { generateSpeech, keyUsage, transcribe } from './openrouter.mjs';

const cast = JSON.parse(readFileSync(new URL('../../audio/voices.json', import.meta.url), 'utf8'));
const { voiceScript } = await loadTs('/src/audio/voiceScript.ts');
const { voiceKey } = await loadTs('/src/audio/voiceRoles.ts');

const args = process.argv.slice(2);
const redo = args.includes('--redo');
const retry = args.includes('--retry');
const roles = args.filter((a) => !a.startsWith('--'));
const lines = voiceScript().filter((v) => !roles.length || roles.includes(v.role));
const missing = [...new Set(lines.map((v) => v.role))].filter((r) => !cast.roles[r]);
if (missing.length) throw new Error(`Cast these roles in audio/voices.json: ${missing.join(', ')}`);

export const words = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
/** Word error count between the script and a transcript (Levenshtein over words). */
export function wordErrors(a, b) {
  const x = words(a), y = words(b);
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return d[x.length][y.length];
}
// Names the transcriber can't know; a near miss on them is not a misread.
const NAMES = ['grubnak', 'ashfang', 'tadwell', 'pawnshire', 'hob', 'ollie', 'saffron', 'flint'];
const allowed = (line) => (words(line).some((w) => NAMES.includes(w)) ? 1 : 0) + (words(line).length > 14 ? 1 : 0);
/** Letter-level edits with spaces removed, so "King's Road" matches "Kingsroad" and "armorer" matches "armourer". */
function letterErrors(a, b) {
  const x = words(a).join(''), y = words(b).join('');
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    for (let j = 1; j <= y.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[y.length];
}
const matches = (line, heard) => wordErrors(line, heard) <= allowed(line) || letterErrors(line, heard) <= Math.max(2, Math.round(words(line).join('').length * 0.04));

const MAX_TAKES = 3;
const before = await keyUsage();
const queue = [...lines];
let failures = 0, recorded = 0;
async function worker() {
  while (queue.length) {
    const { role, line } = queue.shift();
    const key = voiceKey(role, line);
    const dir = join('audio', 'raw', 'voice', role);
    mkdirSync(dir, { recursive: true });
    const recordFile = join(dir, `${key}.json`);
    const record = existsSync(recordFile) && !redo ? JSON.parse(readFileSync(recordFile, 'utf8')) : { role, line, takes: [] };
    // Re-check earlier takes, in case the matching rules have improved since.
    if (!record.chosen) for (const t of record.takes) if (t.heard !== undefined && matches(line, t.heard)) { t.ok = true; record.chosen = t.n; break; }
    if (record.chosen) { writeFileSync(recordFile, JSON.stringify(record, null, 2)); continue; }
    const limit = record.takes.length + (retry ? MAX_TAKES : 0) || MAX_TAKES;
    while (!record.chosen && record.takes.length < Math.max(MAX_TAKES, limit)) {
      const n = record.takes.length + 1;
      const wav = join(dir, `${key}-${n}.wav`);
      try {
        const { voice, direction } = cast.roles[role];
        // "say" steers delivery where the model rewrites a line; the shown text never changes.
        const input = cast.say?.[line] ?? line;
        const { audio } = await generateSpeech({ model: cast.model, input, voice, instructions: `${cast.style} ${direction}`, response_format: 'pcm' });
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', 'pipe:0', wav], { input: audio });
        const heard = await transcribe(wav);
        const errors = wordErrors(line, heard);
        const ok = matches(line, heard);
        record.takes.push({ n, heard, errors, ok });
        if (ok) record.chosen = n;
        recorded++;
      } catch (e) {
        record.takes.push({ n, error: e.message.slice(0, 200) });
      }
    }
    writeFileSync(recordFile, JSON.stringify(record, null, 2));
    if (!record.chosen) { failures++; console.error(`✗ ${role} "${line}" → ${record.takes.map((t) => t.heard ?? t.error).join(' | ')}`); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`${lines.length} lines, ${recorded} takes recorded, ${failures} without a matching take. Spend: $${((await keyUsage()) - before).toFixed(3)}`);
