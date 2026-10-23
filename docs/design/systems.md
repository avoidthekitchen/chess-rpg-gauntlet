# Game systems

[Design overview](../design.md) · [Campaign and curriculum](campaign.md) · [Story and characters](story.md)

## Battles

Battles are short scenarios on a standard 8×8 board, each with a goal, a move limit and bonus objectives. They borrow what makes Into the Breach fun without changing how pieces move.

| Into the Breach | Chess version |
| --- | --- |
| Enemies show their attacks in advance | **Threat Sight:** highlights squares the enemy attacks and your undefended pieces. Fades with difficulty. |
| Battles last about 5 turns | Move limits: "checkmate within 6 moves", "survive 8 turns" |
| Goals beyond killing (protect buildings) | Protect villages, escort a pawn to promotion, capture the standard-bearer |
| One shot hits two enemies | Forks, skewers and discovered attacks are detected and celebrated |
| Bonus objectives | "Win without losing a piece", "Use a pin", "Under 10 moves" → extra gold |
| One Reset Turn per battle | Rewind charges (see [Powers and rewind](#powers-and-rewind)) |

**Battle types**

1. **Skirmish:** small armies. Checkmate, or win material within a set number of moves.
2. **Ambush:** a real puzzle position ("the enemy walked into your trap, find the strike"), then play it out to a win against the AI. Turning an advantage into a win is a skill puzzles alone don't teach.
3. **Siege:** survive a set number of turns while protecting village squares. Teaches defence and prophylaxis.
4. **Promotion run:** escort a pawn to the far rank, where it's promoted in a small ceremony. Teaches pawn endgames.
5. **Boss duel:** a nearly full or full game against a faction leader.

**Your pieces in battle.** Every piece type can be used from the start, because players either finished the tutorial or said they know the moves. Lesson battles (skirmish, siege, promotion run) use a set lineup chosen by the scenario: pieces you've hired appear as your named characters, and the rest as unnamed militia. Ambush battles use the puzzle position as it is. Boss duels let you pick your army up to a points budget, using standard piece values. The budget grows by region, from about 10 points in region 1 to the full 39 of a complete chess set, which only the Lich King battle allows. A boss can also cap specific piece types when its lesson needs it, for example no queen in region 1. Every captured piece comes back after the battle, win or lose.

**Tactic detection.** When a move creates a known pattern, the game shows a banner like **FORK!**, **PIN!** or **SKEWER!** and pays bonus gold, like a combo in a fighting game. A banner must only appear when the tactic really works, or it teaches the wrong lesson: a "fork" where the forking piece simply gets captured is not a fork. So each banner needs two checks: a board rule spots the pattern, and the engine confirms the move actually wins something.

- **At launch (clear board rules):** checkmate, fork, double check, discovered attack, pin, skewer, back-rank mate, promotion.
- **Puzzles only (need judgment):** deflection, attraction, overloaded piece, zwischenzug, clearance, interference. These are hard to name automatically in live play, so they appear in puzzles, where the Lichess database already tags them. One with no battle of its own gets a tip card instead of a warm-up ([Guided path](campaign.md#guided-path)).
- **Built so far (Region 1):** checkmate, fork, check, promotion and capture are detected (`src/game/tactics.ts`). Fork banners, yours and the enemy's, show only when Stockfish confirms the fork wins material (`src/game/tacticCheck.ts`), and a confirmed fork pays gold. Checkmate needs no engine check. The other launch patterns are still to build.

**Scenario format** (the `BattleDef` type in `src/game/content.ts`; each Region has one array of them, such as `REGION1_BATTLES` in `src/game/region1Battles.ts`): starting position (FEN) or, for bosses, the points budget and enemy setup; goal, move limit, enemy faction and AI settings, bonus objectives, rewards, and the dialogue before and after.

## Your army

You start as a king with one companion and two pawns, and build toward a full chess set by learning and earning.

**Hiring rules**

- Every piece type can be hired from the start; gold is the only limit.
- Army size is capped at a real chess set: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen.
- A hero who joins when that type is full replaces a hired piece of the same type and refunds its price. Your starter is never replaced.
- Price equals standard piece value, so players learn values just by shopping.
- Gold and the growing boss budget set the pace: owning more pieces than a boss budget allows gives you choices, not extra power.

| Piece | Species | Why it fits | Value | Price |
| --- | --- | --- | --- | --- |
| Pawn | Mouse pawn | Small, and there are many | 1 | 10g |
| Knight | Frog | Jumps over other pieces | 3 | 30g |
| Bishop | Owl bishop | Robed and scholarly | 3 | 30g |
| Rook | Tortoise | Castle on its back, moves in straight lines | 5 | 50g |
| Queen | Fox queen | Fast, goes anywhere | 9 | 90g |
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
- **Refresher bounties:** one slot (of the 4) brings back your weakest theme, with its warm-up attached and marked "Refresher". The game records, per theme, the mistakes the battle review finds and the bounties you solve or miss, like Lichess's puzzle dashboard. A theme you got wrong recently comes first; one you then solve twice in a row drops back, as in spaced repetition. This replaces sending the player back to a lesson, and keeps the map free of nodes that come and go. It also replaces bounties built from your own blunder positions: those need an engine-made solution line with one clear best move, which is the hard part of how Lichess builds its database, and a weak one teaches the wrong answer. The battle review already shows your costliest mistake and the better move. So every bounty is a Lichess puzzle as published.
- **Review set (library):** an optional run through the Region's warm-ups and the bounties you missed, timed, a little faster each pass, like the Woodpecker Method. It pays no gold; it's practice. The Gauntlet uses the same idea at full scale.
- **Tip cards:** the first time a puzzle-only theme (such as zwischenzug) reaches the board, its bounty comes with a one-screen tip card. The library keeps every tip card you've seen.

## Enemies and difficulty

See [Regions and factions](campaign.md#regions-and-factions) for the campaign lineup and [curriculum](campaign.md#curriculum) for teaching themes.

**AI personalities.** Enemy commanders have readable habits that create lessons. Bog Goblins shout their next move (see [Powers and rewind](#powers-and-rewind)). The proud Iron Legion prefers to take what you offer, which teaches traps. The cult leader prefers pins, which teaches unpinning. Personality is a layer over the engine: weighted move choice among the engine's top candidates. Each faction's habit is listed in [AI habits by faction](#ai-habits-by-faction).

**Human-like mistakes.** Stockfish at low skill levels mixes perfect moves with random blunders, which feels unnatural. Early enemies should make believable mistakes, like missing a fork or leaving a piece undefended. The prototype does this by picking among several Stockfish candidate moves within a centipawn window; weaker enemies get a wider window.

See [campaign loss costs](campaign.md#campaign-and-gauntlet) for the consequences of losing a battle.

**Difficulty in two layers**

- **Global setting:** Gentle / Brave / Champion / Grandmaster. Sets the AI strength offset and how much help you get (Threat Sight, blunder warnings, rewind charges).
- **Adaptive rating:** a hidden rating (Glicko-style) from puzzles and battles keeps the AI near the player's level, with the global setting as an offset.

## AI habits by faction

Every faction has one readable habit that teaches its Region's theme. Habits change what the enemy chooses or tells you, never how pieces move. All six were approved on 2026-10-22; each one's finer details are settled when its Region is designed.

**Tell or tilt, never force** (approved 2026-10-23). A habit may:

- **tell** you something true, such as the move they'd play or the piece they're hunting;
- **tilt** the enemy's choice toward a kind of move, but only among moves the engine already rates good enough for the difficulty (its centipawn window).

A habit may never **force** a move the enemy wouldn't otherwise consider, such as keeping a promise that now loses, or taking every piece offered. Real opponents answer your move, and the Lichess puzzles in warm-ups and bounties assume the best defence. A habit that makes the enemy walk into traps teaches the opposite. The difficulty window already makes weaker enemies fall for more traps, so help still fades without forcing anything.

**How a tilt works.** Every enemy move comes from one weighted pick:

1. The engine evaluates the candidate moves.
2. Moves outside the difficulty's window are dropped.
3. Each habit adds a capped weight bonus to the moves it likes (see [Tuning values](#tuning-values)).
4. One random pick, better moves more likely.

An enemy with two habits, such as a shouting raider, just adds both bonuses to the same pick. A bonus makes a move more likely, never certain: players can't count on the enemy taking bait. Bonuses belong to the faction's AI. Showing a plan (a shout, the Scrying Orb) only reveals the pick, so buying an Orb charge never makes another faction stubborn. When there is no engine analysis, today's simple fallback move choice still applies.

| Faction | Habit | Why it teaches the theme | Status |
| --- | --- | --- | --- |
| Bog Goblins | **Shout:** announce the move they'd play if you passed. After your move they decide again, preferring the shouted move among moves within the difficulty's window but free to pick another. Their boss, Grubnak, doesn't shout: the final exam | Shows the enemy's plan out loud, so "what does my opponent want?" becomes a habit | Built with a must-play rule, which breaks tell or tilt; changing to the re-decide rule in [#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4) ([Region 1](regions/region-01-bog-goblins.md#ai-habit-shouting-goblins)) |
| Bandit Riders | **Wanted poster:** each turn they mark one of your pieces as their target: the piece their move would capture or newly attack if you passed (the same pick the Scrying Orb shows), with a poster icon over it. After your move they prefer, among their good moves, one that attacks or wins it, without committing to a move. On Gentle, the companion names the target ("They're hunting your bishop!") | Half the information of a shout: you know the target, not the route. Forks and double attacks are how the target gets hit, so you learn to spot them | Approved, not built; details in the [Region 2 brief](regions/region-02-bandit-riders.md#ai-habit-wanted-poster) |
| Shadow Cult | **Binding:** prefers moves that pin or keep a pin | Teaches recognizing and escaping pins | Approved; details with Region 3 |
| Iron Legion | **Proud:** prefers to capture what you offer, among its good moves. On Gentle's wide window it takes some poisoned bait; on Brave it rarely does | Teaches traps and poisoned pieces: you learn which bait is good enough to tempt them. Framed as pride, not greed, so it doesn't repeat the goblins and fits a disciplined army | Approved (renamed from "greedy"; "never declines" changed to "prefers" 2026-10-23); details with Region 4 |
| Bone Wardens | **Relentless march:** prefers moves that push passed pawns and bring the king forward | Teaches king activity and racing in endgames | Approved, not built |
| The Lich King | No habit; full strength for the difficulty | The final test: no tells | Approved |

The village **raider** in sieges is a battle-level habit any faction can use: it goes for villages first, but never makes a raid that allows mate in one (`raiderMove` in `src/ai/enemy.ts`).

**Changing (approved 2026-10-23):** as built, the raider scores every legal move before the engine is asked, so it can play moves far outside the difficulty's window. That breaks tell or tilt. It will tilt instead: moves that add village pressure get a capped bonus in the one weighted pick above. Siege battles are re-verified after the change, starting with Lanterns at Mossbridge ([#23](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/23)).

## Powers and rewind

Undo is unlimited in training and limited in battles, like Into the Breach's one Reset Turn. Scarce rewinds are what make players double-check before moving, and that habit is the skill being taught.

| Context | Undo | Hints | Why |
| --- | --- | --- | --- |
| Warm-ups and the library | Unlimited | Free | Safe space to explore |
| Battles | Rewind charges (set by difficulty) | Paid with powers | Consequences build the blunder-check habit |
| After every battle | Full review | Best move shown | Learn from the biggest mistake |

**Rewind relics.** Rewind can be upgraded: more charges per battle, or rewinding two moves at once.

**Learning-friendly powers**

- **Scrying Orb:** shows the enemy's threat, the move they would play if you did nothing. It reveals their plan, not just the squares they attack. Teaches "what does my opponent want?"
- **Far Sight (Orb upgrade, bought in town):** hover a piece over a square to see the enemy's best reply to that move. Trains "if I go here, then they…" thinking.
- **Oracle:** highlights which piece the best move uses, but not where it goes.
- **Blunder Ward:** warns once per battle when you're about to leave a piece undefended.
- **Threat Sight:** always available on easy difficulty, a limited power on harder ones.

**One engine call, two questions.** All three ask the engine about a position, so they share one code path, but they show different things:

- **Shout and Scrying Orb:** the move the enemy would actually pick if you passed, using its habit and difficulty. Goblins announce it every turn; the Orb shows it on demand. Once the shout decides again after your move ([#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4)), a shout is an always-on Orb in the goblins' voice. Showing the plan never changes what the enemy then does.
- **Far Sight:** the enemy's best reply after a move you're considering. It analyses the position after that move, not the passed-turn position.

 Together they teach the habit in order: first the enemy says its plan out loud, then you pay to see it, then you learn to work it out yourself.

**Ladder by Region** (approved 2026-10-22). Help arrives as the habits fade, so the player always has one rung of support:

| Region | The enemy's plan | New in town |
| --- | --- | --- |
| 1 Bog Goblins | Shouted for free | Nothing (Threat Sight comes with the difficulty) |
| 2 Bandit Riders | Target only (wanted poster), free | Scrying Orb: shows the full planned move. Sold in town: 3 charges for 30g, bought with bounty gold |
| 3 Shadow Cult | Hidden | Far Sight (Orb upgrade) |
| 4 Iron Legion | Hidden | Oracle; Blunder Ward (one warning per battle) |
| 5 Bone Wardens | Hidden | Rewind relics |
| Final | Hidden | — |

The Orb overlaps the wanted poster on purpose: it bridges the drop from the whole move (Region 1) to the target only (Region 2). Blunder Ward stays at one warning per battle, because an unlimited one would take away the lesson a mistake teaches.

**Help that fades in Region 1.** On Gentle, the companion reads each goblin shout a moment later (is the target guarded, is the trade fair, is a village or the king the target). On Brave, it doesn't.

**Battle review.** After every battle, Stockfish replays your last 12 moves and names the costliest one and the better move. When a goblin's shout still stood after your move, your move is judged after their forced reply, so a deliberate trap isn't called a blunder (`review()` in `src/scenes/Battle.ts`; scoring in `src/game/review.ts`). Each new habit needs the same care here.

**Deferred: free rewind.** A free rewind for spotting your own mistake is on hold because every version so far was confusing. Revisit after playtests, if at all.

**Banned power types:** anything that changes how pieces move, gives extra moves, swaps pieces, or adds terrain. Fun, but they teach the wrong chess.

## Tuning values

The numbers the game uses today, and where each is set, so later Regions stay consistent. Most are first guesses to tune in playtests ([open questions](decisions.md#open-questions)).

| Value | Now | Set in |
| --- | --- | --- |
| Starting gold | 20g | `STARTING_GOLD` in `src/game/campaign.ts` |
| Hiring prices | Piece value × 10g (10, 30, 30, 50, 90) | `PRICE` in `src/game/economy.ts` |
| Battle reward | 15–25g, paid on the first win only | `reward` on each battle |
| Bonus goals | 2 per battle, 5g each (boss: 10g), each paid once | `bonuses` on each battle |
| Boss reward | 50g (Region 1) | `src/game/region1Boss.ts` |
| Boss budget | 10 points, no queen (Region 1) | `R1_BOSS_BUDGET` in `src/game/region1Boss.ts` |
| Boss reward, budget (Region 2, not built) | 50g; 16 points, queens allowed | Region 2 brief |
| Wins that open the boss | 4 of 5 (Region 1 today: any 4). Guided path (approved, not built): 4 wins as set by the [unlock rule](campaign.md#guided-path) | `bossNeeds` in `src/game/region1.ts` |
| Confirmed tactic gold | 5g a fork, at most 10g per battle ever | `TACTIC_GOLD`, `TACTIC_GOLD_CAP` in `src/game/economy.ts` |
| Fork confirmation margin | Engine eval at least 0.8 pawns better than the material count before the move | `FORK_MARGIN` in `src/game/tacticCheck.ts` |
| Loss cost | Gentle 0, Brave 10% of gold, Champion and Grandmaster 25% | `lossCost` in `src/game/economy.ts` |
| Rewinds per battle | Gentle 3, Brave 2, Champion 1, Grandmaster 0 | `src/game/difficulty.ts` |
| Habit bonuses (approved, not built) | Starting values to tune: the goblin shout ×3 on the shouted move; the wanted poster ×3 on a move that captures or attacks the target; the raider up to ×3, scaled by how much village pressure a move adds. With ×3, a shouted move 100 centipawns worse than the only alternative is kept about 37% of the time on Brave | [#23](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/23) and [#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4) |
| Enemy strength | Gentle: search depth 5, any move within 300 centipawns (hundredths of a pawn) of the best. Brave: depth 8, within 120. Champion: depth 11, within 40. Grandmaster: depth 15, best move only | `ai` in `src/game/difficulty.ts` |
| Region 1 boss strength | Softer, since he doesn't shout: Gentle depth 4 within 400 centipawns, Brave depth 6 within 200 | `ai` on `R1_BOSS` in `src/game/region1Boss.ts` (any battle can override the difficulty's strength this way) |
| Scrying Orb (Region 2, not built) | 3 charges for 30g; one charge shows one enemy move | Region 2 brief |
| Bounties on the board | 4, refreshed after each battle | `BOUNTY_COUNT` in `src/game/economy.ts` |
| Bounty target rating | Gentle 900, Brave 1200, Champion 1500, Grandmaster 1800 (fixed until the adaptive rating exists) | `playerRatingFor` in `src/game/bounty.ts` |
| Bounty pay | 10g at your rating, ±2g per 100 points, between 2g and 30g | `bountyReward` in `src/game/bounty.ts` |
| Academy first clear | 10g per exercise (Region 1's academy, until the guided path replaces it) | `src/game/academy.ts` |
| Warm-up first solve (not built) | 5g the first time you solve a battle's warm-up (first guess) | Guided path |
| Review threshold | A move must cost about a pawn (90 centipawns) to be called a mistake | `MISTAKE_CP` in `src/game/review.ts` |
| Talking-head time on phones | 1.2 s + 60 ms per character, between 3.2 s and 9 s, then a 0.8 s fade | `holdMs` in `src/ui/dialogue.ts` |
| Engine search timeout | 12 s, then the fallback AI takes over | `Engine` in `src/ai/engine.ts` |
