import puzzles from './region2AmbushPuzzles.json';
import type { AmbushDef } from './ambush';

export const TWO_AT_ONCE: AmbushDef = {
  id: 'r2-two-at-once', kind: 'ambush', title: 'Two at once', theme: 'Double check', tag: 'doubleCheck', reward: 20,
  bonuses: [{ kind: 'clean', gold: 5 }, { kind: 'noHint', gold: 5 }],
  before: [
    'Four bandit squads block the Kingsroad. Behind them hangs one of the old army’s banners.',
    'Their lookout laughs. “One king, four tolls. Count your coins.”',
    'Find the double checks. Break each wave, then take the banner home.',
  ],
  after: ['The last lookout drops his ledger. The road is yours.', 'Your companion lifts the stolen banner. “One less toll.”'],
  showLines: {
    n: 'One hop, two checks! Move the knight so it checks and uncovers the rook. Their king has no escape.',
    b: 'The knight hides a rook’s line. Move it to give two checks at once. This time, there is no escape.',
    r: 'Clear the rook’s line. Let the knight check too. Two checks, and nowhere for their king to go.',
  },
  show: puzzles[0],
  waves: [
    { main: puzzles[1], backup: puzzles[2], line: 'Clear a line and give two checks at once.' },
    { main: puzzles[3], backup: puzzles[4], line: 'Two checks make the king move. Find the finish.' },
    { main: puzzles[5], backup: puzzles[6], line: 'Check with two pieces, then collect what they leave behind.' },
    { main: puzzles[7], backup: puzzles[8], line: 'Check your king’s safety, then find two checks and a mate.' },
  ],
};
