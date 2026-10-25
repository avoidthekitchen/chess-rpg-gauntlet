import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the same build works under any subpath (e.g. /chess-rpg/) and inside Capacitor.
  base: './',
  test: {
    // Run the current journey, shared chess helpers, and release tooling checks.
    include: ['src/**/*.test.ts', 'scripts/ci/**/*.test.ts'],
  },
});
