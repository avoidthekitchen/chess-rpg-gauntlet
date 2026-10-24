# Finale: The Lich King

[Syllabus](../syllabus.md) · [Story](../story.md) · [Playbook](../../playbook.md) · [Issue 45](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/45)

## Content status

The capstone source pack was curated and verified on 2026-10-24.
It contains two four-wave mixed encounters, each with one stored example and one backup per wave: 18 distinct published positions.
This is the finale after five teaching Regions, not a sixth teaching Region. It introduces no new required motif.

| Field | Delivered content contract |
| --- | --- |
| Sequence | Bone Wardens review → Across the threshold → short story beat → The last board → ending and replay. |
| Content IDs | `finale-threshold`, then `finale-last-board`; region ID `finale`, kind `finale`. |
| Places and cast | The Keep; The Lich King; the player’s selected companion. |
| Entry | Direct review challenges. Stored examples use neutral text and do not add demonstration buttons. |
| Help and completion | Existing help, retries, and optional stars. Completion alone opens the next encounter and ending. |
| Final board | Both variants of the final wave end in actual legal checkmate. |
| Replay | Earlier chapters, journal, and completed encounters remain available. Repetition is practice, not an unseen assessment. |
| Deferred | Full games, engine duels, armies, powers, currency, sustained technique, and the gauntlet. |

`src/game/course/finale.ts` contains the original story and neutral coaching.
`finalePuzzles.json` preserves the published boards, moves, quality fields, and curation reasons.
`finaleEvidence.json` records exact prerequisites, full SAN lines, decisive squares, source-game URLs, and complete source-line hashes.
The shared journey registers both encounters, saves final completion, and provides the interlude, ending, credits, and replay navigation.

## Coverage matrix

Every prerequisite below names an actual delivered lesson. Main and backup assess the same taught mechanism.
Both encounters include attack, defence, short endgame decisions, and mating play.
The second encounter combines familiar ideas; its backups introduce no new technique.

| Encounter / slot | Main / backup | Delivered prerequisites | Verified decision |
| --- | --- | --- | --- |
| Threshold / 1 | 3E96a / 62A3N | `r2-knight-forks` | A knight checks and attacks a rook, then captures the rook after the king moves. |
| Threshold / 2 | CBjXF / IdUNF | `r4-defend` | A non-checking capture removes every immediate mating threat. The next move answers the published check safely. |
| Threshold / 3 | JNKkg / gI0hw | `r5-passed-pawns`, `r5-pawn-races` | Three passed-pawn pushes promote with check before the opponent can promote. |
| Threshold / 4 | 0aWlo / 0RaDJ | `r2-mate-in-two` | A queen check, king reply, and second queen move produce legal mate. |
| Last board / 1 | 1xVVV / LmJKq | `r4-between`, `r2-remove-defender` | Capture the enemy queen’s knight defender with check before taking the queen. |
| Last board / 2 | QWUnM / l0NYo | `r3-escape-pins`, `r1-safe-captures` | A king-pinned piece captures its own pinning attacker. Continue through the published reply and capture. |
| Last board / 3 | mqbS0 / ykqWD | `r5-rook-support`, `r4-deflect` | A rook check draws the enemy rook off the pawn’s file, allowing promotion. |
| Last board / 4 | uFhSB / oH2I9 | `r3-xrays`, plus `r1-back-rank` or `r2-mate-in-two` | An enemy blocker recaptures on the checking square. The rear rook or queen recaptures for mate on the back rank. |

The stored threshold example, `ERa4T`, revisits `r3-skewers`: a bishop checks a king and captures the rook behind it.
The stored last-board example, `idVEo`, revisits `r3-discoveries`: a pawn check uncovers a rook’s capture.
Their demonstration text asks for checks, captures, threats, and reply calculation without revealing the mechanism.
Neither stored example is a new teaching prerequisite or a required player-facing step.

## Board evidence and boundaries

The defence sources have concrete mate-in-one threats in their starting positions.
`CBjXF` prevents mate on d8; `IdUNF` prevents the queen’s mate on g7.
Tests inspect the opponent’s legal mating moves before the response and confirm none remains immediately afterward.
The complete published lines then require a safe king move after check.

The passed-pawn sources have no enemy pawn ahead on the same or neighbouring file.
Each solver makes exactly three consecutive pushes. The last move promotes to a queen with check; no opponent promotion occurs first.
This revisits a short race. It does not test opposition, key squares, or conversion against varied defensive play.

