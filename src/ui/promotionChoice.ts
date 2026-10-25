import type { Color, PieceSymbol } from 'chess.js';
import { esc } from './overlay';
import { GLYPH_FONT } from './theme';

/** Queen first: it is the usual choice. No option is focused, so underpromotion stays deliberate. */
const ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n'];
const NAME: Partial<Record<PieceSymbol, string>> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
const GLYPH: Partial<Record<PieceSymbol, string>> = { q: '♛︎', r: '♜︎', b: '♝︎', n: '♞︎' };

export const promotionOrder = (options: readonly PieceSymbol[]) => ORDER.filter(p => options.includes(p));

/** Picture buttons for the promotion chooser, drawn in the player's current piece style. */
export function promotionChoicesHtml(options: readonly PieceSymbol[], style: 'tokens' | 'classic', color: Color, base: string) {
  return `<div class="promo">${promotionOrder(options).map(p => {
    const name = NAME[p]!;
    const picture = style === 'tokens'
      ? `<img src="${base}sprites/token-${name.toLowerCase()}-ally-${color}.webp" alt="">`
      : `<span class="promo-glyph" style='font-family:${GLYPH_FONT}' aria-hidden="true">${GLYPH[p]}</span>`;
    return `<button type="button" data-p="${p}">${picture}<small>${esc(name)}</small></button>`;
  }).join('')}</div>`;
}
