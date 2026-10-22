import type { PieceSymbol } from 'chess.js';
import type Phaser from 'phaser';
import { STARTERS, addCharacter, assignCharacters } from './game/campaign';
import { bossFen } from './game/boss';
import { R1_BOSS, R1_BOSS_ARMY, R1_HERO } from './game/region1Boss';
import { bonusMet, bonusText, type BattleDef, type Line } from './game/content';
import { DIFFICULTIES } from './game/difficulty';
import type { Exercise } from './game/academy';
import { lossCost, recordLoss, recordWin, type Payout } from './game/economy';
import { objectiveText } from './game/scenarios';
import { persist, save } from './save';
import type { BattleLaunch } from './scenes/Battle';
import { esc, showModal, type ModalButton } from './ui/overlay';
import { goTo } from './ui/screen';
import { REVIEW_SLOT } from './ui/reviewText';
import { FRAMING, SPECIES, pieceName } from './ui/speaker';

/**
 * Campaign flow between screens: battle briefings, launching battles with your
 * named characters, and what a win or a loss does to the save.
 */

const base = import.meta.env.BASE_URL;

/** Inline CSS that frames a figurine's head in a small portrait. */
export function portraitStyle(type: PieceSymbol, side: 'ally' | 'bog') {
  const f = FRAMING[type] ?? { size: 1.3, x: 0.5, y: 0.04 };
  return `background-image:url('${base}sprites/${pieceName(type)}-${side}.webp');background-size:${f.size * 100}%;background-position:${f.x * 100}% ${f.y * 100}%`;
}

interface Voice {
  name: string;
  type: PieceSymbol | null;
  side: 'ally' | 'bog';
}

function voice(line: Line, def: BattleDef | null): Voice {
  const s = save();
  switch (line.who) {
    case 'companion':
      return { name: `${STARTERS[s.starter].name} · ${STARTERS[s.starter].species}`, type: s.starter, side: 'ally' };
    case 'enemy':
      return { name: def?.enemy.name ?? 'Bog Goblin', type: 'p', side: 'bog' };
    case 'chief':
      return { name: 'Grubnak, the Toad Chief', type: 'k', side: 'bog' };
    case 'hero':
      return { name: 'Saffron · Fox Sorceress', type: 'q', side: 'ally' };
    case 'narrator':
      return { name: '', type: null, side: 'ally' };
  }
}

/** A short script of dialogue lines with little portraits. */
export function dialogueHtml(lines: Line[], def: BattleDef | null): string {
  return lines
    .map((l) => {
      const v = voice(l, def);
      if (!v.type) return `<p class="muted"><em>${esc(l.text)}</em></p>`;
      return `<div class="dlg ${v.side === 'ally' ? 'ally' : 'foe'}">
        <div class="dlg-pic" style="${portraitStyle(v.type, v.side)}"></div>
        <div><p class="who ${v.side === 'ally' ? '' : 'foe'}">${esc(v.name)}</p><p>${esc(l.text)}</p></div>
      </div>`;
    })
    .join('');
}

function bonusesHtml(def: BattleDef) {
  return `<ul class="goals">${def.bonuses.map((b) => `<li>☆ ${esc(bonusText(b))} <span class="gold">+${b.gold}g</span></li>`).join('')}</ul>`;
}

/** The pre-battle card: story, goal, bonus goals and reward. */
export function briefBattle(scene: Phaser.Scene, def: BattleDef) {
  showModal({
    eyebrow: `${def.kind === 'boss' ? 'Boss duel' : def.kind} · ${def.theme}`,
    title: def.title,
    wide: true,
    html: `
      <p>${esc(def.intro)}</p>
      ${dialogueHtml(def.before, def)}
      <p class="goal"><strong>Goal:</strong> ${esc(objectiveText(def.objective))}</p>
      ${bonusesHtml(def)}
      <p class="muted">Reward: <span class="gold">${def.reward}g</span> for a win.</p>`,
    buttons: [
      { label: 'To battle!', kind: 'primary', onClick: () => launchBattle(scene, def) },
      { label: 'Not yet', kind: 'ghost', onClick: () => {} },
    ],
    onDismiss: () => {},
  });
}

