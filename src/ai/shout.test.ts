import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { planShout, shoutLine, shoutStands } from './shout';

describe('shoutStands', () => {
  // Black knight on c6 announced Nd4. White to move first, then it's Black's turn.
  const fen = '4k3/8/2n5/8/8/8/8/R3K3 w - - 0 1';

  it('stands when the move is still legal', () => {
    const c = new Chess(fen);
    c.move('Ra2');
    expect(shoutStands(c.fen(), 'c6d4')).toBe(true);
  });

  it('falls when the piece was captured or the move is now illegal', () => {
    const c = new Chess('4k3/8/2n5/8/8/8/8/2R1K3 w - - 0 1');
    c.move('Rxc6');
    expect(shoutStands(c.fen(), 'c6d4')).toBe(false);
    // A check the announced move doesn't answer makes it illegal too.
    const d = new Chess(fen);
    d.move('Ra8+');
    expect(shoutStands(d.fen(), 'c6d4')).toBe(false);
  });
});

describe('planShout', () => {
  it('announces the capture the enemy would make if you passed', async () => {
    // White's rook on d4 hangs to the knight on c6.
    const fen = '4k3/8/2n5/8/3R4/8/8/4K3 w - - 0 1';
    const battle = { fen, scenario: { enemy: { name: 'Test', personality: 'standard' as const }, villages: [] } }
    expect(await planShout(battle, null, { depth: 1, multiPv: 1, maxLoss: 0 }, () => 0)).toBe('c6d4');
  });

  it('stays quiet while your king is in check', async () => {
    const battle = { fen: '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1', scenario: { enemy: { name: 'Test', personality: 'standard' as const } } }
    expect(await planShout(battle, null, { depth: 1, multiPv: 1, maxLoss: 0 })).toBeNull();
  });
});

describe('shoutLine', () => {
  it('names the piece it plans to grab', () => {
    expect(shoutLine('4k3/8/2n5/8/3R4/8/8/4K3 w - - 0 1', 'c6d4')).toMatch(/rook on d4/);
  });
  it('calls out a village raid', () => {
    expect(shoutLine('4k3/8/2n5/8/8/8/8/4K3 w - - 0 1', 'c6d4', ['d4'])).toMatch(/village on d4/);
  });
});
