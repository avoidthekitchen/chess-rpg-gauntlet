// Generates figurine and token art through OpenRouter's image models.
//
//   node scripts/generate-art.mjs                 # every sprite that has no raw image yet
//   node scripts/generate-art.mjs knight-ally     # just these (regenerates even if present)
//
// Needs OPENROUTER_API_KEY_WITH_BUDGET in the environment. Raw images land in
// art/raw/ (not committed); run scripts/process-art.mjs afterwards to cut them
// out into public/sprites/.
//
// Two kinds of art:
//   <piece>-<side>         detailed figurines, used as talking-head portraits
//   token-<piece>-<side>   simplified board tokens that read at about 40 px
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const MODEL = 'google/gemini-3-pro-image';
const RAW_DIR = join('art', 'raw');
const STYLE_REF = join('art', 'reference', 'frog-mage-style.webp');

const STYLE =
  'Match the illustration style of the first reference image: hand-inked outlines, painted textured fills, ' +
  'muted olive, plum and leather-brown tones with small jewel-colored accents, storybook fantasy.';

const MAGENTA =
  'Background: perfectly flat, solid magenta (#FF00FF) from edge to edge. No gradient, no floor, no cast shadow, ' +
  'no text, no frame, no other objects.';

const FIGURINE =
  'Draw ONE game figurine only, centered, the whole figure visible with empty margin around it, ' +
  'front three-quarter view facing the viewer, standing on a round, thick chess-piece base. ' +
  'Chunky, compact proportions with a big head and a bold, simple silhouette, so it still reads when shown very small. ' +
  MAGENTA;

const TOKEN =
  'This is a BOARD TOKEN for a chess game, drawn to be read at tiny sizes (about 40 pixels on a phone). ' +
  'Draw ONE chess-piece BUST, centered: just the animal\'s big HEAD wearing its chess headgear, sitting directly ' +
  'on a short, wide, round base, like a real chess piece. No body, no arms, no legs, nothing sticking out. ' +
  'The token is about as wide as it is tall and fills most of the image. ' +
  'Very simple and bold: a thick dark outline around the whole silhouette, flat colors with one soft shade, ' +
  'no texture, no fine details. The chess headgear is large and obvious. ' +
  'Keep the warm storybook palette: olive, cream, leather brown, with gold or crimson accents. ' +
  MAGENTA;

const ALLY = 'Ally colors: cream and teal clothing, a gold rim on the base.';
const FOE = 'Bandit colors: charcoal and crimson clothing, a crimson rim on the base, and a black eye mask tied across the eyes that must be clearly visible.';

/** How each animal shows its chess piece. */
const PIECES = {
  pawn: "a mouse squire's head in a big round steel helmet, the round head of a chess pawn",
  knight: "a frog's head under a large steel helmet shaped like the horse head of a chess knight",
  bishop: "an owl's head in a tall pointed mitre hood with a diagonal slit cut into it, the shape of a chess bishop",
  rook: "a short, wide stone castle tower with square crenellations on top (a chess rook) that grows out of a tortoise's domed, plated shell; the TORTOISE's head (a reptile with a scaly, beaked face and small eyes, NOT a frog) pokes out of the front at the bottom",
  queen: "a fox's head wearing a tall crown with many sharp points, the coronet of a chess queen",
  king: "a lion's head with a big mane wearing a tall crown topped with a cross, the crown of a chess king",
};

/**
 * Each sprite: a prompt, a format (figurine or token), whether to show the style
 * reference, and reference images (raw sprite names, or paths) to keep designs consistent.
 */
const SPRITES = {
  // ---- detailed figurines (portraits) ----
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
  // The chosen lion and owl concepts, moved onto magenta so they can be cut out.
  'king-ally': {
    prompt:
      'Reproduce the figurine in this image exactly as it is (same lion, pose, crown, robe, scepter and base, ' +
      'same colors and line work). Change ONLY the background.',
    format: MAGENTA,
    style: false,
    refs: ['art/candidates/king-lion.png'],
  },
  'bishop-ally': {
    prompt:
      'Reproduce the figurine in this image exactly as it is (same owl, pose, mitre, robe, staff and base, ' +
      'same colors and line work). Change ONLY the background.',
    format: MAGENTA,
    style: false,
    refs: ['art/candidates/bishop-owl.png'],
  },
  'king-foe': {
    prompt:
      'A bandit version of the lion king from the second reference image: same body, pose and tall crown topped ' +
      'with a cross, but the crown is dark battered iron, he wears a black eye mask and a tattered charcoal and ' +
      'crimson robe, and the round base has a crimson rim.',
    refs: ['king-ally'],
  },
  'bishop-foe': {
    prompt:
      'A bandit version of the owl mage from the second reference image: same body, pose, staff and tall slit ' +
      'mitre, but the mitre and robe are charcoal and crimson and tattered, with a black eye mask, ' +
      'and the round base has a crimson rim.',
    refs: ['bishop-ally'],
  },
};

// ---- simplified board tokens ----
// The ally knight token is generated first and anchors the token style for the rest.
const IDENTITY = { knight: 'knight-ally', rook: 'rook-ally', king: 'king-ally', bishop: 'bishop-ally' };
for (const [piece, look] of Object.entries(PIECES)) {
  const refs = [];
  if (piece !== 'knight') refs.push('token-knight-ally');
  if (IDENTITY[piece]) refs.push(IDENTITY[piece]);
  SPRITES[`token-${piece}-ally`] = {
    prompt:
      `A board token of ${look}. ${ALLY}` +
      (piece !== 'knight' ? ' Draw it in exactly the same simplified token style, size and base as the first reference token, but as the animal described here, not a frog.' : '') +
      (IDENTITY[piece] ? ' Use the detailed figurine reference only for the face, colors and headgear; draw the bust, not its body.' : ''),
    format: TOKEN,
    style: false,
    refs,
  };
}
for (const piece of Object.keys(PIECES)) {
  SPRITES[`token-${piece}-foe`] = {
    prompt:
      `A bandit version of the board token in the reference image: the same animal, pose, size, base and ` +
      `chess-piece headgear shape, drawn in the same simplified token style. ${FOE}`,
    format: TOKEN,
    style: false,
    refs: [`token-${piece}-ally`],
  };
}

const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const dataUrl = (path) => `data:${MIME[extname(path)]};base64,${readFileSync(path).toString('base64')}`;
const refPath = (r) => (r.includes('/') ? r : join(RAW_DIR, `${r}.png`));

async function generate(name) {
  const spec = SPRITES[name];
  const useStyle = spec.style !== false;
  const refs = [...(useStyle ? [STYLE_REF] : []), ...(spec.refs ?? []).map(refPath)];
  for (const r of refs) if (!existsSync(r)) throw new Error(`${name}: missing reference ${r} (generate it first)`);

  const text = [spec.prompt, useStyle ? STYLE : '', spec.format ?? FIGURINE].filter(Boolean).join('\n\n');
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
          content: [{ type: 'text', text }, ...refs.map((r) => ({ type: 'image_url', image_url: { url: dataUrl(r) } }))],
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
