import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import type { Scenario } from '../game/scenarios';
import type { AiProfile } from '../game/difficulty';
import { PIECE_VALUE } from '../game/material';
import { hangingPieces } from '../game/threats';
import type { Candidate, Engine } from './engine';

export type Rng = () => number;

const uciOf = (m: Move) => m.from + m.to + (m.promotion ?? '');

/**
 * Habit tilts ("tell or tilt, never force", docs/design/systems.md): each habit multiplies
 * the weight of the moves it likes, the multipliers multiply together, and the total is
 * capped, so a habit makes a move more likely but never certain. Starting values to tune.
 */
export const SHOUT_BONUS = 3;
/** The raider's multiplier at full village pressure; smaller gains get less. */
export const RAID_BONUS_MAX = 3;
/** The most any move's combined multiplier can be. */
export const BONUS_CAP = 3;

/** A move's combined habit multiplier (1 when no habit likes it). */
export type Bonus = (uci: string) => number;

/** The chance of each move in the window, before the random draw (exported for tests). */
export function candidateOdds(candidates: Candidate[], maxLoss: number, bonus?: Bonus): { uci: string; p: number }[] {
  if (candidates.length === 0) return [];
  const best = Math.max(...candidates.map((c) => c.score));
  const pool = candidates.filter((c) => best - c.score <= maxLoss);
  const spread = maxLoss / 2 + 1;
  const weights = pool.map((c) => Math.exp(-(best - c.score) / spread) * Math.min(BONUS_CAP, Math.max(1, bonus?.(c.uci) ?? 1)));
  const total = weights.reduce((a, b) => a + b, 0);
  return pool.map((c, i) => ({ uci: c.uci, p: weights[i] / total }));
}

/**
 * The one weighted pick every enemy move comes from. Moves within `maxLoss` centipawns
 * of the best can be chosen, with better ones more likely; habits tilt the odds through
 * `bonus`. This makes believable mistakes rather than Stockfish's "perfect move, then
 * random blunder" low skill levels.
 */
export function pickCandidate(candidates: Candidate[], maxLoss: number, rng: Rng = Math.random, bonus?: Bonus): string {
  if (candidates.length === 0) throw new Error('No candidates');
  const odds = candidateOdds(candidates, maxLoss, bonus);
  let r = rng();
  for (const o of odds) {
    r -= o.p;
    if (r <= 0) return o.uci;
  }
  return odds[odds.length - 1].uci;
}

/** Village pressure: the side's attackers minus the other side's guards, summed over the villages. */
function villagePressure(c: Chess, villages: Square[], side: 'w' | 'b'): number {
  const other = side === 'w' ? 'b' : 'w';
  return villages.reduce((sum, v) => sum + c.attackers(v, side).length - c.attackers(v, other).length, 0);
}

/**
 * The raider's tilt: a move that burns an unguarded village gets the full multiplier, and
 * a move that adds village pressure gets 1 more per point of pressure, up to the full one.
 */
export function raidBonus(fen: string, villages: Square[]): Bonus {
  if (villages.length === 0) return () => 1;
  const chess = new Chess(fen);
  const raider = chess.turn();
  const defender = raider === 'w' ? 'b' : 'w';
  const base = villagePressure(chess, villages, raider);
  const memo = new Map<string, number>();
  return (uci) => {
    const known = memo.get(uci);
    if (known !== undefined) return known;
    let out = 1;
    const after = new Chess(fen);
    try {
      const m = after.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as PieceSymbol | undefined });
      if (villages.includes(m.to) && !guardedBy(after, m.to, defender)) out = RAID_BONUS_MAX;
      else out = Math.min(RAID_BONUS_MAX, 1 + Math.max(0, villagePressure(after, villages, raider) - base));
    } catch {
      out = 1;
    }
    memo.set(uci, out);
    return out;
  };
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
 * Raider personality without an engine: burn villages first, grab good captures second,
 * then pile pressure onto the villages. Returns null when it has no village plan, so the
 * caller can use the plain fallback. With an engine, the raider is a tilt instead
 * (`raidBonus`), so it never plays outside the difficulty's window.
 */
