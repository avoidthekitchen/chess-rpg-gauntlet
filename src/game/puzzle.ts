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
