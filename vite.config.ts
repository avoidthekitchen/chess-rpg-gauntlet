import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the same build works under any subpath (e.g. /chess-rpg/) and inside Capacitor.
  base: './',
  test: {
    // Engine-backed checks (scripts/verify) are slow and run separately with `npm run verify:battles`.
    include: ['src/**/*.test.ts'],
  },
});
