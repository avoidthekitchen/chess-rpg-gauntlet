import { describe, expect, it } from 'vitest';
import type { Puzzle } from './bounty';
import { newSave } from './campaign';
import type { BattleDef } from './content';
import { ARMY_CAP, BOUNTY_COUNT, PRICE, battlePayout, hire, hireCheck, lossCost, recordLoss, recordWin, refreshBounties, settleBounty } from './economy';

const def = {
  id: 'b1',
  reward: 20,
  bonuses: [
    { kind: 'flawless', gold: 5 },
    { kind: 'quick', moves: 4, gold: 5 },
  ],
} as unknown as BattleDef;
const perfect = { won: true, piecesLost: 0, playerMoves: 3, rewindsUsed: 0 };

describe('hiring', () => {
  it('prices pieces at their standard value', () => {
    expect(PRICE).toEqual({ p: 10, n: 30, b: 30, r: 50, q: 90 });
  });

  it('spends gold and adds a named piece', () => {
    const s = newSave('squire', 'n', true);
    s.gold = 35;
    const c = hire(s, 'b');
    expect(c?.type).toBe('b');
    expect(s.gold).toBe(5);
    expect(hireCheck(s, 'p')).toEqual({ ok: false, reason: 'Costs 10g.' });
  });

  it('caps the army at a real chess set', () => {
    const s = newSave('squire', 'n', true); // already 1 knight
    s.gold = 1000;
    expect(hire(s, 'n')).not.toBeNull();
    expect(hire(s, 'n')).toBeNull();
    expect(hire(s, 'q')).not.toBeNull();
    expect(hireCheck(s, 'q').ok).toBe(false);
    for (let i = 0; i < 6; i++) hire(s, 'p');
    expect(s.roster.filter((c) => c.type === 'p').length).toBe(ARMY_CAP.p);
    expect(hire(s, 'p')).toBeNull();
  });
});

describe('battle pay', () => {
  it('pays the reward and every bonus met on a first win', () => {
    const s = newSave('squire', 'n', true);
    expect(battlePayout(s, def, perfect, 5).total).toBe(35);
  });

  it('pays nothing for a loss', () => {
    expect(battlePayout(newSave('squire', 'n', true), def, { ...perfect, won: false }, 5).total).toBe(0);
  });

  it('pays each reward only once, so replays earn only what is left', () => {
    const s = newSave('squire', 'n', true);
    const g0 = s.gold;
    recordWin(s, def, { ...perfect, piecesLost: 1 }, 5); // reward + quick + 5 tactic
    expect(s.gold - g0).toBe(30);
    expect(s.cleared).toEqual(['b1']);
    const replay = battlePayout(s, def, perfect, 10);
    expect(replay).toEqual({ reward: 0, bonuses: [{ kind: 'flawless', gold: 5 }], tactics: 5, total: 10 });
    recordWin(s, def, perfect, 10);
    expect(battlePayout(s, def, perfect, 10).total).toBe(0);
  });
});

describe('losing a battle', () => {
  it('costs nothing on Squire and a tenth of your gold on Knight', () => {
    expect(lossCost('squire', 95)).toBe(0);
    expect(lossCost('knight', 95)).toBe(9);
    expect(lossCost('knight', 5)).toBe(0);
    expect(lossCost('champion', 100)).toBe(25);
  });

  it('never costs the save or the battle below Grandmaster', () => {
    const s = newSave('knight', 'r', true);
    s.gold = 50;
    expect(recordLoss(s, 'b1')).toBe(5);
    expect(s.gold).toBe(45);
    expect(s.lostForGood).toEqual([]);
    const gm = newSave('grandmaster', 'r', true);
    recordLoss(gm, 'b1');
    expect(gm.lostForGood).toEqual(['b1']);
  });
});

describe('bounty board', () => {
  const pool: Puzzle[] = Array.from({ length: 30 }, (_, i) => ({
    id: `p${i}`,
    fen: '',
    moves: [],
    rating: 600 + i * 40,
    themes: [i % 2 ? 'mateIn1' : 'hangingPiece'],
  }));

  it('fills up once, then refreshes only after another battle', () => {
    const s = newSave('squire', 'n', true);
    expect(refreshBounties(s, pool, () => 0.3)).toBe(true);
    expect(s.bounties.length).toBe(BOUNTY_COUNT);
    const first = [...s.bounties];
    expect(refreshBounties(s, pool, () => 0.7)).toBe(false);
    expect(s.bounties).toEqual(first);
    recordLoss(s, 'b1');
    expect(refreshBounties(s, pool, () => 0.7)).toBe(true);
  });

  it('stays empty after you settle every bounty, until the next battle', () => {
    const s = newSave('squire', 'n', true);
    refreshBounties(s, pool, () => 0.4);
    for (const id of [...s.bounties]) settleBounty(s, pool.find((x) => x.id === id)!, true);
    expect(s.bounties).toEqual([]);
    expect(refreshBounties(s, pool, () => 0.4)).toBe(false);
    expect(s.bounties).toEqual([]);
    recordLoss(s, 'b1');
    expect(refreshBounties(s, pool, () => 0.4)).toBe(true);
    expect(s.bounties.length).toBe(BOUNTY_COUNT);
  });

  it('pays for a solved bounty and never offers a finished one again', () => {
    const s = newSave('squire', 'n', true);
    refreshBounties(s, pool, () => 0.5);
    const p = pool.find((x) => x.id === s.bounties[0])!;
    const g0 = s.gold;
    const gold = settleBounty(s, p, true);
    expect(gold).toBeGreaterThan(0);
    expect(s.gold).toBe(g0 + gold);
    expect(s.bounties).not.toContain(p.id);
    const q = pool.find((x) => x.id === s.bounties[0])!;
    expect(settleBounty(s, q, false)).toBe(0);
    for (let i = 0; i < 10; i++) {
      s.battlesFought++;
      refreshBounties(s, pool, Math.random);
      expect(s.bounties).not.toContain(p.id);
      expect(s.bounties).not.toContain(q.id);
    }
  });
});
