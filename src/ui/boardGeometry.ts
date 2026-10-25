import type { PieceSymbol } from 'chess.js';

/**
 * Board and token proportions, in square widths. Kept free of Phaser so the overlap rule
 * can be unit-tested: a token may only cover the pedestal of the piece behind it (#62).
 */

/** Board depth: squares are drawn shorter than wide, as if seen from a low angle. */
export const DEPTH = 0.84;
/** Room above the top edge for the back rank's heads and the "!" badge. */
export const BOARD_TOP = 0.6;
/** On phones the board starts this many px behind the screen header, which hides part of the empty room above it. */
export const BOARD_HEADER_TUCK = 6;
/** Room below the bottom edge for the frame and file letters. */
export const BOARD_BOTTOM = 0.75;
/** Board width and height in squares, frame included. A phone (about 390 px wide) gets 45 px squares. */
export const BOARD_SPAN = 8.6;
export const BOARD_TALL = BOARD_TOP + 8 * DEPTH + BOARD_BOTTOM;

/** A token's base sits this far below its square's middle, in square heights. */
export const GROUND = 0.28;
/** The share of a token's height that stands above its base point; the rest is its shadowed foot. */
export const TOKEN_ABOVE_BASE = 0.97;

/**
 * The box a token is fitted into (width x height). Heights are capped so a token's head
 * reaches only MAX_COVER past the base of the piece directly behind it. Pawns are smaller.
 */
export const TOKEN_BOX: Record<PieceSymbol, [number, number]> = {
  p: [0.8, 0.8],
  n: [0.92, 0.93],
  b: [0.92, 0.93],
  r: [0.95, 0.9],
  q: [0.92, 0.94],
  k: [0.95, 0.95],
};

/** How far one token may rise past the base of the piece behind it: about its pedestal. */
export const MAX_COVER = 0.11;

/** How much of the piece behind `front` is hidden, in square widths: its foot plus the front token's reach. */
export function coverBehind(front: PieceSymbol, behind: PieceSymbol): number {
  const reach = TOKEN_BOX[front][1] * TOKEN_ABOVE_BASE - DEPTH;
  return Math.max(0, reach) + TOKEN_BOX[behind][1] * (1 - TOKEN_ABOVE_BASE);
}
