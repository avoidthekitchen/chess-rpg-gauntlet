export interface AiProfile {
  /** Stockfish search depth. */
  depth: number;
  /** How many candidate moves to ask Stockfish for. */
  multiPv: number;
  /**
   * How far below the best move (in centipawns) the enemy may pick. A larger value
   * gives more believable, human-like mistakes instead of Stockfish's random blunders.
   */
  maxLoss: number;
}

export interface Difficulty {
  id: DifficultyId;
  label: string;
  blurb: string;
  ai: AiProfile;
  rewinds: number;
  threatSight: boolean;
}

export type DifficultyId = 'squire' | 'knight' | 'champion' | 'grandmaster';

export const DIFFICULTIES: Record<DifficultyId, Difficulty> = {
  squire: {
    id: 'squire',
    label: 'Squire',
    blurb: 'New to chess. Weak enemies, Threat Sight on, 3 rewinds.',
    ai: { depth: 5, multiPv: 6, maxLoss: 300 },
    rewinds: 3,
    threatSight: true,
  },
  knight: {
    id: 'knight',
    label: 'Knight',
    blurb: 'You know the moves. Enemies make fewer mistakes, 2 rewinds.',
    ai: { depth: 8, multiPv: 5, maxLoss: 120 },
    rewinds: 2,
    threatSight: true,
  },
  champion: {
    id: 'champion',
    label: 'Champion',
    blurb: 'Club player. Threat Sight off by default, 1 rewind.',
    ai: { depth: 11, multiPv: 4, maxLoss: 40 },
    rewinds: 1,
    threatSight: false,
  },
  grandmaster: {
    id: 'grandmaster',
    label: 'Grandmaster',
    blurb: 'Full-strength Stockfish lite. No rewinds.',
    ai: { depth: 15, multiPv: 1, maxLoss: 0 },
    rewinds: 0,
    threatSight: false,
  },
};