export interface LaunchOpts {
  /** Named characters by square (defaults to your roster placed into the lineup). */
  names?: Record<string, string>;
  /** Extra HTML after a win, after the payout (e.g. a hero joining). Runs once per win. */
  onWin?: () => string;
  winButton?: string;
}

export function launchBattle(scene: Phaser.Scene, def: BattleDef, opts: LaunchOpts = {}) {
  const s = save();
  const startRewinds = DIFFICULTIES[s.difficulty].rewinds;
  const launch: BattleLaunch = {
    scenario: def,
    faction: 'bog',
    difficulty: s.difficulty,
    eyebrow: `${def.region} · ${DIFFICULTIES[s.difficulty].label}`,
    names: opts.names ?? assignCharacters(def.fen, s.roster),
    shouts: def.shouts,
    tip: { type: s.starter, name: STARTERS[s.starter].name, line: def.tip },
    exit: () => goTo(scene.game, 'map'),
    tacticGold: true,
    finish: (b, actions, extra) => {
      const won = b.status === 'won';
      const stats = { won, piecesLost: b.piecesLost, playerMoves: b.playerMoves, rewindsUsed: startRewinds - b.rewindsLeft };
      const buttons: ModalButton[] = [];
      let html = `<p>${esc(b.reason)}</p>`;
      // One charge per defeat, however it's accepted (retry, retreat, or restart/leave from the top bar).
      let charged = false;
      const recordAcceptedLoss = () => {
        if (charged) return;
        charged = true;
        recordLoss(s, def.id);
        persist();
      };
      if (won) {
        const pay = recordWin(s, def, stats, extra.tacticGold);
        persist();
        html += payoutHtml(def, stats, pay, s.gold);
        html += REVIEW_SLOT;
        html += dialogueHtml(def.after, def);
        if (opts.onWin) html += opts.onWin();
        buttons.push({ label: opts.winButton ?? 'Back to the map', kind: 'primary', onClick: () => goTo(scene.game, 'map') });
        buttons.push({ label: 'Replay', onClick: actions.retry });
      } else {
        html += REVIEW_SLOT;
        // Accepting the defeat (retry or retreat) costs gold on harder difficulties; a rewind doesn't.
        const cost = lossCost(s.difficulty, s.gold);
        const accept = () => recordAcceptedLoss();
        html += cost > 0
          ? `<p class="loss">Accepting this defeat costs ${cost}g (a tenth of your gold on ${esc(DIFFICULTIES[s.difficulty].label)}).${actions.rewind ? ' A rewind costs nothing.' : ''}</p>`
          : '<p class="muted">On Squire a defeat costs nothing. Every captured piece comes back.</p>';
        if (actions.rewind) buttons.push({ label: `⟲ Rewind (${b.rewindsLeft} left)`, kind: 'primary', onClick: actions.rewind });
        buttons.push({
          label: 'Retry',
          kind: actions.rewind ? 'normal' : 'primary',
          onClick: () => {
            accept();
            actions.retry();
          },
        });
        buttons.push({
          label: 'Retreat to the map',
          kind: 'ghost',
          onClick: () => {
            accept();
            goTo(scene.game, 'map');
          },
        });
      }
      return {
        eyebrow: won ? 'Victory' : 'Defeat',
        title: won ? 'The day is yours!' : 'The line breaks…',
        html,
        buttons,
        // Leaving or restarting from the top bar accepts a defeat too (so its cost can't be skipped).
        onAbandon: won ? undefined : () => recordAcceptedLoss(),
      };
    },
  };
  goTo(scene.game, 'battle', launch);
}

export const speciesName = (t: PieceSymbol) => SPECIES[t];

