import { canAdd, checkArmy, suggestArmy } from '../game/boss';
import type { HireType } from '../game/economy';
import { PIECE_VALUE } from '../game/material';
import { R1_BOSS_ARMY, R1_BOSS_BUDGET } from '../game/region1Boss';
import { launchBoss } from '../flow';
import { save } from '../save';
import { BaseScene } from '../ui/screen';
import { SPECIES, pieceName } from '../ui/speaker';
import { C, CSS, SANS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow, panel, para } from '../ui/widgets';

/** Before the boss duel: pick your army from the pieces you own, up to the points budget. */
export class MusterScene extends BaseScene {
  private chosen = new Set<string>();

  constructor() {
    super('muster');
  }

  init() {
    this.chosen = new Set(suggestArmy(save().roster, R1_BOSS_BUDGET));
  }

  private types(): HireType[] {
    return save()
      .roster.filter((c) => this.chosen.has(c.id))
      .map((c) => c.type);
  }

  protected build() {
    const s = save();
    coverImage(this, 'bg-battle-bog', 0.45);
    const top = this.safe.top;
    const g = this.add.graphics();
    g.fillStyle(C.bg, 0.86).fillRect(0, 0, this.W, top + 54);
    g.lineStyle(1, C.line, 1).lineBetween(0, top + 54, this.W, top + 54);
    button(this, 12, top + 10, '← Map', { w: 76, h: 34, kind: 'ghost', onClick: () => this.scene.start('map') });
    eyebrow(this, 100, top + 9, 'Boss duel');
    this.text(100, top + 22, 'Muster your army', { fontFamily: SERIF, fontSize: '21px', fontStyle: 'bold' });

    const w = Math.min(640, this.W - 24);
    const x = (this.W - w) / 2;
    let y = top + 68;
    const pad = 14;
    const types = this.types();
    const check = checkArmy(types, R1_BOSS_BUDGET);
    const enemyPawns = Object.values(R1_BOSS_ARMY).filter((p) => p === 'p').length;
    const enemyPts = Object.values(R1_BOSS_ARMY).reduce((a, p) => a + PIECE_VALUE[p as HireType | 'k'], 0);
    const info = para(
      this,
      x + pad,
      y + 34,
      `Grubnak brings ${enemyPawns} squires and a frog knight (${enemyPts} points). You may bring up to ${R1_BOSS_BUDGET.points} points, and no sorceress. Your king always comes.`,
      w - pad * 2,
      14,
      CSS.muted,
    );
    this.text(x + w - pad, y + 10, `${check.points} / ${R1_BOSS_BUDGET.points} points`, {
      fontFamily: SANS,
      fontSize: '15px',
      fontStyle: 'bold',
      color: check.ok ? CSS.gold : CSS.red,
    }).setOrigin(1, 0);
    const h = info.height + 46;
    panel(this, x, y, w, h).setDepth(-1);
    this.text(x + pad, y + 10, 'Grubnak’s rules', { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold' });
    y += h + 10;

    // Your pieces as toggles.
    const roster = [...s.roster].sort((a, b) => PIECE_VALUE[b.type] - PIECE_VALUE[a.type]);
    // A big army goes to two compact columns so it still fits a phone screen.
    const cols = this.W >= 560 || roster.length > 7 ? 2 : 1;
    const compact = cols === 2 && this.W < 560;
    const cw = (w - 8 * (cols - 1)) / cols;
    const ch = roster.length > 10 ? 50 : 58;
    roster.forEach((c, i) => {
      const on = this.chosen.has(c.id);
      const can = on || canAdd(types, c.type, R1_BOSS_BUDGET);
      const cx = x + (i % cols) * (cw + 8);
      const cy = y + Math.floor(i / cols) * (ch + 8);
      panel(this, cx, cy, cw, ch, { fill: on ? 0x3a3020 : C.surface, stroke: on ? C.gold : C.line, alpha: can ? 0.95 : 0.5 });
      const key = `token-${pieceName(c.type)}-ally`;
      if (this.textures.exists(key)) {
        const img = this.add.image(cx + 28, cy + ch - 6, key).setOrigin(0.5, 1);
        img.setScale(Math.min(40 / img.width, 46 / img.height)).setAlpha(can ? 1 : 0.4);
      }
      this.text(cx + 56, cy + (ch > 52 ? 9 : 5), c.name, { fontFamily: SERIF, fontSize: compact ? '15px' : '16px', fontStyle: 'bold', color: can ? CSS.ink : CSS.muted });
      this.text(cx + 56, cy + ch - 25, compact ? `${PIECE_VALUE[c.type]} pt` : `${SPECIES[c.type]} · ${PIECE_VALUE[c.type]} pt`, { fontFamily: SANS, fontSize: '12px', color: CSS.muted });
      this.text(cx + cw - 14, cy + ch / 2, on ? '✓' : can ? '+' : '', { fontFamily: SANS, fontSize: '20px', fontStyle: 'bold', color: on ? CSS.gold : CSS.muted }).setOrigin(1, 0.5);
      if (can) {
        this.add
          .zone(cx, cy, cw, ch)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .on('pointerup', () => {
            if (on) this.chosen.delete(c.id);
            else this.chosen.add(c.id);
            this.rebuild();
          });
      }
    });
    y += Math.ceil(roster.length / cols) * (ch + 8) + 6;

    const reason = check.ok ? '' : check.reason;
    if (reason) this.text(x, y, reason, { fontFamily: SANS, fontSize: '13px', color: CSS.red });
    y += reason ? 24 : 4;
    const bw = Math.min(220, (w - 8) / 2);
    button(this, x, y, 'Face Grubnak!', { w: bw, h: 46, kind: 'primary', disabled: !check.ok, onClick: () => launchBoss(this, [...this.chosen]) });
    button(this, x + bw + 8, y, 'Best fit', {
      w: Math.min(140, w - bw - 8),
      h: 46,
      onClick: () => {
        this.chosen = new Set(suggestArmy(s.roster, R1_BOSS_BUDGET));
        this.rebuild();
      },
    });
  }
}
