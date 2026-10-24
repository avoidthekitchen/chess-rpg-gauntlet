import { describe, expect, it } from 'vitest';
import { Chess, type Color, type Square } from 'chess.js';
import pack from './finalePuzzles.json';
import evidence from './finaleEvidence.json';
import { finaleSeeds, finaleRegion } from './finale';
import { COURSE_LESSONS, courseLesson } from '../curriculum';
import { moveAmbush, nextAmbushWave, startAmbush, uciMove, wavePuzzle } from '../ambush';

const puzzles = Object.values(pack).flat();
const sq = (s: string) => s as Square;
const other = (color: Color): Color => color === 'w' ? 'b' : 'w';
function between(from: string, to: string): Square[] {
  const dx = to.charCodeAt(0) - from.charCodeAt(0), dy = +to[1] - +from[1];
  expect(!dx || !dy || Math.abs(dx) === Math.abs(dy)).toBe(true);
  const result: Square[] = [];
  for (let x = from.charCodeAt(0) + Math.sign(dx), y = +from[1] + Math.sign(dy);
    x !== to.charCodeAt(0) || y !== +to[1]; x += Math.sign(dx), y += Math.sign(dy)) result.push(sq(String.fromCharCode(x) + y));
  return result;
}
function blockedLine(chess: Chess, attacker: string, front: string, target: string) {
  const piece = chess.get(sq(attacker))!;
  expect(['b', 'r', 'q']).toContain(piece.type);
  const diagonal = attacker[0] !== target[0] && attacker[1] !== target[1];
  if (piece.type !== 'q') expect(piece.type).toBe(diagonal ? 'b' : 'r');
  expect(between(attacker, target).filter(s => chess.get(s))).toEqual([front]);
}
function opponentTurn(chess: Chess): Chess {
  const fields = chess.fen().split(' ');
  fields[1] = other(chess.turn());
  fields[3] = '-';
  return new Chess(fields.join(' '));
}

