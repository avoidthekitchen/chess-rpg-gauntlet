import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { bossFen, canAdd, checkArmy, suggestArmy, type Budget } from './boss';
import { addCharacter, newSave } from './campaign';

const r1: Budget = { points: 10, caps: { q: 0 } };

describe('boss budget', () => {
  it('counts standard piece values', () => {
    expect(checkArmy(['r', 'n', 'p', 'p'], r1)).toEqual({ ok: true, points: 10 });
  });

  it('refuses an army over the budget', () => {
    const c = checkArmy(['r', 'r', 'p'], r1);
    expect(c.ok).toBe(false);
    expect(c.points).toBe(11);
  });

  it('applies the boss’s piece caps (no queen in region 1)', () => {
    const c = checkArmy(['q'], r1);
    expect(c).toEqual({ ok: false, points: 9, reason: 'No queen allowed in this duel.' });
    expect(canAdd([], 'q', r1)).toBe(false);
    expect(canAdd(['r', 'n'], 'p', r1)).toBe(true);
    expect(canAdd(['r', 'n', 'p', 'p'], 'p', r1)).toBe(false);
  });

  it('needs at least one piece', () => {
    expect(checkArmy([], r1).ok).toBe(false);
  });

  it('suggests the companion first, then the strongest pieces that fit', () => {
    const s = newSave('squire', 'b', true); // owl + 2 pawns = 5 points
    addCharacter(s, 'q', 'hired'); // can't come
    addCharacter(s, 'r', 'hired');
    addCharacter(s, 'p', 'hired');
    const ids = suggestArmy(s.roster, r1);
    const types = ids.map((id) => s.roster.find((c) => c.id === id)!.type);
    expect(types[0]).toBe('b');
    expect(types).not.toContain('q');
    expect(checkArmy(types as never, r1)).toEqual({ ok: true, points: 10 });
  });

  it('owning more than the budget gives choices, not extra power', () => {
    const s = newSave('squire', 'n', true);
    for (const t of ['r', 'r', 'b', 'b', 'n'] as const) addCharacter(s, t, 'hired');
    const types = suggestArmy(s.roster, r1).map((id) => s.roster.find((c) => c.id === id)!.type);
    expect(checkArmy(types as never, r1).points).toBeLessThanOrEqual(10);
  });
});

describe('bossFen', () => {
  const enemy = { e8: 'k', g8: 'n', a7: 'p', b7: 'p', c7: 'p', f7: 'p', g7: 'p', h7: 'p' };

  it('puts your picks on their home squares and is a legal start', () => {
    const fen = bossFen(['r', 'n', 'p', 'p'], enemy);
    const c = new Chess(fen);
    expect(c.get('a1')).toEqual({ type: 'r', color: 'w' });
    expect(c.get('b1')).toEqual({ type: 'n', color: 'w' });
    expect(c.get('d2')?.type).toBe('p');
    expect(c.get('e2')?.type).toBe('p');
    expect(c.turn()).toBe('w');
    expect(fen.split(' ')[2]).toBe('Q');
    expect(new Chess(fen.replace(' w ', ' b ')).inCheck()).toBe(false);
  });

  it('fills the second home square of a type', () => {
    const c = new Chess(bossFen(['b', 'b', 'p'], enemy));
    expect(c.get('c1')?.type).toBe('b');
    expect(c.get('f1')?.type).toBe('b');
  });
});
