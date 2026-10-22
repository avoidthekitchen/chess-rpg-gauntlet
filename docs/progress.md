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

## Step 3: Town, gold and saving

**Done**
- Town (`src/scenes/Town.ts`) with three tabs:
  - **Tavern:** hire any piece at its chess value (squire 10g, knight/mage 30g, tower 50g, sorceress 90g), capped at a real chess set. New hires get names. Shows your army, its points, and the boss budget.
  - **Academy:** the "Rook and queen checkmates" lesson, two practice battles (queen mate, rook mate) against a lone king that defends at full Stockfish strength, with unlimited undo and 10g for the first clear of each.
  - **Bounty board:** 4 real Lichess puzzles (300 in the pool: 150 mate-in-one, 150 hanging-piece, ratings 400–1899), spread across ratings so pay differs (about 2–30g, more for harder ones). One try each, and the board refreshes after every battle, won or lost. Puzzles where you play Black flip the board.
- Puzzle pipeline (`npm run puzzles`, `scripts/build-puzzles.mjs`): downloads the Lichess CSV to `data/raw/` (gitignored), streams and filters it with Node's built-in zstd, validates every puzzle with chess.js and writes two small JSON files (~56 KB total) to `public/puzzles/region1/`.
- Gold (`src/game/economy.ts`): a battle's reward, each bonus goal and confirmed-tactic gold are each paid once, so replays can earn what's left but can't be ground. Losing a battle costs nothing on Squire and a tenth of your gold on Knight, charged when you accept the defeat (retry or retreat); a rewind costs nothing.
- Engine-checked banners: a fork banner only shows when Stockfish agrees the fork wins material (eval after the move at least 0.8 pawns better than the material count before it, `src/game/tacticCheck.ts`). Confirmed forks pay 5g (capped at 10g per battle). Enemy fork banners are checked the same way. Checkmate needs no engine check.
- Saving: everything goes to localStorage after every change; older saves are upgraded with new fields.
- Tests added for prices, caps, hiring, one-time pay, loss costs, bounty refresh and settlement, the bounty rating spread, and the fork check.

**Simplified or decided without the doc**
- Starting gold is 20g. A win pays 15–25g plus 5g per bonus goal (first time only); exact numbers are an open question in the doc.
- Without the adaptive rating (out of scope), bounties are picked around a fixed rating per difficulty: 900 Squire, 1200 Knight.
- A failed bounty pays nothing and leaves the board until the next refresh.
- The fork margin is 0.8 pawns, not more: on the prototype's knight fork Stockfish only rates the gain at about a pawn, because the knight gets trapped after winning the rook.

**Worth a look**
- Fixed in this step: going back to the map from a battle left the battle scene running underneath (`goTo()` in `src/ui/screen.ts` now switches screens cleanly).
- The hanging-piece bounty text says "Something is left unguarded. Win it." Some of those puzzles are also mates, which still fits but may surprise.

## Step 4: Boss and hero reward

**Done**
- The Goblin Chief's camp opens on the map after four wins. Its briefing leads to a muster screen (`src/scenes/Muster.ts`) where you pick your army from the pieces you own, up to Grubnak's 10-point budget with no queen (`src/game/boss.ts`: standard values, per-type caps, a "best fit" suggestion that puts your companion first). Big armies switch to two compact columns so 15 pieces still fit a phone.
- The duel (`src/game/region1Boss.ts`): your picks on their usual home squares against Grubnak behind a full wall of eight goblin squires and one frog knight (11 points). Objective: checkmate, no move limit. 50g reward, plus bonus goals for no rewinds and winning within 30 moves. The goblins still shout.
- Hero recruit: winning the duel frees Saffron the Fox Sorceress, who joins your army as a named hero with her own portrait and lines. After the boss, the map says the Bog is safe and region 2 comes in a later build.
- Engine check (`scripts/verify/boss.verify.test.ts`): a strong Stockfish player wins 100% with each starter's typical 10-point army at Squire and Knight, and with no hires at all (5 points). Careless and greedy simulated players win 0-17%.

**Simplified or decided without the doc**
- Grubnak's army (eight squires and a frog knight) and the 50g reward are my picks.
- The hero is a fox sorceress. She can't fight Grubnak (no queens), so she matters from region 2 on.
- The goblins shout in the boss duel too. I tried turning it off: a strong player still won in 4-11 moves, so the shouts aren't what makes the duel short.

**Worth a look**
- The duel's length depends a lot on the player. A strong player mates the Squire or Knight AI in 4-21 moves, and weak simulated play almost always loses. Real players are in between, so watch in playtests whether it feels like a full game (the doc's intent) or is too hard for players who lose to tactics.
- Replaying the duel after a win pays only what's left (bonus goals not yet earned). The hero joins only once.
