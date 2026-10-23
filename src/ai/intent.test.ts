import { describe, expect, it } from 'vitest';
import type { Candidate, Engine } from './engine';
import { nullMoveFen, planIfPassed } from './intent';

describe('nullMoveFen', () => {
  it('passes the turn and drops the en passant square', () => {
    const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
    expect(nullMoveFen(fen)).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
  });

  it('refuses when the side to move is in check', () => {
    expect(nullMoveFen('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1')).toBeNull();
  });
});

describe('planIfPassed', () => {
  const profile = { depth: 4, multiPv: 3, maxLoss: 0 };
  const scenario = { enemy: { name: 'Test', personality: 'standard' as const }, villages: [] };
  // White to move; Black's knight on c6 is the piece being asked about.
  const fen = '4k3/8/2n5/8/8/8/8/4K3 w - - 0 1';

  it('asks the engine about the position with the turn passed', async () => {
    const asked: string[] = [];
    const engine = {
      analyse: async (f: string): Promise<Candidate[]> => {
        asked.push(f);
        return [{ uci: 'c6e5', score: 10 }];
      },
    } as unknown as Engine;
    expect(await planIfPassed({ fen, scenario }, engine, profile, () => 0)).toBe('c6e5');
    expect(asked).toEqual([nullMoveFen(fen)]);
  });

  it('is null while the player is in check', async () => {
    const view = { fen: '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1', scenario };
    expect(await planIfPassed(view, null, profile)).toBeNull();
  });

  it('is null when the engine blows up', async () => {
    const engine = {
      analyse: async () => {
        throw new Error('boom');
      },
    } as unknown as Engine;
    expect(await planIfPassed({ fen, scenario }, engine, profile)).toBeNull();
  });
});
