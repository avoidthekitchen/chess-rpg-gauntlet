// Copies the single-threaded "lite" Stockfish build from node_modules into
// public/engine so Vite serves it as a static file. It runs before dev and build.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const binDir = join('node_modules', 'stockfish', 'bin');
const outDir = join('public', 'engine');
mkdirSync(outDir, { recursive: true });

const files = readdirSync(binDir);
for (const ext of ['js', 'wasm']) {
  const name = files.find((f) => new RegExp(`^stockfish-[\\d.]+-lite-single\\.${ext}$`).test(f));
  if (!name) throw new Error(`No lite-single .${ext} engine found in ${binDir}`);
  // Both files must share a base name: the .js finds its .wasm by swapping the extension.
  copyFileSync(join(binDir, name), join(outDir, `stockfish-lite.${ext}`));
}
copyFileSync(join('node_modules', 'stockfish', 'Copying.txt'), join(outDir, 'COPYING-stockfish.txt'));
console.log('Copied Stockfish lite engine to public/engine');
