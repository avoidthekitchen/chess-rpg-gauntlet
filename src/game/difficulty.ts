export type DifficultyId = 'squire' | 'knight' | 'champion' | 'grandmaster';

export const DIFFICULTIES: Record<DifficultyId, { id: DifficultyId; label: string }> = {
  squire: { id: 'squire', label: 'Gentle' },
  knight: { id: 'knight', label: 'Brave' },
  champion: { id: 'champion', label: 'Champion' },
  grandmaster: { id: 'grandmaster', label: 'Grandmaster' },
};
