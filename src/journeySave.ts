import { Chess } from 'chess.js';
import { AMBUSH_HELP, uciMove, wavePuzzle, type AmbushRun } from './game/ambush';
import { COURSE_REGIONS, courseLesson } from './game/curriculum';
import { DIFFICULTIES } from './game/difficulty';
import { lessonUnlocked, newJourney, regionUnlocked, settleJourney, type JourneySave } from './game/journey';
import { store } from './store';
import { preparePreviewSave, previewRegion } from './journeyPreview';

export const JOURNEY_KEY = previewRegion ? `pawnshire-preview-v1:${previewRegion}` : 'pawnshire-journey-v1';
export function persistJourney(save: JourneySave) { store.set(JOURNEY_KEY, JSON.stringify(save)); }
export function clearJourney() { store.remove(JOURNEY_KEY); }

/** New/reset preview journeys return to the requested chapter with isolated progress. */
export function newJourneyForMode(...args: Parameters<typeof newJourney>): JourneySave {
  const save = newJourney(...args);
  return previewRegion ? preparePreviewSave(save, previewRegion) : save;
}

/** Run once at boot, not on every map visit. Reload preserves this preview's progress. */
export function prepareJourneyPreview(): boolean {
  if (!previewRegion) return false;
  const save = loadJourney() ?? newJourneyForMode();
  save.currentRegion = previewRegion;
  persistJourney(save);
  return true;
}

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const natural = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const knownLesson = (id: string) => COURSE_REGIONS.some(region => region.lessons.includes(id));

/** Restore the board from its published line. Stored FEN is never trusted or played. */
function restoreRun(lessonId: string, value: unknown): AmbushRun | null {
  if (!object(value) || !Object.hasOwn(DIFFICULTIES, String(value.difficulty)) ||
    !natural(value.wave) || !natural(value.step) || !natural(value.misses) || !natural(value.hintsUsed) ||
    typeof value.settled !== 'boolean' || !['solving', 'waveWon', 'won', 'lost'].includes(String(value.status))) return null;
  const def = courseLesson(lessonId);
  if (!def || value.wave >= def.waves.length ||
    (value.backupWave !== null && (!natural(value.backupWave) || value.backupWave >= def.waves.length))) return null;
  const run = { ...value } as unknown as AmbushRun;
  const p = wavePuzzle(def, run);
  const finalStep = (p.moves.length - 2) / 2;
  if (!Number.isInteger(finalStep) || run.step > finalStep) return null;
  const finished = run.status === 'won' || run.status === 'waveWon';
  if (finished && run.step !== finalStep) return null;
  if (run.status === 'won' && run.wave !== def.waves.length - 1) return null;
  if (run.status === 'waveWon' && run.wave === def.waves.length - 1) return null;
  if (run.settled && run.status !== 'won' && run.status !== 'lost') return null;
  const limit = AMBUSH_HELP[run.difficulty].misses;
  if (limit !== null && (run.misses > limit || (run.misses === limit && run.status !== 'lost'))) return null;
  if (!AMBUSH_HELP[run.difficulty].hints && run.hintsUsed !== 0) return null;
  const chess = new Chess(p.fen);
  const last = finished ? p.moves.length - 1 : 2 * run.step;
  for (let i = 0; i <= last; i++) chess.move(uciMove(p.moves[i]));
  run.fen = chess.fen();
  return run;
}

/** A separate curriculum: older army campaigns and pilot progress stay untouched. */
export function loadJourney(): JourneySave | null {
  try {
    const raw = store.get(JOURNEY_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1 || !Object.hasOwn(DIFFICULTIES, String(value.difficulty)) ||
      !['n', 'b', 'r'].includes(String(value.starter)) || typeof value.currentRegion !== 'string' ||
      !Array.isArray(value.completed) || !value.completed.every(id => typeof id === 'string' && knownLesson(id)) ||
      new Set(value.completed).size !== value.completed.length || !natural(value.attempts) ||
      !object(value.stars) || !object(value.retryWaves) ||
      (Object.hasOwn(value, 'finaleComplete') && typeof value.finaleComplete !== 'boolean')) return null;
    const save = value as unknown as JourneySave;
    save.finaleComplete ??= false;
    save.endingSeen = value.endingSeen === true;
    if (!save.completed.every(id => lessonUnlocked(save, id)) || !regionUnlocked(save, save.currentRegion)) return null;
    for (const [id, stars] of Object.entries(value.stars)) {
      if (!save.completed.includes(id) || !object(stars) || typeof stars.clean !== 'boolean' || typeof stars.noHint !== 'boolean') return null;
    }
    for (const [id, wave] of Object.entries(value.retryWaves)) {
      if (!lessonUnlocked(save, id) || !natural(wave) || wave >= courseLesson(id)!.waves.length) return null;
    }
    if (save.lastResult !== null) {
      const result = value.lastResult;
      if (!object(result) || typeof result.lessonId !== 'string' || !lessonUnlocked(save, result.lessonId) ||
        !['won', 'clean', 'noHint', 'interrupted'].every(key => typeof result[key] === 'boolean') ||
        (result.won && (!save.completed.includes(result.lessonId) || result.interrupted)) ||
        (!result.won && (result.clean || result.noHint))) return null;
    }
    if (value.active !== null) {
      if (!object(value.active) || typeof value.active.lessonId !== 'string' || !lessonUnlocked(save, value.active.lessonId)) return null;
      const run = restoreRun(value.active.lessonId, value.active.run);
      if (!run) return null;
      if (!run.settled && run.difficulty !== save.difficulty) return null;
      save.active = { lessonId: value.active.lessonId, run };
      if (run.settled) {
        if (!save.lastResult || save.lastResult.lessonId !== save.active.lessonId || save.lastResult.won !== (run.status === 'won')) return null;
      } else settleJourney(save, true, true);
    }
    const finalLesson = COURSE_REGIONS.find(region => region.kind === 'finale')?.lessons.at(-1);
    save.finaleComplete = !!(finalLesson && save.completed.includes(finalLesson));
    if (!save.finaleComplete) save.endingSeen = false;
    persistJourney(save);
    return save;
  } catch { return null; }
}
