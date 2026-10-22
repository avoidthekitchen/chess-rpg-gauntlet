import type { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';
import Phaser from 'phaser';
import type { ThreatMap } from '../game/threats';
import type { BaseScene } from './screen';
import type { Faction } from './speaker';
import { GLYPH_FONT, SERIF } from './theme';

/**
 * The battle board, ported from the PixiJS prototype (src/ui/pixiBoard.ts, now retired)
 * to Phaser. It only draws: rules and turn flow stay in src/game and the battle scene.
 *
 * Pieces are simplified tokens (a bust of each animal in its chess headgear). Knights hop
 * in an arc and leave a dotted L, rooks stomp square by square, everyone else glides,
 * and a capture gets a freeze frame, a white flash, a shake and a knock-out.
 */

const FILES = 'abcdefgh';

export const PIECE_FILE: Record<PieceSymbol, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export type PieceStyle = 'tokens' | 'classic';

/**
 * `ally` is the color drawn as your army (White in battles; either side in puzzles).
 * The faction picks the creature; the chess color picks ivory or ebony headgear and base.
 */
export const tokenKey = (type: PieceSymbol, color: Color, faction: Faction, ally: Color = 'w') =>
  `token-${PIECE_FILE[type]}-${color === ally ? 'ally' : faction}-${color}`;

/** Transparent padding around every token sprite, in texture px (RIM_PX + 1 in scripts/process-art.mjs). */
const TOKEN_PAD = 8;

/** The box a token is fitted into, in squares (width x height). Pawns are a little smaller. */
const TOKEN_BOX: Record<PieceSymbol, [number, number]> = {
  p: [0.8, 0.86],
  n: [0.92, 1.02],
  b: [0.92, 1.02],
  r: [0.95, 0.98],
  q: [0.92, 1.04],
  k: [0.95, 1.08],
};

// U+FE0E asks for the text glyph, so iOS doesn't swap the pawn for an emoji.
const GLYPH: Record<PieceSymbol, string> = { k: '♚︎', q: '♛︎', r: '♜︎', b: '♝︎', n: '♞︎', p: '♟︎' };
export const glyph = (t: PieceSymbol) => GLYPH[t];

const COLORS = {
  light: 0xe8d5aa,
  dark: 0xa27a52,
  frame: 0x3b2a1c,
  frameEdge: 0x6b5035,
  frameFront: 0x241911,
  label: '#c9b48c',
  last: 0xffd15c,
  selected: 0xffc43d,
  threat: 0xd6301e,
  village: 0x3f8f45,
  dust: 0xd9c49a,
  spark: 0xfff0b8,
  shout: 0x9fd03a,
  hint: 0x5fd17a,
};

/** Board depth: squares are drawn shorter than wide, as if seen from a low angle. */
const DEPTH = 0.78;
/** Board width and height in squares, frame included. A phone (about 390 px wide) gets 45 px squares. */
export const BOARD_SPAN = 8.6;
export const BOARD_TALL = 1.05 + 8 * DEPTH + 0.75;

export interface BoardView {
  chess: Chess;
  selected: Square | null;
  /** Legal destinations of the selected piece. */
  targets: Set<Square>;
  lastMove: { from: Square; to: Square } | null;
  threats: ThreatMap | null;
  villages: Square[];
  /** The move the enemy has announced (shouting goblins). */
  shout?: { from: Square; to: Square } | null;
  /** A move to point out, e.g. a puzzle's answer. */
  hint?: { from: Square; to: Square } | null;
}

interface PieceNode {
  type: PieceSymbol;
  color: Color;
  square: Square;
  /** Sits on the ground point of its square. Moves across the board. */
  node: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Graphics;
  glow: Phaser.GameObjects.Graphics;
  glowTween: Phaser.Tweens.Tween | null;
  glowKind: 'hang' | 'check' | null;
  /** Squash, stretch, lift and tilt happen here, pivoting on the base. */
  pose: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
}

type Point = { x: number; y: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface BoardOptions {
  faction: Faction;
  style: PieceStyle;
  /** Drop the pieces onto the board when they first appear. */
  intro: boolean;
  /** Draw Black at the bottom (for puzzles where you play Black). */
  flipped?: boolean;
  /** The color drawn as your army. Defaults to White. */
  allyColor?: Color;
  onSquare: (sq: Square) => void;
}

export class PhaserBoard {
  /** Positioned on screen. */
  readonly root: Phaser.GameObjects.Container;
  /** Shakes. */
  private world: Phaser.GameObjects.Container;
  private boardLayer: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Container;
  private marks: Phaser.GameObjects.Graphics;
  private trail: Phaser.GameObjects.Container;
  private pieceLayer: Phaser.GameObjects.Container;
  private topMarks: Phaser.GameObjects.Graphics;
  private fx: Phaser.GameObjects.Container;

  private pieces = new Map<Square, PieceNode>();
  private view: BoardView | null = null;
  private introDone: boolean;
  busy = false;
  private destroyed = false;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Layout.
  readonly W: number; // square width
  readonly H: number; // square height on screen
  private readonly m: number; // frame margin
  private readonly top: number; // y of the board's top edge (room above for back-rank tokens)
  readonly width: number;
  readonly height: number;

  constructor(
    private scene: BaseScene,
    x: number,
    y: number,
    width: number,
    private opts: BoardOptions,
  ) {
    this.introDone = !opts.intro;
    this.width = width;
    this.W = width / BOARD_SPAN;
    this.H = this.W * DEPTH;
    this.m = this.W * 0.32;
    this.top = this.W * 1.05;
    this.height = Math.round(this.top + 8 * this.H + this.W * 0.75);

    const s = scene;
    this.root = s.add.container(x, y);
    this.world = s.add.container(0, 0);
    this.boardLayer = s.add.graphics();
    this.labels = s.add.container(0, 0);
    this.marks = s.add.graphics();
    this.trail = s.add.container(0, 0);
    this.pieceLayer = s.add.container(0, 0);
    this.topMarks = s.add.graphics();
    this.fx = s.add.container(0, 0);
    this.world.add([this.boardLayer, this.labels, this.marks, this.trail, this.pieceLayer, this.topMarks, this.fx]);
    this.root.add(this.world);

    const zone = s.add.zone(0, 0, width, this.height).setOrigin(0).setInteractive({ useHandCursor: true });
    // A tap needs its press on the board too, so releases elsewhere don't count.
    let pressed = false;
    zone.on('pointerdown', () => (pressed = true));
    zone.on('pointerout', () => (pressed = false));
    zone.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (pressed) this.onTap(p.worldX, p.worldY);
      pressed = false;
    });
    this.root.add(zone);

    s.events.on(Phaser.Scenes.Events.UPDATE, this.sortPieces, this);
    s.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    this.root.once(Phaser.GameObjects.Events.DESTROY, () => this.destroy());
    this.drawBoard();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.sortPieces, this);
    for (const p of this.pieces.values()) p.glowTween?.remove();
  }

  /** Shows the latest state. While a move animates, it waits and shows the newest state after. */
  render(v: BoardView) {
    this.view = v;
    this.apply();
  }

  /** Animates a move that was just played. Resolves when the board has settled. */
  async animateMove(m: Move): Promise<void> {
    if (this.destroyed || this.reduced) return;
    const mover = this.pieces.get(m.from);
    if (!mover) return;
    this.busy = true;
    this.marks.clear(); // drop the selection and move dots right away
    this.topMarks.clear();
    try {
      const victimSq = (m.flags.includes('e') ? `${m.to[0]}${m.from[1]}` : m.to) as Square;
      const victim = m.captured ? this.pieces.get(victimSq) : undefined;
      if (victim) this.pieces.delete(victimSq);
      this.relocate(mover, m.from, m.to);
      this.tween({ targets: mover.pose, y: 0, duration: 80 }); // undo the "selected" lift

      const jobs: Promise<void>[] = [];
      const travel = m.piece === 'n' ? this.hop(mover, m.from, m.to) : m.piece === 'r' ? this.stomp(mover, m.from, m.to) : this.glide(mover, m.from, m.to);
      jobs.push(travel.then(() => (victim ? this.knockOut(victim, m.from, m.to) : undefined)));

      if (m.flags.includes('k') || m.flags.includes('q')) {
        const rank = m.from[1];
        const [rf, rt] = (m.flags.includes('k') ? [`h${rank}`, `f${rank}`] : [`a${rank}`, `d${rank}`]) as [Square, Square];
        const rook = this.pieces.get(rf);
        if (rook) {
          this.relocate(rook, rf, rt);
          jobs.push(this.stomp(rook, rf, rt));
        }
      }
      // Never let a stuck animation block the game.
      await Promise.race([Promise.all(jobs), sleep(4000)]);
    } finally {
      this.busy = false;
      this.apply();
    }
  }

  /** A quick shimmer for Rewind. */
  rewindEffect() {
    if (this.destroyed || this.reduced) return;
    this.world.alpha = 0.35;
    this.tween({ targets: this.world, alpha: 1, duration: 450, ease: 'Cubic.easeOut' });
  }

  /** Victory: your pieces hop for joy under a shower of gold confetti. */
  celebrate() {
    if (this.destroyed || this.reduced) return;
    const ally = this.opts.allyColor ?? 'w';
    let i = 0;
    for (const p of this.pieces.values()) {
      if (p.color !== ally) continue;
      const delay = 120 + i++ * 70;
      this.tween({ targets: p.pose, y: -this.W * 0.35, duration: 220, delay, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    }
    const colors = [0xffd66b, 0xe0ab45, 0xfff0b8, 0x9fd03a, 0xe25a43];
    const cx = this.m + 4 * this.W;
    for (let k = 0; k < 46; k++) {
      const g = this.scene.add.graphics().fillStyle(colors[k % colors.length], 1).fillRect(-this.W * 0.05, -this.W * 0.09, this.W * 0.1, this.W * 0.18);
      g.setPosition(cx + rand(-0.5, 0.5) * this.W, this.top + 3 * this.H);
      g.rotation = rand(0, Math.PI);
      this.fx.add(g);
      // A little ballistic arc: thrown up and out, then falling and fading.
      const ang = rand(-Math.PI * 0.92, -Math.PI * 0.08);
      const v = rand(3.2, 5.6) * this.W;
      const x0 = g.x;
      const y0 = g.y;
      const spin = rand(-8, 8);
      const r0 = g.rotation;
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: rand(1200, 1800),
        onUpdate: (tw) => {
          const t = tw.getValue() ?? 0;
          g.setPosition(x0 + Math.cos(ang) * v * t, y0 + Math.sin(ang) * v * t + 5 * this.W * t * t);
          g.rotation = r0 + spin * t;
          g.alpha = 1 - Math.max(0, (t - 0.6) / 0.4);
        },
        onComplete: () => g.destroy(),
      });
    }
  }

  /** Screen-space center of a square, e.g. for floating labels. */
  squareCenter(sq: Square): Point {
    const c = this.center(sq);
    return { x: this.root.x + c.x, y: this.root.y + c.y };
  }

  // ---------- helpers ----------

  /** Phaser tweens default to linear; gsap (which these timings came from) defaults to power1.out. */
  private tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig) {
    return this.scene.tweens.add({ ease: 'Quad.easeOut', ...cfg });
  }

  /** Runs `fn` after `ms` on the tween clock, so hit stop slows it too. */
  private after(ms: number, fn: () => void) {
    this.scene.tweens.addCounter({ from: 0, to: 1, duration: 1, delay: ms, onComplete: fn });
  }

  private sortPieces() {
    if (!this.destroyed) this.pieceLayer.sort('depth');
  }

  private center(sq: Square): Point {
    const flip = this.opts.flipped;
    const f = flip ? 7 - FILES.indexOf(sq[0]) : FILES.indexOf(sq[0]);
    const r = flip ? 9 - Number(sq[1]) : Number(sq[1]);
    return { x: this.m + (f + 0.5) * this.W, y: this.top + (8 - r + 0.5) * this.H };
  }

  /** Where a token's base sits: a little below the square's middle, for depth. */
  private ground(sq: Square): Point {
    const c = this.center(sq);
    return { x: c.x, y: c.y + this.H * 0.28 };
  }

  private squareAt(x: number, y: number): Square | null {
    const f = Math.floor((x - this.m) / this.W);
    const row = Math.floor((y - this.top) / this.H);
    if (f < 0 || f > 7 || row < 0 || row > 7) return null;
    return (this.opts.flipped ? `${FILES[7 - f]}${row + 1}` : `${FILES[f]}${8 - row}`) as Square;
  }

  // ---------- drawing ----------

  private drawBoard() {
    const { W, H, m, top } = this;
    const g = this.boardLayer.clear();
    const left = m * 0.3;
    const right = m + 8 * W + m * 0.7;
    const frameTop = top - m * 0.7;
    const bottom = top + 8 * H + m * 0.75;

    // Front edge first, so the board reads as a thick slab.
    g.fillStyle(COLORS.frameFront, 1).fillRoundedRect(left, frameTop + W * 0.16, right - left, bottom - frameTop, W * 0.12);
    g.fillStyle(COLORS.frame, 1).fillRoundedRect(left, frameTop, right - left, bottom - frameTop, W * 0.12);
    g.lineStyle(2, COLORS.frameEdge, 1).strokeRoundedRect(left, frameTop, right - left, bottom - frameTop, W * 0.12);

    for (let row = 0; row < 8; row++) {
      for (let f = 0; f < 8; f++) {
        const light = (f + row) % 2 === 0;
        // A little per-square variation so it reads as painted wood, not flat color.
        const n = (Math.sin(f * 12.9898 + row * 78.233) * 43758.5453) % 1;
        g.fillStyle(scaleColor(light ? COLORS.light : COLORS.dark, 1 + (n - 0.5) * 0.04), 1);
        g.fillRect(m + f * W, top + row * H, W, H);
      }
    }
    // Soft inner rim where squares meet the frame.
    g.lineStyle(Math.max(1, W * 0.03), 0x000000, 0.35).strokeRect(m, top, 8 * W, 8 * H);

    const style = { fontFamily: SERIF, fontSize: `${Math.max(10, W * 0.22)}px`, color: COLORS.label };
    for (let i = 0; i < 8; i++) {
      const flip = this.opts.flipped;
      const file = this.scene.text(m + (i + 0.5) * W, top + 8 * H + m * 0.12, FILES[flip ? 7 - i : i], style).setOrigin(0.5, 0);
      const rank = this.scene.text(m * 0.62, top + (i + 0.5) * H, String(flip ? i + 1 : 8 - i), style).setOrigin(0.5, 0.5);
      this.labels.add([file, rank]);
    }
  }

  private rect(sq: Square) {
    const c = this.center(sq);
    return [c.x - this.W / 2, c.y - this.H / 2, this.W, this.H] as const;
  }

  private drawMarks(v: BoardView) {
    const { W, H } = this;
    const g = this.marks.clear();
    if (v.lastMove) for (const sq of [v.lastMove.from, v.lastMove.to]) g.fillStyle(COLORS.last, 0.38).fillRect(...this.rect(sq));
    if (v.threats) {
      for (const sq of v.threats.attacked) {
        const [x, y, w, h] = this.rect(sq);
        g.fillStyle(COLORS.threat, 0.09).fillRect(x, y, w, h);
        g.lineStyle(Math.max(1, W * 0.02), COLORS.threat, 0.32).strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      }
    }
    for (const sq of v.villages) {
      const [x, y, w, h] = this.rect(sq);
      g.lineStyle(Math.max(2, W * 0.04), COLORS.village, 0.9).strokeRect(x + 2, y + 2, w - 4, h - 4);
      // A little cottage in the corner.
      const s = W * 0.16;
      const hx = x + w - s * 1.5;
      const hy = y + s * 0.9;
      g.fillStyle(0x7a3b22, 1).fillTriangle(hx - s * 0.1, hy, hx + s / 2, hy - s * 0.6, hx + s * 1.1, hy);
      g.fillStyle(0xe9dcc0, 1).fillRect(hx, hy, s, s * 0.75);
      g.lineStyle(1, 0x2f2418, 1).strokeRect(hx, hy, s, s * 0.75);
    }
    if (v.hint) for (const sq of [v.hint.from, v.hint.to]) g.fillStyle(COLORS.hint, 0.45).fillRect(...this.rect(sq));
    if (v.selected) g.fillStyle(COLORS.selected, 0.55).fillRect(...this.rect(v.selected));
    for (const sq of v.targets) {
      if (v.chess.get(sq)) {
        const p = this.ground(sq);
        g.lineStyle(Math.max(2, W * 0.05), COLORS.threat, 0.85).strokeEllipse(p.x, p.y - W * 0.12, W * 0.92, W * 0.4);
      } else {
        const c = this.center(sq);
        g.fillStyle(0x2a1d12, 0.4).fillEllipse(c.x, c.y, W * 0.26, H * 0.26);
      }
    }

    // The announced enemy move is drawn over the pieces so it can't hide behind a token.
    const t = this.topMarks.clear();
    if (v.shout) this.arrow(t, v.shout.from, v.shout.to, COLORS.shout);
  }

  private arrow(g: Phaser.GameObjects.Graphics, from: Square, to: Square, color: number) {
    const a = this.center(from);
    const b = this.center(to);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const head = this.W * 0.32;
    const end = { x: b.x - Math.cos(ang) * head * 0.8, y: b.y - Math.sin(ang) * head * 0.8 };
    g.lineStyle(Math.max(3, this.W * 0.13), 0x14210a, 0.45).lineBetween(a.x, a.y + 2, end.x, end.y + 2);
    g.lineStyle(Math.max(3, this.W * 0.11), color, 0.8).lineBetween(a.x, a.y, end.x, end.y);
    const l = { x: b.x - Math.cos(ang - 0.5) * head, y: b.y - Math.sin(ang - 0.5) * head };
    const r = { x: b.x - Math.cos(ang + 0.5) * head, y: b.y - Math.sin(ang + 0.5) * head };
    g.fillStyle(color, 0.85).fillTriangle(b.x, b.y, l.x, l.y, r.x, r.y);
    g.fillStyle(color, 0.85).fillCircle(a.x, a.y, this.W * 0.09);
  }

  // ---------- pieces ----------

  private apply() {
    const v = this.view;
    if (!v || this.busy || this.destroyed) return;
    this.syncPieces(v);
    this.drawMarks(v);
    const checked = v.chess.inCheck() ? v.chess.turn() : null;
    for (const p of this.pieces.values()) {
      const kind = p.type === 'k' && p.color === checked ? 'check' : v.threats?.hanging.has(p.square) ? 'hang' : null;
      this.setGlow(p, kind);
      const lift = v.selected === p.square ? -this.W * 0.1 : 0;
      if (p.pose.y !== lift) this.tween({ targets: p.pose, y: lift, duration: 120, ease: 'Cubic.easeOut' });
    }
  }

  private syncPieces(v: BoardView) {
    let order = 0;
    for (let r = 8; r >= 1; r--) {
      for (const f of FILES) {
        const sq = `${f}${r}` as Square;
        const want = v.chess.get(sq);
        const have = this.pieces.get(sq);
        if (have && (!want || have.type !== want.type || have.color !== want.color)) {
          this.killPiece(have);
          this.pieces.delete(sq);
        }
        if (want && !this.pieces.get(sq)) {
          const p = this.makePiece(want.type, want.color, sq);
          this.pieces.set(sq, p);
          this.appear(p, this.introDone ? 0 : order++, !this.introDone);
        }
      }
    }
    this.introDone = true;
  }

  private makePiece(type: PieceSymbol, color: Color, square: Square): PieceNode {
    const W = this.W;
    const s = this.scene;
    const node = s.add.container(0, 0);
    const shadow = s.add.graphics().fillStyle(0x000000, 0.32).fillEllipse(0, -W * 0.04, W * 0.8, W * 0.26);
    const glow = s.add.graphics().fillStyle(0xff3b1e, 1).fillEllipse(0, -W * 0.1, W * 1.04, W * 0.44);
    glow.alpha = 0;
    const pose = s.add.container(0, 0);
    const body = this.makeBody(type, color);
    pose.add(body);
    node.add([shadow, glow, pose]);
    const g = this.ground(square);
    node.setPosition(g.x, g.y).setDepth(g.y);
    this.pieceLayer.add(node);
    return { type, color, square, node, shadow, glow, glowTween: null, glowKind: null, pose, body };
  }

  private makeBody(type: PieceSymbol, color: Color) {
    const W = this.W;
    const allyColor = this.opts.allyColor ?? 'w';
    const key = tokenKey(type, color, this.opts.faction, allyColor);
    if (this.opts.style === 'tokens' && this.scene.textures.exists(key)) {
      const [bw, bh] = TOKEN_BOX[type];
      // Fit the token itself, not the padding process-art.mjs leaves for the ebony rim.
      const img = this.scene.add.image(0, 0, key);
      const iw = img.width - 2 * TOKEN_PAD;
      const ih = img.height - 2 * TOKEN_PAD;
      img.setOrigin(0.5, (TOKEN_PAD + 0.97 * ih) / img.height);
      img.setScale(Math.min((bw * W) / iw, (bh * W) / ih));
      return img;
    }
    // Classic pieces: the standard chess shapes, so what you learn carries over.
    const white = color === 'w';
    const t = this.scene.text(0, 0, GLYPH[type], {
      fontFamily: GLYPH_FONT,
      fontSize: `${Math.round(W * 0.95)}px`,
      color: white ? '#fbf5e6' : '#22172b',
      stroke: white ? '#2a1d12' : '#e8d5aa',
      strokeThickness: Math.max(2, W * 0.06),
      padding: { x: 2, y: 4 },
    });
    t.setOrigin(0.5, 0.92);
    return t;
  }

  private appear(p: PieceNode, order: number, drop: boolean) {
    if (this.reduced) return;
    if (drop) {
      // Battle start: tokens drop onto the board, back rank first.
      p.pose.y = -this.W * 1.4;
      p.node.alpha = 0;
      this.tween({ targets: p.node, alpha: 1, duration: 150, delay: order * 35 });
      this.tween({ targets: p.pose, y: 0, duration: 500, delay: order * 35, ease: 'Bounce.easeOut' });
    } else {
      // Promotion or a restored piece: a small pop.
      p.pose.setScale(0.4);
      this.tween({ targets: p.pose, scaleX: 1, scaleY: 1, duration: 450, ease: 'Back.easeOut', easeParams: [2.5] });
      this.sparks(this.ground(p.square), 10);
    }
  }

  private relocate(p: PieceNode, from: Square, to: Square) {
    this.pieces.delete(from);
    p.square = to;
    this.pieces.set(to, p);
  }

  private killPiece(p: PieceNode) {
    p.glowTween?.remove();
    this.scene.tweens.killTweensOf([p.node, p.pose, p.shadow, p.glow]);
    p.node.destroy();
  }

  private setGlow(p: PieceNode, kind: 'hang' | 'check' | null) {
    if (p.glowKind === kind) return;
    p.glowKind = kind;
    p.glowTween?.remove();
    p.glowTween = null;
    if (!kind) {
      p.glow.alpha = 0;
      return;
    }
    p.glow.clear().fillStyle(kind === 'check' ? 0xff2a14 : 0xff5a2e, 1).fillEllipse(0, -this.W * 0.1, this.W * 1.04, this.W * 0.44);
    p.glow.alpha = kind === 'check' ? 0.75 : 0.55;
    if (!this.reduced) {
      p.glowTween = this.tween({ targets: p.glow, alpha: kind === 'check' ? 0.35 : 0.2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  // ---------- movement ----------

  /** Knights hop in an arc and leave a dotted L showing how they moved. */
  private hop(p: PieceNode, from: Square, to: Square): Promise<void> {
    const a = this.ground(from);
    const b = this.ground(to);
    const peak = this.W * 0.95;
    const dir = Math.sign(b.x - a.x) || 1;
    this.drawKnightPath(from, to);
    p.node.setDepth(1e6); // fly over everything
    const air = 90;
    return new Promise((resolve) => {
      this.tween({ targets: p.pose, scaleX: 1.14, scaleY: 0.82, duration: 90, ease: 'Cubic.easeOut' }); // crouch
      this.tween({ targets: p.pose, scaleX: 0.9, scaleY: 1.14, duration: 120, delay: air, ease: 'Cubic.easeOut' });
      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 460,
        delay: air,
        onUpdate: (tw) => {
          const k = tw.getValue() ?? 0;
          const h = 4 * peak * k * (1 - k);
          p.node.setPosition(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
          p.pose.y = -h;
          p.pose.rotation = dir * 0.2 * Math.sin(Math.PI * k);
          const s = 1 - 0.5 * (h / peak);
          p.shadow.setScale(s);
          p.shadow.alpha = 0.4 + 0.6 * s;
        },
      });
      this.tween({ targets: p.pose, scaleX: 1, scaleY: 1, duration: 200, delay: air + 140 });
      this.after(air + 460, () => {
        p.node.setPosition(b.x, b.y).setDepth(b.y);
        p.pose.rotation = 0;
        p.pose.y = 0;
        resolve();
        this.dust(b, 8, 0.9);
        this.shake(3);
        // Land: squash, then wobble back.
        this.tween({
          targets: p.pose,
          scaleX: 1.22,
          scaleY: 0.76,
          duration: 60,
          ease: 'Cubic.easeOut',
          onComplete: () => this.tween({ targets: p.pose, scaleX: 1, scaleY: 1, duration: 400, ease: 'Elastic.easeOut', easeParams: [1, 0.45] }),
        });
      });
    });
  }

  /** Rooks stomp one square at a time, shaking the board as they land. */
  private stomp(p: PieceNode, from: Square, to: Square): Promise<void> {
    const a = this.ground(from);
    const b = this.ground(to);
    const steps = Math.max(Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0])), Math.abs(Number(to[1]) - Number(from[1])));
    const lift = this.W * 0.14;
    return new Promise((resolve) => {
      this.tween({ targets: p.pose, scaleX: 1.06, scaleY: 0.92, duration: 100, ease: 'Cubic.easeOut' }); // brace
      for (let i = 1; i <= steps; i++) {
        const x = a.x + ((b.x - a.x) * i) / steps;
        const y = a.y + ((b.y - a.y) * i) / steps;
        const last = i === steps;
        const L = 100 + (i - 1) * 290;
        this.tween({ targets: p.node, x, y, duration: 170, delay: L, ease: 'Quad.easeInOut', onUpdate: () => void p.node.setDepth(p.node.y) });
        this.tween({ targets: p.pose, scaleX: 0.96, scaleY: 1.06, duration: 85, delay: L });
        this.tween({ targets: p.pose, y: -lift, duration: 85, delay: L, ease: 'Cubic.easeOut' });
        this.tween({ targets: p.pose, y: 0, duration: 85, delay: L + 85, ease: 'Cubic.easeIn' });
        this.after(L + 170, () => {
          if (last) {
            p.node.setDepth(b.y);
            resolve();
          }
          this.dust({ x, y }, last ? 12 : 4, last ? 1.1 : 0.6);
          this.shake(last ? 7 : 1.5);
        });
        this.tween({ targets: p.pose, scaleX: last ? 1.18 : 1.08, scaleY: last ? 0.8 : 0.92, duration: 50, delay: L + 170 });
        this.tween({
          targets: p.pose,
          scaleX: 1,
          scaleY: 1,
          duration: last ? 400 : 70,
          delay: L + 220,
          ease: last ? 'Elastic.easeOut' : 'Quad.easeOut',
          easeParams: last ? [1, 0.5] : undefined,
        });
      }
    });
  }

  /** Everyone else glides with a small lift. */
  private glide(p: PieceNode, from: Square, to: Square): Promise<void> {
    const a = this.ground(from);
    const b = this.ground(to);
    const dist = Math.hypot(b.x - a.x, b.y - a.y) / this.W;
    const d = Math.min(500, 200 + dist * 50);
    p.node.setDepth(Math.max(a.y, b.y) + 0.5);
    return new Promise((resolve) => {
      this.tween({ targets: p.node, x: b.x, y: b.y, duration: d, ease: 'Cubic.easeInOut' });
      this.tween({ targets: p.pose, y: -this.W * 0.12, duration: d / 2, ease: 'Cubic.easeOut' });
      this.tween({ targets: p.pose, y: 0, duration: d / 2, delay: d / 2, ease: 'Cubic.easeIn' });
      this.after(d, () => {
        p.node.setDepth(b.y);
        resolve();
        this.dust(b, 4, 0.6);
        this.tween({
          targets: p.pose,
          scaleX: 1.1,
          scaleY: 0.9,
          duration: 50,
          onComplete: () => this.tween({ targets: p.pose, scaleX: 1, scaleY: 1, duration: 250, ease: 'Back.easeOut', easeParams: [3] }),
        });
      });
    });
  }

  /** Capture: a freeze frame, a white flash, then the piece is knocked off the board. */
  private async knockOut(v: PieceNode, from: Square, to: Square) {
    const a = this.center(from);
    const b = this.center(to);
    const dir = Math.sign(b.x - a.x) || (Math.random() < 0.5 ? -1 : 1);
    v.glowTween?.remove();
    v.glow.alpha = 0;
    v.node.setDepth(2e6);

    // White flash: a solid fill tint that keeps the token's silhouette.
    v.body.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.sparks(this.ground(to), 14);

    // Hit stop: slow everything to a crawl for a beat.
    const tw = this.scene.tweens;
    const speed = tw.timeScale;
    tw.timeScale = speed * 0.05;
    await sleep(90 / speed);
    tw.timeScale = speed;
    if (this.destroyed || !v.node.active) return;
    v.body.clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
    this.shake(9);

    const W = this.W;
    await new Promise<void>((resolve) => {
      this.tween({ targets: v.node, x: v.node.x + dir * W * 1.1, duration: 600, ease: 'Cubic.easeOut' });
      this.tween({ targets: v.pose, y: -W * 0.9, rotation: dir * 1.6, duration: 600, ease: 'Cubic.easeOut' });
      this.tween({ targets: v.shadow, alpha: 0, duration: 200 });
      this.tween({
        targets: v.node,
        alpha: 0,
        duration: 450,
        delay: 150,
        onComplete: () => {
          this.killPiece(v);
          resolve();
        },
      });
    });
  }

  // ---------- effects ----------

  private drawKnightPath(from: Square, to: Square) {
    const a = this.center(from);
    const b = this.center(to);
    const longFiles = Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0])) === 2;
    const corner = longFiles ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
    const dots = this.scene.add.graphics();
    const r = this.W * 0.045;
    dots.fillStyle(0xffe08a, 0.95).lineStyle(1, 0x5a3b10, 0.6);
    for (const [p, q] of [
      [a, corner],
      [corner, b],
    ] as const) {
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      const n = Math.max(2, Math.round(len / (this.W * 0.2)));
      for (let i = 0; i <= n; i++) {
        const x = p.x + ((q.x - p.x) * i) / n;
        const y = p.y + ((q.y - p.y) * i) / n;
        dots.fillCircle(x, y, r).strokeCircle(x, y, r);
      }
    }
    this.trail.add(dots);
    dots.alpha = 0;
    this.tween({ targets: dots, alpha: 1, duration: 150 });
    this.tween({ targets: dots, alpha: 0, duration: 500, delay: 900, onComplete: () => dots.destroy() });
  }

  private dust(p: Point, n: number, size = 1) {
    if (this.reduced) return;
    const W = this.W;
    for (let i = 0; i < n; i++) {
      const g = this.scene.add.graphics().fillStyle(COLORS.dust, 0.75).fillCircle(0, 0, W * 0.05 * size * rand(0.6, 1.2));
      g.setPosition(p.x + rand(-0.2, 0.2) * W, p.y - W * 0.05 + rand(-0.04, 0.04) * W);
      this.fx.add(g);
      const ang = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
      this.tween({
        targets: g,
        x: g.x + Math.cos(ang) * W * 0.4 * size,
        y: g.y + Math.sin(ang) * W * 0.12 * size - W * 0.06,
        alpha: 0,
        duration: rand(450, 700),
        ease: 'Cubic.easeOut',
        onComplete: () => g.destroy(),
      });
      this.tween({ targets: g, scaleX: 1.8, scaleY: 1.8, duration: 600 });
    }
  }

  private sparks(p: Point, n: number) {
    if (this.reduced) return;
    const W = this.W;
    for (let i = 0; i < n; i++) {
      const g = this.scene.add.graphics().fillStyle(COLORS.spark, 1).fillRect(-W * 0.02, -W * 0.08, W * 0.04, W * 0.16);
      const ang = rand(0, Math.PI * 2);
      g.setPosition(p.x, p.y - W * 0.45);
      g.rotation = ang + Math.PI / 2;
      this.fx.add(g);
      this.tween({
        targets: g,
        x: p.x + Math.cos(ang) * W * rand(0.4, 0.8),
        y: p.y - W * 0.45 + Math.sin(ang) * W * rand(0.3, 0.6),
        alpha: 0,
        duration: rand(300, 500),
        ease: 'Quart.easeOut',
        onComplete: () => g.destroy(),
      });
    }
  }

  private shakeTween: Phaser.Tweens.TweenChain | null = null;
  /** Six quick decaying jolts, then back to rest (as in the gsap version). */
  private shake(px: number) {
    if (this.reduced || px <= 0) return;
    // A finished chain is already destroyed (and remove() on it throws), so only stop a running one.
    if (this.shakeTween?.isPlaying()) this.shakeTween.stop();
    this.shakeTween = null;
    const n = 6;
    const steps: Phaser.Types.Tweens.TweenBuilderConfig[] = [];
    for (let i = 0; i < n; i++) {
      const k = (1 - i / n) * px;
      steps.push({ targets: this.world, x: rand(-k, k), y: rand(-k, k), duration: 30, ease: 'Quad.easeOut' });
    }
    steps.push({ targets: this.world, x: 0, y: 0, duration: 50, ease: 'Quad.easeOut' });
    const chain = this.scene.tweens.chain({ tweens: steps, onComplete: () => this.shakeTween === chain && (this.shakeTween = null) });
    this.shakeTween = chain;
  }

  // ---------- input ----------

  private onTap(wx: number, wy: number) {
    if (this.busy || !this.view) return;
    const sq = this.squareAt(wx - this.root.x, wy - this.root.y);
    // A move target wins, even if a token in front overlaps it.
    if (sq && this.view.targets.has(sq)) return this.opts.onSquare(sq);
    // Otherwise a tap on a token's body picks that token, front-most first.
    const front = [...this.pieces.values()].sort((a, b) => b.node.depth - a.node.depth);
    for (const p of front) if (p.body.getBounds().contains(wx, wy)) return this.opts.onSquare(p.square);
    if (sq) this.opts.onSquare(sq);
  }
}

function scaleColor(hex: number, k: number): number {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * k));
  const b = Math.min(255, Math.round((hex & 255) * k));
  return (r << 16) | (g << 8) | b;
}
