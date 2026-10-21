import '@fontsource/alegreya/latin-400.css';
import '@fontsource/alegreya/latin-700.css';
import '@fontsource/alegreya/latin-400-italic.css';
import Phaser from 'phaser';
import './engineHost';
import './ui/overlay.css';
import { BattleScene } from './scenes/Battle';
import { BootScene } from './scenes/Boot';
import { SelectScene } from './scenes/Select';
import { TitleScene } from './scenes/Title';
import { dpr, fitGame } from './ui/screen';
import { C } from './ui/theme';

async function start() {
  // Phaser draws text onto canvases, so the web font must be ready first.
  try {
    await Promise.race([
      Promise.all([document.fonts.load('16px Alegreya'), document.fonts.load('bold 16px Alegreya'), document.fonts.load('italic 16px Alegreya')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* fall back to the serif stack */
  }

  const d = dpr();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: C.bg,
    scale: {
      mode: Phaser.Scale.NONE,
      width: Math.round(window.innerWidth * d),
      height: Math.round(window.innerHeight * d),
      zoom: 1 / d,
    },
    render: { antialias: true, mipmapFilter: 'LINEAR_MIPMAP_LINEAR' },
    input: { activePointers: 2 },
    // Dev only: ?loop=timeout keeps the game running in a hidden test browser, where requestAnimationFrame pauses.
    fps: import.meta.env.DEV && new URLSearchParams(location.search).get('loop') === 'timeout' ? { forceSetTimeOut: true, target: 60 } : undefined,
    scene: [BootScene, TitleScene, SelectScene, BattleScene],
  });

  // Size the canvas once Phaser has booted, and again whenever the window changes.
  game.events.once(Phaser.Core.Events.READY, () => fitGame(game));
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fitGame(game), 120);
  };
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  if (import.meta.env.DEV) Object.assign(window, { __game: game });
}

void start();
