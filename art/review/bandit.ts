// Development-only visual proof. Vite's production entry does not import this page.
import Phaser from 'phaser';
import { Chess, type Color } from 'chess.js';
import { PhaserBoard, BOARD_SPAN } from '../../src/ui/phaserBoard';
import type { BaseScene } from '../../src/ui/screen';
import { portraitStyle } from '../../src/ui/portrait';
import type { PieceSymbol } from 'chess.js';

const pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const types: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k'];
let ready = 0;
for (const [id, allyColor] of [['black', 'w'], ['white', 'b'], ['black-gray', 'w'], ['white-gray', 'b']] as const) {
  class Proof extends Phaser.Scene {
    preload() {
      for (const piece of pieces) for (const faction of ['ally', 'bandit']) for (const color of ['w', 'b']) {
        this.load.image(`token-${piece}-${faction}-${color}`, `/sprites/token-${piece}-${faction}-${color}.webp`);
      }
    }
    text(x: number, y: number, value: string, style = {}) {
      return this.add.text(x, y, value, { fontFamily: 'Georgia', resolution: 2, ...style });
    }
    create() {
      const board = new PhaserBoard(this as unknown as BaseScene, 0, 0, BOARD_SPAN * 45, {
        faction: 'bandit', style: 'tokens', intro: false, allyColor: allyColor as Color, flipped: allyColor === 'b', onSquare: () => {},
      });
      board.render({ chess: new Chess(), selected: null, targets: new Set(), lastMove: null, threats: null, villages: [] });
      if (++ready === 4) document.body.dataset.boardsReady = 'true';
    }
  }
  new Phaser.Game({ type: Phaser.CANVAS, parent: id, width: 387, height: 362, transparent: true, scene: [Proof], banner: false,
    fps: { forceSetTimeOut: true, target: 10 }, render: { antialias: true } });
}
for (const faction of ['ally', 'bog', 'bandit']) {
  const section = document.querySelector('#token-comparison')!;
  section.insertAdjacentHTML('beforeend', `<h2>${faction === 'bandit' ? 'New Bandit Riders' : `Existing ${faction}`}</h2><div class="tokens">${pieces.map(piece => `<figure><img src="/sprites/token-${piece}-${faction}-w.webp" alt="${piece}"/><figcaption>${piece}</figcaption></figure>`).join('')}</div>`);
}
const names = ['Raccoon Pawn', 'Hare Knight', 'Magpie Bishop', 'Badger Rook', 'Stoat Queen', 'Ashfang · Wolf King'];
document.querySelector('.portraits')!.innerHTML = pieces.map((piece, i) => `<figure><figcaption>${names[i]}</figcaption><div class="portrait-pair"><img src="/sprites/${piece}-bandit.webp" alt="${names[i]} figurine"/><span class="crop" style="${portraitStyle(types[i], 'bandit').replace("./sprites/", "/sprites/")}" aria-label="Portrait card crop"></span></div></figure>`).join('') + `<figure><figcaption>Tadwell, the Frog Captain</figcaption><div class="portrait-pair"><img src="/sprites/tadwell.webp" alt="Tadwell figurine"/><span class="crop" style="${portraitStyle('n', 'ally', 'tadwell').replace("./sprites/", "/sprites/")}" aria-label="Tadwell portrait card crop"></span></div></figure>`;
