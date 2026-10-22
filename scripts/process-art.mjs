// Cuts generated figurines out of their flat magenta background and writes
// game-ready sprites to public/sprites/.
//
//   node scripts/process-art.mjs                 # raw images that are new or newer than their output
//   node scripts/process-art.mjs --all           # reprocess everything
//   node scripts/process-art.mjs king-bog        # just these
//   node scripts/process-art.mjs --recolor       # only redo token ivory/ebony from art/tokens/
//
// Raw images named bg-<name>.png are painted backgrounds: they are not cut out, just
// resized to BG_LONG px on the long side and written to public/backgrounds/<name>.webp.
//
// Raw images named token-<piece>-<faction>.png are board tokens whose chess headgear and
// base are painted in a cyan key (#00FFFF). They are cut out to art/tokens/<name>.png
// (committed, so colors can be retuned without regenerating), then recolored twice:
// public/sprites/<name>-w.webp (ivory) and <name>-b.webp (ebony, with a light rim so it
// shows on dark squares). Chess color lives only in the headgear and base; the creature
// keeps its own colors, which show the faction.
//
// The background is found by flood-filling from the image border, so magenta-ish
// colors inside a figure (plum cloaks, gems) are kept. Edge pixels get partial
// alpha and have the magenta tint removed, so outlines don't glow pink.
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const RAW_DIR = join('art', 'raw');
const TOKEN_DIR = join('art', 'tokens');
const OUT_DIR = join('public', 'sprites');
const BG_DIR = join('public', 'backgrounds');
const BG_LONG = 1600;
const BG_MAX_BYTES = 250 * 1024;
// Portraits are shown large in the side panel; board tokens are shown at 40-80 px.
const sizeFor = (name) => (name.startsWith('token-') ? 256 : 384);
const KEY_DIST = 130; // how close to pure magenta counts as background
const SEED_DIST = 70; // pure enough to be background even when enclosed by the figure
const EDGE_BAND = 3; // pixels next to the background that get soft alpha + despill
const SPILL = 200; // magenta lean at which an edge pixel becomes fully transparent
// Sprites whose glowing gems picked up a wide pink halo from the magenta background:
// a wider, stronger despill band (safe here because these figures have no plum/pink colors).
const WIDE_DESPILL = { 'bishop-bog': { band: 18, spill: 110 }, 'queen-bog': { band: 18, spill: 110 } };

// Token chess colors: [shadow, light]; the key's shade picks a point between them.
const RAMP = {
  w: [[176, 160, 132], [250, 244, 228]], // ivory
  b: [[22, 19, 18], [92, 86, 82]], // ebony
};
const OUTLINE = [28, 22, 20]; // what the key fades into at its inked edge
const RIM = { w: null, b: [236, 228, 210] }; // light rim around ebony tokens
const RIM_PX = 7; // at the 256 px token size
const MIN_KEY = 0.04; // warn when less of the token than this is keyed (the model ignored the key)

/** How strongly a pixel leans magenta: both red and blue above green. */
const magenta = (r, g, b) => Math.max(0, Math.min(r, b) - g);

/** Cuts a raw magenta-background image out to a full-size RGBA sharp image, trimmed to the figure. */
export async function cutOut(path, { band = EDGE_BAND, spill = SPILL } = {}) {
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

  // 2. Distance (in pixels, up to `band`) from the background, for the soft edge.
  const dist = new Uint8Array(w * h).fill(255);
  let frontier = [];
  for (let i = 0; i < w * h; i++) if (bg[i]) (dist[i] = 0), frontier.push(i);
  for (let d = 1; d <= band; d++) {
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
    if (dist[i] > band) continue;
    const [r, g, b] = px(i);
    const m = magenta(r, g, b);
    // Pixels that are mostly magenta are mostly background.
    data[o + 3] = Math.round(255 * Math.min(1, Math.max(0, 1 - m / spill)));
    data[o] = r - m;
    data[o + 2] = b - m;
  }

  // Render to PNG first: trim() inside a chain that also resizes can measure the wrong image.
  const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
  return sharp(png);
}

const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/**
 * Repaints a keyed token's cyan headgear and base in one chess color and returns
 * the RGBA pixels, plus the share of opaque pixels that were keyed.
 */
