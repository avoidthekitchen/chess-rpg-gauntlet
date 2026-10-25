import type { PieceSymbol } from 'chess.js';
import { STARTERS, type StarterType } from '../game/companions';
import { COURSE_VOICES } from '../game/courseCast';
import { COURSE_REGIONS } from '../game/curriculum';

/**
 * Who voices a line. A role is a cast member (`hob`, `grubnak`), a faction piece
 * (`r1-p`), one of our pieces (`ally-n`) or the `narrator`. audio/voices.json casts each role.
 */
export const COMPANION_VOICES: Record<StarterType, string> = { n: 'hob', b: 'ollie', r: 'brick' };
export const BOSS_VOICES: Record<string, string> = { r1: 'grubnak', r2: 'ashfang', r3: 'cult-leader', r4: 'flint', r5: 'wardens', finale: 'lich' };
const NAMED: Record<string, string> = {
  'Saffron, the Fox Queen': 'saffron',
  'Tadwell, the Frog Captain': 'tadwell',
  ...Object.fromEntries(COURSE_REGIONS.map((r) => [r.bossName, BOSS_VOICES[r.id]])),
};
export const NARRATOR = 'narrator';

/** The player's king almost never speaks (docs/design/story.md), so our king's lines stay unvoiced. */
export function pieceVoice(side: 'ally' | 'foe', type: PieceSymbol, regionId: string): string | undefined {
  if (side === 'ally') return type === 'k' ? undefined : `ally-${type}`;
  const region = COURSE_VOICES[regionId] ? regionId : 'r2';
  return type === 'k' ? BOSS_VOICES[region] : `${region}-${type}`;
}

/** Story pages name speakers in full; the companion speaks under their own name. */
export function storyVoice(speaker: string, starter: StarterType): string | undefined {
  return speaker === STARTERS[starter].name ? COMPANION_VOICES[starter] : NAMED[speaker];
}

/** FNV-1a over role and text: a changed line gets a new key, so stale recordings are never played. */
export function voiceKey(role: string, line: string): string {
  let h = 0x811c9dc5;
  for (const ch of `${role}\n${line}`) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, '0');
}
