import { describe, expect, it } from 'vitest';
import { AMBUSH_HELP, moveAmbush, nextAmbushWave, wavePuzzle } from './ambush';
import type { DifficultyId } from './difficulty';
import { COURSE_REGIONS, courseLesson } from './curriculum';
import { beginJourneyLesson, journeyComplete, lessonUnlocked, newJourney, regionUnlocked, settleJourney, type JourneySave } from './journey';

const ids = COURSE_REGIONS.flatMap(region => region.lessons);
function win(save: JourneySave, id: string, helped = false) {
  expect(beginJourneyLesson(save, id)).toBe(true);
  const def = courseLesson(id)!;
  const active = save.active!;
  while (active.run.status !== 'won') {
    if (active.run.status === 'waveWon') active.run = nextAmbushWave(def, active.run);
    else active.run = moveAmbush(def, active.run, wavePuzzle(def, active.run).moves[1 + 2 * active.run.step]).run;
  }
  if (helped) {
    active.run.misses = 1;
    active.run.hintsUsed = AMBUSH_HELP[save.difficulty].hints ? 1 : 0;
  }
  expect(settleJourney(save)).toBe(true);
}

describe('curriculum journey', () => {
  it('requires each preceding lesson and opens each chapter after its review', () => {
    const save = newJourney();
    expect(lessonUnlocked(save, ids[0])).toBe(true);
    expect(beginJourneyLesson(save, ids[1])).toBe(false);
    expect(beginJourneyLesson(save, 'missing')).toBe(false);
    expect(regionUnlocked(save, COURSE_REGIONS[1].id)).toBe(false);
    for (const id of COURSE_REGIONS[0].lessons) win(save, id);
    expect(regionUnlocked(save, COURSE_REGIONS[1].id)).toBe(true);
    expect(save.currentRegion).toBe(COURSE_REGIONS[1].id);
    expect(journeyComplete(save)).toBe(false);
    for (const region of COURSE_REGIONS.slice(1)) {
      expect(regionUnlocked(save, region.id)).toBe(true);
      expect(save.currentRegion).toBe(region.id);
      for (const id of region.lessons) win(save, id);
    }
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


describe('finale completion', () => {
  it.each<DifficultyId>(['squire', 'knight', 'champion', 'grandmaster'])('finishes the real route on %s without requiring clean stars', difficulty => {
    const save = newJourney(difficulty);
    expect(save.finaleComplete).toBe(false);
    for (const id of ids.slice(0, -1)) win(save, id, true);
    expect(save.completed).toHaveLength(ids.length - 1);
    expect(journeyComplete(save)).toBe(false);
    expect(save.finaleComplete).toBe(false);
    win(save, ids.at(-1)!, true);
    expect(save.finaleComplete).toBe(true);
    expect(journeyComplete(save)).toBe(true);
    expect(Object.values(save.stars).every(star => !star.clean)).toBe(true);
    expect(save.attempts).toBe(ids.length);
    expect(settleJourney(save)).toBe(false);
  });

  it('settles an invalid final win without credit or a permanent lockout', () => {
    for (const fen of ['not a position', '7k/8/8/8/8/8/8/K7 w - - 0 1']) {
      const save = newJourney();
      save.completed = ids.slice(0, -1);
      const last = ids.at(-1)!;
      expect(beginJourneyLesson(save, last)).toBe(true);
      const def = courseLesson(last)!;
      Object.assign(save.active!.run, { status: 'won', wave: def.waves.length - 1, fen });
      expect(settleJourney(save)).toBe(true);
      expect(save.active!.run.settled).toBe(true);
      expect(save.active!.run.status).toBe('lost');
      expect(save.finaleComplete).toBe(false);
      expect(save.attempts).toBe(1);
      expect(beginJourneyLesson(save, ids[0])).toBe(true);
      expect(save.completed).not.toContain(last);
    }
  });

  it('keeps completion and earned stars through a weaker replay and an earlier retreat', () => {
    const save = newJourney('squire');
    for (const id of ids) win(save, id);
    const stars = structuredClone(save.stars);
    win(save, ids[0], true);
    expect(save.stars).toEqual(stars);
    expect(save.finaleComplete).toBe(true);
    expect(beginJourneyLesson(save, ids[1])).toBe(true);
    expect(settleJourney(save, true, true)).toBe(true);
    expect(save.lastResult).toMatchObject({ won: false, interrupted: true });
    expect(save.stars).toEqual(stars);
    expect(journeyComplete(save)).toBe(true);
    save.completed.pop();
    expect(journeyComplete(save)).toBe(false);
  });
});
