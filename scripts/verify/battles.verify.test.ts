import { Chess } from 'chess.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { BattleDef } from '../../src/game/content';
import { DIFFICULTIES, type DifficultyId } from '../../src/game/difficulty';
import { REGION1_BATTLES } from '../../src/game/region1Battles';
import { NodeEngine } from './nodeEngine';
import { DEFAULT_SEED, gameSeed, gameTrace, rateReport, seededRng } from './diagnostics';
import { playGame, replay, runPool, type GameResult, type PlayerKind } from './simulate';

/**
 * Engine-backed checks for the Region 1 lesson battles. For each battle, plays many full
 * games with the real shouting rule against the Gentle and Brave goblins:
 * - a competent (Stockfish) player, who assumes the goblins' best reply, must win at least 90% and usually earn the bonuses;
 * - a careless player (a random pick among a depth-1 top five) must lose most games;
 * - every game must end for a reason that fits the objective.
 * Two more players are reported but not asserted: `greedy` (always grabs the biggest capture,
 * else pushes a pawn) and `random`. The simulation never rewinds.
 *
 * Env: VERIFY_SEED (corpus namespace, default pawnshire-legacy-v1), VERIFY_GAMES (games per player per difficulty, default 24), VERIFY_BATTLE (one id),
 * VERIFY_ENGINES (parallel Stockfish processes, default 8), VERIFY_SHOW=1 prints competent
 * losses and VERIFY_SHOW=all every game. With VERIFY_BATTLE set, VERIFY_FEN,
 * VERIFY_OBJECTIVE (JSON), VERIFY_VILLAGES (c4,e3) and VERIFY_BONUSES (JSON) try a variant without editing the battle.
 */

const GAMES = Number(process.env.VERIFY_GAMES ?? 24);
const ONLY = process.env.VERIFY_BATTLE;
const POOL = Number(process.env.VERIFY_ENGINES ?? 8);
const SHOW = process.env.VERIFY_SHOW ?? '';
const SEED = process.env.VERIFY_SEED ?? DEFAULT_SEED;
const LEVELS: DifficultyId[] = ['squire', 'knight'];
const PLAYERS: PlayerKind[] = ['competent', 'careless', 'greedy', 'random'];

/** The ending reasons that make sense for each objective (Battle's own wording). */
const OK_WIN: Record<string, RegExp> = {
  winMaterial: /^(You won|Checkmate!)/,
  survive: /^(Reinforcements arrive|The enemy has no moves left|The battle ends in a draw, and the villages|Checkmate!)/,
  checkmate: /^Checkmate!/,
  promote: /^(Your pawn reaches|Checkmate!)/,
};
const OK_LOSS = /^(Out of moves|They took it back|Checkmate\. Your king|A raider was left|Stalemate|The battle ends in a draw)/;

interface Row {
  battle: string;
  level: DifficultyId;
  player: PlayerKind;
  games: number;
  wins: number;
  bonus: Record<string, number>;
  avgMoves: number;
  /** Average number of Black moves that matched the shout, over wins. */
  avgShouts: number;
  reasons: Record<string, number>;
}

const rows: Row[] = [];
let engines: NodeEngine[] = [];

beforeAll(async () => {
  process.stdout.write(`Legacy battle corpus: VERIFY_SEED=${JSON.stringify(SEED)}, ${GAMES} games per cell; intervals describe sampling uncertainty, gates are unchanged.\n`);
  engines = Array.from({ length: POOL }, () => new NodeEngine());
  await Promise.all(engines.map((e) => e.ready));
});

afterAll(() => {
  engines.forEach((e) => e.quit());
  const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : '-');
  const lines = ['', 'battle        level   player     win   bonuses (of wins)          avg moves  shouts kept'];
  for (const r of rows) {
    const bonus = Object.entries(r.bonus)
      .map(([k, v]) => `${k} ${pct(v, r.wins)}`)
      .join(', ');
    lines.push(
      `${r.battle.padEnd(13)} ${r.level.padEnd(7)} ${r.player.padEnd(10)} ${pct(r.wins, r.games).padStart(4)}   ${bonus.padEnd(26)} ${r.avgMoves.toFixed(1).padStart(9)}  ${r.avgShouts.toFixed(1)}`,
    );
  }
  lines.push('', 'End reasons:');
  for (const r of rows) lines.push(`  ${r.battle} ${r.level} ${r.player}: ${JSON.stringify(r.reasons)}`);
  // Written straight to stdout so the table shows even when every test passes.
  process.stdout.write(lines.join('\n') + '\n');
});

function bonusHit(def: BattleDef, g: GameResult): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const b of def.bonuses) {
    const key = b.kind === 'quick' ? `quick≤${b.moves}` : b.kind;
    // The simulation never rewinds, so noRewind is met by every win.
    out[key] = g.status === 'won' && (b.kind === 'flawless' ? g.piecesLost === 0 : b.kind === 'quick' ? g.playerMoves <= b.moves : true);
  }
  return out;
}

