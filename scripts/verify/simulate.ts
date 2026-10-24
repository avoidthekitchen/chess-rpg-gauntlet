import { Chess, type PieceSymbol, type Square } from 'chess.js';
import { chooseEnemyMove } from '../../src/ai/enemy';
import { replyHabits, ShoutBook, shoutStands } from '../../src/ai/shout';
import { Battle, type MoveInput, type Status } from '../../src/game/battle';
import type { BattleDef } from '../../src/game/content';
import type { AiProfile } from '../../src/game/difficulty';
import { hangingPieces } from '../../src/game/threats';
import type { NodeEngine } from './nodeEngine';

/**
 * Plays whole battles the way the game does, including the shouting rule: before each
 * player move the goblins announce a move (cached by position, as in the game),
 * and after the player moves they decide again, with the shout preferred but never forced.
 */

export type PlayerKind = 'competent' | 'careless' | 'random' | 'greedy';

export interface GameResult {
  status: Status;
  reason: string;
  playerMoves: number;
  piecesLost: number;
  /** White and Black moves in UCI, alternating, White first. */
  moves: string[];
  /** Black moves that matched the shout (kept by preference, never forced). */
  shoutsKept: number;
}

export const toInput = (uci: string): MoveInput => ({
  from: uci.slice(0, 2) as Square,
  to: uci.slice(2, 4) as Square,
  promotion: (uci[4] as PieceSymbol | undefined) ?? undefined,
});

/** A fresh battle with `moves` (alternating White/Black UCI) replayed on it. */
export function replay(def: BattleDef, moves: string[], rewinds = 0): Battle {
  const b = new Battle(def, rewinds);
  moves.forEach((m, i) => (i % 2 === 0 ? b.playerMove(toInput(m)) : b.enemyMove(m)));
  return b;
}

/** Reads the status fresh (TypeScript would otherwise keep a narrowing from before a move). */
const statusOf = (b: Battle): Status => b.status;

const legalUci = (fen: string) =>
  new Chess(fen).moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ''));

/** Small nudges so the competent player cares about the battle's goal, not just the engine score. */
function goalBonus(b: Battle): number {
  const def = b.scenario as BattleDef;
  let bonus = 0;
  if (def.objective.kind === 'winMaterial') bonus += 40 * b.materialGained();
  // Siege: the counting rule. A village attacked more often than it's guarded is in trouble.
  for (const v of def.villages ?? []) {
    const excess = b.chess.attackers(v, 'b').length - b.chess.attackers(v, 'w').length;
    if (excess > 0) bonus -= 250 * excess;
  }
  if (def.objective.kind === 'promote') {
    // March the squire: the furthest White pawn's rank counts.
    let far = 0;
    b.chess.board().forEach((row, i) => row.forEach((c) => c?.type === 'p' && c.color === 'w' && (far = Math.max(far, 8 - i))));
    bonus += 150 * far;
  }
  // Chasing the flawless bonus: losing a piece, even in a fair trade, costs something.
  if (def.bonuses?.some((x) => x.kind === 'flawless')) {
    bonus -= 250 * b.piecesLost;
    // A piece left hanging costs something even on our own turn: with a second threat on the
    // board (a raid, a promotion) there may be no time to save it.
    bonus -= (b.isEnemyTurn() ? 100 : 60) * hangingPieces(b.chess, 'w').size;
  }
  return bonus;
}

/** Can White capture every raider standing on a village right now? */
function raidsAnswerable(b: Battle): boolean {
  const raided = b.raidedVillages();
  if (raided.length === 0) return true;
  if (raided.length > 1) return false;
  return new Chess(b.fen).moves({ verbose: true }).some((m) => m.to === raided[0]);
}

/** With villages: after this position (Black to move), can every Black reply that raids be answered? */
function everyRaidAnswerable(def: BattleDef, moves: string[]): boolean {
  if (!def.villages?.length) return true;
  const b = replay(def, moves);
  for (const reply of legalUci(b.fen)) {
    const t = replay(def, [...moves, reply]);
    if (t.status === 'playing' && !raidsAnswerable(t)) return false;
  }
  return true;
}

const MATE_SCORE = 1_000_000;

/** A White move that wins by White's next move whatever Black replies. Engine-free and exhaustive. */
function forcedWinIn2(def: BattleDef, moves: string[]): string | null {
  const start = replay(def, moves);
  for (const w1 of legalUci(start.fen)) {
    const a = replay(def, [...moves, w1]);
    if (a.status === 'won') return w1;
    if (a.status === 'lost') continue;
    const replies = legalUci(a.fen);
    let forced = true;
    for (const r of replies) {
      const t = replay(def, [...moves, w1, r], 1e9);
      if (t.status === 'won') continue;
      if (t.status === 'lost') {
        forced = false;
        break;
      }
      let found = false;
      for (const w2 of legalUci(t.fen)) {
        t.playerMove(toInput(w2));
        if (statusOf(t) === 'won') {
          found = true;
          break;
        }
        t.rewind();
      }
      if (!found) {
        forced = false;
        break;
      }
    }
    if (forced) return w1;
  }
  return null;
}

