import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createZstdDecompress } from 'node:zlib';
import { Chess } from 'chess.js';

/** Selection aid: writes an ignored shortlist without changing published curriculum. */
export async function candidates(raw, quality, args) {
  const arg = (name, fallback) => args[args.indexOf(name) + 1] ?? fallback;
  const tag = arg('--candidates', 'doubleCheck');
  if (!/^[a-zA-Z0-9]+$/.test(tag)) throw new Error('Use a Lichess theme name.');
  const min = args.includes('--min') ? Number(arg('--min')) : 600;
  const max = args.includes('--max') ? Number(arg('--max')) : 1250;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) throw new Error('Invalid rating range.');
  const pools = new Map();
  const counts = {};
  const input = createInterface({ input: createReadStream(raw).pipe(createZstdDecompress()), crlfDelay: Infinity });
  for await (const line of input) {
    const [id, fen, moves, rating, rd, pop, plays, themes] = line.split(',');
    if (!themes?.split(' ').includes(tag) || +rating < min || +rating > max || +rd > quality.maxRd || +pop < quality.minPop || +plays < quality.minPlays) continue;
    const mv = moves.split(' ');
    if (mv.length % 2 || mv.length < 2 || mv.length > 6) continue;
    try {
      const c = new Chess(fen);
      const san = [];
      const checkingPieces = [];
      for (let i = 0; i < mv.length; i++) {
        const u = mv[i];
        san.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
        if (i % 2 === 1) {
          const king = c.board().flat().find(p => p?.type === 'k' && p.color === c.turn());
          const attackers = c.attackers(king.square, c.turn() === 'w' ? 'b' : 'w');
          if (attackers.length > 1) checkingPieces.push(attackers.map(s => c.get(s).type).sort().join('+'));
        }
      }
      if (tag === 'doubleCheck' && !checkingPieces.length) continue;
      const band = Math.floor(+rating / 50) * 50;
      counts[band] = (counts[band] ?? 0) + 1;
      const p = { id, fen, moves: mv, rating: +rating, themes: themes.split(' '), quality: { rd: +rd, popularity: +pop, plays: +plays }, solverMoves: mv.length / 2, checkingPieces, san, pieces: (fen.split(' ')[0].match(/[a-z]/gi) ?? []).length, source: `https://lichess.org/training/${id}` };
      const pool = pools.get(band) ?? [];
      pool.push(p);
      pool.sort((a, b) => a.pieces - b.pieces || a.rating - b.rating || a.id.localeCompare(b.id));
      pools.set(band, pool.slice(0, 12));
    } catch { /* Reject malformed positions and lines. */ }
  }
  mkdirSync('data/raw', { recursive: true });
  const output = `data/raw/candidates-${tag}.json`;
  const selected = [...pools.values()].flat().sort((a, b) => a.rating - b.rating);
  writeFileSync(output, JSON.stringify({ tag, min, max, counts, candidates: selected }, null, 2));
  console.log(`${selected.length} candidates written to ${output}. Qualifying counts by 50-point band:`, counts);
}
