// Decides which slow engine checks a change needs, by following each check's imports.
// Pure functions, so they're unit tested (plan.test.ts); scripts/ci/run.mjs does the I/O.

import { dirname, join, normalize } from 'node:path';

/** The slow checks, each a vitest file under the verify config. */
export const SLOW_CHECKS = {
  battles: 'scripts/verify/battles.verify.test.ts',
  boss: 'scripts/verify/boss.verify.test.ts',
};

/** Files that change every check without being imported: library and engine versions (any upgrade changes the lockfile), the verify config. */
export const ALWAYS = ['package-lock.json', 'vitest.verify.config.ts'];

const IMPORT = /(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/g;

/** Relative import paths in a TypeScript source (bare packages like chess.js are skipped). */
export function relativeImports(source) {
  const out = [];
  for (const m of source.matchAll(IMPORT)) if (m[1].startsWith('.')) out.push(m[1]);
  return out;
}

/**
 * Every repo file a check depends on: the check itself and everything it imports, transitively.
 * `read(path)` returns a file's text, or null when it doesn't exist.
 */
export function dependencies(entry, read) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    const text = read(file);
    if (text === null) continue;
    seen.add(file);
    for (const spec of relativeImports(text)) {
      const base = normalize(join(dirname(file), spec)).replace(/\.(m?js)$/, '');
      const hit = [`${base}.ts`, `${base}.mjs`, `${base}.js`, join(base, 'index.ts')].find((p) => read(p) !== null);
      if (hit) stack.push(hit);
    }
  }
  return seen;
}

const lines = (s) => s.split('\n').filter(Boolean);

/**
 * Files changed on this branch since it left main, plus uncommitted and untracked files.
 * `git(...args)` returns git's output, or '' on failure. `base` is null when git can't find
 * where the branch left main (a shallow or single-branch clone): then the change set is
 * unknown, and the caller must run every check rather than trust an empty list.
 */
export function changedFiles(git) {
  const base = git('merge-base', 'HEAD', 'origin/main') || git('merge-base', 'HEAD', 'main') || null;
  const files = new Set([
    ...(base ? lines(git('diff', '--name-only', `${base}...HEAD`)) : []),
    ...lines(git('diff', '--name-only', 'HEAD')),
    ...lines(git('ls-files', '--others', '--exclude-standard')),
  ]);
  return { base, files: [...files].sort() };
}

/**
 * Which slow checks to run for a set of changed files, and why.
 * Returns e.g. { battles: 'src/game/battle.ts', boss: null } (null means skip).
 */
export function slowChecksFor(changed, read, full = false) {
  const plan = {};
  for (const [name, entry] of Object.entries(SLOW_CHECKS)) {
    if (full) {
      plan[name] = '--full';
      continue;
    }
    const deps = dependencies(entry, read);
    plan[name] = changed.find((f) => ALWAYS.includes(f) || deps.has(f)) ?? null;
  }
  return plan;
}
