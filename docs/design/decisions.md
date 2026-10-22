# Decisions and open questions

[Design overview](../design.md) · [Game systems](systems.md) · [Campaign and curriculum](campaign.md)

## Open TODOs

The one place to track unfinished design work. When one is resolved, move the answer to the document it belongs in and tick it off here.

- [ ] **Main story arc:** player motivation and the story beats connecting the Regions to the Lich King. Answer goes in [Story](story.md#main-story-arc).
- [ ] **Recurring characters:** names, personalities, development and dialogue conventions beyond the existing roles. Answer goes in [Story](story.md#recurring-characters).
- [ ] **Region 1 detailed design:** battle sequence and branching, local story and dialogue, and boss and hero character details. Answer goes in [Region 1](regions/region-01-bog-goblins.md#design-status).
- [ ] **Regions 2–5 and the Lich King:** detailed designs, each as its own file under `regions/`, moved out of [Campaign](campaign.md#regions-and-factions) as written.

## Open questions

- [ ] Knight difficulty loses a tenth of your gold on a lost battle: first guess, tune in playtests.
- [ ] Boss budgets of about 10, 16, 22, 28, 34 and 39 points: tune in playtests.
- [ ] Exact gold numbers for battle rewards and bounty pay: tune in playtests.

## Decision log

| Date | Decision |
| --- | --- |
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
| 2026-10-21 | Animal world: one species per piece type, factions told apart by outfit; classic pieces toggle |
| 2026-10-21 | Battles are short scenarios; the rules of chess never change on the board |
