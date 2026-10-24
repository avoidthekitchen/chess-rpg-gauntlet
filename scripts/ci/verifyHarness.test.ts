import { Chess } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Candidate } from '../../src/ai/engine';
import type { BattleDef } from '../../src/game/content';
import { REGION1_BATTLES } from '../../src/game/region1Battles';
import { DEFAULT_SEED, gameSeed, gameTrace, rateReport, seededRng } from '../verify/diagnostics';
import type { NodeEngine } from '../verify/nodeEngine';
import { playGame, replay, runPool, type PlayerKind } from '../verify/simulate';

/** Legal, deterministic candidates: test the actual shout and enemy selection without Stockfish. */
function fakeEngine(): NodeEngine {
  const engine = {
    newGame: vi.fn(async () => undefined),
    asEngine: () => engine,
    analyse: async (fen: string, _depth: number, multiPv: number): Promise<Candidate[]> => new Chess(fen)
      .moves({ verbose: true }).slice(0, multiPv)
      .map((m) => ({ uci: m.from + m.to + (m.promotion ?? ''), score: 0 })),
  };
  return engine as unknown as NodeEngine;
}

const def: BattleDef = {
  ...REGION1_BATTLES[1],
  fen: '4k3/8/8/8/8/8/4P3/R3K3 w - - 0 1',
  objective: { kind: 'survive', turns: 3 },
  villages: [],
  bonuses: [],
};
const profile = { depth: 1, multiPv: 5, maxLoss: 100 };

afterEach(() => vi.restoreAllMocks());

describe('legacy verification randomness', () => {
  it.each<PlayerKind>(['competent', 'careless', 'greedy', 'random'])('keeps %s, shouts and enemy picks on the supplied RNG', async (player) => {
    vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Unseeded randomness'); });
    const rng = vi.fn(seededRng(gameSeed(DEFAULT_SEED, 'unit', player)));
    const engine = fakeEngine();
    const game = await playGame(def, profile, player, engine, rng);
    expect(engine.newGame).toHaveBeenCalledOnce();
    expect(rng).toHaveBeenCalled();
    expect(game.moves.length).toBeGreaterThan(1);
    const played = replay(def, game.moves);
    expect(game).toMatchObject({ status: played.status, reason: played.reason, playerMoves: played.playerMoves, piecesLost: played.piecesLost });
    expect(game.status).toBe('won');
  });

  it('consumes extra supplied draws for shouted plans', async () => {
    const withShouts = vi.fn(() => 0.3);
    const withoutShouts = vi.fn(() => 0.3);
    await playGame(def, profile, 'random', fakeEngine(), withShouts);
    await playGame({ ...def, shouts: false }, profile, 'random', fakeEngine(), withoutShouts);
    expect(withShouts.mock.calls.length).toBeGreaterThan(withoutShouts.mock.calls.length);
  });

  it('replays the corpus across pool sizes and when a game is filtered out', async () => {
    const seeds = Array.from({ length: 12 }, (_, i) => gameSeed(DEFAULT_SEED, 'unit', 'random', i));
    const jobs = seeds.map((seed) => (engine: NodeEngine) => playGame(def, profile, 'random', engine, seededRng(seed)));
    const serial = await runPool([fakeEngine()], jobs);
    const concurrent = await runPool([fakeEngine(), fakeEngine(), fakeEngine()], jobs);
    expect(concurrent).toEqual(serial);
    expect(await jobs[7](fakeEngine())).toEqual(serial[7]);
    expect(new Set(serial.map((g) => g.moves.join(' '))).size).toBeGreaterThan(1);
  });

  it('keeps corpus keys unambiguous and draws in range', () => {
    expect(gameSeed('base', 'a', 1)).toBe(gameSeed('base', 'a', 1));
    expect(new Set([gameSeed('base', 'a', 1), gameSeed('base', 'a1'), gameSeed('other', 'a', 1), gameSeed('base', 'a', 2)]).size).toBe(4);
    const draw = seededRng(1);
    const values = Array.from({ length: 10000 }, draw);
    expect(values.every((n) => n >= 0 && n < 1)).toBe(true);
    expect(new Set(values).size).toBe(10000);
    expect(values.slice(0, 3)).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
  });
});

describe('legacy verification reports', () => {
  it('shows small-sample uncertainty, including all-win and all-loss cells', () => {
    expect(rateReport(8, 8)).toBe('8/8=100.0% (Wilson 95% 67.6–100.0%)');
    expect(rateReport(0, 8)).toBe('0/8=0.0% (Wilson 95% 0.0–32.4%)');
    expect(rateReport(12, 24)).toBe('12/24=50.0% (Wilson 95% 31.4–68.6%)');
    expect(rateReport(0, 0)).toContain('no observations');
  });

  it('includes the game identity, numeric seed and full replay in a diagnostic trace', async () => {
    const game = await playGame(def, profile, 'random', fakeEngine(), seededRng(42));
    const trace = gameTrace('guard knight random game=7', 42, game);
    expect(trace).toContain('guard knight random game=7 seed=42');
    expect(trace).toContain(game.moves.join(' '));
    expect(trace).toContain(game.reason);
  });
});
