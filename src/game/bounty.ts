import { Chess } from 'chess.js';

/** A Lichess puzzle. moves[0] is the opponent's setup move; the solver plays moves[1], moves[3], ... */
export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  /** The curriculum theme it was picked for (its source file), if known. Lichess tags overlap. */
  theme?: string;
}

export type Difficulty = 'squire' | 'knight' | 'champion' | 'grandmaster';

/** Curriculum tags used to tell bounties apart when mixing themes. */
const CURRICULUM_THEMES = ['mateIn1', 'hangingPiece'];

const toMove = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });

/** Position the solver sees (after moves[0]), the solver's color, and the solution plies. */
export function puzzleStart(p: Puzzle): { fen: string; solver: 'w' | 'b'; solution: string[] } {
  const chess = new Chess(p.fen);
  chess.move(toMove(p.moves[0]));
  return { fen: chess.fen(), solver: chess.turn(), solution: p.moves.slice(1) };
}

/**
 * Checks the solver's move at solver step `step` (0-based count of solver moves).
 * Accepts any mating move when the expected move mates. `solved` = correct and it was the last solver move.
 */
export function checkPuzzleMove(p: Puzzle, step: number, uci: string): 'correct' | 'wrong' | 'solved' {
  const idx = 1 + 2 * step;
  const expected = p.moves[idx];
  if (!expected) return 'wrong';
  const last = idx >= p.moves.length - 1;
  const done = last ? 'solved' : 'correct';
  if (uci === expected) return done;

  // Alternative mates: replay up to this step, then see whether both moves deliver checkmate.
  const chess = new Chess(p.fen);
  try {
    for (let i = 0; i < idx; i++) chess.move(toMove(p.moves[i]));
    const probe = new Chess(chess.fen());
    probe.move(toMove(expected));
    if (!probe.isCheckmate()) return 'wrong';
    chess.move(toMove(uci));
    return chess.isCheckmate() ? done : 'wrong';
  } catch {
    return 'wrong';
  }
}

/** Gold paid for solving a puzzle: ~10 at equal rating, +2 per 100 points above, clamped to [2, 30]. */
export function bountyReward(puzzleRating: number, playerRating: number): number {
  const gold = Math.round(10 + (2 * (puzzleRating - playerRating)) / 100);
  return Math.max(2, Math.min(30, gold));
}

/**
 * Picks `count` bounties near playerRating, skipping `exclude`, mixing themes,
 * with at least one a bit above the rating when available. Deterministic given rng.
 */
export function pickBounties(
  pool: Puzzle[],
  opts: { playerRating: number; count: number; exclude: ReadonlySet<string>; rng?: () => number },
): Puzzle[] {
  const { playerRating, count, exclude, rng = Math.random } = opts;
  const left = pool.filter((p) => !exclude.has(p.id));
  const picked: Puzzle[] = [];
  const themeUse = new Map<string, number>();
  const mainTheme = (p: Puzzle) => p.theme ?? p.themes.find((t) => CURRICULUM_THEMES.includes(t)) ?? p.themes[0] ?? '';

  // Each slot aims at a different rating so the board offers a spread (and different pay):
  // one a bit above, one easier, one at the rating, one just above.
  const TARGETS = [175, -150, 0, 75];
  // Lower score is better: close to the slot's target, theme not yet used, plus jitter.
  const score = (p: Puzzle) =>
    Math.abs(p.rating - (playerRating + TARGETS[picked.length % TARGETS.length])) + 300 * (themeUse.get(mainTheme(p)) ?? 0) + rng() * 60;

  const take = (candidates: Puzzle[]) => {
    if (!candidates.length) return;
    let best = candidates[0];
    let bestScore = Infinity;
    for (const p of candidates) {
      const s = score(p);
      if (s < bestScore) { best = p; bestScore = s; }
    }
    picked.push(best);
    themeUse.set(mainTheme(best), (themeUse.get(mainTheme(best)) ?? 0) + 1);
    left.splice(left.indexOf(best), 1);
  };

  // One a bit above the player's rating first.
  take(left.filter((p) => p.rating >= playerRating + 50 && p.rating <= playerRating + 300));
  while (picked.length < count && left.length) take(left);
  return picked;
}

/** Fixed player rating per difficulty for now (the adaptive rating is out of scope). */
export function playerRatingFor(difficulty: Difficulty): number {
  return { squire: 900, knight: 1200, champion: 1500, grandmaster: 1800 }[difficulty];
}
