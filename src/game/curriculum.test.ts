import { describe, expect, it } from 'vitest';
import { Chess, type Square } from 'chess.js';
import mateBounties from '../../public/puzzles/region1/mateIn1.json';
import hangingBounties from '../../public/puzzles/region1/hangingPiece.json';
import { COURSE_LESSONS, COURSE_REGIONS, courseLesson, courseRegion } from './curriculum';
import { isDoubleCheck, moveAmbush, nextAmbushWave, startAmbush, uciMove, wavePuzzle } from './ambush';
import { puzzleStart } from './bounty';

const allPuzzles = COURSE_LESSONS.flatMap(l => [l.show, ...l.waves.flatMap(w => [w.main, w.backup])]);
const value: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

describe('published curriculum', () => {
  it('links complete chapters while preserving the accepted first two chapters', () => {
    expect(COURSE_REGIONS.slice(0, 2).map(r => r.id)).toEqual(['r1', 'r2']);
    expect(new Set(COURSE_LESSONS.map(l => l.id)).size).toBe(COURSE_LESSONS.length);
    for (const region of COURSE_REGIONS) {
      expect(courseRegion(region.id)).toBe(region);
      const original = ['r1', 'r2'].includes(region.id);
      expect(region.lessons.length).toBeGreaterThanOrEqual(2);
      if (original) expect(region.lessons).toHaveLength(6);
      region.lessons.forEach((id, i) => {
        const lesson = courseLesson(id)!;
        expect(lesson.regionId).toBe(region.id);
        expect(lesson.review).toBe(i === region.lessons.length - 1);
        if (original) expect(lesson.waves).toHaveLength(i === 5 ? 4 : 3);
        expect(lesson.objective.length).toBeGreaterThan(15);
        expect(lesson.takeaway.length).toBeGreaterThan(15);
      });
    }
    expect(COURSE_REGIONS.flatMap(r => r.lessons).sort()).toEqual(COURSE_LESSONS.map(l => l.id).sort());
    expect(courseLesson('missing')).toBeUndefined();
    expect(courseRegion('missing')).toBeUndefined();
  });

  it('reserves distinct sources across every chapter and excludes existing bounties', () => {
    const original = COURSE_LESSONS.filter(l => ['r1', 'r2'].includes(l.regionId)).flatMap(l => [l.show, ...l.waves.flatMap(w => [w.main, w.backup])]);
    expect(original).toHaveLength(88);
    expect(new Set(allPuzzles.map(p => p.id)).size).toBe(allPuzzles.length);
    const bountyIds = new Set([...mateBounties, ...hangingBounties].map(p => p.id));
    for (const p of allPuzzles) expect(bountyIds.has(p.id), p.id).toBe(false);
  });

  it('keeps backups near their main puzzle and regional reviews genuinely mixed', () => {
    const meanRating = (regionId: string) => {
      const ps = COURSE_LESSONS.filter(l => l.regionId === regionId).flatMap(l => l.waves.map(w => w.main));
      return ps.reduce((sum, p) => sum + p.rating, 0) / ps.length;
    };
    expect(meanRating('r2')).toBeGreaterThan(meanRating('r1'));
    for (const lesson of COURSE_LESSONS) {
      for (const wave of lesson.waves) expect(Math.abs(wave.main.rating - wave.backup.rating)).toBeLessThanOrEqual(200);
    }
    for (const [id, themes] of [
      ['r1-bog-review', ['hangingPiece', 'backRankMate', 'promotion']],
      ['r2-road-review', ['fork', 'doubleCheck', 'capturingDefender', 'mateIn2']],
    ] as const) {
      const lesson = courseLesson(id)!;
      expect(lesson.tag).toBe('mixed');
      const included = new Set(lesson.waves.flatMap(w => [...w.main.themes, ...w.backup.themes]));
      for (const theme of themes) expect(included.has(theme)).toBe(true);
    }
  });

  it('preserves legal short source lines and records quality, provenance and curation rationale', () => {
    for (const p of allPuzzles) {
      expect(p.source).toBe(`https://lichess.org/training/${p.id}`);
      expect(p.reason.length).toBeGreaterThan(35);
      expect(p.quality.rd).toBeLessThanOrEqual(90);
      expect(p.quality.popularity).toBeGreaterThanOrEqual(85);
      expect(p.quality.plays).toBeGreaterThanOrEqual(300);
      expect(p.rating).toBeGreaterThanOrEqual(400);
      expect(p.rating).toBeLessThanOrEqual(1300);
      expect(p.moves.length % 2).toBe(0);
      expect(p.moves.length).toBeGreaterThanOrEqual(2);
      expect(p.moves.length).toBeLessThanOrEqual(6);
      const c = new Chess(p.fen);
      for (const move of p.moves) expect(() => c.move(uciMove(move)), p.id).not.toThrow();
      expect(c.isDraw(), `${p.id} unexpectedly ends drawn`).toBe(false);
      if (p.themes.includes('mate')) expect(c.isCheckmate(), p.id).toBe(true);
    }
  });

  it('keeps every loose-piece capture safe through the final move, including backups', () => {
    const lesson = courseLesson('r1-loose-pieces')!;
    for (const p of [lesson.show, ...lesson.waves.flatMap(w => [w.main, w.backup])]) {
      const c = new Chess(p.fen);
      p.moves.forEach((move, i) => {
        const played = c.move(uciMove(move));
        if (i % 2 === 0) return;
        expect(played.captured, `${p.id} solver move ${played.san}`).toBeTruthy();
        expect(c.moves({ verbose: true }).some(reply => reply.to === played.to),
          `${p.id} immediate recapture after ${played.san}`).toBe(false);
      });
    }
  });

  it('keeps sources aligned with the actual teaching move, not only a theme tag', () => {
    for (const lesson of COURSE_LESSONS.filter(l => !l.review)) {
      for (const p of [lesson.show, ...lesson.waves.flatMap(w => [w.main, w.backup])]) {
        expect(p.themes, p.id).toContain(lesson.tag);
        const start = new Chess(puzzleStart(p).fen);
        const first = p.moves[1];
        const last = p.moves.at(-1)!;
        const after = new Chess(start.fen());
        const played = after.move(uciMove(first));
        if (lesson.id === 'r1-safe-captures') {
          const reply = after.move(uciMove(p.moves[2]));
          const finish = after.move(uciMove(p.moves[3]));
          expect(played.captured, p.id).toBeTruthy();
          expect(reply.captured, p.id).toBeTruthy();
          expect(finish.captured, p.id).toBeTruthy();
          expect(value[played.captured!] - value[reply.captured!] + value[finish.captured!], p.id).toBeGreaterThan(0);
        }
        if (lesson.id === 'r1-answer-check') {
          expect(start.isCheck(), p.id).toBe(true);
          const king = start.board().flat().find(piece => piece?.color === start.turn() && piece.type === 'k')!;
          expect(start.attackers(king.square, start.turn() === 'w' ? 'b' : 'w'), p.id).toContain(played.to);
          expect(played.captured, p.id).toBeTruthy();
        }
        if (lesson.id === 'r1-back-rank') {
          expect(played.piece).toBe('r');
          expect(['1', '8']).toContain(played.to[1]);
          expect(after.isCheckmate(), p.id).toBe(true);
        }
        if (lesson.id === 'r1-promotion') {
          expect(played.promotion, p.id).toBe('q');
          expect(after.isCheckmate(), p.id).toBe(true);
        }
        if (['r2-knight-forks', 'r2-double-attacks'].includes(lesson.id)) {
          expect(played.piece).toBe(lesson.id === 'r2-knight-forks' ? 'n' : 'q');
          expect(after.isCheck(), p.id).toBe(true);
          expect(after.attackers(last.slice(2, 4) as Square, played.color), p.id).toContain(played.to);
          after.move(uciMove(p.moves[2]));
          expect(after.move(uciMove(last)).captured, p.id).toBeTruthy();
        }
        if (lesson.id === 'r2-two-at-once') expect(isDoubleCheck(after), p.id).toBe(true);
        if (lesson.id === 'r2-remove-defender') {
          expect(played.captured, p.id).toBeTruthy();
          expect(start.attackers(last.slice(2, 4) as Square, played.color === 'w' ? 'b' : 'w'), p.id).toContain(played.to);
          after.move(uciMove(p.moves[2]));
          expect(after.move(uciMove(last)).captured, p.id).toBeTruthy();
        }
        if (lesson.id === 'r2-mate-in-two') {
          expect(p.moves).toHaveLength(4);
          expect(after.isCheckmate(), p.id).toBe(false);
          after.move(uciMove(p.moves[2]));
          after.move(uciMove(last));
          expect(after.isCheckmate(), p.id).toBe(true);
        }
      }
    }
  });

  it('completes every encounter through its actual rules, including every backup wave', () => {
    for (const lesson of COURSE_LESSONS) {
      for (const backup of [undefined, ...lesson.waves.map((_, i) => i)]) {
        let run = startAmbush(lesson, 'knight', backup);
        while (run.status !== 'won') {
          if (run.status === 'waveWon') run = nextAmbushWave(lesson, run);
          const p = wavePuzzle(lesson, run);
          run = moveAmbush(lesson, run, p.moves[1 + run.step * 2]).run;
        }
        expect(run.misses).toBe(0);
        expect(run.wave).toBe(lesson.waves.length - 1);
      }
    }
  });
});
