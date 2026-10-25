import type { PieceSymbol } from 'chess.js';
import { courseFoeArt } from '../game/courseCast';
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

/** A replayed earlier chapter must not reveal the finale's royal skeleton portrait. */
export function storyPortraitStyle(speaker: string, regionId: string): string | null {
  if (speaker === 'The Lich King') {
    const art = courseSpeakerArt(regionId, 'k', 'foe');
    return art.character ? portraitStyle('k', art.faction!, art.character) : null;
  }
  if (speaker === 'Tadwell, the Frog Captain') return portraitStyle('n', 'ally', 'tadwell');
  if (regionId === 'r2' && speaker === 'Ashfang, the Bandit Lord') return portraitStyle('k', 'bandit');
  if (regionId === 'r3' && speaker === 'The Cult Leader') return portraitStyle('k', 'cult');
  if (regionId === 'r4' && speaker === 'General Flint') return portraitStyle('k', 'legion');
  if (regionId === 'r5' && speaker === 'The Bone Wardens') return portraitStyle('k', 'warden');
  return null;
}
