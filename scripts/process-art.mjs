// Cuts generated figurines out of their flat magenta background and writes
// game-ready sprites to public/sprites/.
//
//   node scripts/process-art.mjs
//
// The background is found by flood-filling from the image border, so magenta-ish
// colors inside a figure (plum cloaks, gems) are kept. Edge pixels get partial
// alpha and have the magenta tint removed, so outlines don't glow pink.
import { mkdirSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const RAW_DIR = join('art', 'raw');
const OUT_DIR = join('public', 'sprites');
// Portraits are shown large in the side panel; board tokens are shown at 40-80 px.
const sizeFor = (name) => (name.startsWith('token-') ? 256 : 384);
const KEY_DIST = 130; // how close to pure magenta counts as background
const SEED_DIST = 70; // pure enough to be background even when enclosed by the figure
const EDGE_BAND = 3; // pixels next to the background that get soft alpha + despill

/** How strongly a pixel leans magenta: both red and blue above green. */
const magenta = (r, g, b) => Math.max(0, Math.min(r, b) - g);

/** Cuts a raw magenta-background image out to a full-size RGBA sharp image, trimmed to the figure. */
export async function cutOut(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const isKey = (i) => {
    const [r, g, b] = px(i);
    return Math.hypot(255 - r, g, 255 - b) < KEY_DIST;
  };

  // 1. Flood-fill the background from every border pixel.
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  // Also seed from near-pure magenta anywhere, to catch pockets the border fill
  // can't reach (between legs, inside a lance's grip). Figure colors are never this close.
  for (let i = 0; i < w * h; i++) {
    const [r, g, b] = px(i);
    if (Math.hypot(255 - r, g, 255 - b) < SEED_DIST) stack.push(i);
  }
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !isKey(i)) continue;
    bg[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }

  // 2. Distance (in pixels, up to EDGE_BAND) from the background, for the soft edge.
  const dist = new Uint8Array(w * h).fill(255);
  let frontier = [];
  for (let i = 0; i < w * h; i++) if (bg[i]) (dist[i] = 0), frontier.push(i);
  for (let d = 1; d <= EDGE_BAND; d++) {
    const next = [];
    for (const i of frontier) {
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j >= 0 && j < w * h && dist[j] === 255) (dist[j] = d), next.push(j);
      }
    }
    frontier = next;
  }

  // 3. Clear the background; soften and despill the edge band.
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (bg[i]) {
      data[o + 3] = 0;
      continue;
    }
    if (dist[i] > EDGE_BAND) continue;
    const [r, g, b] = px(i);
    const m = magenta(r, g, b);
    // Pixels that are mostly magenta are mostly background.
    data[o + 3] = Math.round(255 * Math.min(1, Math.max(0, 1 - m / 200)));
    data[o] = r - m;
    data[o + 2] = b - m;
  }

  // Render to PNG first: trim() inside a chain that also resizes can measure the wrong image.
  const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
  return sharp(png);
}

async function processOne(file) {
  const name = basename(file, '.png');
  const out = join(OUT_DIR, `${name}.webp`);
  await (await cutOut(join(RAW_DIR, file)))
    .resize({ width: sizeFor(name), height: sizeFor(name), fit: 'inside', kernel: 'lanczos3' })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`${name}: ${meta.width}x${meta.height} → ${out}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const f of readdirSync(RAW_DIR).filter((f) => f.endsWith('.png'))) await processOne(f);
}
