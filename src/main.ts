import '@fontsource/alegreya/latin-400.css';
import '@fontsource/alegreya/latin-700.css';
import '@fontsource/alegreya/latin-400-italic.css';
import Phaser from 'phaser';
import './ui/overlay.css';
import { BootScene } from './scenes/Boot';
import { dpr, fitGame } from './ui/screen';
import { C } from './ui/theme';
import { JourneyScene } from './scenes/Journey';
import { CoursePlayScene } from './scenes/CoursePlay';

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
    // windowEvents off: releases outside the canvas (e.g. on an HTML dialog) must not count as taps.
    input: { activePointers: 2, windowEvents: false },
    // Testing aid: ?loop=timeout keeps the game running in a hidden test browser, where requestAnimationFrame pauses.
    fps: new URLSearchParams(location.search).get('loop') === 'timeout' ? { forceSetTimeOut: true, target: 60 } : undefined,
    scene: [BootScene, JourneyScene, CoursePlayScene],
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
