import type Phaser from 'phaser';
import { ACADEMY_LESSON, EXERCISES } from '../game/academy';
import { playerRatingFor, type Puzzle } from '../game/bounty';
import { STARTERS } from '../game/campaign';
import { ARMY_CAP, PRICE, armyPoints, bountyPay, hire, hireCheck, owned, refreshBounties, settleBounty, type HireType } from '../game/economy';
import { PIECE_VALUE } from '../game/material';
import { R1_BOSS_BUDGET } from '../game/region1Boss';
import { launchExercise } from '../flow';
import { THEME_TEXT, loadPuzzles, puzzleTheme } from '../puzzles';
import { persist, save } from '../save';
import type { PuzzleLaunch } from './Puzzle';
import { BaseScene, goTo } from '../ui/screen';
import { SPECIES, pieceName } from '../ui/speaker';
import { C, CSS, SANS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow, panel, para } from '../ui/widgets';

type Tab = 'tavern' | 'academy' | 'bounties';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tavern', label: 'Tavern' },
  { id: 'academy', label: 'Academy' },
  { id: 'bounties', label: 'Bounty board' },
];
const HIRE_ORDER: HireType[] = ['p', 'n', 'b', 'r', 'q'];

/** Town: hire pieces at their chess value, take the academy lesson, and solve puzzle bounties for gold. */
export class TownScene extends BaseScene {
  private tab: Tab = 'tavern';
  private pool: Puzzle[] | null = null;
  private poolError = false;
  private scroll = 0;
  private contentTop = 0;
  private contentH = 0;
  private note = '';

  constructor() {
    super('town');
  }

  init(data?: { tab?: Tab; note?: string }) {
    this.tab = data?.tab ?? this.tab;
    this.note = data?.note ?? '';
    this.scroll = 0;
    this.poolError = false; // try the download again on each visit
  }

