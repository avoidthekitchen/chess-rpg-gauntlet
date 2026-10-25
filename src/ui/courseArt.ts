import type { PieceSymbol } from 'chess.js';
import { courseFoeArt } from '../game/courseCast';
import { courseRegion } from '../game/curriculum';
import { portraitStyle } from './portrait';
import { pieceName, type Side, type SpeakerInfo } from './speaker';

/** Carry portrait identity with each line, including when it is replayed in history. */
export function courseSpeakerArt(regionId: string, type: PieceSymbol, side: Side): Pick<SpeakerInfo, 'faction' | 'character'> {
  if (side === 'ally') return {};
  return { faction: courseFoeArt(regionId), ...(regionId === 'finale' && type === 'k' ? { character: 'lich-king' as const } : {}) };
}

/** Map review stops use the same king identity as their introduction and dialogue. */
export function reviewPortraitFile(regionId: string) {
  const art = courseSpeakerArt(regionId, 'k', 'foe');
  return `${art.character ?? `${pieceName('k')}-${art.faction}`}.webp`;
}

/** Each chapter's boss gets its king portrait. A replayed earlier chapter must not reveal the finale's royal skeleton. */
export function storyPortraitStyle(speaker: string, regionId: string): string | null {
  if (speaker === 'Tadwell, the Frog Captain') return portraitStyle('n', 'ally', 'tadwell');
  if (speaker !== courseRegion(regionId)?.bossName) return null;
  const art = courseSpeakerArt(regionId, 'k', 'foe');
  return portraitStyle('k', art.faction!, art.character);
}
