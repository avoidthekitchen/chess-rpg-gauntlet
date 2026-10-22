import { describe, expect, it } from 'vitest';
import { biggestMistake, costWords, moveCost, type MoveReview } from './review';

const m = (number: number, played: string, best: string, bestScore: number, playedScore: number): MoveReview => ({ number, played, best, bestScore, playedScore });

describe('post-battle review', () => {
  it('names the costliest move', () => {
    const worst = biggestMistake([m(1, 'Nf3', 'Nf3', 30, 30), m(2, 'Qh5', 'Bc4', 40, -280), m(3, 'Re1', 'Rd1', 20, -60)]);
    expect(worst?.number).toBe(2);
    expect(worst?.cost).toBe(320);
  });

  it('ignores small slips', () => {
    expect(biggestMistake([m(1, 'a3', 'e4', 50, 0)])).toBeNull();
  });

  it('does not flag a move that keeps a forced mate, or one that beat the engine’s pick', () => {
    expect(moveCost(m(1, 'Re2', 'Rd8+', 99_700, 99_500))).toBe(0);
    // A shout trap: once the goblins' forced reply is counted, the move scores higher than "best".
    expect(moveCost(m(1, 'Re2', 'h3', 100, 900))).toBe(0);
  });

  it('caps huge swings so a missed mate reads as a big mistake, not a number', () => {
    expect(moveCost(m(1, 'Kh1', 'Re8#', 100_000, 0))).toBe(1500);
    expect(costWords(1500)).toBe('a winning position');
    expect(costWords(320)).toMatch(/3 points/);
  });
});
