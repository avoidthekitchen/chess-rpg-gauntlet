import Phaser from 'phaser';
import { goTo } from '../ui/screen';
import { prepareJourneyPreview } from '../journeySave';

const PIECES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
// Chapter 1 (Bog) loads up front. Later chapters load their tokens in CoursePlay.preload; course portraits are CSS images.
const SPRITE_SETS = ['ally', 'bog'];
const COLORS = ['w', 'b'];
export const BACKGROUNDS = ['title', 'map-region1', 'map-region2', 'map-region3', 'map-region4', 'map-region5', 'map-finale', 'town', 'battle-bog'];

/** Loads the ally and Bog sprites and every painted background (progress shows in the HTML boot note), then starts the title. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    this.load.setPath(`${import.meta.env.BASE_URL}`);
    for (const p of PIECES) {
      for (const f of SPRITE_SETS) {
        for (const c of COLORS) this.load.image(`token-${p}-${f}-${c}`, `sprites/token-${p}-${f}-${c}.webp`);
        this.load.image(`${p}-${f}`, `sprites/${p}-${f}.webp`);
      }
    }
    for (const b of BACKGROUNDS) this.load.image(`bg-${b}`, `backgrounds/${b}.webp`);
    // A missing sprite isn't fatal: the board and portraits fall back to tokens or glyphs.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (f: Phaser.Loader.File) => console.info(`Optional art missing: ${f.key}`));
    const note = document.getElementById('boot');
    this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => {
      if (note) note.textContent = `Opening your story… ${Math.round(v * 100)}%`;
    });
  }

  create() {
    document.getElementById('boot')?.remove();
    const preview = prepareJourneyPreview();
    goTo(this.game, 'journey', preview ? { page: 'map' } : undefined);
  }
}
