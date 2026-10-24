import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { changedFiles, dependencies, relativeImports, slowChecksFor } from './plan.mjs';

/** A tiny fake repo: battles imports battle.ts, which imports material.ts; boss imports boss.ts. */
const FILES: Record<string, string> = {
  'scripts/verify/battles.verify.test.ts': "import { Battle } from '../../src/game/battle';\nimport { Chess } from 'chess.js';",
  'scripts/verify/boss.verify.test.ts': "import { bossFen } from '../../src/game/boss';",
  'src/game/battle.ts': "import { PIECE_VALUE } from './material';\nexport type { Status } from './status';",
  'src/game/status.ts': 'export type Status = string;',
  'src/game/material.ts': 'export const PIECE_VALUE = {};',
  'src/game/boss.ts': "import type { HireType } from './economy';",
  'src/game/economy.ts': '',
  'src/scenes/Town.ts': "import { PIECE_VALUE } from '../game/material';",
};
const read = (p: string) => FILES[p] ?? null;

describe('ci plan', () => {
  it('finds relative imports and re-exports, skipping packages', () => {
    expect(relativeImports(FILES['src/game/battle.ts'])).toEqual(['./material', './status']);
    expect(relativeImports(FILES['scripts/verify/battles.verify.test.ts'])).toEqual(['../../src/game/battle']);
  });

  it('follows imports transitively', () => {
    expect([...dependencies('scripts/verify/battles.verify.test.ts', read)].sort()).toEqual([
      'scripts/verify/battles.verify.test.ts',
      'src/game/battle.ts',
      'src/game/material.ts',
      'src/game/status.ts',
    ]);
  });

  it('runs only the checks a change can reach', () => {
    expect(slowChecksFor(['src/game/material.ts'], read)).toEqual({ battles: 'src/game/material.ts', boss: null });
    expect(slowChecksFor(['src/game/economy.ts'], read)).toEqual({ battles: null, boss: 'src/game/economy.ts' });
    expect(slowChecksFor(['src/scenes/Town.ts', 'docs/design.md'], read)).toEqual({ battles: null, boss: null });
  });

  it('runs everything for engine or library changes, or when forced', () => {
    expect(slowChecksFor(['package-lock.json'], read)).toEqual({ battles: 'package-lock.json', boss: 'package-lock.json' });
    expect(slowChecksFor([], read, true)).toEqual({ battles: '--full', boss: '--full' });
  });

  it('lists branch, uncommitted and untracked changes against main', () => {
    const out: Record<string, string> = {
      'merge-base HEAD origin/main': 'abc',
      'diff --name-only abc...HEAD': 'src/game/battle.ts\nREADME.md',
      'diff --name-only HEAD': 'README.md',
      'ls-files --others --exclude-standard': 'notes.txt',
    };
    const git = (...a: string[]) => out[a.join(' ')] ?? '';
    expect(changedFiles(git)).toEqual({ base: 'abc', files: ['README.md', 'notes.txt', 'src/game/battle.ts'] });
  });

  it('reports no base when git can\'t find main, instead of an empty change set', () => {
    const git = (...a: string[]) => (a[0] === 'ls-files' ? 'notes.txt' : '');
    expect(changedFiles(git)).toEqual({ base: null, files: ['notes.txt'] });
  });

  it('keeps legacy benchmarks opt-in even with --full or no main branch (integration)', () => {
    const runner = fileURLToPath(new URL('./run.mjs', import.meta.url));
    const dir = mkdtempSync(join(tmpdir(), 'ci-nobase-'));
    try {
      const git = (...a: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: dir, stdio: 'pipe' });
      git('init', '-q', '-b', 'feature');
      writeFileSync(join(dir, 'battle.ts'), 'export {};');
      git('add', '.');
      git('commit', '-q', '-m', 'a committed rule change');
      for (const flags of [[], ['--full']]) {
        const current = execFileSync(process.execPath, [runner, '--plan', ...flags], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
        expect(current).toContain('Legacy engine benchmarks: excluded');
        expect(current).not.toMatch(/(?:battles|boss)\s+runs/);
      }
      const out = execFileSync(process.execPath, [runner, '--legacy', '--plan'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
      expect(out).toContain('Changed files: unknown');
      expect(out).toMatch(/battles\s+runs \(change set unknown\)/);
      expect(out).toMatch(/boss\s+runs \(change set unknown\)/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
