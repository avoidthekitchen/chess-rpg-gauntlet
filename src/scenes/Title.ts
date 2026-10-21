import { BaseScene } from '../ui/screen';
import { CSS, SERIF } from '../ui/theme';
import { button, coverImage } from '../ui/widgets';

export class TitleScene extends BaseScene {
  constructor() {
    super('title');
  }

  protected build() {
    coverImage(this, 'bg-title', 0.35);
    const cx = this.W / 2;
    const cy = this.H * 0.4;
    this.text(cx, cy - 40, 'Gauntlet', {
      fontFamily: SERIF,
      fontSize: `${Math.min(72, this.W / 7)}px`,
      fontStyle: 'bold',
      color: CSS.gold,
      stroke: '#1a0f08',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.text(cx, cy + 20, 'A chess tactics RPG', { fontFamily: SERIF, fontSize: '20px', fontStyle: 'italic' }).setOrigin(0.5);
    button(this, cx - 110, cy + 70, 'Play', { w: 220, h: 48, kind: 'primary', fontSize: 18, onClick: () => this.scene.start('select') });
  }
}
