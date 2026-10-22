import { Chess } from 'chess.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { BattleDef } from '../../src/game/content';
import { DIFFICULTIES, type DifficultyId } from '../../src/game/difficulty';
import { REGION1_BATTLES } from '../../src/game/region1Battles';
import { NodeEngine } from './nodeEngine';
import { playGame, replay, runPool, type GameResult, type PlayerKind } from './simulate';

/**
 * Engine-backed checks for the Region 1 lesson battles. For each battle, plays many full
 * games with the real shouting rule against the Squire and Knight goblins:
 * - a competent (Stockfish, shout-aware) player must win at least 90% and usually earn the bonuses;
 * - a careless player (a random pick among a depth-1 top five) must lose most games;
 * - every game must end for a reason that fits the objective.
 * Two more players are reported but not asserted: `greedy` (always grabs the biggest capture,
 * else pushes a pawn) and `random`. The simulation never rewinds.
 *
 * Env: VERIFY_GAMES (games per player per difficulty, default 24), VERIFY_BATTLE (one id),
 * VERIFY_ENGINES (parallel Stockfish processes, default 8), VERIFY_SHOW=1 prints competent
 * losses and VERIFY_SHOW=all every game. With VERIFY_BATTLE set, VERIFY_FEN,
 * VERIFY_OBJECTIVE (JSON) and VERIFY_VILLAGES (c3,f3) try a variant without editing the battle.
 */

const GAMES = Number(process.env.VERIFY_GAMES ?? 24);
const ONLY = process.env.VERIFY_BATTLE;
const POOL = Number(process.env.VERIFY_ENGINES ?? 8);
const SHOW = process.env.VERIFY_SHOW ?? '';
const LEVELS: DifficultyId[] = ['squire', 'knight'];
const PLAYERS: PlayerKind[] = ['competent', 'careless', 'greedy', 'random'];

/** The ending reasons that make sense for each objective (Battle's own wording). */
const OK_WIN: Record<string, RegExp> = {
  winMaterial: /^(You won|Checkmate!)/,
  survive: /^(Reinforcements arrive|The enemy has no moves left|The battle ends in a draw, and the villages|Checkmate!)/,
  checkmate: /^Checkmate!/,
  promote: /^(Your squire reaches|Checkmate!)/,
};
const OK_LOSS = /^(Out of moves|Checkmate\. Your king|A raider was left|Stalemate|The battle ends in a draw)/;

interface Row {
  battle: string;
  level: DifficultyId;
  player: PlayerKind;
  games: number;
  wins: number;
  bonus: Record<string, number>;
  avgMoves: number;
  /** Average number of Black moves forced by a standing shout, over wins. */
  avgShouts: number;
  reasons: Record<string, number>;
}

const rows: Row[] = [];
let engines: NodeEngine[] = [];

beforeAll(async () => {
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
});
const battles = REGION1_BATTLES.filter((b) => !ONLY || b.id === ONLY).map((b) => (ONLY ? tuned(b) : b));

describe.each(battles.map((b) => [b.id, b] as const))('%s', (_id, def) => {
  it('cannot be won on the first move', () => {
    const chess = new Chess(def.fen);
    for (const m of chess.moves({ verbose: true })) {
      const b = replay(def, [m.from + m.to + (m.promotion ?? '')]);
      expect(b.status, `${m.san} wins at once`).not.toBe('won');
    }
  });

  it('is won by competent play and lost by careless play', async () => {
    const jobs: { level: DifficultyId; player: PlayerKind; run: (e: NodeEngine) => Promise<GameResult> }[] = [];
    for (const level of LEVELS)
      for (const player of PLAYERS)
        for (let i = 0; i < GAMES; i++) jobs.push({ level, player, run: (e) => playGame(def, DIFFICULTIES[level].ai, player, e) });
    const results = await runPool(
      engines,
      jobs.map((j) => j.run),
    );

    const failures: string[] = [];
    for (const level of LEVELS)
      for (const player of PLAYERS) {
        const games = results.filter((_, i) => jobs[i].level === level && jobs[i].player === player);
        const wins = games.filter((g) => g.status === 'won');
        const bonus: Record<string, number> = {};
        const reasons: Record<string, number> = {};
        for (const g of games) {
          for (const [k, hit] of Object.entries(bonusHit(def, g))) bonus[k] = (bonus[k] ?? 0) + (hit ? 1 : 0);
          const key = `${g.status}: ${g.reason.split(/[.!:]/)[0]}`;
          reasons[key] = (reasons[key] ?? 0) + 1;
          const okReason = g.status === 'won' ? OK_WIN[def.objective.kind].test(g.reason) : OK_LOSS.test(g.reason);
          if (!okReason || g.status === 'playing') failures.push(`${level} ${player}: unexpected end "${g.reason}" (${g.status})`);
          if (SHOW && (player === 'competent' || SHOW === 'all') && (g.status !== 'won' || SHOW === 'all')) process.stdout.write(`${def.id} ${level} ${player} ${g.status}: ${g.moves.join(" ")} — ${g.reason}\n`);
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
        if (player === 'competent') {
          if (rate < 0.9) failures.push(`${level}: competent win rate ${Math.round(rate * 100)}% < 90%`);
          for (const [k, v] of Object.entries(bonus))
            if (v < wins.length / 2) failures.push(`${level}: competent bonus ${k} only ${v}/${wins.length}`);
        }
        if (player === 'careless' && rate > 0.4) failures.push(`${level}: careless win rate ${Math.round(rate * 100)}% > 40%`);
      }
    expect(failures).toEqual([]);
  });
});
