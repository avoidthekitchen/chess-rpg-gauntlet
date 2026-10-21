import { Chess, type Move, type Square } from 'chess.js';
import type { Battle } from '../game/battle';
import type { AiProfile } from '../game/difficulty';
import { PIECE_VALUE } from '../game/material';
import { hangingPieces } from '../game/threats';
import type { Candidate, Engine } from './engine';

export type Rng = () => number;

const uciOf = (m: Move) => m.from + m.to + (m.promotion ?? '');

/**
 * Picks among Stockfish's top moves. Moves within `maxLoss` centipawns of the best
 * can be chosen, with better ones more likely. This makes believable mistakes
 * rather than Stockfish's "perfect move, then random blunder" low skill levels.
 */
export function pickCandidate(candidates: Candidate[], maxLoss: number, rng: Rng = Math.random): string {
  if (candidates.length === 0) throw new Error('No candidates');
  const best = candidates[0].score;
  const pool = candidates.filter((c) => best - c.score <= maxLoss);
  const spread = maxLoss / 2 + 1;
  const weights = pool.map((c) => Math.exp(-(best - c.score) / spread));
  let r = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i].uci;
  }
  return pool[pool.length - 1].uci;
}

/** Would `square` be defended by the side that just moved away from it? */
function guardedBy(chess: Chess, square: Square, color: 'w' | 'b'): boolean {
  return chess.isAttacked(square, color);
}

/** What a capture nets the capturer, assuming it gets recaptured if the square is defended. */
function captureGain(fen: string, m: Move): number {
  if (!m.captured) return 0;
  const after = new Chess(fen);
  after.move(m);
  const defended = guardedBy(after, m.to, after.turn());
  return PIECE_VALUE[m.captured] - (defended ? PIECE_VALUE[m.piece] : 0);
}

/**
 * Raider personality: burn villages first, grab good captures second, then pile
 * pressure onto the villages. Returns null when it has no village plan, so the
 * caller can fall back to Stockfish.
 */
export function raiderMove(chess: Chess, villages: Square[], rng: Rng = Math.random): string | null {
  if (villages.length === 0) return null;
  const fen = chess.fen();
  const raider = chess.turn();
  const defender = raider === 'w' ? 'b' : 'w';
  const moves = chess.moves({ verbose: true });

  // Village pressure: raider attackers minus defenders on each village.
  const pressure = (c: Chess) =>
    villages.reduce((sum, v) => sum + c.attackers(v, raider).length - c.attackers(v, defender).length, 0);
  // Defender pieces left en prise: raiders love to threaten them.
  const threatened = (c: Chess) => hangingPieces(c, defender).size;
  const basePressure = pressure(chess);
  const baseThreats = threatened(chess);

  let bestScore = -Infinity;
  let best: Move[] = [];
  for (const m of moves) {
    const after = new Chess(fen);
    after.move(m);
    let score: number;
    if (after.isCheckmate()) {
      score = 2000;
    } else if (villages.includes(m.to) && !guardedBy(after, m.to, defender)) {
      score = 1000; // an unguarded village: burn it
    } else if (captureGain(fen, m) > 0) {
      score = 500 + captureGain(fen, m) * 10;
    } else {
      const moverHangs = guardedBy(after, m.to, defender) && !guardedBy(after, m.to, raider);
      score =
        (pressure(after) - basePressure) * 10 +
        (threatened(after) - baseThreats) * 15 -
        (moverHangs ? PIECE_VALUE[m.piece] * 10 : 0);
    }
    if (score > bestScore) {
      bestScore = score;
      best = [m];
    } else if (score === bestScore) best.push(m);
  }
  if (bestScore <= 0 || best.length === 0) return null;
  return uciOf(best[Math.floor(rng() * best.length)]);
}

/** Used when Stockfish can't load: take the best capture, otherwise any move. */
export function fallbackMove(chess: Chess, rng: Rng = Math.random): string {
  const fen = chess.fen();
  const moves = chess.moves({ verbose: true });
  const mate = moves.find((m) => {
    const after = new Chess(fen);
    after.move(m);
    return after.isCheckmate();
  });
  if (mate) return uciOf(mate);
  const captures = moves.filter((m) => captureGain(fen, m) > 0).sort((a, b) => captureGain(fen, b) - captureGain(fen, a));
  if (captures.length) return uciOf(captures[0]);
  return uciOf(moves[Math.floor(rng() * moves.length)]);
}

export async function chooseEnemyMove(
  battle: Battle,
  engine: Engine | null,
  profile: AiProfile,
  rng: Rng = Math.random,
): Promise<string> {
  const chess = new Chess(battle.fen);
  if (battle.scenario.enemy.personality === 'raider') {
    const raid = raiderMove(chess, battle.scenario.villages ?? [], rng);
    if (raid) return raid;
  }
  if (engine) {
    const candidates = await engine.analyse(battle.fen, profile.depth, profile.multiPv);
    const legal = new Set(chess.moves({ verbose: true }).map(uciOf));
    const usable = candidates.filter((c) => legal.has(c.uci));
    if (usable.length) return pickCandidate(usable, profile.maxLoss, rng);
  }
  return fallbackMove(chess, rng);
}
