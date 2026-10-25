import type { Color, PieceSymbol } from 'chess.js';
import type Phaser from 'phaser';
import type { BaseScene } from './screen';
import { portraitFraming, pieceName, portraitKey, tokenPortraitKey, type Faction, type Side, type SpeakerInfo, type PortraitCharacter } from './speaker';
import { C, CSS, SANS, SERIF } from './theme';

/** Inline CSS that frames a figurine's head in a small HTML portrait (dialogue in the overlay). */
export function portraitStyle(type: PieceSymbol, side: 'ally' | Faction, character?: PortraitCharacter) {
  const f = portraitFraming(type, side) ?? { size: 1.3, x: 0.5, y: 0.04 };
  return `background-image:url('${import.meta.env.BASE_URL}sprites/${character ?? `${pieceName(type)}-${side}`}.webp');background-size:${f.size * 100}%;background-position:${f.x * 100}% ${f.y * 100}%`;
}

/**
 * Draws a tall portrait of a piece into a box: the detailed figurine framed on its head
 * and headgear, or its board token when there is no figurine yet.
 */
export function portrait(
  scene: BaseScene,
  x: number,
  y: number,
  w: number,
  h: number,
  type: PieceSymbol,
  side: Side,
  faction: Faction,
  parent?: Phaser.GameObjects.Container,
  allyColor: Color = 'w',
  character?: PortraitCharacter,
) {
  const g = scene.add.graphics();
  g.fillStyle(side === 'ally' ? 0x3a2c22 : 0x2a2418, 1).fillRoundedRect(x, y, w, h, 10);
  parent?.add(g);
  const has = (k: string) => scene.textures.exists(k);
  // Missing art falls back to the board token.
  const key = portraitKey(type, side, faction, character);
  const frame = portraitFraming(type, side === 'ally' ? 'ally' : faction);
  if (frame && scene.textures.exists(key)) {
    const img = scene.add.image(0, 0, key).setOrigin(0, 0);
    const iw = img.width;
    const ih = img.height;
    const s = (frame.size * w) / iw;
    const ox = (w - iw * s) * frame.x;
    const oy = (h - ih * s) * frame.y;
    img.setScale(s).setPosition(x + ox, y + oy);
    img.setCrop(-ox / s + 2 / s, -oy / s + 2 / s, (w - 4) / s, (h - 4) / s);
    parent?.add(img);
  } else {
    const tkey = tokenPortraitKey(type, side, faction, allyColor);
    if (has(tkey)) {
      const img = scene.add.image(x + w / 2, y + h * 0.62, tkey).setOrigin(0.5, 0.5);
      img.setScale(Math.min(w / img.width, h / img.height) * 0.92);
      parent?.add(img);
    }
  }
  const ring = scene.add.graphics();
  ring.lineStyle(2, side === 'ally' ? C.gold : C.red, 0.55).strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 10);
  parent?.add(ring);
}

/**
 * The talking-head card: portrait, name and line. Returns the container and its height.
 * `compact` is the phone version that floats over the bottom of the screen.
 */
export function speakerCard(
  scene: BaseScene,
  x: number,
  y: number,
  w: number,
  info: SpeakerInfo,
  faction: Faction,
  compact: boolean,
  allyColor: Color = 'w',
) {
  const c = scene.add.container(x, y);
  const pw = compact ? 62 : 76;
  const ph = compact ? 86 : 104;
  const pad = 10;
  const textX = pad + pw + 14;
  const textW = w - textX - 14;
  const who = scene.text(textX, 0, info.name.toUpperCase(), {
    fontFamily: SANS,
    fontSize: '12px',
    color: info.side === 'ally' ? CSS.gold : CSS.red,
    letterSpacing: 0.8,
    wordWrap: { width: textW },
  });
  const line = scene.text(textX, 0, info.line, {
    fontFamily: SERIF,
    fontSize: compact ? '17px' : '18px',
    color: CSS.ink,
    wordWrap: { width: textW, useAdvancedWrap: true },
    lineSpacing: 1,
  });
  const textH = who.height + 2 + line.height;
  const h = Math.max(ph + pad * 2, textH + pad * 2);
  who.y = (h - textH) / 2;
  line.y = who.y + who.height + 2;

  const bg = scene.add.graphics();
  if (compact) bg.fillStyle(0x000000, 0.35).fillRoundedRect(2, 8, w, h, 10);
  bg.fillStyle(C.surface, 0.97).fillRoundedRect(0, 0, w, h, 10);
  bg.lineStyle(1, C.line, 1).strokeRoundedRect(0.5, 0.5, w - 1, h - 1, 10);
  bg.fillStyle(info.side === 'ally' ? C.gold : C.red, 1).fillRoundedRect(0, 0, 4, h, { tl: 10, bl: 10, tr: 0, br: 0 });
  c.add(bg);
  portrait(scene, pad, (h - ph) / 2, pw, ph, info.type, info.side, faction, c, allyColor, info.character);
  c.add([who, line]);
  return { container: c, height: h };
}