export function recolorKey(data, w, h, color) {
  const out = Buffer.from(data);
  let keyed = 0;
  let opaque = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (out[o + 3] > 128) opaque++;
    const [r, g, b] = [out[o], out[o + 1], out[o + 2]];
    const cyan = Math.min(g, b) - r; // how strongly the pixel leans cyan
    if (cyan < 40 || Math.abs(g - b) > 70) continue;
    keyed++;
    const k = Math.min(1, (cyan - 40) / 120); // 0 at the inked edge, 1 inside the key
    const t = Math.min(1, Math.max(0, (Math.max(g, b) - 110) / 145)); // key shade -> ramp position
    [out[o], out[o + 1], out[o + 2]] = lerp(OUTLINE, lerp(...RAMP[color], t), k);
  }
  if (RIM[color]) {
    // Grow the solid silhouette by RIM_PX (soft 1 px edge) and lay the token on top of it.
    const rim = new Uint8Array(w * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (out[(y * w + x) * 4 + 3] < 128) continue;
        for (let dy = -RIM_PX - 1; dy <= RIM_PX + 1; dy++)
          for (let dx = -RIM_PX - 1; dx <= RIM_PX + 1; dx++) {
            const X = x + dx;
            const Y = y + dy;
            if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
            const a = Math.round(255 * Math.min(1, Math.max(0, RIM_PX + 1 - Math.hypot(dx, dy))));
            if (a > rim[Y * w + X]) rim[Y * w + X] = a;
          }
      }
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      const ta = out[o + 3] / 255;
      const ra = (rim[i] / 255) * (1 - ta);
      const a = ta + ra;
      if (!a) continue;
      for (let c = 0; c < 3; c++) out[o + c] = Math.round((out[o + c] * ta + RIM[color][c] * ra) / a);
      out[o + 3] = Math.round(a * 255);
    }
  }
  return { data: out, keyedShare: keyed / Math.max(1, opaque) };
}

/** Writes the ivory (-w) and ebony (-b) sprites for one keyed token in art/tokens/. */
async function recolorToken(name) {
  // Pad both colors by the rim width, so the ebony rim isn't clipped and both sprites match in size.
  const pad = RIM_PX + 1;
  const { data, info } = await sharp(join(TOKEN_DIR, `${name}.png`))
    .ensureAlpha()
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (const color of ['w', 'b']) {
    const { data: px, keyedShare } = recolorKey(data, info.width, info.height, color);
    if (color === 'w' && keyedShare < MIN_KEY)
      console.warn(`  ! ${name}: only ${(keyedShare * 100).toFixed(1)}% keyed; was the headgear/base painted cyan?`);
    const out = join(OUT_DIR, `${name}-${color}.webp`);
    await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(out);
    console.log(`${name}-${color}: ${info.width}x${info.height} → ${out}`);
  }
}

const isToken = (name) => name.startsWith('token-');
const outFor = (name) =>
  name.startsWith('bg-')
    ? join(BG_DIR, `${name.slice(3)}.webp`)
    : isToken(name)
      ? join(TOKEN_DIR, `${name}.png`)
      : join(OUT_DIR, `${name}.webp`);

/** Backgrounds: no cutout, just resize and compress (dropping quality until it fits BG_MAX_BYTES). */
async function processBackground(file) {
  const name = basename(file, '.png');
  const out = outFor(name);
  const resized = await sharp(join(RAW_DIR, file))
    .resize({ width: BG_LONG, height: BG_LONG, fit: 'inside', kernel: 'lanczos3' })
    .png()
    .toBuffer();
  let quality = 80;
  let buf;
  for (; quality >= 50; quality -= 5) {
    buf = await sharp(resized).webp({ quality, effort: 6 }).toBuffer();
    if (buf.length <= BG_MAX_BYTES) break;
  }
  await sharp(buf).toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`${name}: ${meta.width}x${meta.height} q${quality} ${Math.round(buf.length / 1024)} KB → ${out}`);
}

async function processOne(file) {
  const name = basename(file, '.png');
  if (name.startsWith('bg-')) return processBackground(file);
  const out = outFor(name);
  const img = (await cutOut(join(RAW_DIR, file), WIDE_DESPILL[name])).resize({
    width: sizeFor(name),
    height: sizeFor(name),
    fit: 'inside',
    kernel: 'lanczos3',
  });
  // Keyed tokens stay lossless PNG: lossy compression would smear the key.
  await (isToken(name) ? img.png({ compressionLevel: 9 }) : img.webp({ quality: 90, alphaQuality: 100, effort: 6 })).toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`${name}: ${meta.width}x${meta.height} → ${out}`);
  if (isToken(name)) await recolorToken(name);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(BG_DIR, { recursive: true });
  mkdirSync(TOKEN_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const asked = args.filter((a) => !a.startsWith('--'));
  if (args.includes('--recolor')) {
    // Recolor straight from the committed keyed cutouts; no raw images needed.
    const names = readdirSync(TOKEN_DIR)
      .filter((f) => f.endsWith('.png'))
      .map((f) => basename(f, '.png'))
      .filter((n) => !asked.length || asked.includes(n));
    for (const n of names) await recolorToken(n);
    process.exit(0);
  }
  mkdirSync(RAW_DIR, { recursive: true });
  const stale = (f) => {
    const out = outFor(basename(f, '.png'));
    return !existsSync(out) || statSync(out).mtimeMs < statSync(join(RAW_DIR, f)).mtimeMs;
  };
  const files = readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.png'))
    .filter((f) => (asked.length ? asked.includes(basename(f, '.png')) : all || stale(f)));
  if (!files.length) console.log('Nothing to process (outputs are up to date; use --all to force).');
  for (const f of files) await processOne(f);
}
