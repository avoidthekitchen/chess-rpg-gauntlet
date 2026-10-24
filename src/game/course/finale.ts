import type { CourseRegion, LessonSeed } from '../curriculum';

/** The capstone revisits delivered skills; it introduces no new required motif. */
export const finaleSeeds: LessonSeed[] = [
  {
    id: 'finale-threshold', title: 'Across the threshold', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Choose what each board needs, using the ideas learned along the journey.',
    takeaway: 'Start with both kings. Compare forcing moves, calculate the reply, and take your time.',
    before: 'The Lich King waits inside the keep. “I have kept your crown safe. You need only leave it here.”',
    after: 'The Lich King studies the boards. “You returned after every mistake.” Your companion stays beside you as he sets one final table.',
    demo: 'Check both kings, compare your possible moves, and calculate the opponent’s strongest reply.',
    coaching: 'Read the whole board. What threatens your king, and what changes after your move?',
  },
  {
    id: 'finale-last-board', title: 'The last board', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Bring familiar ideas together. Calculate each position through its final reply.',
    takeaway: 'You can learn from a mistake and try again. The kingdom’s journey is complete; every earlier lesson remains open for practice.',
    before: 'The Lich King touches the old crown. “Once, I would not accept the board before me.” Your companion waits at your side.',
    after: '“Checkmate,” says the Lich King. He lowers his hand. “I accept it.” The crown belongs to Pawnshire again.',
    demo: 'Look at both sides’ threats. Follow each candidate through the reply before choosing.',
    coaching: 'Take your time. Check your king’s safety and calculate the strongest reply.',
  },
];

export const finaleRegion: CourseRegion = {
  id: 'finale', kind: 'finale', mapArt: 'map-finale', title: 'The Lich King',
  subtitle: 'One final table. Everything you have learned.', town: 'The Keep', bossName: 'The Lich King',
  intro: 'The keep is quiet. The former Lion King waits with the crown he could never bear to lose. Your companion enters beside you.',
  outro: 'The Lich King accepts checkmate. Pawnshire is free, and the crown is yours. Your companion stays for the road home.',
  lessons: finaleSeeds.map(seed => seed.id),
};
