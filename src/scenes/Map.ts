import type Phaser from 'phaser';
import { DIFFICULTIES } from '../game/difficulty';
import { battlesWon, bossOpen, nodeState, type NodeState } from '../game/campaign';
import type { Line } from '../game/content';
import { REGION1_BOSS, REGION1_MAP, REGION1_NAME, REGION1_TOWN, battleById } from '../game/region1';
import { R1_BOSS } from '../game/region1Boss';
import { briefBattle, dialogueHtml } from '../flow';
import { persist, save } from '../save';
import { showModal } from '../ui/overlay';
import { BaseScene } from '../ui/screen';
import { C, CSS, SANS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow } from '../ui/widgets';

const INTRO: Line[] = [
  { who: 'narrator', text: 'The Bog Goblins have crept out of the marsh, stealing pots, pies and the occasional village.' },
  { who: 'companion', text: 'They’re loud, greedy and not very clever. Listen to them: they shout their plans before they move!' },
  { who: 'chief', text: 'GRUBNAK HEARS YOU, LITTLE KING. Come to my camp and lose your crown in the mud!' },
];

type Pt = { x: number; y: number };

/** The region map: pick the next battle, visit town, and face the boss once it opens. */
export class MapScene extends BaseScene {
  constructor() {
    super('map');
  }

  protected build() {
    const s = save();
    coverImage(this, 'bg-map-region1', 0.18);
    const top = 58 + this.safe.top;
    const bottom = this.H - 16 - this.safe.bottom;
    const area = { x: 24, y: top + 22, w: this.W - 48, h: bottom - top - 60 };
    const at = (p: Pt): Pt => ({ x: area.x + p.x * area.w, y: area.y + p.y * area.h });

    // Paths first, under the nodes.
    const g = this.add.graphics();
    const path = (a: Pt, b: Pt, lit: boolean) => dotted(g, at(a), at(b), lit ? C.gold : 0xd8c8a8, lit ? 0.95 : 0.45);
    const nodes = REGION1_MAP.nodes;
    for (const id of REGION1_MAP.start) path(REGION1_TOWN, nodes.find((n) => n.id === id)!, true);
    for (const n of nodes) {
      for (const nx of n.next) path(n, nodes.find((m) => m.id === nx)!, s.cleared.includes(n.id));
      if (n.next.length === 0) path(n, REGION1_BOSS, bossOpen(REGION1_MAP, s));
    }

    this.drawTown(at(REGION1_TOWN));
    nodes.forEach((n, i) => this.drawBattle(n.id, i + 1, at(n), nodeState(REGION1_MAP, s, n.id)));
    this.drawBoss(at(REGION1_BOSS));
    this.drawTopBar();

    const won = battlesWon(REGION1_MAP, s);
    const note = s.bossBeaten
      ? 'The Bog is safe and Saffron has joined you. Region 2, the Bandit Riders, comes in a later build.'
      : bossOpen(REGION1_MAP, s)
        ? 'The Goblin Chief’s camp is open. Visit town to prepare your army.'
        : `Battles won: ${won} of ${nodes.length}. The Goblin Chief’s camp opens after ${REGION1_MAP.bossNeeds} wins.`;
    const t = this.text(this.W / 2, bottom, note, {
      fontFamily: SERIF,
      fontSize: '15px',
      color: CSS.ink,
      align: 'center',
      backgroundColor: 'rgba(21,18,26,0.82)',
      padding: { x: 12, y: 6 },
      wordWrap: { width: this.W - 40 },
    });
    t.setOrigin(0.5, 1);

    if (!s.seen.includes('r1-intro')) {
      s.seen.push('r1-intro');
      persist();
      showModal({ eyebrow: REGION1_NAME, title: 'Trouble in the Bog', html: dialogueHtml(INTRO, null), buttons: [{ label: 'Onward', kind: 'primary', onClick: () => {} }], wide: true });
    }
  }

  private drawTopBar() {
    const s = save();
    const y = this.safe.top;
    const g = this.add.graphics();
    g.fillStyle(C.bg, 0.86).fillRect(0, 0, this.W, y + 54);
    g.lineStyle(1, C.line, 1).lineBetween(0, y + 54, this.W, y + 54);
    button(this, 12, y + 10, '☰', { w: 40, h: 34, kind: 'ghost', fontSize: 18, onClick: () => this.menu() });
    button(this, this.W - 150, y + 10, 'Town', { w: 70, h: 34, onClick: () => this.openTown() });
    eyebrow(this, 62, y + 9, 'Region 1 · Bog Goblins');
    this.text(62, y + 22, REGION1_NAME, { fontFamily: SERIF, fontSize: '21px', fontStyle: 'bold' });
    this.text(this.W - 16, y + 27, `${s.gold}g`, { fontFamily: SANS, fontSize: '17px', fontStyle: 'bold', color: CSS.gold }).setOrigin(1, 0.5);
  }

