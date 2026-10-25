import { describe, expect, it } from 'vitest';
import { promotionChoicesHtml, promotionOrder } from './promotionChoice';

describe('promotion chooser', () => {
  it('puts the queen first whatever order chess.js lists the moves in', () => {
    expect(promotionOrder(['n', 'b', 'r', 'q'])).toEqual(['q', 'r', 'b', 'n']);
    expect(promotionOrder(['b', 'q'])).toEqual(['q', 'b']);
  });

  it('shows the player-coloured token picture with a readable label', () => {
    const html = promotionChoicesHtml(['n', 'b', 'r', 'q'], 'tokens', 'b', './');
    expect(html.indexOf('data-p="q"')).toBeLessThan(html.indexOf('data-p="n"'));
    expect(html).toContain('src="./sprites/token-queen-ally-b.webp"');
    expect(html).toContain('src="./sprites/token-knight-ally-b.webp"');
    expect(html).toContain('<small>Knight</small>');
    expect(html).not.toMatch(/autofocus/);
  });

  it('uses chess glyphs in the classic style', () => {
    const html = promotionChoicesHtml(['q', 'n'], 'classic', 'w', '/');
    expect(html).not.toContain('<img');
    expect(html).toContain('♛');
    expect(html).toContain('♞');
  });
});
