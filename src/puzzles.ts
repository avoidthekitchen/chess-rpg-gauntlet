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
  ).then((lists) => uniqueById(lists.flatMap((list, i) => list.map((p) => ({ ...p, theme: THEMES[i] })))));
  pool.catch(() => (pool = null)); // let a failed load retry next time
  return pool;
}

/** Some puzzles carry two themes and sit in two packs; keep the first copy so a bounty can't show up twice. */
export function uniqueById(puzzles: Puzzle[]): Puzzle[] {
  const seen = new Set<string>();
  return puzzles.filter((p) => !seen.has(p.id) && (seen.add(p.id), true));
}

export const THEME_TEXT: Record<string, { name: string; task: string }> = {
  mateIn1: { name: 'Mate in one', task: 'Find the checkmate in one move.' },
  hangingPiece: { name: 'Hanging piece', task: 'Something is left unguarded. Win it.' },
};

/** How to describe a puzzle: by the file it came from (some hanging-piece puzzles also end in mate). */
export const puzzleTheme = (p: Puzzle) => p.theme ?? (p.themes.includes('mateIn1') ? 'mateIn1' : 'hangingPiece');
