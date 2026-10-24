import { Chess } from 'chess.js';
import { startAmbush, type AmbushRun } from './ambush';
import type { StarterType } from './campaign';
import { COURSE_REGIONS, courseLesson } from './curriculum';
import type { DifficultyId } from './difficulty';

export interface JourneyResult {
  lessonId: string;
  won: boolean;
  clean: boolean;
  noHint: boolean;
  interrupted: boolean;
}
export interface JourneySave {
  version: 1;
  finaleComplete: boolean;
  endingSeen?: boolean;
  difficulty: DifficultyId;
  starter: StarterType;
  currentRegion: string;
  completed: string[];
  stars: Record<string, { clean: boolean; noHint: boolean }>;
  attempts: number;
  retryWaves: Record<string, number>;
  active: { lessonId: string; run: AmbushRun } | null;
  lastResult: JourneyResult | null;
}

export function newJourney(difficulty: DifficultyId = 'knight', starter: StarterType = 'n'): JourneySave {
  return { version: 1, finaleComplete: false, endingSeen: false, difficulty, starter, currentRegion: COURSE_REGIONS[0].id, completed: [],
    stars: {}, attempts: 0, retryWaves: {}, active: null, lastResult: null };
}

/** Each lesson opens the next. Completed lessons stay available for practice. */
export function lessonUnlocked(save: JourneySave, id: string): boolean {
  const lessons = COURSE_REGIONS.flatMap(region => region.lessons);
  const index = lessons.indexOf(id);
  return index >= 0 && lessons.slice(0, index).every(previous => save.completed.includes(previous));
}

export function regionUnlocked(save: JourneySave, id: string): boolean {
  const region = COURSE_REGIONS.find(candidate => candidate.id === id);
  return !!region && lessonUnlocked(save, region.lessons[0]);
}

export const journeyComplete = (save: JourneySave): boolean =>
  save.finaleComplete && COURSE_REGIONS.every(region => region.lessons.every(id => save.completed.includes(id)));

/** All difficulties permit retries. The old campaign's Grandmaster removal does not apply. */
export function beginJourneyLesson(save: JourneySave, id: string): boolean {
  if (!lessonUnlocked(save, id) || (save.active && !save.active.run.settled)) return false;
  const lesson = courseLesson(id);
  if (!lesson) return false;
  save.active = { lessonId: id, run: startAmbush(lesson, save.difficulty, save.retryWaves[id]) };
  save.currentRegion = lesson.regionId;
  save.lastResult = null;
  return true;
}

/** Commit before animation. Repeated callbacks and reloads cannot count an attempt twice. */
export function settleJourney(save: JourneySave, abandon = false, interrupted = false): boolean {
  const active = save.active;
  if (!active || active.run.settled || !lessonUnlocked(save, active.lessonId)) return false;
  const lesson = courseLesson(active.lessonId);
  if (!lesson) return false;
  const run = active.run;
  if (!Number.isInteger(run.wave) || run.wave < 0 || run.wave >= lesson.waves.length) return false;
  if (run.status === 'won' && run.wave !== lesson.waves.length - 1) return false;
  if (abandon && run.status !== 'won') run.status = 'lost';
  if (run.status !== 'won' && run.status !== 'lost') return false;
  let won = run.status === 'won';
  const region = COURSE_REGIONS.find(candidate => candidate.id === lesson.regionId);
  const finalLesson = region?.kind === 'finale' && region.lessons.at(-1) === active.lessonId;
  if (won && finalLesson) {
    try { won = new Chess(run.fen).isCheckmate(); } catch { won = false; }
    // Bad terminal content must not lock every lesson behind an unsettled attempt.
    if (!won) run.status = 'lost';
  }
  run.settled = true;
  save.attempts++;
  save.lastResult = { lessonId: active.lessonId, won, clean: won && run.misses === 0,
    noHint: won && run.hintsUsed === 0, interrupted: !won && interrupted };
  if (won) {
    if (finalLesson) save.finaleComplete = true;
    if (!save.completed.includes(active.lessonId)) save.completed.push(active.lessonId);
    const previous = save.stars[active.lessonId];
    save.stars[active.lessonId] = { clean: !!previous?.clean || run.misses === 0,
      noHint: !!previous?.noHint || run.hintsUsed === 0 };
    delete save.retryWaves[active.lessonId];
    const index = COURSE_REGIONS.findIndex(region => region.id === lesson.regionId);
    const next = COURSE_REGIONS[index + 1];
    if (lesson.review && next && regionUnlocked(save, next.id)) save.currentRegion = next.id;
  } else {
    save.retryWaves[active.lessonId] = run.wave;
  }
  return true;
}

/** Content identity comes from the registered finale, not scene-specific lesson names. */
export const finaleChapter = () => COURSE_REGIONS.find(region => region.kind === 'finale');
export const finalEncounter = () => finaleChapter()?.lessons.at(-1);
export const finaleInterludeUnlocked = (save: JourneySave) =>
  !!finaleChapter()?.lessons.slice(0, -1).every(id => save.completed.includes(id));
export const endingPending = (save: JourneySave) => journeyComplete(save) && !save.endingSeen;

/** A committed win remains a milestone while its visual reply is still playing. */
export function journeyMilestone(save: JourneySave, lessonId: string): 'chapter' | 'interlude' | 'ending' | null {
  const lesson = courseLesson(lessonId);
  if (!lesson?.review || save.active?.lessonId !== lessonId || !save.active.run.settled ||
    save.active.run.status !== 'won') return null;
  if (lessonId === finalEncounter()) return journeyComplete(save) ? 'ending' : null;
  return lesson.regionId === finaleChapter()?.id ? 'interlude' : 'chapter';
}