The escape sources begin with the solver’s own piece pinned to its king.
Both capture the pinning attacker along that line and leave the king safe.
The claim is the narrow capture method taught in Region 3, not all ways to escape pins.

The rook-support sources deserve a precise distinction: the enemy rook can capture a queen promoted immediately on the pawn’s file.
The checking rook capture draws that defender away first. After the published recapture, the pawn promotes without an immediate rook recapture.
Tests verify both the premature-promotion capture and its absence after the chosen line.
This is the rook-support and deflection decision already taught; the source stops at promotion.

The final main source `uFhSB` ends `Rxf1+ Rxf1 Rxf1#` after its setup.
Its rear rook on f8 looks through the enemy rook on f7 toward f1.
The final backup `oH2I9` ends `Qf8+ Rxf8 Qxf8#` after its setup.
Its rear queen on b8 looks through the enemy rook on e8 toward f8.
In both, the final king has no legal answer. Checkmate comes from the board, not a story flag.

## Story beats and ending

The Lich King waits in the quiet keep with the old crown. He offers to keep it if the player leaves.
The selected companion remains beside the player throughout; no companion is replaced by another named coach.

After the first encounter, the Lich King notices that the player returned after mistakes.
He sets the final table. This is a short transition, not a claim that he already accepts defeat.

Before the second encounter, he recalls refusing to accept the board before him.
Only after the last wave’s actual checkmate does he lower his hand and say, “I accept it.”
The crown returns to Pawnshire. The companion stays for the road home.

The ending should credit the Lichess puzzle database and its CC0 publication, together with the game’s existing credits.
A completed journey must let returning players see the ending again and revisit earlier chapters.
Completion, saved ending state, and replay access must survive reloads and exits during the final reply or celebration.
These are shared integration checks; this content pack alone does not establish their completion.

## Neutral assessment presentation

Both encounters use the `mixed` tag and neutral titles, objectives, introductions, and coaching.
The first table does not promise a fork, defensive move, promotion, or mating pattern before the player reads the board.
The final table foreshadows the story’s resolution without identifying each solution.
Requested help may reveal the moving piece under the existing difficulty rules.
Mechanism banners must wait until the decisive move is accepted.

Stars, perfect play, and speed never gate the ending. A missed attempt is retryable on every difficulty.
The stored examples remain neutral content under the existing direct-review interface.
Repeated completions improve optional stars without granting duplicate progress or removing earlier records.

## Provenance and quality

All 18 sources come from the [Lichess puzzle database](https://database.lichess.org/#puzzles), published under CC0.
All instructional prose, source explanations, and story text are original.
No FEN, setup, reply, promotion choice, or endpoint was rewritten.

| Check | Final pack |
| --- | --- |
| Unique sources | 18, separate from every current Region 1–5 source, bounty pack, and retained ambush source. |
| Rating | 787–1270; unchanged allowed range 400–1300. |
| Rating deviation | At most 87; limit 90. |
| Popularity | At least 87; required minimum 85. |
| Plays | At least 324; required minimum 300. |
| Length | Two or three solver moves. |
| Backup pairing | Every pair differs by at most 200 rating points. |
| Final mates | Both final-wave variants reach `Chess.isCheckmate() === true`. |
| Database comparison | All 18 FENs, move lists, ratings, themes, and quality values match the original local download. |

`sourceLineSha256` hashes the complete original UTF-8 CSV line, without its newline.
It includes the game URL and opening tags. The evidence file states this serialization explicitly.
The comparison used Node’s Zstandard stream against `data/raw/lichess_db_puzzle.csv.zst`.
Raw data, shortlists, and helper scripts remain ignored under `data/raw/finale*`.
No quality filter was relaxed and no source-yield gap remains.

## Validation and integration gates

The strict content test defines 39 checks: structure, neutral prompts, registered prerequisites, global reservations, every legal line, every mechanism, and real-runner completion.
All 18 board-mechanism checks pass. The real runner completes both encounters with each possible failed-wave backup.
Every final encounter path, including the final backup, ends in actual checkmate.
The strict tests are registered as `src/game/course/finale.test.ts`, with all earlier prerequisites now registered.
Save tests cover accepted wins before animation, interruption, replay, older saves, and completion without optional stars.

The full source comparison and TypeScript check pass.
Independent content review passed all 18 mechanisms and database rows. Browser checks, release CI, and staging verification remain separate delivery checks.
Report those outcomes in shared build progress. Do not infer them from source verification or this brief.
