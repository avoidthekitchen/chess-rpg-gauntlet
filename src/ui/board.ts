import type { Chess, PieceSymbol, Square } from 'chess.js';
import type { ThreatMap } from '../game/threats';

// U+FE0E asks for the text glyph, so iOS doesn't swap the pawn for an emoji.
const GLYPH: Record<PieceSymbol, string> = {
  k: '♚︎',
  q: '♛︎',
  r: '♜︎',
  b: '♝︎',
  n: '♞︎',
  p: '♟︎',
};

// Fantasy names for the pieces. The rules stay standard chess.
export const PIECE_NAME: Record<PieceSymbol, string> = {
  k: 'King',
  q: 'Queen',
  r: 'Siege Tower (Rook)',
  b: 'Mage (Bishop)',
  n: 'Knight',
  p: 'Squire (Pawn)',
};

/** One-word names for status text, e.g. "Your tower takes the squire on d5". */
export const PIECE_SHORT: Record<PieceSymbol, string> = {
  k: 'king',
  q: 'queen',
  r: 'tower',
  b: 'mage',
  n: 'knight',
  p: 'squire',
};

const FILES = 'abcdefgh';

export interface BoardView {
  chess: Chess;
  selected: Square | null;
  /** Legal destinations of the selected piece. */
  targets: Set<Square>;
  lastMove: { from: Square; to: Square } | null;
  threats: ThreatMap | null;
  villages: Square[];
}

export function renderBoard(el: HTMLElement, v: BoardView) {
  const cells: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let f = 0; f < 8; f++) {
      const sq = `${FILES[f]}${rank}` as Square;
      const piece = v.chess.get(sq);
      const cls = ['sq', (f + rank) % 2 === 1 ? 'light' : 'dark'];
      if (v.selected === sq) cls.push('selected');
      if (v.lastMove && (v.lastMove.from === sq || v.lastMove.to === sq)) cls.push('last');
      if (v.threats?.attacked.has(sq)) cls.push('threat');
      if (v.villages.includes(sq)) cls.push('village');
      if (v.targets.has(sq)) cls.push(piece ? 'target capture' : 'target');
      if (piece?.type === 'k' && piece.color === v.chess.turn() && v.chess.inCheck()) cls.push('in-check');

      let inner = '';
      if (v.villages.includes(sq)) inner += '<span class="village-icon" aria-hidden="true">⌂</span>';
      if (piece) {
        const hanging = v.threats?.hanging.has(sq) ? ' hanging' : '';
        const side = piece.color === 'w' ? 'ally' : 'foe';
        inner += `<span class="piece ${side}${hanging}">${GLYPH[piece.type]}</span>`;
      }
      if (v.targets.has(sq)) inner += '<span class="dot" aria-hidden="true"></span>';
      if (f === 0) inner += `<span class="coord rank">${rank}</span>`;
      if (rank === 1) inner += `<span class="coord file">${FILES[f]}</span>`;

      const label = piece
        ? `${sq}, ${piece.color === 'w' ? 'your' : 'enemy'} ${PIECE_NAME[piece.type]}`
        : `${sq}${v.villages.includes(sq) ? ', village' : ''}`;
      cells.push(`<button class="${cls.join(' ')}" data-sq="${sq}" aria-label="${label}">${inner}</button>`);
    }
  }
  el.innerHTML = cells.join('');
}

export function glyph(type: PieceSymbol): string {
  return GLYPH[type];
}
