import type { Color, Move, PieceSymbol, Square } from 'chess.js';
import { gsap } from 'gsap';
import { Application, Assets, ColorMatrixFilter, Container, Graphics, Sprite, Text, type Texture } from 'pixi.js';
import { glyph, type BoardView } from './board';

/**
 * The figurine board: the same state as the DOM board, drawn with PixiJS so pieces
 * can be illustrated figurines that hop, stomp and get knocked off the board.
 *
 * It only draws. Rules and turn flow stay in src/game and main.ts.
 */

const FILES = 'abcdefgh';

/** Illustrated figurines. Pieces without one fall back to a token with the classic glyph. */
const FIGURINES: Partial<Record<PieceSymbol, { ally: string; foe: string; width: number }>> = {
  n: { ally: 'knight-ally', foe: 'knight-foe', width: 0.98 },
  r: { ally: 'rook-ally', foe: 'rook-foe', width: 1.1 },
};

const COLORS = {
  light: 0xe8d5aa,
  dark: 0xa27a52,
  frame: 0x3b2a1c,
  frameEdge: 0x6b5035,
  frameFront: 0x241911,
  label: 0xc9b48c,
  last: 0xffd15c,
  selected: 0xffc43d,
  threat: 0xd6301e,
  village: 0x3f8f45,
  dust: 0xd9c49a,
  spark: 0xfff0b8,
  allyRim: 0xd4a64a,
  foeRim: 0xa8323a,
};

/** Board depth: squares are drawn shorter than wide, as if seen from a low angle. */
const DEPTH = 0.78;

interface PieceNode {
  type: PieceSymbol;
  color: Color;
  square: Square;
  /** Sits on the ground point of its square. Moves across the board. */
  node: Container;
  shadow: Graphics;
  glow: Graphics;
  glowTween: gsap.core.Tween | null;
  glowKind: 'hang' | 'check' | null;
  /** Squash, stretch, lift and tilt happen here, pivoting on the base. */
  pose: Container;
  body: Container;
}

type Point = { x: number; y: number };

// Dev only: lets you slow animations down from the console, e.g. __gsap.globalTimeline.timeScale(0.2).
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

let figurineTextures: Promise<Record<string, Texture>> | null = null;

/** Starts loading the figurine sprites. Call early so the first battle opens instantly. */
export function preloadFigurines(): Promise<Record<string, Texture>> {
  figurineTextures ??= (async () => {
    const names = Object.values(FIGURINES).flatMap((f) => [f!.ally, f!.foe]);
    const loaded = await Promise.all(
      names.map((n) =>
        Assets.load<Texture>({
          alias: `sprite-${n}`,
          src: `${import.meta.env.BASE_URL}sprites/${n}.webp`,
          data: { autoGenerateMipmaps: true },
        }),
      ),
    );
    return Object.fromEntries(names.map((n, i) => [n, loaded[i]]));
  })();
  // Let a failed load be retried next time.
  figurineTextures.catch(() => (figurineTextures = null));
  return figurineTextures;
}

export class PixiBoard {
  private app = new Application();
  private ready = false;
  private destroyed = false;
  private textures: Record<string, Texture> = {};

  private world = new Container();
  private boardLayer = new Graphics();
  private labels = new Container();
  private marks = new Graphics();
  private trail = new Container();
  private pieceLayer = new Container();
  private fx = new Container();

  private pieces = new Map<Square, PieceNode>();
  private view: BoardView | null = null;
  private busy = false;
  private introDone = false;
  private resizeObs: ResizeObserver | null = null;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Layout, recomputed on resize.
  private W = 60; // square width
  private H = 60 * DEPTH; // square height on screen
  private m = 24; // frame margin
  private top = 60; // y of the board's top edge (room above for back-rank figurines)
  private width = 0;

  constructor(
    private host: HTMLElement,
    private onSquare: (sq: Square) => void,
  ) {}

