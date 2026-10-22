import { DIFFICULTIES, type DifficultyId } from '../game/difficulty';
import { getSave } from '../save';
import { closeModal, esc, showModal } from '../ui/overlay';
import { BaseScene } from '../ui/screen';
import { CSS, SERIF } from '../ui/theme';
import { button, coverImage } from '../ui/widgets';

/** What losing a battle costs on each difficulty (see the design doc's Campaign section). */
export const LOSS_TEXT: Record<DifficultyId, string> = {
  squire: 'Losing a battle costs nothing.',
  knight: 'Losing a battle costs a tenth of your gold.',
  champion: 'Losing a battle costs a quarter of your gold.',
  grandmaster: 'Losing costs a quarter of your gold, and the battle is gone.',
};

export class TitleScene extends BaseScene {
  constructor() {
    super('title');
  }

  protected build() {
    coverImage(this, 'bg-title', 0.3);
    const cx = this.W / 2;
    const cy = this.H * 0.38;
    const size = Math.min(84, this.W / 6);
    this.text(cx, cy - size * 0.55, 'Pawnshire', {
      fontFamily: SERIF,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      color: CSS.gold,
      stroke: '#1a0f08',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 14, fill: true, stroke: true },
    }).setOrigin(0.5);
    this.text(cx, cy + size * 0.2, 'A storybook chess tactics RPG', {
      fontFamily: SERIF,
      fontSize: '20px',
      fontStyle: 'italic',
      stroke: '#1a0f08',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const saved = getSave();
    let y = cy + size * 0.2 + 48;
    if (saved) {
      button(this, cx - 120, y, 'Continue', { w: 240, h: 50, kind: 'primary', fontSize: 18, onClick: () => this.scene.start('map') });
      y += 62;
      button(this, cx - 120, y, 'New game', { w: 240, h: 44, onClick: () => this.confirmNew() });
    } else {
      button(this, cx - 120, y, 'Begin', { w: 240, h: 50, kind: 'primary', fontSize: 18, onClick: () => this.askMoves() });
    }
    this.text(cx, this.H - 18 - this.safe.bottom, 'The rules of chess never change on the board.', {
      fontFamily: SERIF,
      fontSize: '14px',
      fontStyle: 'italic',
      color: CSS.muted,
    }).setOrigin(0.5, 1);
  }

  private confirmNew() {
    showModal({
      title: 'Start over?',
      html: '<p>This replaces your current campaign: your army, gold and cleared battles.</p>',
      buttons: [
        { label: 'Start a new campaign', kind: 'primary', onClick: () => this.askMoves() },
        { label: 'Keep my campaign', kind: 'ghost', onClick: () => {} },
      ],
      onDismiss: () => {},
    });
  }

  private askMoves() {
    showModal({
      eyebrow: 'Before we begin',
      title: 'Do you know how the pieces move?',
      html: '<p>Pawnshire is for players who know the moves and want to get sharper at tactics.</p>',
      buttons: [
        { label: 'Yes, I know the moves', kind: 'primary', onClick: () => this.askDifficulty(true) },
        { label: 'No, teach me', onClick: () => this.noTutorialYet() },
      ],
      onDismiss: () => {},
    });
  }

  private noTutorialYet() {
    showModal({
      title: 'Teach me the moves',
      html: `<p>The “Teach me the moves” tutorial isn’t in this early build yet.</p>
        <p class="muted">Lichess’s free <a href="https://lichess.org/learn" target="_blank" rel="noopener" style="color:var(--gold)">Learn</a> lessons teach every piece in about twenty minutes. You can still play now: every battle comes with a short lesson.</p>`,
      buttons: [
        { label: 'Play anyway', kind: 'primary', onClick: () => this.askDifficulty(false) },
        { label: 'Back', kind: 'ghost', onClick: () => this.askMoves() },
      ],
      onDismiss: () => {},
    });
  }

  private askDifficulty(knowsMoves: boolean) {
    const ids: DifficultyId[] = ['squire', 'knight'];
    showModal({
      eyebrow: 'Difficulty',
      title: 'How hard should the goblins fight?',
      html: `<div class="choice-grid">${ids
        .map((id) => {
          const d = DIFFICULTIES[id];
          return `<button class="choice" data-d="${id}"><strong>${esc(d.label)}</strong><span>${esc(d.blurb)} ${esc(LOSS_TEXT[id])}</span></button>`;
        })
        .join('')}</div>`,
      buttons: [{ label: 'Back', kind: 'ghost', onClick: () => this.askMoves() }],
      onDismiss: () => {},
    });
    for (const el of document.querySelectorAll<HTMLButtonElement>('.choice[data-d]')) {
      el.addEventListener('click', () => {
        closeModal();
        this.scene.start('starter', { difficulty: el.dataset.d as DifficultyId, knowsMoves });
      });
    }
  }
}
