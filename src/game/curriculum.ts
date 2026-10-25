import finalePuzzles from './course/finalePuzzles.json';
import { finaleSeeds, finaleRegion } from './course/finale';
import originalPuzzles from './curriculumPuzzles.json';
import region5Puzzles from './course/region5Puzzles.json';
import { region5Seeds, region5Region } from './course/region5';
import region4Puzzles from './course/region4Puzzles.json';
import { region4Seeds, region4Region } from './course/region4';
import region3Puzzles from './course/region3Puzzles.json';
import { region3Seeds, region3Region } from './course/region3';
const puzzles = { ...originalPuzzles, ...region3Puzzles, ...region4Puzzles, ...region5Puzzles, ...finalePuzzles };
import type { AmbushDef, AmbushPuzzle } from './ambush';

export interface CourseLesson extends AmbushDef {
  regionId: string;
  objective: string;
  takeaway: string;
  review: boolean;
}

export interface CourseRegion {
  kind?: 'finale';
  mapArt?: string;
  id: string;
  title: string;
  subtitle: string;
  town: string;
  bossName: string;
  intro: string;
  outro: string;
  lessons: string[];
}

export type LessonSeed = Pick<CourseLesson, 'id' | 'title' | 'theme' | 'tag' | 'objective' | 'takeaway'> & {
  before: string;
  after: string;
  coaching: string;
  demo: string;
  review?: boolean;
};

const originalSeeds: LessonSeed[] = [
  {
    id: 'r1-loose-pieces', title: 'Loose at the ferry', theme: 'Loose pieces', tag: 'hangingPiece',
    objective: 'Find pieces you can capture safely. Check their reply before your next move.',
    takeaway: 'Look for unprotected pieces. After taking one, look again: your opponent still gets a move.',
    before: 'Goblins have taken the ferry. Their stolen supplies lie scattered across the bank.',
    after: 'The ferry is free. A goblin counts his empty pockets twice.',
    demo: 'The bishop can take the loose queen. Then it stops the pawn by capturing it too.',
    coaching: 'Look for a loose piece. After the reply, check what you can capture safely.',
  },
  {
    id: 'r1-safe-captures', title: 'Count before crossing', theme: 'Safe captures', tag: 'hangingPiece',
    objective: 'Look beyond the first capture. Count what you win and what their reply takes.',
    takeaway: 'A good capture includes the reply. Count the pieces gained and lost before choosing.',
    before: 'A goblin on the bridge offers a trade. “One shiny piece for all your shiny pieces!”',
    after: 'You cross the bridge. The goblin checks his sums.',
    demo: 'Take the loose queen. Their rook captures with check, but your king can safely take that rook.',
    coaching: 'Count the trade. What can they capture, and what can you take back?',
  },
  {
    id: 'r1-answer-check', title: 'Keep the crown safe', theme: 'Answer a check', tag: 'hangingPiece',
    objective: 'Answer check first. Look for a safe capture of the checking piece.',
    takeaway: 'When checked, protect your king first. Capturing the checking piece is one possible answer.',
    before: 'The marsh lookout points at your crown. “Got you!” Your companion studies the board.',
    after: 'Your king is safe. The lookout lowers his pointing finger.',
    demo: 'Their queen gives check. Capture it with your queen, then capture the rook that checks next.',
    coaching: 'Your king is in check. Can you capture the checking piece safely?',
  },
  {
    id: 'r1-back-rank', title: 'No room to run', theme: 'Back-rank mate', tag: 'backRankMate',
    objective: 'Find checkmate against a king trapped behind its own pieces.',
    takeaway: 'A king needs escape squares. A rook can mate along the back rank when those squares are blocked.',
    before: 'The gate guards bolt every door. “Nobody gets out!” That includes their king.',
    after: 'The gate swings open. Your companion counts the escape squares one last time.',
    demo: 'The pawns block their king’s escape. Move the rook onto the back rank for checkmate.',
    coaching: 'Check the king’s escape squares. Can your rook reach the back rank?',
  },
  {
    id: 'r1-promotion', title: 'One small step', theme: 'Promotion', tag: 'promotion',
    objective: 'Move a pawn to the final rank and choose a piece that gives checkmate.',
    takeaway: 'A pawn promotes on the final rank. Choose the new piece carefully; here a queen delivers mate.',
    before: 'One small pawn reaches the far bank. Grubnak’s guards forgot to watch the little ones.',
    after: 'The smallest traveller opens the biggest gate.',
    demo: 'Push the pawn to the final rank. Choose a queen: its new lines give checkmate.',
    coaching: 'Look for a pawn one step from promotion. Which new piece gives checkmate?',
  },
  {
    id: 'r1-bog-review', title: 'Grubnak’s last stand', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Use what you learned. The next position will not name its tactic.',
    takeaway: 'Check your king’s safety, scan forcing moves, and consider the reply. Recognize the idea before moving.',
    before: '“Grubnak keeps the crown!” The chief spreads four boards across the pantry table.',
    after: 'Saffron steps out of the pantry. “About time. The Kingsroad needs us next.”',
    demo: 'Scan checks, captures and threats. Compare your move with their strongest reply.',
    coaching: 'Look at the whole board. Keep your king safe and consider their reply.',
  },
  {
    id: 'r2-knight-forks', title: 'A fork in the road', theme: 'Knight forks', tag: 'fork',
    objective: 'Use a knight to attack the king and another piece at the same time.',
    takeaway: 'A fork attacks two targets. A check makes the king answer while the second target waits.',
    before: 'Two bandits guard the crossing. Sir Hob grins. “One hop ought to do it.”',
    after: 'The crossing is yours. The bandits take separate roads home.',
    demo: 'Check with the knight while attacking the rook. When the king moves, take the rook.',
    coaching: 'Find a knight check that also attacks another piece. Then collect that second target.',
  },
  {
    id: 'r2-double-attacks', title: 'Two roads, one queen', theme: 'Queen double attacks', tag: 'fork',
    objective: 'Find a queen check that also attacks a second target.',
    takeaway: 'Forks are not just for knights. A queen can check on one line and attack a piece on another.',
    before: 'The toll keeper has two strongboxes. He only brought one lock.',
    after: 'The toll keeper closes his ledger. “A small accounting error.”',
    demo: 'Check with the queen while attacking the rook. After the king moves, take the rook.',
    coaching: 'Look for a queen check with a second target on another line.',
  },
  {
    id: 'r2-two-at-once', title: 'Two at once', theme: 'Double check', tag: 'doubleCheck',
    objective: 'Uncover one checking piece while moving another into check.',
    takeaway: 'Double check attacks the king with two pieces. The king must move; then look for the finish.',
    before: 'A stolen banner hangs above the road. “Two tolls today,” calls the lookout.',
    after: 'Your companion lifts the banner. “One less toll.”',
    demo: 'Move the knight to check and uncover the rook. Two pieces check at once, with no escape.',
    coaching: 'Clear a line and give two checks at once. After the king moves, find the finish.',
  },
  {
    id: 'r2-remove-defender', title: 'Who guards the guard?', theme: 'Removing defenders', tag: 'capturingDefender',
    objective: 'Remove a defender, then capture the piece it was guarding.',
    takeaway: 'Before attacking a protected piece, look at its defender. An exchange can leave the target unprotected.',
    before: 'The banner guard hides behind another guard. Old Brick looks past the first shield.',
    after: 'The last guard leaves his post. Another banner comes home.',
    demo: 'Exchange queens to remove the knight’s defender. After the pawn recaptures, your bishop can take the knight.',
    coaching: 'Which piece guards your target? Look for an exchange that removes that defender.',
  },
  {
    id: 'r2-mate-in-two', title: 'One move ahead', theme: 'Mate in two', tag: 'mateIn2',
    objective: 'Plan your first check, their reply, and the move that gives checkmate.',
    takeaway: 'Calculate the reply before giving check. The strongest check leaves a mating finish.',
    before: 'Ashfang’s lookout counts your next move. Your companion counts one further.',
    after: 'The lookout folds his spyglass. The final gate is ahead.',
    demo: 'Check with the queen to move their king. Then follow it with a queen move that gives checkmate.',
    coaching: 'Find a check, picture their reply, and look for checkmate on your next move.',
  },
  {
    id: 'r2-road-review', title: 'Ashfang’s reckoning', theme: 'Mixed review', tag: 'mixed', review: true,
    objective: 'Read each fresh position and choose the idea it needs.',
    takeaway: 'Use checks, captures and threats together. Choose a tactic because the position supports it.',
    before: 'Ashfang sets down the last banners. “Four boards. Let us settle the account.”',
    after: 'Tadwell gathers the banners. Ashfang’s purse spills open: among the coins lies a dark crystal.',
    demo: 'Start with your king’s safety. Look for forcing moves, then calculate the reply.',
    coaching: 'Read the board. What changes after their strongest reply?',
  },
];

