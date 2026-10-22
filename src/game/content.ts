import type { Scenario } from './scenarios';

/**
 * Campaign battle content: a `Scenario` (the board rules `Battle` runs) plus everything
 * around the board: battle type, lesson theme, rewards, bonus goals and dialogue.
 */

export type BattleKind = 'skirmish' | 'ambush' | 'siege' | 'promotion' | 'boss';

/** Bonus goals pay extra gold. Each reinforces a habit, not a rule change. */
export type Bonus =
  /** Win without losing a piece. */
  | { kind: 'flawless'; gold: number }
  /** Win within `moves` of your moves. */
  | { kind: 'quick'; moves: number; gold: number }
  /** Win without using a rewind. */
  | { kind: 'noRewind'; gold: number };

/** Who says a line of dialogue. `companion` is the player's starter; `chief` is the region boss. */
export type Speaker = 'companion' | 'enemy' | 'chief' | 'hero' | 'narrator';

export interface Line {
  who: Speaker;
  text: string;
}

export interface BattleDef extends Scenario {
  kind: BattleKind;
  /** Short name of the chess idea, e.g. "Threat awareness". */
  theme: string;
  /** Gold for winning. */
  reward: number;
  bonuses: Bonus[];
  /** Dialogue before the battle starts and after a win. */
  before: Line[];
  after: Line[];
  /** The companion's one-line tip, shown in the talking-head card when the battle starts. */
  tip: string;
  /** Bog Goblins shout the move they plan next and must play it if it's still legal. */
  shouts: boolean;
}

export interface BattleStats {
  won: boolean;
  piecesLost: number;
  playerMoves: number;
  rewindsUsed: number;
}

export function bonusMet(b: Bonus, s: BattleStats): boolean {
  if (!s.won) return false;
  switch (b.kind) {
    case 'flawless':
      return s.piecesLost === 0;
    case 'quick':
      return s.playerMoves <= b.moves;
    case 'noRewind':
      return s.rewindsUsed === 0;
  }
}

export function bonusText(b: Bonus): string {
  switch (b.kind) {
    case 'flawless':
      return 'Win without losing a piece';
    case 'quick':
      return `Win in ${b.moves} moves or fewer`;
    case 'noRewind':
      return 'Win without rewinding';
  }
}
