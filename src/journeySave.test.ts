import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moveAmbush, nextAmbushWave, wavePuzzle, type AmbushRun } from './game/ambush';
import { COURSE_REGIONS, courseLesson } from './game/curriculum';
import { beginJourneyLesson, newJourney, regionUnlocked, settleJourney } from './game/journey';
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
    const save = newJourney('squire', 'r');
    for (const region of COURSE_REGIONS.slice(0, 2)) for (const id of region.lessons) {
      expect(beginJourneyLesson(save, id)).toBe(true);
      const def = courseLesson(id)!;
      while (save.active!.run.status !== 'won') {
        const run = save.active!.run;
        save.active!.run = run.status === 'waveWon' ? nextAmbushWave(def, run)
          : moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
      }
      settleJourney(save);
    }
    // Exactly the old version-1 shape, ending on the Kingsroad; no migration flag is required.
    save.currentRegion = 'r2';
    save.stars[COURSE_REGIONS[0].lessons[0]] = { clean: false, noHint: true };
    const before = JSON.parse(JSON.stringify(save));
    persistJourney(save);
    const loaded = loadJourney()!;
    expect(loaded.completed).toEqual(before.completed);
    expect(loaded.stars).toEqual(before.stars);
    expect(loaded.attempts).toBe(12);
    expect(loaded.currentRegion).toBe('r2');
    expect(regionUnlocked(loaded, 'r3')).toBe(true);
    expect(regionUnlocked(loaded, 'r4')).toBe(false);
    expect(data.get('gauntlet-save-v1')).toBe('old campaign');
    expect(data.get('pawnshire-ambush-pilot-v1')).toBe('old pilot');
  });

  it('rejects corrupt, unknown, skipped and impossible saves without touching other saves', () => {
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
      expect(loadJourney()).toBe(null);
    }
    expect(data.get('gauntlet-save-v1')).toBe('old campaign');
  });
});
