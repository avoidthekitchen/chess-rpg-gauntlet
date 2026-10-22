import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bossFen } from '../../src/game/boss';
import type { BattleDef } from '../../src/game/content';
import { DIFFICULTIES, type DifficultyId } from '../../src/game/difficulty';
import type { HireType } from '../../src/game/economy';
import { R1_BOSS, R1_BOSS_ARMY } from '../../src/game/region1Boss';
import { NodeEngine } from './nodeEngine';
import { playGame, runPool, type GameResult, type PlayerKind } from './simulate';

/**
 * Engine-backed check of the Goblin Chief's duel with typical 10-point armies (one per
 * starter, after one hire) and the free starting army (5-7 points). A competent player
 * must win nearly always; a careless one should usually lose. Env: VERIFY_GAMES (default 8).
 */

const GAMES = Number(process.env.VERIFY_GAMES ?? 8);
const POOL = Number(process.env.VERIFY_ENGINES ?? 8);
const LEVELS: DifficultyId[] = ['squire', 'knight'];
const PLAYERS: PlayerKind[] = ['competent', 'careless', 'greedy'];
const ARMIES: Record<string, HireType[]> = {
  'frog + 2 squires + tower': ['n', 'p', 'p', 'r'],
  'owl + 2 squires + tower': ['b', 'p', 'p', 'r'],
  'tortoise + 2 squires + frog': ['r', 'p', 'p', 'n'],
  'frog + 2 squires (no hires)': ['n', 'p', 'p'],
};

let engines: NodeEngine[] = [];
beforeAll(async () => {
  engines = Array.from({ length: POOL }, () => new NodeEngine());
  await Promise.all(engines.map((e) => e.ready));
});
afterAll(() => engines.forEach((e) => e.quit()));

describe('Goblin Chief duel', () => {
  it('is winnable with a typical army and not trivial', async () => {
    const table: string[] = [];
    const failures: string[] = [];
    for (const [name, picks] of Object.entries(ARMIES)) {
      const def: BattleDef = { ...R1_BOSS, fen: bossFen(picks, R1_BOSS_ARMY) };
      for (const level of LEVELS) {
        const cells: string[] = [];
        for (const player of PLAYERS) {
          const jobs = Array.from({ length: GAMES }, () => (eng: NodeEngine) => playGame(def, DIFFICULTIES[level].ai, player, eng));
          const res: GameResult[] = await runPool(engines, jobs);
          const wins = res.filter((r) => r.status === 'won');
          const rate = wins.length / res.length;
          const avg = wins.length ? wins.reduce((a, r) => a + r.playerMoves, 0) / wins.length : 0;
          const lost = res.filter((r) => r.status !== 'won').map((r) => r.reason.split('.')[0]);
          cells.push(`${player} ${Math.round(rate * 100)}%${wins.length ? ` (${avg.toFixed(0)} mv, ${wins.filter((w) => w.piecesLost === 0).length} flawless)` : ''}${lost.length ? ` [${[...new Set(lost)].join('; ')}]` : ''}`);
          // The full-strength army should be beatable by good play; the no-hire army is reported only.
          if (player === 'competent' && picks.length > 3 && rate < 0.85) failures.push(`${name} @${level}: competent ${rate}`);
        }
        table.push(`${name.padEnd(30)} ${level.padEnd(7)} ${cells.join(' | ')}`);
      }
    }
    process.stdout.write(`\nGoblin Chief duel (${GAMES} games per cell)\n${table.join("\n")}\n`);
    expect(failures).toEqual([]);
  });
});
