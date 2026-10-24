import type { Square } from 'chess.js';

export type Objective =
  /** Checkmate the enemy commander, optionally within `maxMoves` of your moves. */
  | { kind: 'checkmate'; maxMoves?: number }
  /** Improve your material balance by `gain` points within `maxMoves`. */
  | { kind: 'winMaterial'; gain: number; maxMoves: number }
  /** Last `turns` enemy turns without an enemy piece left standing on a village. */
  | { kind: 'survive'; turns: number }
  /** Promote a pawn safely within `maxMoves`. */
  | { kind: 'promote'; maxMoves: number };

/** How the enemy picks moves. `raider` favours moves that pressure villages (a capped bonus in its weighted pick). */
export type Personality = 'standard' | 'raider';

export interface Scenario {
  id: string;
  title: string;
  region: string;
  enemy: { name: string; personality: Personality };
  /** Short flavor text shown before the battle. */
  intro: string;
  /** The chess lesson this battle teaches, shown in the side panel. */
  lesson: string;
  /** Starting position. The player is always White and moves first. */
  fen: string;
  objective: Objective;
  villages?: Square[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'rook-ladder',
    title: 'The Rook Ladder',
    region: 'The Borderlands',
    enemy: { name: 'Goblin Chieftain', personality: 'standard' },
    intro:
      'A goblin chieftain has fled to the northern wall with no guards left. Your two rooks can trap him against it.',
    lesson:
      'Rooks work as a team. One rook cuts the king off from a rank, and the other gives check on the next rank. Keep both rooks out of the king’s reach.',
    fen: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
    objective: { kind: 'checkmate', maxMoves: 4 },
  },
  {
    id: 'knights-fork',
    title: 'Ambush at the Ford',
    region: 'The Borderlands',
    enemy: { name: 'Bandit Captain', personality: 'standard' },
    intro:
      'The bandit captain camps beside his war banner, never guessing that a single rider can strike them both at once.',
    lesson:
      'A fork attacks two targets with one piece. Knights are the best at it: look for a square that checks the king and hits a rook or queen too. The king must escape, and then you take the other target.',
    fen: 'r3k3/1p3ppp/8/1N6/8/8/5PPP/6K1 w - - 0 1',
    objective: { kind: 'winMaterial', gain: 5, maxMoves: 3 },
  },
  {
    id: 'hold-the-bridge',
    title: 'Hold the Bridge',
    region: 'The Borderlands',
    enemy: { name: 'Goblin Raiders', personality: 'raider' },
    intro:
      'Goblin raiders want to burn the two villages at the river crossing. Hold them off until the reinforcements arrive.',
    lesson:
      'Guard the key squares. A raider who lands on a village burns it unless you capture him on your very next move, so every village needs a defender. Watch out: the raiders will attack your defenders first.',
    fen: '6k1/pp4pp/2n5/5b2/1b6/5N2/PPP2PPP/4R1K1 w - - 0 1',
    objective: { kind: 'survive', turns: 6 },
    villages: ['d4', 'e4'],
  },
  {
    id: 'squires-run',
    title: 'The Pawn’s Run',
    region: 'The Borderlands',
    enemy: { name: 'Goblin Gatekeeper', personality: 'standard' },
    intro:
      'Your pawn must reach the far wall to be promoted. The goblin gatekeeper will try to block the way, so your king has to lead.',
    lesson:
      'In king-and-pawn endings, the king walks in front of the pawn and shoulders the enemy king aside. Don’t push too early. And beware stalemate: if the enemy has no legal move but isn’t in check, the battle is lost.',
    fen: '3k4/8/3K4/3P4/8/8/8/8 w - - 0 1',
    objective: { kind: 'promote', maxMoves: 10 },
  },
  {
    id: 'vanguard',
    title: 'Boss: The Lich’s Vanguard',
    region: 'The Borderlands',
    enemy: { name: 'Vanguard of the Lich King', personality: 'standard' },
    intro:
      'The Lich King has sent his vanguard, an army matching your own. Only checkmate will turn them back.',
    lesson:
      'In an even fight: castle your king to safety, bring out your knight and bishop, and check every move for pieces left undefended (yours and theirs).',
    fen: '4kbnr/4pppp/8/8/8/8/4PPPP/4KBNR w Kk - 0 1',
    objective: { kind: 'checkmate' },
  },
];

export function objectiveText(o: Objective): string {
  switch (o.kind) {
    case 'checkmate':
      return o.maxMoves ? `Checkmate within ${o.maxMoves} moves` : 'Checkmate the enemy commander';
    case 'winMaterial':
      return `Win ${o.gain}+ points of material within ${o.maxMoves} moves`;
    case 'survive':
      return `Protect the villages for ${o.turns} enemy turns`;
    case 'promote':
      return `Promote a pawn safely within ${o.maxMoves} moves`;
  }
}

export function moveLimit(o: Objective): number | undefined {
  return o.kind === 'survive' ? undefined : o.maxMoves;
}
