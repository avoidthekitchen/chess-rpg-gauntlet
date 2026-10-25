import { expect, it } from 'vitest';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { zstdCompressSync } from 'node:zlib';

const repo = fileURLToPath(new URL('../../', import.meta.url));
function fixture(run: (root: string, rows: string[][]) => void) {
  const root = mkdtempSync(join(tmpdir(), 'pawnshire-curation-'));
  try {
    for (const dir of ['scripts', 'src/game/course', 'data/raw']) mkdirSync(join(root, dir), { recursive: true });
    symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'), 'dir');
    for (const name of ['select-curriculum.mjs', 'puzzle-candidates.mjs']) copyFileSync(join(repo, 'scripts', name), join(root, 'scripts', name));
    copyFileSync(join(repo, 'data/retired-puzzle-ids.json'), join(root, 'data/retired-puzzle-ids.json'));
    const files = ['src/game/curriculumPuzzles.json', ...readdirSync(join(repo, 'src/game/course')).filter(name => name.endsWith('Puzzles.json')).map(name => `src/game/course/${name}`)];
    const rows: string[][] = [];
    for (const file of files) {
      copyFileSync(join(repo, file), join(root, file));
      const pack = JSON.parse(readFileSync(join(repo, file), 'utf8'));
      for (const puzzle of Object.values(pack).flat() as { id: string; fen: string; moves: string[]; rating: number; themes: string[]; quality: { rd: number; popularity: number; plays: number } }[]) {
        rows.push([puzzle.id, puzzle.fen, puzzle.moves.join(' '), String(puzzle.rating), String(puzzle.quality.rd), String(puzzle.quality.popularity), String(puzzle.quality.plays), puzzle.themes.join(' ')]);
      }
    }
    run(root, rows);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
function database(root: string, rows: string[][]) {
  writeFileSync(join(root, 'data/raw/lichess_db_puzzle.csv.zst'), zstdCompressSync(Buffer.from(rows.map(row => row.join(',')).join('\n'))));
}
function select(root: string, ...args: string[]) {
  return spawnSync(process.execPath, ['scripts/select-curriculum.mjs', ...args], { cwd: root, encoding: 'utf8' });
}
it('verifies every shipped source without retired runtime packs', () => fixture((root, rows) => {
  database(root, rows);
  const result = select(root, '--verify-shipped');
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Verified 273 unchanged published puzzles');
  rows[0][3] = String(Number(rows[0][3]) + 1);
  database(root, rows);
  const mismatch = select(root, '--verify-shipped');
  expect(mismatch.status).toBe(1);
  expect(mismatch.stderr).toContain(`Source mismatch: ${rows[0][0]}`);
}));
it('keeps theme shortlisting runnable after retiring the bounty-pack builder', () => fixture((root, rows) => {
  database(root, rows);
  const result = select(root, '--candidates', 'doubleCheck', '--min', '400', '--max', '1300');
  expect(result.status, result.stderr).toBe(0);
  const shortlist = JSON.parse(readFileSync(join(root, 'data/raw/candidates-doubleCheck.json'), 'utf8'));
  expect(shortlist.candidates.length).toBeGreaterThan(0);
  expect(shortlist.tag).toBe('doubleCheck');
}));
