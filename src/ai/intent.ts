import { Chess } from 'chess.js';
import type { AiProfile } from '../game/difficulty';
import type { Engine } from './engine';
import { chooseEnemyMove, type EnemyView, type Rng } from './enemy';

/**
 * "What would you play if I passed?" The question behind the goblins' shout and the
 * Scrying Orb: the move the enemy would actually pick (its habits and difficulty) if the
 * player skipped their turn. Asking it only reveals the plan; it never changes what the
 * enemy then plays.
 *
 * Far Sight is a different question (the best reply after a move you're considering) and
 * analyses the position after that move, not this passed-turn position.
 */

/**
 * The position with the side to move skipped (a "null move"), so the other side can
 * be asked what it wants. Null when the side to move is in check, since skipping
 * would leave a king capturable.
 */
export function nullMoveFen(fen: string): string | null {
  const chess = new Chess(fen);
  if (chess.inCheck()) return null;
  const parts = fen.split(' ');
  parts[1] = parts[1] === 'w' ? 'b' : 'w';
  parts[3] = '-'; // an en passant chance belongs to the side that passed
  const out = parts.join(' ');
  try {
    const flipped = new Chess(out);
    return flipped.moves().length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** The enemy's planned move if the player passed, or null when it can't be asked (player in check, no moves). */
export async function planIfPassed(view: EnemyView, engine: Engine | null, profile: AiProfile, rng?: Rng): Promise<string | null> {
  const fen = nullMoveFen(view.fen);
  if (!fen) return null;
  try {
    return await chooseEnemyMove({ fen, scenario: view.scenario }, engine, profile, rng);
  } catch {
    return null;
  }
}
