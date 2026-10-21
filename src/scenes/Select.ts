import { DIFFICULTIES, type DifficultyId } from '../game/difficulty';
import { SCENARIOS, objectiveText } from '../game/scenarios';
import { store } from '../store';
import { esc } from '../ui/overlay';
import { BaseScene } from '../ui/screen';
import { C, CSS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow, panel, para } from '../ui/widgets';
import type { BattleLaunch } from './Battle';

/** Step 1 stand-in for the region map: the prototype's five battles. */
export class SelectScene extends BaseScene {
  private difficulty: DifficultyId = 'squire';

  constructor() {
    super('select');
  }

  init() {
    const d = store.get('difficulty') as DifficultyId;
    this.difficulty = d in DIFFICULTIES ? d : 'squire';
  }

  protected build() {
    coverImage(this, 'bg-title', 0.55);
    const w = Math.min(560, this.W - 24);
    const x = (this.W - w) / 2;
    let y = 24 + this.safe.top;
    eyebrow(this, x, y, 'Battle prototype');
    this.text(x, y + 14, 'The Borderlands', { fontFamily: SERIF, fontSize: '28px', fontStyle: 'bold' });
    y += 58;
    const ids: DifficultyId[] = ['squire', 'knight'];
    const bw = (w - 8) / 2;
    ids.forEach((id, i) =>
      button(this, x + i * (bw + 8), y, DIFFICULTIES[id].label, {
        w: bw,
        h: 36,
        kind: id === this.difficulty ? 'primary' : 'normal',
        onClick: () => {
          this.difficulty = id;
          store.set('difficulty', id);
          this.rebuild();
        },
      }),
    );
    y += 48;
    SCENARIOS.forEach((s, i) => {
      const t = para(this, x + 48, y + 30, s.intro, w - 64, 14, CSS.muted);
      const h = 40 + t.height + 12;
      panel(this, x, y, w, h);
      this.text(x + 16, y + 12, String(i + 1), { fontFamily: SERIF, fontSize: '22px', color: CSS.gold, fontStyle: 'bold' });
      this.text(x + 48, y + 10, s.title, { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold' });
      t.setDepth(1);
      const obj = this.text(x + w - 12, y + 13, objectiveText(s.objective), { fontSize: '12px', color: CSS.gold }).setOrigin(1, 0);
      if (obj.width > w * 0.45) obj.setVisible(false);
      const z = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerup', () => this.start(i));
      y += h + 8;
    });
    void C;
  }

  private start(i: number) {
    const s = SCENARIOS[i];
    const launch: BattleLaunch = {
      scenario: s,
      faction: 'bog',
      difficulty: this.difficulty,
      eyebrow: `${s.region} · ${DIFFICULTIES[this.difficulty].label}`,
      exit: () => this.scene.start('select'),
      finish: (b, a) => {
        const won = b.status === 'won';
        const next = SCENARIOS[i + 1];
        const buttons = [];
        if (a.rewind) buttons.push({ label: `⟲ Rewind (${b.rewindsLeft} left)`, kind: 'primary' as const, onClick: a.rewind });
        if (won && next) buttons.push({ label: `Next: ${next.title}`, kind: 'primary' as const, onClick: () => this.start(i + 1) });
        buttons.push({ label: won ? 'Replay' : 'Retry', onClick: a.retry });
        buttons.push({ label: 'Map', kind: 'ghost' as const, onClick: () => this.scene.start('select') });
        return {
          eyebrow: won ? 'Victory' : 'Defeat',
          title: won ? 'The day is yours!' : 'The line breaks…',
          html: `<p>${esc(b.reason)}</p>`,
          buttons,
        };
      },
    };
    this.scene.start('battle', launch);
  }
}
