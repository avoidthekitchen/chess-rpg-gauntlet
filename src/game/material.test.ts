import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { VALUE_LEGEND, materialBalance, swingLabel } from './material';

describe('material', () => {
  it('lists the standard piece values', () => {
    expect(VALUE_LEGEND).toBe('Pawn 1 · Knight 3 · Bishop 3 · Rook 5 · Queen 9');
  });

  it('labels gains, losses and no change', () => {
    expect(swingLabel(3)).toBe('+3');
    expect(swingLabel(-5)).toBe('−5');
    expect(swingLabel(0)).toBe('');
  });

  it('counts a promotion as the new piece minus the pawn', () => {
    const c = new Chess('8/4P3/8/8/8/8/8/k6K w - - 0 1');
    const before = materialBalance(c, 'w');
    c.move('e8=Q');
    expect(materialBalance(c, 'w') - before).toBe(8);
  });
});
