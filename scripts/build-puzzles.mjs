// Build-time script: turns the Lichess puzzle database into small per-theme JSON files.
// Usage: npm run puzzles   (downloads ~300 MB to data/raw on first run; cached afterwards)
import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, writeFileSync, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createZstdDecompress } from 'node:zlib';
import { Chess } from 'chess.js';

const URL_ = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const RAW = 'data/raw/lichess_db_puzzle.csv.zst';
const OUT_DIR = 'public/puzzles';

// Region 1 themes. Lichess tag spellings: mateIn1, hangingPiece.
const REGIONS = {
  region1: {
    themes: ['mateIn1', 'hangingPiece'],
    perTheme: 150,
    minRating: 400,
    maxRating: 1800,
    band: 100,
    // Max number of solver moves per theme.
    maxSolverMoves: { mateIn1: 1, hangingPiece: 3 },
  },
};

const QUALITY = { maxRd: 90, minPop: 85, minPlays: 300 };

async function download() {
  if (existsSync(RAW)) return console.log(`Using cached ${RAW}`);
  mkdirSync('data/raw', { recursive: true });
  console.log(`Downloading ${URL_} ...`);
  const res = await fetch(URL_);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const tmp = RAW + '.part';
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
  renameSync(tmp, RAW);
}

function valid(p, theme) {
  const chess = new Chess(p.fen);
  try {
    for (const uci of p.moves) {
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    }
  } catch {
    return false;
  }
  return theme === 'mateIn1' ? chess.isCheckmate() : true;
}

// Deterministic hash for tie-breaking within a band.
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

async function main() {
  await download();
  const cands = {};
  for (const r of Object.values(REGIONS)) for (const t of r.themes) cands[t] = [];

  const rl = createInterface({ input: createReadStream(RAW).pipe(createZstdDecompress()), crlfDelay: Infinity });
  let first = true;
  let rows = 0;
  for await (const line of rl) {
    if (first) { first = false; continue; }
    const f = line.split(',');
    if (f.length < 8) continue;
    rows++;
    const [id, fen, moves, rating, rd, pop, plays, themes] = f;
    if (+rd > QUALITY.maxRd || +pop < QUALITY.minPop || +plays < QUALITY.minPlays) continue;
    const tags = themes.split(' ');
    const mv = moves.split(' ');
    const solverMoves = Math.floor(mv.length / 2);
    for (const r of Object.values(REGIONS)) {
      for (const t of r.themes) {
        if (!tags.includes(t)) continue;
        if (+rating < r.minRating || +rating >= r.maxRating + r.band) continue;
        if (solverMoves > r.maxSolverMoves[t]) continue;
        cands[t].push({ id, fen, moves: mv, rating: +rating, themes: tags });
      }
    }
  }
  console.log(`Scanned ${rows} puzzles`);

  const index = {};
  for (const [region, r] of Object.entries(REGIONS)) {
    mkdirSync(`${OUT_DIR}/${region}`, { recursive: true });
    index[region] = {};
    for (const theme of r.themes) {
      // Bucket into bands, sort each by hash for deterministic shuffling, round-robin pick.
      const bands = new Map();
      for (const p of cands[theme]) {
        const b = Math.floor(p.rating / r.band) * r.band;
        if (!bands.has(b)) bands.set(b, []);
        bands.get(b).push(p);
      }
      const queues = [...bands.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, ps]) => ps.sort((a, b) => hash(a.id) - hash(b.id) || (a.id < b.id ? -1 : 1)));
      const picked = [];
      for (let i = 0; picked.length < r.perTheme && queues.some((q) => q.length); i++) {
        const q = queues[i % queues.length];
        while (q.length) {
          const p = q.shift();
          if (valid(p, theme)) { picked.push(p); break; }
        }
      }
      picked.sort((a, b) => a.rating - b.rating || (a.id < b.id ? -1 : 1));
      const file = `${OUT_DIR}/${region}/${theme}.json`;
      writeFileSync(file, JSON.stringify(picked));
      index[region][theme] = { file: `${region}/${theme}.json`, count: picked.length };
      const hist = {};
      for (const p of picked) { const b = Math.floor(p.rating / r.band) * r.band; hist[b] = (hist[b] ?? 0) + 1; }
      console.log(`${region}/${theme}: ${picked.length} puzzles, ${statSync(file).size} bytes (candidates ${cands[theme].length})`);
      console.log('  bands:', JSON.stringify(hist));
    }
  }
  writeFileSync(`${OUT_DIR}/index.json`, JSON.stringify(index));
}

main().catch((e) => { console.error(e); process.exit(1); });
