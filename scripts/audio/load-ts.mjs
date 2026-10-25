// Loads a TypeScript module from src/ through Vite, so scripts share the game's own content.
import { createServer } from 'vite';

export async function loadTs(path) {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    return await server.ssrLoadModule(path);
  } finally {
    await server.close();
  }
}
