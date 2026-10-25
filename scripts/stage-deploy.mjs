// Copies the Vite build into dist-worker/chess-rpg/ so Cloudflare serves it at
// unformedideas.com/chess-rpg/. Retired assets never enter deployment output.
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { relative, sep } from 'node:path';

const staging = process.argv.includes('--staging');
const SUBPATH = staging ? 'staging-chess-rpg' : 'chess-rpg';
const source = new URL(staging ? '../dist-staging/' : '../dist/', import.meta.url);
const root = new URL(staging ? '../dist-worker-staging/' : '../dist-worker/', import.meta.url);
const target = new URL(`./${SUBPATH}/`, root);

await stat(new URL('index.html', source)); // fail early if there's no build
await rm(root, { recursive: true, force: true });
await mkdir(target, { recursive: true });
// Older checkouts may retain ignored engine files or retired public assets.
const skip = ['models', 'mockups', 'engine', 'puzzles'];
await cp(source, target, {
  recursive: true,
  filter: (path) => {
    const rel = relative(source.pathname, path);
    return !path.endsWith('.DS_Store') && !skip.some((d) => rel === d || rel.startsWith(d + sep));
  },
});
console.log(`Staged ${source.pathname} → ${target.pathname}`);
