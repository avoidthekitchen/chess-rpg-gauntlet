import type { Puzzle } from './game/bounty';

/** Region 1 bounty puzzles, built from the Lichess puzzle database by scripts/build-puzzles.mjs. */
const THEMES = ['mateIn1', 'hangingPiece'];
const FILES = THEMES.map((t) => `puzzles/region1/${t}.json`);

let pool: Promise<Puzzle[]> | null = null;

export function loadPuzzles(): Promise<Puzzle[]> {
  pool ??= Promise.all(
    FILES.map((f) =>
      fetch(`${import.meta.env.BASE_URL}${f}`).then((r) => {
        if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
        return r.json() as Promise<Puzzle[]>;
      }),
    ),
  ).then((lists) => lists.flatMap((list, i) => list.map((p) => ({ ...p, theme: THEMES[i] }))));
  pool.catch(() => (pool = null)); // let a failed load retry next time
  return pool;
}

export const THEME_TEXT: Record<string, { name: string; task: string }> = {
  mateIn1: { name: 'Mate in one', task: 'Find the checkmate in one move.' },
  hangingPiece: { name: 'Hanging piece', task: 'Something is left unguarded. Win it.' },
};

/** How to describe a puzzle: by the file it came from (some hanging-piece puzzles also end in mate). */
export const puzzleTheme = (p: Puzzle) => p.theme ?? (p.themes.includes('mateIn1') ? 'mateIn1' : 'hangingPiece');