/** What a win paid, line by line, including bonus goals already earned on an earlier win. */
function payoutHtml(def: BattleDef, stats: { won: boolean; piecesLost: number; playerMoves: number; rewindsUsed: number }, pay: Payout, gold: number) {
  const rows: string[] = [];
  rows.push(pay.reward ? `<p class="bonus got">Victory reward <span class="gold">+${pay.reward}g</span></p>` : '<p class="bonus">Victory reward already collected</p>');
  for (const x of def.bonuses) {
    const got = bonusMet(x, stats);
    const paid = pay.bonuses.some((p) => p.kind === x.kind);
    rows.push(
      `<p class="bonus ${got ? 'got' : ''}">${got ? '★' : '☆'} ${esc(bonusText(x))} ${paid ? `<span class="gold">+${x.gold}g</span>` : got ? '(already earned)' : ''}</p>`,
    );
  }
  if (pay.tactics) rows.push(`<p class="bonus got">Tactic bonus <span class="gold">+${pay.tactics}g</span></p>`);
  rows.push(`<p>You now have <span class="gold">${gold}g</span>.</p>`);
  return rows.join('');
}

/** The Goblin Chief's duel with the army you picked (character ids from your roster). */
export function launchBoss(scene: Phaser.Scene, chosenIds: string[]) {
  const s = save();
  const chosen = s.roster.filter((c) => chosenIds.includes(c.id));
  const fen = bossFen(
    chosen.map((c) => c.type),
    R1_BOSS_ARMY,
  );
  const def: BattleDef = { ...R1_BOSS, fen };
  launchBattle(scene, def, {
    names: assignCharacters(fen, chosen),
    winButton: s.heroJoined ? 'Back to the map' : 'Welcome, Saffron!',
    onWin: () => {
      s.bossBeaten = true;
      let html = '';
      if (!s.heroJoined) {
        s.heroJoined = true;
        addCharacter(s, R1_HERO.type, 'hero', R1_HERO.name);
        html = `<h3 class="hero-h">A new companion!</h3>${dialogueHtml(R1_HERO.lines, def)}`;
      }
      persist();
      return html;
    },
  });
}

/** Academy practice: rook and queen mates against a lone king that defends perfectly. */
export function launchExercise(scene: Phaser.Scene, ex: Exercise) {
  const s = save();
  const launch: BattleLaunch = {
    scenario: ex,
    faction: 'bog',
    difficulty: s.difficulty,
    eyebrow: 'Academy · practice',
    exitLabel: 'Town',
    practice: true,
    ai: { depth: 8, multiPv: 1, maxLoss: 0 },
    tip: { type: 'b', name: 'Sage Ollie', line: ex.steps[0] },
    exit: () => goTo(scene.game, 'town', { tab: 'academy' }),
    finish: (b, actions) => {
      const won = b.status === 'won';
      let note = won ? '' : REVIEW_SLOT;
      if (won && !s.lessonsDone.includes(ex.id)) {
        s.lessonsDone.push(ex.id);
        s.gold += ex.reward;
        persist();
        note = `<p class="bonus got">First clear <span class="gold">+${ex.reward}g</span></p>`;
      }
      const buttons: ModalButton[] = won
        ? [
            { label: 'Back to the academy', kind: 'primary', onClick: () => goTo(scene.game, 'town', { tab: 'academy' }) },
            { label: 'Again', onClick: actions.retry },
          ]
        : [
            ...(actions.rewind ? [{ label: '⟲ Undo', kind: 'primary' as const, onClick: actions.rewind }] : []),
            { label: 'Start over', onClick: actions.retry },
            { label: 'Back to the academy', kind: 'ghost', onClick: () => goTo(scene.game, 'town', { tab: 'academy' }) },
          ];
      return {
        eyebrow: won ? 'Lesson learned' : 'Not yet',
        title: won ? 'Checkmate!' : 'Try again',
        html: `<p>${esc(b.reason)}</p>${note}${won ? '<p class="muted">The method works from any position. Next time a battle leaves you with a rook or a queen, you know the way home.</p>' : ''}`,
        buttons,
      };
    },
  };
  goTo(scene.game, 'battle', launch);
}