export function raiderMove(chess: Chess, villages: Square[], rng: Rng = Math.random): string | null {
  if (villages.length === 0) return null;
  const fen = chess.fen();
  const raider = chess.turn();
  const defender = raider === 'w' ? 'b' : 'w';
  const moves = chess.moves({ verbose: true });

  const pressure = (c: Chess) => villagePressure(c, villages, raider);
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
    } else if (allowsMateInOne(after)) {
      score = -5000; // a raid isn't worth losing the king
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

/** Whether the side to move in `after` has a checkmate in one. */
function allowsMateInOne(after: Chess): boolean {
  const fen = after.fen();
  return after.moves({ verbose: true }).some((r) => {
    const probe = new Chess(fen);
    probe.move(r);
    return probe.isCheckmate();
  });
}

/**
 * Used when Stockfish can't load: mate, else the best capture, else the shouted move (so a
 * shout still means something without an engine), otherwise any move.
 */
export function fallbackMove(chess: Chess, rng: Rng = Math.random, prefer?: string | null): string {
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
  if (prefer && moves.some((m) => uciOf(m) === prefer)) return prefer;
  return uciOf(moves[Math.floor(rng() * moves.length)]);
}

/** What the enemy needs to pick a move: the position, and the battle's personality and villages. */
export interface EnemyView {
  fen: string;
  scenario: Pick<Scenario, 'enemy' | 'villages'>;
}

/**
 * The faction's own habits for this move. Only the enemy's AI sets these: showing a plan
 * (a shout, the Scrying Orb) never adds one.
 */
export interface Habits {
  /** Bog Goblins: the move they shouted before your move. It gets `SHOUT_BONUS`. */
  shout?: string | null;
}

/**
 * Engine candidates for `fen`, plus `extra` when it's legal but outside the engine's top
 * list: it's scored on its own (the position after it, from the other side) so a habit's
 * favourite is judged against the window rather than assumed to be outside it.
 */
async function candidatesWith(fen: string, engine: Engine, profile: AiProfile, extra: string | null | undefined): Promise<Candidate[]> {
  const chess = new Chess(fen);
  const legal = new Set(chess.moves({ verbose: true }).map(uciOf));
  const usable = (await engine.analyse(fen, profile.depth, profile.multiPv)).filter((c) => legal.has(c.uci));
  if (!extra || !legal.has(extra) || usable.length === 0 || usable.some((c) => c.uci === extra)) return usable;
  const after = new Chess(fen);
  after.move({ from: extra.slice(0, 2), to: extra.slice(2, 4), promotion: extra[4] as PieceSymbol | undefined });
  let score: number;
  if (after.isCheckmate()) score = 100_000;
  else if (after.isGameOver()) score = 0;
  else {
    const [reply] = await engine.analyse(after.fen(), Math.max(1, profile.depth - 1), 1);
    if (!reply) return usable;
    score = -reply.score;
  }
  // The main search already ranked it below every listed move, so it can't score above the
  // worst of them; the single search only decides whether it drops out of the window.
  return [...usable, { uci: extra, score: Math.min(score, usable[usable.length - 1].score) }];
}

/** The combined multiplier for each move: the raider's village tilt times the shout's, capped in `candidateOdds`. */
export function habitBonus(view: EnemyView, habits: Habits): Bonus {
  const raid = view.scenario.enemy.personality === 'raider' ? raidBonus(view.fen, view.scenario.villages ?? []) : null;
  return (uci) => (raid ? raid(uci) : 1) * (habits.shout && uci === habits.shout ? SHOUT_BONUS : 1);
}

/**
 * The enemy's move: one weighted pick among the engine's moves within the difficulty's
 * window, tilted by the faction's habits (the raider's villages, the goblins' shout).
 * Without an engine, a simple fallback: the raider's village plan, else `fallbackMove`.
 */
export async function chooseEnemyMove(
  battle: EnemyView,
  engine: Engine | null,
  profile: AiProfile,
  rng: Rng = Math.random,
  habits: Habits = {},
): Promise<string> {
  const chess = new Chess(battle.fen);
  const raider = battle.scenario.enemy.personality === 'raider';
  const villages = battle.scenario.villages ?? [];
  if (engine) {
    const usable = await candidatesWith(battle.fen, engine, profile, habits.shout);
    if (usable.length) return pickCandidate(usable, profile.maxLoss, rng, habitBonus(battle, habits));
  }
  if (raider) {
    const raid = raiderMove(chess, villages, rng);
    if (raid) return raid;
  }
  return fallbackMove(chess, rng, habits.shout);
}
