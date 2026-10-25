import type { Square } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';
import { BOARD_HEADER_TUCK, BOARD_TOP, DEPTH } from './boardGeometry';
import { PhaserBoard } from './phaserBoard';

vi.mock('phaser', () => ({ default: {} }));

type HopHarness = {
  hop: (piece: unknown, from: Square, to: Square) => Promise<void>;
};

describe('knight animation headroom', () => {
  // The published e8-f6 move in xhzWa crossed the phone header before its arc midpoint.
  const moves: [Square, Square][] = [['e8', 'f6'], ['f6', 'e8'], ['b8', 'd7'], ['d7', 'b8']];
  const styles = [
    { name: 'token with rim', width: 0.68, height: 0.99, origin: 0.95 },
    { name: 'classic glyph', width: 0.95, height: 1.2, origin: 0.92 },
  ];

  for (const style of styles) for (const flipped of [false, true]) {
    it(`keeps the complete ${style.name} below the header, flipped=${flipped}`, () => {
      for (const width of [28, 44.42, 80]) for (const [from, to] of moves) {
        // Mirroring the squares exercises the same visible back rank on a flipped board.
        const orient = (sq: Square) => flipped ? `${sq[0]}${9 - Number(sq[1])}` as Square : sq;
        const rootY = 48;
        const pose = { y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
        const node = {
          x: 0, y: 0,
          setPosition(x: number, y: number) { this.x = x; this.y = y; },
          setDepth() {},
        };
        // Compute the transformed image rectangle independently of the animation code.
        const body = { getBounds() {
          const xs = [-style.width / 2, style.width / 2];
          const ys = [-style.height * style.origin, style.height * (1 - style.origin)];
          const top = Math.min(...xs.flatMap(x => ys.map(y => rootY + node.y + pose.y + width * (
            x * pose.scaleX * Math.sin(pose.rotation) + y * pose.scaleY * Math.cos(pose.rotation)
          ))));
          return { top };
        } };
        let update!: (tw: { getValue: () => number }) => void;
        const board = Object.assign(Object.create(PhaserBoard.prototype) as HopHarness, {
          W: width, H: width * DEPTH, m: width * 0.32, top: width * BOARD_TOP,
          opts: { flipped }, root: { y: rootY },
          scene: { tweens: { addCounter: (cfg: { onUpdate: typeof update }) => { update = cfg.onUpdate; } } },
          tween: () => {}, after: () => {}, drawKnightPath: () => {},
        });
        void board.hop({ node, pose, body, shadow: { setScale() {}, alpha: 1 } }, orient(from), orient(to));
        for (let frame = 0; frame <= 100; frame++) {
          // Follow the real cubic stretch and quadratic return during the 460ms flight.
          const time = 460 * frame / 100;
          const stretch = 1 - (1 - Math.min(1, time / 120)) ** 3;
          const settle = 1 - (1 - Math.min(1, Math.max(0, time - 140) / 200)) ** 2;
          pose.scaleX = time < 140 ? 1.14 - 0.24 * stretch : 0.9 + 0.1 * settle;
          pose.scaleY = time < 140 ? 0.82 + 0.32 * stretch : 1.14 - 0.14 * settle;
          update({ getValue: () => frame / 100 });
          // While lifted, the knight keeps a 2px reserve below the header. It is never pushed below
          // its square; where it rests is the board layout's concern, not the jump's.
          const label = `${from}-${to}, frame ${frame}, square width ${width}`;
          expect(pose.y, label).toBeLessThanOrEqual(0);
          if (pose.y < 0) expect(body.getBounds().top, label).toBeGreaterThanOrEqual(rootY + BOARD_HEADER_TUCK + 2 - 1e-9);
        }
      }
    });
  }

  it('never pushes the knight below its square when it already rests above the ceiling', () => {
    const pose = { y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    const node = { x: 0, y: 0, setPosition(x: number, y: number) { this.x = x; this.y = y; }, setDepth() {} };
    // A body taller than the room above the board, so the ceiling is always above its rest point.
    const body = { getBounds: () => ({ top: node.y + pose.y - 100 }) };
    let update!: (tw: { getValue: () => number }) => void;
    const width = 20;
    const board = Object.assign(Object.create(PhaserBoard.prototype) as HopHarness, {
      W: width, H: width * DEPTH, m: width * 0.32, top: width * BOARD_TOP,
      opts: { flipped: false }, root: { y: 0 },
      scene: { tweens: { addCounter: (cfg: { onUpdate: typeof update }) => { update = cfg.onUpdate; } } },
      tween: () => {}, after: () => {}, drawKnightPath: () => {},
    });
    void board.hop({ node, pose, body, shadow: { setScale() {}, alpha: 1 } }, 'b8', 'd7');
    for (let frame = 0; frame <= 100; frame++) {
      update({ getValue: () => frame / 100 });
      expect(pose.y, `frame ${frame}`).toBeLessThanOrEqual(0);
    }
  });
});