  async init(): Promise<void> {
    await this.app.init({
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      width: Math.max(1, this.host.clientWidth),
      height: 10,
    });
    this.textures = await preloadFigurines();
    if (this.destroyed) return;

    this.host.appendChild(this.app.canvas);
    this.pieceLayer.sortableChildren = true;
    this.world.addChild(this.boardLayer, this.labels, this.marks, this.trail, this.pieceLayer, this.fx);
    this.app.stage.addChild(this.world);
    this.app.stage.eventMode = 'static';
    this.app.stage.cursor = 'pointer';
    this.app.stage.on('pointertap', (e) => this.onTap(e.global.x, e.global.y));

    this.resizeObs = new ResizeObserver(() => this.relayout());
    this.resizeObs.observe(this.host);
    this.ready = true;
    this.relayout();
  }

  destroy() {
    this.destroyed = true;
    this.resizeObs?.disconnect();
    // Stop every tween on anything we drew (including dust and knocked-out pieces)
    // before the display objects are destroyed under them.
    for (const tl of this.timelines) tl.kill();
    const killTree = (c: Container) => {
      gsap.killTweensOf([c, c.position, c.scale]);
      for (const child of c.children) killTree(child);
    };
    killTree(this.world);
    for (const p of this.pieces.values()) p.glowTween?.kill();
    if (this.ready) this.app.destroy({ removeView: true }, { children: true, texture: false, textureSource: false });
  }

  private timelines = new Set<gsap.core.Timeline>();
  private track(tl: gsap.core.Timeline): gsap.core.Timeline {
    this.timelines.add(tl);
    void tl.then(() => this.timelines.delete(tl));
    return tl;
  }

  /** Shows the latest state. While a move animates, it waits and shows the newest state after. */
  render(v: BoardView) {
    this.view = v;
    this.apply();
  }

  /** Animates a move that was just played. Resolves when the board has settled. */
  async animateMove(m: Move): Promise<void> {
    if (!this.ready || this.reduced) return;
    const mover = this.pieces.get(m.from);
    if (!mover) return;
    this.busy = true;
    this.marks.clear(); // drop the selection and move dots right away
    try {
      const victimSq = (m.flags.includes('e') ? `${m.to[0]}${m.from[1]}` : m.to) as Square;
      const victim = m.captured ? this.pieces.get(victimSq) : undefined;
      if (victim) this.pieces.delete(victimSq);
      this.relocate(mover, m.from, m.to);
      gsap.to(mover.pose, { y: 0, duration: 0.08 }); // undo the "selected" lift

      const jobs: Promise<void>[] = [];
      const travel = m.piece === 'n' ? this.hop(mover, m.from, m.to) : m.piece === 'r' ? this.stomp(mover, m.from, m.to) : this.glide(mover, m.from, m.to);
      jobs.push(travel.then(() => (victim ? this.knockOut(victim, m.from, m.to) : undefined)));

      if (m.flags.includes('k') || m.flags.includes('q')) {
        const rank = m.from[1];
        const [rf, rt] = m.flags.includes('k') ? [`h${rank}`, `f${rank}`] : [`a${rank}`, `d${rank}`];
        const rook = this.pieces.get(rf as Square);
        if (rook) {
          this.relocate(rook, rf as Square, rt as Square);
          jobs.push(this.stomp(rook, rf as Square, rt as Square));
        }
      }
      await Promise.all(jobs);
    } finally {
      this.busy = false;
      this.apply();
    }
  }

  /** A quick shimmer for Rewind. */
  rewindEffect() {
    if (!this.ready || this.reduced) return;
    gsap.fromTo(this.world, { alpha: 0.35 }, { alpha: 1, duration: 0.45, ease: 'power2.out' });
  }

  // ---------- layout ----------

  private relayout() {
    if (!this.ready || this.destroyed) return;
    const width = Math.round(this.host.clientWidth);
    if (!width || width === this.width) return;
    this.width = width;
    this.W = width / 8.8;
    this.H = this.W * DEPTH;
    this.m = this.W * 0.4;
    this.top = this.W * 1.05;
    const height = Math.round(this.top + 8 * this.H + this.W * 0.75);
    this.app.renderer.resize(width, height);
    this.host.style.height = `${height}px`;

    this.drawBoard();
    // Figurines are sized from W, so rebuild them at the new size.
    for (const p of this.pieces.values()) this.killPiece(p);
    this.pieces.clear();
    this.apply();
  }

