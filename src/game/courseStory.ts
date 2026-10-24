import { STARTERS, type StarterType } from './campaign';

export interface StoryLine { speaker: string; line: string }
/** Chapter endings are replayable narrative; completion alone unlocks the next chapter. */
export function chapterStory(regionId: string, starter: StarterType): StoryLine[] {
  const companion = STARTERS[starter].name;
  const closing = {
    n: 'We learned a little. Let us leap a little farther.',
    b: 'Keep what you learned. The next board will ask again.',
    r: 'One sound step. Then another. We are ready.',
  }[starter];
  const chapters: Record<string, StoryLine[]> = {
    r1: [
      { speaker: 'Saffron, the Fox Queen', line: 'Out of the pantry at last. The Kingsroad needs us.' },
      { speaker: 'Grubnak, the Toad Chief', line: 'Grubnak was saving those biscuits for later.' },
      { speaker: companion, line: closing },
    ],
    r2: [
      { speaker: 'Tadwell, the Frog Captain', line: 'The banners are safe. I shall carry them home.' },
      { speaker: 'Ashfang, the Bandit Lord', line: 'That crystal? A payment from someone who never settles his losses.' },
      { speaker: 'The Lich King', line: 'A crown may change hands. A game need not end.' },
      { speaker: companion, line: 'The crystal points toward the Shadow Cult. We follow it together.' },
    ],
    r5: [
      { speaker: 'The Bone Wardens', line: 'The gate stands open. Our watch is ended.' },
      { speaker: 'The Lich King', line: 'Enter, then. I have kept the final board waiting.' },
      { speaker: companion, line: 'We have reached the keep. We face the last boards together.' },
    ],
    r4: [
      { speaker: 'General Flint', line: 'I mistook pride for duty. These banners belong to Pawnshire.' },
      { speaker: 'Tadwell, the Frog Captain', line: 'Then let us carry them together, General.' },
      { speaker: 'The Lich King', line: 'Living soldiers tire. Mine have no such weakness.' },
      { speaker: companion, line: 'The scouts found Bone Wardens at the border. We know the next road.' },
    ],
    r3: [
      { speaker: 'The Cult Leader', line: 'We promised they would lose nothing. We left them unable to move.' },
      { speaker: companion, line: 'The ledger names him. A Lion King who refused to accept checkmate.' },
      { speaker: 'The Lich King', line: 'A loss is only final when one accepts it.' },
      { speaker: companion, line: 'The Iron Legion’s general serves him. Let us bring the army home.' },
    ],
  };
  return chapters[regionId] ?? [{ speaker: companion, line: closing }];
}
