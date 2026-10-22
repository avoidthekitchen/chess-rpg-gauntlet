import { defineConfig } from 'vitest/config';

/** Engine-backed battle verification: slow, so it runs on its own with `npm run verify:battles`. */
export default defineConfig({
  test: {
    include: ['scripts/verify/**/*.verify.test.ts'],
    testTimeout: 60 * 60 * 1000,
    hookTimeout: 60_000,
    // One file drives a pool of Stockfish processes itself.
    fileParallelism: false,
  },
});
