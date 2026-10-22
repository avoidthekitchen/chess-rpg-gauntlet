// Generates figurine and token art through OpenRouter's image models.
//
//   node scripts/generate-art.mjs                 # every sprite that has no raw image yet
//   node scripts/generate-art.mjs knight-ally     # just these (regenerates even if present)
//
// Needs OPENROUTER_API_KEY_WITH_BUDGET in the environment. Raw images land in
// art/raw/ (not committed); run scripts/process-art.mjs afterwards to cut them
// out into public/sprites/.
//
// Kinds of art:
//   <piece>-<faction>         detailed figurines, used as talking-head portraits
//   token-<piece>-<faction>   simplified board tokens that read at about 40 px, with the
//                             headgear and base painted in a cyan key; process-art.mjs
//                             recolors each into an ivory (White) and an ebony (Black) sprite
//   bg-<name>                 full-bleed painted backgrounds (no cutout); process-art.mjs
//                             writes them to public/backgrounds/<name>.webp
//
// Factions: ally (our animals in cream with gold trim) and bog (Bog Goblins, Region 1:
// bog species of their own in muddy rags). Each enemy faction gets its own species; only
// the chess headgear shapes are shared, so they teach the piece roles everywhere.
// See docs/design/art.md#pieces-and-factions before adding a faction.
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
  "Draw ONE chess-piece BUST, centered: just the creature's big HEAD wearing its chess headgear, sitting directly " +
  'on a short, wide, round base, like a real chess piece. No body, no arms, no legs, nothing sticking out. ' +
  'The token is about as wide as it is tall and fills most of the image. ' +
  'Very simple and bold: a thick dark outline around the whole silhouette, flat colors with one soft shade, ' +
  'no texture, no fine details. The chess headgear is large and obvious. ' +
  MAGENTA;

// The headgear and base are painted in a key color so process-art.mjs can recolor them to exact
// ivory and ebony. That keeps both chess colors identical across every faction, and stops the
// model from bleaching the animal too (asking for "ivory" directly turned the lion white).
const KEY =
  'COLOR KEY (very important): the chess HEADGEAR and the round BASE are both painted in pure bright CYAN (#00FFFF) ' +
  'with only one slightly darker cyan shade for form and the thick dark outline. Nothing else in the image is cyan, ' +
  'blue or teal: the face, fur, skin and clothing use warm or green colors only. The headgear and base have no gold, ' +
  'no gems, no moss, no other colors on them.';

// Reference images pull hard on species: without this, a fox drawn from a lion reference came out a lion.
const STYLE_ONLY =
  'Use the reference image ONLY for the drawing style, outline weight, size and base shape. Do NOT copy its species, ' +
  'face or headgear: draw the creature and headgear described here.';

/** The chess cue every faction shares. Keep these shapes identical across factions. */
const HEADGEAR = {
  pawn: 'a big round helmet, the round ball head of a chess pawn',
  knight: 'a large helmet shaped like the horse head of a chess knight',
  bishop: 'a tall pointed mitre hood with a diagonal slit cut into it, the shape of a chess bishop',
  rook: 'a short, wide castle tower with square crenellations on top, a chess rook',
  queen: 'a tall crown with many sharp points and NO cross on top, the coronet of a chess queen',
  king: 'a tall crown topped with a cross, the crown of a chess king',
};

/** Token species and outfit per faction. A new region adds one entry here. */
const FACTIONS = {
  ally: {
    look: 'Clothing on the shoulders: cream with a small warm gold trim.',
    species: {
      pawn: 'a mouse squire',
      knight: 'a frog',
      bishop: 'an owl',
      rook: "a tortoise: the tower grows out of its shell and its scaly, beaked tortoise head pokes out at the front",
      queen: 'a FOX (orange fur, pointed fox ears, narrow fox muzzle; not a lion, no mane)',
      king: 'a lion with a big mane',
    },
  },
  bog: {
    look:
      'A scruffy bog goblin animal: warty or mottled skin in swamp greens and mud browns, long pointed droopy ears, ' +
      'a crooked toothy grin, small yellow eyes, ragged mud-brown shoulder rags with a frayed rope tie and a little moss. ' +
      'The headgear is crude and scavenged. It must be clearly the species named, not a toad, rat or generic goblin ' +
      'unless that is the species.',
    species: {
      pawn: 'a BOG RAT goblin with a long rat snout and whiskers; the helmet is a dented cooking pot with a ROUNDED dome top, so it still reads as the round ball of a chess pawn',
      knight:
        'a bog SALAMANDER (an amphibian: wide flat head, smooth shiny swamp-green skin with bright orange spots, a frilly ' +
        'feathery gill crest on both sides of its head, big round eyes, a wide grin with tiny teeth; NO goblin ears, not ' +
        'humanoid); the helmet is pushed up so the salamander face is fully visible below it',
      bishop: 'a goblin CROW shaman with a scruffy black-green crow face and a long cracked beak',
      rook: 'a goblin SNAPPING TURTLE: the tower grows out of its shell and its hooked-beak head pokes out at the front; the whole tower is the same flat cyan key as the base, no stone color, no moss',
      queen: 'a goblin SWAMP VIPER witch: a coiled snake head with a sly grin and slit eyes',
      king: 'the Goblin Chief, a big fat warty TOAD with a wide toad mouth and heavy-lidded eyes',
    },
  },
};

