import Phaser from 'phaser';
import type { BaseScene } from './screen';
import { C, CSS, SANS, SERIF } from './theme';

export type ButtonKind = 'primary' | 'normal' | 'ghost' | 'danger';

export interface ButtonOpts {
  w: number;
  h?: number;
  kind?: ButtonKind;
  /** Toggle buttons that are on get a red inner ring, like the prototype. */
  pressed?: boolean;
  disabled?: boolean;
  fontSize?: number;
  /** Short helper text for screen readers and the title tooltip. */
  hint?: string;
  onClick: () => void;
}

/** A rounded button. (x, y) is its top-left corner. */
export function button(scene: BaseScene, x: number, y: number, label: string, o: ButtonOpts) {
  const h = o.h ?? 40;
  const kind = o.kind ?? 'normal';
  const c = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const fill = { primary: C.gold, normal: C.surface2, ghost: C.bg, danger: 0x5a2420 }[kind];
  const ink = kind === 'primary' ? CSS.goldInk : CSS.ink;
  const draw = (hover: boolean) => {
    bg.clear();
    bg.fillStyle(fill, kind === 'ghost' ? 0.35 : 1).fillRoundedRect(0, 0, o.w, h, 8);
    const edge = hover && !o.disabled ? C.gold : o.pressed ? C.red : kind === 'primary' ? C.gold : C.line;
    bg.lineStyle(o.pressed ? 2 : 1, edge, 1).strokeRoundedRect(0.5, 0.5, o.w - 1, h - 1, 8);
  };
  draw(false);
  const t = scene.text(o.w / 2, h / 2, label, {
    fontFamily: SANS,
    fontSize: `${o.fontSize ?? 15}px`,
    color: ink,
    fontStyle: kind === 'primary' ? 'bold' : 'normal',
    align: 'center',
  });
  t.setOrigin(0.5);
  // Long labels shrink to fit rather than spill out.
  const maxW = o.w - 14;
  if (t.width > maxW) t.setScale(maxW / t.width);
  c.add([bg, t]);
  if (o.disabled) c.setAlpha(0.45);
  else {
    const zone = scene.add.zone(0, 0, o.w, h).setOrigin(0).setInteractive({ useHandCursor: true });
    // A click needs both press and release on the button.
    let pressed = false;
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => {
      pressed = false;
      draw(false);
    });
    zone.on('pointerdown', () => (pressed = true));
    zone.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e?.stopPropagation?.();
      if (!pressed) return;
      pressed = false;
      o.onClick();
    });
    c.add(zone);
  }
  c.setSize(o.w, h);
  return c;
}

export interface PanelOpts {
  fill?: number;
  alpha?: number;
  stroke?: number;
  radius?: number;
  /** A colored strip down the left edge, like the speaker card. */
  accent?: number;
}

export function panel(scene: BaseScene, x: number, y: number, w: number, h: number, o: PanelOpts = {}) {
  const g = scene.add.graphics();
  const r = o.radius ?? 10;
  g.fillStyle(o.fill ?? C.surface, o.alpha ?? 0.94).fillRoundedRect(x, y, w, h, r);
  g.lineStyle(1, o.stroke ?? C.line, 1).strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, r);
  if (o.accent !== undefined) g.fillStyle(o.accent, 1).fillRoundedRect(x, y, 4, h, { tl: r, bl: r, tr: 0, br: 0 });
  return g;
}

/** Small uppercase label, like the prototype's "eyebrow". */
export function eyebrow(scene: BaseScene, x: number, y: number, s: string, color: string = CSS.muted) {
  return scene.text(x, y, s.toUpperCase(), { fontFamily: SANS, fontSize: '11px', color, letterSpacing: 1.2 });
}

export function heading(scene: BaseScene, x: number, y: number, s: string, size = 22, color: string = CSS.ink) {
  return scene.text(x, y, s, { fontFamily: SERIF, fontSize: `${size}px`, color, fontStyle: 'bold' });
}

/** Wrapped body text. */
export function para(scene: BaseScene, x: number, y: number, s: string, width: number, size = 15, color: string = CSS.ink) {
  return scene.text(x, y, s, {
    fontFamily: SERIF,
    fontSize: `${size}px`,
    color,
    wordWrap: { width, useAdvancedWrap: true },
    lineSpacing: 2,
  });
}

/** A dim full-screen backdrop that swallows clicks. */
export function backdrop(scene: BaseScene, alpha = 0.62, onClick?: () => void) {
  const z = scene.add.rectangle(0, 0, scene.W, scene.H, 0x0c090f, alpha).setOrigin(0).setInteractive();
  if (onClick) z.on('pointerup', onClick);
  return z;
}

/** Draws an image scaled to cover the screen, centered (for painted backgrounds). */
export function coverImage(scene: BaseScene, key: string, dim = 0) {
  if (!scene.textures.exists(key)) {
    scene.add.rectangle(0, 0, scene.W, scene.H, C.bg).setOrigin(0);
    return null;
  }
  const img = scene.add.image(scene.W / 2, scene.H / 2, key);
  img.setScale(Math.max(scene.W / img.width, scene.H / img.height));
  if (dim > 0) scene.add.rectangle(0, 0, scene.W, scene.H, 0x0c090f, dim).setOrigin(0);
  return img;
}
