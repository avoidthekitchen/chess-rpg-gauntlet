import { describe, expect, it } from 'vitest';
import { STARTERS } from './campaign';
import { COURSE_REGIONS } from './curriculum';
import { chapterStory, finaleInterlude, journeyEnding } from './courseStory';

const cast = new Set(['Saffron, the Fox Queen', 'Grubnak, the Toad Chief', 'Tadwell, the Frog Captain',
  'Ashfang, the Bandit Lord', 'The Lich King', 'The Bone Wardens', 'General Flint', 'The Cult Leader',
  ...Object.values(STARTERS).map(starter => starter.name)]);
describe('chapter and finale story', () => {
  it.each(['n', 'b', 'r'] as const)('keeps %s as the companion with short cast dialogue', starter => {
    for (const lines of [...COURSE_REGIONS.map(region => chapterStory(region.id, starter)),
      finaleInterlude(starter), journeyEnding(starter), chapterStory('unknown', starter)]) {
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.some(line => line.speaker === STARTERS[starter].name)).toBe(true);
      for (const line of lines) {
        expect(cast.has(line.speaker), line.speaker).toBe(true);
        expect(line.line.split(/\s+/).length, line.line).toBeLessThanOrEqual(25);
      }
    }
    expect(chapterStory('unknown', starter)).toHaveLength(1);
  });
});
