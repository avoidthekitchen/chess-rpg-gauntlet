import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { COURSE_LESSONS } from '../game/curriculum';
import { courseFoeArt, courseFoeName } from '../game/courseCast';
import { courseSpeakerArt, reviewPortraitFile, storyPortraitStyle } from './courseArt';
import { CourseDialogueLog, courseIntro, courseMoveSpeaker, coursePortrait } from './coursePresentation';

describe('chapter and named portrait selection', () => {
  it('gives an unknown chapter Bog art with honest faction labels, not another chapter’s species', () => {
    expect(courseFoeArt('r6')).toBe('bog');
    expect(courseFoeName('r6', 'p')).toMatch(/· Pawn$/);
  });

  it('keeps the shared skeleton tokens while choosing the finale king portrait for either solver colour', () => {
    expect(courseFoeArt('r5')).toBe('warden');
    expect(courseFoeArt('finale')).toBe('warden');
    for (const color of ['w', 'b'] as const) {
      const chess = new Chess(`7k/8/8/8/8/8/8/K7 ${color} - - 0 1`);
      const move = chess.move(color === 'w' ? 'Ka2' : 'Kh7');
      const solver = color === 'w' ? 'b' : 'w';
      const king = courseMoveSpeaker(move, solver, [], 'finale');
      expect(king).toMatchObject({ faction: 'warden', character: 'lich-king', side: 'foe' });
      expect(coursePortrait(king)).toContain('lich-king.webp');
      expect(coursePortrait(courseMoveSpeaker(move, solver, [], 'r5'))).toContain('king-warden.webp');
      expect(coursePortrait(courseMoveSpeaker(move, color, [], 'finale'))).toContain('king-ally.webp');
      const log = new CourseDialogueLog();
      log.add(king, 'Final board');
      expect(coursePortrait(log.all[0].info)).toContain('lich-king.webp');
    }
  });

  it('uses the Lich King for both finale reviews and their map stops, without replacing other skeleton pieces', () => {
    const lessons = COURSE_LESSONS.filter(lesson => lesson.regionId === 'finale');
    expect(lessons).toHaveLength(2);
    for (const lesson of lessons) expect(coursePortrait(courseIntro(lesson, 'n')[0])).toContain('lich-king.webp');
    expect(reviewPortraitFile('finale')).toBe('lich-king.webp');
    expect(reviewPortraitFile('r5')).toBe('king-warden.webp');
    for (const type of ['p', 'n', 'b', 'r', 'q'] as const) {
      expect(courseSpeakerArt('finale', type, 'foe')).toEqual({ faction: 'warden' });
    }
    const chess = new Chess('7k/P7/6K1/8/8/8/8/8 w - - 0 1');
    const promotion = courseMoveSpeaker(chess.move('a8=Q#'), 'b', ['Promotion', 'Mate'], 'finale');
    expect(promotion.type).toBe('q');
    expect(promotion.character).toBeUndefined();
    expect(coursePortrait(promotion)).toContain('queen-warden.webp');
  });

  it('does not reveal the royal skeleton in earlier story chapters, even on later replay', () => {
    for (const region of ['r1', 'r2', 'r3', 'r4', 'r5']) {
      expect(storyPortraitStyle('The Lich King', region)).toBeNull();
    }
    expect(storyPortraitStyle('The Lich King', 'finale')).toContain('lich-king.webp');
    expect(storyPortraitStyle('The Bone Wardens', 'r5')).toContain('king-warden.webp');
    expect(storyPortraitStyle('The Cult Leader', 'r3')).toContain('king-cult.webp');
    expect(storyPortraitStyle('General Flint', 'r4')).toContain('king-legion.webp');
    expect(storyPortraitStyle('Grubnak, the Toad Chief', 'r1')).toContain('king-bog.webp');
    expect(storyPortraitStyle('Ashfang, the Bandit Lord', 'r2')).toContain('king-bandit.webp');
    expect(storyPortraitStyle('General Flint', 'r3')).toBeNull();
    for (const region of ['r2', 'r4']) expect(storyPortraitStyle('Tadwell, the Frog Captain', region)).toContain('tadwell.webp');
    expect(storyPortraitStyle('Sir Hob', 'r4')).toBeNull();
  });
});
