import type Phaser from 'phaser';
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
    this.scroll = 0;
    this.chosen = new Set(suggestArmy(save().roster, R1_BOSS_BUDGET));
  }

  private types(): HireType[] {
    return save()
      .roster.filter((c) => this.chosen.has(c.id))
      .map((c) => c.type);
  }

  private scroll = 0;

  protected build() {
    const s = save();
    coverImage(this, 'bg-battle-bog', 0.45);
    const top = this.safe.top;
    const w = Math.min(640, this.W - 24);
    const x = (this.W - w) / 2;
    const pad = 14;
    const types = this.types();
    const check = checkArmy(types, R1_BOSS_BUDGET);

    // Header: top bar and Grubnak's rules, drawn above the scrolling list.
    const head = this.add.container(0, 0).setDepth(10);
    let y = top + 68;
    const enemyPawns = Object.values(R1_BOSS_ARMY).filter((p) => p === 'p').length;
    const enemyPts = Object.values(R1_BOSS_ARMY).reduce((a, p) => a + PIECE_VALUE[p as HireType | 'k'], 0);
    const info = para(
      this,
      x + pad,
      y + 34,
      `Grubnak brings ${enemyPawns} bog rats and a salamander knight (${enemyPts} points). You may bring up to ${R1_BOSS_BUDGET.points} points, and no sorceress. Your king always comes.`,
      w - pad * 2,
      14,
      CSS.muted,
    );
    const h = info.height + 46;
    const listTop = y + h + 10;
    const band = this.add.graphics();
    band.fillStyle(C.bg, 0.94).fillRect(0, 0, this.W, listTop - 4);
    band.lineStyle(1, C.line, 1).lineBetween(0, top + 54, this.W, top + 54);
    head.add([
      band,
      this.add.zone(0, 0, this.W, listTop - 4).setOrigin(0).setInteractive(), // taps on rows scrolled underneath don't count
      button(this, 12, top + 10, '← Map', { w: 76, h: 34, kind: 'ghost', onClick: () => this.scene.start('map') }),
      eyebrow(this, 100, top + 9, 'Boss duel'),
      this.text(100, top + 22, 'Muster your army', { fontFamily: SERIF, fontSize: '21px', fontStyle: 'bold' }),
      panel(this, x, y, w, h),
      this.text(x + pad, y + 10, 'Grubnak’s rules', { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold' }),
      this.text(x + w - pad, y + 10, `${check.points} / ${R1_BOSS_BUDGET.points} points`, {
        fontFamily: SANS,
        fontSize: '15px',
        fontStyle: 'bold',
        color: check.ok ? CSS.gold : CSS.red,
      }).setOrigin(1, 0),
      info,
    ]);

    // Action bar, pinned to the bottom so "Face Grubnak!" is always reachable.
    const reason = check.ok ? '' : check.reason;
    const barH = 66 + (reason ? 22 : 0) + Math.max(8, this.safe.bottom);
    const barTop = this.H - barH;
    const bar = this.add.container(0, 0).setDepth(10);
    const bg = this.add.graphics();
    bg.fillStyle(C.bg, 0.94).fillRect(0, barTop, this.W, barH);
    bg.lineStyle(1, C.line, 1).lineBetween(0, barTop, this.W, barTop);
    bar.add([bg, this.add.zone(0, barTop, this.W, barH).setOrigin(0).setInteractive()]);
    let by = barTop + 10;
    if (reason) {
      bar.add(this.text(x, by, reason, { fontFamily: SANS, fontSize: '13px', color: CSS.red }));
      by += 22;
    }
    const bw = Math.min(220, (w - 8) / 2);
    bar.add(button(this, x, by, 'Face Grubnak!', { w: bw, h: 46, kind: 'primary', disabled: !check.ok, onClick: () => launchBoss(this, [...this.chosen]) }));
    bar.add(
      button(this, x + bw + 8, by, 'Best fit', {
        w: Math.min(140, w - bw - 8),
        h: 46,
        onClick: () => {
          this.chosen = new Set(suggestArmy(s.roster, R1_BOSS_BUDGET));
          this.rebuild();
        },
      }),
    );

    // Your pieces as toggles, in a list that scrolls between the header and the bar.
    const list = this.add.container(0, 0);
    const roster = [...s.roster].sort((a, b) => PIECE_VALUE[b.type] - PIECE_VALUE[a.type]);
    const room = barTop - listTop - 8;
    // Two compact columns when one column wouldn't fit (big army, or a short phone).
    const cols = this.W >= 560 || roster.length * 66 > room ? 2 : 1;
    const compact = cols === 2 && this.W < 560;
    const cw = (w - 8 * (cols - 1)) / cols;
    const ch = roster.length > 10 ? 50 : 58;
    const tapped = (p: Phaser.Input.Pointer) => Math.hypot(p.upX - p.downX, p.upY - p.downY) < 10 * (window.devicePixelRatio || 1);
    roster.forEach((c, i) => {
      const on = this.chosen.has(c.id);
      const can = on || canAdd(types, c.type, R1_BOSS_BUDGET);
      const cx = x + (i % cols) * (cw + 8);
      const cy = listTop + Math.floor(i / cols) * (ch + 8);
      list.add(panel(this, cx, cy, cw, ch, { fill: on ? 0x3a3020 : C.surface, stroke: on ? C.gold : C.line, alpha: can ? 0.95 : 0.5 }));
      const key = `token-${pieceName(c.type)}-ally-w`;
      if (this.textures.exists(key)) {
        const img = this.add.image(cx + 28, cy + ch - 6, key).setOrigin(0.5, 1);
        img.setScale(Math.min(40 / img.width, 46 / img.height)).setAlpha(can ? 1 : 0.4);
        list.add(img);
      }
      list.add(this.text(cx + 56, cy + (ch > 52 ? 9 : 5), c.name, { fontFamily: SERIF, fontSize: compact ? '15px' : '16px', fontStyle: 'bold', color: can ? CSS.ink : CSS.muted }));
      list.add(this.text(cx + 56, cy + ch - 25, compact ? `${PIECE_VALUE[c.type]} pt` : `${SPECIES[c.type]} · ${PIECE_VALUE[c.type]} pt`, { fontFamily: SANS, fontSize: '12px', color: CSS.muted }));
      list.add(this.text(cx + cw - 14, cy + ch / 2, on ? '✓' : can ? '+' : '', { fontFamily: SANS, fontSize: '20px', fontStyle: 'bold', color: on ? CSS.gold : CSS.muted }).setOrigin(1, 0.5));
      if (can) {
        const z = this.add.zone(cx, cy, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true });
        z.on('pointerup', (p: Phaser.Input.Pointer) => {
          if (!tapped(p)) return; // a drag scrolls, it doesn't toggle
          if (on) this.chosen.delete(c.id);
          else this.chosen.add(c.id);
          this.rebuild();
        });
        list.add(z);
      }
    });
    const bottom = listTop + Math.ceil(roster.length / cols) * (ch + 8);

    for (const ev of ['wheel', 'pointerdown', 'pointermove', 'pointerup']) this.input.removeAllListeners(ev);
    const overflow = Math.max(0, bottom - (barTop - 8));
    this.scroll = Math.min(this.scroll, overflow);
    list.y = -this.scroll;
    if (overflow > 0) {
      const apply = (dy: number) => {
        this.scroll = Math.max(0, Math.min(overflow, this.scroll + dy));
        list.y = -this.scroll;
      };
      this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => apply(dy));
      let last: number | null = null;
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (last = p.worldY >= listTop && p.worldY < barTop ? p.worldY : null));
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (last === null || !p.isDown) return;
        apply(last - p.worldY);
        last = p.worldY;
      });
      this.input.on('pointerup', () => (last = null));
    }
  }
}