  private center(sq: Square): Point {
    const f = FILES.indexOf(sq[0]);
    const r = Number(sq[1]);
    return { x: this.m + (f + 0.5) * this.W, y: this.top + (8 - r + 0.5) * this.H };
  }

  /** Where a figurine's base sits: a little below the square's middle, for depth. */
  private ground(sq: Square): Point {
    const c = this.center(sq);
    return { x: c.x, y: c.y + this.H * 0.28 };
  }

  private squareAt(x: number, y: number): Square | null {
    const f = Math.floor((x - this.m) / this.W);
    const row = Math.floor((y - this.top) / this.H);
    if (f < 0 || f > 7 || row < 0 || row > 7) return null;
    return `${FILES[f]}${8 - row}` as Square;
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
    g.roundRect(left, frameTop + W * 0.16, right - left, bottom - frameTop, W * 0.12).fill(COLORS.frameFront);
    g.roundRect(left, frameTop, right - left, bottom - frameTop, W * 0.12).fill(COLORS.frame).stroke({ width: 2, color: COLORS.frameEdge });

    for (let row = 0; row < 8; row++) {
      for (let f = 0; f < 8; f++) {
        const light = (f + row) % 2 === 0;
        // A little per-square variation so it reads as painted wood, not flat color.
        const base = light ? COLORS.light : COLORS.dark;
        const n = (Math.sin(f * 12.9898 + row * 78.233) * 43758.5453) % 1;
        const shade = 1 + (n - 0.5) * 0.04;
        const color = scaleColor(base, shade);
        g.rect(m + f * W, top + row * H, W, H).fill(color);
      }
    }
    // Soft inner rim where squares meet the frame.
    g.rect(m, top, 8 * W, 8 * H).stroke({ width: Math.max(1, W * 0.03), color: 0x000000, alpha: 0.35 });

    this.labels.removeChildren().forEach((c) => c.destroy());
    const style = { fontFamily: 'Iowan Old Style, Palatino, Georgia, serif', fontSize: Math.max(10, W * 0.22), fill: COLORS.label };
    for (let i = 0; i < 8; i++) {
      const file = new Text({ text: FILES[i], style });
      file.anchor.set(0.5, 0);
      file.position.set(m + (i + 0.5) * W, top + 8 * H + m * 0.12);
      const rank = new Text({ text: String(8 - i), style });
      rank.anchor.set(0.5, 0.5);
      rank.position.set(m * 0.62, top + (i + 0.5) * H);
      this.labels.addChild(file, rank);
    }
  }

  private drawMarks(v: BoardView) {
    const { W, H } = this;
    const g = this.marks.clear();
    const rect = (sq: Square) => {
      const c = this.center(sq);
      return [c.x - W / 2, c.y - H / 2, W, H] as const;
    };
    if (v.lastMove) for (const sq of [v.lastMove.from, v.lastMove.to]) g.rect(...rect(sq)).fill({ color: COLORS.last, alpha: 0.38 });
    if (v.threats) {
      for (const sq of v.threats.attacked) {
        g.rect(...rect(sq)).fill({ color: COLORS.threat, alpha: 0.09 });
        const [x, y, w, h] = rect(sq);
        g.rect(x + 1.5, y + 1.5, w - 3, h - 3).stroke({ width: Math.max(1, W * 0.02), color: COLORS.threat, alpha: 0.32 });
      }
    }
    for (const sq of v.villages) {
      const [x, y, w, h] = rect(sq);
      g.rect(x + 2, y + 2, w - 4, h - 4).stroke({ width: Math.max(2, W * 0.04), color: COLORS.village, alpha: 0.9 });
      // A little cottage in the corner.
      const s = W * 0.16;
      const hx = x + w - s * 1.5;
      const hy = y + s * 0.9;
      g.poly([hx - s * 0.1, hy, hx + s / 2, hy - s * 0.6, hx + s * 1.1, hy]).fill(0x7a3b22);
      g.rect(hx, hy, s, s * 0.75).fill(0xe9dcc0).stroke({ width: 1, color: 0x2f2418 });
    }
    if (v.selected) g.rect(...rect(v.selected)).fill({ color: COLORS.selected, alpha: 0.55 });
    for (const sq of v.targets) {
      const occupied = v.chess.get(sq);
      if (occupied) {
        const p = this.ground(sq);
        g.ellipse(p.x, p.y - W * 0.12, W * 0.46, W * 0.2).stroke({ width: Math.max(2, W * 0.05), color: COLORS.threat, alpha: 0.85 });
      } else {
        const c = this.center(sq);
        g.ellipse(c.x, c.y, W * 0.13, H * 0.13).fill({ color: 0x2a1d12, alpha: 0.4 });
      }
    }
  }

