# Sound and music

[Design overview](../design.md) · [Story and voice](story.md) · [Art](art.md) · [Systems](systems.md#tuning-values) · [Decisions](decisions.md)

Sound makes the storybook feel alive without pulling focus from the board.
Every chapter has its own music and ambience. Every fixed line of dialogue is voiced. Board moves sound like wooden pieces on wood.

## What plays where

| Place | Music | Ambience |
| --- | --- | --- |
| Title and new-journey setup | `theme-main`, a gentle waltz | A cottage fire |
| Chapter map, journal, settings | `map-<chapter>`, the chapter's theme | The chapter's bed and scattered sounds |
| Guided lesson | `lesson-<chapter>`, quiet thinking music | The chapter's bed, further back |
| Chapter review | `review-<chapter>`, steady and tense | The chapter's bed, further back |
| Chapter-ending story | `story` | The chapter's bed |
| Finale interlude | The Lich King's theme | The keep's hall |
| Ending and credits | `ending` | A cottage fire |

Tracks play to their written ending, rest 9 seconds, then begin again. Screen changes crossfade.
Each ambience bed is 30 seconds of steady texture. Short sounds land on it every 7–19 seconds, so the loop is never heard: frogs in the Bog, a cart on the Kingsroad, a far bell in the keep.

**Chapter palettes.** The Bog is comic bayou folk: banjo, marimba, woodblock. The Kingsroad is a storybook western ride. The Shadow Cult uses celesta and glass harmonica. The Iron March is a small toy-soldier march. The Bone Wardens use xylophone and harpsichord. The Lich King's keep is a slow harpsichord minuet with cello and organ.

**Thinking music** is a duet, levelled with gentle compression so swells never pull attention. It sits about 3 dB under the map music.

## Voices

Every line in [the voice script](../../src/audio/voiceScript.ts) is recorded: chapter intros, story pages, greetings, lesson briefings, piece reactions, and companion praise.
That is 253 lines. Teaching advice in the lesson panel is not voiced, so the player reads it at their own pace.

- **Casting** lives in [audio/voices.json](../../audio/voices.json): one voice and one acting note per role, so a character sounds the same in every line.
- **The player's king stays silent**, as [the story](story.md#recurring-characters) asks.
- **Each recording is keyed by role and exact text.** A changed line has no recording until it is re-recorded, so stale audio never plays. A unit test fails until it is.
- **A repeated piece catchphrase** speaks once per position; the text still appears every time.
- **The Lich King, his court, and the Bone Wardens** speak in a soft stone hall.

## Effects

| Moment | Sound |
| --- | --- |
| Select a piece | A soft lift |
| A piece lands | A felted wooden clack, two variants; queens and kings land lower |
| Knight | A spring at take-off, a clack on landing |
| Rook | A thud for each square, a heavier last step |
| Capture | A cartoon bonk at the flash, a whoosh as the piece flies off |
| Check, checkmate | A small brass bell; a short orchestral hit |
| Promotion | A rising harp shimmer |
| Banner | A soft cloth swish |
| Miss | A kind two-note "not quite", then a reverse swish as the move is taken back |
| Hint | A three-note twinkle |
| Solved, lesson won, chapter won, attempt over | Short harp, fanfare, and gentle phrases |
| Stars | A glockenspiel ding per new star, rising, in time with the star animation |

Sounds pan slightly toward their square. Each play varies pitch a little, so repeats never sound mechanical.

## Player controls

- A speaker button on every screen mutes all sound.
- Settings has volume sliders for music, ambience, effects, and voices. Effects and voices play a sample when released.
- Browsers allow sound only after a tap, so music starts with the first tap or key press.
- Sound pauses when the game is in a background tab.
- Story pages read themselves aloud when they open. **Read aloud** replays them; **Stop reading** stops them.
- While a line plays, the speaker's portrait bobs and their words warm in colour. With reduced motion, the portrait only glows.

## Mixing

Music ducks about 8 dB and ambience about 5 dB while a voice speaks. Stingers duck the music further.
A gentle limiter on the master output keeps stacked sounds from clipping.

| Asset | Loudness target |
| --- | --- |
| Map, story and title music | −18 LUFS |
| Review music | −20 LUFS |
| Thinking music | −21 LUFS |
| Voices | −17 LUFS |
| Effects | −18 LUFS; clips under a second are set by peak |
| Ambience beds; scattered sounds | −28 LUFS; −27 LUFS |

Default levels are in [Tuning values](systems.md#tuning-values).

## Making and changing audio

Generation uses OpenRouter with `OPENROUTER_API_KEY_WITH_BUDGET`. Raw takes stay in `audio/raw/`, which is never committed.

```bash
node scripts/audio/generate-music.mjs map-r1        # Lyria 3 Pro: one more take
node scripts/audio/review-music.mjs map-r1-3        # an audio model listens and writes notes
node scripts/audio/generate-sfx.mjs --takes 3 hit   # Seed Audio effects and ambience
node scripts/audio/review-sfx.mjs hit               # compares the takes
node scripts/audio/generate-voices.mjs              # records new or changed lines, checks each by transcript
node scripts/audio/process-audio.mjs                # trims, levels, encodes, writes the manifest
```

Choose takes in `audio/music.json` (`take`, optional `trim`) and `audio/sfx-choices.json`. Voices choose themselves: the first take whose transcript matches the line.
If a voice keeps rewording a line, add a spoken spelling under `say` in `audio/voices.json`. The text on screen never changes.

**Choosing takes.** An audio model's notes are a starting point, not a verdict; it sometimes describes sounds that are not there.
Check its picks against measurements: hit counts for clicks, steadiness for beds, and peak level so a near-silent take is never boosted into hiss.

## Cost and size

The first full set cost $8.24 of OpenRouter credit.

| Work | Cost |
| --- | --- |
| 45 music takes | About $3.60 |
| 153 effect and ambience takes | About $2.60 |
| Voices, with transcript checks | About $0.50 |
| Listening reviews | About $1.50 |

Shipped audio is about 57 MB: music 45 MB, voices 8 MB, ambience 3 MB, effects 0.6 MB.
Music streams one track at a time, and voices load per line, so a session downloads only what it plays.
