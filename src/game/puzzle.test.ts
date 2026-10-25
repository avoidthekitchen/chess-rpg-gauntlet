import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import {
  checkPuzzleMove,
  puzzleStart,
  type Puzzle,
} from './puzzle';

// Real Lichess puzzles (inlined so tests don't depend on generated files).
const MATE1: Puzzle = {
  id: 'ERXXy',
  fen: '4r3/p2R4/1p5k/6p1/P1P1q3/1Q4Pp/5P1P/6K1 w - - 4 37',
  moves: ['f2f3', 'e4e1'],
  rating: 512,
  themes: ['endgame', 'mate', 'mateIn1', 'oneMove'],
};
// Has a second mating move (f6d7) besides the listed f6g4.
const MATE1_ALT: Puzzle = {
  id: 'fvvFt',
  fen: '8/1p2k3/1Pp1pn2/2P1K3/r2PBP2/8/7R/8 w - - 0 51',
  moves: ['h2h6', 'f6g4'],
  rating: 834,
  themes: ['endgame', 'master', 'mate', 'mateIn1', 'oneMove'],
};
const HANG2: Puzzle = {
  id: 'ZbBv8',
  fen: '2b5/2P5/1k5N/5p2/6p1/4P1P1/3K4/8 w - - 1 51',
  moves: ['h6f5', 'c8f5', 'c7c8q', 'f5c8'],
  rating: 638,
  themes: ['crushing', 'endgame', 'hangingPiece', 'short'],
};

describe('puzzleStart', () => {
  it('applies the opponent setup move and reports the solver color', () => {
    const s = puzzleStart(MATE1);
    expect(s.solver).toBe('b');
    expect(s.solution).toEqual(['e4e1']);
    const chess = new Chess(s.fen);
    expect(chess.turn()).toBe('b');
    expect(chess.get('f3')?.type).toBe('p');
  });

  it('works for multi-move puzzles', () => {
    const s = puzzleStart(HANG2);
    expect(s.solver).toBe('b');
    expect(s.solution).toEqual(['c8f5', 'c7c8q', 'f5c8']);
  });
});

describe('checkPuzzleMove', () => {
  it('solves a mate in 1 with the listed move', () => {
    expect(checkPuzzleMove(MATE1, 0, 'e4e1')).toBe('solved');
  });

  it('rejects a wrong move', () => {
    expect(checkPuzzleMove(MATE1, 0, 'e4e2')).toBe('wrong');
    expect(checkPuzzleMove(MATE1, 0, 'a7a5')).toBe('wrong');
  });

  it('accepts an alternative mating move', () => {
    expect(checkPuzzleMove(MATE1_ALT, 0, 'f6g4')).toBe('solved');
    expect(checkPuzzleMove(MATE1_ALT, 0, 'f6d7')).toBe('solved');
  });

  it('rejects a legal non-mating move and an illegal move on a mate puzzle', () => {
    expect(checkPuzzleMove(MATE1_ALT, 0, 'f6h5')).toBe('wrong');
    expect(checkPuzzleMove(MATE1_ALT, 0, 'a4a1')).toBe('wrong');
  });

  it('marks only the last solver move as solved in a multi-move puzzle', () => {
    expect(checkPuzzleMove(HANG2, 0, 'c8f5')).toBe('correct');
    expect(checkPuzzleMove(HANG2, 1, 'f5c8')).toBe('solved');
    expect(checkPuzzleMove(HANG2, 1, 'f5e4')).toBe('wrong');
  });

  it('returns wrong for a step past the solution', () => {
    expect(checkPuzzleMove(MATE1, 1, 'e4e1')).toBe('wrong');
  });
});
