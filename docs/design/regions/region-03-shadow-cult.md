# Region 3: Shadow Cult

[Syllabus](../syllabus.md) · [Curriculum-first scope](../../curriculum-first.md) · [Story](../story.md) · [Playbook](../../playbook.md)

## Design status

Ready for content selection, 2026-10-23. This is the first published-puzzle plan for Region 3; no source pack or implementation is claimed.
The owner approved continuing the basic learning journey. No further design approval or human pilot is required to begin.

| Field | Plan |
| --- | --- |
| Faction | Shadow Cult; purple hoods and crystals, keeping the established storybook direction. |
| Headline | Pins, escaping pins, skewers, x-rays, and discovered attacks. |
| Earlier skills | Safe captures, answering check, forks, removing defenders, mate in two, and double check. |
| Course shape | Six sequential lessons, then a seven-wave mixed chapter review. Every lesson is required; stars are optional. |
| Confrontation | The cult leader frames the mixed review. No live army boss, faction habit, army budget, power, or economy is required. |
| Coach | The player's chosen companion throughout; Sage Ollie does not replace Sir Hob or Old Brick. |
| Story turn | Break the villages' binding. The cult's records identify the Lich King and point to the Iron Legion's traitor general. |
| Technique | Opposition and key squares remain a separate capability, not a release dependency. |

Use existing faction and character names. New personal, species, and place names must be recorded in the shared glossary when implementation needs them.
The brief does not require naming a new hero or producing a complete army art set before its lessons can ship.
A later hero can join through dialogue; joining must not imply an unimplemented recruitment or power system.

## Path and prerequisites

Ashfang's completed review opens Region 3. Preserve every earlier completion record and keep earlier lessons available for practice.

`Pins → Escape a pin → Skewers → X-rays → Discovered attacks → Double-check revisit → Mixed review → Iron Legion`

The story's binding is an image for attacks along lines. It never prevents a legal move or changes chess rules.
No positional indicator may announce the review's tactic before the player chooses a move.

## Lesson sequence and source selection

Each lesson has one optional shown example, three practice waves, and one backup per wave: seven distinct published puzzles.
Prefer one or two solver moves in introductions. Use three only when the published continuation remains clear and uses taught ideas.
Keep every source position, setup move, reply, and endpoint unchanged. No puzzle IDs are selected in this brief.

| Order · working title | Objective and prerequisite | Published source search | Required teaching fit and wave progression |
| --- | --- | --- | --- |
| 1 · Held in place | Exploit a pin. Requires safe captures, king safety, and checking replies. | `pin` | Show the attacker, front piece, and piece behind. Start with a king pin; then vary the attacking piece and include a clear material pin. The line must depend on the pin. |
| 2 · Break the binding | Escape an existing pin safely. Requires lesson 1 and answering check. | `pin` with `defensiveMove`; inspect broader `defensiveMove` candidates if needed. | The solver's piece starts pinned or faces a concrete loss from it. First remove the pinning attacker; then move the piece behind or block the line where legal. Use only methods present in verified sources. |
| 3 · Behind the first target | Use a skewer: a valuable front target moves and exposes the piece behind. Requires forcing checks and safe captures. | `skewer` | Start with a checking skewer, then vary rook, bishop, or queen where suitable. The published reply clears the line and the solver collects the rear target. |
| 4 · Through the line | Use an x-ray attack or defence through an intervening piece. Requires pins, skewers, and defender removal. | `xRayAttack` | Name the rear piece and the line before calculating the exchange. Start with an exchange exposing that line, then vary the blocker. Exclude a line whose only teaching point is an ordinary skewer. |
| 5 · The hidden attacker | Move one piece to uncover another piece's attack. Requires two targets and reply checking. | `discoveredAttack` | The moving piece clears a bishop, rook, or queen line. The uncovered attack matters in the published solution. Vary the moving piece; do not require an untaught sacrifice or quiet combination. |
| 6 · Two checks, seen again | Explain R2 double check through a discovery, then calculate the finish. Requires lesson 5 and R2 double check. | `doubleCheck`, with a verified discovered checking line. | Recall the familiar R2 idea, identify both checking pieces, then vary their geometry. Use fresh sources. This deepens an existing skill rather than introducing double check again. |

A king pin makes moving the pinned piece illegal only when it would expose its king.
A material pin can be broken legally, sometimes profitably. Never say that every pinned piece cannot move.
A pinned piece can sometimes move along the pin line or capture its attacker. Coaching must describe the actual position.
A skewer attacks the front target first. An x-ray concerns a line through a blocker; explain its specific role rather than treating both labels as synonyms.
In double check the king must move; capturing a checking piece with the king may be one legal king move.

For lesson 2, the table lists search goals, not three guaranteed methods in the database.
If only one method has enough suitable sources, narrow the title and objective to that method and record the missing methods.
Do not ship attack-only positions under an escaping-pins claim or fabricate defensive lines to complete a quota.

## Revisits and assessment

Coaching recalls earlier lessons when their skills matter. Keep the newly taught mechanism central in focused lessons.

