# Game systems

[Design overview](../design.md) · [Campaign and curriculum](campaign.md) · [Story and characters](story.md)

## Battles

Battles are short scenarios on a standard 8×8 board, each with a goal, a move limit and bonus objectives. They borrow what makes Into the Breach fun without changing how pieces move.

| Into the Breach | Chess version |
| --- | --- |
| Enemies show their attacks in advance | **Threat Sight:** highlights squares the enemy attacks and your undefended pieces. Fades with difficulty. |
| Battles last about 5 turns | Move limits: "checkmate within 6 moves", "survive 8 turns" |
| Goals beyond killing (protect buildings) | Protect villages, escort a squire to promotion, capture the standard-bearer |
| One shot hits two enemies | Forks, skewers and discovered attacks are detected and celebrated |
| Bonus objectives | "Win without losing a piece", "Use a pin", "Under 10 moves" → extra gold |
| One Reset Turn per battle | Rewind charges (see [Powers and rewind](#powers-and-rewind)) |

**Battle types**

1. **Skirmish:** small armies. Checkmate, or win material within a set number of moves.
2. **Ambush:** a real puzzle position ("the enemy walked into your trap, find the strike"), then play it out to a win against the AI. Turning an advantage into a win is a skill puzzles alone don't teach.
3. **Siege:** survive a set number of turns while protecting village squares. Teaches defence and prophylaxis.
4. **Promotion run:** escort a squire to the far rank, where it's knighted in a promotion ceremony. Teaches pawn endgames.
5. **Boss duel:** a nearly full or full game against a faction leader.

**Your pieces in battle.** Every piece type can be used from the start, because players either finished the tutorial or said they know the moves. Lesson battles (skirmish, siege, promotion run) use a set lineup chosen by the scenario: pieces you've hired appear as your named characters, and the rest as unnamed militia. Ambush battles use the puzzle position as it is. Boss duels let you pick your army up to a points budget, using standard piece values. The budget grows by region, from about 10 points in region 1 to the full 39 of a complete chess set, which only the Lich King battle allows. A boss can also cap specific piece types when its lesson needs it, for example no queen in region 1. Every captured piece comes back after the battle, win or lose.

**Tactic detection.** When a move creates a known pattern, the game shows a banner like **FORK!**, **PIN!** or **SKEWER!** and pays bonus gold, like a combo in a fighting game. A banner must only appear when the tactic really works, or it teaches the wrong lesson: a "fork" where the forking piece simply gets captured is not a fork. So each banner needs two checks: a board rule spots the pattern, and the engine confirms the move actually wins something.

- **At launch (clear board rules):** checkmate, fork, double check, discovered attack, pin, skewer, back-rank mate, promotion.
- **Puzzles only (need judgment):** deflection, attraction, overloaded piece, zwischenzug, clearance, interference. These are hard to name automatically in live play, so they appear in puzzles, where the Lichess database already tags them.
- The prototype already detects checkmate, fork, check, promotion and capture, without the engine check yet.

**Scenario format** (one JSON file per battle): starting position (FEN) or, for bosses, the points budget and enemy setup; goal, move limit, enemy faction and AI settings, bonus objectives, rewards, and the dialogue before and after.

## Your army

You start as a king with one companion and two squires, and build toward a full chess set by learning and earning.

**Hiring rules**

- Every piece type can be hired from the start; gold is the only limit.
- Army size is capped at a real chess set: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen.
- Price equals standard piece value, so players learn values just by shopping.
- Gold and the growing boss budget set the pace: owning more pieces than a boss budget allows gives you choices, not extra power.

| Piece | Species | Why it fits | Value | Price |
| --- | --- | --- | --- | --- |
| Pawn | Mouse squire | Small, and there are many | 1 | 10g |
| Knight | Frog | Jumps over other pieces | 3 | 30g |
| Bishop | Owl mage | Robed and scholarly | 3 | 30g |
| Rook | Tortoise | Castle on its back, moves in straight lines | 5 | 50g |
| Queen | Fox sorceress | Fast, goes anywhere | 9 | 90g |
| King | Lion | Regal; this is you | — | — |

**No wounds.** Captured pieces return after every battle, so a sacrifice never has a lasting cost. Losing material still hurts inside the battle, which is the real chess lesson.

**Avoiding grind.** Gold comes from varied, short content: battle rewards, bonus objectives, side quests, and a tavern bounty board of puzzles. No required replays of the same practice game.

See [starter companions, tutors and hero recruits](story.md#recurring-characters) for their roles in the story.

## Bounty board and gold

Battles pay for the army; bounties pay for extras and catch-up, and every bounty is practice the player needs. Because the boss budget caps your army in each boss battle, extra gold buys choices and powers, never a way past a boss.

**Gold pacing**

- Boss budgets are about 10, 16, 22, 28 and 34 points for regions 1 to 5, and the full 39 for the Lich King. Each step is about 6 points, or about 60 gold of pieces.
- Battle rewards cover most of each region's budget increase, so players who skip puzzles aren't stuck.
- Bounties pay for powers (Scrying Orb, Far Sight), extra piece choices, and recovering gold after a lost battle on harder difficulties.

**Bounty board rules**

- **Small and refreshing:** 3 to 4 bounties at a time, refreshed after each battle. It can't be ground, and it mixes puzzles in between battles, which helps players remember.
- **Follows the curriculum:** most bounties match the current region's themes; one or two revisit earlier regions, as the spiral does.
- **Pays for challenge:** puzzles are picked near the player's hidden rating. Ones above it pay more; ones far below pay little.
- **Mistake bounties:** positions where you blundered in a battle come back later as puzzles, like Lichess's "learn from your mistakes".

## Enemies and difficulty

See [Regions and factions](campaign.md#regions-and-factions) for the campaign lineup and [curriculum](campaign.md#curriculum) for teaching themes.

**AI personalities.** Enemy commanders have readable habits that create lessons. Bog Goblins shout their next move and must play it if it's still legal (see [Powers and rewind](#powers-and-rewind)). The Iron Legion warlord always grabs free material, which teaches traps. The cult leader pins everything, which teaches unpinning. Personality is a layer over the engine: weighted move choice among the engine's top candidates.

**Human-like mistakes.** Stockfish at low skill levels mixes perfect moves with random blunders, which feels unnatural. Early enemies should make believable mistakes, like missing a fork or leaving a piece undefended. The prototype does this by picking among several Stockfish candidate moves within a centipawn window; weaker enemies get a wider window.

See [campaign loss costs](campaign.md#campaign-and-gauntlet) for the consequences of losing a battle.

**Difficulty in two layers**

- **Global setting:** Squire / Knight / Champion / Grandmaster. Sets the AI strength offset and how much help you get (Threat Sight, blunder warnings, rewind charges).
- **Adaptive rating:** a hidden rating (Glicko-style) from puzzles and battles keeps the AI near the player's level, with the global setting as an offset.

## Powers and rewind

Undo is unlimited in training and limited in battles, like Into the Breach's one Reset Turn. Scarce rewinds are what make players double-check before moving, and that habit is the skill being taught.

| Context | Undo | Hints | Why |
| --- | --- | --- | --- |
| Lessons and training grounds | Unlimited | Free | Safe space to explore |
| Battles | Rewind charges (set by difficulty) | Paid with powers | Consequences build the blunder-check habit |
| After every battle | Full review | Best move shown | Learn from the biggest mistake |

**Rewind relics.** Rewind can be upgraded: more charges per battle, or rewinding two moves at once.

**Learning-friendly powers**

- **Scrying Orb:** shows the enemy's threat, the move they would play if you did nothing. It reveals their plan, not just the squares they attack. Teaches "what does my opponent want?"
- **Far Sight (Orb upgrade, bought in town):** hover a piece over a square to see the enemy's best reply to that move. Trains "if I go here, then they…" thinking.
- **Oracle:** highlights which piece the best move uses, but not where it goes.
- **Blunder Ward:** warns once per battle when you're about to leave a piece undefended.
- **Threat Sight:** always available on easy difficulty, a limited power on harder ones.

**One feature, three uses.** Shouting goblins, the Scrying Orb and Far Sight all ask the engine the same question: what is the enemy's best move in this position? Goblins announce it automatically and commit to it, the Orb shows it on demand, and Far Sight asks it about a move you haven't made yet. Together they teach the habit in order: first the enemy says its plan out loud, then you pay to see it, then you learn to work it out yourself.

**Deferred: free rewind.** A free rewind for spotting your own mistake is on hold because every version so far was confusing. Revisit after playtests, if at all.

**Banned power types:** anything that changes how pieces move, gives extra moves, swaps pieces, or adds terrain. Fun, but they teach the wrong chess.
