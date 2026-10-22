# Region 1 build progress

Following "First implementation: Region 1" in `docs/design.md`. One entry per build step.

## Step 1: Phaser game with the battle screen ported

**Done**
- Phaser 4.2.1 game (`src/main.ts`, `src/scenes/`). Canvas is sized in device pixels and every camera zooms by the pixel ratio, so scenes lay out in CSS pixels and text and tokens stay sharp on phones (`src/ui/screen.ts`). Screens rebuild from state on resize.
- Battle scene (`src/scenes/Battle.ts`) runs the prototype's `Battle` rules, Stockfish enemy, Threat Sight, rewind, tactic banners and promotion choice, unchanged in `src/game` and `src/ai`.
- Board (`src/ui/phaserBoard.ts`) is a port of the PixiJS board: tokens, knight hop with the dotted L, rook stomp, glide, capture freeze frame + white flash + shake + knock-out, dust and sparks, hanging-piece and check glows, drop-in intro, rewind shimmer. Same timings and easing.
- Talking-head portraits are drawn in Phaser (`src/ui/portrait.ts`): a card above the panel on desktop, a card floating at the bottom for 4 seconds on phones. `src/ui/speaker.ts` keeps the lines, now per faction (Bandit and Bog lines) and with named characters.
- Classic pieces toggle ("Pieces" button) swaps tokens for standard chess glyphs, remembered between sessions.
- Long text (lessons, results, promotion choice) uses an HTML overlay on top of the canvas (`src/ui/overlay.ts`), as the tech stack table says.
- Phone layout: board full width with ~45 px squares on a 390 px phone (the frame was slimmed slightly from the prototype to get there; 43.6 px on a 375 px phone).

**Simplified or skipped**
- The old PixiJS board, DOM board and prototype CSS were removed (`pixi.js` dependency dropped); they're in git history. The 3D mockups are untouched and still use `gsap` and `three`.
- Step 1 uses a plain battle list in place of the region map; the map comes in step 2.
- The classic toggle keeps the same tilted wooden board and only swaps the pieces.

**Worth a look**
- Phone squares: 43.6 px at 375 px wide, 45 px at 390 px. Desktop squares are capped at 80 px.
- Dev testing tip: `?loop=timeout` keeps the game loop running in a hidden browser tab (dev builds only).

## Step 2: Region 1 battles and shouting goblins

**Done**
- Title flow: "Do you know how the pieces move?" (No explains the tutorial isn't built yet and points to Lichess Learn), then Squire or Knight difficulty with its loss cost, then the starter choice: Sir Hob (frog knight), Sage Ollie (owl mage) or Old Brick (tortoise golem), each with two mouse squires. Saved to localStorage (`src/save.ts`, `src/game/campaign.ts`).
- Region map (`src/scenes/Map.ts`): five battles on a branching path from town. The first skirmish opens two paths, and the Goblin Chief's camp opens after any four wins. Each battle has a briefing with dialogue, goal, bonus goals and reward.
- Five lesson battles (`src/game/region1Battles.ts`): Trouble in the Reeds (threat awareness), Lanterns at Mossbridge (protection, a village siege), The Swap Meet (safe trades), Behind the Mud Wall (back-rank mate) and The Squire's Splash (promotion). Your hired pieces stand in the set lineup as named characters (`assignCharacters`); the rest are militia.
- Shouting goblins (`src/ai/shout.ts`): before your move the goblins announce the move they'd play if you passed (a null-move search), drawn as a green arrow with the shouting piece's portrait. If it's still legal after your move they must play it ("Told you I would!"); if you made it illegal you get a "Foiled!" banner. Shouts are cached per position, so a rewind hears the same one.
- Companion tip at the start of each battle, and the victory dialog shows bonus goals and after-battle dialogue.
- Bog Goblin art (an art subagent, about $3.80 of the OpenRouter budget): six board tokens and six portraits in the same style as the existing ones (lime war paint, mossy rims), fox queen and mouse squire ally portraits, and four painted backgrounds (title, map, town, battle).
- Engine verification (`npm run verify:battles`, about 80 s): plays 24 games per battle per difficulty with the exact shout rule. A competent Stockfish player wins 96-100% at Squire and Knight; a careless one wins 0-17%.
- A critic subagent reviewed the Phaser port. Fixed what it found: move animations were being skipped (the board was redrawn before the animation started), screen rebuilds didn't destroy old objects (old buttons stayed clickable), taps on HTML dialogs reached the canvas, state leaked between battles, and the screen shake crashed when re-triggered.

**Simplified or decided without the doc**
- All Bog Goblins shout, including the boss (coming in step 4). The doc gives it as the faction trait; I didn't exempt the chief.
- The boss opens after 4 of 5 wins, so one battle can be skipped (the doc says 4-6 battles from a branching map, without a number).
- Starter names (Sir Hob, Sage Ollie, Old Brick) and the Goblin Chief's name (Grubnak) are mine.

**Worth a look**
- The must-play rule makes goblins easy to trap: once you see the shout you can often punish it at once, so The Swap Meet and Behind the Mud Wall are usually won in 2 moves and Trouble in the Reeds in about 3 (the pillar says 5-10). That's the shout rule working as written. Softening it (e.g. goblins may abandon a shout that hangs a piece) would make battles longer, but it's a design change, so I left it.
- `winMaterial` is judged right after your capture, before any recapture (in `src/game/battle.ts`, which I kept unchanged). The battles are set up so no single bad grab wins, but judging the gain after the enemy's reply would be safer.
- The siege raider ignores its own king's safety, and raider shouts don't depend on difficulty.
