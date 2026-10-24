// Curriculum CI always runs type-check, build, and unit tests.
//   npm run ci                         current release checks (--full is compatible)
//   npm run ci -- --legacy             additionally select historical engine diagnostics
//   npm run ci -- --legacy --full      additionally run every historical engine diagnostic
//   npm run ci -- --plan               print the plan without running checks

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

// The owner retired the legacy benchmark as a release gate on 2026-10-24.
// Keep the original selector and thresholds available only through explicit opt-in.
if (!args.has('--legacy')) {
  console.log('Legacy engine benchmarks: excluded from curriculum release checks (use --legacy to opt in).');
  if (planOnly) process.exit(0);
  run('Quick checks', 'npm', ['run', 'check']);
  console.log('\n✓ Curriculum release checks passed');
  process.exit(0);
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
