import { describe, expect, it } from 'vitest';
import { STARTERS } from './companions';
import { COURSE_REGIONS } from './curriculum';
import { chapterIntro, chapterStory, COMPANION_GREETINGS, finaleInterlude, journeyEnding } from './courseStory';

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

describe('chapter introductions', () => {
  it.each(['n', 'b', 'r'] as const)('opens every chapter with %s and short lines', starter => {
    for (const region of COURSE_REGIONS) {
      const lines = chapterIntro(region.id, starter);
      expect(lines.some(line => line.who === 'companion' && line.speaker === STARTERS[starter].name)).toBe(true);
      for (const line of lines) {
        if (line.who !== 'narrator') expect(cast.has(line.speaker), line.speaker).toBe(true);
        expect(line.line.split(/\s+/).length, line.line).toBeLessThanOrEqual(25);
      }
    }
    expect(chapterIntro('unknown', starter)).toEqual([]);
    expect(COMPANION_GREETINGS[starter].split(/\s+/).length).toBeLessThanOrEqual(25);
  });
});
