import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the same build works on Cloudflare and inside Capacitor.
  base: './',
});
