import type { Chess, Color, PieceSymbol, Square } from 'chess.js';

/** Standard piece values. These will double as hiring prices (x10 gold). */
export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const other = (c: Color): Color => (c === 'w' ? 'b' : 'w');

export interface PlacedPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export function pieces(chess: Chess, color?: Color): PlacedPiece[] {
  const out: PlacedPiece[] = [];
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && (!color || cell.color === color)) out.push(cell);
    }
  }
  return out;
}

export function materialOf(chess: Chess, color: Color): number {
  return pieces(chess, color).reduce((sum, p) => sum + PIECE_VALUE[p.type], 0);
}

/** Material lead of `color` (positive means ahead). */
export function materialBalance(chess: Chess, color: Color): number {
  return materialOf(chess, color) - materialOf(chess, other(color));
}

/** The piece values in one line, for goals that count material. */
export const VALUE_LEGEND = (['p', 'n', 'b', 'r', 'q'] as const)
  .map((t) => `${{ p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' }[t]} ${PIECE_VALUE[t]}`)
  .join(' · ');

/** A change in material as a signed label, such as "+3" or "−5" (a true minus sign); empty for no change. */
export function swingLabel(delta: number): string {
  if (delta === 0) return '';
  return delta > 0 ? `+${delta}` : `−${-delta}`;
}