/**
 * A strong player: looks at every legal move with Stockfish and the battle's goal in mind.
 * It ignores the shout and assumes the goblins' best reply.
 */
async function competentMove(def: BattleDef, moves: string[], eng: NodeEngine): Promise<string> {
  const b = replay(def, moves);
  const quick = forcedWinIn2(def, moves);
  if (quick) return quick;
  const cands = await eng.analyse(b.fen, 11, 5);
  // Mating battles need to see a few moves further.
  const evalDepth = def.objective.kind === 'checkmate' ? 13 : 9;
  // Every legal move gets a look, not just the engine's top five.
  const pool = [...new Set([...cands.map((c) => c.uci), ...legalUci(b.fen)])];
  let best = pool[0];
  let bestScore = -Infinity;
  for (const uci of pool) {
    const t = replay(def, [...moves, uci]);
    let score: number;
    if (t.status === 'won') score = MATE_SCORE;
    else if (t.status === 'lost') score = -MATE_SCORE;
    else if (!everyRaidAnswerable(def, [...moves, uci])) score = -MATE_SCORE / 2;
    else {
      const ev = -((await eng.analyse(t.fen, evalDepth, 1))[0]?.score ?? 0);
      score = ev + goalBonus(t);
    }
    if (score > bestScore) {
      bestScore = score;
      best = uci;
    }
  }
  return best;
}

/** A careless player: a shallow look, then any of the top five moves at random. */
async function carelessMove(fen: string, eng: NodeEngine, rng: () => number): Promise<string> {
  const cands = await eng.analyse(fen, 1, 5);
  if (cands.length === 0) return legalUci(fen)[0];
  return cands[Math.floor(rng() * cands.length)].uci;
}

/** An impulsive player: grabs the biggest capture, else pushes its most advanced pawn, else anything. */
function greedyMove(fen: string, rng: () => number): string {
  const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const ms = new Chess(fen).moves({ verbose: true });
  const uci = (m: (typeof ms)[number]) => m.from + m.to + (m.promotion ?? '');
  const caps = ms.filter((m) => m.captured).sort((a, b) => VAL[b.captured!] - VAL[a.captured!]);
  if (caps.length) return uci(caps[0]);
  const pushes = ms.filter((m) => m.piece === 'p').sort((a, b) => Number(b.to[1]) - Number(a.to[1]));
  if (pushes.length) return uci(pushes.find((m) => !m.promotion || m.promotion === 'q') ?? pushes[0]);
  return uci(ms[Math.floor(rng() * ms.length)]);
}

function randomMove(fen: string, rng: () => number): string {
  const all = legalUci(fen);
  return all[Math.floor(rng() * all.length)];
}

export async function playGame(
  def: BattleDef,
  profile: AiProfile,
  player: PlayerKind,
  eng: NodeEngine,
  rng: () => number = Math.random,
): Promise<GameResult> {
  await eng.newGame();
  const b = new Battle(def, 0);
  const moves: string[] = [];
  const book = new ShoutBook();
  let shoutsKept = 0;
  for (let guard = 0; guard < 80 && b.status === 'playing'; guard++) {
    let shout: string | null;
    if (!def.shouts) shout = null; // e.g. the Goblin Chief, who keeps his plans to himself
    else shout = await book.plan(b, eng.asEngine(), profile);
    const shoutFen = b.fen;
    const w =
      player === 'competent'
        ? await competentMove(def, moves, eng)
        : player === 'careless'
          ? await carelessMove(b.fen, eng, rng)
          : player === 'greedy'
            ? greedyMove(b.fen, rng)
            : randomMove(b.fen, rng);
    b.playerMove(toInput(w));
    moves.push(w);
    if (b.status !== 'playing') break;
    const stands = shout !== null && shoutStands(b.fen, shout, shoutFen);
    const reply = await chooseEnemyMove(b, eng.asEngine(), profile, Math.random, replyHabits(!!def.shouts, shout, b.fen, shoutFen));
    if (stands && reply === shout) shoutsKept++;
    b.enemyMove(reply);
    moves.push(reply);
  }
  return { status: b.status, reason: b.reason, playerMoves: b.playerMoves, piecesLost: b.piecesLost, moves, shoutsKept };
}

/** Runs async jobs over a pool of engines, one job per engine at a time. */
export async function runPool<T>(engines: NodeEngine[], jobs: ((eng: NodeEngine) => Promise<T>)[]): Promise<T[]> {
  const out: T[] = new Array(jobs.length);
  let next = 0;
  await Promise.all(
    engines.map(async (eng) => {
      while (next < jobs.length) {
        const i = next++;
        out[i] = await jobs[i](eng);
      }
    }),
  );
  return out;
}
