import { STARTERS, type StarterType } from './companions';
import { courseRegion } from './curriculum';

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
      { speaker: companion, line: { n: 'The ledger names him! A Lion King who would not accept losing.', b: 'The ledger confirms it: a Lion King who refused to accept losing.', r: 'The ledger names the old king. He would not accept losing.' }[starter] },
      { speaker: 'The Lich King', line: 'A loss is only final when one accepts it.' },
      { speaker: companion, line: { n: 'His general commands the Iron Legion. Let us bring our soldiers home!', b: 'His general commands the Iron Legion. Their loyalty has been misdirected.', r: 'The Iron Legion serves his general. We shall bring them home.' }[starter] },
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

/** Narrated openings of the finale pages. */
export const INTERLUDE_LEAD = 'The first encounter is settled. Your companion draws up a chair beside you.';
export const ENDING_LEAD = 'The Lich King accepts checkmate. The gates open, the banners rise, and the road home belongs to Pawnshire again.';

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

/** The companion's first words, shown when the player picks them. */
export const COMPANION_GREETINGS: Record<StarterType, string> = {
  n: 'Sir Hob, at your service! I hop where others can’t, and I’ll show you how one jump can hit two goblins at once.',
  b: 'Sage Ollie. I see far down the diagonals, and I’ll teach you to look before you leap. Mostly.',
  r: 'Old Brick. Slow? Yes. But nothing gets past me on an open line. Stick with me and we’ll hold.',
};

export interface IntroLine { who: 'narrator' | 'companion' | 'boss'; speaker: string; line: string }

/** Shown once, the first time a chapter's map opens. Lines describe story, never board rules. */
export function chapterIntro(regionId: string, starter: StarterType): IntroLine[] {
  const region = courseRegion(regionId);
  if (!region) return [];
  const companion: IntroLine = { who: 'companion', speaker: STARTERS[starter].name, line: region.intro };
  if (regionId === 'r1') return [
    { who: 'narrator', speaker: '', line: 'The Bog Goblins have crept out of the marsh, stealing pots, pies and the occasional village.' },
    companion,
    { who: 'boss', speaker: region.bossName, line: 'GRUBNAK HEARS YOU, LITTLE KING. Come to my camp and lose your crown in the mud!' },
  ];
  return [companion];
}
