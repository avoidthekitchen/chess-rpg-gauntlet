# Decisions and open questions

[Design overview](../design.md) · [Game systems](systems.md) · [Campaign and curriculum](campaign.md)

## Open TODOs

The one place to track unfinished design work. When one is resolved, move the answer to the document it belongs in and tick it off here.

**Design**

- [x] **Main story arc:** approved in [Story](story.md#main-story-arc), with its open questions answered.
- [ ] **Recurring characters:** name the Region 2–5 bosses and heroes as each Region is designed ([Story](story.md#recurring-characters)). The Lich King's voice is approved.
- [x] **Region 1 detailed design:** written up as built in [Region 1](regions/region-01-bog-goblins.md), the worked example for the [Region template](regions/region-template.md).
- [ ] **Regions 2–5 and the Lich King:** detailed designs, each as its own file under `regions/` copied from the [Region template](regions/region-template.md), linked from the faction and curriculum summary tables in [Campaign](campaign.md#regions-and-factions). Keep the summary rows in the campaign overview.
- [x] **Faction AI habits:** approved in [AI habits by faction](systems.md#ai-habits-by-faction). Each Region settles its habit's finer details.
- [x] **Help ladder by Region:** approved in [Powers and rewind](systems.md#powers-and-rewind). The Orb's price and charges are set with Region 2.
- [ ] **Region 1 academy:** one short lesson per battle theme (threat awareness, protection, safe trades, back-rank mate, promotion), linked from each battle's briefing, with the in-battle lesson panel cut to a one-line reminder. Today it has only rook and queen mates ([Region 1](regions/region-01-bog-goblins.md#academy)).
- [ ] **Shout rule:** decide after playtests whether goblins may abandon a shout that simply hangs a piece. The must-play rule makes traps easy, which shortens battles.
- [ ] **XP, levels and titles:** designed ([Story](story.md#recurring-characters)) but not built. Decide their scope before Region 2.
- [ ] **Region 1 playtest:** run the test in [Region 1](regions/region-01-bog-goblins.md#playtest) and record the results there.
- [ ] **Region 2 numbers:** battle count and wins that open the boss, battle rewards, academy pay and bounty ratings. Only the 16-point boss budget exists so far ([tuning values](systems.md#tuning-values)).

**Code**

- [ ] **Region registry:** much of the game assumes Region 1. Before building Region 2, add a registry of Regions and a current-region field in the save, so Region 2 isn't a copy of half the game. What assumes Region 1 today:
    - the map, the boss and the hero (`src/game/region1*.ts`, `src/scenes/Map.ts`, `src/scenes/Muster.ts`, `src/flow.ts`);
    - the puzzle files (`src/puzzles.ts`, and the config in `scripts/build-puzzles.mjs`);
    - goblin wording in battle ("Told you I would!", "The goblins shout their plan" and "Foiled! The goblins couldn't…" in `src/scenes/Battle.ts`; the shout lines in `src/ai/shout.ts`; "One less goblin." in `src/ui/speaker.ts`). Enemy piece names already come per faction from `FACTION_SPECIES` (with the art pipeline in PR #6).
- [ ] **Tests and verification for every Region:** the battle content tests and `npm run verify:battles` only cover Region 1. Run them over every registered Region ([playbook](../playbook.md#battle-content-rules)). Each new faction habit also needs a simulated player that understands it.
- [ ] **Region 1 boss results:** the no-shout boss's AI values are in the [tuning values](systems.md#tuning-values); on the next `npm run verify:battles`, record the boss rows in [Region 1](regions/region-01-bog-goblins.md#verification). The boss check is the slow part of that run (384 full games).
- [ ] **Tortoise name:** rename "Tortoise Tower" to "Tortoise Golem" in `SPECIES` (`src/ui/speaker.ts`), per [Names and terms](glossary.md).

## Open questions

- [ ] Knight difficulty loses a tenth of your gold on a lost battle: first guess, tune in playtests.
- [ ] Boss budgets of about 10, 16, 22, 28, 34 and 39 points: tune in playtests.
- [ ] Exact gold numbers for battle rewards and bounty pay: tune in playtests.

## Decision log

| Date | Decision |
| --- | --- |
| 2026-10-22 | Story arc: the Lich King is a former Lion King of Pawnshire who refused checkmate; chess rules are the one law magic can't break |
| 2026-10-22 | The Lich King's origin comes one hint per Region, confirmed in Region 3; his interludes are one or two lines per Region |
| 2026-10-22 | Defeated leaders may return lightly: Grubnak as comic relief, the Iron Legion's general as an ally |
| 2026-10-22 | Pawnshire is also the name of the Lion King's kingdom |
| 2026-10-22 | The starter companion is the coach for every lesson; heroes like Saffron don't teach. The Lich King is cold and courtly |
| 2026-10-22 | Faction habits: Bandit wanted poster (target from their best line, poster icon, named by the Squire advice), Shadow Cult binding, Iron Legion proud (renamed from greedy), Bone Wardens relentless march, Lich King none |
| 2026-10-22 | Help ladder: Scrying Orb charges in Region 2, Far Sight in 3, Oracle and Blunder Ward (once per battle) in 4, rewind relics in 5 |
| 2026-10-22 | "Tortoise Golem" is the canonical species name for the rook; "tower" stays its short name |
| 2026-10-22 | Region 1's boss, Grubnak, doesn't shout: the final exam for the habit the shouts taught |
| 2026-10-22 | Every Region follows the Region template, with Region 1 as the worked example, and meets the playbook's verification bars |
| 2026-10-22 | Every token comes in White and Black: ivory or ebony headgear and base, applied in code from a cyan key; ebony gets a light rim |
| 2026-10-22 | Each enemy faction has its own species and shares only the chess headgear shapes; Bog Goblins are bog rats, salamanders, crows, snapping turtles, vipers and Grubnak the Toad Chief |
| 2026-10-22 | Bandit Rider placeholder art removed; Region 2 picks its own species when designed |
| 2026-10-21 | The game is called Pawnshire; Gauntlet stays the name of the replay mode after the campaign |
| 2026-10-21 | Academy teaches the idea, battles test it under pressure, bounties repeat it until it sticks |
| 2026-10-21 | The game stays 2D: tokens on the board, talking-head portraits beside it; 3D explored and deferred, with the mockups kept for reference |
| 2026-10-21 | If 3D is revisited, use Rodin for AI-generated models (slight edge over Hunyuan3D; TRELLIS 2 not for hero pieces) |
| 2026-10-21 | Talking-head portraits are tall portrait cards so headgear and shoulders fit |
| 2026-10-21 | First implementation is one complete region, Region 1, in Phaser |
| 2026-10-21 | Gauntlet unlocks after beating the Lich King and uses the puzzle themes the campaign doesn't |
| 2026-10-21 | Bounty board: small, refreshes after each battle, follows the curriculum, pays more for harder puzzles, includes mistake bounties |
| 2026-10-21 | Battles pay for the army; bounties pay for extras and catch-up |
| 2026-10-21 | Boss budgets cap your army; only the Lich King battle allows a full chess set |
| 2026-10-21 | All pieces usable and hireable after the tutorial; gold and growing boss budgets pace the army |
| 2026-10-21 | Each region rewards a named hero recruit |
| 2026-10-21 | Regions map to Lichess Practice studies, with endgames before advanced tactics and a strategy region of our own |
| 2026-10-21 | King is a lion, bishop is an owl |
| 2026-10-21 | Board uses simplified tokens that still show the animal and its chess role; detailed figurines become talking-head portraits |
| 2026-10-21 | Lesson battles use a set lineup chosen by the scenario; boss battles use a points budget; wounds dropped |
| 2026-10-21 | Tutorial entry: the game asks "Do you know how the pieces move?" |
| 2026-10-21 | Champion difficulty loses a quarter of your gold on a lost battle; tune in playtests |
| 2026-10-21 | Phaser 4 for the map, town and board; Three.js only later, if 3D is worth it |
| 2026-10-21 | Audience: players who know the moves; optional "Teach me the moves" tutorial for total beginners |
| 2026-10-21 | Campaign first |
| 2026-10-21 | Open source under GPL-3, so Stockfish ships with the game |
| 2026-10-21 | Losing a battle costs more on harder difficulties, never the save |
| 2026-10-21 | Tactic banners need a board rule plus engine confirmation; 8 patterns at launch |
| 2026-10-21 | Free rewind deferred: too confusing as designed |
| 2026-10-21 | Scrying Orb ladder: shouting Bog Goblins, then the Orb (threat), then Far Sight (what-if upgrade) |
| 2026-10-21 | Starter is a named companion who acts as the main tutor |
| 2026-10-21 | Animal world: one species per piece type, factions told apart by outfit; classic pieces toggle (species per faction superseded 2026-10-22) |
| 2026-10-21 | Battles are short scenarios; the rules of chess never change on the board |
