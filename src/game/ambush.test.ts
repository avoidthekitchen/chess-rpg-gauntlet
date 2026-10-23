import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AMBUSH_HELP, ambushMissText, hintAmbush, isDoubleCheck, moveAmbush, nextAmbushWave, startAmbush, uciMove, wavePuzzle, type AmbushDef, type AmbushRun } from './ambush';
import { TWO_AT_ONCE as def } from './region2Ambush';
import { beginPilot, newPilot, pilotGone, settlePilot } from './ambushPilot';
import { puzzleStart } from './bounty';
import { posterTarget } from './poster';

const solve = (initial: AmbushRun, content = def) => {
  let run = initial;
  while (run.status !== 'won') {
    if (run.status === 'waveWon') run = nextAmbushWave(content, run);
    else run = moveAmbush(content, run, wavePuzzle(content, run).moves[1 + 2 * run.step]).run;
  }
  return run;
};
const wrongMove = (run: AmbushRun, content = def) => new Chess(run.fen).moves({ verbose: true })
  .map(m => m.from + m.to + (m.promotion ?? ''))
  .find(uci => moveAmbush(content, run, uci).verdict === 'miss')!;

describe('published ambush content', () => {
  const puzzles = [def.show, ...def.waves.flatMap(w => [w.main, w.backup])];
  it('has nine distinct quality puzzles, reserved from all bounty and warm-up packs', () => {
    expect(puzzles).toHaveLength(9);
    expect(new Set(puzzles.map(p => p.id)).size).toBe(9);
    const packs = import.meta.glob('../../public/puzzles/**/*.json', { eager: true, import: 'default' });
    const warmups = import.meta.glob('./**/*[wW]arm*.{ts,json}', { eager: true });
    const other = JSON.stringify([packs, warmups]);
    for (const p of puzzles) {
      expect(other).not.toContain(`"${p.id}"`);
      expect(p.quality.rd).toBeLessThanOrEqual(90);
      expect(p.quality.popularity).toBeGreaterThanOrEqual(85);
      expect(p.quality.plays).toBeGreaterThanOrEqual(300);
      expect(p.source).toBe(`https://lichess.org/training/${p.id}`);
      expect(p.reason.length).toBeGreaterThan(20);
      expect(p.themes).toContain('doubleCheck');
    }
  });
  it('replays every line legally and verifies an actual solver double check', () => {
    for (const p of puzzles) {
      expect(p.moves.length % 2).toBe(0);
      expect(p.moves.length / 2).toBeGreaterThanOrEqual(1);
      expect(p.moves.length / 2).toBeLessThanOrEqual(3);
      const chess = new Chess(p.fen);
      let double = false;
      p.moves.forEach((uci, i) => {
        chess.move(uciMove(uci));
        // This pilot asks for two checks before the first solver move.
        if (i === 1) expect(isDoubleCheck(chess), `${p.id}: opening prompt`).toBe(true);
        if (i % 2 === 1 && isDoubleCheck(chess)) double = true;
      });
      expect(double, p.id).toBe(true);
    }
  });
  it('increases rating by wave, keeping backups close and the example easy', () => {
    expect(def.show.rating).toBeGreaterThanOrEqual(600);
    expect(def.show.rating).toBeLessThanOrEqual(800);
    def.waves.forEach((w, i) => {
      expect(Math.abs(w.main.rating - (700 + 150 * i))).toBeLessThanOrEqual(75);
      expect(Math.abs(w.backup.rating - (700 + 150 * i))).toBeLessThanOrEqual(75);
      expect(Math.abs(w.main.rating - w.backup.rating)).toBeLessThanOrEqual(75);
      if (i) expect(Math.min(w.main.rating, w.backup.rating)).toBeGreaterThan(Math.max(def.waves[i - 1].main.rating, def.waves[i - 1].backup.rating));
    });
  });
});

