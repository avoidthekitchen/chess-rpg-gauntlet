# Campaign and curriculum

[Design overview](../design.md) · [Story and characters](story.md) · [Game systems](systems.md)

## Campaign and Gauntlet

The Campaign, with regions that build chess skills in order, is the core of the game and gets built first. A Gauntlet replay mode unlocks after beating the Lich King.

**Campaign.** An optional tutorial, then a map of 5 regions and the final battle. Each region has:

- 4 to 6 battles, chosen from a branching map like Into the Breach's islands
- a town with a tavern (hire pieces), an academy (lessons), and a bounty board (puzzles for gold)
- a boss duel against the faction leader

Lessons learned, pieces hired and heroes recruited are permanent. Losing a battle never costs the save; how much it costs depends on difficulty.

| Difficulty | Losing a battle costs |
| --- | --- |
| Squire | Nothing: retry right away, pieces recover |
| Knight | A tenth of your gold (first guess) |
| Champion | A quarter of your gold |
| Grandmaster | A quarter of your gold, and the battle is gone from the map with its reward |

**Gauntlet (after the campaign).** Unlocks after beating the Lich King and is built after the campaign. A replay mode like a run in Into the Breach or Slay the Spire: random battles, relics and a fresh army each time, and the run ends when you lose. Its battles and bounties use the [puzzle themes](https://lichess.org/training/themes) the campaign doesn't: the opening themes (Sicilian, French, Italian and more), most mate patterns (smothered, Anastasia's, Arabian, Boden's and more), knight, bishop and queen endgames, longer mates, and advanced motifs such as quiet moves, zugzwang, clearance and interference.

## Regions and factions

Each region has one faction built around a headline chess theme, and also revisits earlier themes (see [Curriculum](#curriculum)). Enemies grow from a handful of pieces to a full set, and their AI gets stronger along the way. Each faction has its own species for each piece type, fitting its theme, and shares only the chess headgear shapes with ours; ivory or ebony headgear and bases show the chess color (see [Pieces and factions](art.md#pieces-and-factions)).

| Region | Faction | Look | Army style | Headline theme |
| --- | --- | --- | --- | --- |
| 1 | [Bog Goblins](regions/region-01-bog-goblins.md) | Bog rats, salamanders, crows, snapping turtles, vipers and a toad chief, in muddy rags and scavenged gear | Many pawns, a goblin chief as king | Threat awareness, protection, safe trades, basic checkmates |
| 2 | Bandit Riders | Masks and cloaks; species to be chosen | Knight-heavy | Forks, double attacks, mating patterns |
| 3 | Shadow Cult | Purple hoods, crystals | Bishops and a queen | Pins, skewers, discovered attacks |
| 4 | Iron Legion | Plate armor | Rooks and pawns | Development, king safety, open files |
| 5 | Bone Wardens | Skeleton animals, the Lich's vanguard | Small elite armies | Promotion, king activity, endgames |
| Final | The Lich King | Skeleton versions of every species | Full army | Complete games |

Each faction's readable AI habit is in [AI habits by faction](systems.md#ai-habits-by-faction).

Detailed Region designs for Regions 2–5 and the Lich King are still open ([open TODOs](decisions.md#open-todos)). Keep the faction and curriculum summary tables here as the campaign-wide overview. As each detailed design is written in a separate file under `regions/` (copy the [Region template](regions/region-template.md); [Region 1](regions/region-01-bog-goblins.md) is the worked example), link its Region name in both tables to that document.

## Curriculum

The order follows how Lichess lays out its teaching: [Learn](https://lichess.org/learn) first, then [Practice](https://lichess.org/practice), then [puzzle themes](https://lichess.org/training/themes), then full games. Regions work through the Practice studies in order, arranged as a spiral like the Dutch Steps Method, a widely used six-step course: each region has a headline theme but also brings back earlier themes at a harder level. Lessons are our own writing; Lichess is the outline.

| Tier | Region | Headline theme | Also revisits | Lichess Practice studies | Puzzle tags for bounties |
| --- | --- | --- | --- | --- | --- |
| 0 (skippable) | "Teach me the moves" tutorial | Movement, captures, check, mate in one | — | All of Learn: chess pieces, fundamentals, intermediate, advanced | mateIn1 |
| 1 | [Bog Goblins](regions/region-01-bog-goblins.md) | Threat awareness, protection, safe trades, basic checkmates | Pawn promotion basics | Piece Checkmates I, Checkmate Patterns I | hangingPiece, mateIn1 |
| 2 | Bandit Riders | Forks, double attacks, mating patterns | Safe trades | Checkmate Patterns II–IV, The Fork, Double Check | fork, doubleCheck, mateIn2 |
| 3 | Shadow Cult | Pins, skewers, discovered attacks, x-rays | Forks, mating patterns | The Pin, The Skewer, Discovered Attacks, X-Ray, Overloaded Pieces, Zwischenzug | pin, skewer, discoveredAttack, xRayAttack |
| 4 | Iron Legion | Development, king safety, open files, improving inactive pieces | Fundamental tactics, back-rank mates | Our own strategy lessons, Piece Checkmates II | backRankMate, kingsideAttack |
| 5 | Bone Wardens | Promotion, king activity, opposition, rook endgames | Tactics in the endgame | Pawn Endgames, Rook Endgames | pawnEndgame, rookEndgame, promotion |
| Final | The Lich King | Complete games | Everything | Advanced Tactics and Knight & Bishop Mate as bonus content | deflection, attraction, intermezzo |

Two departures from Lichess's order: basic endgames come before advanced tactics, because most coaches teach them earlier, and region 4 adds strategy lessons Lichess doesn't have. Puzzle tags follow the Lichess puzzle database's theme names; check exact spellings when building the pipeline.
