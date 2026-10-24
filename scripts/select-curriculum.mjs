// Selection aid: scan the local, unmodified Lichess database once for all course themes.
// node scripts/select-curriculum.mjs writes an ignored shortlist, never shipped content.
// --verify-shipped checks every selected FEN, line and quality value against the source download.
import { createReadStream, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createZstdDecompress } from 'node:zlib';
import { Chess } from 'chess.js';

const excluded = new Set(['mateIn1', 'hangingPiece'].flatMap(t =>
  JSON.parse(readFileSync(`public/puzzles/region1/${t}.json`, 'utf8')).map(p => p.id)));
const tags = ['hangingPiece', 'defensiveMove', 'backRankMate', 'promotion', 'fork', 'doubleCheck', 'capturingDefender', 'mateIn2'];
const verify = process.argv.includes('--verify-shipped');
const shipped = verify ? new Map(Object.values(JSON.parse(readFileSync('src/game/curriculumPuzzles.json', 'utf8')))
  .flat().map(p => [p.id, p])) : new Map();
let verified = 0;
const pools = new Map();
const counts = Object.fromEntries(tags.map(t => [t, 0]));
const input = createInterface({ input: createReadStream('data/raw/lichess_db_puzzle.csv.zst').pipe(createZstdDecompress()), crlfDelay: Infinity });
for await (const line of input) {
  const [id, fen, moves, rating, rd, popularity, plays, themes] = line.split(',');
  if (verify) {
    const p = shipped.get(id);
    if (p) {
      if (p.fen !== fen || p.moves.join(' ') !== moves || p.rating !== +rating || p.themes.join(' ') !== themes ||
        p.quality.rd !== +rd || p.quality.popularity !== +popularity || p.quality.plays !== +plays) {
        throw new Error(`Source mismatch: ${id}`);
      }
      verified++;
    }
    continue;
  }
  if (!themes || excluded.has(id) || +rating < 400 || +rating > 1300 || +rd > 90 || +popularity < 85 || +plays < 300) continue;
  const moves_ = moves.split(' ');
  if (moves_.length < 2 || moves_.length > 6 || moves_.length % 2) continue;
  const themes_ = themes.split(' ');
  const pieces = fen.split(' ')[0].replace(/[^a-z]/gi, '').length;
  for (const tag of tags.filter(t => themes_.includes(t))) {
    counts[tag]++;
    // Preserve middlegames and different attacking pieces; tiny endgames must not crowd them out.
    const ranks = fen.split(' ')[0].split('/').map(r => r.replace(/[1-8]/g, n => '.'.repeat(+n)));
    const from = moves_[1].slice(0, 2);
    const solverPiece = ranks[8 - Number(from[1])][from.charCodeAt(0) - 97].toLowerCase();
    const key = `${tag}-${Math.floor(+rating / 100)}-${solverPiece}-${moves_.length}-${Math.floor(pieces / 8)}`;
    const pool = pools.get(key) ?? [];
    pool.push({ id, fen, moves: moves_, rating: +rating, themes: themes_, quality: { rd: +rd, popularity: +popularity, plays: +plays }, pieces, source: `https://lichess.org/training/${id}` });
    pool.sort((a, b) => a.pieces - b.pieces || a.moves.length - b.moves.length || a.id.localeCompare(b.id));
    pools.set(key, pool.slice(0, 5));
  }
}
if (verify) {
  if (verified !== shipped.size) throw new Error(`Only ${verified}/${shipped.size} source puzzles found.`);
  console.log(`Verified ${verified} unchanged published puzzles against the local Lichess database.`);
  process.exit(0);
}
const unique = [...new Map([...pools.values()].flat().map(p => [p.id, p])).values()];
const candidates = [];
for (const p of unique) {
  try {
    const c = new Chess(p.fen);
    const san = [];
    const details = [];
    for (const u of p.moves) {
      const m = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
      san.push(m.san);
      details.push({ piece: m.piece, captured: m.captured, check: c.isCheck(), mate: c.isCheckmate() });
    }
    candidates.push({ ...p, san, details });
  } catch { /* Invalid source rows never enter the shortlist. */ }
}
mkdirSync('data/raw', { recursive: true });
writeFileSync('data/raw/curriculum-candidates.json', JSON.stringify({ counts, candidates }, null, 2));
console.log(JSON.stringify({ counts, candidates: candidates.length }));
