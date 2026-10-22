import { describe, expect, it } from 'vitest';
import { STARTING_GOLD, addCharacter, assignCharacters, bossOpen, newSave, nodeState, type RegionMap } from './campaign';
import { bonusMet } from './content';

const map: RegionMap = {
  start: ['a'],
  bossNeeds: 2,
  nodes: [
    { id: 'a', x: 0, y: 0, next: ['b', 'c'] },
    { id: 'b', x: 0, y: 0, next: ['d'] },
    { id: 'c', x: 0, y: 0, next: [] },
    { id: 'd', x: 0, y: 0, next: [] },
  ],
};

describe('newSave', () => {
  it('starts with the starter companion, two mouse squires and a little gold', () => {
    const s = newSave('squire', 'n', true);
    expect(s.roster.map((c) => [c.type, c.role])).toEqual([
      ['n', 'starter'],
      ['p', 'hired'],
      ['p', 'hired'],
    ]);
    expect(s.roster[0].name).toBe('Sir Hob');
    expect(s.gold).toBe(STARTING_GOLD);
  });

  it('gives every hired piece a unique name', () => {
    const s = newSave('knight', 'b', true);
    for (let i = 0; i < 12; i++) addCharacter(s, 'p', 'hired');
    const names = s.roster.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('region map', () => {
  it('opens the start, then whatever a win leads to', () => {
    const s = { cleared: [] as string[], lostForGood: [] as string[] };
    expect(nodeState(map, s, 'a')).toBe('open');
    expect(nodeState(map, s, 'b')).toBe('locked');
    s.cleared.push('a');
    expect(nodeState(map, s, 'a')).toBe('cleared');
    expect(nodeState(map, s, 'b')).toBe('open');
    expect(nodeState(map, s, 'c')).toBe('open');
    expect(nodeState(map, s, 'd')).toBe('locked');
  });

  it('opens the boss after enough wins, in any order', () => {
    expect(bossOpen(map, { cleared: ['a'] })).toBe(false);
    expect(bossOpen(map, { cleared: ['a', 'c'] })).toBe(true);
  });

  it('marks a battle lost for good as gone', () => {
    expect(nodeState(map, { cleared: ['a'], lostForGood: ['b'] }, 'b')).toBe('gone');
  });
});

describe('bonus goals', () => {
  const win = { won: true, piecesLost: 0, playerMoves: 5, rewindsUsed: 0 };
  it('need a win', () => {
    expect(bonusMet({ kind: 'flawless', gold: 5 }, { ...win, won: false })).toBe(false);
  });
  it('check pieces lost, move count and rewinds', () => {
    expect(bonusMet({ kind: 'flawless', gold: 5 }, win)).toBe(true);
    expect(bonusMet({ kind: 'flawless', gold: 5 }, { ...win, piecesLost: 1 })).toBe(false);
    expect(bonusMet({ kind: 'quick', moves: 5, gold: 5 }, win)).toBe(true);
    expect(bonusMet({ kind: 'quick', moves: 4, gold: 5 }, win)).toBe(false);
    expect(bonusMet({ kind: 'noRewind', gold: 5 }, { ...win, rewindsUsed: 1 })).toBe(false);
  });
});

describe('assignCharacters', () => {
  it('puts your named pieces into the lineup, starter first, the rest as militia', () => {
    const s = newSave('squire', 'n', true); // Sir Hob + Pip + Nib
    // Two knights and three pawns: one knight and two pawns are yours.
    const names = assignCharacters('4k3/8/8/8/8/8/PPP5/1N2K1N1 w - - 0 1', s.roster);
    expect(names).toEqual({ b1: 'Sir Hob', a2: 'Pip', b2: 'Nib' });
  });

  it('leaves everyone unnamed when you own none of the lineup', () => {
    const s = newSave('squire', 'r', true);
    expect(assignCharacters('4k3/8/8/8/8/8/8/2B1K3 w - - 0 1', s.roster)).toEqual({});
  });
});
