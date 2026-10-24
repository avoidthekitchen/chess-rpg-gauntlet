import { describe, expect, it } from 'vitest';
import { Chess, type Color, type Square } from 'chess.js';
import pack from './region3Puzzles.json';
import evidence from './region3Evidence.json';
import { region3Seeds, region3Region } from './region3';
import { isDoubleCheck, uciMove } from '../ambush';

const puzzles = Object.values(pack).flat();
const square = (s: string) => s as Square;
const other = (color: Color): Color => color === 'w' ? 'b' : 'w';
function between(from: string, to: string): Square[] {
  const dx = to.charCodeAt(0) - from.charCodeAt(0), dy = +to[1] - +from[1];
  expect(!dx || !dy || Math.abs(dx) === Math.abs(dy)).toBe(true);
  const result: Square[] = [];
  for (let x = from.charCodeAt(0) + Math.sign(dx), y = +from[1] + Math.sign(dy);
    x !== to.charCodeAt(0) || y !== +to[1]; x += Math.sign(dx), y += Math.sign(dy)) {
    result.push(square(String.fromCharCode(x) + y));
  }
  return result;
}
function blockedLine(chess: Chess, attacker: string, blocker: string, target: string) {
  const piece = chess.get(square(attacker))!;
  expect(['b', 'r', 'q']).toContain(piece.type);
  const diagonal = attacker[0] !== target[0] && attacker[1] !== target[1];
  if (piece.type !== 'q') expect(piece.type).toBe(diagonal ? 'b' : 'r');
  expect(between(attacker, target).filter(s => chess.get(s))).toEqual([blocker]);
}

