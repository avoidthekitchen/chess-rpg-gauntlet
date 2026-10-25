import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(new URL('./run.mjs', import.meta.url));
it.each([['--plan'], ['--full', '--plan']])('can inspect the current release plan with %j', (...args) => {
  const result = spawnSync(process.execPath, [runner, ...args], { encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('type-check, production build, and unit tests');
  expect(result.stdout).not.toContain('checks passed');
});
it.each(['--legacy', '--typo'])('rejects unsupported CI option %s instead of implying its checks ran', arg => {
  const result = spawnSync(process.execPath, [runner, arg, '--plan'], { encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Unsupported CI options');
});
