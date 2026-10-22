import type { RegionMap } from './campaign';
import type { BattleDef } from './content';
import { REGION1_BATTLES } from './region1Battles';

/** Region 1, the Bog: the Bog Goblins, their map, and (step 4) the Goblin Chief. */

export const REGION1_NAME = 'The Bog';
export const REGION1_FACTION = 'Bog Goblins';

/**
 * A small branching map, like Into the Breach's islands: the first skirmish opens two
 * paths, and the boss duel opens after any four wins, so one battle can be skipped.
 */
export const REGION1_MAP: RegionMap = {
  start: ['r1-reeds'],
  bossNeeds: 4,
  nodes: [
    { id: 'r1-reeds', x: 0.36, y: 0.7, next: ['r1-guard', 'r1-trades'] },
    { id: 'r1-guard', x: 0.2, y: 0.47, next: ['r1-squire'] },
    { id: 'r1-trades', x: 0.66, y: 0.53, next: ['r1-backrank'] },
    { id: 'r1-squire', x: 0.32, y: 0.26, next: [] },
    { id: 'r1-backrank', x: 0.78, y: 0.3, next: [] },
  ],
};

/** Where the town and the boss sit on the map. */
export const REGION1_TOWN = { x: 0.16, y: 0.86 };
export const REGION1_BOSS = { x: 0.58, y: 0.1 };

export const battleById = (id: string): BattleDef | undefined => REGION1_BATTLES.find((b) => b.id === id);
export { REGION1_BATTLES };