describe('Shadow Cult published positions', () => {
  it('provides six guided lessons and a seven-wave neutral review with distinct sources', () => {
    expect(region3Seeds).toHaveLength(7);
    expect(region3Region.lessons).toEqual(region3Seeds.map(s => s.id));
    expect(puzzles).toHaveLength(57);
    expect(new Set(puzzles.map(p => p.id)).size).toBe(57);
    expect(evidence.positions.map(p => p.id)).toEqual(puzzles.map(p => p.id));
    for (const seed of region3Seeds) {
      const selected = pack[seed.id as keyof typeof pack];
      expect(selected).toHaveLength(seed.review ? 15 : 7);
      if (!seed.review) for (const p of selected) expect(p.themes, p.id).toContain(seed.tag);
      for (let i = 1; i < selected.length; i += 2) {
        expect(Math.abs(selected[i].rating - selected[i + 1].rating)).toBeLessThanOrEqual(200);
      }
    }
    const review = region3Seeds.at(-1)!;
    expect(review.tag).toBe('mixed');
    expect([review.title, review.objective, review.before, review.coaching].join(' '))
      .not.toMatch(/\b(pin|skewer|x-ray|discovery|double check|fork|mate)\b/i);
    const reviewEvidence = evidence.positions.filter(p => p.lesson === review.id).slice(1);
    expect(reviewEvidence.map(p => p.kind).sort()).toEqual([
      'pin', 'pin', 'escape', 'escape', 'skewer', 'skewer', 'xray', 'xray',
      'discovery', 'double', 'fork', 'fork', 'mate', 'mate',
    ].sort());
    expect(reviewEvidence.filter((_, i) => i % 2 === 0).map(p => p.kind))
      .not.toEqual(['pin', 'escape', 'skewer', 'xray', 'discovery', 'fork', 'mate']);
  });

  for (const p of puzzles) it(`${p.id}: preserves a legal short line, quality floor, and source identity`, () => {
    expect(p.id.charCodeAt(0) % 3).toBe(0);
    expect(p.source).toBe(`https://lichess.org/training/${p.id}`);
    expect(p.reason.length).toBeGreaterThan(80);
    expect(p.rating).toBeGreaterThanOrEqual(400);
    expect(p.rating).toBeLessThanOrEqual(1300);
    expect(p.quality.rd).toBeLessThanOrEqual(90);
    expect(p.quality.popularity).toBeGreaterThanOrEqual(85);
    expect(p.quality.plays).toBeGreaterThanOrEqual(300);
    expect([2, 4, 6]).toContain(p.moves.length);
    const chess = new Chess(p.fen), sans: string[] = [];
    for (const move of p.moves) sans.push(chess.move(uciMove(move)).san);
    expect(sans).toEqual(evidence.positions.find(e => e.id === p.id)!.san);
    expect(chess.isDraw()).toBe(false);
    if (p.themes.includes('mate')) expect(chess.isCheckmate()).toBe(true);
  });

  for (const e of evidence.positions) it(`${e.id}: demonstrates ${e.kind} on the actual board`, () => {
    const p = puzzles.find(p => p.id === e.id)!;
    const start = new Chess(p.fen);
    const setup = start.move(uciMove(p.moves[0]));
    const solver = start.turn(), enemy = other(solver);
    const after = new Chess(start.fen()), first = after.move(uciMove(p.moves[1]));
    const completed = new Chess(after.fen());
    const reply = p.moves[2] ? completed.move(uciMove(p.moves[2])) : undefined;
    const finish = p.moves[3] ? completed.move(uciMove(p.moves[3])) : undefined;
    if (e.kind === 'pin' || e.kind === 'escape') {
      blockedLine(start, e.attacker, e.front, e.rear);
      const pinner = start.get(square(e.attacker))!;
      const pinned = start.get(square(e.front))!;
      const rear = start.get(square(e.rear))!;
      expect(pinner.color).not.toBe(pinned.color);
      expect(rear.color).toBe(pinned.color);
      if (e.kind === 'escape') {
        expect(rear.type).toBe('k');
        if (e.lesson === 'r3-cult-review') {
          expect(setup.captured && setup.to === first.to).toBeFalsy();
        }
        expect(pinned.color).toBe(solver);
        expect(first.from).toBe(e.front);
        expect(first.to).toBe(e.attacker);
        expect(first.captured).toBe(pinner.type);
        expect(after.isAttacked(square(e.rear), enemy)).toBe(false);
      } else {
        expect(rear.type).toBe('k');
        expect(pinner.color).toBe(solver);
        expect(start.attackers(first.to, enemy)).toContain(e.front);
        expect(after.moves({ verbose: true }).some(m => m.from === e.front && m.to === first.to)).toBe(false);
      }
    }
    if (e.id === 'Kp2Gw') {
      // The queen, not the recapturing pawn, is the bishop's sole defender.
      expect(start.get('e6')).toMatchObject({ type: 'b', color: enemy });
      expect(start.attackers('e6', enemy)).toEqual(['e5']);
      const premature = new Chess(start.fen());
      expect(premature.move('Rxe6').captured).toBe('b');
      expect(premature.move('Qxe6')).toMatchObject({ from: 'e5', captured: 'r' });
      expect(first).toMatchObject({ to: 'e5', captured: 'q' });
      expect(after.attackers('e6', enemy)).toEqual([]);
      const beforeFinish = new Chess(after.fen());
      expect(beforeFinish.move(uciMove(p.moves[2]))).toMatchObject({ from: 'd6', to: 'e5', piece: 'p' });
      expect(beforeFinish.attackers('e6', enemy)).toEqual([]);
      expect(finish).toMatchObject({ to: 'e6', captured: 'b' });
      expect(completed.moves({ verbose: true }).some(m => m.to === 'e6' && m.captured)).toBe(false);
    }
    if (e.kind === 'create-pin') {
      // The bishop creates an absolute pin; the queen still defends the rook.
      blockedLine(after, e.attacker, e.front, e.rear);
      expect(first.to).toBe(e.attacker);
      expect(after.get(square(e.rear))?.type).toBe('k');
      expect(after.moves({ square: square(e.front) })).toHaveLength(0);
      expect(after.attackers(square(e.front), solver).sort()).toEqual(['e3', 'f8']);
      const defended = new Chess(after.fen());
      defended.move(uciMove(p.moves[2]));
      expect(defended.attackers(square(e.front), enemy)).toContain('e2');
      expect(finish?.to).toBe(e.front);
      expect(finish?.captured).toBe('r');
      // Verify the explanatory exchange without extending the published puzzle.
      const exchange = new Chess(completed.fen());
      expect(exchange.move('Qxf2').captured).toBe('b');
      expect(exchange.move('Rxf2').captured).toBe('q');
      expect(exchange.move('Kxf2').captured).toBe('r');
    }

    if (e.kind === 'skewer') {
      expect(after.isCheck()).toBe(true);
      expect(start.get(square(e.front))?.type).toBe('k');
      expect(between(e.attacker, e.rear)).toContain(e.front);
      expect(reply?.from).toBe(e.front);
      expect(reply?.piece).toBe('k');
      expect(finish?.from).toBe(e.attacker);
      expect(finish?.to).toBe(e.rear);
      expect(finish?.captured).toBeTruthy();
    }
    if (e.kind === 'xray') {
      blockedLine(start, e.attacker, e.front, e.target);
      expect(start.get(square(e.attacker))?.color).toBe(solver);
      expect(start.get(square(e.front))?.color).toBe(enemy);
      expect(first.to).toBe(e.target);
      expect(reply?.from).toBe(e.front);
      expect(reply?.to).toBe(e.target);
      expect(reply?.captured).toBe(first.piece);
      expect(finish?.from).toBe(e.attacker);
      expect(finish?.to).toBe(e.target);
      expect(finish?.captured).toBe(reply?.piece);
    }
    if (e.kind === 'discovery' || e.kind === 'double') {
      blockedLine(start, e.attacker, e.front, e.target);
      expect(start.get(square(e.front))?.color).toBe(solver);
      expect(start.get(square(e.target))?.color).toBe(enemy);
      expect(first.from).toBe(e.front);
      expect(after.isCheck()).toBe(true);
      expect(after.attackers(square(e.target), solver)).toContain(e.attacker);
      if (e.kind === 'double') {
        expect(start.get(square(e.target))?.type).toBe('k');
        expect(isDoubleCheck(after)).toBe(true);
        expect(after.attackers(square(e.target), solver)).toContain(first.to);
        if (reply) expect(reply.piece).toBe('k');
      } else {
        expect(isDoubleCheck(after)).toBe(false);
        expect(finish?.from).toBe(e.attacker);
        expect(finish?.to).toBe(e.target);
        expect(finish?.captured).toBeTruthy();
        expect(completed.moves({ verbose: true }).some(m => m.to === finish!.to && m.captured)).toBe(false);
      }
    }
    if (e.kind === 'fork') {
      expect(first.piece).toBe('n');
      expect(after.isCheck()).toBe(true);
      expect(after.attackers(square(e.target), solver)).toContain(first.to);
      expect(reply?.piece).toBe('k');
      expect(finish?.to).toBe(e.target);
      expect(finish?.captured).toBe('r');
    }
    if (e.kind === 'mate') {
      expect(after.isCheck()).toBe(true);
      expect(after.isCheckmate()).toBe(false);
      expect(completed.isCheckmate()).toBe(true);
    }
  });
});