describe('ambush run', () => {
  it('does not ask for another double check when the continuation wins material without check', () => {
    let run = startAmbush(def, 'knight');
    for (let wave = 0; wave < 2; wave++) {
      while (run.status === 'solving') run = moveAmbush(def, run, wavePuzzle(def, run).moves[1 + 2 * run.step]).run;
      run = nextAmbushWave(def, run);
    }
    run = moveAmbush(def, run, wavePuzzle(def, run).moves[1]).run;
    const expected = new Chess(run.fen).move(uciMove(wavePuzzle(def, run).moves[3]));
    expect(expected.san).toBe('Nxh4');
    expect(ambushMissText(moveAmbush(def, run, wrongMove(run)).run)).toContain('Look for the finish');
  });
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

describe('pilot settlement', () => {
  it('pays each reward and bonus once, but allows earning a missed bonus on replay', () => {
    const state = newPilot();
    beginPilot(state, def);
    state.run = solve(hintAmbush(def, state.run!).run);
    expect(settlePilot(state, def)).toBe(true);
    expect(state.save.gold).toBe(125);
    expect(settlePilot(state, def)).toBe(false);
    expect(state.save.battlesFought).toBe(1);
    expect(beginPilot(state, def)).toBe(true);
    state.run = solve(state.run!);
    settlePilot(state, def);
    expect(state.save.gold).toBe(130);
    expect(state.result?.payout?.tactics).toBe(0);
    expect(beginPilot(state, def)).toBe(true);
    state.run = solve(state.run!);
    settlePilot(state, def);
    expect(state.save.gold).toBe(130);
  });
  it('cannot charge an animation exit twice or turn an accepted win into a loss', () => {
    const state = newPilot(); beginPilot(state, def);
    expect(beginPilot(state, def)).toBe(false);
    settlePilot(state, def, true);
    settlePilot(state, def, true);
    expect(state.save.gold).toBe(90);
    expect(state.save.battlesFought).toBe(1);
    beginPilot(state, def); state.run = solve(state.run!);
    settlePilot(state, def, true);
    expect(state.result?.won).toBe(true);
    expect(state.save.battlesFought).toBe(2);
  });
  it('retries only the lost wave with its backup, including repeated failures', () => {
    const state = newPilot(); beginPilot(state, def);
    state.run = nextAmbushWave(def, moveAmbush(def, state.run!, def.waves[0].main.moves[1]).run);
    settlePilot(state, def, true);
    beginPilot(state, def);
    expect(state.run?.backupWave).toBe(1);
    expect(wavePuzzle(def, state.run!).id).toBe(def.waves[0].main.id);
    state.run = nextAmbushWave(def, moveAmbush(def, state.run!, def.waves[0].main.moves[1]).run);
    expect(wavePuzzle(def, state.run).id).toBe(def.waves[1].backup.id);
    settlePilot(state, def, true); beginPilot(state, def);
    expect(state.run?.backupWave).toBe(1);
  });
  it('blocks a lost Grandmaster launch but never removes an already-cleared node', () => {
    const state = newPilot('grandmaster'); beginPilot(state, def);
    settlePilot(state, def, true);
    expect(state.save.gold).toBe(75);
    expect(pilotGone(state, def)).toBe(true);
    expect(beginPilot(state, def)).toBe(false);
    const cleared = newPilot('grandmaster'); beginPilot(cleared, def);
    cleared.run = solve(cleared.run!); settlePilot(cleared, def);
    beginPilot(cleared, def); settlePilot(cleared, def, true);
    expect(pilotGone(cleared, def)).toBe(false);
    expect(beginPilot(cleared, def)).toBe(true);
  });
  it('leaving teaching with no active attempt is free', () => {
    const state = newPilot();
    expect(settlePilot(state, def, true)).toBe(false);
    expect(state.save.gold).toBe(100);
  });
});

describe('opening poster', () => {
  it('marks captures, including the pawn captured en passant', () => {
    expect(posterTarget('7k/b7/8/8/8/8/R7/K7 w - - 0 1', 'a2a7')).toBe('a7');
    expect(posterTarget('7k/8/8/3pP3/8/8/8/K7 w - d6 0 1', 'e5d6')).toBe('d5');
  });
  it('marks only new attacks, highest value first, then a1..h8', () => {
    expect(posterTarget('7k/4b3/8/8/3N3r/8/8/K7 w - - 0 1', 'd4f5')).toBe('h4');
    expect(posterTarget('7k/4r3/8/8/3N3r/8/8/K7 w - - 0 1', 'd4f5')).toBe('h4');
    expect(posterTarget('7k/b7/8/8/8/8/R7/K7 w - - 0 1', 'a2a3')).toBeNull();
    expect(posterTarget('7k/8/8/3p4/8/8/4P3/K7 w - - 0 1', 'e2e4')).toBe('d5');
  });
  it('ignores king-only checks, quiet moves and illegal moves', () => {
    expect(posterTarget('7k/8/8/8/8/8/R7/K7 w - - 0 1', 'a2h2')).toBeNull();
    expect(posterTarget(new Chess().fen(), 'e2e4')).toBeNull();
    expect(posterTarget(new Chess().fen(), 'a1a8')).toBeNull();
  });
});
