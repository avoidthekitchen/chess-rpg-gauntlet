import type { Chess, Move } from 'chess.js';
import { PIECE_VALUE, other, pieces } from './material';

export type TacticTag = 'checkmate' | 'fork' | 'check' | 'promotion' | 'capture';

/**
 * Names the tactics a move just played. `after` is the position after `move`.
 * Ordered from most to least impressive so the UI can show the first one big.
 */
export function detectTactics(after: Chess, move: Move): TacticTag[] {
  const tags: TacticTag[] = [];
  if (after.isCheckmate()) tags.push('checkmate');
  if (isFork(after, move)) tags.push('fork');
  if (!after.isCheckmate() && after.inCheck()) tags.push('check');
  if (move.promotion) tags.push('promotion');
  if (move.captured) tags.push('capture');
  return tags;
}

/**
 * A fork: the moved piece attacks two or more enemy pieces that are each worth
 * attacking (the king, something more valuable than the attacker, or something undefended).
 */
export function isFork(after: Chess, move: Move): boolean {
  const mover = move.color;
  const moverValue = PIECE_VALUE[move.promotion ?? move.piece];
  let targets = 0;
  for (const target of pieces(after, other(mover))) {
    if (!after.attackers(target.square, mover).includes(move.to)) continue;
    const worthIt =
      target.type === 'k' ||
      PIECE_VALUE[target.type] > moverValue ||
      after.attackers(target.square, target.color).length === 0;
    if (worthIt) targets++;
  }
  return targets >= 2;
}
