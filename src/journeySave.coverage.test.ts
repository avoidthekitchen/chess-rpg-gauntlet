import { expect, it, vi } from 'vitest';
import { Chess } from 'chess.js';
import { COURSE_LESSONS } from './game/curriculum';
import { moveAmbush, startAmbush, uciMove } from './game/ambush';
import { newJourney, settleJourney } from './game/journey';
import { persistJourney, loadJourney } from './journeySave';

const storage = vi.hoisted(() => new Map<string, string>());
vi.mock('./store', () => ({ store: {
  get: (key: string) => storage.get(key) ?? null,
  set: (key: string, value: string) => storage.set(key, value),
  remove: (key: string) => storage.delete(key),
} }));

/** Retained from the independent review: enumerate actual boards, not invented run states. */
it('recovers every playable solver state and alternate immediate mate across all help settings', () => {
  let roundTrips = 0, alternates = 0;
  const expectedRoundTrips = COURSE_LESSONS.reduce((total, lesson) => total + lesson.waves.reduce((n, wave) => n + (wave.main.moves.length + wave.backup.moves.length) / 2 * 4, 0), 0);
  let expectedAlternates = 0;
  for (const lesson of COURSE_LESSONS) for (const wave of lesson.waves) for (const puzzle of [wave.main, wave.backup]) {
    const board = new Chess(puzzle.fen);
    puzzle.moves.forEach((uci, index) => {
      if (index % 2) {
        const expected = new Chess(board.fen()); expected.move(uciMove(uci));
        if (expected.isCheckmate()) for (const move of board.moves({ verbose: true })) {
          const other = new Chess(board.fen()); other.move(move);
          if (move.lan !== uci && other.isCheckmate()) expectedAlternates += 8;
        }
      }
      board.move(uciMove(uci));
    });
  }
  for (const [index, lesson] of COURSE_LESSONS.entries()) {
    for (const [wave, pair] of lesson.waves.entries()) {
      for (const backup of [false, true]) {
        for (const difficulty of ['squire', 'knight', 'champion', 'grandmaster'] as const) {
          const puzzle = pair[backup ? 'backup' : 'main'];
          const board = new Chess(puzzle.fen);
          board.move(uciMove(puzzle.moves[0]));
          for (let step = 0; step < puzzle.moves.length / 2; step++) {
            const save = newJourney(difficulty);
            save.completed = COURSE_LESSONS.slice(0, index).map(previous => previous.id);
            save.currentRegion = lesson.regionId;
            const run = { ...startAmbush(lesson, difficulty), wave, step,
              backupWave: backup ? wave : null, fen: board.fen() };
            save.active = { lessonId: lesson.id, run };
            persistJourney(save);
            const restored = loadJourney();
            roundTrips++;
            expect(restored, `${puzzle.id} ${difficulty} step ${step}`).not.toBeNull();
            expect(restored!.active!.run.fen).toBe(run.fen);
            expect(restored!.active!.run.status).toBe('lost');
            expect(restored!.retryWaves[lesson.id]).toBe(wave);
            expect(restored!.finaleComplete).toBe(false);
            expect(loadJourney()!.attempts).toBe(1);

            const expected = new Chess(board.fen());
            expected.move(uciMove(puzzle.moves[step * 2 + 1]));
            if (expected.isCheckmate()) {
              for (const move of board.moves({ verbose: true })) {
                const alternative = new Chess(board.fen());
                alternative.move(move);
                if (!alternative.isCheckmate() || move.lan === puzzle.moves[step * 2 + 1]) continue;
                const accepted = structuredClone(save);
                accepted.active!.run = moveAmbush(lesson, run, move.lan).run;
                expect(['waveWon', 'won']).toContain(accepted.active!.run.status);
                for (const settled of [false, true]) {
                  const candidate = structuredClone(accepted);
                  if (settled) settleJourney(candidate);
                  persistJourney(candidate);
                  const recovered = loadJourney();
                  alternates++;
                  expect(recovered, `alternate ${puzzle.id} ${move.lan}`).not.toBeNull();
                  expect(recovered!.completed.includes(lesson.id)).toBe(wave === lesson.waves.length - 1);
                  expect(recovered!.attempts).toBe(1);
                  expect(loadJourney()!.attempts).toBe(1);
                  if (lesson.id === 'finale-last-board' && wave === lesson.waves.length - 1) {
                    expect(recovered!.finaleComplete).toBe(true);
                    expect(new Chess(recovered!.active!.run.fen).isCheckmate()).toBe(true);
                  }
                }
              }
            }
            board.move(uciMove(puzzle.moves[step * 2 + 1]));
            if (step * 2 + 2 < puzzle.moves.length) board.move(uciMove(puzzle.moves[step * 2 + 2]));
          }
        }
      }
    }
  }
  expect(roundTrips).toBe(expectedRoundTrips);
  expect(alternates).toBe(expectedAlternates);
  expect(alternates).toBeGreaterThan(0);
}, 30_000);