  private menu() {
    const s = save();
    showModal({
      title: 'Campaign',
      html: `<p class="muted">Difficulty: ${DIFFICULTIES[s.difficulty].label} · Gold: ${s.gold}g · Army: ${s.roster.length + 1} pieces</p>`,
      buttons: [
        { label: 'Resume', kind: 'primary', onClick: () => {} },
        { label: 'Title screen', onClick: () => this.scene.start('title') },
      ],
      onDismiss: () => {},
    });
  }

  private drawTown(p: Pt) {
    const g = this.add.graphics();
    const r = 26;
    g.fillStyle(0x000000, 0.35).fillCircle(p.x, p.y + 4, r + 2);
    g.fillStyle(C.surface2, 1).fillCircle(p.x, p.y, r);
    g.lineStyle(3, C.gold, 1).strokeCircle(p.x, p.y, r);
    // A little cottage.
    g.fillStyle(0x7a3b22, 1).fillTriangle(p.x - 14, p.y - 1, p.x, p.y - 14, p.x + 14, p.y - 1);
    g.fillStyle(0xe9dcc0, 1).fillRect(p.x - 10, p.y - 1, 20, 13);
    g.fillStyle(0x3b2a1c, 1).fillRect(p.x - 3, p.y + 4, 6, 8);
    this.label(p, 'Town', 'Tavern · Academy · Bounties', r, true);
    // New bounties go up after every battle: flag them until you visit.
    const s = save();
    if (s.battlesFought > 0 && s.bountiesRefreshedAt !== s.battlesFought) {
      const bx = p.x + r * 0.8;
      const by = p.y - r * 0.8;
      const badge = this.add.graphics().fillStyle(C.red, 1).fillCircle(bx, by, 10);
      const mark = this.text(bx, by, '!', { fontFamily: SANS, fontSize: '14px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
      this.tweens.add({ targets: [badge, mark], alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
    }
    this.add.zone(p.x, p.y, r * 2.6, r * 2.6).setInteractive({ useHandCursor: true }).on('pointerup', () => this.openTown());
  }

  protected openTown() {
    this.scene.start('town');
  }

  private drawBattle(id: string, num: number, p: Pt, state: NodeState) {
    const def = battleById(id);
    if (!def) return;
    const g = this.add.graphics();
    const r = this.wide ? 26 : 23;
    const fill = { locked: 0x2a2430, open: C.surface2, cleared: 0x2f4a2a, gone: 0x2a2430 }[state];
    const ring = { locked: 0x5a5060, open: C.gold, cleared: C.green, gone: 0x5a5060 }[state];
    if (state === 'open') {
      const halo = this.add.circle(p.x, p.y, r + 6, C.gold, 0.35);
      this.tweens.add({ targets: halo, scale: 1.25, alpha: 0, duration: 1300, repeat: -1, ease: 'Sine.easeOut' });
    }
    g.fillStyle(0x000000, 0.35).fillCircle(p.x, p.y + 4, r + 2);
    g.fillStyle(fill, 1).fillCircle(p.x, p.y, r);
    g.lineStyle(3, ring, 1).strokeCircle(p.x, p.y, r);
    const mark = state === 'cleared' ? '✓' : String(num);
    this.text(p.x, p.y, mark, {
      fontFamily: SERIF,
      fontSize: '22px',
      fontStyle: 'bold',
      color: state === 'locked' ? '#8a7f90' : state === 'cleared' ? CSS.green : CSS.gold,
    }).setOrigin(0.5);
    this.label(p, def.title, def.theme, r, state !== 'locked');
    if (state === 'cleared') {
      // Bonus goals earned, like a perfect island in Into the Breach.
      const s = save();
      const got = def.bonuses.filter((x) => s.bonusesEarned.includes(`${def.id}:${x.kind}`)).length;
      const stars = '★'.repeat(got) + '☆'.repeat(def.bonuses.length - got);
      this.text(p.x, p.y - r - 4, stars, { fontFamily: SANS, fontSize: '13px', color: CSS.gold, stroke: '#120d10', strokeThickness: 3 }).setOrigin(0.5, 1);
    }
    const zone = this.add.zone(p.x, p.y, r * 3, r * 3).setInteractive({ useHandCursor: state !== 'locked' });
    zone.on('pointerup', () => {
      if (state === 'locked') this.toast('Win a neighbouring battle to open this path.');
      else briefBattle(this, def);
    });
  }

  private drawBoss(p: Pt) {
    const s = save();
    const open = bossOpen(REGION1_MAP, s);
    const r = this.wide ? 34 : 30;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4).fillCircle(p.x, p.y + 5, r + 3);
    g.fillStyle(open ? 0x3a2418 : 0x221c24, 1).fillCircle(p.x, p.y, r);
    g.lineStyle(4, s.bossBeaten ? C.green : open ? C.red : 0x5a5060, 1).strokeCircle(p.x, p.y, r);
    if (this.textures.exists('token-king-bog-b')) {
      const img = this.add.image(p.x, p.y + r * 0.55, 'token-king-bog-b').setOrigin(0.5, 1);
      img.setScale((r * 1.7) / img.height);
      if (!open) img.setAlpha(0.45);
    }
    if (open && !s.bossBeaten) {
      const halo = this.add.circle(p.x, p.y, r + 6, C.red, 0.35);
      this.tweens.add({ targets: halo, scale: 1.25, alpha: 0, duration: 1300, repeat: -1, ease: 'Sine.easeOut' });
    }
    this.label(p, 'Goblin Chief’s Camp', s.bossBeaten ? 'Defeated' : open ? 'Boss duel' : `Opens after ${REGION1_MAP.bossNeeds} wins`, r, open);
    this.add.zone(p.x, p.y, r * 2.6, r * 2.6).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (!open) this.toast(`Win ${REGION1_MAP.bossNeeds} battles to reach the Goblin Chief.`);
      else this.openBoss();
    });
  }

  protected openBoss() {
    const s = save();
    const def = { ...R1_BOSS, fen: '' };
    showModal({
      eyebrow: `Boss duel · ${def.theme}`,
      title: def.title,
      wide: true,
      html: `<p>${def.intro}</p>${dialogueHtml(def.before, null)}<p class="goal"><strong>Goal:</strong> Checkmate Grubnak. A full game, so take your time.</p><p class="muted">Reward: <span class="gold">${def.reward}g</span>${s.heroJoined ? '' : ', and someone locked in the chief’s pantry'}.</p>`,
      buttons: [
        { label: 'Choose my army', kind: 'primary', onClick: () => this.scene.start('muster') },
        { label: 'Not yet', kind: 'ghost', onClick: () => {} },
      ],
      onDismiss: () => {},
    });
  }

  private label(p: Pt, title: string, sub: string, r: number, lit: boolean) {
    const t = this.text(p.x, p.y + r + 6, title, {
      fontFamily: SERIF,
      fontSize: this.wide ? '16px' : '14px',
      fontStyle: 'bold',
      color: lit ? CSS.ink : '#a89eab',
      align: 'center',
      stroke: '#120d10',
      strokeThickness: 4,
      wordWrap: { width: this.wide ? 180 : 130 },
    }).setOrigin(0.5, 0);
    this.text(p.x, t.y + t.height - 2, sub, {
      fontFamily: SANS,
      fontSize: '11px',
      color: lit ? CSS.gold : '#8a7f90',
      align: 'center',
      stroke: '#120d10',
      strokeThickness: 3,
      wordWrap: { width: this.wide ? 180 : 130 },
    }).setOrigin(0.5, 0);
  }

  private toast(msg: string) {
    const t = this.text(this.W / 2, this.H * 0.5, msg, {
      fontFamily: SERIF,
      fontSize: '16px',
      backgroundColor: 'rgba(21,18,26,0.92)',
      padding: { x: 14, y: 8 },
      align: 'center',
      wordWrap: { width: this.W - 60 },
    });
    t.setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 16, delay: 1600, duration: 400, onComplete: () => t.destroy() });
  }
}

/** A dotted trail between two points. */
function dotted(g: Phaser.GameObjects.Graphics, a: Pt, b: Pt, color: number, alpha: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(2, Math.floor(len / 12));
  g.fillStyle(0x120d10, alpha * 0.6);
  for (let i = 1; i < n; i++) g.fillCircle(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n + 1.5, 3.4);
  g.fillStyle(color, alpha);
  for (let i = 1; i < n; i++) g.fillCircle(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, 2.6);
}
