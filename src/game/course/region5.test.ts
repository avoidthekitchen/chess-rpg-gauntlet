import { describe, expect, it, vi } from 'vitest';
import { Chess, type Square } from 'chess.js';
import puzzles from './region5Puzzles.json';
import evidence from './region5Evidence.json';
import { region5Seeds, region5Region } from './region5';
import { uciMove } from '../ambush';
import { COURSE_REGIONS, courseLesson, courseRegion } from '../curriculum';
import { newJourney } from '../journey';
import { loadJourney } from '../../journeySave';
import { store } from '../../store';
import { chapterStory } from '../courseStory';

const sources = Object.values(puzzles).flat();
const start = (p: typeof sources[number]) => { const c = new Chess(p.fen); c.move(uciMove(p.moves[0])); return c; };
const byKind = (kind: string) => sources.filter(p => evidence[p.id as keyof typeof evidence].kind === kind);
const coords = (s: string) => [s.charCodeAt(0) - 97, +s[1]];

/** Static pawn-and-king board: count open steps to the next published capture square.
 * Opponent replies are replayed between measurements, not predicted by this BFS.
 */
function kingDistance(c: Chess, from: Square, target: Square): number {
  const enemy = c.turn() === 'w' ? 'b' : 'w';
  const seen = new Set<Square>([from]);
  const queue: [Square, number][] = [[from, 0]];
  for (const [square, distance] of queue) {
    if (square === target) return distance;
    const [file, rank] = coords(square);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const f = file + dx, r = rank + dy;
      if ((!dx && !dy) || f < 0 || f > 7 || r < 1 || r > 8) continue;
      const next = `${String.fromCharCode(97 + f)}${r}` as Square;
      const piece = c.get(next);
      if (seen.has(next) || c.isAttacked(next, enemy) ||
        (piece && next !== target && piece.type !== 'k')) continue;
      seen.add(next);
      queue.push([next, distance + 1]);
    }
  }
  return Infinity;
}