const BACKGROUND =
  'A full-bleed painted SCENE that fills the entire image edge to edge: no border, no frame, no vignette card, ' +
  'no text, no letters, no labels, no logo, no user interface, no chess board, no chess pieces. ' +
  'Soft painterly storybook illustration with gentle ink linework, slightly muted so game UI drawn on top stays readable.';

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
};

// ---- missing ally portraits ----
// The token shows the headgear shape: use its ivory sprite, never the cyan-keyed source.
SPRITES['queen-ally'] = {
  prompt:
    'A clever fox sorceress chess queen figurine, matching the knight and king figurines in the reference images ' +
    '(same painted style, proportions, lighting and base). The fox wears a tall golden coronet with many sharp points, ' +
    'the crown of a classic chess queen (it makes the queen silhouette, like the coronet on the reference token), ' +
    'a flowing cream and teal gown with gold trim, and holds a slim wand with a small glowing teal gem. ' +
    'The round base is dark wood with a gold rim.',
  refs: ['public/sprites/token-queen-ally-w.webp', 'knight-ally', 'king-ally'],
};
SPRITES['pawn-ally'] = {
  prompt:
    'A small, brave mouse squire chess pawn figurine, matching the knight and king figurines in the reference images ' +
    '(same painted style, proportions, lighting and base). The mouse wears a big round polished steel helmet that ' +
    'makes its head look like the round ball top of a classic chess pawn (like the reference token), a cream tunic ' +
    'with a teal tabard and a tiny gold crest, and holds a short wooden spear and a small round shield. ' +
    'The round base is dark wood with a gold rim.',
  refs: ['public/sprites/token-pawn-ally-w.webp', 'knight-ally', 'king-ally'],
};

// ---- simplified board tokens (cyan-keyed; see KEY) ----
// Ally tokens use the existing keyed token as the reference, so a regenerated token keeps its design.
// Other factions use the ally pawn for style ONLY, so the new species isn't pulled toward ours.
for (const [faction, { look, species }] of Object.entries(FACTIONS)) {
  for (const piece of Object.keys(HEADGEAR)) {
    const ally = faction === 'ally';
    SPRITES[`token-${piece}-${faction}`] = {
      prompt:
        `A board token of ${species[piece]}, wearing ${HEADGEAR[piece]}. ${look} ` +
        (ally ? 'Keep the same face, simplified style, size and base shape as the reference token.' : STYLE_ONLY) +
        ` ${KEY}`,
      format: TOKEN,
      style: false,
      refs: [ally ? `art/tokens/token-${piece}-ally.png` : 'art/tokens/token-pawn-ally.png'],
    };
  }
}

