import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { AiProfile } from '../game/difficulty';
import type { Engine } from './engine';
import { chooseEnemyMove, type EnemyView, type Rng } from './enemy';

/**
 * Shouting goblins: before your move, the enemy announces the move it would play if
 * you did nothing, and it must play that move if it's still legal after yours.
 * It's the same question as the Scrying Orb: "what is the enemy's best move here?"
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

/** The move the enemy announces for the position where it's your turn, or null if it can't shout. */
export async function planShout(battle: EnemyView, engine: Engine | null, profile: AiProfile, rng?: Rng): Promise<string | null> {
  const fen = nullMoveFen(battle.fen);
  if (!fen) return null;
  try {
    // Ask the enemy what it would play in the skipped-turn position.
    return await chooseEnemyMove({ fen, scenario: battle.scenario }, engine, profile, rng);
  } catch {
    return null;
  }
}

/** Whether an announced move is still legal in this position (with the enemy to move). */
export function shoutStands(fen: string, uci: string): boolean {
  const chess = new Chess(fen);
  return chess
    .moves({ verbose: true })
    .some((m) => m.from === uci.slice(0, 2) && m.to === uci.slice(2, 4) && (m.promotion ?? '') === (uci[4] ?? ''));
}

const NAME: Record<PieceSymbol, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

/** What the goblin yells, in its own words, for the announced move (from the skipped-turn position). */
export function shoutLine(fen: string, uci: string, villages: Square[] = []): string {
  const nf = nullMoveFen(fen);
  if (!nf) return '';
  const chess = new Chess(nf);
  let move;
  try {
    move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as PieceSymbol | undefined });
  } catch {
    return '';
  }
  const to = move.to;
  if (chess.isCheckmate()) return `Hee hee! ${to} and your king is finished!`;
  if (move.captured) return `Oi! Next I’m grabbing your ${NAME[move.captured]} on ${to}!`;
  if (villages.includes(to)) return `That village on ${to} is MINE! Torches ready!`;
  if (move.promotion) return `Watch me grow big on ${to}!`;
  if (chess.inCheck()) return `I’m coming to ${to} to poke your king!`;
  return `Next I’m going to ${to}! Hah!`;
}