describe('Bone Wardens published source mechanisms', () => {
  it('defines six focused lessons, six review slots and 55 unique sources', () => {
    expect(region5Seeds).toHaveLength(7);
    expect(region5Region.lessons).toEqual(region5Seeds.map(s => s.id));
    expect(sources).toHaveLength(55);
    expect(new Set(sources.map(p => p.id)).size).toBe(55);
    for (const [key, ps] of Object.entries(puzzles)) {
      expect(ps).toHaveLength(key === 'r5-gate-review' ? 13 : 7);
      for (let i = 1; i < ps.length; i += 2) expect(Math.abs(ps[i].rating - ps[i + 1].rating)).toBeLessThanOrEqual(200);
    }
    const review = puzzles['r5-gate-review'];
    for (let i = 1; i < review.length; i += 2) {
      expect(evidence[review[i].id as keyof typeof evidence].kind).toBe(evidence[review[i + 1].id as keyof typeof evidence].kind);
    }
    expect(new Set(review.slice(1).filter((_, i) => i % 2 === 0)
      .map(p => evidence[p.id as keyof typeof evidence].kind))).toEqual(new Set([
        'back-rank', 'king-use', 'endgame-skewers', 'pawn-races', 'underpromotion', 'rook-support',
      ]));
    expect(review.slice(-2).map(p => evidence[p.id as keyof typeof evidence].kind)).toEqual(['rook-support', 'rook-support']);
    expect(review.slice(-2).every(p => p.rating >= 900)).toBe(true);
    expect(region5Seeds.at(-1)?.coaching).not.toMatch(/pawn|rook|knight|promotion|skewer|mate|forcing/i);
  });

  it('loads existing progress completed through rook support before the skewer lesson', () => {
    const save = newJourney();
    save.currentRegion = 'r5';
    save.completed = [
      ...COURSE_REGIONS.slice(0, COURSE_REGIONS.findIndex(region => region.id === 'r5')).flatMap(region => region.lessons),
      'r5-passed-pawns', 'r5-pawn-races', 'r5-king-use', 'r5-rook-support',
    ];
    save.stars = Object.fromEntries(save.completed.map(id => [id, { clean: true, noHint: true }]));
    save.attempts = save.completed.length;
    const get = vi.spyOn(store, 'get').mockReturnValue(JSON.stringify(save));
    const set = vi.spyOn(store, 'set').mockImplementation(() => {});
    try { expect(loadJourney()).toEqual(save); }
    finally { get.mockRestore(); set.mockRestore(); }
  });

  it('registers the chapter and teaches the first-arrival exception before the review', () => {
    expect(courseRegion('r5')).toBe(region5Region);
    expect(courseRegion('r5')?.mapArt).toBe('map-region5');
    for (const seed of region5Seeds) expect(courseLesson(seed.id)?.regionId).toBe('r5');
    expect(courseLesson('r5-pawn-races')?.waves[2]).toMatchObject({ main: { id: 'kf9cP' }, backup: { id: 'AojWU' } });
    for (const starter of ['n', 'b', 'r'] as const) {
      const ending = chapterStory('r5', starter);
      expect(ending[0].speaker).toBe('The Bone Wardens');
      expect(ending[1].speaker).toBe('The Lich King');
      expect(ending.map(s => s.line).join(' ')).toContain('reached the keep');
    }
  });

  it('replays original short lines, quality bounds and recorded SAN without a drawn endpoint', () => {
    for (const p of sources) {
      expect(p.source).toBe(`https://lichess.org/training/${p.id}`);
      expect(p.quality.plays).toBeGreaterThanOrEqual(300);
      expect(p.quality.popularity).toBeGreaterThanOrEqual(85);
      expect(p.quality.rd).toBeLessThanOrEqual(90);
      expect(p.rating).toBeGreaterThanOrEqual(400);
      expect(p.rating).toBeLessThanOrEqual(1300);
      expect(p.moves.length % 2).toBe(0);
      expect(p.moves.length).toBeGreaterThanOrEqual(2);
      expect(p.moves.length).toBeLessThanOrEqual(6);
      const c = new Chess(p.fen);
      expect(p.moves.map(u => c.move(uciMove(u)).san), p.id).toEqual(p.san);
      expect(c.isDraw(), p.id).toBe(false);
    }
  });

  it('advances genuinely passed pawns all the way to promotion', () => {
    for (const p of byKind('passed-pawns')) {
      const c = start(p), from = p.moves[1].slice(0, 2), pawn = c.get(from as Square)!;
      expect(pawn.type).toBe('p');
      const [file, rank] = coords(from);
      const blockers = c.board().flat().filter(other => {
        if (!other || other.color === pawn.color || other.type !== 'p') return false;
        const [f, r] = coords(other.square);
        return Math.abs(f - file) <= 1 && (pawn.color === 'w' ? r > rank : r < rank);
      });
      expect(blockers, p.id).toEqual([]);
      for (let i = 1; i < p.moves.length; i++) {
        const played = c.move(uciMove(p.moves[i]));
        if (i % 2) { expect(played.piece, p.id).toBe('p'); expect(played.from[0]).toBe(from[0]); }
      }
      expect(p.moves.at(-1)?.[4]).toBe('q');
    }
  });

  it('counts real race turns and checks, including a race where the opponent promotes first', () => {
    for (const p of byKind('pawn-races')) {
      const c = start(p), solver = c.turn();
      const events: { ply: number; color: string; check: boolean }[] = [];
      for (let i = 1; i < p.moves.length; i++) {
        const m = c.move(uciMove(p.moves[i]));
        if (m.promotion) events.push({ ply: i, color: m.color, check: c.isCheck() });
      }
      expect(events.at(-1)?.color, p.id).toBe(solver);
      expect(events.at(-1)?.check, p.id).toBe(true);
      if (['kf9cP', 'YyCbR'].includes(p.id)) {
        expect(events).toHaveLength(2);
        expect(events[0].color).not.toBe(solver);
        expect(events[1].ply).toBe(events[0].ply + 1);
      } else {
        expect(events).toHaveLength(1);
        const e = evidence[p.id as keyof typeof evidence] as { opponentPawn: string; solverPawn: string };
        const s = start(p);
        const distance = (sq: string) => s.get(sq as Square)!.color === 'w' ? 8 - +sq[1] : +sq[1] - 1;
        expect(distance(e.solverPawn), p.id).toBe(3);
        expect(distance(e.opponentPawn), p.id).toBe(3);
      }
    }
    const race = sources.find(p => p.id === 'kf9cP')!;
    const c = start(race);
    expect(c.move(uciMove(race.moves[1])).san).toBe('fxe3+');
    expect(c.moves({ verbose: true }).every(m => m.piece === 'k')).toBe(true);
  });

  it('takes a shortest open king route to each next pawn capture in all seven teaching sources', () => {
    for (const p of puzzles['r5-king-use']) {
      const c = start(p);
      for (let i = 1; i < p.moves.length; i++) {
        if (i % 2) {
          const continuation = new Chess(c.fen());
          let target: Square | undefined;
          for (let j = i; j < p.moves.length; j++) {
            const move = continuation.move(uciMove(p.moves[j]));
            if (j % 2 && move.captured === 'p') { target = move.to; break; }
          }
          expect(target, p.id).toBeDefined();
          const from = p.moves[i].slice(0, 2) as Square, to = p.moves[i].slice(2, 4) as Square;
          expect(c.get(from)?.type, p.id).toBe('k');
          const distance = kingDistance(c, from, target!);
          expect(Number.isFinite(distance), p.id).toBe(true);
          expect(kingDistance(c, to, target!), `${p.id} ${p.moves[i]}`).toBe(distance - 1);
        }
        const move = c.move(uciMove(p.moves[i]));
        if (i === p.moves.length - 1) expect(move.captured, p.id).toBe('p');
      }
    }
  });

  it('distinguishes a legal king detour from the shorter route', () => {
    const p = sources.find(p => p.id === '8a9DZ')!, c = start(p);
    expect(c.moves()).toContain('Kd3');
    expect(kingDistance(c, 'c3', 'f5')).toBe(3);
    expect(kingDistance(c, 'd4', 'f5')).toBe(2);
    expect(kingDistance(c, 'd3', 'f5')).toBe(3);
    // The f5 pawn closes e4, so d3 adds a turn despite being a legal move.
    expect(c.isAttacked('e4', 'b')).toBe(true);
  });

  it('gives the stored review example and mate backup distinct board decisions', () => {
    const example = puzzles['r5-gate-review'][0], c = start(example);
    const move = c.move(uciMove(example.moves[1]));
    expect(move.captured).toBe('r');
    expect(c.isCheckmate()).toBe(false);
    expect(c.moves({ verbose: true }).some(reply => reply.to === move.to)).toBe(false);
    const main = sources.find(p => p.id === 'YchKS')!, backup = sources.find(p => p.id === '2cGjV')!;
    expect(start(main).turn()).not.toBe(start(backup).turn());
    for (const p of [main, backup]) {
      const board = start(p); board.move(uciMove(p.moves[1])); expect(board.isCheckmate()).toBe(true);
    }
    expect(main.moves[1]).not.toBe(backup.moves[1]);
  });

  it('uses an actual rook check to clear or deflect the promotion obstacle', () => {
    for (const p of byKind('rook-support')) {
      const c = start(p), promotion = p.moves.find((m, i) => i % 2 === 1 && m.length === 5)!;
      const target = promotion.slice(2, 4) as Square;
      const before = new Chess(c.fen());
      const candidate = before.moves({ verbose: true }).find(m => m.lan === promotion);
      if (candidate) {
        before.move(candidate);
        expect(before.moves({ verbose: true }).some(m => m.to === target && m.piece === 'r'), p.id).toBe(true);
      } else expect(before.get(target)?.type, p.id).toBe('r');
      const rook = c.move(uciMove(p.moves[1]));
      expect(rook.piece, p.id).toBe('r'); expect(c.isCheck(), p.id).toBe(true);
      c.move(uciMove(p.moves[2]));
      if (p.id === 'AuhcO') {
        expect(c.get('c1')).toMatchObject({ type: 'k', color: 'b' });
        expect(c.get('c2')).toMatchObject({ type: 'p', color: 'b' });
      }
      expect(c.move(uciMove(p.moves[3])).promotion, p.id).toBe('q');
      expect(c.moves({ verbose: true }).some(m => m.to === target), p.id).toBe(false);
    }
  });

  it('puts the king between the checking rook and the captured rear rook', () => {
    for (const p of byKind('endgame-skewers')) {
      const c = start(p), e = evidence[p.id as keyof typeof evidence] as { king: string; rearTarget: string };
      const first = c.move(uciMove(p.moves[1]));
      expect(first.piece).toBe('r'); expect(c.isCheck()).toBe(true);
      const [af, ar] = coords(first.to), [kf, kr] = coords(e.king), [tf, tr] = coords(e.rearTarget);
      expect((af === kf && kf === tf && (kr - ar) * (tr - kr) > 0) ||
        (ar === kr && kr === tr && (kf - af) * (tf - kf) > 0), p.id).toBe(true);
      expect(c.get(e.rearTarget as Square)?.type).toBe('r');
      expect(c.move(uciMove(p.moves[2])).piece).toBe('k');
      expect(c.move(uciMove(p.moves[3])).captured).toBe('r');
    }
  });

  it('proves knight promotion is the only legal mating move and replays sample alternative replies', () => {
    for (const p of byKind('underpromotion')) {
      const e = evidence[p.id as keyof typeof evidence] as {
        decisiveMove: string; alternatives: Record<string, { move: string; mate: boolean; sampleReply?: string }>;
      };
      const board = start(p);
      const matingMoves = board.moves({ verbose: true }).filter(move => {
        board.move(move); const mates = board.isCheckmate(); board.undo(); return mates;
      }).map(move => move.lan);
      expect(matingMoves, p.id).toEqual([e.decisiveMove]);
      for (const piece of ['q', 'r', 'b', 'n']) {
        const c = start(p), alternative = e.alternatives[piece];
        c.move(uciMove(alternative.move));
        expect(c.isCheckmate(), `${p.id} ${piece}`).toBe(piece === 'n');
        expect(alternative.mate).toBe(piece === 'n');
        if (piece !== 'n') {
          expect(c.moves().length).toBeGreaterThan(0);
          expect(alternative.sampleReply).toBeDefined();
          const reply = new Chess(c.fen());
          expect(() => reply.move(uciMove(alternative.sampleReply!))).not.toThrow();
        }
      }
    }
  });
});
