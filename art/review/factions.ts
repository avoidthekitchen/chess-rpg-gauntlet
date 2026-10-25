// Development-only proof: actual PhaserBoard and shipped sprite/portrait framing.
import Phaser from 'phaser';
import { Chess, type Color, type PieceSymbol } from 'chess.js';
import { PhaserBoard, BOARD_SPAN } from '../../src/ui/phaserBoard';
import type { BaseScene } from '../../src/ui/screen';
import { portraitStyle } from '../../src/ui/portrait';
import { FACTIONS, FACTION_SPECIES, type Faction } from '../../src/ui/speaker';

const params = new URLSearchParams(location.search);
const requested = params.get('faction');
const faction: Faction = FACTIONS.find(f => f === requested) ?? 'warden';
const titles = { bog: 'Bog Goblins', bandit: 'Bandit Riders', warden: 'Bone Wardens', cult: 'Shadow Cult', legion: 'Iron Legion' };
const pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const types: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k'];
document.querySelector('#board-proof h1')!.textContent = `${titles[faction]} · production token proof`;
let ready = 0;
for (const [id, allyColor] of [['black', 'w'], ['white', 'b'], ['black-gray', 'w'], ['white-gray', 'b']] as const) {
  class Proof extends Phaser.Scene {
    preload() {
      for (const piece of pieces) for (const set of ['ally', faction]) for (const color of ['w', 'b']) {
        this.load.image(`token-${piece}-${set}-${color}`, `/sprites/token-${piece}-${set}-${color}.webp`);
      }
    }
    text(x: number, y: number, value: string, style = {}) {
      return this.add.text(x, y, value, { fontFamily: 'Georgia', resolution: 2, ...style });
    }
    create() {
      const board = new PhaserBoard(this as unknown as BaseScene, 0, 0, BOARD_SPAN * 45, {
        faction, style: 'tokens', intro: false, allyColor: allyColor as Color, flipped: allyColor === 'b', onSquare: () => {},
      });
      board.render({ chess: new Chess(), selected: null, targets: new Set(), lastMove: null, threats: null, villages: [] });
      if (++ready === 4) document.body.dataset.boardsReady = 'true';
    }
  }
  new Phaser.Game({ type: Phaser.CANVAS, parent: id, width: 387, height: 362, transparent: true, scene: [Proof], banner: false,
    fps: { forceSetTimeOut: true, target: 10 }, render: { antialias: true } });
}
for (const set of ['ally', 'bandit', faction]) {
  document.querySelector('#token-comparison')!.insertAdjacentHTML('beforeend', `<h2>${set}</h2><div class="tokens">${pieces.map(piece => `<figure><img src="/sprites/token-${piece}-${set}-w.webp" alt="${piece}"/><figcaption>${piece}</figcaption></figure>`).join('')}</div>`);
}
if (params.get('stage') === 'tokens') document.querySelector('#portrait-proof')!.remove();
else {
  document.querySelector('.portraits')!.innerHTML = pieces.map((piece, i) => {
    const name = FACTION_SPECIES[faction][types[i]];
    return `<figure><figcaption>${name}</figcaption><div class="portrait-pair"><img src="/sprites/${piece}-${faction}.webp" alt="${name} figurine"/><span class="crop" style="${portraitStyle(types[i], faction).replace('./sprites/', '/sprites/')}" aria-label="Portrait card crop"></span></div></figure>`;
  }).join('') + (faction === 'warden' ? `<figure><figcaption>The Lich King · finale only</figcaption><div class="portrait-pair"><img src="/sprites/lich-king.webp" alt="The Lich King"/><span class="crop" style="${portraitStyle('k', 'warden', 'lich-king').replace('./sprites/', '/sprites/')}" aria-label="Lich King portrait card crop"></span></div></figure>` : '');
}
