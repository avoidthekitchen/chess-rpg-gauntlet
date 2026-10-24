# Art direction and 3D exploration

[Design overview](../design.md) · [Story and characters](story.md) · [Technical design](technical.md)

## Art direction

The game is 2D. Storybook fantasy in an animal world, at least as polished as Into the Breach, with XCOM-style dramatic moments. The style reference is inked outlines, painted textures, and muted olive, plum and leather tones with jewel-colored accents. A 3D version was explored and deferred (see [3D exploration](#3d-exploration-deferred)).

**Board tokens and portraits.** A phone board square is about 45 px, and the detailed figurines are hard to read at that size. So the board uses a simplified token for each piece that still shows the animal and its chess role at a glance, such as a lion's face under a cross-topped crown or an owl in a slit mitre. Each token is a bust of the animal wearing its chess headgear on a round base, like a real chess piece, and stays about one square tall so it doesn't hide the piece behind it. The detailed figurines become talking-head portraits beside the board when a piece moves or captures: tall portrait cards in the side panel on desktop, and a card floating at the bottom of the screen on phones.

**Status.** The board uses tokens for all six pieces of the ally and Bog Goblin factions, each in White and Black (`public/sprites/token-<piece>-<faction>-<w|b>.webp`). Both factions have talking-head portraits for all six pieces (`public/sprites/<piece>-<faction>.webp`). Portrait lines and enemy names live in `src/ui/speaker.ts`. See [Pieces and factions](#pieces-and-factions) for how colors and factions are shown, and how to add a faction.

- **Classic pieces toggle.** Players can switch to standard chess pieces, so what they learn carries over to real chess.
- **Motion teaches movement.** The frog knight hops in an arc, the tortoise stomps in a straight line, the owl glides diagonally.
- **XCOM-style moments in 2D.** A capture gets a short illustrated close-up, a brief freeze and screen shake.
- **Asset pipeline.** AI image generation (Gemini 3 Pro Image through OpenRouter, about $0.14 an image) on a flat magenta background, cut out to WebP by `scripts/process-art.mjs`. Tokens get their chess color in code (see [Token pipeline](#token-pipeline)). Animation uses tweens (hops, squash and stretch, particles) rather than frame-by-frame drawing.

## Pieces and factions

Two questions must be answerable at a glance on a 45 px phone square: **which chess color is this piece**, and **whose side is it on**. Each question has its own channel, and they never mix.

- **Chess color lives in the headgear and the base.** White pieces have ivory headgear and an ivory base. Black pieces have ebony headgear and an ebony base with a light rim, so they don't vanish on dark squares. The ivory and ebony are exact colors applied in code, identical for every faction.
- **The faction lives in the creature.** Our army is the animals below, in cream with a little gold. Each enemy faction is **its own set of species** in its own outfit, never a recolor of ours. Different species give each region its own flavor and make "mine vs. theirs" obvious.
- **Every faction shares the headgear shapes.** Round helmet, horse-head helm, slit mitre, castle tower, spiked coronet, cross-topped crown. These teach the chess role, so a Bog Rat in a pot helmet still reads as a pawn. Keep each shape identical across factions, even when it's made of scavenged junk.
- **Your side is always at the bottom.** When you play Black (some puzzles), the board flips. Pieces always stand upright; nothing is drawn upside down.

**Our army (ally)**

| Piece | Species | Headgear |
| --- | --- | --- |
| Pawn | Mouse | Round helmet |
| Knight | Frog | Horse-head helm |
| Bishop | Owl | Tall mitre with a slit |
| Rook | Tortoise | Castle tower grown from its shell |
| Queen | Fox | Spiked coronet, no cross |
| King | Lion | Crown with a cross |

**Bog Goblins (Region 1).** Scruffy, warty bog creatures with long droopy goblin ears, yellow eyes and crooked grins, in muddy rags with rope ties and moss. Their headgear is crude and scavenged (a cooking-pot helmet) but keeps the shared shape.

| Piece | Species | Name in the game |
| --- | --- | --- |
| Pawn | Bog rat | Bog Rat Pawn |
| Knight | Salamander with frilly gills | Bog Salamander Knight |
| Bishop | Crow shaman | Bog Crow Bishop |
| Rook | Snapping turtle | Snapping Turtle Rook |
| Queen | Swamp viper witch | Swamp Viper Queen |
| King | Toad (Grubnak) | Toad King |

**Bandit Riders (Region 2, not generated yet).** Masked highway thieves in dark cloaks and roadside gear. The raccoon's mask is its own; the others wear cloth masks.

| Piece | Species | Name in the game |
| --- | --- | --- |
| Pawn | Raccoon | Raccoon Pawn |
| Knight | Hare | Hare Knight |
| Bishop | Magpie | Magpie Bishop |
| Rook | Badger | Badger Rook |
| Queen | Stoat | Stoat Queen |
| King | Wolf (Ashfang) | Wolf King |

Later factions sketched in the [campaign](campaign.md#regions-and-factions), such as the Bone Wardens' skeleton animals, follow the same rules: their own creatures, the shared headgear, and ivory and ebony from the pipeline.

### Token pipeline

1. `scripts/generate-art.mjs` asks the model for each token with the headgear and base painted **pure cyan (#00FFFF)** as a color key, and nothing else in the image cyan, blue or teal.
2. `scripts/process-art.mjs` cuts the token out of its magenta background and saves the keyed cutout to `art/tokens/token-<piece>-<faction>.png`. These cutouts are committed, because `art/raw/` isn't.
3. It then recolors the cyan, keeping its shading, into an ivory `-w` sprite and an ebony `-b` sprite, and draws the light rim on the ebony one. `node scripts/process-art.mjs --recolor` reruns just this step from the cutouts, so the ivory and ebony (`RAMP` in the script) can be retuned without paying for new images.
4. The game loads `token-<piece>-<faction>-<w|b>` (`tokenKey` in `src/ui/phaserBoard.ts`). Your pieces use `ally`, the enemy uses the battle's faction, and the chess color picks the suffix.

Portraits (detailed figurines) don't carry chess color: the card's gold or red frame says whose side is talking. Each portrait is generated from the faction's ebony token, for the creature, plus the matching ally figurine, for pose and painted style.

**Lessons from making the Bog set**

- **Don't ask the model for ivory or ebony directly.** Asked for an ivory crown, it also bleached the lion's mane white. The cyan key leaves the animal's colors alone and makes both chess colors exact.
- **Reference images pull hard on species.** With the lion king as a reference, the "fox queen" came out a lion, and goblin pieces drawn from the toad drifted into toads. Give a new species only the ally pawn token as a reference, labelled "style only" (`STYLE_ONLY` in the script), and describe the species in detail.
- **Keep the pawn's top round.** A flat-topped pot stopped reading as a pawn; a rounded dome fixed it.
- **Check that the key landed, and only there.** `process-art.mjs` warns when under 4% of a token is keyed; a mossy stone tower once came back unkeyed. Teal in a creature would also be repainted, which no pixel count reliably catches, so every recolor writes `art/raw/check/<token>.png`: the recolored pixels in magenta, then ivory and ebony on both square colors. Magenta anywhere but the headgear and base means the prompt needs to keep cyan, blue and teal off the creature.
- **Budget.** About $0.14 per image. A faction is 6 tokens and 6 portraits, about $1.70, plus a few retries. Trying two species concepts on a mock board before committing cost about $3, and was worth it.

### Adding a faction

1. **Pick species.** Choose one per piece, fitting the region's theme and not reused from our army or another faction. Check that each body works with its headgear (a shell for the tower, a head that can wear a crown).
2. **Describe them.** Add the faction to `FACTIONS` in `scripts/generate-art.mjs` (species and outfit), plus a look block for its portraits like `BOG_LOOK`.
3. **Generate and check the tokens.** Run `node scripts/generate-art.mjs token-pawn-<faction> …`, then `node scripts/process-art.mjs`. Look at each token's check sheet in `art/raw/check/`, then at every token in both colors at 45 px and in grayscale. Regenerate any that lost the species, the headgear shape or the key.
4. **Generate the portraits** once the tokens are final. Check them in the game's portrait card; framing is per piece type, in `FRAMING` in `src/ui/speaker.ts`.
5. **Wire it into the game.** In `src/ui/speaker.ts`, add the faction to `FACTIONS` (the `Faction` type and the sprites `Boot.ts` loads follow from it), then fill in its `FACTION_SPECIES` (each name is the species plus the chess piece, such as "Bog Rat Pawn") and enemy lines; the compiler points at any it's missing. Check scenario text (intros, dialogue) for the species names too.
6. **Document it.** Add a species table here and update the faction's row in the [campaign table](campaign.md#regions-and-factions).

## 3D exploration (deferred)

Decided: the game stays 2D. The prototype's 2D board, tokens and talking-head portraits already look good, and 2D keeps art cheap and iteration fast. The 3D work below is kept in the repo for reference, in case a 3D version is wanted later.

**What was tried**

| Experiment | Where | Finding |
| --- | --- | --- |
| Three.js board mockup | `mockups/three.html`, `src/mockups/threeMockup.ts` | 3D makes captures more dramatic: a kill-cam swoop, slow motion, a flash and shockwave, and the captured piece knocked off the board. Its Style button cycles through every option below. |
| Procedural 3D toys | Same mockup, "3D toys" style | About one square tall, so they read on the board, but built from simple shapes, so they look like placeholder art. |
| Painted cutouts in 3D | Same mockup, "Painted cutouts" style | The 2D art gets real lighting and shadows, but turns paper-thin when it flips or tumbles. |
| AI-generated 3D models | `mockups/models.html`, `public/models/`, `scripts/generate-3d.mjs`, `scripts/optimize-3d.mjs` | Frog knight and tortoise rook from three fal.ai image-to-3D services, compared with the original art. |

**AI 3D model comparison**

| Service | Result | Speed |
| --- | --- | --- |
| Rodin (Hyper3D) | Best overall, slight edge: most faithful to the art, clean and bright | About 70 s |
| Hunyuan3D v3 | Close second: crisp and clean | About 2.5 min |
| TRELLIS 2 | Fastest and cheapest, but darker and muddier textures | About 25 s |

- All three turned the tortoise to face forward with the tower on its back, because the 2D art shows it from the side. A front-facing source image would give more control.
- Output is GLB (textured mesh). After `optimize-3d.mjs` (at most 30,000 triangles, 1K WebP textures, meshopt compression) each model is 0.7 to 0.8 MB.
- Gaussian splats (.ply, .spz) aren't suited to game pieces: lighting is baked in, they cast no proper shadows, they're hard to break apart, and sorting them is heavy on phones.
- Each model is one mesh, so a captured piece tumbles away whole rather than breaking into parts.
- At board size on a phone, detailed 3D models have the same legibility problem the 2D tokens solved.
- The six test models cost roughly $2 to $3.50 on fal.ai.

**If 3D is revisited:** use Rodin (Hunyuan3D as backup), generate from front-facing art, and keep simplified pieces on the board with the detailed models for close-ups and portraits. Bandit versions need their own models; the mockup only tints the ally models. The Three.js board would sit on its own canvas layered with Phaser's (see [Tech stack](technical.md#tech-stack-and-deployment)).

**Deployment exclusion:** the mockups are not part of the game. `scripts/stage-deploy.mjs` excludes `models` and `mockups` from deployed assets.
Local Vite builds may still contain `public/models/`; that does not mean the deployment ships them.

## Chapter landscapes, October 2026

The built-in image-generation tool created `public/backgrounds/map-region3.webp` for the Cult chapter.
Prompt: a full-bleed elevated storybook valley, ink contours and muted watercolour, purple woods, crystals, cottages, bridges, and a sealed library.
No text, interface, chessboards, photorealism, or 3D. Open central ground leaves room for route labels.
The source PNG remains local under Codex generated images; the compressed WebP is the shipped asset.

`map-region4.webp` uses the same built-in tool and ink/watercolour direction: an elevated fortress valley, red-and-gold banners, bridges, orchards, and open courtyards.
No text or interface was generated. Compressed WebP is shipped; source PNG stays local.

`map-region5.webp` continues the ink-and-watercolour direction: a moonlit keep, rocky paths, rivers, animal statues and skeleton sentries.
The painted scene contains no text or interface. Existing piece portraits retain honest Bone Wardens identity text until dedicated skeleton portraits are available.

`map-finale.webp` depicts a quiet ruined keep in violet shadow, warm light at its gate, winding bridges and open central ground.
The same built-in image model generated the ink-and-watercolour landscape without interface text. It also backs the final story and credits.
