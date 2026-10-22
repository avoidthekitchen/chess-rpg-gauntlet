import Phaser from 'phaser';

const PIECES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const SIDES = ['ally', 'foe', 'bog'];
export const BACKGROUNDS = ['title', 'map-region1', 'town', 'battle-bog'];

/** Loads every sprite and painted background (progress shows in the HTML boot note), then starts the title. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    this.load.setPath(`${import.meta.env.BASE_URL}`);
    for (const p of PIECES) {
      for (const s of SIDES) {
        this.load.image(`token-${p}-${s}`, `sprites/token-${p}-${s}.webp`);
        // The bandits (region 2) have no squire or sorceress figurines yet; their tokens stand in.
        if (!(s === 'foe' && (p === 'pawn' || p === 'queen'))) this.load.image(`${p}-${s}`, `sprites/${p}-${s}.webp`);
      }
    }
    for (const b of BACKGROUNDS) this.load.image(`bg-${b}`, `backgrounds/${b}.webp`);
    // A missing sprite isn't fatal: the board and portraits fall back to tokens or glyphs.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (f: Phaser.Loader.File) => console.info(`Optional art missing: ${f.key}`));
    const note = document.getElementById('boot');
    this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => {
      if (note) note.textContent = `Gathering the army… ${Math.round(v * 100)}%`;
    });
  }

  create() {
    document.getElementById('boot')?.remove();
    this.scene.start('title');
  }
}
