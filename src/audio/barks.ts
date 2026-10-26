import type { CourseCue } from '../ui/coursePresentation';

/** Our pieces speak only for these moments; routine moves and captures stay quiet. */
export const SPOKEN_ALLY_CUES: readonly CourseCue[] = ['Check', 'Fork', 'Double check', 'Mate', 'Promotion'];
/** Milliseconds between spoken move lines. */
export const BARK_GAP = 12000;

/** What a lesson remembers about spoken move lines: each line once, and when the last one spoke. */
export interface BarkMemory { spoken: Set<string>; last: number }
export const freshBarks = (): BarkMemory => ({ spoken: new Set(), last: -Infinity });

/**
 * Whether a move line should speak now (see docs/design/systems.md#tuning-values).
 * Records it when it does. A line that can't be heard uses up neither the line nor the gap.
 */
export function shouldBark(memory: BarkMemory, line: { side: 'ally' | 'foe'; voice?: string; line: string }, cues: readonly string[], now: number, audible: boolean): boolean {
  if (line.side === 'ally' && !cues.some((cue) => (SPOKEN_ALLY_CUES as readonly string[]).includes(cue))) return false;
  if (!audible) return false;
  const id = `${line.voice}|${line.line}`;
  if (memory.spoken.has(id) || now - memory.last < BARK_GAP) return false;
  memory.spoken.add(id);
  memory.last = now;
  return true;
}
