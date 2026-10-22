import type { Budget } from './boss';
import type { BattleDef, Line } from './content';

/**
 * The Region 1 boss duel: Grubnak, the Toad Chief, behind a wall of goblin squires.
 * You pick your army up to 10 points, with no queen: the lesson is winning with small
 * pieces, using everything from the region (threats, protection, safe trades, mates).
 */

export const R1_BOSS_BUDGET: Budget = { points: 10, caps: { q: 0 } };

/** Black's fixed setup: a full pawn wall, one frog knight and the chief. 11 points against your 10. */
export const R1_BOSS_ARMY: Record<string, string> = {
  e8: 'k',
  b8: 'n',
  a7: 'p',
  b7: 'p',
  c7: 'p',
  d7: 'p',
  e7: 'p',
  f7: 'p',
  g7: 'p',
  h7: 'p',
};

export const R1_BOSS: Omit<BattleDef, 'fen'> = {
  id: 'r1-boss',
  title: 'Grubnak’s Last Stand',
  region: 'The Bog',
  kind: 'boss',
  theme: 'Everything so far',
  enemy: { name: 'Grubnak, the Toad Chief', personality: 'standard' },
  intro: 'The Goblin Chief waits behind a wall of eight squires and one sneaky frog. Bring your best 10 points of army.',
  lesson:
    'A full game: develop your pieces, keep them protected, and listen to the goblins’ shouts. Trade only when it’s safe, open a file for your tower, and once Grubnak’s wall is broken, hunt the king with checks that leave him no squares.',
  tip: 'Every piece matters today. Keep them guarded, and listen when they shout!',
  objective: { kind: 'checkmate' },
  reward: 50,
  bonuses: [
    { kind: 'noRewind', gold: 10 },
    { kind: 'quick', moves: 30, gold: 10 },
  ],
  shouts: true,
  before: [
    { who: 'chief', text: 'So the little king came all the way to Grubnak’s camp. Squires! WALL!' },
    { who: 'companion', text: 'A wall of pawns can’t move backwards. Find the loose one and pry it open.' },
  ],
  after: [
    { who: 'chief', text: 'Grubnak… is… muddier than before. Fine! FINE! The Bog is yours!' },
    { who: 'companion', text: 'Look, someone was locked in the chief’s pantry!' },
  ],
};

/** The named hero who joins you for winning the region. */
export const R1_HERO = {
  type: 'q' as const,
  name: 'Saffron',
  title: 'Saffron, the Fox Sorceress',
  lines: [
    { who: 'hero', text: 'Finally! Three weeks in a pantry with nothing but turnips. I’m Saffron, and I go wherever I please.' },
    { who: 'hero', text: 'Grubnak’s boss, the Lich King, sends his bandits next. You’ll want a sorceress for that. I’m coming with you.' },
    { who: 'narrator', text: 'Saffron the Fox Sorceress joins your army. She can’t fight Grubnak (he banned sorceresses), but bosses ahead will allow her.' },
  ] as Line[],
};
