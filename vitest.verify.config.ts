import { defineConfig } from 'vitest/config';

/** Engine-backed battle verification: slow, so it runs on its own with `npm run verify:battles`. */
export default defineConfig({
  test: {
    include: ['scripts/verify/**/*.verify.test.ts'],
    testTimeout: 60 * 60 * 1000,
    hookTimeout: 60_000,
    // Each file drives its own pool of Stockfish processes, but its game simulation runs on one
    // core, so the battle and boss files run side by side (measured: more engines per file don't help).
    fileParallelism: true,
  },
});
