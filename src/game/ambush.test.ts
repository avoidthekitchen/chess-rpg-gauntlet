import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AMBUSH_HELP, hintAmbush, moveAmbush, nextAmbushWave, startAmbush, uciMove, wavePuzzle, type AmbushDef, type AmbushRun } from './ambush';
import { courseLesson } from './curriculum';
import { puzzleStart } from './puzzle';

const def = courseLesson('r2-two-at-once')!;

const solve = (initial: AmbushRun, content: AmbushDef = def) => {
  let run = initial;
  while (run.status !== 'won') {
    if (run.status === 'waveWon') run = nextAmbushWave(content, run);
    else run = moveAmbush(content, run, wavePuzzle(content, run).moves[1 + 2 * run.step]).run;
  }
  return run;
};
const wrongMove = (run: AmbushRun, content: AmbushDef = def) => new Chess(run.fen).moves({ verbose: true })
  .map(m => m.from + m.to + (m.promotion ?? ''))
  .find(uci => moveAmbush(content, run, uci).verdict === 'miss')!;

describe('ambush run', () => {
  it('uses the setup move, then published solver moves and replies through all waves', () => {
    let run = startAmbush(def, 'knight');
    expect(run.fen).toBe(puzzleStart(def.waves[0].main).fen);
    run = moveAmbush(def, run, def.waves[0].main.moves[1]).run;
    expect(run.status).toBe('waveWon');
    run = nextAmbushWave(def, run);
    const p = wavePuzzle(def, run);
    const result = moveAmbush(def, run, p.moves[1]);
    expect(result.moves).toEqual(p.moves.slice(1, 3));
    const chess = new Chess(p.fen);
    for (const u of p.moves.slice(0, 3)) chess.move(uciMove(u));
    expect(result.run.fen).toBe(chess.fen());
    const done = solve(result.run);
    expect(done.status).toBe('won');
    expect(moveAmbush(def, done, p.moves[1]).verdict).toBe('ignored');
  });
  it.each(['squire', 'knight', 'champion', 'grandmaster'] as const)('counts legal misses at the correct limit on %s', difficulty => {
    let run = startAmbush(def, difficulty);
    const fen = run.fen;
    const wrong = wrongMove(run);
    const limit = AMBUSH_HELP[difficulty].misses;
    for (let i = 1; i <= (limit ?? 30); i++) {
      run = moveAmbush(def, run, wrong).run;
      expect(run.misses).toBe(i);
      expect(run.fen).toBe(fen);
      expect(run.status).toBe(limit !== null && i === limit ? 'lost' : 'solving');
    }
    expect(moveAmbush(def, run, 'a1a1').run).toBe(run);
  });
  it('accepts alternate mates and never accepts a different non-mating move', () => {
    const p = { ...def.show, fen: '8/1p2k3/1Pp1pn2/2P1K3/r2PBP2/8/7R/8 w - - 0 51', moves: ['h2h6', 'f6g4'] };
    const custom: AmbushDef = { ...def, waves: [{ main: p, backup: p, line: '' }] };
    const run = startAmbush(custom, 'knight');
    const chess = new Chess(run.fen);
    const mates = chess.moves({ verbose: true }).filter(m => m.san.endsWith('#')).map(m => m.from + m.to);
    expect(mates.length).toBeGreaterThan(1);
    for (const u of mates) expect(moveAmbush(custom, run, u).run.status).toBe('won');
    expect(moveAmbush(custom, run, wrongMove(run, custom)).verdict).toBe('miss');
  });
  it.each(['squire', 'knight', 'champion', 'grandmaster'] as const)('enforces hint availability on %s', difficulty => {
    const run = startAmbush(def, difficulty);
    const result = hintAmbush(def, run);
    expect(result.run.hintsUsed).toBe(AMBUSH_HELP[difficulty].hints ? 1 : 0);
    expect(result.square).toBe(AMBUSH_HELP[difficulty].hints ? def.waves[0].main.moves[1].slice(0, 2) : null);
  });
});
