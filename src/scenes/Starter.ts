import { STARTERS, type StarterType } from '../game/campaign';
import type { DifficultyId } from '../game/difficulty';
import { portraitStyle } from '../ui/portrait';
import { startCampaign } from '../save';
import { esc, showModal } from '../ui/overlay';
import { BaseScene } from '../ui/screen';
import { C, CSS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow, panel, para } from '../ui/widgets';

const GREETING: Record<StarterType, string> = {
  n: 'Sir Hob, at your service! I hop where others can’t, and I’ll show you how one jump can hit two goblins at once.',
  b: 'Sage Ollie. I see far down the diagonals, and I’ll teach you to look before you leap. Mostly.',
  r: 'Old Brick. Slow? Yes. But nothing gets past me on an open line. Stick with me and we’ll hold.',
};

const ART: Record<StarterType, string> = { n: 'knight-ally', b: 'bishop-ally', r: 'rook-ally' };

/** Pick your starter companion, Pokémon-style. */
export class StarterScene extends BaseScene {
  private difficulty: DifficultyId = 'squire';
  private knowsMoves = true;

  constructor() {
    super('starter');
  }

  init(data: { difficulty: DifficultyId; knowsMoves: boolean }) {
    this.difficulty = data.difficulty;
    this.knowsMoves = data.knowsMoves;
  }

  protected build() {
    coverImage(this, 'bg-town', 0.55);
    const top = 20 + this.safe.top;
    const cx = this.W / 2;
    eyebrow(this, cx, top, 'Choose your companion').setOrigin(0.5, 0);
    this.text(cx, top + 16, 'Who rides out with you?', { fontFamily: SERIF, fontSize: this.wide ? '30px' : '24px', fontStyle: 'bold' }).setOrigin(0.5, 0);
    this.text(cx, top + (this.wide ? 56 : 48), 'Your companion is your tutor, and comes with two mouse pawns.', {
      fontFamily: SERIF,
      fontSize: '15px',
      color: CSS.muted,
      align: 'center',
      wordWrap: { width: this.W - 32 },
    }).setOrigin(0.5, 0);

    const types: StarterType[] = ['n', 'b', 'r'];
    const y0 = top + (this.wide ? 96 : 96);
    if (this.W >= 700 && this.H >= 600) {
      const w = Math.min(260, (this.W - 64) / 3);
      const h = Math.min(440, this.H - y0 - 24);
      const x0 = cx - (w * 3 + 32) / 2;
      types.forEach((t, i) => this.tallCard(t, x0 + i * (w + 16), y0, w, h));
    } else {
      const w = Math.min(520, this.W - 24);
      const h = Math.min(150, (this.H - y0 - 16 - this.safe.bottom) / 3 - 10);
      types.forEach((t, i) => this.wideCard(t, cx - w / 2, y0 + i * (h + 10), w, h));
    }
  }

  private figure(key: string, x: number, y: number, w: number, h: number) {
    if (!this.textures.exists(key)) return;
    const img = this.add.image(x + w / 2, y + h, key).setOrigin(0.5, 1);
    img.setScale(Math.min(w / img.width, h / img.height));
  }

  private tallCard(t: StarterType, x: number, y: number, w: number, h: number) {
    const s = STARTERS[t];
    panel(this, x, y, w, h, { alpha: 0.92 });
    const artH = h * 0.55;
    this.figure(ART[t], x + 10, y + 12, w - 20, artH);
    this.text(x + 16, y + artH + 22, s.name, { fontFamily: SERIF, fontSize: '24px', fontStyle: 'bold', color: CSS.gold });
    eyebrow(this, x + 16, y + artH + 52, s.species);
    para(this, x + 16, y + artH + 70, s.blurb, w - 32, 15, CSS.ink);
    button(this, x + 16, y + h - 54, `Choose ${s.name}`, { w: w - 32, h: 40, kind: 'primary', onClick: () => this.choose(t) });
    this.add.zone(x, y, w, h - 60).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.choose(t));
  }

  private wideCard(t: StarterType, x: number, y: number, w: number, h: number) {
    const s = STARTERS[t];
    panel(this, x, y, w, h, { alpha: 0.92, accent: C.gold });
    const aw = h * 0.72;
    this.figure(ART[t], x + 10, y + 8, aw, h - 16);
    const tx = x + aw + 22;
    this.text(tx, y + 12, s.name, { fontFamily: SERIF, fontSize: '21px', fontStyle: 'bold', color: CSS.gold });
    eyebrow(this, tx, y + 40, s.species);
    para(this, tx, y + 56, s.blurb, w - aw - 36, 14, CSS.ink).setMaxLines(3);
    this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerup', () => this.choose(t));
  }

  private choose(t: StarterType) {
    const s = STARTERS[t];
    showModal({
      eyebrow: s.species,
      title: s.name,
      html: `<div class="dlg ally"><div class="dlg-pic" style="${portraitStyle(t, 'ally')}"></div><div><p>${esc(GREETING[t])}</p></div></div>`,
      buttons: [
        {
          label: `Ride out with ${s.name}`,
          kind: 'primary',
          onClick: () => {
            startCampaign(this.difficulty, t, this.knowsMoves);
            this.scene.start('map');
          },
        },
        { label: 'Choose again', kind: 'ghost', onClick: () => {} },
      ],
      onDismiss: () => {},
    });
  }
}