| Point | Earlier skill and purpose |
| --- | --- |
| Pins | Count the capture and opponent's reply, as at the bridge in The Bog. |
| Escape a pin | Check the opponent's threat before launching your own attack; answer check first where present. |
| X-rays | Reuse removing a defender. Explain which line or guarding piece changes after the exchange. |
| Discoveries | Reuse a fork's two-target scan. The moved piece and uncovered piece may create separate threats. |
| Double-check revisit | Recall Two at once from The Kingsroad, now with the discovered line explained. |

The cult leader’s review stores one neutral example, seven fresh main waves, and seven fresh backups: fifteen distinct puzzles.
Match the current direct challenge entry: the stored review example has no player-facing demonstration button.
The whole Region therefore targets 57 distinct sources. Keep them separate from R1/R2, bounties, and warm-ups.

The seven review slots cover: a pin; escaping a pin; a skewer; an x-ray; a discovery or double check; an earlier fork or defender removal; an earlier check response or mating finish.
Main and backup must assess the same slot. Across discovery main and backup, include both ordinary discovery and double check.
Keep each continuation short. These extra review slots cover the wider chapter without forcing several new mechanisms into one puzzle.

Use a neutral title such as “The sealed ledger.” Do not label a wave “Find the pin” or identify its moving piece before a hint.
The stored review example uses generic checks, captures, threats, and reply calculation without forecasting the next wave.
Adding a player-facing review demonstration is separate UI work, not required for this chapter.
After solving, name the mechanism and explain its decisive move. Correct tactical banners may appear only after that move is accepted.
Known-position replay supports practice; a repeated review is not a fresh assessment.

## Story and voice

Preserve the [main arc](../story.md#main-story-arc). The cult promises followers they will never lose anything again.
The companion shows why fearing a loss can leave pieces tied to one another. The player learns how to break those ties.
The cult speaks in quiet promises and careful bargains. Keep lines short and avoid mocking mistakes.

| Beat | Purpose and sample original line |
| --- | --- |
| Arrival | Ashfang's crystal leads to bound villages. Companion: “They promise safety. Look what their pieces must guard.” |
| Pins and escape | Show fear becoming a binding. Cult voice: “Stay where you are. Nothing need be lost.” |
| Hidden lines | Open the route to the cult's records. Sage Ollie: “Move the front piece. See who was waiting behind.” |
| Review | The leader offers one last bargain. “Leave the ledger closed. Keep your crown.” |
| Turn | The records confirm the former Lion King became the Lich King after refusing checkmate. Companion: “He was a Lion King. He could not bear to lose.” |
| Next chapter | The records name the Iron Legion's traitor general. Keep the full revelation to this chapter's short closing scene. |
| Lich interlude | Cold and courtly: “A loss is only final when one accepts it.” |

Sample Sage Ollie text illustrates his voice; supply suitable Sir Hob and Old Brick lines without changing their roles.
Keep the player mostly silent. The starter remains the tutor; other characters add brief flavor around accurate instruction.
New art can follow the existing hood-and-crystal direction. Readability, accurate chess colors, and phone layouts take precedence over a complete faction roster.

## Technique capability and scope

Opposition and key squares belong in the longer curriculum, but the current journey runner follows one fixed published line.
A short `pawnEndgame` or `zugzwang` puzzle does not establish practice of either technique.

Before adding a technique node, identify a specific reusable published source, its replies, acceptable alternatives, and the required win or draw goal.
Verify that the runner teaches and checks that goal, rather than merely accepting a memorized move sequence.
Track the missing capability in the [syllabus ledger](../syllabus.md#technique-capability-ledger).
Ship the verified line-tactic chapter first if that work is not ready. No custom puzzle composition or engine exercise is required for this release.

## Implementation acceptance

- All six lessons and the review are playable through the existing course flow; no unfinished chapter appears playable.
- Add source manifests, original coaching, and narrow objectives only after inspecting every board and published continuation.
- Preserve the current quality floor: rating deviation at most 90, popularity at least 85, and at least 300 plays.
- Begin selection in the existing 400–1300 course range. Prioritize clear positions over forcing a higher regional rating band.
- Keep backups within the existing 200-point tolerance. Store the reason each source and backup fits its slot.
- Replay every source and compare it with the database. Check setup perspective, solver color, legality, promotions, endpoint, and duplicate reservations.
- Assert pins, escapes, skewers, x-rays, and discoveries on the actual decisive positions. Tags alone do not pass these checks.
- Lesson 2 tests must establish an existing pin and a legal escape that addresses its threat. Never assert success from the tag alone.
- Verify double-check claims with the existing checker. Any new detection or completion rule needs unit tests in `src/game`.
- Preserve the established alternative immediate mates, hints, retries, completion, stars, saves, and exit settlement.
- Generalize `Journey.ts` map coordinates for seven nodes; its current six-entry arrays cannot render this chapter.
- Replace hard-coded chapter/encounter totals, completion text, and reset copy. Test navigation and layout beyond two Regions.
- Remove R1/R2-only count assumptions from integration tests while retaining their existing content and save guarantees.
- Independently review teaching accuracy and neutral assessment presentation. Check all playbook viewport sizes and reduced motion.
- Run `npm run ci` for the implementation PR and `npm run ci -- --full` before shipping. Published puzzles need no new engine tournaments.
- Record implementation, verification, deployment, and any remaining source gaps in build progress. These checks are not yet completed.
