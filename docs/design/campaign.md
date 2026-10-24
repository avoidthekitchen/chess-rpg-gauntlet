# Campaign and curriculum

[Design overview](../design.md) · [Syllabus](syllabus.md) · [Story](story.md) · [Systems](systems.md) · [Playbook](../playbook.md)

## Campaign and Gauntlet

The core campaign is a sequential learning journey through five Regions and a Lich King finale.
Regions 1–5 are currently implemented. Later chapters must not appear playable before their content exists.
Gauntlet is a possible later replay mode, not a required unlock or an implemented reward.

## Guided path

Each lesson introduces a useful chess idea through short character dialogue and an optional worked example.
Practice uses unchanged published Lichess positions and replies. Completion opens the next lesson.
All chapter lessons lead to a mixed review; clearing the review opens the next implemented Region.
The map remains an illustrated journey even when its route is sequential.

Completed lessons and demonstrations remain available through the map and journal.
Completion, no-miss, and no-hint stars persist; replay can fill missing stars.
There is no army budget, gold cost, permanent difficulty lockout, or shop requirement.
See [systems](systems.md) for the actual help and attempt rules.

Regions 1 and 2 each have five three-position lessons and one four-position review, plus examples and retry backups.
Regions 3–5 each have six lessons; their reviews have seven, six and six waves respectively.
Later chapters should use as many focused lessons as their prerequisites require; five is not a universal quota.
Do not add new skills only inside a mixed review.

## Regions and factions

Factions provide story, voices, places, and visual identity. They do not select puzzle replies or dictate board composition.
Allies and opponents may play either chess color; ivory and ebony identify color independently of faction.

| Chapter | Status | Teaching scope | Story role |
| --- | --- | --- | --- |
| [The Bog](regions/region-01-bog-goblins.md) | Built | Loose pieces, safe captures, answering check, back-rank mate, promotion mate | Grubnak's greed; free Saffron |
| [The Kingsroad](regions/region-02-bandit-riders.md) | Built | Knight forks, queen double attacks, double check, removing defenders, mate in two | Ashfang's tolls and stolen banners |
| [Shadow Cult](regions/region-03-shadow-cult.md) | Built | Pins, capturing pinning attackers, skewers, x-rays, discoveries; earlier revisits | Fear and binding; discover the Lich King's identity |
| [Iron Legion](regions/region-04-iron-legion.md) | Built | Tactical coordination, king safety, forcing sequences, defensive resources | Pride; win the kingdom's soldiers back |
| [Bone Wardens](regions/region-05-bone-wardens.md) | Built | Short pawn races, safe king captures, rook support and skewers, immediate knight-promotion mates | Reach the keep through the Lich's vanguard |
| [Lich King](regions/finale-lich-king.md) | Built | Mixed capstone of taught skills, using fresh published positions | The king who refused defeat finally accepts it |

The final capstone does not require a full live engine game or a hired army.
Region 2 currently reuses earlier art. Keep future faction species and costumes as art direction, not a content dependency.

## Curriculum

The [syllabus](syllabus.md) maps each skill to prerequisites, source material, later revisits, and unlabelled assessment.
It preserves influences from Steps, Bain, Heisman, Silman, Duolingo's path, and Woodpecker-style repetition.
These methods inform our selection and teaching; their exercise collections and prose are not our content source.

Choose a learning goal before searching tags. Inspect the complete position and line for teaching fit.
Ratings help order candidate puzzles, but do not measure a learner's mastery or guarantee simplicity.
A narrow example must not be described as teaching every way to defend, develop, or win an endgame.

## Encounter kinds

**Published-puzzle lesson — built.** The runner plays the setup and published replies, checks the solver's continuation, and stops at the published endpoint.
It supports worked examples, practice, hints, misses, backups, and mixed reviews.

**Technique lesson — planned.** Lichess Practice can supply established positions for opposition and rook endings.
A technique requires suitable goal checking and defender behavior, with multiple valid continuations where appropriate.
The current fixed-line runner does not provide that capability. Do not substitute a tactical puzzle and call the technique taught.

**Refreshers — planned.** Revisit selected earlier ideas along the path and offer optional repeated practice.
Fresh mixed assessments must remain distinct from memorised practice sets.
Tracking missed themes and scheduling refreshers is follow-up work, not an implemented feature.

**Custom battles and live bosses — legacy.** Existing code remains for regression coverage and the development-only legacy entry.
They are not required for new Regions. Historical details are in [legacy campaign](legacy-campaign.md).

## Battle outline by Region

The active outline is the [syllabus](syllabus.md). All five Regions and the Lich King capstone are built; further technique and refresher work remains separate.
Older warm-up bands, branch counts, bounty packs, and boss armies remain in the historical campaign document.
