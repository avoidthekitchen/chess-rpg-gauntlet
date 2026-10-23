# Names and terms

[Design overview](../design.md) · [Story and characters](story.md) · [Game systems](systems.md)

One place for the names the game shows, so every screen, line of dialogue and document uses the same words.

## Pieces

Our army. Each enemy faction has its own species and in-game names, listed with the faction in [Art direction](art.md).

| Chess piece | Species name (portraits, tavern, starter screen) | Short name (status text, banners, advice) |
| --- | --- | --- |
| Pawn | Mouse Pawn | pawn |
| Knight | Frog Knight | knight |
| Bishop | Owl Bishop | bishop |
| Rook | Tortoise Rook | rook |
| Queen | Fox Queen | queen |
| King | Lion King | king |

- **Every species name is the animal plus the chess piece** (decided 2026-10-22), for our army and every enemy faction ("Bog Rat Pawn"). The game teaches chess, so the piece's real name is always in view. Flavor lives in the art and in character names.
- **Short names are the plain chess names**, for both sides: "Your rook takes their pawn on d5." No faction gets its own short names.
- **Characters** show as name, then species: "Sage Ollie · Owl Bishop". Heroes and bosses may keep a title ("Saffron, the Fox Queen", "Grubnak, the Toad Chief").
- A pawn that reaches the far rank is **promoted**, as in real chess, whatever it becomes. Don't call it "knighted", which suggests it must become a knight.
- The code keeps these in `SPECIES` and `FACTION_SPECIES` (`src/ui/speaker.ts`), `STARTERS` (`src/game/campaign.ts`) and `pieceName` for short names.

## Difficulty levels

| Shown as | Code id | What it means |
| --- | --- | --- |
| Gentle | `squire` | Relaxed: clumsier enemies, Threat Sight on, 3 rewinds, and your companion reads shouts for you |
| Brave | `knight` | A fair fight: sharper enemies, 2 rewinds |
| Champion | `champion` | Not built yet |
| Grandmaster | `grandmaster` | Not built yet |

- Difficulty names never use a chess piece's name, so "Knight" always means the piece. The code ids stay as they are, so old saves still load.

## Material

- **Material** is the points of the pieces on the board: pawn 1, knight 3, bishop 3, rook 5, queen 9 (`PIECE_VALUE` in `src/game/material.ts`).
- **Material won** is net: what you captured minus what you lost, since the battle began. A sacrifice that wins more than it costs still counts.
- Chess terms (check, checkmate, fork, pin, file, rank) are used as they are in real chess, in dialogue and lessons alike, so everything carries over.

## Factions

| Faction | Region | Its pieces' names |
| --- | --- | --- |
| Bog Goblins | 1 | Their own species names, in [Art direction](art.md); in battle, the king speaks as the battle's commander |
| Bandit Riders | 2 | Their own species names, in [Art direction](art.md) and the [Region 2 brief](regions/region-02-bandit-riders.md) |
| Shadow Cult | 3 | Chosen with the Region |
| Iron Legion | 4 | Chosen with the Region |
| Bone Wardens | 5 | Chosen with the Region (skeleton animals) |
| The Lich King's army | Final | Chosen with the Region |

## Places

| Name | What |
| --- | --- |
| Pawnshire | The game, and the Lion King's kingdom ([story arc](story.md#main-story-arc)) |
| The Bog | Region 1 |
| Mudford Town | Region 1's town |
| The Muddy Mug | Region 1's tavern |
| The Kingsroad | Region 2 |
| Waymeet | Region 2's town |
| The Broken Wheel | Region 2's tavern |

## Game terms

| Term | Meaning |
| --- | --- |
| Companion | Your starter character (Sir Hob, Sage Ollie or Old Brick) |
| Hero | A named character who joins at the end of a Region |
| Militia | Unnamed pieces in a battle's set lineup |
| Shout | A Bog Goblin announcing its next move ([details](regions/region-01-bog-goblins.md#ai-habit-shouting-goblins)) |
| Foiled! | The banner when your move makes a shouted move illegal |
| Wanted poster | The Bandit Riders' mark on the piece they're hunting ([details](regions/region-02-bandit-riders.md#ai-habit-wanted-poster)) |
| Scrying Orb | A power bought in town: shows the move the enemy would play if you passed |
| Threat Sight | Highlights for squares the enemy attacks and your pieces that can be won |
| Rewind | Undo your last move and the enemy's reply; limited charges in battles |
| Bounty | A real Lichess puzzle on the town's bounty board that pays gold |
| Bonus goal | An optional goal in a battle that pays extra gold once (shown as a star on the map) |
| Warm-up | The short lesson that opens a battle node: your companion shows one position, then you try one ([Guided path](campaign.md#guided-path)) |
| Main path | A Region's required battles, the headline themes in teaching order |
| Branch | A battle off the main path that you choose: a revisit, a mate or an endgame |
| Library | The town building where you replay warm-ups and read tip cards (replaces the academy) |
| Tip card | A one-screen explanation of a puzzle-only theme, shown when it first reaches the bounty board |
| Refresher | A bounty that brings back a theme you got wrong in a battle |
| Boss budget | The most points of army you may bring to a boss duel |
| Gauntlet | The replay mode that unlocks after the campaign |
