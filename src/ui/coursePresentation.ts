import { COURSE_OPENINGS, COURSE_VOICES, COURSE_FOE_ART, courseFoeName, courseCast } from '../game/courseCast';
import { type Chess, type Color, type Move } from 'chess.js';
import { isDoubleCheck } from '../game/ambush';
import type { StarterType } from '../game/companions';
import { STARTERS } from '../game/companions';
import { courseRegion, type CourseLesson } from '../game/curriculum';
import { DialogueLog, holdMs, moveLabel } from './dialogue';
import { esc } from './overlay';
import { portraitStyle } from './portrait';
import { SPECIES, pieceName, type SpeakerInfo } from './speaker';

export type CourseCue = 'Capture' | 'Check' | 'Fork' | 'Double check' | 'Promotion' | 'Mate';

/** Reviewed first solver moves. A source tag alone never authorizes a fork claim. */
export const COURSE_FORK_MOVES: Readonly<Record<string, string>> = {
  HGP8R: 'e6d4', fV7qS: 'b5d4', HCLdy: 'b5c3', '9h861': 'd5e7', f766G: 'b4c2',
  '1FEC8': 'c6d4', '8wC4T': 'a4b6', '93uiZ': 'f4f8', '87P1s': 'h3h7', Nj4H1: 'f4a4',
  XWGtt: 'e3e8', '4a4pt': 'b6d8', QyMRm: 'e2e6', '6EHwR': 'd4d1', DYCLg: 'd4f5',
  zFv3K: 'f5g3', '0E0md': 'c5e6', DG2HO: 'g4e3', '4QI5N': 'e4d2', eQyKb: 'a5c7', Bceqz: 'd7b7',
};

/** Inspect the resulting board only after the runner accepts a solver move. */
export function courseMoveCues(chess: Chess, move: Move, accepted: boolean, puzzleId: string, publishedIndex: number): CourseCue[] {
  if (!accepted) return [];
  const cues: CourseCue[] = [];
  if (move.captured) cues.push('Capture');
  if (move.promotion) cues.push('Promotion');
  const double = isDoubleCheck(chess);
  if (double) cues.push('Double check');
  else if (chess.isCheck() && !chess.isCheckmate()) cues.push('Check');
  const uci = move.from + move.to + (move.promotion ?? '');
  if (publishedIndex === 1 && COURSE_FORK_MOVES[puzzleId] === uci) {
    const targets = chess.board().flat().filter(p => p && p.color !== move.color && p.type !== 'p' && chess.attackers(p.square, move.color).includes(move.to));
    if (targets.length >= 2 && targets.some(p => p?.type === 'k')) cues.push('Fork');
  }
  if (chess.isCheckmate()) cues.push('Mate');
  return cues;
}

export function companionSpeaker(starter: StarterType, line: string): SpeakerInfo {
  return { side: 'ally', name: `${STARTERS[starter].name} · ${STARTERS[starter].species}`, type: starter, line };
}

/** Companion coaching is separate: a generic moving piece never borrows their name. */
export function courseMoveSpeaker(move: Move, solver: Color, cues: readonly CourseCue[], regionId: string): SpeakerInfo {
  const side = move.color === solver ? 'ally' : 'foe';
  const type = move.promotion ?? move.piece;
  let line: string;
  if (side === 'foe') {
    line = (COURSE_VOICES[regionId] ?? COURSE_VOICES.r2)[type];
  }
  else if (cues.includes('Mate')) line = 'Checkmate. Their king has no safe reply.';
  else if (cues.includes('Promotion')) line = 'A new piece, ready for the next step.';
  else if (cues.includes('Double check')) line = 'Two pieces check their king at once!';
  else if (cues.includes('Fork')) line = 'Check, and another piece under attack!';
  else if (cues.includes('Check')) line = 'Check. Their king must answer.';
  else if (cues.includes('Capture')) line = 'Got you!';
  else line = { p: 'One step closer.', n: 'Hop to it!', b: 'Along the diagonal.', r: 'Slow and steady.', q: 'Watch closely.', k: 'Steady now.' }[type];
  return { side, type, name: side === 'ally' ? SPECIES[type] : courseFoeName(regionId, type), line };
}

const REACTIONS: Record<StarterType, { win: string; miss: string; wave: string }> = {
  n: { win: 'Every board cleared! That calls for a victory hop.', miss: 'Even a brave knight stops to look again.', wave: 'A fine leap forward. Ready for the next board?' },
  b: { win: 'Well observed. A good plan survives the reply.', miss: 'Look again. What can your opponent do next?', wave: 'An idea understood. Shall we test it again?' },
  r: { win: 'Well played. One sound move after another.', miss: 'No hurry. Settle, look, then move.', wave: 'Good work. Keep that steady pace.' },
};
export const companionReaction = (starter: StarterType, event: 'win' | 'miss' | 'wave') => companionSpeaker(starter, REACTIONS[starter][event]);

const INTRO: Record<StarterType, string> = {
  n: 'Hop to it! I’ll show you, then it’s your turn.',
  b: 'Let us look carefully. What does the board allow?',
  r: 'One board at a time. We have time to look.',
};
export function courseStoryBefore(lesson: CourseLesson, starter: StarterType) {
  return lesson.before.map(line => line.replace(/Sir Hob|Old Brick/g, STARTERS[starter].name));
}
export function courseIntro(lesson: CourseLesson, starter: StarterType): SpeakerInfo[] {
  const region = courseRegion(lesson.regionId);
  const cast = courseCast(lesson.regionId);
  const opening = lesson.review ? cast.reviewOpening : cast.lessonOpening;
  return [{ side: 'foe', type: lesson.review ? 'k' : 'p', name: lesson.review ? region?.bossName ?? 'The challenger' : courseFoeName(lesson.regionId, 'p'), line: COURSE_OPENINGS[lesson.id] ?? opening },
    companionSpeaker(starter, lesson.review ? 'Your turn. Read each board and choose your plan.' : INTRO[starter])];
}

