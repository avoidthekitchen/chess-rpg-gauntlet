import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { materialBalance } from './material';
import { isFork } from './tactics';
import { forkPays } from './tacticCheck';

describe('forkPays', () => {
  it('confirms a fork the engine says wins material', () => {
    // Nc7+ forks king and rook from an equal position; Stockfish rates it about +5 for White.
    expect(forkPays(0, -480)).toBe(true);
  });

  it('rejects a "fork" that just loses the forking piece', () => {
    // The board rule sees a fork, but the knight is simply taken: White ends up worse.
    expect(forkPays(0, 250)).toBe(false);
  });

  it('confirms the prototype’s knight fork, even though the knight is later trapped', () => {
    // r3k3/1pN2ppp/... Black to move after Nc7+: Stockfish depth 10 says +2.05 for Black,
    // but Black was 3 points up before the fork, so White gained about a pawn net.
    expect(forkPays(-3, 205)).toBe(true);
  });

  it('measures against the material before the move, not zero', () => {
    // Already a rook up (+5): a fork that only keeps +5.5 wins nothing new.
    expect(forkPays(5, -540)).toBe(false);
    expect(forkPays(5, -700)).toBe(true);
  });

  it('accepts forced mates', () => {
    expect(forkPays(0, -99_800)).toBe(true);
  });
});

describe('fork rule examples', () => {
  it('spots the knight fork the confirmation is about', () => {
    const c = new Chess('r3k3/1p3ppp/8/1N6/8/8/5PPP/6K1 w - - 0 1');
    const before = materialBalance(c, 'w');
    const m = c.move('Nc7+');
    expect(isFork(c, m)).toBe(true);
    expect(before).toBe(-3);
  });
});
