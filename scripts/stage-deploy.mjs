// Copies the Vite build into dist-worker/chess-rpg/ so Cloudflare serves it at
// unformedideas.com/chess-rpg/. Leaves out the 3D model comparison files, which
// aren't part of the game (see the design doc's "Housekeeping before launch").
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { relative, sep } from 'node:path';

const SUBPATH = 'alpha-chess-rpg';
const source = new URL('../dist/', import.meta.url);
const root = new URL('../dist-worker/', import.meta.url);
const target = new URL(`./${SUBPATH}/`, root);

await stat(new URL('index.html', source)); // fail early if there's no build
await rm(root, { recursive: true, force: true });
await mkdir(target, { recursive: true });
const skip = ['models', 'mockups'];
await cp(source, target, {
  recursive: true,
  filter: (path) => {
    const rel = relative(source.pathname, path);
    return !path.endsWith('.DS_Store') && !skip.some((d) => rel === d || rel.startsWith(d + sep));
  },
});
console.log(`Staged dist/ → dist-worker/${SUBPATH}/`);