// ---- Bog Goblin portraits (Region 1): the token's creature, posed like the matching ally figurine ----
const BOG_LOOK = {
  pawn:
    'a BOG RAT goblin (long rat snout, whiskers, pointed droopy ears) wearing a dented cooking pot with a rounded dome ' +
    'top as its helmet, like the round head of a chess pawn; holds a sharpened stick for a spear and a pot-lid shield',
  knight:
    'a bog SALAMANDER (smooth swamp-green skin with bright orange spots, frilly feathery gills on both sides of its head, ' +
    'a wide grin) in a dented helmet shaped like the horse head of a chess knight, pushed up so its face shows; holds a ' +
    'crooked reed spear',
  bishop:
    'a goblin CROW shaman (scruffy black-green feathers, long cracked beak) in a tall pointed mitre with a clear diagonal ' +
    'slit cut into its front (the chess bishop shape); holds a gnarled bog-root staff with a dull green glowing stone',
  rook:
    'a goblin SNAPPING TURTLE (hooked beak, mossy spiked shell) standing upright, its shell rising into a castle tower ' +
    'with square crenellations (the chess rook shape), a ragged swamp-green flag on the tower',
  queen:
    'a goblin SWAMP VIPER witch (a snake rising upright from its coils, sly grin, slit eyes) wearing a tall crown with ' +
    'many sharp spikes and no cross (the chess queen coronet); a crooked root wand with a dull green glowing stone',
  king:
    'Grubnak the Toad Chief (a big fat warty TOAD, wide mouth, heavy-lidded eyes) wearing a tall crown topped with a ' +
    'cross (the chess king crown); holds a gnarled driftwood scepter topped with a knot of roots',
};
for (const [piece, look] of Object.entries(BOG_LOOK)) {
  SPRITES[`${piece}-bog`] = {
    prompt:
      `A Bog Goblin chess figurine of ${look}. It is the same creature as the board token in the second reference ` +
      'image (same species, face and markings), drawn as a full detailed figurine in the pose, proportions, painted ' +
      'style and base of the figurine in the third reference image (copy only its pose and style, not its species). ' +
      'Goblin features: long pointed droopy ears, a crooked toothy grin, small yellow eyes. Muddy brown and swamp-green ' +
      'rags, a frayed rope belt, bone charms and a little moss. The headgear is crude scavenged dark iron and bone. ' +
      'No cyan or teal anywhere. The round base is dark wood with a mossy green rim.',
    refs: [`public/sprites/token-${piece}-bog-b.webp`, `public/sprites/${piece}-ally.webp`],
  };
}

// ---- painted backgrounds (not cut out) ----
SPRITES['bg-title'] = {
  aspect: '16:9',
  prompt:
    'A misty storybook fantasy kingdom vista at dusk: rolling hills and forests fading into soft mist, a castle ' +
    'with tall towers on a distant hill on one side, a winding road, warm last light on the horizon and a plum and ' +
    'olive twilight sky with a few early stars. The middle of the image is open sky and mist, calm and uncluttered, ' +
    'leaving room for a game title.',
};
SPRITES['bg-map-region1'] = {
  aspect: '4:3',
  prompt:
    'A painted top-down (high-angle, almost overhead) fantasy map of a murky bog region: dark pools of still water, ' +
    'clumps of reeds and cattails, mossy islands, crooked muddy paths and plank boardwalks winding between them, ' +
    'a few ruined thatched huts, and a small goblin camp with crude tents and a campfire in one corner. ' +
    'Low detail, soft and muted olive, mud-brown and murky green colors with low contrast, so map markers drawn on ' +
    'top stay readable. Interesting content spread across the whole image (it will be cropped). No labels, no compass, no border.',
};
SPRITES['bg-town'] = {
  aspect: '16:9',
  prompt:
    'A cozy storybook village square in warm evening light: timber-framed houses, a tavern with a hanging sign ' +
    '(no lettering) and glowing windows on one side, a tall stone academy tower with a small observatory dome on the ' +
    'other, and a wooden notice board covered in pinned blank papers near the edge. Lanterns, cobblestones, a well. ' +
    'No people. The center of the square is open, calm cobblestones, leaving room for UI on top.',
};
SPRITES['bg-battle-bog'] = {
  aspect: '16:9',
  prompt:
    'A dim swampy forest clearing seen from above at a steep angle: a flat, muddy, mossy open ground in the middle ' +
    'with reeds, roots, small dark pools, toadstools and twisted trees around the edges. Soft dark vignette toward ' +
    'the edges, muted and low contrast overall, so a game board placed in the middle stands out. ' +
    'The middle is plain, even ground with no objects.',
};

const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const dataUrl = (path) => `data:${MIME[extname(path)]};base64,${readFileSync(path).toString('base64')}`;
const refPath = (r) => (r.includes('/') ? r : join(RAW_DIR, `${r}.png`));

async function generate(name) {
  const spec = SPRITES[name];
  const useStyle = spec.style !== false;
  const refs = [...(useStyle ? [STYLE_REF] : []), ...(spec.refs ?? []).map(refPath)];
  for (const r of refs) if (!existsSync(r)) throw new Error(`${name}: missing reference ${r} (generate it first)`);

  const isBg = name.startsWith('bg-');
  const text = [spec.prompt, useStyle ? STYLE : '', spec.format ?? (isBg ? BACKGROUND : FIGURINE)].filter(Boolean).join('\n\n');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_WITH_BUDGET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      modalities: ['image', 'text'],
      image_config: isBg ? { aspect_ratio: spec.aspect ?? '16:9', image_size: '2K' } : { aspect_ratio: '1:1' },
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
