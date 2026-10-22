import type { Budget } from './boss';
import type { BattleDef, Line } from './content';

/**
 * The Region 1 boss duel: Grubnak, the Goblin Chief, behind a wall of goblin squires.
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
  enemy: { name: 'Grubnak, the Goblin Chief', personality: 'standard' },
  intro: 'The Goblin Chief waits behind a wall of eight squires and one sneaky frog. He doesn’t shout his plans. Bring your best 10 points of army.',
  lesson:
    'A full game: develop your pieces and keep them protected. Grubnak doesn’t shout his plans, so after every goblin move, ask yourself what it attacks. Trade only when it’s safe, open a file for your tower, and once Grubnak’s wall is broken, hunt the king with checks that leave him no squares.',
  tip: 'Every piece matters today. Grubnak won’t tell us his plans, so watch every move he makes!',
  objective: { kind: 'checkmate' },
  reward: 50,
  bonuses: [
    { kind: 'noRewind', gold: 10 },
    { kind: 'quick', moves: 30, gold: 10 },
  ],
  // The region's final exam: the chief keeps his plans to himself, so the habit the shouts
  // taught (what does the enemy want?) has to work without them.
  shouts: false,
  // Without shouts the chief played a 40-50 move game at the usual strength, too long for the
  // end of Region 1. He's a little clumsier on Squire and Knight (see scripts/verify/boss.verify.test.ts).
  ai: {
    squire: { depth: 4, multiPv: 6, maxLoss: 400 },
    knight: { depth: 6, multiPv: 6, maxLoss: 200 },
  },
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
