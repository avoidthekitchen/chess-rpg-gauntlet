import type { CourseRegion, LessonSeed } from '../curriculum';

/** Original coaching; the selected companion remains the tutor throughout. */
export const region4Seeds: LessonSeed[] = [
  {
    id: 'r4-develop', title: 'Leave the barracks', theme: 'Develop with check', tag: 'opening',
    objective: 'Bring a bishop from its starting square into play with check.',
    takeaway: 'Development brings a piece into play. Here, check makes the opponent answer while your piece joins the action.',
    before: 'The cult’s records lead to the Iron Legion. General Flint has ordered the barracks shut.',
    after: 'The barracks open. One soldier quietly lowers his salute.',
    demo: 'Develop the bishop from f1 to c4 with check. After the pawn blocks on e6, capture it for checkmate.',
    coaching: 'Can a bishop leave its starting square with check? Calculate the reply before moving.',
  },
  {
    id: 'r4-file', title: 'Through the gate', theme: 'File tactics', tag: 'mate',
    objective: 'Use a clear file to bring a rook or queen into a mating attack.',
    takeaway: 'A file is a column of squares. A clear file can give a rook or queen a direct route to the king.',
    before: 'The gate captain has guarded every doorway. Your companion looks along the walls.',
    after: 'The gate captain opens his ledger. “One route overlooked.”',
    demo: 'Move the rook from e1 to e8. The knight on g7 cannot capture: it is pinned to the king by your queen.',
    coaching: 'Look along the files. Which rook or queen can reach a checking square without a piece in the way?',
  },
  {
    id: 'r4-exposed', title: 'Beyond the shields', theme: 'Exposed kings', tag: 'exposedKing',
    objective: 'Check an exposed king and count its escape squares before choosing the mating finish.',
    takeaway: 'An exposed king still has legal escapes. Check every reply; use your pieces together to close the last squares.',
    before: 'Flint’s patrol has marched ahead of its commander. The shields are pointing the wrong way.',
    after: 'The commander calls his patrol back. His voice is much quieter.',
    demo: 'Check on f8, then bring the second rook to f7 with check. When the king reaches h6, the first rook mates on h8.',
    coaching: 'Where can the king escape after your check? Look for a finish that covers every legal square.',
  },
  {
    id: 'r4-deflect', title: 'Draw the guard away', theme: 'Deflection', tag: 'deflection',
    objective: 'Offer a piece with check to draw a defender away, then take the piece it guarded.',
    takeaway: 'A defender cannot guard every square after it moves. Calculate the capture that draws it away and what you win next.',
    before: 'Remember the Cult’s pinned guards. At Flint’s armoury, a guard can move—but leaving its post has a cost.',
    after: 'The armourer puts down his spear. “That post needed watching.”',
    demo: 'Check with the rook on e8. Their rook leaves d8 to capture it, so your queen can take the queen on d2.',
    coaching: 'Which piece guards your target? Can a check draw that defender away before you take the target?',
  },
  {
    id: 'r4-between', title: 'Before taking back', theme: 'Intermediate moves', tag: 'intermezzo',
    objective: 'After an enemy capture, give a useful check before taking the capturing piece.',
    takeaway: 'You need not recapture immediately. A forcing check may improve the trade before you take back; count both sides’ captures.',
    before: 'The Legion offers a brisk exchange. Your companion remembers counting trades at the Bog’s bridge.',
    after: 'The quartermaster counts the trade again. This time, he waits for every move.',
    demo: 'Capture the knight on c6 with check before taking back on d4. That knight would otherwise recapture your queen.',
    coaching: 'Before taking back, look for a useful check. What do you gain after their reply and your recapture?',
  },
  {
    id: 'r4-defend', title: 'Hold the last gate', theme: 'Meet a mating threat', tag: 'defensiveMove',
    objective: 'Stop an existing mate-in-one threat with a capture that also wins material. Calculate the next check.',
    takeaway: 'Check their threat first. Capture the attacker or its helper, or win material while guarding the mating square.',
    before: 'The last gate is under pressure. Your companion checks the king’s safety before planning another advance.',
    after: 'The gate holds. A scout runs ahead to Flint’s command tent.',
    demo: 'Their queen threatens mate on f1. Take the rook on f7 to guard f1; after the check on d1, escape to g2.',
    coaching: 'Which capture stops their mate and wins material? Look at the attacker, its helpers, and the mating square; calculate their reply.',
  },
  {
    id: 'r4-legion-review', title: 'Flint’s decision', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Read six fresh positions and choose a move that fits each board.',
    takeaway: 'Check their threats, compare forcing moves, and calculate the reply. Let the board decide which idea you need.',
    before: 'General Flint sets out six boards. “Show me what my orders missed.”',
    after: 'Flint lowers his sword. “The Legion stands with Pawnshire.” A scout arrives: Bone Wardens gather at the border.',
    demo: 'Check both kings, compare checks and captures, and calculate the strongest reply.',
    coaching: 'Read the whole board. What threatens your king, and what changes after their reply?',
  },
];

export const region4Region: CourseRegion = {
  id: 'r4', mapArt: 'map-region4', title: 'The Iron March', subtitle: 'Bring pieces together. Meet the threat.', town: 'Flintwatch',
  bossName: 'General Flint',
  intro: 'The cult’s records name General Flint. He thinks you are too young to rule. Win the Iron Legion back.',
  outro: 'Flint joins the journey. His scouts report Bone Wardens at the border. The Lich King writes: “Loyalty is a temporary position.”',
  lessons: region4Seeds.map(seed => seed.id),
};
