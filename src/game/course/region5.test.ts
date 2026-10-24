import { describe, expect, it } from 'vitest';
import { Chess, type Square } from 'chess.js';
import puzzles from './region5Puzzles.json';
import evidence from './region5Evidence.json';
import { region5Seeds, region5Region } from './region5';
import { uciMove } from '../ambush';
import { courseLesson, courseRegion } from '../curriculum';
import { chapterStory } from '../courseStory';

const sources = Object.values(puzzles).flat();
const start = (p: typeof sources[number]) => { const c = new Chess(p.fen); c.move(uciMove(p.moves[0])); return c; };
const byKind = (kind: string) => sources.filter(p => evidence[p.id as keyof typeof evidence].kind === kind);
const coords = (s: string) => [s.charCodeAt(0) - 97, +s[1]];

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
    expect(region5Seeds.at(-1)?.coaching).not.toMatch(/pawn|rook|knight|promotion|skewer|mate/i);
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

  it('uses legal king entry squares and ends by capturing an enemy pawn', () => {
    for (const p of byKind('king-use')) {
      const c = start(p);
      for (let i = 1; i < p.moves.length; i++) {
        const m = c.move(uciMove(p.moves[i]));
        if (!(i % 2)) continue;
        expect(m.piece, p.id).toBe('k');
        expect(c.isAttacked(m.to, c.turn()), p.id).toBe(false);
        const other = c.board().flat().find(x => x?.type === 'k' && x.color !== m.color)!;
        const [a, b] = coords(m.to), [x, y] = coords(other.square);
        expect(Math.max(Math.abs(a - x), Math.abs(b - y)), p.id).toBeGreaterThan(1);
        if (i === p.moves.length - 1) expect(m.captured, p.id).toBe('p');
      }
    }
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

  it('proves only knight promotion mates now and replays every recorded alternative reply', () => {
    for (const p of byKind('underpromotion')) {
      const e = evidence[p.id as keyof typeof evidence] as { alternatives: Record<string, { move: string; mate: boolean; legalReplies: string[] }> };
      for (const piece of ['q', 'r', 'b', 'n']) {
        const c = start(p), alternative = e.alternatives[piece];
        c.move(uciMove(alternative.move));
        expect(c.isCheckmate(), `${p.id} ${piece}`).toBe(piece === 'n');
        expect(alternative.mate).toBe(piece === 'n');
        expect(c.moves({ verbose: true }).map(m => m.lan)).toEqual(alternative.legalReplies);
        if (piece !== 'n') {
          expect(alternative.legalReplies.length).toBeGreaterThan(0);
          const reply = new Chess(c.fen());
          expect(() => reply.move(uciMove(alternative.legalReplies[0]))).not.toThrow();
        }
      }
    }
  });
});
