import { describe, expect, it } from 'vitest';
import { moveAmbush, nextAmbushWave, wavePuzzle } from './ambush';
import { COURSE_REGIONS, courseLesson } from './curriculum';
import { beginJourneyLesson, journeyComplete, lessonUnlocked, newJourney, regionUnlocked, settleJourney, type JourneySave } from './journey';

const ids = COURSE_REGIONS.flatMap(region => region.lessons);
function win(save: JourneySave, id: string) {
  expect(beginJourneyLesson(save, id)).toBe(true);
  const def = courseLesson(id)!;
  const active = save.active!;
  while (active.run.status !== 'won') {
    if (active.run.status === 'waveWon') active.run = nextAmbushWave(def, active.run);
    else active.run = moveAmbush(def, active.run, wavePuzzle(def, active.run).moves[1 + 2 * active.run.step]).run;
  }
  expect(settleJourney(save)).toBe(true);
}

describe('curriculum journey', () => {
  it('requires each preceding lesson and opens Region 2 after the Region 1 review', () => {
    const save = newJourney();
    expect(lessonUnlocked(save, ids[0])).toBe(true);
    expect(beginJourneyLesson(save, ids[1])).toBe(false);
    expect(beginJourneyLesson(save, 'missing')).toBe(false);
    expect(regionUnlocked(save, COURSE_REGIONS[1].id)).toBe(false);
    for (const id of COURSE_REGIONS[0].lessons) win(save, id);
    expect(regionUnlocked(save, COURSE_REGIONS[1].id)).toBe(true);
    expect(save.currentRegion).toBe(COURSE_REGIONS[1].id);
    expect(journeyComplete(save)).toBe(false);
    for (const id of COURSE_REGIONS[1].lessons) win(save, id);
    expect(journeyComplete(save)).toBe(true);
    expect(save.attempts).toBe(ids.length);
    expect(save.completed).toEqual(ids);
  });

  it('settles wins exactly once and preserves previously earned stars on replay', () => {
    const save = newJourney();
    win(save, ids[0]);
    expect(settleJourney(save, true, true)).toBe(false);
    expect(save.lastResult).toMatchObject({ won: true, clean: true, noHint: true, interrupted: false });
    expect(beginJourneyLesson(save, ids[0])).toBe(true);
    save.active!.run.misses = 1;
    save.active!.run.hintsUsed = 1;
    const def = courseLesson(ids[0])!;
    while (save.active!.run.status !== 'won') {
      const run = save.active!.run;
      save.active!.run = run.status === 'waveWon' ? nextAmbushWave(def, run)
        : moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
    }
    settleJourney(save);
    expect(save.completed).toEqual([ids[0]]);
    expect(save.stars[ids[0]]).toEqual({ clean: true, noHint: true });
    expect(save.lastResult).toMatchObject({ clean: false, noHint: false });
    expect(save.attempts).toBe(2);
  });

  it('retains a failed wave across exits, other lessons and retries, including Grandmaster', () => {
    const save = newJourney('grandmaster');
    win(save, ids[0]);
    beginJourneyLesson(save, ids[1]);
    save.active!.run.wave = 1;
    expect(settleJourney(save, true)).toBe(true);
    expect(save.retryWaves[ids[1]]).toBe(1);
    beginJourneyLesson(save, ids[0]);
    expect(save.active!.run.backupWave).toBe(null);
    settleJourney(save, true);
    beginJourneyLesson(save, ids[1]);
    expect(save.active!.run).toMatchObject({ wave: 0, backupWave: 1, misses: 0, difficulty: 'grandmaster' });
    expect(save.completed).toEqual([ids[0]]);
  });

  it('does not replace a live run or finish an incomplete or locked lesson', () => {
    const save = newJourney();
    beginJourneyLesson(save, ids[0]);
    const active = save.active;
    expect(beginJourneyLesson(save, ids[0])).toBe(false);
    expect(save.active).toBe(active);
    expect(settleJourney(save)).toBe(false);
    save.active!.lessonId = ids[1];
    expect(settleJourney(save, true)).toBe(false);
    expect(save.attempts).toBe(0);
    expect(save.completed).toEqual([]);
  });
});
