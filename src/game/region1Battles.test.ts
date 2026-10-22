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
 * One winning line per battle, White and Black alternating. Every Black move is the goblins'
 * shout (they must keep it) or a forced reply, as seen in verification games.
 */
const WINNING_LINES: Record<string, string[]> = {
  // They shout Bxf3: Ng5 dodges and hits f7, Bxf7+ and Nxf3 win two pawns and the bishop,
  // then the second wave: Bd5 pins the knight to the rook and Bxc6 collects it.
  'r1-reeds': ['f3g5', 'g4f3', 'c4f7', 'g8f8', 'g5f3', 'h7h6', 'f7d5', 'a8c8', 'd5c6'],
  // The goblins promised Nxb2, so Bxg7 is safe: the knight lands on b2 and is taken back.
  'r1-guard': ['b2g7', 'a4b2', 'g7b2', 'e4e3', 'd2f3', 'e3e2', 'd1b1', 'e2e1q', 'b1e1', 'c5c4', 'e1e5', 'c4c3', 'b2c3', 'f7f6'],
  // Na4 keeps c3 guarded, so the shouted Rc3 drops the rook; then f4 chases the knight
  // and the cheapest attacker, a pawn, takes it.
  'r1-trades': ['c3a4', 'c8c3', 'a4c3', 'a7a6', 'f2f4', 'd6d5', 'f4e5'],
  // Bf5 and Bxc8 remove the rook guard, Rd8 forces the knight to block, and Rxe8 mates.
  'r1-backrank': ['d3f5', 'a7a6', 'f5c8', 'b6b5', 'c8f5', 'c5c4', 'd1d8', 'f6e8', 'd8e8'],
  'r1-squire': ['d3g6', 'c6b8', 'c5c6', 'h5h4', 'c6c7', 'h4h3', 'g2g3', 'g8g7', 'c7c8q'],
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
      // winMaterial is judged right after a capture, before any recapture, so one greedy grab
      // of a guarded piece must never be enough on its own.
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
