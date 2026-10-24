# Region 3: Shadow Cult

[Syllabus](../syllabus.md) · [Story](../story.md) · [Playbook](../../playbook.md)

## Implemented content

Shipped in the [production journey](https://unformedideas.com/chess-rpg/) on 2026-10-24. PRs #47–51 are merged.
Current integrated evidence and owner-accepted WebKit emulation are in the [release record](../../complete-journey-release.md).

The source pack contains six guided lessons and a seven-wave mixed review, curated on 2026-10-24.
It preserves 57 published Lichess puzzles, including every setup move, reply, and endpoint.
The chosen companion remains the coach. The Cult Leader hosts the review; no new named character or recruitment mechanic is introduced.

| Field | Content |
| --- | --- |
| Faction | Shadow Cult; hooded keepers, crystals, and quiet promises. |
| Map | Shadow Cult; the town label is the descriptive “Bound villages.” |
| Prerequisite | Complete Ashfang’s review. Earlier lessons and completion records remain available. |
| Path | Pins → Capture the pinning piece → Skewers → X-ray exchanges → Discovered attacks → Double-check revisit → Mixed review. |
| Story turn | Free the villages. Read the former Lion King’s identity and the Iron Legion general’s betrayal in the ledger. |
| Completion | Finishing the review opens the Iron Legion. Stars remain optional. |
| Scope | Published tactics only. No altered chess rules, live boss, powers, economy, or sustained endgame technique. |

The main content lives in `src/game/course/region3.ts` and `region3Puzzles.json`.
`region3Evidence.json` records each slot, actual mechanism, decisive squares, full SAN replay, original game URL, and source-row digest.
`region3.test.ts` checks those mechanisms on the board instead of trusting theme tags.
Integration, browser checks, full CI, and staging results belong in the shared build-progress record.

## Teaching sequence

Each guided lesson has an optional example, three main waves, and one backup per wave.
The review stores a neutral example and seven main/backup pairs. Its entry remains a direct challenge.
All 57 source IDs are distinct from each other and the earlier curriculum, bounty, and retained ambush packs.

| Lesson | Concrete teaching claim | Variation and prerequisite |
| --- | --- | --- |
| Held in place | A king-pinned defender cannot capture off the pin line. Creating a king pin and adding a second attacker can win material. | Rook and bishop pins; mating moves, a checking knight fork, and pawn pressure. Reuses safe captures and reply checking. |
| Capture the pinning piece | The solver starts king-pinned and captures its pinning attacker along the same line. | Rook, bishop, and queen captures; each leaves the solver’s king safe. Follow-up exchanges remain part of the source. |
| Behind the first target | Check a king in front of another piece, then capture that rear piece after the king moves. | Rook and bishop skewers; rear rooks, a queen, and a knight. Reuses forcing checks. |
| Through the line | A rear slider sees an exchange square through an enemy blocker. That blocker recaptures, then the rear piece captures it. | Rook files, rook ranks, and bishop diagonals. Includes material gains and familiar back-rank mates. |
| The hidden attacker | A pawn, knight, or bishop checks while uncovering another piece’s attack. The rear piece then collects its target. | Rook and bishop discoveries; the reply includes king moves and a blocking pawn move. No new sacrifice technique is required. |
| Two checks, seen again | A discovery and the moving piece check together. The king must move before the solver’s finish. | Knight–rook and bishop–rook geometry; both mating finishes and knight-fork captures. Reuses R2 double check. |
| The sealed ledger | Recognize the needed idea without a tactic label or a revealing initial prompt. | Seven fresh pairs cover the chapter and two earlier strands. |

A king pin only forbids moves that expose the king. A pinned piece can move along its line or capture its attacker.
`c2Bgp` creates an absolute pin: Bxe3 pins the f2 rook to the g1 king and adds a second attacker.
Qe2 still defends f2. After Bxf2+, Qxf2 allows Rxf2; the queen is exchanged for a rook.
This chapter claims king-pin coverage only; relative pins remain outside its assessed scope.
The other focused pin sources establish the specific forbidden capture that makes the solver’s move work.

## Pin-escape scope decision

The original plan searched for captures, rear-piece moves, and interpositions. This release teaches only **capturing the pinning piece**.
Every focused source begins with the solver’s own piece pinned to its king. That very piece captures the pinning attacker.
The tests establish the initial line, attacker, pinned piece, king, capture, and king safety after the move.
They do not infer defence from a `pin` or `defensiveMove` label.

Guided waves `fUMrZ` and `xPgdI` are natural recaptures as well as legal escapes from pins.
They practise the capture rule, but do not establish that the learner noticed the pin.
The review instead uses `Kp2Gw` and `9ztkq`; neither first answer recaptures the setup move.
Tests preserve that distinction. Their continuations also revisit removing a defender and taking a valuable piece.

This is a deliberate narrow claim, not evidence that other escape methods lack published sources.
The bounded selection found 523 eligible initial pin-attacker captures before manual selection; no rating or quality filter was relaxed.
Moving the rear piece, blocking the pin line, counterattacking, and complete pin-defence technique remain unclaimed.

## Source manifest

Each row lists the example, then three `main / backup` pairs. Review pairs are listed separately below.
The full FENs, source URLs, quality values, reasons, and unchanged moves live in the JSON pack.

| Lesson | Example | Wave 1 | Wave 2 | Wave 3 |
| --- | --- | --- | --- | --- |
| Pins | lEVc5 | NTSrF / cgSdL | 39Kko / c2Bgp | xrCYx / iAkmt |
| Capture the pinning piece | Wt8Fa | fUMrZ / oflAC | un3fn / 3Y0i6 | xPgdI / 6v7d9 |
| Skewers | rXvX8 | BUkzB / EilYs | 3JWRi / u3dY2 | 6zDkm / irsYW |
| X-rays | BCAna | i2R8M / QBWhJ | 6yvcu / 6rHtJ | ZelWm / BIy4S |
| Discoveries | TgvdT | 6bAqC / K7icn | 9AjZo / llvLx | HqQGf / 3I8Uk |
| Double check | Hmyzf | xr0Kq / oZknu | uUWLR / uXx5w | cHM5O / 9pocB |

The review example is `KDrse`. Its stored demonstration text is neutral and does not forecast a wave.

| Review slot | Main / backup | Verified coverage |
| --- | --- | --- |
| 1 | Q4BuY / 6wYzF | Bishop checks a king and takes the rook behind it. |
| 2 | i7TIO / KPo9X | Mate in two, using already taught double check or a pin. |
| 3 | 3iPpu / NWZHe | King-pinned pawn cannot capture the mating piece. |
| 4 | lAFvE / WOWAY | Ordinary discovery / double check. Both expose a previously blocked line. |
| 5 | KUSTl / 9SvxP | Enemy rook blocks the rear slider before the exchange. |
| 6 | ZvWIQ / HKkJ1 | Checking knight fork followed by a rook capture. A familiar pin prevents a pawn recapture. |
| 7 | Kp2Gw / 9ztkq | Capture the pinning queen without a setup recapture, then collect the exposed piece. |

Review title, introduction, objective, and coaching do not name any tactic.
Main and backup address the same slot; slot 4 deliberately spans ordinary discovery and double check.
The order interleaves ideas instead of repeating the lesson sequence. Tests assert coverage without fixing one order.
Replaying these known positions remains practice, not a fresh assessment.

## Provenance and quality

Source: the [Lichess puzzle database](https://database.lichess.org/#puzzles), distributed under CC0.
No Lichess instructional prose was copied. Demonstrations, objectives, coaching, and story text are original.

The local compressed database was streamed with Node’s Zstandard decoder. Raw downloads and curation scripts remain under ignored `data/raw/`.
For parallel curation, Region 3 reserved IDs whose first character code modulo 3 equals zero.
That partition supplied enough sources; there was no source-yield gap or relaxed quality floor.

| Check | Result for the pack |
| --- | --- |
| Rating | 601–1296; allowed range 400–1300. |
| Rating deviation | At most 90. |
| Popularity | At least 86; required minimum 85. |
| Plays | At least 328; required minimum 300. |
| Length | One or two solver moves; every source endpoint preserved. |
| Backup distance | Every backup is within 200 rating points of its main. |
| Source identity | Original FEN, setup, moves, rating, themes, and quality values retained. |
| Review coverage | Every required slot has both a main and backup; ordinary discovery and double check are both represented. |

Quality scores and legal replay establish source reliability, not measured teaching effectiveness or transfer to complete games.

## Story and voice

The cult promises followers they will never lose anything again. Its quiet guards confuse safety with keeping everything fixed.
The companion traces the lines and shows that a pin is not a spell or a change to chess rules.
The villages regain their freedom as the path reaches the sealed ledger.

The ledger names the former Lion King as the Lich King, then identifies the Iron Legion’s traitor general.
Keep this revelation short. The player remains mostly silent and the chosen companion remains the tutor.
The Cult Leader is a role label; no new species or personal name is introduced.

## Validation and limits

`npx vitest run src/game/course/region3.test.ts` passes 115 tests for the content pack.
They cover every legal replay, unchanged SAN record, quality floor, source identity, nearby backup, neutral review prompt, and claimed mechanism.
The source comparison checks stored fields against the local database; record its final result in shared build progress.
Discovery checks also reject any legal immediate recapture of the collected target.
The replacement sources `TgvdT`, `6bAqC`, and `Kp2Gw` preserve their published lines and endpoints.
Independent teaching review, integrated course completion, responsive layouts, and release CI are recorded separately in the [release record](../../complete-journey-release.md).

The chapter does not teach opposition, key squares, general pin defence, or sustained endgame conversion.
Those require broader source coverage or a technique runner that accepts multiple sound continuations.
Do not credit a short endgame-tagged puzzle as evidence that those capabilities are implemented.
