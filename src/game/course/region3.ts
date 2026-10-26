import type { CourseRegion, LessonSeed } from '../curriculum';

/** Original coaching for unchanged published positions; evidence lives beside the source pack. */
export const region3Seeds: LessonSeed[] = [
  {
    id: 'r3-pins', title: 'Held in place', theme: 'Pins', tag: 'pin',
    objective: 'Find the attacker, the pinned piece, and the piece behind it. Use that line to win material or mate.',
    takeaway: 'A king pin forbids moves that expose the king. Use that restriction to attack a pinned piece or a square it cannot defend.',
    before: 'Ashfang’s crystal leads to silent villages. “Stay where you are,” whispers a hooded guard. “Nothing need be lost.”',
    after: 'The first gate opens. Your companion points along the line.',
    demo: 'Move the rook from f6 to h6 for mate. The rook on a7 pins the g7 pawn to its king, so it cannot capture.',
    coaching: 'Trace the line through the pinned piece. As at the bridge, count the capture and the reply.',
  },
  {
    id: 'r3-escape-pins', title: 'Capture the pinning piece', theme: 'Escaping pins', tag: 'pin',
    objective: 'Escape a king pin by capturing its attacker along the pin line. Check the reply before continuing.',
    takeaway: 'Pinned does not mean frozen. A pinned piece can capture its attacker when that move leaves its king safe.',
    before: '“Your pieces must stay,” the keeper murmurs. Your companion follows the line back to its source.',
    after: 'Another binding falls away. The villagers lift their heads.',
    demo: 'The rook on h5 is pinned to its king on h7. Capture the pinning rook on h4: the king stays safe, and it is mate.',
    coaching: 'Find the piece pinning yours. Can your pinned piece capture it while keeping your king safe? Then check their reply.',
  },
  {
    id: 'r3-skewers', title: 'Behind the first target', theme: 'Skewers', tag: 'skewer',
    objective: 'Check the king along a line that also holds another enemy piece. Take that rear piece after the king moves.',
    takeaway: 'A skewer attacks the front target first. When the king escapes check, the piece behind it becomes exposed.',
    before: 'Two guards stand in a narrow doorway. “The first shall protect the second.”',
    after: 'The doorway clears. The second guard considers a wider corridor.',
    demo: 'Move the rook to b4, checking the king on d4. When the king moves to c5, take the rook behind it on h4.',
    coaching: 'Look along the king’s rank, file, and diagonals. Can a check expose another piece behind it?',
  },
  {
    id: 'r3-xrays', title: 'Through the line', theme: 'X-ray exchanges', tag: 'xRayAttack',
    objective: 'Find a rear piece whose line passes through an enemy blocker. Calculate the exchange that opens that line.',
    takeaway: 'An x-ray follows a line through a blocker. When that blocker recaptures, a piece behind it may capture in turn.',
    before: 'A crystal glints behind the guards. Your companion studies the whole line.',
    after: 'The crystal goes dark. The pieces behind the guards mattered too.',
    demo: 'Check on d8 with the rook from d1. Their rook on b8 captures it; your rook on a8 then recaptures on d8 for mate.',
    coaching: 'Look through the blocker to your rear piece. Like removing a defender, calculate what changes after the exchange.',
  },
  {
    id: 'r3-discoveries', title: 'The hidden attacker', theme: 'Discovered attacks', tag: 'discoveredAttack',
    objective: 'Give check with one piece while uncovering another piece’s attack. After the reply, collect the exposed target.',
    takeaway: 'A discovery moves a blocker away from a bishop, rook, or queen. Check can buy time for the uncovered attack.',
    before: 'A curtain stirs beside the ledger room. “Nothing waits behind it,” says the guard.',
    after: 'The curtain falls. Your companion smiles at the newly opened line.',
    demo: 'Push the pawn from f3 to f4 with check. It clears the rook on h3; after the king moves, capture the rook on b3.',
    coaching: 'Look for two threats, as on the Kingsroad. Which checking move uncovers an attack from another piece?',
  },
  {
    id: 'r3-double-check', title: 'Two checks, seen again', theme: 'Double check revisited', tag: 'doubleCheck',
    objective: 'Uncover a checking line while giving check with the moving piece. Calculate the king’s reply and the finish.',
    takeaway: 'Double check combines a discovery with another check. The king must move; your next move may win material or mate.',
    before: 'The ledger keeper raises two seals. Your companion remembers the Kingsroad’s double toll.',
    after: 'Both seals fall. Only the leader’s ledger remains closed.',
    demo: 'Move the knight from e7 to c6. It checks and uncovers the rook on h7. After the king moves to a6, rook a7 is mate.',
    coaching: 'Remember Two at once. Identify both checking pieces, then calculate the king’s reply and your finish.',
  },
  {
    id: 'r3-cult-review', title: 'The sealed ledger', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Use what you’ve learned to find the best move.',
    takeaway: 'Check your king, inspect forcing moves, and calculate the reply. Follow the whole line before choosing.',
    before: 'The Cult Leader rests a hand on the ledger. “Leave it closed. Keep your crown.”',
    after: 'The last seal breaks. Your companion opens the ledger.',
    demo: 'Check your king’s safety. Compare checks, captures, and threats, then calculate the reply.',
    coaching: 'Read the whole board. What changes after the strongest reply?',
  },
];

export const region3Region: CourseRegion = {
  id: 'r3', title: 'Shadow Cult', subtitle: 'Follow the line. Break the binding.', town: 'Bound villages',
  bossName: 'The Cult Leader', mapArt: 'map-region3',
  intro: 'Ashfang’s crystal leads to villages held by the Shadow Cult. Their keepers promise nobody will ever lose again.',
  outro: 'The village doors open. A name in the ledger points toward the Iron Legion.',
  lessons: region3Seeds.map(lesson => lesson.id),
};
