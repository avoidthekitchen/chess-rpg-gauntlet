import oldJourneyFixture from './fixtures/journey-two-chapters-v1.json';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moveAmbush, nextAmbushWave, wavePuzzle, type AmbushRun } from './game/ambush';
import { COURSE_REGIONS, courseLesson } from './game/curriculum';
import { beginJourneyLesson, journeyComplete, newJourney, lessonUnlocked, regionUnlocked, settleJourney } from './game/journey';
import { clearJourney, JOURNEY_KEY, loadJourney, persistJourney } from './journeySave';

const data = vi.hoisted(() => new Map<string, string>());
vi.mock('./store', () => ({ store: {
  get: (key: string) => data.get(key) ?? null,
  set: (key: string, value: string) => data.set(key, value),
  remove: (key: string) => data.delete(key),
} }));
const first = COURSE_REGIONS[0].lessons[0];

describe('journey storage', () => {
  beforeEach(() => {
    data.clear();
    data.set('gauntlet-save-v1', 'old campaign');
    data.set('pawnshire-ambush-pilot-v1', 'old pilot');
  });
  it('starts separately and clears only the journey', () => {
    expect(loadJourney()).toBe(null);
    persistJourney(newJourney('squire', 'b'));
    expect(loadJourney()).toMatchObject({ difficulty: 'squire', starter: 'b', completed: [] });
    clearJourney();
    expect(loadJourney()).toBe(null);
    expect(data.get('gauntlet-save-v1')).toBe('old campaign');
    expect(data.get('pawnshire-ambush-pilot-v1')).toBe('old pilot');
  });
  it('rebuilds an interrupted board and counts the attempt once across reloads', () => {
    const save = newJourney();
    beginJourneyLesson(save, first);
    const initial = save.active!.run.fen;
    save.active!.run.fen = 'untrusted board';
    persistJourney(save);
    const restored = loadJourney()!;
    expect(restored.active!.run.fen).toBe(initial);
    expect(restored.active!.run).toMatchObject({ status: 'lost', settled: true });
    expect(restored.lastResult).toMatchObject({ interrupted: true, won: false });
    expect(restored.retryWaves[first]).toBe(0);
    expect(restored.attempts).toBe(1);
    expect(loadJourney()!.attempts).toBe(1);
    expect(beginJourneyLesson(restored, first)).toBe(true);
    expect(restored.active!.run.backupWave).toBe(0);
  });
  it('preserves an accepted win on reload before its animation or settlement', () => {
    const save = newJourney();
    beginJourneyLesson(save, first);
    const def = courseLesson(first)!;
    while (save.active!.run.status !== 'won') {
      const run = save.active!.run;
      save.active!.run = run.status === 'waveWon' ? nextAmbushWave(def, run)
        : moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
    }
    persistJourney(save);
    expect(loadJourney()).toMatchObject({ completed: [first], attempts: 1,
      lastResult: { won: true, interrupted: false } });
    expect(loadJourney()!.attempts).toBe(1);
  });
  it('loads the accepted two-chapter save with earned stars and opens the appended chapter', () => {
    const before = oldJourneyFixture;
    data.set(JOURNEY_KEY, JSON.stringify(before));
    const loaded = loadJourney()!;
    expect(loaded.finaleComplete).toBe(false);
    expect(loaded.completed).toEqual(before.completed);
    expect(loaded.stars).toEqual(before.stars);
    expect(loaded.attempts).toBe(12);
    expect(loaded.currentRegion).toBe('r2');
    expect(regionUnlocked(loaded, 'r3')).toBe(true);
    expect(lessonUnlocked(loaded, 'r3-escape-pins')).toBe(false);
    expect(data.get('gauntlet-save-v1')).toBe('old campaign');
    expect(data.get('pawnshire-ambush-pilot-v1')).toBe('old pilot');
  });

  it('retires an obsolete in-flight source without losing earlier chapters or counting twice', () => {
    data.set(JOURNEY_KEY, JSON.stringify(oldJourneyFixture));
    const save = loadJourney()!;
    expect(beginJourneyLesson(save, 'r3-pins')).toBe(true);
    save.active!.run.step = 999;
    persistJourney(save);
    const restored = loadJourney()!;
    expect(restored.active).toBeNull();
    expect(restored.completed).toEqual(oldJourneyFixture.completed);
    expect(restored.stars).toEqual(oldJourneyFixture.stars);
    expect(restored.attempts).toBe(13);
    expect(restored.lastResult).toMatchObject({ won: false, interrupted: true });
    expect(loadJourney()!.attempts).toBe(13);
    expect(loadJourney()!.stars).toEqual(oldJourneyFixture.stars);
  });

  it('rejects corrupt progress but retires impossible attempts without losing earned progress', () => {
    const corrupt = [null, [], { ...newJourney(), difficulty: 'toString' },
      { ...newJourney(), completed: [COURSE_REGIONS[1].lessons[0]] },
      { ...newJourney(), completed: ['unknown'] }, { ...newJourney(), currentRegion: 'unknown' }];
    for (const value of corrupt) {
      data.set(JOURNEY_KEY, JSON.stringify(value));
      expect(loadJourney()).toBe(null);
    }
    const save = newJourney();
    beginJourneyLesson(save, first);
    for (const patch of [{ wave: 99 }, { step: 100000 }, { backupWave: -1 }, { status: 'won' },
      { status: 'solving', settled: true }, { misses: 3 }, { hintsUsed: -1 }]) {
      persistJourney({ ...save, active: { ...save.active!, run: { ...save.active!.run, ...patch } as AmbushRun } });
      const loaded = loadJourney()!;
      expect(loaded).not.toBeNull();
      expect(loaded.active).toBeNull();
      expect(loaded.completed).toEqual(save.completed);
      expect(beginJourneyLesson(loaded, first)).toBe(true);
    }
    expect(data.get('gauntlet-save-v1')).toBe('old campaign');
  });
});


