import type { PieceSymbol } from 'chess.js';
import type { DifficultyId } from './difficulty';

/**
 * The campaign save: who you are, your army, your gold and what you've cleared.
 * Plain data and pure functions, so it's easy to test and to store as JSON.
 */

export type StarterType = 'n' | 'b' | 'r';

export interface Character {
  id: string;
  type: Exclude<PieceSymbol, 'k'>;
  name: string;
  role: 'starter' | 'hero' | 'hired';
}

export interface SaveState {
  version: 1;
  difficulty: DifficultyId;
  /** Answered "yes" to "Do you know how the pieces move?" */
  knowsMoves: boolean;
  starter: StarterType;
  /** Your army, not counting your king (that's you). */
  roster: Character[];
  gold: number;
  /** Battles won at least once. */
  cleared: string[];
  /** Battles removed from the map after a loss (Grandmaster only). */
  lostForGood: string[];
  bossBeaten: boolean;
  heroJoined: boolean;
  /** Academy lessons completed. */
  lessonsDone: string[];
  /** Puzzle ids on the bounty board right now. */
  bounties: string[];
  /** Puzzle ids already solved or failed, never offered again. */
  bountiesDone: string[];
  /** Battles fought (won or lost); the bounty board refreshes when this changes. */
  battlesFought: number;
  /** `battlesFought` when the bounty board was last refreshed. */
  bountiesRefreshedAt: number;
  nextId: number;
  /** One-time story moments already shown. */
  seen: string[];
  /** Bonus goals already paid, as "battleId:kind". */
  bonusesEarned: string[];
  /** Tactic gold already paid per battle (capped). */
  tacticGold: Record<string, number>;
}

export const STARTERS: Record<StarterType, { name: string; species: string; blurb: string }> = {
  n: { name: 'Sir Hob', species: 'Frog Knight', blurb: 'Hops over anything in the way. Loves a good fork.' },
  b: { name: 'Sage Ollie', species: 'Owl Bishop', blurb: 'Sees down the long diagonals. Pins, skewers, patience.' },
  r: { name: 'Old Brick', species: 'Tortoise Rook', blurb: 'Slow, sturdy, unstoppable on an open file.' },
};

/** Names for hired pieces, by type, used in order. */
const NAMES: Record<Exclude<PieceSymbol, 'k'>, string[]> = {
  p: ['Pip', 'Nib', 'Tam', 'Bramble', 'Fen', 'Moss', 'Wick', 'Thistle', 'Burr', 'Sorrel'],
  n: ['Sir Hob', 'Dame Lily', 'Sir Croak'],
  b: ['Sage Ollie', 'Brother Hoot', 'Sister Plume'],
  r: ['Old Brick', 'Granite', 'Mossback'],
  q: ['Ember', 'Juniper'], // Saffron is the region 1 hero, so hires never take her name
};

export const STARTING_GOLD = 20;

/** Fills in fields added after a save was written, so older saves keep working. */
export function upgradeSave(s: SaveState): SaveState {
  const fresh = newSave(s.difficulty, s.starter, s.knowsMoves);
  for (const k of Object.keys(fresh) as (keyof SaveState)[]) {
    if (s[k] === undefined) (s as unknown as Record<string, unknown>)[k] = fresh[k];
  }
  return s;
}

export function newSave(difficulty: DifficultyId, starter: StarterType, knowsMoves: boolean): SaveState {
  const s: SaveState = {
    version: 1,
    difficulty,
    knowsMoves,
    starter,
    roster: [],
    gold: STARTING_GOLD,
    cleared: [],
    lostForGood: [],
    bossBeaten: false,
    heroJoined: false,
    lessonsDone: [],
    bounties: [],
    bountiesDone: [],
    battlesFought: 0,
    bountiesRefreshedAt: -1,
    nextId: 1,
    seen: [],
    bonusesEarned: [],
    tacticGold: {},
  };
  addCharacter(s, starter, 'starter', STARTERS[starter].name);
  // Every starter comes with two mouse pawns: K+N or K+B alone can't force mate.
  addCharacter(s, 'p', 'hired');
  addCharacter(s, 'p', 'hired');
  return s;
}

/** Adds a piece to the army with the next unused name for its type. */
export function addCharacter(s: SaveState, type: Character['type'], role: Character['role'], name?: string): Character {
  const taken = new Set(s.roster.map((c) => c.name));
  const pick = name ?? NAMES[type].find((n) => !taken.has(n)) ?? `${NAMES[type][0]} ${s.nextId}`;
  const c: Character = { id: `c${s.nextId++}`, type, name: pick, role };
  s.roster.push(c);
  return c;
}

// ---------- region map ----------

export interface MapNode {
  id: string;
  /** Position on the painted map, 0..1 from the left and from the top. */
  x: number;
  y: number;
  /** Battles that open once this one is won. */
  next: string[];
}

export interface RegionMap {
  /** Battles open from the start. */
  start: string[];
  nodes: MapNode[];
  /** How many battles must be won before the boss duel opens. */
  bossNeeds: number;
}

export type NodeState = 'locked' | 'open' | 'cleared' | 'gone';

export function nodeState(map: RegionMap, s: Pick<SaveState, 'cleared' | 'lostForGood'>, id: string): NodeState {
  if (s.cleared.includes(id)) return 'cleared';
  if (s.lostForGood.includes(id)) return 'gone';
  if (map.start.includes(id)) return 'open';
  const opened = map.nodes.some((n) => s.cleared.includes(n.id) && n.next.includes(id));
  return opened ? 'open' : 'locked';
}

export function battlesWon(map: RegionMap, s: Pick<SaveState, 'cleared'>): number {
  return map.nodes.filter((n) => s.cleared.includes(n.id)).length;
}

export function bossOpen(map: RegionMap, s: Pick<SaveState, 'cleared'>): boolean {
  return battlesWon(map, s) >= map.bossNeeds;
}

// ---------- battle lineups ----------

const ROLE_ORDER: Record<Character['role'], number> = { starter: 0, hero: 1, hired: 2 };

/**
 * Lesson battles use a set lineup. Pieces you own stand in it as your named characters
 * (starter first, then heroes, then hired pieces); the rest are unnamed militia.
 * Returns the character name standing on each of the player's starting squares.
 */
export function assignCharacters(fen: string, roster: Character[], player: 'w' | 'b' = 'w'): Record<string, string> {
  const rows = fen.split(' ')[0].split('/');
  const free = [...roster].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  const out: Record<string, string> = {};
  // Walk from the player's back rank forward, files a to h, so the starter takes the most central-looking first slot.
  const order = player === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  for (const r of order) {
    let file = 0;
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      const mine = player === 'w' ? ch === ch.toUpperCase() : ch === ch.toLowerCase();
      const type = ch.toLowerCase();
      if (mine && type !== 'k') {
        const i = free.findIndex((c) => c.type === type);
        if (i >= 0) {
          out[`${'abcdefgh'[file]}${8 - r}`] = free[i].name;
          free.splice(i, 1);
        }
      }
      file++;
    }
  }
  return out;
}