const seeds = [...originalSeeds, ...region3Seeds, ...region4Seeds, ...region5Seeds, ...finaleSeeds];

/** Source positions and published lines are unchanged. Difficulty changes assistance, not the chess. */
export const COURSE_LESSONS: CourseLesson[] = seeds.map(seed => {
  const selected: AmbushPuzzle[] = puzzles[seed.id as keyof typeof puzzles];
  return {
    ...seed, regionId: seed.id.split('-')[0], review: seed.review ?? false,
    kind: 'ambush', reward: 0, bonuses: [], before: [seed.before], after: [seed.after],
    show: selected[0],
    showLines: { n: seed.demo, b: seed.demo, r: seed.demo },
    waves: Array.from({ length: (selected.length - 1) / 2 }, (_, wave) => ({
      main: selected[wave * 2 + 1], backup: selected[wave * 2 + 2], line: seed.coaching,
    })),
  };
});

export const COURSE_REGIONS: CourseRegion[] = [
  {
    id: 'r1', title: 'The Bog', subtitle: 'Keep your king safe. Spot what is loose.', town: 'Mudford Town',
    bossName: 'Grubnak, the Toad Chief',
    intro: 'Goblins have blocked the marsh roads. Learn to spot their mistakes and bring Saffron home.',
    outro: 'The Bog is free. Saffron points toward the Kingsroad, where bandits have stolen the old army’s banners.',
    lessons: seeds.filter(s => s.id.startsWith('r1-')).map(s => s.id),
  },
  {
    id: 'r2', mapArt: 'map-region2', title: 'The Kingsroad', subtitle: 'Find two threats. Think one move further.', town: 'Waymeet',
    bossName: 'Ashfang, the Bandit Lord',
    intro: 'Bandit Riders demand tolls at every crossing. Recover the banners by seeing more than one threat.',
    outro: 'The banners are safe. Tadwell joins the journey. The paymaster’s crystal points toward the Shadow Cult; follow it to the bound villages.',
    lessons: seeds.filter(s => s.id.startsWith('r2-')).map(s => s.id),
  },
  region3Region,
  region4Region,
  region5Region,
  finaleRegion,
];

export const courseLesson = (id: string): CourseLesson | undefined => COURSE_LESSONS.find(lesson => lesson.id === id);
export const courseRegion = (id: string): CourseRegion | undefined => COURSE_REGIONS.find(region => region.id === id);
