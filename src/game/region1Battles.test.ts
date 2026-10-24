import { Chess, type PieceSymbol, type Square } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { Battle } from './battle';
import { REGION1_BATTLES } from './region1Battles';
import { moveLimit } from './scenarios';

/**
 * Fast structural checks for the Region 1 battles. The engine-backed win-rate checks live in
 * scripts/verify and run with `npm run verify:battles`.
 */

const move = (uci: string) => ({
  from: uci.slice(0, 2) as Square,
  to: uci.slice(2, 4) as Square,
  promotion: (uci[4] as PieceSymbol | undefined) ?? undefined,
});

/**
 * One winning line per battle, White and Black alternating, taken from strong-player wins in
 * verification games (the goblins decide freely; their shout is only a preference).
 */
const WINNING_LINES: Record<string, string[]> = {
  // Ne7+ dodges the pawn with check and forks the c8 rook; then the knight picks off b7 and a5.
  'r1-reeds': ['d5e7', 'g8f8', 'e7c8', 'h5g4', 'c8d6', 'a7a5', 'd6b7', 'f7f6', 'b7a5', 'g4c8'],
  // The goblins promised Nxb2, so Bxg7 is safe: the knight lands on b2 and is taken back.
  'r1-guard': ['b2g7', 'a4b2', 'g7b2', 'e4e3', 'd2f3', 'e3e2', 'd1b1', 'e2e1q', 'b1e1', 'c5c4', 'e1e5', 'c4c3', 'b2c3', 'f7f6'],
  // Na4 keeps c3 guarded, so the shouted Rc3 drops the rook; then f4 chases the knight
  // and the cheapest attacker, a pawn, takes it.
  'r1-trades': ['c3a4', 'c8c3', 'a4c3', 'a7a6', 'f2f4', 'd6d5', 'f4e5', 'g8h8'],
  // Re8+ forces Rd8 (now pinned); Bh3+ makes them block twice, the bishop takes each blocker with check, and Rxd8 mates.
  'r1-backrank': ['e1e8', 'd7d8', 'g2h3', 'd1g4', 'h3g4', 'f6f5', 'g4f5', 'c8b8', 'e8d8'],
  // b6 breaks the wall: axb6 cxb6, and the knight can't cover b8. Kh1 steps out of the knight check, then b8=Q.
  'r1-squire': ['b5b6', 'a7b6', 'c5b6', 'c7d5', 'b6b7', 'd5f4', 'g2h1', 'h8g7', 'b7b8q'],
};

describe('Region 1 battles', () => {
  it('has five battles with unique ids, in order', () => {
    expect(REGION1_BATTLES.map((b) => b.id)).toEqual(['r1-reeds', 'r1-guard', 'r1-trades', 'r1-backrank', 'r1-squire']);
  });

  it('gives White a knight, a bishop and a rook in at least three battles each', () => {
    for (const piece of ['N', 'B', 'R']) {
      const count = REGION1_BATTLES.filter((b) => b.fen.split(' ')[0].includes(piece)).length;
      expect(count, piece).toBeGreaterThanOrEqual(3);
    }
  });

  describe.each(REGION1_BATTLES.map((b) => [b.id, b] as const))('%s', (_id, def) => {
    it('starts legally, White to move, Black not in check', () => {
      const chess = new Chess(def.fen);
      expect(chess.turn()).toBe('w');
      expect(chess.isGameOver()).toBe(false);
      const parts = def.fen.split(' ');
      parts[1] = 'b';
      expect(new Chess(parts.join(' ')).inCheck()).toBe(false);
    });

    it('keeps armies small and the villages empty', () => {
      const chess = new Chess(def.fen);
      const count = (c: 'w' | 'b') => chess.board().flat().filter((p) => p?.color === c).length;
      expect(count('w')).toBeGreaterThanOrEqual(4);
      expect(count('w')).toBeLessThanOrEqual(10);
      expect(count('b')).toBeGreaterThanOrEqual(4);
      expect(count('b')).toBeLessThanOrEqual(10);
      for (const v of def.villages ?? []) expect(chess.get(v), v).toBeFalsy();
    });

    it('has fitting rules and content', () => {
      expect(def.region).toBe('The Bog');
      expect(def.shouts).toBe(true);
      expect(def.reward).toBeGreaterThanOrEqual(15);
      expect(def.reward).toBeLessThanOrEqual(25);
      expect(def.bonuses).toHaveLength(2);
      expect(new Set(def.bonuses.map((b) => b.kind)).size).toBe(2);
      for (const b of def.bonuses) {
        expect(b.gold).toBe(5);
        if (b.kind === 'quick') expect(b.moves).toBeLessThan(moveLimit(def.objective) ?? 0);
      }
      if (def.objective.kind === 'survive') {
        expect(def.villages?.length).toBeGreaterThan(0);
        expect(def.enemy.personality).toBe('raider');
        expect(def.objective.turns).toBeGreaterThanOrEqual(5);
        expect(def.objective.turns).toBeLessThanOrEqual(10);
      } else {
        expect(moveLimit(def.objective)).toBeGreaterThanOrEqual(5);
        expect(moveLimit(def.objective)).toBeLessThanOrEqual(10);
      }
      expect(def.before.length).toBeGreaterThanOrEqual(2);
      expect(def.before.length).toBeLessThanOrEqual(4);
      expect(def.after.length).toBeGreaterThanOrEqual(1);
      expect(def.after.length).toBeLessThanOrEqual(2);
      for (const line of [...def.before, ...def.after]) expect(['companion', 'enemy', 'narrator']).toContain(line.who);
      expect(def.tip.length).toBeGreaterThan(0);
    });

    it('needs more material than any single capture can win', () => {
      // Material is judged after the enemy's reply, but a goal bigger than any one piece still
      // means the battle needs a plan, not a single grab.
      if (def.objective.kind !== 'winMaterial') return;
      const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
      const biggest = Math.max(...new Chess(def.fen).board().flat().filter((p) => p?.color === 'b').map((p) => VALUE[p!.type]));
      expect(def.objective.gain).toBeGreaterThan(biggest);
    });

    it('cannot be won on the first move', () => {
      for (const m of new Chess(def.fen).moves({ verbose: true })) {
        const b = new Battle(def, 0);
        b.playerMove({ from: m.from, to: m.to, promotion: m.promotion });
        expect(b.status, m.san).not.toBe('won');
      }
    });

    it('is won by its scripted line', () => {
      const line = WINNING_LINES[def.id];
      const b = new Battle(def, 0);
      line.forEach((uci, i) => {
        expect(b.status, `before ${uci}`).toBe('playing');
        if (i % 2 === 0) b.playerMove(move(uci));
        else b.enemyMove(uci);
      });
      expect(b.status).toBe('won');
      expect(b.reason).not.toMatch(/draw|stalemate/i);
    });
  });
});
