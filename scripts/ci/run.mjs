// Local CI: the quick checks always, then only the slow engine checks this branch's changes can affect.
//   npm run ci            quick checks + the slow checks your changes reach
//   npm run ci -- --full  quick checks + every slow check (before a Region ships)
//   npm run ci -- --plan  just print which slow checks would run, and why

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { SLOW_CHECKS, slowChecksFor } from './plan.mjs';

const args = new Set(process.argv.slice(2));
const full = args.has('--full');
const planOnly = args.has('--plan');

const git = (...a) => {
  try {
    return execFileSync('git', a, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};
const lines = (s) => s.split('\n').filter(Boolean);

/** Files changed on this branch since it left main, plus uncommitted and untracked files. */
function changedFiles() {
  const base = git('merge-base', 'HEAD', 'origin/main') || git('merge-base', 'HEAD', 'main');
  const files = new Set([
    ...(base ? lines(git('diff', '--name-only', `${base}...HEAD`)) : []),
    ...lines(git('diff', '--name-only', 'HEAD')),
    ...lines(git('ls-files', '--others', '--exclude-standard')),
  ]);
  return [...files].sort();
}

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

function run(label, cmd, cmdArgs) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed`);
    process.exit(r.status ?? 1);
  }
}

const changed = changedFiles();
const plan = slowChecksFor(changed, read, full);
console.log(`Changed files: ${changed.length}`);
for (const [name, why] of Object.entries(plan)) {
  console.log(`  ${name.padEnd(8)} ${why ? `runs (${why === '--full' ? 'forced with --full' : `${why} changed`})` : 'skipped: nothing it depends on changed'}`);
}
if (planOnly) process.exit(0);

run('Quick checks', 'npm', ['run', 'check']);
const slow = Object.entries(plan)
  .filter(([, why]) => why)
  .map(([name]) => SLOW_CHECKS[name]);
if (slow.length) run(`Engine checks: ${slow.join(', ')}`, 'npx', ['vitest', 'run', '--config', 'vitest.verify.config.ts', ...slow]);
console.log('\n✓ All checks passed');
