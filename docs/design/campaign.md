# Campaign and curriculum

[Design overview](../design.md) · [Story and characters](story.md) · [Game systems](systems.md)

## Campaign and Gauntlet

The Campaign, with regions that build chess skills in order, is the core of the game and gets built first. A Gauntlet replay mode unlocks after beating the Lich King.

**Campaign.** An optional tutorial, then a map of 5 regions and the final battle. Each region has:

- 5 map nodes with a required main path and a choice of branches ([Guided path](#guided-path)). From Region 2 on, most are ambushes ([Encounter kinds](#encounter-kinds))
- a town with a tavern (hire pieces), a library (replay warm-ups, read tip cards) and a bounty board (puzzles for gold)
- a boss duel against the faction leader

Warm-ups seen, pieces hired and heroes recruited are permanent. Losing a battle never costs the save; how much it costs depends on difficulty.

| Difficulty | Losing a battle costs |
| --- | --- |
| Gentle | Nothing: retry right away, pieces recover |
| Brave | A tenth of your gold (first guess) |
| Champion | A quarter of your gold |
| Grandmaster | A quarter of your gold, and the battle is gone from the map with its reward |

**Gauntlet (after the campaign).** Unlocks after beating the Lich King and is built after the campaign. A replay mode like a run in Into the Breach or Slay the Spire: random battles, relics and a fresh army each time, and the run ends when you lose. Its battles and bounties use the [puzzle themes](https://lichess.org/training/themes) the campaign doesn't: the opening themes (Sicilian, French, Italian and more), most mate patterns (smothered, Anastasia's, Arabian, Boden's and more), knight, bishop and queen endgames, longer mates, and advanced motifs such as quiet moves, zugzwang, clearance and interference.

## Regions and factions

Each region has one faction built around a headline chess theme, and also revisits earlier themes (see [Curriculum](#curriculum)). Enemies grow from a handful of pieces to a full set, and their AI gets stronger along the way. Each faction has its own species for each piece type, fitting its theme, and shares only the chess headgear shapes with ours; ivory or ebony headgear and bases show the chess color (see [Pieces and factions](art.md#pieces-and-factions)).

| Region | Faction | Look | Army style | Headline theme |
| --- | --- | --- | --- | --- |
| 1 | [Bog Goblins](regions/region-01-bog-goblins.md) | Bog rats, salamanders, crows, snapping turtles, vipers and a toad chief, in muddy rags and scavenged gear | Many pawns, a goblin chief as king | Threat awareness, protection, safe trades, basic checkmates |
| 2 | [Bandit Riders](regions/region-02-bandit-riders.md) | Raccoons, hare riders, magpies, badgers, a stoat and a wolf lord, in masks and dark cloaks | Knight-heavy | Forks, double attacks, mating patterns |
| 3 | Shadow Cult | Purple hoods, crystals | Bishops and a queen | Pins, skewers, discovered attacks |
| 4 | Iron Legion | Plate armor | Rooks and pawns | Development, king safety, open files |
| 5 | Bone Wardens | Skeleton animals, the Lich's vanguard | Small elite armies | Passed pawns, king activity, rook endgames |
| Final | The Lich King | Skeleton versions of every species | Full army | Complete games |

Each faction's readable AI habit is in [AI habits by faction](systems.md#ai-habits-by-faction).

Region 2 has an approved [brief](regions/region-02-bandit-riders.md). Detailed Region designs for Regions 3–5 and the Lich King are still open ([open TODOs](decisions.md#open-todos)). Keep the faction and curriculum summary tables here as the campaign-wide overview. As each detailed design is written in a separate file under `regions/` (copy the [Region template](regions/region-template.md); [Region 1](regions/region-01-bog-goblins.md) is the worked example), link its Region name in both tables to that document.

## Encounter kinds

Decided 2026-10-24, after the [ambush pilot](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34). The core game teaches from proven Lichess material, so most map nodes reuse it unchanged ([build order](../design.md#build-order-core-game-first)).

| Kind | What it is | Where in the core game | Checking needed |
| --- | --- | --- | --- |
| **Ambush** | Your companion shows one position, then you break 4 waves of published Lichess puzzles. The enemy plays only the published replies ([rules](systems.md#battles)) | Most nodes from Region 2 on | Solution replays, rule tests, a teaching review |
| **Technique node** | A Lichess Practice position played out against a perfect defender, with unlimited undo, like Region 1's rook and queen mates | Endgames puzzles can't teach: opposition (Region 3), Lucena and Philidor (Region 5) | The goal is reachable from the position; the result is known theory |
| **Custom battle** | A position of our own against the live AI, with a goal and a move limit | Region 1's five built battles. No new ones in the core game | Engine playtests to the [bars](../playbook.md#verification-bars) |
| **Boss** | A live game against the faction leader with the army you pick | Every Region and the Lich King | Army and engine checks to the boss bar |

An ambush node has no separate warm-up: its show-one position is the lesson, and the first wave is the test. Region 1's battles keep today's academy and in-battle lesson. Their warm-ups, the library and refresher bounties come after the core game ([later list](decisions.md#open-todos)); the map's main path and branches don't wait.

## Guided path

Players who know the moves can't always tell what they don't know. So the map guides them: every battle teaches its idea right before testing it, and the ideas every player needs sit on a required path. Approved 2026-10-22; it replaces the separate academy.

**Each battle node runs warm-up, then battle.** An ambush node runs show-one, then four waves ([Encounter kinds](#encounter-kinds)).

1. **Show one.** Your companion plays through one position and names the idea in a sentence or two. About 30 seconds.
2. **Try one.** You solve one position. Solve it first try and the battle starts: that's the test-out, so players who know the idea lose almost no time.
3. **One more, with a hint,** if you missed. The hint lights up the piece that moves. Then the battle starts either way. A warm-up never blocks a battle.
4. **The battle** tests the idea under pressure.
5. **After a loss,** the retry offers a fresh warm-up position before you go again.
6. **Replaying** a cleared battle for its bonus goals skips the warm-up.

Warm-up positions are real Lichess puzzles from the low end of the Region's warm-up band ([curriculum](#curriculum)), 1 or 2 moves for the solver, tagged with the battle's theme. Endgame technique (opposition, key squares, Lucena, Philidor) uses positions from the matching Lichess Practice study instead, because puzzles rarely show the textbook position. The words are our own. Content rules are in the [playbook](../playbook.md#warm-up-content-rules).

**The map has a main path and branches.**

- **Main path (required):** the Region's headline battles, in teaching order. Usually 3.
- **Branches (choose):** the other battles, which revisit an earlier Region's theme or carry the mates and endgames thread. Either can come first.
- **The boss opens after 4 wins:** the whole main path, plus 1 branch when the main path has 3. It's still 4 of 5, but which 4 is set.
- **Boss warm-up:** only when the boss tests something the battles didn't. It follows the warm-up rules, with one exception: a **boss practice** plays a technique out against the engine, with unlimited undo and no move limit, such as Region 1's rook and queen mates. A boss practice is offered before the boss and can always be skipped.

**What's required, recommended and optional**

| Content | Status | How the game steers |
| --- | --- | --- |
| Main-path battles | Required, in order | The map |
| Branch battles | 1 required to open the boss when the main path has 3 | The map; the other stays open for gold and stars |
| Boss | Required to reach the next Region | The map |
| Warm-up | Part of every battle node; solving the first try skips the rest | Built into the node, never a gate |
| Library | Optional: replay any warm-up you've seen, read tip cards, and (late game) advanced lessons | The town |
| Bounties | Optional; the main source of extra gold | The board refreshes after each battle |
| Refresher bounties | Optional | A theme you got wrong in a battle comes back on the board ([bounty rules](systems.md#bounty-board-and-gold)) |
| Tip cards | Optional | Shown the first time a puzzle-only theme reaches the board |

**Tip cards** cover themes that have no battle of their own, such as zwischenzug. A tip card is one screen: the idea in a sentence or two and one example position, which may come from a Lichess Practice study. Each tip-card theme gets at least one bounty in its Region's pack. Bounties are always published Lichess puzzles: one with the theme's tag, or, for a theme with no tag (desperado, undermining, counter-check), a published puzzle picked by hand. It's a [puzzle-only theme](systems.md#battles), so bounties drill it and no battle tests it. Tip cards are never academy-style lessons, so lessons never outnumber battles.

## Curriculum

The outline comes from Lichess: [Learn](https://lichess.org/learn), then [Practice](https://lichess.org/practice), then [puzzle themes](https://lichess.org/training/themes), then full games. Other well-known courses shape the order:

- **The Steps Method** (Brunia and van Wijgerden): a spiral, where each Region brings back earlier themes at a harder level, and defending is taught as its own skill.
- **Bain's *Chess Tactics for Students*:** one motif at a time, in a fixed order (pin, fork, skewer, discovered attack, double check, removing the defender, and so on).
- **Heisman's "checks, captures, threats":** the habit Region 1 builds, checking what both sides can do before every move. It's Region 1's first warm-up and the companion's one-line reminder in every Region 1 battle: "Checks, captures, threats: theirs, then yours."
- **Silman's *Complete Endgame Course*:** teach each endgame at the level that needs it, so opposition comes in Region 3, not with the rook endgames in Region 5.
- **Duolingo's path:** a guided route with a test-out, instead of a menu of lessons.
- **Polgar's mate ladder:** mate in 1, then 2, then 3. `mateIn1` in Region 1, `mateIn2` in Region 2, and `mateIn3` as a revisit in the bounties of Regions 3 and 4.
- **Yusupov's mixed chapters:** each Region teaches a little tactics, strategy and endgame, not only its headline. The branches carry the mates and endgames thread for this.
- **The Woodpecker Method:** repeat a set of puzzles until they're fast. The library's review set uses it.
- **Lichess's puzzle dashboard and Chessable's spaced repetition:** track how you do on each theme, and bring back the weakest. Refresher bounties use it ([bounty rules](systems.md#bounty-board-and-gold)).

We borrow their order of topics, never their exercises. Positions come from the Lichess puzzle database (CC0) and Lichess Practice studies (cleared for use); the lesson text is our own, in the companion's voice ([licensing](technical.md#licensing)).

| Tier | Region | Main path (headline) | Branches | Warm-up band | Lichess Practice outline | Bounty tags | Tip cards |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (skippable) | "Teach me the moves" tutorial | Movement, captures, check, mate in one | — | — | All of Learn | `mateIn1` | — |
| 1 | [Bog Goblins](regions/region-01-bog-goblins.md) | Threat awareness, protection, safe trades | Back-rank mate; promotion | 400–800 | Checkmate Patterns I; Piece Checkmates I (boss warm-up) | `hangingPiece`, `defensiveMove`, `mateIn1`, `backRankMate`, `promotion` | — |
| 2 | [Bandit Riders](regions/region-02-bandit-riders.md) | Knight forks, double attacks, double check | Safe trades and removing the defender (revisit); mating patterns | 600–1000 | The Fork, Double Check, Checkmate Patterns II–IV | `fork`, `doubleCheck`, `capturingDefender`, `mateIn2` | — |
| 3 | Shadow Cult | Pins, escaping pins, skewers and x-rays, discovered attacks (4 headline) | Opposition (endgame) | 800–1200 | The Pin, The Skewer, X-Ray, Discovered Attacks, Opposition, Key Squares | `pin`, `skewer`, `xRayAttack`, `discoveredAttack`, `pawnEndgame`; `mateIn3` (revisit); tip cards: `intermezzo`, `deflection`, `capturingDefender` | Zwischenzug, overloaded pieces |
| 4 | Iron Legion | Development, lures and traps, king safety (taught through the tactics that punish them) | Mate in three (revisit); removing defenders mid-game (revisit) | 1000–1400 | Attraction, Greek Gift, Deflection; strategy lessons after the core game | `opening`, `attackingF2F7`, `attraction`, `trappedPiece`, `kingsideAttack`, `queensideAttack`, `exposedKing`, `deflection`; `mateIn3` (revisit); tip cards: hand-picked (no Lichess tag) | Desperado, undermining |
| 5 | Bone Wardens | Passed-pawn races, king activity and zugzwang, rook behind the passer | Lucena and Philidor; endgame tactics (revisit) | 1100–1500 | Pawn Endgames, Zugzwang, Rook Endgames | `pawnEndgame`, `zugzwang`, `rookEndgame`, `promotion`, `skewer`; tip card: `underPromotion` | Underpromotion |
| Final | The Lich King | Complete games | — | 1300–1700 (library only) | Advanced Tactics and Knight & Bishop Mate, as optional library lessons | `deflection`, `attraction`, `intermezzo`, `clearance`, `interference`, `quietMove`, `sacrifice`; counter-check hand-picked | Clearance, interference, counter-check |

Notes on the table:

- **Two departures from Lichess's order:** basic endgames come before advanced tactics, because most coaches teach them earlier, and Region 4 gets strategy lessons Lichess doesn't have, after the core game.
- **Region 3 has 4 headline battles** on its main path and one branch, because pins, skewers and discoveries all need a battle. Its boss opens after the main path, so the opposition branch is optional there.
- **The warm-up band** sets warm-up difficulty only. Bounty packs keep a wide rating range (Region 1's is 400–1899), because bounties are picked near the player's rating ([bounty rules](systems.md#bounty-board-and-gold)). Difficulty still rises by Region, because later packs hold harder themes.
- **Tag names are Lichess's.** Lichess has no `overloading` tag, so overloaded-piece bounties use `deflection` and `capturingDefender`. `underPromotion` has only about 100 good puzzles per band, so it's a tip card, not a bounty tag.
- **Lichess has no tag** for threat awareness, counting trades, development or open files. Region 1's built battles teach the first two. In the core game, Region 4 teaches development through `opening` and `attackingF2F7` puzzles; open files wait for strategy battles after the core game.

## Battle outline by Region

The draft nodes for every Region. Each Region's own document settles its puzzles, positions and names, and links its row here. Counts in brackets are good Lichess puzzles with that tag, after the quality filter in `scripts/build-puzzles.mjs`, in the range each Region's bounties draw on most: 400–1000 for Region 1, rising about 300 a Region to 1300–1800 for Region 5 (counted 2026-10-22). Every tag listed has enough for ambushes and bounties. From Region 2 on, the kinds follow [Encounter kinds](#encounter-kinds) (decided 2026-10-24).

**Region 1: Bog Goblins.** The five built battles, rewired as a guided path.

| Path | Battle · theme | Warm-up idea | Lichess outline | Warm-up and bounty tags |
| --- | --- | --- | --- | --- |
| Main 1 | Trouble in the Reeds · threat awareness | "What do they want?" Look at every check, capture and threat | Our own | `hangingPiece` (14k) |
| Main 2 | Lanterns at Mossbridge · protection | "Guard it, move it or block it" | Our own | `defensiveMove` (2.7k) |
| Main 3 | The Swap Meet · safe trades | "Count attackers and defenders" | Our own | `hangingPiece` |
| Branch | Behind the Mud Wall · back-rank mate | "The back rank" | Checkmate Patterns I | `backRankMate` (16k), `mateIn1` |
| Branch | The Pawn's Plunge · promotion | "Run it home safely" | Learn: the pawn | `promotion` (6k), `advancedPawn` |
| Boss practice | Grubnak (no queen) | Rook and queen mates against a lone king, played out | Piece Checkmates I | — |

**Region 2: Bandit Riders.** All five nodes are ambushes. The siege and the mating battle in the old brief became ambushes too.

| Path | Node · theme | Kind | Show-one idea | Lichess outline | Tags |
| --- | --- | --- | --- | --- | --- |
| Main 1 | First ambush · knight forks | Ambush | "The hare's leap" | The Fork | `fork` (152k), knight forks picked by hand |
| Main 2 | Double trouble · double attacks | Ambush | "One move, two threats" | The Fork | `fork`, queen, bishop, rook and pawn forks picked by hand |
| Main 3 | Two at once · double check | Ambush (built in the [pilot](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34)) | "When only the king can move" | Double Check | `doubleCheck` (4.9k) |
| Branch | The banner wagons · removing the defender (revisits safe trades) | Ambush | "Take the guard first" | Overloaded Pieces | `capturingDefender` (5.1k) |
| Branch | Into the trap · mate in two | Ambush | "Mate in two" | Checkmate Patterns II–IV | `mateIn2`, `backRankMate` |
| Boss | Ashfang | Live game, 16 points, queens allowed | — | — | — |

**Region 3: Shadow Cult.**

| Path | Node · theme | Kind | Show-one idea | Lichess outline | Tags |
| --- | --- | --- | --- | --- | --- |
| Main 1 | The pin | Ambush | "Can't move, or shouldn't" | The Pin | `pin` (76k) |
| Main 2 | Breaking free · escaping pins | Ambush | "Unpin with tempo" | The Pin | `pin` with `defensiveMove` (1.3k) |
| Main 3 | Skewers and x-rays | Ambush | "Through the line" | The Skewer, X-Ray | `skewer` (29k), `xRayAttack` (5.8k) |
| Main 4 | Discovered attack | Ambush | "Move one, attack with the other" | Discovered Attacks | `discoveredAttack` (73k) |
| Branch | Opposition | Technique node | "Kings face off" | Opposition, Key Squares | Practice positions; bounties `pawnEndgame` with `zugzwang` (5.2k) |
| Boss | Cult leader (name open) | Live game, 22 points | — | — | — |

Tip cards: zwischenzug (`intermezzo`, 14k) and overloaded pieces (`deflection`).

**Region 4: Iron Legion.** Lichess has the least strategy material, so the core game teaches Region 4 through the tactics that punish bad strategy: slow development, loose kings and greedy captures. Plans such as "develop and castle within 8 moves" or "take the open file first" need new goal kinds and custom battles, so they come after the core game. `mateIn3` puzzles (40k) revisit Polgar's mate ladder.

| Path | Node · theme | Kind | Show-one idea | Lichess outline | Tags |
| --- | --- | --- | --- | --- | --- |
| Main 1 | Punish slow development | Ambush | "Every piece out, or get punished" | — | `opening` with `attackingF2F7` (7.6k) |
| Main 2 | Poisoned bait · lures and traps | Ambush | "Lure and trap" | Attraction | `attraction` (48k), `trappedPiece` (15k) |
| Main 3 | King safety | Ambush | "Open the castled king" | Greek Gift | `kingsideAttack`, `queensideAttack` (13k), `exposedKing` (30k) |
| Branch | Mate in three (revisit) | Ambush | "Three moves, no escape" | Checkmate Patterns | `mateIn3` (40k) |
| Branch | Removing defenders mid-game (revisit) | Ambush | "Overload and deflect" | Deflection | `deflection` (52k), `capturingDefender` |
| Boss | Legion commander (name open) | Live game, 28 points | — | — | — |

**Region 5: Bone Wardens.**

| Path | Node · theme | Kind | Show-one idea | Lichess outline | Tags |
| --- | --- | --- | --- | --- | --- |
| Main 1 | Passed-pawn race | Ambush | "Key squares" | Key Squares | `pawnEndgame` (34k), `advancedPawn` |
| Main 2 | The king steps up · king activity and zugzwang | Ambush | "Your move is the problem" | Zugzwang | `pawnEndgame` with `zugzwang` (6.7k) |
| Main 3 | Rook behind the passer | Ambush | "Rooks belong behind passed pawns" | 7th-Rank Rook Pawn | `rookEndgame` (51k) |
| Branch | Lucena and Philidor | Technique node | "Build a bridge, hold the rank" | Basic Rook Endgames | Practice positions; bounties `rookEndgame` |
| Branch | Endgame tactics (revisit) | Ambush | "Skewers and deflections with few pieces" | Desperado | `promotion`, `skewer`, `deflection` with `endgame` |
| Boss | Warden captain (name open) | Live game, 34 points | — | — | — |

**The Lich King.** No branches: a full game with the whole 39-point army. Bounties draw on the advanced tags and named mates such as `smotheredMate`. The library's advanced lessons (Knight & Bishop Mate, Interference, Clearance, Counter-check) and the Gauntlet come after the core game.
