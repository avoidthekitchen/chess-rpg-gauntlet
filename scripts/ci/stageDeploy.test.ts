import { expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

it.each([false, true])('stages current assets and excludes stale retired assets (staging=%s)', staging => {
  const root = mkdtempSync(join(tmpdir(), 'pawnshire-stage-'));
  try {
    mkdirSync(join(root, 'scripts'));
    const script = join(root, 'scripts/stage-deploy.mjs');
    copyFileSync(fileURLToPath(new URL('../stage-deploy.mjs', import.meta.url)), script);
    const source = join(root, staging ? 'dist-staging' : 'dist');
    mkdirSync(source);
    writeFileSync(join(source, 'index.html'), 'current journey');
    for (const dir of ['engine', 'puzzles', 'models', 'mockups', 'sprites', 'backgrounds', 'assets']) {
      mkdirSync(join(source, dir));
      writeFileSync(join(source, dir, 'fixture'), dir);
    }
    writeFileSync(join(source, '.DS_Store'), 'metadata');
    const target = join(root, staging ? 'dist-worker-staging/staging-chess-rpg' : 'dist-worker/chess-rpg');
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'obsolete'), 'previous deployment');
    const result = spawnSync(process.execPath, [script, ...(staging ? ['--staging'] : [])], { encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(join(target, 'index.html'), 'utf8')).toBe('current journey');
    for (const dir of ['sprites', 'backgrounds', 'assets']) expect(readFileSync(join(target, dir, 'fixture'), 'utf8')).toBe(dir);
    for (const file of ['engine', 'puzzles', 'models', 'mockups', '.DS_Store', 'obsolete']) expect(existsSync(join(target, file)), file).toBe(false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
