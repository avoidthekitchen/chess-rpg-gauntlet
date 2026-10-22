import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import {
  bountyReward,
  checkPuzzleMove,
  pickBounties,
  playerRatingFor,
  puzzleStart,
  type Puzzle,
} from './bounty';

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

/** Synthetic pool: alternating themes across a rating span. */
function pool(n: number, start = 400, step = 20): Puzzle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    fen: MATE1.fen,
    moves: MATE1.moves,
    rating: start + i * step,
    themes: [i % 2 ? 'hangingPiece' : 'mateIn1', 'short'],
  }));
}

/** Deterministic rng (mulberry32). */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

describe('bountyReward', () => {
  it('pays about 10 at equal rating', () => {
    expect(bountyReward(1200, 1200)).toBe(10);
  });

  it('is monotonic in puzzle rating', () => {
    let prev = -Infinity;
    for (let r = 200; r <= 2400; r += 50) {
      const g = bountyReward(r, 1200);
      expect(g).toBeGreaterThanOrEqual(prev);
      prev = g;
    }
  });

  it('is clamped to [2, 30] and always an integer', () => {
    expect(bountyReward(400, 1800)).toBe(2);
    expect(bountyReward(3000, 800)).toBe(30);
    for (let r = 100; r <= 3000; r += 37) {
      const g = bountyReward(r, 1234);
      expect(Number.isInteger(g)).toBe(true);
      expect(g).toBeGreaterThanOrEqual(2);
      expect(g).toBeLessThanOrEqual(30);
    }
  });

  it('pays more above the player and little far below', () => {
    expect(bountyReward(1500, 1200)).toBeGreaterThan(10);
    expect(bountyReward(800, 1200)).toBeLessThanOrEqual(3);
  });
});

describe('pickBounties', () => {
  const base = { playerRating: 1000, count: 4, exclude: new Set<string>() };

  it('offers a spread of difficulty, so pay differs between bounties', () => {
    for (const seed of [1, 2, 3]) {
      const r = pickBounties(pool(80), { ...base, rng: seeded(seed) }).map((p) => p.rating);
      expect(Math.max(...r) - Math.min(...r)).toBeGreaterThanOrEqual(200);
      expect(r.some((x) => x < 1000)).toBe(true);
    }
  });

  it('mixes by the theme a puzzle was picked for, not overlapping Lichess tags', () => {
    const mixed = pool(80).map((p, i) => ({ ...p, themes: ['mateIn1', 'hangingPiece'], theme: i % 2 ? 'mateIn1' : 'hangingPiece' }));
    const picks = pickBounties(mixed, { ...base, rng: seeded(5) });
    expect(new Set(picks.map((p) => p.theme)).size).toBe(2);
  });

  it('returns the requested count of unique puzzles near the rating', () => {
    const picks = pickBounties(pool(80), { ...base, rng: seeded(1) });
    expect(picks).toHaveLength(4);
    expect(new Set(picks.map((p) => p.id)).size).toBe(4);
    for (const p of picks) expect(Math.abs(p.rating - 1000)).toBeLessThanOrEqual(250);
  });

  it('includes at least one puzzle a bit above the rating', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const picks = pickBounties(pool(80), { ...base, rng: seeded(seed) });
      expect(picks.some((p) => p.rating > 1000)).toBe(true);
    }
  });

  it('respects the exclude set', () => {
    const all = pool(80);
    const first = pickBounties(all, { ...base, rng: seeded(3) });
    const exclude = new Set(first.map((p) => p.id));
    const second = pickBounties(all, { ...base, exclude, rng: seeded(3) });
    for (const p of second) expect(exclude.has(p.id)).toBe(false);
  });

  it('mixes themes', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const picks = pickBounties(pool(80), { ...base, rng: seeded(seed) });
      const themes = new Set(picks.map((p) => p.themes[0]));
      expect(themes.size).toBeGreaterThan(1);
    }
  });

  it('is deterministic given the rng', () => {
    const a = pickBounties(pool(80), { ...base, rng: seeded(42) }).map((p) => p.id);
    const b = pickBounties(pool(80), { ...base, rng: seeded(42) }).map((p) => p.id);
    expect(a).toEqual(b);
  });

  it('falls back to what is available when the pool is small', () => {
    expect(pickBounties(pool(2), base)).toHaveLength(2);
    expect(pickBounties([], base)).toEqual([]);
  });

  it('still picks when every puzzle is far from the rating', () => {
    const picks = pickBounties(pool(10, 400, 10), { ...base, playerRating: 1800 });
    expect(picks).toHaveLength(4);
  });

  it('does not mutate the pool', () => {
    const all = pool(20);
    const copy = [...all];
    pickBounties(all, base);
    expect(all).toEqual(copy);
  });
});

describe('playerRatingFor', () => {
  it('maps difficulties to fixed ratings', () => {
    expect(playerRatingFor('squire')).toBe(900);
    expect(playerRatingFor('knight')).toBe(1200);
    expect(playerRatingFor('champion')).toBe(1500);
    expect(playerRatingFor('grandmaster')).toBe(1800);
  });
});
