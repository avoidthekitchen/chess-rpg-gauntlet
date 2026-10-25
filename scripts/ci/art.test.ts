import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COURSE_CAST } from '../../src/game/courseCast';

describe('shipped chapter art', () => {
  it('has complete token colours, source cutouts and portraits before species labels are enabled', () => {
    const pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
    for (const cast of Object.values(COURSE_CAST)) if (cast.speciesArt) {
      for (const piece of pieces) {
        for (const suffix of ['', '-w', '-b']) {
          const name = suffix ? `token-${piece}-${cast.speciesArt}${suffix}` : `${piece}-${cast.speciesArt}`;
          expect(existsSync(new URL(`../../public/sprites/${name}.webp`, import.meta.url)), name).toBe(true);
        }
        const cutout = `token-${piece}-${cast.speciesArt}.png`;
        expect(existsSync(new URL(`../../art/tokens/${cutout}`, import.meta.url)), cutout).toBe(true);
      }
    }
    expect(existsSync(new URL('../../public/sprites/tadwell.webp', import.meta.url))).toBe(true);
  });

  it('keeps the encoded Kingsroad background within its 250 KiB transfer budget', () => {
    const file = new URL('../../public/backgrounds/map-region2.webp', import.meta.url);
    expect(statSync(file).size).toBeLessThanOrEqual(250 * 1024);
  });
});