describe('Lich King mixed capstone content', () => {
  it('contains two four-wave reviews, with neutral prompts and only delivered prerequisites', () => {
    expect(finaleRegion.id).toBe('finale');
    expect(finaleRegion.kind).toBe('finale');
    expect(finaleRegion.lessons).toEqual(['finale-threshold', 'finale-last-board']);
    expect(puzzles).toHaveLength(18);
    expect(new Set(puzzles.map(p => p.id)).size).toBe(18);
    expect(evidence.positions.map(e => e.id)).toEqual(puzzles.map(p => p.id));
    for (const seed of finaleSeeds) {
      expect(seed.review).toBe(true);
      expect(seed.tag).toBe('mixed');
      expect([seed.title, seed.objective, seed.before, seed.coaching].join(' '))
        .not.toMatch(/\b(pin|skewer|x-ray|discovery|fork|promotion|mate in two|back.rank)\b/i);
      const selected = pack[seed.id as keyof typeof pack];
      expect(selected).toHaveLength(9);
      for (let i = 1; i < selected.length; i += 2) {
        expect(Math.abs(selected[i].rating - selected[i + 1].rating)).toBeLessThanOrEqual(200);
        expect(evidence.positions.find(e => e.id === selected[i].id)?.kind)
          .toBe(evidence.positions.find(e => e.id === selected[i + 1].id)?.kind);
      }
    }
    for (const e of evidence.positions) {
      expect(e.prerequisites.length).toBeGreaterThan(0);
      for (const prerequisite of e.prerequisites) expect(COURSE_LESSONS.some(l => l.id === prerequisite), prerequisite).toBe(true);
    }
    expect(evidence.positions.filter(e => e.slot.startsWith('main')).map(e => e.kind))
      .toEqual(['fork', 'defend', 'passed', 'queenMate', 'between', 'support', 'escape', 'xrayMate']);
  });

  it('reserves every source apart from all earlier chapters, legacy ambushes, bounties, and warm-ups', () => {
    const chapters = import.meta.glob('./region*Puzzles.json', { eager: true, import: 'default' });
    const core = import.meta.glob('../*Puzzles.json', { eager: true, import: 'default' });
    const bounties = import.meta.glob('../../../public/puzzles/**/*.json', { eager: true, import: 'default' });
    const warmups = import.meta.glob('../**/*[wW]arm*.{ts,json}', { eager: true });
    const reserved = JSON.stringify([chapters, core, bounties, warmups]);
    for (const p of puzzles) expect(reserved, p.id).not.toContain(`"${p.id}"`);
  });

  for (const p of puzzles) it(`${p.id}: preserves a legal short published line and quality floor`, () => {
    expect(p.source).toBe(`https://lichess.org/training/${p.id}`);
    expect(p.reason.length).toBeGreaterThan(60);
    expect(p.quality.plays).toBeGreaterThanOrEqual(300);
    expect(p.quality.popularity).toBeGreaterThanOrEqual(85);
    expect(p.quality.rd).toBeLessThanOrEqual(90);
    expect(p.rating).toBeGreaterThanOrEqual(400);
    expect(p.rating).toBeLessThanOrEqual(1300);
    expect([2, 4, 6]).toContain(p.moves.length);
    const chess = new Chess(p.fen);
    const san = p.moves.map(m => chess.move(uciMove(m)).san);
    expect(san).toEqual(evidence.positions.find(e => e.id === p.id)!.san);
    expect(chess.isDraw()).toBe(false);
    if (p.themes.includes('mate')) expect(chess.isCheckmate()).toBe(true);
  });

  for (const e of evidence.positions) it(`${e.id}: proves the previously taught ${e.kind} mechanism`, () => {
    const p = puzzles.find(p => p.id === e.id)!;
    const board = new Chess(p.fen), setup = board.move(uciMove(p.moves[0]));
    const start = new Chess(board.fen()), solver = start.turn(), enemy = other(solver);
    const first = board.move(uciMove(p.moves[1])), after = new Chess(board.fen());
    const rest = p.moves.slice(2).map(m => board.move(uciMove(m)));
    const reply = rest[0], last = rest.at(-1)!;
    if (e.kind === 'skewer') {
      expect(after.isCheck()).toBe(true);
      expect(start.get(sq(e.front))?.type).toBe('k');
      expect(between(first.to, e.target)).toContain(e.front);
      expect(reply.from).toBe(e.front);
      expect(last.from).toBe(first.to);
      expect(last.to).toBe(e.target);
      expect(last.captured).toBe('r');
    }
    if (e.kind === 'fork') {
      expect(first.piece).toBe('n');
      expect(after.isCheck()).toBe(true);
      expect(after.attackers(sq(e.target), solver)).toContain(first.to);
      expect(reply.piece).toBe('k');
      expect(last.from).toBe(first.to);
      expect(last.to).toBe(e.target);
      expect(last.captured).toBe('r');
    }
    if (e.kind === 'defend') {
      expect(start.isCheck()).toBe(false);
      const threats = opponentTurn(start).moves({ verbose: true })
        .filter(m => m.san.endsWith('#')).map(m => m.from + m.to + (m.promotion ?? ''));
      expect(threats.sort()).toEqual([...e.threats].sort());
      expect(threats.length).toBeGreaterThan(0);
      expect(after.isCheck()).toBe(false);
      expect(after.moves().some(m => m.endsWith('#'))).toBe(false);
      expect(reply.san).toContain('+');
      const king = board.board().flat().find(p => p?.color === solver && p.type === 'k')!;
      expect(board.isAttacked(king.square, enemy)).toBe(false);
    }
    if (e.kind === 'passed') {
      const pawn = start.get(sq(e.front))!;
      expect(pawn.type).toBe('p');
      expect(start.board().flat().filter(p => p?.color === enemy && p.type === 'p')
        .some(p => p && Math.abs(p.square.charCodeAt(0) - e.front.charCodeAt(0)) <= 1
          && (solver === 'w' ? +p.square[1] > +e.front[1] : +p.square[1] < +e.front[1]))).toBe(false);
      const solverMoves = [first, ...rest.filter((_, i) => i % 2 === 1)];
      expect(solverMoves).toHaveLength(3);
      solverMoves.forEach((move, i) => {
        expect(move.piece).toBe('p');
        expect(move.captured).toBeUndefined();
        if (i > 0) expect(move.from).toBe(solverMoves[i - 1].to);
      });
      expect(last.promotion).toBe('q');
      expect(last.to).toBe(e.target);
      expect(board.isCheck()).toBe(true);
      expect(rest.filter((_, i) => i % 2 === 0).some(m => m.promotion)).toBe(false);
    }
    if (e.kind === 'queenMate') {
      expect(first.piece).toBe('q');
      expect(after.isCheck()).toBe(true);
      expect(after.isCheckmate()).toBe(false);
      expect(reply.piece).toBe('k');
      expect(last.piece).toBe('q');
      expect(board.isCheckmate()).toBe(true);
    }
    if (e.kind === 'between') {
      expect(setup.captured).toBeTruthy();
      expect(setup.piece).toBe('q');
      expect(first.to).not.toBe(setup.to);
      expect(first.captured).toBe('n');
      expect(after.isCheck()).toBe(true);
      expect(start.attackers(setup.to, enemy)).toContain(first.to);
      expect(reply.to).toBe(first.to);
      expect(reply.captured).toBe(first.piece);
      expect(last.to).toBe(setup.to);
      expect(last.captured).toBe('q');
    }
    if (e.kind === 'escape') {
      blockedLine(start, e.attacker, e.front, e.rear);
      expect(start.get(sq(e.attacker))?.color).toBe(enemy);
      expect(start.get(sq(e.front))?.color).toBe(solver);
      expect(start.get(sq(e.rear))?.type).toBe('k');
      expect(first.from).toBe(e.front);
      expect(first.to).toBe(e.attacker);
      expect(first.captured).toBeTruthy();
      expect(after.isAttacked(sq(e.rear), enemy)).toBe(false);
    }
    if (e.kind === 'support') {
      expect(first.piece).toBe('r');
      expect(after.isCheck()).toBe(true);
      expect(reply.from).toBe(e.front);
      expect(reply.piece).toBe('r');
      expect(reply.captured).toBe('r');
      expect(reply.from[0]).not.toBe(reply.to[0]);
      expect(last.promotion).toBe('q');
      expect(last.to).toBe(e.target);
      // Promoting immediately would allow this same rook to take the new queen.
      const premature = new Chess(start.fen());
      premature.move({ from: last.from, to: last.to, promotion: 'q' });
      expect(premature.moves({ verbose: true }).some(m => m.from === e.front && m.to === e.target && m.captured === 'q')).toBe(true);
      expect(board.moves({ verbose: true }).some(m => m.to === e.target && m.captured === 'q')).toBe(false);
    }
    if (e.kind === 'xrayMate') {
      blockedLine(start, e.attacker, e.front, e.target);
      expect(start.get(sq(e.front))?.color).toBe(enemy);
      expect(first.to).toBe(e.target);
      expect(after.isCheck()).toBe(true);
      expect(after.isCheckmate()).toBe(false);
      expect(reply.from).toBe(e.front);
      expect(reply.to).toBe(e.target);
      expect(reply.captured).toBe(first.piece);
      expect(last.from).toBe(e.attacker);
      expect(last.to).toBe(e.target);
      expect(last.captured).toBe('r');
      expect(board.isCheckmate()).toBe(true);
      expect(['1', '8']).toContain(last.to[1]);
    }
    if (e.kind === 'discovery') {
      blockedLine(start, e.attacker, e.front, e.target);
      expect(start.get(sq(e.front))?.color).toBe(solver);
      expect(first.from).toBe(e.front);
      expect(after.isCheck()).toBe(true);
      expect(after.attackers(sq(e.target), solver)).toContain(e.attacker);
      expect(last.from).toBe(e.attacker);
      expect(last.to).toBe(e.target);
      expect(last.captured).toBe('r');
    }
  });

  it('completes every backup path through the real runner, ending the last encounter in actual mate', () => {
    for (const seed of finaleSeeds) {
      const lesson = courseLesson(seed.id)!;
      expect(lesson.regionId).toBe('finale');
      for (const backup of [undefined, 0, 1, 2, 3]) {
        let run = startAmbush(lesson, 'knight', backup);
        while (run.status !== 'won') {
          if (run.status === 'waveWon') run = nextAmbushWave(lesson, run);
          const p = wavePuzzle(lesson, run);
          run = moveAmbush(lesson, run, p.moves[1 + run.step * 2]).run;
        }
        expect(run.misses).toBe(0);
        expect(run.wave).toBe(3);
        if (seed.id === 'finale-last-board') expect(new Chess(run.fen).isCheckmate()).toBe(true);
      }
    }
  });
});
