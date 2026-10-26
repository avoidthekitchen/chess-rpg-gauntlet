import type { Move, PieceSymbol } from 'chess.js';
import type { StarterType } from '../game/companions';
import { COURSE_LESSONS, COURSE_REGIONS } from '../game/curriculum';
import { chapterIntro, chapterStory, COMPANION_GREETINGS, ENDING_LEAD, finaleInterlude, INTERLUDE_LEAD, journeyEnding } from '../game/courseStory';
import { companionReaction, courseIntro, courseMoveSpeaker, courseStoryBefore, type CourseCue } from '../ui/coursePresentation';
import { BOSS_VOICES, COMPANION_VOICES, NARRATOR, storyVoice } from './voiceRoles';
import { SPOKEN_ALLY_CUES } from './barks';

export interface VoiceLine { role: string; line: string }

const STARTER_IDS: StarterType[] = ['n', 'b', 'r'];
const PIECES: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k'];
// Our pieces speak only for these moments (src/audio/barks.ts), so only these are recorded.
const ALLY_CUES: CourseCue[][] = SPOKEN_ALLY_CUES.map((cue) => [cue]);

/** A chapter's first-visit introduction, as the map's intro dialog shows it. */
export function introVoices(regionId: string, starter: StarterType): (VoiceLine | null)[] {
  return chapterIntro(regionId, starter).map(({ who, line }) => ({ role: who === 'narrator' ? NARRATOR : who === 'boss' ? BOSS_VOICES[regionId] : COMPANION_VOICES[starter], line }));
}

/** Story pages: the narrated lead, then each speaker. Unknown speakers stay silent. */
export function storyVoices(lead: string, lines: { speaker: string; line: string }[], starter: StarterType): (VoiceLine | null)[] {
  return [{ role: NARRATOR, line: lead }, ...lines.map(({ speaker, line }) => {
    const role = storyVoice(speaker, starter);
    return role ? { role, line } : null;
  })];
}

/**
 * Every recorded line in the journey, built with the same functions the screens use,
 * so the recording script can never drift from what is shown.
 */
export function voiceScript(): VoiceLine[] {
  const out: VoiceLine[] = [];
  const add = (v: VoiceLine | null | undefined) => { if (v?.role && v.line) out.push(v); };
  for (const starter of STARTER_IDS) {
    add({ role: COMPANION_VOICES[starter], line: COMPANION_GREETINGS[starter] });
    for (const event of ['win', 'miss', 'wave'] as const) {
      const info = companionReaction(starter, event);
      add({ role: info.voice!, line: info.line });
    }
    for (const region of COURSE_REGIONS) {
      introVoices(region.id, starter).forEach(add);
      if (region.kind !== 'finale') storyVoices(region.outro, chapterStory(region.id, starter), starter).forEach(add);
    }
    storyVoices(INTERLUDE_LEAD, finaleInterlude(starter), starter).forEach(add);
    storyVoices(ENDING_LEAD, journeyEnding(starter), starter).forEach(add);
    for (const lesson of COURSE_LESSONS) {
      for (const line of courseStoryBefore(lesson, starter)) add({ role: NARRATOR, line });
      for (const info of courseIntro(lesson, starter)) add({ role: info.voice!, line: info.line });
    }
  }
  for (const lesson of COURSE_LESSONS) for (const line of lesson.after) add({ role: NARRATOR, line });
  for (const region of [...COURSE_REGIONS.map((r) => r.id)]) {
    for (const piece of PIECES) {
      const info = courseMoveSpeaker({ color: 'b', piece } as Move, 'w', [], region);
      add({ role: info.voice!, line: info.line });
    }
  }
  for (const piece of PIECES) {
    for (const cues of ALLY_CUES) {
      const promoted = cues.includes('Promotion');
      if (promoted && (piece === 'p' || piece === 'k')) continue;
      const move = (promoted ? { color: 'w', piece: 'p', promotion: piece } : { color: 'w', piece }) as Move;
      const info = courseMoveSpeaker(move, 'w', cues, 'r1');
      add(info.voice ? { role: info.voice, line: info.line } : null);
    }
  }
  const seen = new Set<string>();
  return out.filter(({ role, line }) => {
    const id = `${role}\n${line}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
