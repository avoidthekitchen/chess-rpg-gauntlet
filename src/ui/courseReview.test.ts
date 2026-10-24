import { describe, expect, it } from 'vitest';
import { COURSE_LESSONS, courseRegion } from '../game/curriculum';
import { COURSE_CAST, COURSE_OPENINGS, COURSE_VOICES } from '../game/courseCast';
import { finaleInterlude } from '../game/courseStory';
import { courseIntro } from './coursePresentation';

// Specific answer labels, including their inflections. Generic king safety and reply calculation remain allowed.
const answerLabel = /\b(?:pin\w*|skewer\w*|x[- ]?ray\w*|discover\w*|double[- ]check\w*|fork\w*|(?:under)?promot\w*|(?:check)?mate\w*|back[- ]rank\w*|defen[cd]\w*|deflect\w*|race\w*|passed[- ]pawn\w*|intermezzo\w*|in[- ]between|rook[- ]support|escape[- ]pin\w*)\b/i;
describe('mixed review presentation', () => {
  it('detects inflected answer labels', () => {
    for (const text of ['pinned', 'skewered', 'discovered', 'forks', 'x-rays', 'checkmate', 'defending', 'deflection', 'passed pawns', 'intermezzo', 'in-between'])
      expect(text).toMatch(answerLabel);
  });
  it('keeps every review’s pre-move text neutral for every companion', () => {
    for (const lesson of COURSE_LESSONS.filter(l => l.review)) {
      const text = [lesson.title, lesson.objective, ...lesson.before, ...Object.values(lesson.showLines), ...lesson.waves.map(w => w.line)];
      for (const starter of ['n', 'b', 'r'] as const) text.push(...courseIntro(lesson, starter).map(line => line.line));
      if (courseRegion(lesson.regionId)?.kind === 'finale') {
        const region = courseRegion(lesson.regionId)!;
        text.push(region.subtitle, region.intro, ...finaleInterlude('n').map(line => line.line), ...finaleInterlude('b').map(line => line.line), ...finaleInterlude('r').map(line => line.line));
      }
      // After/takeaway text appears only after accepted completion, not before a review move.
      for (const line of text) expect(line, `${lesson.id}: ${line}`).not.toMatch(answerLabel);
    }
  });
  it('registers faction species, voices and named review hosts for all chapters', () => {
    for (const [id, cast] of Object.entries(COURSE_CAST)) {
      expect(Object.keys(cast.species)).toHaveLength(6);
      expect(Object.keys(COURSE_VOICES[id])).toHaveLength(6);
      const review = COURSE_LESSONS.find(l => l.regionId === id && l.review)!;
      expect(courseIntro(review, 'n')[0].name).toBe(courseRegion(id)!.bossName);
    }
    expect(COURSE_OPENINGS['r2-road-review']).toContain('account');
    expect(COURSE_CAST.r2.species.q).toBe('Stoat Queen');
  });
});
