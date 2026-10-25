import type { PieceSymbol } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { BOARD_TALL, BOARD_TOP, DEPTH, GROUND, MAX_COVER, TOKEN_ABOVE_BASE, TOKEN_BOX, coverBehind } from './boardGeometry';

const TYPES: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k'];

describe('token overlap (#62)', () => {
  it('hides no more than the pedestal of the piece behind', () => {
    for (const front of TYPES) for (const behind of TYPES) {
      // Hide at most 15% of the back token, so its face and headgear stay readable.
      expect(coverBehind(front, behind), `${front} in front of ${behind}`).toBeLessThanOrEqual(MAX_COVER + 1e-9);
      expect(coverBehind(front, behind) / TOKEN_BOX[behind][1]).toBeLessThanOrEqual(0.15);
    }
  });

  it('keeps the king the tallest and the pawn the shortest', () => {
    const h = (t: PieceSymbol) => TOKEN_BOX[t][1];
    for (const t of TYPES) {
      expect(h('k')).toBeGreaterThanOrEqual(h(t));
      expect(h('p')).toBeLessThanOrEqual(h(t));
    }
  });

  it('leaves room above the board for back-rank heads', () => {
    const groundBelowTop = (0.5 + GROUND) * DEPTH;
    for (const t of TYPES) expect(TOKEN_BOX[t][1] * TOKEN_ABOVE_BASE - groundBelowTop).toBeLessThan(BOARD_TOP);
  });

  it('keeps the board outline the same size, so screen layouts do not shift', () => {
    expect(Math.abs(BOARD_TALL - (1.05 + 8 * 0.78 + 0.75))).toBeLessThan(0.05);
  });
});
