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

/** The first table opens the last encounter, without claiming the kingdom is free. */
export function finaleInterlude(starter: StarterType): StoryLine[] {
  return [
    { speaker: 'The Lich King', line: 'You returned after every mistake. I turned my board over.' },
    { speaker: STARTERS[starter].name, line: {
      n: 'I have landed in worse places. You can always look again.',
      b: 'A mistake is something to study, Your Majesty.',
      r: 'Set the pieces straight. Take the next step.',
    }[starter] },
    { speaker: 'The Lich King', line: 'Then sit with me. Let us finish what we began.' },
  ];
}

export function journeyEnding(starter: StarterType): StoryLine[] {
  return [
    { speaker: 'The Lich King', line: 'I have kept this crown too long. Take it home.' },
    { speaker: 'Saffron, the Fox Queen', line: 'The gates are open. Pawnshire is waiting for its king.' },
    { speaker: STARTERS[starter].name, line: {
      n: 'From the ferry to the keep. Not bad for a few hops.',
      b: 'From the Cult’s closed ledger to an open gate. There is always more to learn.',
      r: 'We held the Legion’s gate. Now we can open this one.',
    }[starter] },
  ];
}
