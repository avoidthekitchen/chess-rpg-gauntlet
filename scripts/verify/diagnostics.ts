import type { GameResult } from './simulate';

/** A stable corpus chosen before its results, independent of worker scheduling and filters. */
export const DEFAULT_SEED = 'pawnshire-legacy-v1';

/** FNV-1a of unambiguous labels gives each game its own repeatable stream. */
export function gameSeed(base: string, ...labels: (string | number)[]): number {
  let hash = 2166136261;
  for (const ch of JSON.stringify([base, ...labels])) {
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32: a full 32-bit state, with draws in [0, 1). Only the harness uses it. */
export function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wilson 95% interval, descriptive only: approved gates still use the observed rate. */
export function rateReport(hits: number, total: number): string {
  if (!total) return '0/0 (no observations)';
  const z = 1.959963984540054;
  const p = hits / total;
  const denom = 1 + z * z / total;
  const centre = (p + z * z / (2 * total)) / denom;
  const half = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denom;
  const pct = (v: number) => (100 * v).toFixed(1);
  return `${hits}/${total}=${pct(p)}% (Wilson 95% ${pct(centre - half)}–${pct(centre + half)}%)`;
}

export function gameTrace(label: string, seed: number, game: GameResult): string {
  return `${label} seed=${seed} ${game.status}, lost=${game.piecesLost}, playerMoves=${game.playerMoves}: ${game.moves.join(' ')} — ${game.reason}`;
}
