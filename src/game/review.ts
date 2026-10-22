/**
 * The post-battle review: "a review after each battle always shows what went wrong"
 * (pillar 4). For each of your moves the engine scores the best move and the move you
 * played, and the review names the biggest drop.
 */

export interface MoveReview {
  /** Your move number in the battle (1-based). */
  number: number;
  /** The move you played, in SAN. */
  played: string;
  /** The engine's best move from the same position, in SAN. */
  best: string;
  /** Engine scores from your point of view, in centipawns. */
  bestScore: number;
  playedScore: number;
}

/** Drops smaller than this aren't worth calling a mistake (about a pawn). */
export const MISTAKE_CP = 90;

/** Scores above this are treated as mates, so "mate in 3 vs mate in 4" isn't flagged. */
const MATE_ZONE = 50_000;

const clamp = (cp: number) => Math.max(-1500, Math.min(1500, cp));

/** How much a move cost, in centipawns (0 if it was as good as the best or better). */
export function moveCost(m: MoveReview): number {
  // Both mates (or both lost) means the move kept the result: not a mistake.
  if (m.bestScore > MATE_ZONE && m.playedScore > MATE_ZONE) return 0;
  if (m.played === m.best) return 0;
  return Math.max(0, clamp(m.bestScore) - clamp(m.playedScore));
}

/** The single costliest move, or null when nothing cost more than about a pawn. */
export function biggestMistake(moves: MoveReview[], threshold = MISTAKE_CP): (MoveReview & { cost: number }) | null {
  let worst: (MoveReview & { cost: number }) | null = null;
  for (const m of moves) {
    const cost = moveCost(m);
    if (cost >= threshold && (!worst || cost > worst.cost)) worst = { ...m, cost };
  }
  return worst;
}

/** Plain-language size of a mistake, in chess points. */
export function costWords(cp: number): string {
  if (cp >= 1500) return 'a winning position';
  const pts = Math.round(cp / 100);
  if (pts <= 1) return 'about a squire';
  if (pts <= 3) return `about ${pts} points (a knight or mage)`;
  if (pts <= 6) return `about ${pts} points (a tower or more)`;
  return `about ${pts} points`;
}
