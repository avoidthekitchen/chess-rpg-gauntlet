import { costWords, type MoveReview } from '../game/review';
import { esc } from './overlay';

/** What the post-battle review found: the costliest move, nothing worth flagging, or no review at all. */
export type ReviewResult = { ok: true; mistake: (MoveReview & { cost: number }) | null } | { ok: false };

/** Marker in a result dialog's HTML where the review goes once it's ready. */
export const REVIEW_SLOT = '<!--review-->';

/** The battle review: the costliest move and what was better (pillar 4: lessons are clear). */
export function reviewHtml(r: ReviewResult, won: boolean, reason: string): string {
  let body: string;
  if (!r.ok) body = 'The review couldn’t finish this time (the engine was busy or unavailable).';
  else if (r.mistake) {
    const m = r.mistake;
    body = `${won ? 'You won, but your' : 'Your'} biggest slip was move ${m.number}, <strong>${esc(m.played)}</strong>. It gave away ${esc(costWords(m.cost))}. <strong>${esc(m.best)}</strong> was stronger.`;
  } else if (won) body = 'No real mistakes. Clean work!';
  else if (/^Out of moves/.test(reason)) body = 'No single blunder: you just ran out of moves. Look for a quicker route to the goal.';
  else if (/village/.test(reason)) body = 'No single big blunder. Check every turn that each village has at least as many guards as raiders nearby.';
  else body = 'No single move gave it away. Try a different plan next time.';
  return `<div class="review"><p class="who">Battle review</p><p>${body}</p></div>`;
}