  // ---------- pieces ----------

  private apply() {
    const v = this.view;
    if (!v || !this.ready || this.busy || this.destroyed) return;
    this.syncPieces(v);
    this.drawMarks(v);
    const checked = v.chess.inCheck() ? v.chess.turn() : null;
    for (const p of this.pieces.values()) {
      const kind = p.type === 'k' && p.color === checked ? 'check' : v.threats?.hanging.has(p.square) ? 'hang' : null;
      this.setGlow(p, kind);
      const lift = v.selected === p.square ? -this.W * 0.1 : 0;
      if (p.pose.y !== lift) gsap.to(p.pose, { y: lift, duration: 0.12, ease: 'power2.out' });
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
          this.appear(p, this.introDone ? 0 : order++);
        }
      }
    }
    this.introDone = true;
  }

  private makePiece(type: PieceSymbol, color: Color, square: Square): PieceNode {
    const W = this.W;
    const node = new Container();
    const shadow = new Graphics().ellipse(0, -W * 0.04, W * 0.4, W * 0.13).fill({ color: 0x000000, alpha: 0.32 });
    const glow = new Graphics().ellipse(0, -W * 0.1, W * 0.52, W * 0.22).fill({ color: 0xff3b1e, alpha: 1 });
    glow.alpha = 0;
    const pose = new Container();
    const body = this.makeBody(type, color);
    pose.addChild(body);
    node.addChild(shadow, glow, pose);
    const g = this.ground(square);
    node.position.set(g.x, g.y);
    node.zIndex = g.y;
    this.pieceLayer.addChild(node);
    return { type, color, square, node, shadow, glow, glowTween: null, glowKind: null, pose, body };
  }

  private makeBody(type: PieceSymbol, color: Color): Container {
    const W = this.W;
    const fig = FIGURINES[type];
    if (fig) {
      const tex = this.textures[color === 'w' ? fig.ally : fig.foe];
      const s = new Sprite(tex);
      s.anchor.set(0.5, 0.985);
      s.scale.set((fig.width * W) / tex.width);
      return s;
    }
    return this.makeToken(type, color);
  }

  /** A stand-in figurine: a wooden base with the classic chess glyph standing on it. */
  private makeToken(type: PieceSymbol, color: Color): Container {
    const W = this.W;
    const ally = color === 'w';
    const rim = ally ? COLORS.allyRim : COLORS.foeRim;
    const rx = W * 0.36;
    const ry = W * 0.13;
    const th = W * 0.1;
    const c = new Container();
    const g = new Graphics();
    g.ellipse(0, -ry, rx, ry).fill(0x3a2414);
    g.rect(-rx, -ry - th, rx * 2, th).fill(0x3a2414);
    g.ellipse(0, -ry, rx, ry).stroke({ width: Math.max(1.5, W * 0.035), color: rim });
    g.ellipse(0, -ry - th, rx, ry).fill(0x6b4428).stroke({ width: Math.max(1, W * 0.02), color: rim });
    const t = new Text({
      text: glyph(type),
      style: {
        fontFamily: 'Segoe UI Symbol, Noto Sans Symbols 2, Apple Symbols, DejaVu Sans, serif',
        fontSize: W * 0.92,
        fill: ally ? 0xfbf5e6 : 0x2a1830,
        stroke: { color: ally ? 0x2a1d12 : 0xe8d5aa, width: Math.max(2, W * 0.05) },
      },
    });
    t.anchor.set(0.5, 0.88);
    t.y = -ry - th + ry * 0.2;
    c.addChild(g, t);
    return c;
  }

  private appear(p: PieceNode, order: number) {
    if (this.reduced) return;
    if (!this.introDone) {
      // Battle start: figurines drop onto the board, back rank first.
      p.pose.y = -this.W * 1.4;
      p.node.alpha = 0;
      gsap.to(p.node, { alpha: 1, duration: 0.15, delay: order * 0.035 });
      gsap.to(p.pose, { y: 0, duration: 0.5, delay: order * 0.035, ease: 'bounce.out' });
    } else {
      // Promotion or a restored piece: a small pop.
      p.pose.scale.set(0.4);
      gsap.to(p.pose.scale, { x: 1, y: 1, duration: 0.45, ease: 'back.out(2.5)' });
      this.sparks(this.ground(p.square), 10);
    }
  }

  private relocate(p: PieceNode, from: Square, to: Square) {
    this.pieces.delete(from);
    p.square = to;
    this.pieces.set(to, p);
  }

  private killPiece(p: PieceNode) {
    p.glowTween?.kill();
    gsap.killTweensOf([p.node, p.pose, p.pose.scale, p.shadow, p.shadow.scale, p.glow]);
    if (!p.node.destroyed) p.node.destroy({ children: true });
  }

  private setGlow(p: PieceNode, kind: 'hang' | 'check' | null) {
    if (p.glowKind === kind) return;
    p.glowKind = kind;
    p.glowTween?.kill();
    p.glowTween = null;
    if (!kind) {
      p.glow.alpha = 0;
      return;
    }
    p.glow.tint = kind === 'check' ? 0xff2a14 : 0xff5a2e;
    p.glow.alpha = kind === 'check' ? 0.75 : 0.55;
    if (!this.reduced) {
      p.glowTween = gsap.to(p.glow, { alpha: kind === 'check' ? 0.35 : 0.2, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
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
    p.node.zIndex = 1e6; // fly over everything
    return new Promise((resolve) => {
      const t = { k: 0 };
      this.track(gsap.timeline({ onComplete: () => void (p.node.zIndex = b.y) }))
        .to(p.pose.scale, { x: 1.14, y: 0.82, duration: 0.09, ease: 'power2.out' }) // crouch
        .addLabel('air')
        .to(p.pose.scale, { x: 0.9, y: 1.14, duration: 0.12, ease: 'power2.out' }, 'air')
        .to(
          t,
          {
            k: 1,
            duration: 0.46,
            ease: 'none',
            onUpdate: () => {
              const k = t.k;
              const h = 4 * peak * k * (1 - k);
              p.node.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
              p.pose.y = -h;
              p.pose.rotation = dir * 0.2 * Math.sin(Math.PI * k);
              const s = 1 - 0.5 * (h / peak);
              p.shadow.scale.set(s);
              p.shadow.alpha = 0.4 + 0.6 * s;
            },
          },
          'air',
        )
        .to(p.pose.scale, { x: 1, y: 1, duration: 0.2 }, 'air+=0.14')
        .add(() => {
          p.pose.rotation = 0;
          this.dust(b, 8, 0.9);
          this.shake(3);
          resolve();
        })
        .to(p.pose.scale, { x: 1.22, y: 0.76, duration: 0.06, ease: 'power2.out' }) // land
        .to(p.pose.scale, { x: 1, y: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' });
    });
  }

  /** Rooks stomp one square at a time, shaking the board as they land. */
  private stomp(p: PieceNode, from: Square, to: Square): Promise<void> {
    const a = this.ground(from);
    const b = this.ground(to);
    const steps = Math.max(Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0])), Math.abs(Number(to[1]) - Number(from[1])));
    return new Promise((resolve) => {
      const tl = this.track(gsap.timeline({ onComplete: () => void (p.node.zIndex = b.y) }));
      tl.to(p.pose.scale, { x: 1.06, y: 0.92, duration: 0.1, ease: 'power2.out' }); // brace
      for (let i = 1; i <= steps; i++) {
        const x = a.x + ((b.x - a.x) * i) / steps;
        const y = a.y + ((b.y - a.y) * i) / steps;
        const last = i === steps;
        const L = `s${i}`;
        tl.addLabel(L)
          .to(p.node, { x, y, duration: 0.17, ease: 'power1.inOut', onUpdate: () => void (p.node.zIndex = p.node.y) }, L)
          .to(p.pose.scale, { x: 0.96, y: 1.06, duration: 0.085 }, L)
          .to(p.pose, { y: -this.W * 0.14, duration: 0.085, ease: 'power2.out' }, L)
          .to(p.pose, { y: 0, duration: 0.085, ease: 'power2.in' }, `${L}+=0.085`)
          .add(() => {
            this.dust({ x, y }, last ? 12 : 4, last ? 1.1 : 0.6);
            this.shake(last ? 7 : 1.5);
            if (last) resolve();
          }, `${L}+=0.17`)
          .to(p.pose.scale, { x: last ? 1.18 : 1.08, y: last ? 0.8 : 0.92, duration: 0.05 }, `${L}+=0.17`)
          .to(p.pose.scale, { x: 1, y: 1, duration: last ? 0.4 : 0.07, ease: last ? 'elastic.out(1, 0.5)' : 'power1.out' }, `${L}+=0.22`);
      }
    });
  }

  /** Everyone else glides with a small lift. */
  private glide(p: PieceNode, from: Square, to: Square): Promise<void> {
    const a = this.ground(from);
    const b = this.ground(to);
    const dist = Math.hypot(b.x - a.x, b.y - a.y) / this.W;
    const duration = Math.min(0.5, 0.2 + dist * 0.05);
    p.node.zIndex = Math.max(a.y, b.y) + 0.5;
    return new Promise((resolve) => {
      this.track(gsap.timeline({ onComplete: () => void (p.node.zIndex = b.y) }))
        .to(p.node, { x: b.x, y: b.y, duration, ease: 'power2.inOut' }, 0)
        .to(p.pose, { y: -this.W * 0.12, duration: duration / 2, ease: 'power2.out' }, 0)
        .to(p.pose, { y: 0, duration: duration / 2, ease: 'power2.in' }, duration / 2)
        .add(() => {
          this.dust(b, 4, 0.6);
          resolve();
        })
        .to(p.pose.scale, { x: 1.1, y: 0.9, duration: 0.05 })
        .to(p.pose.scale, { x: 1, y: 1, duration: 0.25, ease: 'back.out(3)' });
    });
  }

  /** Capture: a freeze frame, a white flash, then the piece is knocked off the board. */
  private async knockOut(v: PieceNode, from: Square, to: Square) {
    const a = this.center(from);
    const b = this.center(to);
    const dir = Math.sign(b.x - a.x) || (Math.random() < 0.5 ? -1 : 1);
    v.glowTween?.kill();
    v.glow.alpha = 0;
    v.node.zIndex = 2e6;

    const flash = new ColorMatrixFilter();
    flash.brightness(2.6, false);
    v.body.filters = [flash];
    this.sparks(this.ground(to), 14);

    // Hit stop: slow everything to a crawl for a beat.
    const speed = gsap.globalTimeline.timeScale();
    gsap.globalTimeline.timeScale(speed * 0.05);
    await sleep(90 / speed);
    gsap.globalTimeline.timeScale(speed);
    if (v.node.destroyed) return;
    v.body.filters = [];
    this.shake(9);

    const W = this.W;
    await new Promise<void>((resolve) => {
      gsap.to(v.node, { x: v.node.x + dir * W * 1.1, duration: 0.6, ease: 'power2.out' });
      gsap.to(v.pose, { y: -W * 0.9, rotation: dir * 1.6, duration: 0.6, ease: 'power2.out' });
      gsap.to(v.shadow, { alpha: 0, duration: 0.2 });
      gsap.to(v.node, {
        alpha: 0,
        duration: 0.45,
        delay: 0.15,
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
    const dots = new Graphics();
    const r = this.W * 0.045;
    for (const [p, q] of [
      [a, corner],
      [corner, b],
    ] as const) {
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      const n = Math.max(2, Math.round(len / (this.W * 0.2)));
      for (let i = 0; i <= n; i++) dots.circle(p.x + ((q.x - p.x) * i) / n, p.y + ((q.y - p.y) * i) / n, r);
    }
    dots.fill({ color: 0xffe08a, alpha: 0.95 }).stroke({ width: 1, color: 0x5a3b10, alpha: 0.6 });
    this.trail.addChild(dots);
    gsap.fromTo(dots, { alpha: 0 }, { alpha: 1, duration: 0.15 });
    gsap.to(dots, { alpha: 0, duration: 0.5, delay: 0.9, onComplete: () => dots.destroy() });
  }

  private dust(p: Point, n: number, size = 1) {
    if (this.reduced) return;
    const W = this.W;
    for (let i = 0; i < n; i++) {
      const g = new Graphics().circle(0, 0, W * 0.05 * size * rand(0.6, 1.2)).fill({ color: COLORS.dust, alpha: 0.75 });
      g.position.set(p.x + rand(-0.2, 0.2) * W, p.y - W * 0.05 + rand(-0.04, 0.04) * W);
      this.fx.addChild(g);
      const ang = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
      gsap.to(g, {
        x: g.x + Math.cos(ang) * W * 0.4 * size,
        y: g.y + Math.sin(ang) * W * 0.12 * size - W * 0.06,
        alpha: 0,
        duration: rand(0.45, 0.7),
        ease: 'power2.out',
        onComplete: () => g.destroy(),
      });
      gsap.to(g.scale, { x: 1.8, y: 1.8, duration: 0.6 });
    }
  }

  private sparks(p: Point, n: number) {
    if (this.reduced) return;
    const W = this.W;
    for (let i = 0; i < n; i++) {
      const g = new Graphics().rect(-W * 0.02, -W * 0.08, W * 0.04, W * 0.16).fill(COLORS.spark);
      const ang = rand(0, Math.PI * 2);
      g.position.set(p.x, p.y - W * 0.45);
      g.rotation = ang + Math.PI / 2;
      this.fx.addChild(g);
      gsap.to(g, {
        x: p.x + Math.cos(ang) * W * rand(0.4, 0.8),
        y: p.y - W * 0.45 + Math.sin(ang) * W * rand(0.3, 0.6),
        alpha: 0,
        duration: rand(0.3, 0.5),
        ease: 'power3.out',
        onComplete: () => g.destroy(),
      });
    }
  }

  private shake(px: number) {
    if (this.reduced || px <= 0) return;
    gsap.killTweensOf(this.world.position);
    const tl = gsap.timeline();
    const n = 6;
    for (let i = 0; i < n; i++) {
      const k = (1 - i / n) * px;
      tl.to(this.world.position, { x: rand(-k, k), y: rand(-k, k), duration: 0.03 });
    }
    tl.to(this.world.position, { x: 0, y: 0, duration: 0.05 });
  }

  // ---------- input ----------

  private onTap(gx: number, gy: number) {
    if (this.busy || !this.view) return;
    const local = this.world.toLocal({ x: gx, y: gy });
    const sq = this.squareAt(local.x, local.y);
    // A move target wins, even if a figurine in front overlaps it.
    if (sq && this.view.targets.has(sq)) return this.onSquare(sq);
    // Otherwise a tap on a figurine's body picks that figurine, front-most first.
    const front = [...this.pieces.values()].sort((a, b) => b.node.zIndex - a.node.zIndex);
    for (const p of front) if (p.body.getBounds().containsPoint(gx, gy)) return this.onSquare(p.square);
    if (sq) this.onSquare(sq);
  }
}

function scaleColor(hex: number, k: number): number {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * k));
  const b = Math.min(255, Math.round((hex & 255) * k));
  return (r << 16) | (g << 8) | b;
}
