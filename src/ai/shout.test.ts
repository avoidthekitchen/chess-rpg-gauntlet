import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import type { Candidate, Engine } from './engine';
import { planShout, replyHabits, ShoutBook, shoutLine, shoutStands } from './shout';

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

describe('replyHabits', () => {
  // Black to move; the knight announced Nd4.
  const fen = '4k3/8/2n5/8/8/8/P7/4K3 b - - 0 1';

  it('carries the shout when the battle shouts and the move is still legal', () => {
    expect(replyHabits(true, 'c6d4', fen)).toEqual({ shout: 'c6d4' });
  });

  it('drops the shout in a battle that does not shout, even with a plan in hand (the Orb)', () => {
    expect(replyHabits(false, 'c6d4', fen).shout).toBeNull();
  });

  it('drops a shout that is no longer legal (foiled)', () => {
    expect(replyHabits(true, 'a1a2', fen).shout).toBeNull();
    expect(replyHabits(true, 'c6c7', fen).shout).toBeNull();
  });

  it('has no shout when none was made', () => {
    expect(replyHabits(true, null, fen).shout).toBeNull();
  });
});

describe('ShoutBook', () => {
  // The player (White) is to move; Black's knight on c6 is who shouts.
  const fenA = '4k3/8/2n5/8/8/8/P7/4K3 w - - 0 1';
  const fenB = '4k3/8/2n5/8/8/8/8/4K3 w - - 0 1';
  const view = (fen: string) => ({ fen, scenario: { enemy: { name: 'Test', personality: 'standard' as const }, villages: [] } });
  const profile = { depth: 4, multiPv: 3, maxLoss: 0 };

  function counting() {
    let calls = 0;
    const engine = {
      analyse: async (): Promise<Candidate[]> => {
        calls++;
        return [{ uci: 'c6e5', score: 0 }];
      },
    } as unknown as Engine;
    return { engine, calls: () => calls };
  }

  it('plans once per position and replays the remembered shout', async () => {
    const { engine, calls } = counting();
    const book = new ShoutBook();
    expect(book.has(fenA)).toBe(false);
    expect(book.get(fenA)).toBeUndefined();
    expect(await book.plan(view(fenA), engine, profile)).toBe('c6e5');
    expect(calls()).toBe(1);
    expect(book.has(fenA)).toBe(true);
    expect(book.get(fenA)).toBe('c6e5');
    expect(await book.plan(view(fenA), engine, profile)).toBe('c6e5');
    expect(calls()).toBe(1);
  });

  it('plans again for a different position', async () => {
    const { engine, calls } = counting();
    const book = new ShoutBook();
    await book.plan(view(fenA), engine, profile);
    await book.plan(view(fenB), engine, profile);
    expect(calls()).toBe(2);
    expect(book.has(fenB)).toBe(true);
  });

  it('remembers a null shout too, without asking again', async () => {
    const { engine, calls } = counting();
    const inCheck = '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1';
    const book = new ShoutBook();
    expect(await book.plan(view(inCheck), engine, profile)).toBeNull();
    expect(await book.plan(view(inCheck), engine, profile)).toBeNull();
    expect(book.has(inCheck)).toBe(true);
    expect(book.get(inCheck)).toBeNull();
    expect(calls()).toBe(0);
  });
});
