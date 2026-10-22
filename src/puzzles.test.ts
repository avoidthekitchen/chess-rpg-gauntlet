import { describe, expect, it } from 'vitest';
import hangingPiece from '../public/puzzles/region1/hangingPiece.json';
import mateIn1 from '../public/puzzles/region1/mateIn1.json';
import type { Puzzle } from './game/bounty';
import { uniqueById } from './puzzles';

const PACKS: Record<string, Puzzle[]> = { mateIn1, hangingPiece } as never;
const pack = (theme: string): Puzzle[] => PACKS[theme].map((p) => ({ ...p, theme }));

describe('uniqueById', () => {
  it('keeps one copy of a puzzle that sits in two theme packs', () => {
    const all = uniqueById([...pack('mateIn1'), ...pack('hangingPiece')]);
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length);
    // The first pack's copy wins, so a puzzle that is both stays a mate-in-one.
    const mates = new Set(pack('mateIn1').map((p) => p.id));
    for (const p of all) if (mates.has(p.id)) expect(p.theme).toBe('mateIn1');
  });
});
