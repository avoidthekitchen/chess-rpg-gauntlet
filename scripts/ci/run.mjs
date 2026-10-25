// Current release checks. --full remains an alias; --plan only prints the checks.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const unsupported = args.filter(arg => !['--full', '--plan'].includes(arg));
if (unsupported.length) {
  console.error(`Unsupported CI options: ${unsupported.join(', ')}. Legacy engine checks were retired in #55.`);
  process.exit(1);
}
console.log('Curriculum release checks: type-check, production build, and unit tests.');
if (!args.includes('--plan')) {
  const result = spawnSync('npm', ['run', 'check'], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log('✓ Curriculum release checks passed');
}
