# Region template

[Design overview](../../design.md) · [Syllabus](../syllabus.md) · [Region 1](region-01-bog-goblins.md) · [Playbook](../../playbook.md)

Copy this file to `region-NN-<faction>.md` for a new curriculum chapter.
Describe the learning sequence before selecting boards. Link shared rules instead of repeating them.
Record an unresolved design call in [decisions](../decisions.md) rather than inventing a mechanic to fill the template.

Regions 1 and 2 use five guided lessons each; Regions 3–5 use six each. Every Region ends with a mixed review.
Review lengths are 4, 4, 7, 6 and 6 waves. The finale adds two four-wave encounters.
Future Region length follows prerequisites and coverage, not a mandatory five-lesson quota.
Armies, gold, powers, faction move selection, and live boss duels are deferred; they are not chapter prerequisites.
The [legacy playbook](../../legacy-playbook.md) preserves that earlier authoring model.

## Design status

State planning / approved / built / verified / playtested, with a date and evidence link.
Separate a proposed syllabus from shipped content. Name the next dependency when a chapter cannot yet be implemented.

| Field | Chapter decision |
| --- | --- |
| Region and faction | Established names and story identity; link the glossary |
| Learning prerequisites | Skills from earlier chapters that the player must already understand |
| New skills | Precise ideas the chapter teaches; link the syllabus |
| Revisited skills | Earlier ideas deliberately mixed into practice and review |
| Lesson sequence | Ordered encounters; explain why each prerequisite comes first |
| Chapter review | Previously taught skills sampled, without revealing the tactic |
| Exercise capability | Existing published-line runner, or a future technique dependency |
| Companion and characters | Voices and story roles; no recruitment mechanic implied |
| Places | Region, town, and other established locations |
| Completion | Current sequential unlock and revisit behavior; link systems |
| Not built | Content or capability still planned |

## Teaching scope and prerequisites

State what players can do on entry and what they should learn by the end.
Use specific chess claims that the selected boards can demonstrate.
Separate recognizing a tactic from practicing a general method.
Do not promise a full defence, endgame, or beginner curriculum from a few narrow examples.

## Map and sequence

Show the ordered route, chapter review, and transition to the next chapter.
Use a Mermaid diagram when it makes dependencies easier to see.
Follow [map rules](../../playbook.md#map-rules): completion unlocks the next encounter, earned stars remain optional, and completed lessons remain available.
Mark future Regions as planning until they exist in the journey.
The painted route and short story encounters are core presentation.

## Guided lessons

| Order | Encounter | Precise teaching claim | Prerequisites | Demonstration purpose | Practice and backups | Takeaway |
| --- | --- | --- | --- | --- | --- | --- |

The current pattern is one optional demonstration, three waves, and a backup for each wave.
Use the [lesson content rules](../../playbook.md#lesson-content-rules) and [tuning values](../systems.md#tuning-values).
If a future chapter needs a different structure, record the reason and the required runner changes rather than assuming support.

## Published sources and teaching fit

| Encounter / role | Source id and URL | Rating and quality | Theme tags | Setup and published solution | Why the actual board teaches it |
| --- | --- | --- | --- | --- | --- |

Include examples, main waves, and every backup.
Preserve source FENs, setup moves, solution moves, and replies; stop at the endpoint.
Record quality fields and check duplicates against existing selections and bounty content.
A source tag alone is not proof of teaching fit. Record the move and board evidence supporting each claim.
Write demonstrations, prompts, and feedback in our own voice.

## Mixed chapter review

| Review wave | Previously taught idea | Main source | Backup source | Why recognition is required |
| --- | --- | --- | --- | --- |

Reviews use four to seven waves according to skill coverage, plus a stored example; the interface enters the challenge directly.
Keep titles and pre-answer prompts neutral. Withhold theme-specific coaching until the move demonstrates the idea.
Check backups for taught coverage and accidental answer leakage too.
A named chief can host the review through story and portraits without a live engine duel.

## Technique practice dependencies

Use this section only when the syllabus calls for a method beyond a short published tactical line.
Name the Lichess Practice study and chapter, intended goal, useful feedback, and multiple-valid-move needs.
Mark the dedicated technique capability as future work until implemented and tested.
Do not present the tactical runner or retained legacy academy as a completed general technique system.
Link capability decisions and define validation before making the chapter depend on them.

## Story beats and voices

Describe arrival, encounter introductions, moving-piece reactions, the chief’s review, and the next story hook.
Follow the [main arc](../story.md#main-story-arc), [voice guide](../story.md#voice-and-dialogue), and established names.
The chosen companion coaches; generic pieces keep their own identities and follow the puzzle’s player color.
Teaching text takes priority over flavor dialogue.

## Art and presentation

List faction tokens, portraits, illustrated routes, backgrounds, and celebration needs.
Follow [Art direction](../art.md) and test assets on the actual phone board.
Keep full current advice visible without scrolling.
Temporary speech stays outside lesson scroll content; the portrait history target is at least 44×44 CSS pixels.
Roomy desktops use a separate last-speaker panel. Respect reduced motion and cancel work after exit.

## Verification

Record commands, dates, outcomes, and remaining issues. Follow the [verification bars](../../playbook.md#verification-bars).

- Legal source replays, metadata, quality, uniqueness, exact teaching fit, and all backup waves.
- Correct and unexpected moves, alternate mates, hints, misses, retries, promotions, and exactly-once settlement.
- Unlocks, stars, revisits, reloads, exit races, reset confirmation, and separate legacy and pilot saves.
- Independent code and teaching review; a fresh reviewer subagent is allowed.
- `npm run ci` before the PR, with all selected legacy engine regressions intact.
- `npm run ci -- --full` before the Region ships; published puzzles do not waive this requirement.
- Desktop, phone portrait, short phone, and landscape checks, including Gentle and the longest advice.
- Deployed navigation, asset loading, browser errors, and saved completion.

Published tactical lessons need no new engine tournaments. Retained custom battles keep their regression checks.
Report whether mobile evidence came from a resized viewport, WebKit device emulation, or a physical iPhone.
Do not describe emulation as a physical Safari playthrough.

## Playtest and handoff

Record who actually played, the build, time, observations, and changes made.
Keep owner feedback distinct from automated evidence; do not invent educational validation.
Further human pilot tests are not a gate for the approved basic curriculum.
Link the review PR, staging destination, progress entry, remaining work, and any later production release separately.