  protected build() {
    const s = save();
    coverImage(this, 'bg-town', 0.5);
    const top = this.safe.top;
    const w = Math.min(640, this.W - 24);
    const x = (this.W - w) / 2;

    // Header (drawn on top, so scrolled content slides under it).
    const header = this.add.container(0, 0).setDepth(10);
    let y = top + 66 + 50;
    let notePanel: Phaser.GameObjects.GameObject[] = [];
    if (this.note) {
      const n = para(this, x + 12, y + 8, this.note, w - 24, 15, CSS.gold);
      notePanel = [panel(this, x, y, w, n.height + 16, { accent: C.gold, alpha: 1 }), n];
      y += n.height + 26;
    }
    this.contentTop = y;
    this.contentH = this.H - y - 12 - this.safe.bottom;
    const band = this.add.graphics();
    band.fillStyle(C.bg, 0.94).fillRect(0, 0, this.W, y - 4);
    band.lineStyle(1, C.line, 1).lineBetween(0, top + 54, this.W, top + 54);
    header.add(band);
    header.add(this.add.zone(0, 0, this.W, y - 4).setOrigin(0).setInteractive()); // swallow taps on content scrolled under the header
    header.add(button(this, 12, top + 10, '← Map', { w: 76, h: 34, kind: 'ghost', onClick: () => this.scene.start('map') }));
    header.add(eyebrow(this, 100, top + 9, 'The Bog'));
    header.add(this.text(100, top + 22, 'Mudford Town', { fontFamily: SERIF, fontSize: '21px', fontStyle: 'bold' }));
    header.add(this.text(this.W - 16, top + 27, `${s.gold}g`, { fontFamily: SANS, fontSize: '17px', fontStyle: 'bold', color: CSS.gold }).setOrigin(1, 0.5));
    const tw = (w - 16) / 3;
    TABS.forEach((t, i) =>
      header.add(
        button(this, x + i * (tw + 8), top + 66, t.label, {
          w: tw,
          h: 38,
          kind: t.id === this.tab ? 'primary' : 'normal',
          onClick: () => {
            this.tab = t.id;
            this.scroll = 0;
            this.note = '';
            this.rebuild();
          },
        }),
      ),
    );
    header.add(notePanel);

    const c = this.add.container(0, 0);
    let bottom = y;
    if (this.tab === 'tavern') bottom = this.drawTavern(c, x, y, w);
    else if (this.tab === 'academy') bottom = this.drawAcademy(c, x, y, w);
    else bottom = this.drawBounties(c, x, y, w);

    // Drag or wheel to scroll when the content is taller than the screen (phones).
    for (const ev of ['wheel', 'pointerdown', 'pointermove', 'pointerup']) this.input.removeAllListeners(ev);
    const overflow = Math.max(0, bottom - (y + this.contentH));
    if (overflow > 0) {
      this.scroll = Math.min(this.scroll, overflow);
      c.y = -this.scroll;
      const apply = (dy: number) => {
        this.scroll = Math.max(0, Math.min(overflow, this.scroll + dy));
        c.y = -this.scroll;
      };
      this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => apply(dy));
      let last: number | null = null;
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (last = p.worldY >= this.contentTop ? p.worldY : null));
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (last === null || !p.isDown) return;
        apply(last - p.worldY);
        last = p.worldY;
      });
      this.input.on('pointerup', () => (last = null));
    }
  }

  // ---------- tavern ----------

  private drawTavern(c: Phaser.GameObjects.Container, x: number, y: number, w: number) {
    const s = save();
    const pad = 14;
    const intro = para(this, x + pad, y + 34, 'Every piece costs its chess value in gold: a pawn is worth 1, so 10g; a rook is worth 5, so 50g. A full chess set is the most you can field.', w - pad * 2, 14, CSS.muted);
    c.add([panel(this, x, y, w, intro.height + 46), this.text(x + pad, y + 10, 'The Muddy Mug', { fontFamily: SERIF, fontSize: '19px', fontStyle: 'bold' }), intro]);
    y += intro.height + 56;

    const rowH = 64;
    for (const t of HIRE_ORDER) {
      const check = hireCheck(s, t);
      c.add(panel(this, x, y, w, rowH - 8));
      const key = `token-${pieceName(t)}-ally-w`;
      if (this.textures.exists(key)) {
        const img = this.add.image(x + 32, y + rowH - 14, key).setOrigin(0.5, 1);
        img.setScale(Math.min(44 / img.width, 48 / img.height));
        c.add(img);
      }
      c.add(this.text(x + 62, y + 9, SPECIES[t], { fontFamily: SERIF, fontSize: '17px', fontStyle: 'bold' }));
      c.add(
        this.text(x + 62, y + 31, `Value ${PIECE_VALUE[t]} · owned ${owned(s, t)}/${ARMY_CAP[t]}`, {
          fontFamily: SANS,
          fontSize: '12px',
          color: CSS.muted,
        }),
      );
      const bw = 104;
      c.add(
        button(this, x + w - bw - 10, y + 9, owned(s, t) >= ARMY_CAP[t] ? 'Full' : `Hire ${PRICE[t]}g`, {
          w: bw,
          h: 38,
          kind: check.ok ? 'primary' : 'normal',
          disabled: !check.ok,
          onClick: () => {
            const hired = hire(s, t);
            if (!hired) return;
            persist();
            this.note = `${hired.name} the ${SPECIES[t]} joins your army!`;
            this.rebuild();
          },
        }),
      );
      y += rowH;
    }

    // Your army.
    const types = s.roster.map((r) => r.type);
    const lines = [`You · ${SPECIES.k}`, ...s.roster.map((r) => `${r.name} · ${SPECIES[r.type]}${r.role === 'starter' ? ' (companion)' : r.role === 'hero' ? ' (hero)' : ''}`)];
    const list = para(this, x + pad, y + 34, lines.join('\n'), w - pad * 2, 15, CSS.ink);
    const foot = para(this, x + pad, y + 40 + list.height, `Army: ${armyPoints(types)} points. The Goblin Chief’s duel allows up to ${R1_BOSS_BUDGET.points} points and no queen, so extra pieces are choices, not power.`, w - pad * 2, 13, CSS.muted);
    const h = 52 + list.height + foot.height;
    c.add([panel(this, x, y, w, h), eyebrow(this, x + pad, y + 12, 'Your army'), list, foot]);
    return y + h + 10;
  }

  // ---------- academy ----------

  private drawAcademy(c: Phaser.GameObjects.Container, x: number, y: number, w: number) {
    const s = save();
    const pad = 14;
    const blurb = para(this, x + pad, y + 56, ACADEMY_LESSON.blurb, w - pad * 2, 15, CSS.ink);
    const note = para(this, x + pad, y + 62 + blurb.height, 'Practice here is free: undo as often as you like.', w - pad * 2, 13, CSS.muted);
    const h = 74 + blurb.height + note.height;
    c.add([
      panel(this, x, y, w, h),
      eyebrow(this, x + pad, y + 12, `Lesson · taught by ${ACADEMY_LESSON.teacher}`),
      this.text(x + pad, y + 26, ACADEMY_LESSON.title, { fontFamily: SERIF, fontSize: '20px', fontStyle: 'bold', color: CSS.gold }),
      blurb,
      note,
    ]);
    y += h + 10;
    for (const ex of EXERCISES) {
      const done = s.lessonsDone.includes(ex.id);
      const intro = para(this, x + pad, y + 34, ex.intro, w - pad * 2, 14, CSS.ink);
      const steps = para(this, x + pad, y + 42 + intro.height, ex.steps.map((t, i) => `${i + 1}. ${t}`).join('\n'), w - pad * 2, 14, CSS.muted);
      const eh = 104 + intro.height + steps.height;
      c.add([
        panel(this, x, y, w, eh, { accent: done ? C.green : C.gold }),
        this.text(x + pad, y + 10, `${done ? '✓ ' : ''}${ex.title}`, { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold' }),
        intro,
        steps,
        button(this, x + pad, y + eh - 52, done ? 'Practice again' : `Start (first clear +${ex.reward}g)`, {
          w: Math.min(260, w - pad * 2),
          h: 40,
          kind: done ? 'normal' : 'primary',
          onClick: () => launchExercise(this, ex),
        }),
      ]);
      y += eh + 10;
    }
    return y;
  }

  // ---------- bounty board ----------

  private drawBounties(c: Phaser.GameObjects.Container, x: number, y: number, w: number) {
    const s = save();
    const pad = 14;
    const intro = para(
      this,
      x + pad,
      y + 34,
      'Real puzzles, posted by worried villagers. Harder ones pay more. One try each; the board refreshes after every battle.',
      w - pad * 2,
      14,
      CSS.muted,
    );
    c.add([panel(this, x, y, w, intro.height + 46), this.text(x + pad, y + 10, 'Bounty board', { fontFamily: SERIF, fontSize: '19px', fontStyle: 'bold' }), intro]);
    y += intro.height + 56;

    if (!this.pool) {
      c.add(this.text(x + pad, y, this.poolError ? 'The bounty notices blew away (puzzles failed to load). Try again later.' : 'Reading the notices…', { fontSize: '15px', color: CSS.muted }));
      if (!this.poolError) {
        loadPuzzles().then(
          (p) => {
            this.pool = p;
            if (this.sys.isActive() && this.tab === 'bounties') this.rebuild();
          },
          () => {
            this.poolError = true;
            if (this.sys.isActive()) this.rebuild();
          },
        );
      }
      return y + 30;
    }
    if (refreshBounties(s, this.pool)) persist();
    const byId = new Map(this.pool.map((p) => [p.id, p]));
    const bounties = s.bounties.map((id) => byId.get(id)).filter((p): p is Puzzle => Boolean(p));
    if (bounties.length === 0) {
      c.add(this.text(x + pad, y, 'No bounties left. New ones go up after your next battle.', { fontSize: '15px', color: CSS.muted, wordWrap: { width: w - pad * 2 } }));
      return y + 40;
    }
    const rating = playerRatingFor(s.difficulty);
    for (const p of bounties) {
      const theme = THEME_TEXT[puzzleTheme(p)];
      const pay = bountyPay(s, p);
      const level = p.rating > rating + 150 ? 'Tough' : p.rating < rating - 150 ? 'Easy' : 'Fair';
      const h = 74;
      c.add([
        panel(this, x, y, w, h - 8, { accent: level === 'Tough' ? C.red : level === 'Easy' ? C.green : C.gold }),
        this.text(x + pad, y + 10, theme.name, { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold' }),
        this.text(x + pad, y + 36, `${level} · ${theme.task}`, { fontFamily: SANS, fontSize: '12px', color: CSS.muted, wordWrap: { width: w - 150 } }),
        button(this, x + w - 114, y + 13, `Solve · ${pay}g`, { w: 104, h: 40, kind: 'primary', onClick: () => this.startPuzzle(p, pay) }),
      ]);
      y += h;
    }
    return y;
  }

  private startPuzzle(p: Puzzle, pay: number) {
    const s = save();
    let settled = false;
    const launch: PuzzleLaunch = {
      puzzle: p,
      pay,
      companion: { type: s.starter, name: STARTERS[s.starter].name },
      settle: (solved) => {
        if (settled) return 0;
        settled = true;
        const gold = settleBounty(s, p, solved);
        persist();
        return gold;
      },
      exit: () => goTo(this.game, 'town', { tab: 'bounties' }),
    };
    this.scene.start('puzzle', launch);
  }
}