describe('finale save recovery', () => {
  beforeEach(() => data.clear());
  const ids = COURSE_REGIONS.flatMap(region => region.lessons);
  const last = ids.at(-1)!;
  function finalAttempt() {
    const save = newJourney('squire');
    save.completed = ids.slice(0, -1);
    expect(beginJourneyLesson(save, last)).toBe(true);
    return save;
  }
  function solveFinal(save: ReturnType<typeof newJourney>) {
    const def = courseLesson(last)!;
    while (save.active!.run.status !== 'won') {
      const run = save.active!.run;
      save.active!.run = run.status === 'waveWon' ? nextAmbushWave(def, run)
        : moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
    }
  }
  it('recovers an accepted final checkmate before settlement and persists completion exactly once', () => {
    for (const partialCompletion of [false, true]) {
      const save = finalAttempt();
      solveFinal(save);
      if (partialCompletion) save.completed.push(last);
      expect(save.finaleComplete).toBe(false);
      save.active!.run.fen = 'untrusted board';
      persistJourney(save);
      const loaded = loadJourney()!;
      expect(loaded).not.toBeNull();
      expect(loaded.finaleComplete).toBe(true);
      expect(journeyComplete(loaded)).toBe(true);
      expect(loaded.completed.filter(id => id === last)).toHaveLength(1);
      expect(loaded.lastResult).toMatchObject({ won: true, interrupted: false });
      expect(loaded.attempts).toBe(1);
      expect(loadJourney()!.attempts).toBe(1);
      expect(settleJourney(loaded)).toBe(false);
    }
  });

  it('does not finish the journey when reload interrupts the last position before its accepted finish', () => {
    const save = finalAttempt(), def = courseLesson(last)!;
    while (!(save.active!.run.wave === def.waves.length - 1 && save.active!.run.status === 'solving' &&
      save.active!.run.step === (wavePuzzle(def, save.active!.run).moves.length - 2) / 2)) {
      const run = save.active!.run;
      save.active!.run = run.status === 'waveWon' ? nextAmbushWave(def, run)
        : moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
    }
    persistJourney(save);
    const loaded = loadJourney()!;
    expect(loaded.finaleComplete).toBe(false);
    expect(journeyComplete(loaded)).toBe(false);
    expect(loaded.completed).not.toContain(last);
    expect(loaded.lastResult).toMatchObject({ won: false, interrupted: true });
    expect(loaded.retryWaves[last]).toBe(def.waves.length - 1);
  });

  it('preserves finished progress and stars on reload after an earlier lesson is abandoned', () => {
    const save = finalAttempt();
    solveFinal(save);
    settleJourney(save);
    const stars = structuredClone(save.stars);
    expect(beginJourneyLesson(save, first)).toBe(true);
    persistJourney(save);
    const loaded = loadJourney()!;
    expect(loaded.finaleComplete).toBe(true);
    expect(journeyComplete(loaded)).toBe(true);
    expect(loaded.lastResult).toMatchObject({ lessonId: first, won: false });
    expect(loaded.stars).toEqual(stars);
    expect(loadJourney()!.attempts).toBe(2);
  });

  it('rejects malformed flags but repairs derived finale completion records', () => {
    for (const flag of [null, 1, 'true', {}, []]) {
      data.set(JOURNEY_KEY, JSON.stringify({ ...newJourney(), finaleComplete: flag }));
      expect(loadJourney()).toBeNull();
    }
    persistJourney({ ...newJourney(), finaleComplete: true });
    expect(loadJourney()!.finaleComplete).toBe(false);
    const completed = newJourney();
    completed.completed = ids;
    persistJourney(completed);
    expect(loadJourney()!.finaleComplete).toBe(true);
    const { finaleComplete: _, ...missingFlag } = completed;
    data.set(JOURNEY_KEY, JSON.stringify(missingFlag));
    expect(loadJourney()!.completed).toEqual(ids);
    expect(loadJourney()!.finaleComplete).toBe(true);
  });
});
