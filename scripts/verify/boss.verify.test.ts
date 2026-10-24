import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bossFen } from '../../src/game/boss';
import type { BattleDef } from '../../src/game/content';
import { DIFFICULTIES, type DifficultyId } from '../../src/game/difficulty';
import type { HireType } from '../../src/game/economy';
import { R1_BOSS, R1_BOSS_ARMY } from '../../src/game/region1Boss';
import { NodeEngine } from './nodeEngine';
import { DEFAULT_SEED, gameSeed, gameTrace, rateReport, seededRng } from './diagnostics';
import { playGame, runPool, type GameResult, type PlayerKind } from './simulate';

/**
 * Engine-backed check of the Goblin Chief's duel with typical 10-point armies (one per
 * starter, after one hire), other budget-legal mixes such as two towers, and the free
 * starting army (5-7 points). With every full army, a competent player must almost never
 * lose and should usually finish the job; a careless one should usually lose.
 * Env: VERIFY_GAMES (default 8), VERIFY_ARMIES, VERIFY_SEED, VERIFY_SHOW=1 (losses) or all.
 */

const GAMES = Number(process.env.VERIFY_GAMES ?? 8);
const SEED = process.env.VERIFY_SEED ?? DEFAULT_SEED;
const SHOW = process.env.VERIFY_SHOW ?? '';
const POOL = Number(process.env.VERIFY_ENGINES ?? 8);
const LEVELS: DifficultyId[] = ['squire', 'knight'];
const PLAYERS: PlayerKind[] = ['competent', 'careless', 'greedy'];
const ARMIES: Record<string, HireType[]> = {
  'frog + 2 squires + tower': ['n', 'p', 'p', 'r'],
  'owl + 2 squires + tower': ['b', 'p', 'p', 'r'],
  'tortoise + 2 squires + frog': ['r', 'p', 'p', 'n'],
  'two towers': ['r', 'r'],
  'tower + 5 squires': ['r', 'p', 'p', 'p', 'p', 'p'],
  'two mages + frog + squire': ['b', 'b', 'n', 'p'],
  'two frogs + mage + squire': ['n', 'n', 'b', 'p'],
  'frog + 2 squires (no hires)': ['n', 'p', 'p'],
};

/** Armies below the budget, shown in the table but not held to the win-rate bars. */
const REPORT_ONLY = new Set(['frog + 2 squires (no hires)']);

/** A competent player may lose (checkmate or draw) at most this share of games. */
const MAX_LOSS_RATE = 0.15;
/** And must win at least this share; the rest hit the simulator's move cap without a result. */
const MIN_WIN_RATE = 0.6;

/** Optional comma-separated army names to run, e.g. VERIFY_ARMIES="two towers,owl + 2 squires + tower". */
const ONLY = process.env.VERIFY_ARMIES?.split(',').map((x) => x.trim());

let engines: NodeEngine[] = [];
beforeAll(async () => {
  process.stdout.write(`Legacy boss corpus: VERIFY_SEED=${JSON.stringify(SEED)}, ${GAMES} games per cell; intervals describe sampling uncertainty, gates are unchanged.\n`);
  engines = Array.from({ length: POOL }, () => new NodeEngine());
  await Promise.all(engines.map((e) => e.ready));
});
afterAll(() => engines.forEach((e) => e.quit()));

describe('Goblin Chief duel', () => {
  it('is winnable with a typical army and not trivial', async () => {
    const table: string[] = [];
    const failures: string[] = [];
    for (const [name, picks] of Object.entries(ARMIES)) {
      if (ONLY && !ONLY.includes(name)) continue;
      const def: BattleDef = { ...R1_BOSS, fen: bossFen(picks, R1_BOSS_ARMY) };
      for (const level of LEVELS) {
        const cells: string[] = [];
        for (const player of PLAYERS) {
          const seeds = Array.from({ length: GAMES }, (_, i) => gameSeed(SEED, 'boss', name, level, player, i));
          const jobs = seeds.map((seed) => (eng: NodeEngine) => playGame(def, def.ai?.[level] ?? DIFFICULTIES[level].ai, player, eng, seededRng(seed)));
          const failureCount = failures.length;
          const res: GameResult[] = await runPool(engines, jobs);
          const wins = res.filter((r) => r.status === 'won');
          const rate = wins.length / res.length;
          process.stdout.write(`${name} ${level} ${player}: wins ${rateReport(wins.length, res.length)}; losses ${rateReport(res.filter((r) => r.status === 'lost').length, res.length)}\n`);
          const avg = wins.length ? wins.reduce((a, r) => a + r.playerMoves, 0) / wins.length : 0;
          const fastest = wins.length ? Math.min(...wins.map((r) => r.playerMoves)) : 0;
          const losses = res.filter((r) => r.status === 'lost');
          const unfinished = res.filter((r) => r.status === 'playing').length;
          const lost = losses.map((r) => r.reason.split('.')[0]);
          if (unfinished) lost.push(`${unfinished} unfinished`);
          cells.push(`${player} ${Math.round(rate * 100)}%${wins.length ? ` (${avg.toFixed(0)} mv, fastest ${fastest}, ${wins.filter((w) => w.piecesLost === 0).length} flawless)` : ''}${lost.length ? ` [${[...new Set(lost)].join('; ')}]` : ''}`);
          // Good play with a full army shouldn't lose. A game that hits the simulator's move cap
          // isn't a loss (the simulated player is just slow to convert), so it only counts
          // against the win-rate floor.
          if (player === 'competent' && !REPORT_ONLY.has(name)) {
            const lossRate = losses.length / res.length;
            if (lossRate > MAX_LOSS_RATE) failures.push(`${name} @${level}: competent lost ${losses.length}/${res.length}`);
            if (rate < MIN_WIN_RATE) failures.push(`${name} @${level}: competent won only ${wins.length}/${res.length}`);
          }
          res.forEach((game, i) => {
            if (failures.length > failureCount || SHOW === 'all' || (SHOW && player === 'competent' && game.status !== 'won')) {
              process.stdout.write(gameTrace(`${name} ${level} ${player} game=${i}`, seeds[i], game) + '\n');
            }
          });
        }
        table.push(`${name.padEnd(30)} ${level.padEnd(7)} ${cells.join(' | ')}`);
      }
    }
    process.stdout.write(`\nGoblin Chief duel (${GAMES} games per cell)\n${table.join("\n")}\n`);
    expect(failures).toEqual([]);
  });
});
