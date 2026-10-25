import { Chess, type Square } from 'chess.js';
import { checkPuzzleMove, puzzleStart, type Puzzle } from './puzzle';
import type { DifficultyId } from './difficulty';
import type { StarterType } from './companions';

export interface AmbushPuzzle extends Puzzle {
  source: string;
  reason: string;
  quality: { rd: number; popularity: number; plays: number };
}
export interface AmbushDef {
  id: string;
  kind: 'ambush';
  title: string;
  theme: string;
  tag: string;
  reward: number;
  bonuses: { kind: 'clean' | 'noHint'; gold: number }[];
  before: string[];
  after: string[];
  showLines: Record<StarterType, string>;
  show: AmbushPuzzle;
  waves: { main: AmbushPuzzle; backup: AmbushPuzzle; line: string }[];
}

export const AMBUSH_HELP: Record<DifficultyId, { misses: number | null; hints: boolean; coaching: 'all' | 'first' | 'none' }> = {
  squire: { misses: null, hints: true, coaching: 'all' },
  knight: { misses: 3, hints: true, coaching: 'first' },
  champion: { misses: 2, hints: false, coaching: 'none' },
  grandmaster: { misses: 2, hints: false, coaching: 'none' },
};

export interface AmbushRun {
  difficulty: DifficultyId;
  wave: number;
  step: number;
  misses: number;
  hintsUsed: number;
  backupWave: number | null;
  fen: string;
  status: 'solving' | 'waveWon' | 'won' | 'lost';
  settled: boolean;
}

export const uciMove = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
export const wavePuzzle = (def: AmbushDef, run: AmbushRun) => def.waves[run.wave][run.backupWave === run.wave ? 'backup' : 'main'];

export function startAmbush(def: AmbushDef, difficulty: DifficultyId, retryFromWave?: number): AmbushRun {
  const backupWave = retryFromWave !== undefined && Number.isInteger(retryFromWave) && retryFromWave >= 0 && retryFromWave < def.waves.length ? retryFromWave : null;
  const run: AmbushRun = { difficulty, wave: 0, step: 0, misses: 0, hintsUsed: 0, backupWave, fen: '', status: 'solving', settled: false };
  run.fen = puzzleStart(wavePuzzle(def, run)).fen;
  return run;
}

export function isDoubleCheck(chess: Chess): boolean {
  const king = chess.board().flat().find(p => p?.type === 'k' && p.color === chess.turn());
  return !!king && chess.attackers(king.square, chess.turn() === 'w' ? 'b' : 'w').length > 1;
}

/** Commit a whole solver/reply pair before the scene animates it. Wrong legal moves stay on the same position. */
export function moveAmbush(def: AmbushDef, run: AmbushRun, uci: string): { run: AmbushRun; verdict: 'ignored' | 'miss' | 'correct' | 'waveWon' | 'won'; moves: string[]; doubleCheck: boolean } {
  const ignored = { run, verdict: 'ignored' as const, moves: [], doubleCheck: false };
  if (run.status !== 'solving' || run.settled) return ignored;
  const chess = new Chess(run.fen);
  try { chess.move(uciMove(uci)); } catch { return ignored; }
  const p = wavePuzzle(def, run);
  const verdict = checkPuzzleMove(p, run.step, uci);
  const next = { ...run };
  if (verdict === 'wrong') {
    next.misses++;
    const limit = AMBUSH_HELP[next.difficulty].misses;
    if (limit !== null && next.misses >= limit) next.status = 'lost';
    return { run: next, verdict: 'miss', moves: [uci], doubleCheck: false };
  }
  const doubleCheck = isDoubleCheck(chess);
  const moves = [uci];
  if (verdict === 'solved') next.status = next.wave === def.waves.length - 1 ? 'won' : 'waveWon';
  else {
    const reply = p.moves[2 + 2 * run.step];
    chess.move(uciMove(reply));
    moves.push(reply);
    next.step++;
  }
  next.fen = chess.fen();
  return { run: next, verdict: next.status === 'won' ? 'won' : next.status === 'waveWon' ? 'waveWon' : 'correct', moves, doubleCheck };
}

export function nextAmbushWave(def: AmbushDef, run: AmbushRun): AmbushRun {
  if (run.status !== 'waveWon') return run;
  const next = { ...run, wave: run.wave + 1, step: 0, status: 'solving' as const };
  next.fen = puzzleStart(wavePuzzle(def, next)).fen;
  return next;
}

export function hintAmbush(def: AmbushDef, run: AmbushRun): { run: AmbushRun; square: Square | null } {
  if (run.status !== 'solving' || run.settled || !AMBUSH_HELP[run.difficulty].hints) return { run, square: null };
  return { run: { ...run, hintsUsed: run.hintsUsed + 1 }, square: wavePuzzle(def, run).moves[1 + 2 * run.step].slice(0, 2) as Square };
}
