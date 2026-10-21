// Generates figurine art through OpenRouter's image models.
//
//   node scripts/generate-art.mjs                 # every sprite that has no raw image yet
//   node scripts/generate-art.mjs knight-ally     # just these (regenerates even if present)
//
// Needs OPENROUTER_API_KEY_WITH_BUDGET in the environment. Raw images land in
// art/raw/ (not committed); run scripts/process-art.mjs afterwards to cut them
// out into public/sprites/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const MODEL = 'google/gemini-3-pro-image';
const RAW_DIR = join('art', 'raw');
const STYLE_REF = join('art', 'reference', 'frog-mage-style.webp');

const STYLE =
  'Match the illustration style of the first reference image: hand-inked outlines, painted textured fills, ' +
  'muted olive, plum and leather-brown tones with small jewel-colored accents, storybook fantasy.';

const FORMAT =
  'Draw ONE game figurine only, centered, the whole figure visible with empty margin around it, ' +
  'front three-quarter view facing the viewer, standing on a round, thick chess-piece base. ' +
  'Chunky, compact proportions with a big head and a bold, simple silhouette, so it still reads when shown very small. ' +
  'Background: perfectly flat, solid magenta (#FF00FF) from edge to edge. No gradient, no floor, no cast shadow, ' +
  'no text, no frame, no other objects.';

/** Each sprite: a description, plus extra reference sprites (raw images) to keep designs consistent. */
const SPRITES = {
  'knight-ally': {
    prompt:
      'A heroic frog knight chess figurine. The frog wears a polished steel helmet shaped like the horse head ' +
      'of a classic chess knight (the helmet makes the knight silhouette), a teal tabard with a small gold crest, ' +
      'and holds a short lance upright. The round base is dark wood with a gold rim.',
  },
  'rook-ally': {
    prompt:
      'A sturdy tortoise rook chess figurine. The tortoise stands upright on its hind legs; its shell rises into ' +
      'a grey stone castle tower with square crenellations on top, so the whole figure has the silhouette of a ' +
      'classic chess rook. A teal banner with a gold crest hangs on the tower. The round base is dark wood with a gold rim.',
    refs: ['knight-ally'],
  },
  'knight-foe': {
    prompt:
      'A bandit version of the frog knight from the second reference image: same body and pose, same helmet ' +
      'shaped like the horse head of a classic chess knight but in dark battered iron, a black eye mask, ' +
      'a tattered crimson cloak, and a curved blade instead of the lance. The round base is dark wood with a crimson rim.',
    refs: ['knight-ally'],
  },
  'rook-foe': {
    prompt:
      'A bandit version of the tortoise rook from the second reference image: same body, pose and castle-tower ' +
      'shell with square crenellations, but the stone is dark and battered, with crimson rags instead of the ' +
      'teal banner and a black eye mask. The round base is dark wood with a crimson rim.',
    refs: ['rook-ally'],
  },
};

const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const dataUrl = (path) => `data:${MIME[extname(path)]};base64,${readFileSync(path).toString('base64')}`;

async function generate(name) {
  const spec = SPRITES[name];
  const refs = [STYLE_REF, ...(spec.refs ?? []).map((r) => join(RAW_DIR, `${r}.png`))];
  for (const r of refs) if (!existsSync(r)) throw new Error(`${name}: missing reference ${r} (generate it first)`);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_WITH_BUDGET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '1:1' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `${spec.prompt}\n\n${STYLE}\n\n${FORMAT}` },
            ...refs.map((r) => ({ type: 'image_url', image_url: { url: dataUrl(r) } })),
          ],
        },
      ],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${JSON.stringify(body.error ?? body).slice(0, 300)}`);
  const url = body.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error(`${name}: no image in response: ${JSON.stringify(body).slice(0, 300)}`);
  const out = join(RAW_DIR, `${name}.png`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  const cost = body.usage?.cost;
  console.log(`${name}: saved ${out}${cost !== undefined ? ` ($${Number(cost).toFixed(3)})` : ''}`);
}

if (!process.env.OPENROUTER_API_KEY_WITH_BUDGET) {
  console.error('Set OPENROUTER_API_KEY_WITH_BUDGET first.');
  process.exit(1);
}
mkdirSync(RAW_DIR, { recursive: true });

const asked = process.argv.slice(2);
for (const n of asked) if (!SPRITES[n]) throw new Error(`Unknown sprite "${n}". Known: ${Object.keys(SPRITES).join(', ')}`);
const names = asked.length ? asked : Object.keys(SPRITES).filter((n) => !existsSync(join(RAW_DIR, `${n}.png`)));

// In order, because later sprites use earlier ones as references.
for (const name of names) await generate(name);
