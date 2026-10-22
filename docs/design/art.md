# Art direction and 3D exploration

[Design overview](../design.md) · [Story and characters](story.md) · [Technical design](technical.md)

## Art direction

The game is 2D. Storybook fantasy in an animal world, at least as polished as Into the Breach, with XCOM-style dramatic moments. The style reference is inked outlines, painted textures, and muted olive, plum and leather tones with jewel-colored accents. A 3D version was explored and deferred (see [3D exploration](#3d-exploration-deferred)).

**Board tokens and portraits.** A phone board square is about 45 px, and the detailed figurines are hard to read at that size. So the board uses a simplified token for each piece that still shows the animal and its chess role at a glance, such as a lion's face under a cross-topped crown or an owl in a slit mitre. Each token is a bust of the animal wearing its chess headgear on a round base, like a real chess piece, and stays about one square tall so it doesn't hide the piece behind it. The detailed figurines become talking-head portraits beside the board when a piece moves or captures: tall portrait cards in the side panel on desktop, and a card floating at the bottom of the screen on phones.

**Prototype status.** The prototype's board already uses tokens for all six pieces in ally and bandit colors (`public/sprites/token-*.webp`), and talking-head portraits for the frog knight, tortoise rook, owl mage and lion king in both colors. The fox queen and mouse squire don't have detailed figurines yet, so their token stands in as the portrait. Portrait lines live in `src/ui/speaker.ts`.

| Piece | Species | Chess cue on the token and figurine |
| --- | --- | --- |
| Pawn | Mouse squire | Round helmet |
| Knight | Frog | Horse-head helm |
| Bishop | Owl mage | Tall mitre with a slit |
| Rook | Tortoise | Castle-tower shell |
| Queen | Fox sorceress | Pointed coronet |
| King | Lion | Crown with a cross |

- **Classic pieces toggle.** Players can switch to standard chess pieces, so what they learn carries over to real chess.
- **Motion teaches movement.** The frog knight hops in an arc, the tortoise stomps in a straight line, the owl glides diagonally.
- **XCOM-style moments in 2D.** A capture gets a short illustrated close-up, a brief freeze and screen shake.
- **Asset pipeline.** AI image generation (Gemini 3 Pro Image through OpenRouter, about $0.14 an image) on a flat magenta background, cut out to WebP by `scripts/process-art.mjs`. Bandit versions are generated from the ally image, so designs match. Animation uses tweens (hops, squash and stretch, particles) rather than frame-by-frame drawing.

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

**Housekeeping before launch:** the mockups aren't part of the game, but `public/models/` (about 4.4 MB) is copied into every build. Move it out of `public/` or exclude it before shipping.