// For tuning: VERIFY_FEN / VERIFY_OBJECTIVE (JSON) / VERIFY_VILLAGES override the chosen battle.
const tuned = (b: BattleDef): BattleDef => ({
  ...b,
  fen: process.env.VERIFY_FEN ?? b.fen,
  objective: process.env.VERIFY_OBJECTIVE ? JSON.parse(process.env.VERIFY_OBJECTIVE) : b.objective,
  villages: process.env.VERIFY_VILLAGES ? (process.env.VERIFY_VILLAGES.split(',') as BattleDef['villages']) : b.villages,
  bonuses: process.env.VERIFY_BONUSES ? JSON.parse(process.env.VERIFY_BONUSES) : b.bonuses,
});
const battles = REGION1_BATTLES.filter((b) => !ONLY || b.id === ONLY).map((b) => (ONLY ? tuned(b) : b));

// Exercise the real UCI adapter too: ucinewgame must remove prior games' search state.
it('repeats a seeded game across reused and fresh engines', async () => {
  const def = REGION1_BATTLES.find((b) => b.id === 'r1-guard')!;
  const seed = gameSeed(SEED, 'battle', def.id, 'knight', 'competent', 0);
  const play = (engine: NodeEngine) => playGame(def, DIFFICULTIES.knight.ai, 'competent', engine, seededRng(seed));
  const first = await play(engines[0]);
  expect(await play(engines[0])).toEqual(first);
  const fresh = new NodeEngine();
  try { await fresh.ready; expect(await play(fresh)).toEqual(first); }
  finally { fresh.quit(); }
});

describe.each(battles.map((b) => [b.id, b] as const))('%s', (_id, def) => {
  it('cannot be won on the first move', () => {
    const chess = new Chess(def.fen);
    for (const m of chess.moves({ verbose: true })) {
      const b = replay(def, [m.from + m.to + (m.promotion ?? '')]);
      expect(b.status, `${m.san} wins at once`).not.toBe('won');
    }
  });

  it('is won by competent play and lost by careless play', async () => {
    const jobs: { level: DifficultyId; player: PlayerKind; seed: number; index: number; run: (e: NodeEngine) => Promise<GameResult> }[] = [];
    for (const level of LEVELS)
      for (const player of PLAYERS)
        for (let i = 0; i < GAMES; i++) {
          const seed = gameSeed(SEED, 'battle', def.id, level, player, i);
          jobs.push({ level, player, seed, index: i, run: (e) => playGame(def, DIFFICULTIES[level].ai, player, e, seededRng(seed)) });
        }
    const results = await runPool(
      engines,
      jobs.map((j) => j.run),
    );

    const failures: string[] = [];
    for (const level of LEVELS)
      for (const player of PLAYERS) {
        const cell = results.flatMap((game, i) => jobs[i].level === level && jobs[i].player === player ? [{ game, job: jobs[i] }] : []);
        const games = cell.map(({ game }) => game);
        const failureCount = failures.length;
        const wins = games.filter((g) => g.status === 'won');
        const bonus: Record<string, number> = {};
        const reasons: Record<string, number> = {};
        for (const g of games) {
          for (const [k, hit] of Object.entries(bonusHit(def, g))) bonus[k] = (bonus[k] ?? 0) + (hit ? 1 : 0);
          const key = `${g.status}: ${g.reason.split(/[.!:]/)[0]}`;
          reasons[key] = (reasons[key] ?? 0) + 1;
          const okReason = g.status === 'won' ? OK_WIN[def.objective.kind].test(g.reason) : OK_LOSS.test(g.reason);
          if (!okReason || g.status === 'playing') failures.push(`${level} ${player}: unexpected end "${g.reason}" (${g.status})`);
        }
        rows.push({
          battle: def.id,
          level,
          player,
          games: games.length,
          wins: wins.length,
          bonus,
          avgMoves: wins.length ? wins.reduce((s, g) => s + g.playerMoves, 0) / wins.length : 0,
          avgShouts: wins.length ? wins.reduce((s, g) => s + g.shoutsKept, 0) / wins.length : 0,
          reasons,
        });
        const rate = wins.length / games.length;
        process.stdout.write(`${def.id} ${level} ${player}: wins ${rateReport(wins.length, games.length)}${player === 'competent' ? Object.entries(bonus).map(([key, hits]) => `; ${key} ${rateReport(hits, wins.length)}`).join('') : ''}\n`);
        if (player === 'competent') {
          if (rate < 0.9) failures.push(`${level}: competent win rate ${Math.round(rate * 100)}% < 90%`);
          for (const [k, v] of Object.entries(bonus))
            if (v < wins.length / 2) failures.push(`${level}: competent bonus ${k} only ${v}/${wins.length}`);
        }
        if (player === 'careless' && rate > 0.4) failures.push(`${level}: careless win rate ${Math.round(rate * 100)}% > 40%`);
        // On a failed cell include every trace, including wins missing a required bonus.
        // A namespace, labels and index identify the seed independently of pool order.
        for (const { game, job } of cell) {
          if (failures.length > failureCount || SHOW === 'all' || (SHOW && player === 'competent' && game.status !== 'won')) {
            process.stdout.write(gameTrace(`${def.id} ${level} ${player} game=${job.index}`, job.seed, game) + '\n');
          }
        }
      }
    expect(failures).toEqual([]);
  });
});
