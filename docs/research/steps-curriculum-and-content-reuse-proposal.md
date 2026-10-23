# Proposal for a Steps inspired Pawnshire curriculum

**Status:** Research proposal for discussion, not an approved design change.  
**Date:** 2026-10-22

[Current design](../design.md) · [Current curriculum](../design/campaign.md) · [Region 2 brief](../design/regions/region-02-bandit-riders.md)

## Recommendation

Keep the five factions and their story order. Restructure their teaching around basic board skills, simple tactics, defence, combined tactics, and converting advantages.

Use the Steps Method as a curriculum reference, with Yusupov as a cross-check for balanced coverage. Use existing Lichess puzzles wherever they fit. Add short teaching explanations and game framing around selected positions.

The aim is to reduce original lesson authoring without making the available puzzle tags dictate the entire curriculum. Basic strategy needs some curated examples beyond tactical puzzles.

This proposal does not replace the approved Region 2 brief or change faction habits, rewards, armies, or implementation.

## What the teaching sources support

There is no single lesson order established by these sources as universal. FIDE's school checklist names several established systems, including Steps. That supports choosing a credible curriculum rather than treating Lichess's display order as mandatory. [FIDE checklist](https://edu.fide.com/assets/checklists/eng.pdf)

Steps introduces basic skills before tactics and modest positional ideas. Later work develops defence, pawn endings, mental calculation, and preparatory moves that make combinations possible. Earlier skills remain prerequisites. [Step 2](https://www.stappenmethode.nl/en/material/step2), [Step 3](https://www.stappenmethode.nl/en/material/step3), [Step 4](https://www.stappenmethode.nl/en/material/step4)

Steps also distinguishes solving exercises from applying ideas in games. This supports mixed practice and battles that require recognizing the idea without a topic label. [Steps FAQ](https://www.stappenmethode.nl/en/faq)

Yusupov's course distributes tactics, strategy, endgames, calculation, and openings across its levels. It provides a useful check against postponing entire subjects until late in the campaign. [Publisher overview](https://www.simonandschuster.net/books/Build-Up-Your-Chess-1/Artur-Yusupov/Yusupovs-Chess-School/9781906552015)

The mapping below is our proposed adaptation. A region is not equivalent to a Steps level, and completing five regions would not imply completing that course.

## Proposed regions and faction emphasis

| Stage | Current emphasis | Proposed teaching and faction description |
| --- | --- | --- |
| Optional tutorial | Piece movement and rules | Keep movement, captures, check, escaping check, and mate. Give players who know the rules a short optional refresher. |
| 1 — Bog Goblins | Threats, protection, safe trades, basic mates | **Careless raiders whose shouted plans teach board awareness.** Spot threats, count attackers and defenders, save loose pieces, trade safely, and finish basic mates. Keep the promotion introduction. |
| 2 — Bandit Riders | Forks, double attacks, double check, mating patterns | **Ambushers who attack several targets and punish undefended pieces.** Teach direct forks with different pieces, avoiding forks, removing a defender, and simple mate in two. Revisit protection and trades. |
| 3 — Shadow Cult | Pins, skewers, discoveries, x-rays, overloads, intermediate moves | **Binders and hidden attackers who exploit lines between pieces.** Teach pins, skewers, discovered attacks, then double check. Revisit forks and defence. Introduce simple king-and-pawn play in the academy. |
| 4 — Iron Legion | Development, king safety, open files | **Coordinated soldiers whose formations must be disrupted.** Deepen piece activity, king safety, and open files. Teach deflection, overloaded defenders, intermediate moves, and short combinations. |
| 5 — Bone Wardens | Promotion, king activity, opposition, rook endings | **Patient pursuers who punish wasted moves in small armies.** Deepen pawn endings, opposition, king activity, promotion, and basic rook endings. Reuse tactics in endgames. |
| Final — Lich King | Complete games | Integrate the campaign's skills without announcing the motif. Keep rare techniques and harder combinations as optional extensions. |

These descriptions adjust the teaching emphasis, not the species, names, story, or chess rules.

### Specific changes from today's outline

- Move Region 2's double-check battle and lesson to Region 3, after a discovered-attack introduction.
- Replace that Region 2 slot with removing a defender or defending against a fork.
- Move overloaded defenders and intermediate moves from Region 3's core into Region 4.
- Introduce development, central activity, and king safety through early lessons and boss reviews. Region 4 deepens these habits.
- Add simple king-and-pawn practice by Region 3. Region 5 becomes the culmination of endgame teaching.
- Introduce selected advanced motifs when their prerequisites are present. Do not reserve every topic labelled “Advanced” by Lichess for the final stage.

Teaching discoveries before double check is an explanatory choice for this game, not a universal teaching rule.

Region 2 currently specifies five battles and five matching lessons. The replacement preserves that shape. Regions 3–5 still need detailed designs, so their lesson counts remain open.

### Keep the workload manageable

A faction can have several curriculum connections without giving every concept its own campaign battle. Use academy exercises and returning bounties for supporting skills.

For each major idea, propose this sequence:

1. A clear example with a short explanation.
2. A few related positions with help fading.
3. A defensive example where the player must prevent the idea.
4. Mixed practice without the theme named.
5. A battle or boss situation that applies the habit.

This is a proposed game structure. The number of exercises and readiness thresholds should follow a small playtest, not an assumed rating conversion.

## Finding reusable content

### Start with the existing importer

The current [importer](../../scripts/build-puzzles.mjs) builds Region 1 packs for `mateIn1` and `hangingPiece`. It filters rating, rating uncertainty, popularity, play count, and solution length. It checks move legality and deduplicates selected IDs.

Extend this foundation with lesson-specific selection rules and a small curated manifest. Avoid building a separate puzzle collection system.

### Candidate sources by teaching goal

The tags below are search inputs, not proof that a puzzle teaches the intended lesson. Spellings follow the [Lichess theme definitions](https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml).

| Region or goal | Database candidates | Lesson reference and selection needed |
| --- | --- | --- |
| Goblins: loose pieces and mates | `hangingPiece`, `mateIn1`, `backRankMate` | Piece Checkmates I and Checkmate Patterns I. Protection and fair exchanges need selected examples. |
| Bandits: direct tactics | `fork`, `capturingDefender`, `mateIn2` | The Fork. Check which piece creates the fork; the tag includes more than knight forks. |
| Cult: attacks along lines | `pin`, `skewer`, `discoveredAttack`, `discoveredCheck`, `doubleCheck`, `xRayAttack` | Matching Fundamental Tactics lessons. Keep early examples focused on one mechanism. |
| Legion: combinations | `deflection`, `intermezzo`, `attraction`, `clearance` | Overloaded Pieces, Zwischenzug, and selected Advanced Tactics. Check whether each example actually illustrates overload. |
| Wardens: conversion | `pawnEndgame`, `rookEndgame`, `promotion`, `advancedPawn`, `zugzwang`, `underPromotion` | Key Squares, Opposition, and Basic Rook Endgames. Broad ending tags do not identify exact techniques. |
| Defence across regions | `defensiveMove`, `equality` | Review the threat being prevented. These tags do not mean “defend against a fork” specifically. |

Practice lesson names refer to the [Practice catalog](https://lichess.org/practice). It is a teaching reference; permission to redistribute complete lesson packages remains unconfirmed.

There are no direct database tags for every strategic goal. Development, improving an inactive piece, opposition, and control of open files require more specific selection. An opening-phase tag does not establish that a position teaches opening principles. [Puzzle themes](https://lichess.org/training/themes)

### Reuse priority and availability

| Source | Proposed use | Reuse status |
| --- | --- | --- |
| Lichess puzzle database | Main source of tactical positions, solutions, and difficulty metadata | Explicitly CC0; suitable for redistribution and commercial use. |
| Existing Pawnshire academy | Retain useful rook and queen mate exercises | Already part of the project; inspect before replacing. |
| Lichess Practice and public studies | Find sequences, explanations, and examples for gaps | Check the specific content's license or obtain permission before bundling it. Public access alone is insufficient evidence. |
| Steps and Yusupov | Guide sequencing, prerequisites, and coverage | Treat as curriculum references, not a confirmed pool of freely reusable exercises or prose. |
| Other openly licensed chess lessons | Fill remaining strategy and endgame gaps | No specific external lesson pack is selected yet. Require a clear license, inspectable positions, and usable solutions. |
| Small original examples | Fill gaps after the reuse search | Last resort, with engine checks and focused teaching review. |

The [Lichess database documentation](https://database.lichess.org/#puzzles) supplies position, solution, rating, and theme fields. It does not provide a complete teaching narrative. Its published license applies to database exports; do not extend that conclusion to all website content.

For other sources, search public studies and teaching repositories by the precise objective: “opposition,” “develop with tempo,” or “improve the worst piece.” Record promising results as candidates until both instructional fit and reuse rights are confirmed.

## Proposed selection workflow

1. **Define the lesson.** Record the skill, prerequisites, and what a correct answer demonstrates.
2. **Filter existing puzzles.** Use tags, length, rating bands, and current quality filters to produce candidates.
3. **Inspect the actual line.** Confirm the key idea occurs where the player must use it. Check that an unfamiliar second tactic is not carrying the solution.
4. **Choose a small teaching sequence.** Start with a clear position, add variations, then defensive and mixed examples.
5. **Add minimal narration.** Explain the threat, the reason the move works, and a likely mistake in the companion's voice.
6. **Record provenance.** Store the source ID and URL, license evidence, objective, prerequisites, solution, modifications, and review status.
7. **Check the integration.** Validate the displayed start, legal moves, replies, completion condition, and acceptable alternative answers.

For example, a first knight-fork lesson would search `fork` puzzles with short solutions. It would then verify that a knight creates the fork. Exclude candidates that require a sacrifice or discovery the player has not learned.

A defensive fork lesson needs separate review. Reversing a winning fork puzzle does not automatically produce a sound prevention exercise.

## What reuse saves and what still needs checking

Keeping the source position and intended solution saves position composition and much solution discovery. Cosmetic character names and dialogue can preserve that chess content.

Changing pieces, starting squares, enemy choices, or objectives creates a new scenario. Its original puzzle solution no longer establishes that the battle works.

Database imports must apply the initial opponent move before presenting the puzzle to the player. The documentation also permits multiple mating answers in mate-in-one puzzles. [Database format](https://database.lichess.org/#puzzles)

Strategy exercises may have several good moves. Prefer explanation and a clear learning goal over rejecting every move except one engine choice.

The [battle playbook](../playbook.md) still applies to campaign scenarios. Its piece counts, White-to-move starts, objectives, faction habits, and battle lengths mean many database puzzles cannot become battles unchanged.

The lowest-authoring-cost route is therefore to reuse puzzles primarily in the academy and bounty board. Use selected positions as battle candidates only when they fit the game's constraints.

## Small pilot before any redesign

If pursued, start with three sample lesson packs:

- **Bandit forks:** test a direct tag match.
- **Defending against a fork:** test a gap within a broad tag.
- **Cult pawn-endgame introduction:** test whether Practice or another permitted source fills a technique-specific gap.

For each pack, propose two or three introductory positions and a larger bounty shortlist. Record candidate yield, curation effort, missing explanations, and any unresolved permissions.

Use the pilot to answer whether reuse covers enough of the curriculum before rewriting the campaign. No puzzle download, lesson import, code change, or curriculum migration is part of this research proposal.

## Decisions for later

- Whether to adopt this five-region mapping or change the faction order more substantially.
- Whether the replacement Region 2 slot teaches defender removal or fork prevention.
- How much foundational strategy should appear before the Iron Legion.
- Whether suitable complete lessons can be reused, or selected puzzles need our own short explanations.
- Whether academy and bounty reuse is sufficient, given that custom battles still require validation.

If adopted, update the campaign overview and affected region briefs together, then record the approved changes in the decision log.
