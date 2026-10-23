// Local CI: the quick checks always, then only the slow engine checks this branch's changes can affect.
//   npm run ci            quick checks + the slow checks your changes reach
//   npm run ci -- --full  quick checks + every slow check (before a Region ships)
//   npm run ci -- --plan  just print which slow checks would run, and why

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { SLOW_CHECKS, changedFiles, slowChecksFor } from './plan.mjs';

const args = new Set(process.argv.slice(2));
let full = args.has('--full');
const planOnly = args.has('--plan');

const git = (...a) => {
  try {
    return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

function run(label, cmd, cmdArgs) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed`);
    process.exit(r.status ?? 1);
  }
}

const { base, files: changed } = changedFiles(git);
if (!base && !full) {
  // Without a base the change set is unknown, so fail closed: run everything rather than nothing.
  console.warn('⚠ Can\'t find where this branch left main (no origin/main or main with shared history).');
  console.warn('  Running every engine check. Fetch main (git fetch origin main) to run only what changed.');
  full = true;
}
const plan = slowChecksFor(changed, read, full);
console.log(`Changed files: ${base ? changed.length : 'unknown'}`);
for (const [name, why] of Object.entries(plan)) {
  console.log(`  ${name.padEnd(8)} ${why ? `runs (${why === '--full' ? (base ? 'forced with --full' : 'change set unknown') : `${why} changed`})` : 'skipped: nothing it depends on changed'}`);
}
if (planOnly) process.exit(0);

run('Quick checks', 'npm', ['run', 'check']);
const slow = Object.entries(plan)
  .filter(([, why]) => why)
  .map(([name]) => SLOW_CHECKS[name]);
if (slow.length) run(`Engine checks: ${slow.join(', ')}`, 'npx', ['vitest', 'run', '--config', 'vitest.verify.config.ts', ...slow]);
console.log('\n✓ All checks passed');
