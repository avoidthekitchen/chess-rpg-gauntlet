/**
 * Tactic banners need two checks: a board rule spots the pattern (src/game/tactics.ts)
 * and the engine confirms the move actually wins something. A "fork" where the forking
 * piece simply gets captured is not a fork, and celebrating it would teach the wrong lesson.
 */

/** How much better (in centipawns) than the material count before the move the engine must rate the position. */
export const FORK_MARGIN = 80;

/**
 * @param moverBalanceBefore the mover's material lead before the move, in points
 * @param replyScoreCp the engine's score for the position after the move, from the
 *   opponent's point of view (they are to move), as Stockfish reports it
 */
export function forkPays(moverBalanceBefore: number, replyScoreCp: number): boolean {
  const moverEval = -replyScoreCp;
  return moverEval >= moverBalanceBefore * 100 + FORK_MARGIN;
}
