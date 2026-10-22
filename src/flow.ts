import type { PieceSymbol } from 'chess.js';
import type Phaser from 'phaser';
import { STARTERS, assignCharacters } from './game/campaign';
import { bonusMet, bonusText, type BattleDef, type Line } from './game/content';
import { DIFFICULTIES } from './game/difficulty';
import { objectiveText } from './game/scenarios';
import { persist, save } from './save';
import type { BattleLaunch } from './scenes/Battle';
import { esc, showModal, type ModalButton } from './ui/overlay';
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
      return { name: 'Grubnak, the Goblin Chief', type: 'k', side: 'bog' };
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

export function launchBattle(scene: Phaser.Scene, def: BattleDef) {
  const s = save();
  const startRewinds = DIFFICULTIES[s.difficulty].rewinds;
  const launch: BattleLaunch = {
    scenario: def,
    faction: 'bog',
    difficulty: s.difficulty,
    eyebrow: `${def.region} · ${DIFFICULTIES[s.difficulty].label}`,
    names: assignCharacters(def.fen, s.roster),
    shouts: def.shouts,
    tip: { type: s.starter, name: STARTERS[s.starter].name, line: def.tip },
    exit: () => scene.scene.start('map'),
    finish: (b, actions) => {
      const won = b.status === 'won';
      const stats = { won, piecesLost: b.piecesLost, playerMoves: b.playerMoves, rewindsUsed: startRewinds - b.rewindsLeft };
      const buttons: ModalButton[] = [];
      let html = `<p>${esc(b.reason)}</p>`;
      if (won) {
        const first = !s.cleared.includes(def.id);
        if (first) s.cleared.push(def.id);
        s.battlesFought++;
        persist();
        html += def.bonuses
          .map((x) => {
            const got = bonusMet(x, stats);
            return `<p class="bonus ${got ? 'got' : ''}">${got ? '★' : '☆'} ${esc(bonusText(x))}</p>`;
          })
          .join('');
        html += dialogueHtml(def.after, def);
        buttons.push({ label: 'Back to the map', kind: 'primary', onClick: () => scene.scene.start('map') });
        buttons.push({ label: 'Replay', onClick: actions.retry });
      } else {
        if (actions.rewind) buttons.push({ label: `⟲ Rewind (${b.rewindsLeft} left)`, kind: 'primary', onClick: actions.rewind });
        buttons.push({ label: 'Retry', kind: actions.rewind ? 'normal' : 'primary', onClick: actions.retry });
        buttons.push({
          label: 'Retreat to the map',
          kind: 'ghost',
          onClick: () => {
            s.battlesFought++;
            persist();
            scene.scene.start('map');
          },
        });
      }
      return { eyebrow: won ? 'Victory' : 'Defeat', title: won ? 'The day is yours!' : 'The line breaks…', html, buttons };
    },
  };
  scene.scene.start('battle', launch);
}

export const speciesName = (t: PieceSymbol) => SPECIES[t];
