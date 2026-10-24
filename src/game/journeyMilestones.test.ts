import { describe, expect, it } from 'vitest';
import { COURSE_REGIONS, courseLesson } from './curriculum';
import { endingPending, finalEncounter, finaleInterludeUnlocked, journeyMilestone, newJourney } from './journey';
import { startAmbush } from './ambush';

describe('committed journey milestones', () => {
  it('uses registered chapter and finale boundaries while a visual reply is pending', () => {
    const save = newJourney();
    for (const region of COURSE_REGIONS) for (const id of region.lessons) {
      const lesson = courseLesson(id)!;
      save.completed.push(id);
      save.active = { lessonId: id, run: { ...startAmbush(lesson, 'knight'), status: 'won', settled: true } };
      if (id === finalEncounter()) save.finaleComplete = true;
      expect(journeyMilestone(save, id)).toBe(!lesson.review ? null : region.kind !== 'finale' ? 'chapter' : id === finalEncounter() ? 'ending' : 'interlude');
      save.active.run.settled = false;
      expect(journeyMilestone(save, id)).toBeNull();
      save.active.run.settled = true; save.active.run.status = 'lost';
      expect(journeyMilestone(save, id)).toBeNull();
    }
    expect(finaleInterludeUnlocked(save)).toBe(true);
    expect(endingPending(save)).toBe(true);
    save.endingSeen = true;
    expect(endingPending(save)).toBe(false);
  });
  it('does not offer an ending or interlude for unfinished progress', () => {
    const save = newJourney();
    expect(endingPending(save)).toBe(false);
    expect(finaleInterludeUnlocked(save)).toBe(false);
    expect(journeyMilestone(save, finalEncounter()!)).toBeNull();
  });
});
