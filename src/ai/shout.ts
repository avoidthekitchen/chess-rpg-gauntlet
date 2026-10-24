import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { AiProfile } from '../game/difficulty';
import type { Engine } from './engine';
import type { EnemyView, Habits, Rng } from './enemy';
import { nullMoveFen, planIfPassed } from './intent';

export { nullMoveFen };

/**
 * Shouting goblins: before your move, the enemy announces the move it would play if you
 * passed (`planIfPassed`, the same question as the Scrying Orb). After your move it decides
 * again: the shouted move gets a bonus in its weighted pick (`Habits.shout`), but it can
 * switch, and it can't play the shout once your move made it illegal ("Foiled!").
 */

/** The move the enemy announces for the position where it's your turn, or null if it can't shout. */
export function planShout(battle: EnemyView, engine: Engine | null, profile: AiProfile, rng?: Rng): Promise<string | null> {
  return planIfPassed(battle, engine, profile, rng);
}

/**
 * Whether an announced move still stands in this position (with the enemy to move). If not,
 * the shout is foiled. Given the position it was shouted in, a shouted capture also falls once
 * its target has left the square: the same move would now be a different, usually losing, one.
 */
export function shoutStands(fen: string, uci: string, shoutFen?: string | null): boolean {
  const chess = new Chess(fen);
  const legal = chess
    .moves({ verbose: true })
    .some((m) => m.from === uci.slice(0, 2) && m.to === uci.slice(2, 4) && (m.promotion ?? '') === (uci[4] ?? ''));
  if (!legal || !shoutFen) return legal;
  const to = uci.slice(2, 4) as Square;
  const then = new Chess(shoutFen);
  const wanted = then.get(to);
  if (!wanted || wanted.color !== then.turn()) return true; // not a capture when shouted
  return chess.get(to)?.color === wanted.color;
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

/**
 * The habits a battle's enemy brings to its reply. Only a shouting battle gets the shout
 * bonus, and only while the shout is still legal; a plan shown any other way (the Scrying
 * Orb) never becomes a habit.
 */
export function replyHabits(shouts: boolean, shout: string | null, fen: string, shoutFen?: string | null): Habits {
  return { shout: shouts && shout && shoutStands(fen, shout, shoutFen) ? shout : null };
}

/** Shouts by position, so a rewind (or a replayed position) hears the same shout instead of a fresh pick. */
export class ShoutBook {
  private byFen = new Map<string, string | null>();

  has(fen: string): boolean {
    return this.byFen.has(fen);
  }

  get(fen: string): string | null | undefined {
    return this.byFen.get(fen);
  }

  /** The shout for this position: the remembered one, or a new plan that's then remembered. */
  async plan(view: EnemyView, engine: Engine | null, profile: AiProfile, rng?: Rng): Promise<string | null> {
    if (this.byFen.has(view.fen)) return this.byFen.get(view.fen)!;
    const uci = await planShout(view, engine, profile, rng);
    this.byFen.set(view.fen, uci);
    return uci;
  }
}
