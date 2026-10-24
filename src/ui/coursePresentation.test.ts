import { Chess } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COURSE_LESSONS } from '../game/curriculum';
import { uciMove } from '../game/ambush';
import { COURSE_FORK_MOVES, companionReaction, companionSpeaker, CourseDialogueLog, CourseHolds, courseIntro, courseMoveCues, courseMoveSpeaker, courseStoryBefore } from './coursePresentation';

const positions = COURSE_LESSONS.flatMap(lesson => [lesson.show, ...lesson.waves.flatMap(wave => [wave.main, wave.backup])]);

describe('accepted lesson move cues', () => {
  it('verifies every curated fork against its unchanged published move and actual targets', () => {
    for (const [id, uci] of Object.entries(COURSE_FORK_MOVES)) {
      const p = positions.find(p => p.id === id)!;
      expect(p, id).toBeDefined();
      expect(p.moves[1], id).toBe(uci);
      const chess = new Chess(p.fen);
      chess.move(uciMove(p.moves[0]));
      const move = chess.move(uciMove(uci));
      expect(courseMoveCues(chess, move, true, id, 1), id).toContain('Fork');
      expect(courseMoveCues(chess, move, true, id, 3), id).not.toContain('Fork');
      expect(courseMoveCues(chess, move, true, 'uncurated', 1), id).not.toContain('Fork');
    }
  });

  it('ties every cue to the accepted move and resulting board for all source lines', () => {
    const colors = new Set<string>();
    const observed = new Set<string>();
    for (const p of positions) {
      const chess = new Chess(p.fen);
      for (let i = 0; i < p.moves.length; i++) {
        const move = chess.move(uciMove(p.moves[i]));
        if (i % 2 === 0) continue;
        colors.add(move.color);
        const cues = courseMoveCues(chess, move, true, p.id, i);
        cues.forEach(cue => observed.add(cue));
        expect(cues.includes('Capture'), p.id).toBe(!!move.captured);
        expect(cues.includes('Promotion'), p.id).toBe(!!move.promotion);
        expect(cues.includes('Mate'), p.id).toBe(chess.isCheckmate());
        expect(cues.includes('Check') || cues.includes('Double check') || cues.includes('Mate'), p.id).toBe(chess.isCheck());
        expect(courseMoveCues(chess, move, false, p.id, i), p.id).toEqual([]);
      }
    }
    expect([...colors].sort()).toEqual(['b', 'w']);
    expect([...observed].sort()).toEqual(['Capture', 'Check', 'Double check', 'Fork', 'Mate', 'Promotion']);
  });

  it('requires the moved piece to attack two targets even with matching curated metadata', () => {
    const chess = new Chess('7k/8/8/8/8/8/8/K3N3 w - - 0 1');
    const move = chess.move('Nd3');
    // Spoofing a matching source move cannot turn a board without targets into a fork.
    Object.assign(move, { from: 'e6', to: 'd4' });
    expect(courseMoveCues(chess, move, true, 'HGP8R', 1)).not.toContain('Fork');
  });
});

describe('lesson speakers and story', () => {
  it('uses relative solver identity for both colors without naming generic pieces as the coach', () => {
    for (const color of ['w', 'b'] as const) {
      const chess = new Chess(color === 'w' ? '7k/8/8/8/8/8/8/KR6 w - - 0 1' : 'kr6/8/8/8/8/8/8/7K b - - 0 1');
      const move = chess.move(color === 'w' ? 'Rb2' : 'Rb7');
      const ally = courseMoveSpeaker(move, color, [], 'r1');
      const foe = courseMoveSpeaker(move, color === 'w' ? 'b' : 'w', [], 'r1');
      expect(ally).toMatchObject({ side: 'ally', type: 'r', name: 'Tortoise Rook' });
      expect(foe).toMatchObject({ side: 'foe', type: 'r', name: 'Snapping Turtle Rook' });
      expect(ally.name).not.toMatch(/Sir Hob|Old Brick|Sage Ollie/);
      expect(ally.line).not.toMatch(/file/); // This move is vertical; quips also work horizontally.
      expect(foe.line).not.toMatch(/check|fork|take|mate/i);
    }
    expect(companionSpeaker('b', 'Look again.')).toMatchObject({ name: 'Sage Ollie · Owl Bishop', type: 'b' });
  });

  it('uses the promoted piece portrait and keeps the chosen companion separate', () => {
    const chess = new Chess('7k/P7/6K1/8/8/8/8/8 w - - 0 1');
    const move = chess.move('a8=Q#');
    expect(courseMoveSpeaker(move, 'w', ['Promotion', 'Mate'], 'r1')).toMatchObject({ type: 'q', name: 'Fox Queen' });
    expect(companionReaction('n', 'win').name).toContain('Sir Hob');
    expect(new Set(['n', 'b', 'r'].map(type => companionReaction(type as 'n' | 'b' | 'r', 'win').line)).size).toBe(3);
  });

  it('starts each lesson with the selected coach, and reviews reveal no tactic', () => {
    for (const lesson of COURSE_LESSONS) for (const starter of ['n', 'b', 'r'] as const) {
      const intro = courseIntro(lesson, starter);
      expect(intro).toHaveLength(2);
      expect(intro[1].type).toBe(starter);
      if (lesson.review) {
        expect(intro.map(info => info.line).join(' ')).not.toMatch(/fork|double check|promotion|back.rank|defender|mate/i);
        expect(intro[1].line).toBe('Your turn. Read each board and choose your plan.');
      }
      if (starter === 'b') expect(courseStoryBefore(lesson, starter).join(' ')).not.toMatch(/Sir Hob|Old Brick/);
    }
  });
});

describe('lesson dialogue journal and holds', () => {
  afterEach(() => vi.useRealTimers());
  it('retains example and wave history, with retries labeled separately', () => {
    const log = new CourseDialogueLog();
    for (const [scope, ply] of [['Introduction', 0], ['Example 1', 1], ['Attempt 1 · Position 1', 1], ['Attempt 1 · Position 2', 3], ['Attempt 2 · Position 1', 1]] as const) log.add(companionSpeaker('r', scope), scope, ply);
    expect(log.all.map(entry => entry.label)).toEqual(['Introduction · Start', 'Example 1 · Move 1', 'Attempt 1 · Position 1 · Move 1', 'Attempt 1 · Position 2 · Move 2', 'Attempt 2 · Position 1 · Move 1']);
    expect(log.all[1].label).not.toContain('Attempt');
    expect(log.last?.line).toBe('Attempt 2 · Position 1');
  });
  it('keeps labels attached when old history reaches its bound', () => {
    const log = new CourseDialogueLog(2);
    for (const scope of ['Example', 'Position 1', 'Position 2']) log.add(companionSpeaker('n', scope), scope);
    expect(log.all.map(entry => [entry.info.line, entry.label])).toEqual([['Position 1', 'Position 1 · Start'], ['Position 2', 'Position 2 · Start']]);
  });
  it('clears queued delays and releases each waiting session without firing stale timers', async () => {
    vi.useFakeTimers();
    const holds = new CourseHolds();
    const first = holds.wait(900), second = holds.wait(1200);
    expect(vi.getTimerCount()).toBe(2);
    holds.clear();
    await Promise.all([first, second]);
    expect(vi.getTimerCount()).toBe(0);
    const next = holds.wait(300);
    await vi.advanceTimersByTimeAsync(300);
    await next;
    expect(vi.getTimerCount()).toBe(0);
  });
});
