import { describe, expect, it } from 'vitest';
import { Chess, type Square } from 'chess.js';
import puzzles from './region4Puzzles.json';
import rawEvidence from './region4Evidence.json';
import { region4Seeds, region4Region } from './region4';
import { uciMove } from '../ambush';
import { PIECE_VALUE as value } from '../material';

const all = Object.values(puzzles).flat();
// Evidence records board facts; every claim below is recomputed from the source line.
const evidence = rawEvidence as Record<string, { skill: string; guard?: string; king?: string; checkingSquare?: string; pinner?: string[]; immediateRecapture?: string; threats?: string[]; threatSAN?: string[] }>;
const otherSide = (color: 'w' | 'b') => color === 'w' ? 'b' : 'w';
const opponentTurn = (start: Chess) => {
  const fen = start.fen().split(' ');
  fen[1] = otherSide(start.turn());
  fen[3] = '-';
  return new Chess(fen.join(' '));
};

describe('Iron Legion published teaching evidence', () => {
  it('has six focused lessons and a neutral six-wave review with 55 distinct sources', () => {
    expect(region4Region.lessons).toEqual(region4Seeds.map(s => s.id));
    expect(region4Seeds).toHaveLength(7);
    expect(all).toHaveLength(55);
    expect(new Set(all.map(p => p.id)).size).toBe(55);
    for (const seed of region4Seeds) {
      const ps = puzzles[seed.id as keyof typeof puzzles];
      expect(ps).toHaveLength(seed.review ? 13 : 7);
      if (!seed.review) for (const p of ps) expect(p.themes, p.id).toContain(seed.tag);
      for (let i = 1; i < ps.length; i += 2) {
        expect(evidence[ps[i].id].skill).toBe(evidence[ps[i + 1].id].skill);
      }
    }
    const review = region4Seeds.at(-1)!;
    expect(`${review.title} ${review.objective} ${review.coaching} ${review.before}`)
      .not.toMatch(/deflect|intermediate|exposed|pinned|develop|file tactic/i);
    const skills = puzzles['r4-legion-review'].filter((_, i) => i % 2 === 1).map(p => evidence[p.id].skill);
    expect(new Set(skills)).toEqual(new Set(['develop', 'file', 'exposed', 'deflect', 'between', 'defend']));
    expect(skills).not.toEqual(['develop', 'file', 'exposed', 'deflect', 'between', 'defend']);
    for (const p of puzzles['r4-legion-review'].filter(p => evidence[p.id].skill === 'file')) {
      expect(evidence[p.id].pinner?.length, `${p.id}: file entry also revisits an absolute pin`).toBeGreaterThan(0);
    }
    for (const p of puzzles['r4-legion-review'].filter(p => evidence[p.id].skill === 'defend')) {
      expect(p.rating, p.id).toBeLessThanOrEqual(1100);
    }
  });

  it('keeps source SAN and evidence aligned with every published line', () => {
    for (const p of all) {
      const board = new Chess(p.fen);
      expect(p.moves.map(move => board.move(uciMove(move)).san), p.id).toEqual(p.san);
      expect(evidence[p.id], p.id).toBeDefined();
    }
  });

  it('distinguishes a non-capturing parry from the defence lesson’s material goal', () => {
    const p = puzzles['r4-defend'].find(p => p.id === 'OhR2Q')!;
    const board = new Chess(p.fen);
    board.move(uciMove(p.moves[0]));
    const parry = board.move('Rf1');
    expect(parry.captured).toBeUndefined();
    expect(board.moves().some(san => san.endsWith('#'))).toBe(false);
    const lesson = region4Seeds.find(seed => seed.id === 'r4-defend')!;
    expect(lesson.objective).toContain('capture that also wins material');
    expect(lesson.coaching).toContain('stops their mate and wins material');
  });

  it('proves the mechanism in examples, main positions and every backup', () => {
    for (const p of all) {
      const c = new Chess(p.fen);
      const setup = c.move(uciMove(p.moves[0]));
      const start = new Chess(c.fen());
      const first = c.move(uciMove(p.moves[1]));
      const after = new Chess(c.fen());
      const replies = p.moves.slice(2).map(m => c.move(uciMove(m)));
      const final = replies.at(-1);
      const enemy = otherSide(first.color);
      const ev = evidence[p.id];
      if (ev.skill === 'develop') {
        expect(first.piece, p.id).toBe('b');
        expect(first.color === 'w' ? ['c1', 'f1'] : ['c8', 'f8']).toContain(first.from);
        expect(after.isCheck(), p.id).toBe(true);
      }
      if (ev.skill === 'file') {
        expect(['r', 'q']).toContain(first.piece);
        expect(first.from[0]).toBe(first.to[0]);
        expect(Math.abs(Number(first.from[1]) - Number(first.to[1]))).toBeGreaterThanOrEqual(3);
        expect(after.isCheck(), p.id).toBe(true);
        expect(c.isCheckmate(), p.id).toBe(true);
      }
      if (ev.skill === 'exposed') {
        expect(first.captured).toBeUndefined();
        expect(after.moves({ verbose: true }).some(m => m.to === first.to && m.captured), p.id).toBe(false);
        for (const move of [first, ...replies.filter((_, i) => i % 2 === 1)]) expect(move.san, p.id).toMatch(/[+#]/);
        const sequence = new Chess(start.fen());
        p.moves.slice(1).forEach((uci, i) => {
          const move = sequence.move(uciMove(uci));
          if (i % 2 === 0) expect(sequence.moves({ verbose: true }).some(reply => reply.to === move.to && reply.captured), p.id).toBe(false);
        });
        expect(c.isCheckmate(), p.id).toBe(true);
      }
      if (ev.skill === 'deflect') {
        expect(start.attackers(final!.to, enemy), p.id).toContain(replies[0].from);
        expect(after.isCheck(), p.id).toBe(true);
        expect(replies[0].to).toBe(first.to);
        expect(replies[0].captured).toBe(first.piece);
        expect(final!.captured).toBeTruthy();
        expect(value[first.captured ?? 'k'] - value[replies[0].captured!] + value[final!.captured!], p.id).toBeGreaterThan(0);
        expect(c.attackers(final!.to, enemy), p.id).not.toContain(replies[0].to);
      }
      if (ev.skill === 'between') {
        expect(setup.captured, p.id).toBeTruthy();
        expect(start.moves({ verbose: true }).some(m => m.to === setup.to && m.captured), p.id).toBe(true);
        expect(first.to).not.toBe(setup.to);
        expect(first.captured, p.id).toBeTruthy();
        expect(after.isCheck(), p.id).toBe(true);
        expect(final!.to).toBe(setup.to);
        expect(final!.captured).toBe(setup.piece);
        expect(value[first.captured!] - value[replies[0].captured ?? 'k'] + value[final!.captured!], p.id).toBeGreaterThan(0);
        // Compare immediate recapture with the opponent’s highest-value legal capture.
        // Compare the material at each short line's endpoint, not a claim about a complete game.
        const early = new Chess(start.fen());
        const recapture = early.move(uciMove(ev.immediateRecapture as string));
        expect(recapture.to, p.id).toBe(setup.to);
        const bestCapture = Math.max(0, ...early.moves({ verbose: true }).map(move => value[move.captured ?? 'k']));
        const immediateGain = value[recapture.captured ?? 'k'] - bestCapture;
        const publishedGain = value[first.captured!] - value[replies[0].captured ?? 'k'] + value[final!.captured!];
        expect(publishedGain, `${p.id}: published move order versus immediate recapture`).toBeGreaterThan(immediateGain);
      }
      if (ev.skill === 'defend') {
        expect(start.isCheck(), p.id).toBe(false);
        const threats = opponentTurn(start).moves({ verbose: true }).filter(move => move.san.endsWith('#'));
        expect(threats.length, p.id).toBeGreaterThan(0);
        expect(threats.map(move => move.lan).sort(), p.id).toEqual([...ev.threats!].sort());
        expect(threats.map(move => move.san).sort(), p.id).toEqual([...ev.threatSAN!].sort());
        expect(first.captured, p.id).toBeTruthy();
        expect(after.isCheck(), p.id).toBe(false);
        expect(after.moves().some(san => san.endsWith('#')), p.id).toBe(false);
        expect(replies[0].san, p.id).toMatch(/\+$/);
        expect(c.isCheck(), p.id).toBe(false);
        const netGain = [first, ...replies].reduce((sum, move, i) => sum + (i % 2 ? -1 : 1) * value[move.captured ?? 'k'], 0);
        expect(netGain, `${p.id}: material gained through the published reply`).toBeGreaterThan(0);
      }
      if (ev.skill === 'pin' || ev.pinner) {
        const guard = ev.guard as Square;
        const king = ev.king as Square;
        const target = (ev.checkingSquare ?? first.to) as Square;
        expect(target, `${p.id}: the pinned guard cannot capture the checking piece`).toBe(first.to);
        expect(start.attackers(target, enemy), p.id).toContain(guard);
        const unpinned = new Chess(start.fen());
        expect(unpinned.attackers(king, first.color), p.id).toHaveLength(0);
        unpinned.remove(guard);
        expect(unpinned.attackers(king, first.color).length, p.id).toBeGreaterThan(0);
        expect(after.moves({ verbose: true }).some(m => m.from === guard && m.to === target), p.id).toBe(false);
        expect(after.isCheckmate(), p.id).toBe(true);
      }
    }
  });
});