/** Lessons retain a single journal across the example, waves, and retries. */
export class CourseDialogueLog {
  private log: DialogueLog;
  private labels: string[] = [];
  constructor(private readonly cap = 120) { this.log = new DialogueLog(cap); }
  add(info: SpeakerInfo, scope: string, plies = 0) {
    this.log.add(info, plies);
    this.labels.push(`${scope} · ${moveLabel(plies)}`);
    if (this.labels.length > this.cap) this.labels.splice(0, this.labels.length - this.cap);
  }
  get all() { return this.log.all.map((entry, i) => ({ ...entry, label: this.labels[i] })); }
  get last() { return this.log.last?.info; }
}

export function coursePortrait(info: SpeakerInfo, extra = '') {
  return `<span class="course-portrait ${info.side} ${extra}" style="${portraitStyle(info.type, info.side === 'ally' ? 'ally' : COURSE_FOE_ART)}" aria-hidden="true"></span>`;
}
export function courseDialogueRow(info: SpeakerInfo, extra = '') {
  return `<div class="course-dialogue ${info.side} ${extra}">${coursePortrait(info)}<div><strong>${esc(info.name)}</strong><p>${esc(info.line)}</p></div></div>`;
}
export interface CourseBanner { kind: 'tactic' | 'capture'; side: 'ally' | 'foe'; title: string; detail: string }
const TACTIC_TITLES: [CourseCue, string][] = [['Mate', 'Checkmate!'], ['Fork', 'Fork!'], ['Double check', 'Double check!'], ['Promotion', 'Promotion!']];
/**
 * One banner per move. Tactics outrank a capture close-up, which outranks a plain check.
 * Pawn captures alone get no banner, so routine trades stay quiet.
 */
export function courseBanner(move: Move, cues: readonly CourseCue[], solver: Color): CourseBanner | null {
  const side = move.color === solver ? 'ally' : 'foe';
  const shown = cues.filter(cue => cue !== 'Capture' || (move.captured && move.captured !== 'p'));
  if (!shown.length) return null;
  const tactic = TACTIC_TITLES.find(([cue]) => shown.includes(cue));
  const detail = (title: string) => shown.filter(cue => cue !== title).join(' · ');
  if (tactic) return { kind: 'tactic', side, title: tactic[1], detail: detail(tactic[0]) };
  if (shown.includes('Capture')) {
    const title = side === 'ally' ? captureLine(move) : `Their ${pieceName(move.promotion ?? move.piece)} takes your ${pieceName(move.captured!)}!`;
    return { kind: 'capture', side, title, detail: detail('Capture') };
  }
  return { kind: 'tactic', side, title: 'Check!', detail: '' };
}

/** Banner for any move in a published line: accepted solver moves, and opponent replies after the setup move. */
export function lineBanner(chess: Chess, move: Move, solver: Color, accepted: boolean, puzzleId: string, publishedIndex: number): CourseBanner | null {
  if (accepted) return courseBanner(move, courseMoveCues(chess, move, true, puzzleId, publishedIndex), solver);
  if (move.color === solver || publishedIndex < 1) return null;
  return courseBanner(move, courseMoveCues(chess, move, true, puzzleId, -1), solver);
}

export function captureLine(move: Move) {
  return `${SPECIES[move.promotion ?? move.piece]} takes their ${pieceName(move.captured!)}!`;
}

/** Cancellable wall-clock holds survive a layout rebuild, and release all waiters on exit. */
export class CourseHolds {
  private pending = new Map<ReturnType<typeof setTimeout>, () => void>();
  wait(ms: number) {
    return new Promise<void>(resolve => {
      const timer = setTimeout(() => { this.pending.delete(timer); resolve(); }, ms);
      this.pending.set(timer, resolve);
    });
  }
  clear() {
    for (const [timer, resolve] of this.pending) { clearTimeout(timer); resolve(); }
    this.pending.clear();
  }
}

/** Speech expires independently of HUD renders; desktop can keep the last line. */
export class CourseSpeech {
  info: SpeakerInfo | null = null;
  visible = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(private readonly changed: () => void) {}
  show(info: SpeakerInfo) {
    this.cancelTimer();
    this.info = info;
    this.visible = true;
    this.release();
  }
  hold() { this.cancelTimer(); }
  release() {
    this.cancelTimer();
    if (!this.info || !this.visible) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.visible = false;
      this.changed();
    }, holdMs(this.info.line));
    this.changed();
  }
  dismiss() {
    this.cancelTimer();
    this.visible = false;
    this.changed();
  }
  clear() {
    this.cancelTimer();
    this.info = null;
    this.visible = false;
    this.changed();
  }
  private cancelTimer() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}

/** Initial objectives give way to useful coaching; changed status and hints remain. */
export function courseGuidance(message: string, objective: string, coach: string) {
  const status = coach && (message === objective || message === coach) ? '' : message || (coach ? '' : objective);
  return { status, coach };
}

/** Compact speech cannot cover the advice while choosing or reading a finished example. */
export function courseAllowsSpeech(phase: string, persistent: boolean) {
  return !['briefing', 'won', 'lost'].includes(phase) && (persistent || !['solving', 'taught'].includes(phase));
}
