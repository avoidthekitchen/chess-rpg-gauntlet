import { COURSE_CAST, COURSE_FOE_ART, courseFoeName } from '../game/courseCast';
import { FACTION_SPECIES } from './speaker';
import { Chess, type PieceSymbol } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COURSE_LESSONS } from '../game/curriculum';
import { uciMove } from '../game/ambush';
import { COURSE_FORK_MOVES, courseBanner, companionReaction, companionSpeaker, CourseDialogueLog, CourseHolds, CourseSpeech, courseAllowsSpeech, coursePortrait, courseGuidance, courseIntro, courseMoveCues, courseMoveSpeaker, courseStoryBefore } from './coursePresentation';

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

  it('names each review host and uses chapter identity for reused enemy art', () => {
    const hosts: Record<string, string> = { r3: 'The Cult Leader', r4: 'General Flint', r5: 'The Bone Wardens' };
    const names: Record<string, string> = { r3: 'Shadow Cult · Pawn', r4: 'Iron Legion · Pawn', r5: 'Bone Wardens · Pawn' };
    const prefixes: Record<string, string> = { r3: 'Shadow Cult · ', r4: 'Iron Legion · ', r5: 'Bone Wardens · ' };
    for (const lesson of COURSE_LESSONS.filter(lesson => lesson.regionId in hosts)) {
      const intro = courseIntro(lesson, 'b');
      expect(intro[0].name).toBe(lesson.review ? hosts[lesson.regionId] : names[lesson.regionId]);
      const chess = new Chess(lesson.show.fen);
      const move = chess.move(uciMove(lesson.show.moves[0]));
      const foe = courseMoveSpeaker(move, chess.turn(), [], lesson.regionId);
      expect(foe.name).toContain(prefixes[lesson.regionId]);
      expect(foe.line).not.toMatch(/toll|road|squelch/i);
    }
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

describe('separate lesson speech lifetime', () => {
  afterEach(() => vi.useRealTimers());
  it('expires without discarding the last speaker or extending its reading time on reads', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const speech = new CourseSpeech(changed);
    const info = companionSpeaker('n', 'Hop to it!');
    speech.show(info);
    vi.advanceTimersByTime(2000);
    expect(speech.info).toBe(info);
    expect(speech.visible).toBe(true);
    vi.advanceTimersByTime(1200);
    expect(speech.visible).toBe(false);
    expect(speech.info).toBe(info); // Desktop and history retain the last line.
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it('holds a line for reading, restarts on release, and dismisses immediately', () => {
    vi.useFakeTimers();
    const speech = new CourseSpeech(() => {});
    speech.show(companionSpeaker('b', 'Look again.'));
    vi.advanceTimersByTime(2500);
    speech.hold();
    vi.advanceTimersByTime(9000);
    expect(speech.visible).toBe(true);
    speech.release();
    vi.advanceTimersByTime(3100);
    expect(speech.visible).toBe(true);
    speech.dismiss();
    expect(speech.visible).toBe(false);
    speech.release();
    vi.advanceTimersByTime(10000);
    expect(speech.visible).toBe(false);
  });
  it('cancels older speech and clears every pending callback on wave, retry, or exit', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const speech = new CourseSpeech(changed);
    speech.show(companionSpeaker('n', 'Hop!'));
    vi.advanceTimersByTime(3000);
    const next = companionSpeaker('r', 'A new board.');
    speech.show(next);
    vi.advanceTimersByTime(300);
    expect(speech.visible).toBe(true);
    expect(speech.info).toBe(next);
    speech.clear();
    const callsAfterExit = changed.mock.calls.length;
    vi.advanceTimersByTime(10000);
    expect(speech.info).toBe(null);
    expect(speech.visible).toBe(false);
    expect(changed).toHaveBeenCalledTimes(callsAfterExit);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('lesson guidance priority', () => {
  it('uses specific coaching instead of repeating the initial objective', () => {
    expect(courseGuidance('Find a safe capture.', 'Find a safe capture.', 'Their rook is loose. Check its defenders.'))
      .toEqual({ status: '', coach: 'Their rook is loose. Check its defenders.' });
  });
  it('keeps hints, missed-move feedback, and demonstration guidance visible', () => {
    for (const status of ['The green square shows the piece to move.', 'Not quite. Your move is taken back.', 'Your opponent replies…']) {
      expect(courseGuidance(status, 'Find a safe capture.', 'Check its defenders.').status).toBe(status);
    }
    expect(courseGuidance('Watch this move.', 'Find a safe capture.', 'Watch this move.'))
      .toEqual({ status: '', coach: 'Watch this move.' });
    expect(courseGuidance('', 'Read the board.', '')).toEqual({ status: 'Read the board.', coach: '' });
  });
});


describe('honest portrait identity and compact advice', () => {
  it('names species only when the displayed portrait set matches them', () => {
    for (const [id, cast] of Object.entries(COURSE_CAST)) for (const type of Object.keys(cast.species) as PieceSymbol[]) {
      const name = courseFoeName(id, type);
      const portrait = coursePortrait({ side: 'foe', type, name, line: 'Your move.' });
      expect(portrait).toContain(`-${COURSE_FOE_ART}.webp`);
      if (cast.speciesArt === COURSE_FOE_ART) expect(name).toBe(FACTION_SPECIES[COURSE_FOE_ART][type]);
      else {
        expect(name).toMatch(new RegExp(`^${cast.faction} · (Pawn|Knight|Bishop|Rook|Queen|King)$`));
        expect(name).not.toBe(cast.species[type]);
      }
    }
  });
  it('keeps compact advice clear for player decisions and completed demonstrations', () => {
    for (const phase of ['solving', 'taught']) {
      expect(courseAllowsSpeech(phase, false)).toBe(false);
      expect(courseAllowsSpeech(phase, true)).toBe(true);
    }
    for (const phase of ['demonstrating', 'replying', 'setup']) expect(courseAllowsSpeech(phase, false)).toBe(true);
    for (const phase of ['won', 'lost', 'briefing']) for (const persistent of [true, false]) expect(courseAllowsSpeech(phase, persistent)).toBe(false);
  });
  it('does not invent an opponent reply in missed-move feedback', () => {
    expect(companionReaction('b', 'miss').line).not.toContain('their reply');
  });
});

describe('move banners', () => {
  const play = (fen: string, san: string) => { const chess = new Chess(fen); const move = chess.move(san); return { chess, move }; };
  it('keeps pawn captures quiet and gives other captures a close-up', () => {
    const pawn = play('4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1', 'exd5');
    expect(courseBanner(pawn.move, courseMoveCues(pawn.chess, pawn.move, true, 'x', 1), 'w')).toBeNull();
    const rook = play('4k3/8/8/3r4/8/2N5/8/4K3 w - - 0 1', 'Nxd5');
    expect(courseBanner(rook.move, ['Capture'], 'w')).toMatchObject({ kind: 'capture', side: 'ally' });
    expect(courseBanner(rook.move, ['Capture'], 'b')).toMatchObject({ kind: 'capture', side: 'foe', title: 'Their knight takes your rook!' });
  });
  it('ranks tactics above a capture, and a capture above a plain check', () => {
    const { move } = play('4k3/8/8/3r4/8/2N5/8/4K3 w - - 0 1', 'Nxd5');
    expect(courseBanner(move, ['Capture', 'Check', 'Fork'], 'w')).toMatchObject({ kind: 'tactic', title: 'Fork!', detail: 'Capture · Check' });
    expect(courseBanner(move, ['Capture', 'Check'], 'w')).toMatchObject({ kind: 'capture', detail: 'Check' });
    expect(courseBanner(move, ['Capture', 'Mate'], 'w')).toMatchObject({ title: 'Checkmate!' });
    const pawnCheck = play('8/4k3/3p4/4P3/8/8/8/4K3 w - - 0 1', 'exd6');
    expect(courseBanner(pawnCheck.move, ['Capture', 'Check'], 'w')).toMatchObject({ kind: 'tactic', title: 'Check!' });
    expect(courseBanner(move, [], 'w')).toBeNull();
  });
});
