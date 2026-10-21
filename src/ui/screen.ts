import Phaser from 'phaser';
import { CSS, SERIF } from './theme';

/**
 * Crisp rendering on high-density screens: the canvas is sized in device pixels and
 * shown at CSS size (scale zoom 1/dpr), and every scene camera zooms by dpr so game
 * code can lay things out in CSS pixels.
 */
export const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

export const LAYOUT_EVENT = 'layout';

let probe: HTMLDivElement | null = null;
/** The page's safe-area insets (iPhone notch and home bar), read from CSS env(). */
export function safeInsets() {
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  return { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0, left: parseFloat(cs.paddingLeft) || 0, right: parseFloat(cs.paddingRight) || 0 };
}

/** Resizes the canvas to the window. Call on boot and whenever the window changes size. */
export function fitGame(game: Phaser.Game) {
  const d = dpr();
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  game.scale.setZoom(1 / d);
  game.scale.resize(Math.round(w * d), Math.round(h * d));
  game.events.emit(LAYOUT_EVENT);
}

export type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/**
 * A scene that lays itself out in CSS pixels and rebuilds on resize. Subclasses draw
 * everything in `build()` from their own state, so a rebuild is always safe.
 */
export abstract class BaseScene extends Phaser.Scene {
  private pendingLayout = false;

  /** Viewport width and height in CSS pixels. */
  get W() {
    return this.scale.width / dpr();
  }
  get H() {
    return this.scale.height / dpr();
  }
  /** Desktop layout: board on the left, side panel on the right. */
  get wide() {
    return this.W >= 640 && this.W > this.H * 1.05;
  }
  /** Notch and home-bar insets in CSS pixels. */
  get safe() {
    return safeInsets();
  }

  /** Subclasses set up state in Phaser's `init(data)`; create() only wires layout and builds. */
  create() {
    this.applyCamera();
    const onLayout = () => this.requestLayout();
    this.game.events.on(LAYOUT_EVENT, onLayout);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(LAYOUT_EVENT, onLayout));
    this.build();
  }

  /** Draws the whole screen from state. */
  protected abstract build(): void;

  /** Return false while something (like an animation) must finish before a rebuild. */
  protected canRebuild(): boolean {
    return true;
  }

  private applyCamera() {
    const cam = this.cameras.main;
    cam.setOrigin(0, 0);
    cam.setSize(this.scale.width, this.scale.height);
    cam.setZoom(dpr());
    cam.setScroll(0, 0);
  }

  requestLayout() {
    if (!this.scene.isActive()) return;
    if (!this.canRebuild()) {
      this.pendingLayout = true;
      return;
    }
    this.pendingLayout = false;
    this.applyCamera();
    this.rebuild();
  }

  /** Call when whatever blocked a rebuild has finished. */
  protected flushLayout() {
    if (this.pendingLayout) this.requestLayout();
  }

  /** Clears the display list and draws again. */
  protected rebuild() {
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.children.removeAll(true);
    this.build();
  }

  /** Text at the device resolution so it stays sharp. */
  text(x: number, y: number, s: string, style: TextStyle = {}): Phaser.GameObjects.Text {
    return this.add.text(x, y, s, {
      fontFamily: SERIF,
      fontSize: '16px',
      color: CSS.ink,
      resolution: dpr(),
      ...style,
    });
  }
}
