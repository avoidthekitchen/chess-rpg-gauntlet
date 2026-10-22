import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from './academy';
import { Battle } from './battle';

describe('academy exercises', () => {
  it.each(EXERCISES.map((e) => [e.id, e] as const))('%s is a legal start that only needs a mate', (_, e) => {
    const c = new Chess(e.fen);
    expect(c.turn()).toBe('w');
    expect(new Chess(e.fen.replace(' w ', ' b ')).inCheck()).toBe(false);
    expect(e.objective.kind).toBe('checkmate');
    // Practice battles hand out many rewinds; the rules engine is the same Battle.
    expect(new Battle(e, 99).rewindsLeft).toBe(99);
  });
});
