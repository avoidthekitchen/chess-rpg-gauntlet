import type Phaser from 'phaser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleScene } from './Battle';
import type { CueQueue } from '../ui/cueQueue';

// Keep the real scene methods, Clock and TweenManager; omit only the browser renderer and worker.
vi.mock('phaser', () => ({ default: { Scene: class {} } }));
vi.mock('../engineHost', () => ({ engine: {}, engineStatus: 'fallback' }));
// Phaser's browser entry needs a canvas. These standalone modules use the public Phaser types below.
// @ts-expect-error Phaser only publishes declarations for its main entry.
import ClockModule from '../../node_modules/phaser/src/time/Clock.js';
// @ts-expect-error Phaser only publishes declarations for its main entry.
import TweenManagerModule from '../../node_modules/phaser/src/tweens/TweenManager.js';
// @ts-expect-error Phaser only publishes declarations for its main entry.
import EventEmitterModule from '../../node_modules/phaser/src/events/EventEmitter.js';
const Clock = ClockModule as typeof Phaser.Time.Clock;
const TweenManager = TweenManagerModule as typeof Phaser.Tweens.TweenManager;
const EventEmitter = EventEmitterModule as typeof Phaser.Events.EventEmitter;

// Access the scene's private cue entry points without widening its production API.
type CueScene = {
  cues: CueQueue;
  showBanner(text: string, kind: 'ally' | 'foe'): void;
  build(): void;
  layout(): { wide: boolean; board: { x: number; y: number; w: number } };
  board: { height: number; busy: boolean };
};

function setup() {
  vi.useFakeTimers();
  vi.stubGlobal('window', { devicePixelRatio: 1, setTimeout, clearTimeout });
  const scene = new BattleScene();
  const cues = scene as unknown as CueScene;
  const events = new EventEmitter();
  Object.assign(scene, { sys: { events, game: { loop: { time: 0 } } } });
  const clock = new Clock(scene);
  const tweens = new TweenManager(scene);
  events.emit('start');
  const labels: { text: string; alpha: number; destroyed: boolean }[] = [];
  const text = vi.fn((_x: number, y: number, value: string) => {
    const label = {
      text: value, y, alpha: 1, scale: 1, destroyed: false,
      setOrigin() { return this; },
      setDepth() { return this; },
      setScale(value: number) { this.scale = value; return this; },
      setAlpha(value: number) { this.alpha = value; return this; },
      destroy() { this.destroyed = true; },
    };
    labels.push(label);
    return label;
  });
  Object.assign(scene, {
    time: clock, tweens, text, children: { list: labels },
    scene: { isActive: () => true }, scale: { width: 1280, height: 800 },
    cameras: { main: { setOrigin() {}, setSize() {}, setZoom() {}, setScroll() {} } },
  });
  cues.board = { height: 400, busy: false };
  vi.spyOn(cues, 'layout').mockReturnValue({ wide: true, board: { x: 0, y: 0, w: 400 } });
  vi.spyOn(cues, 'build').mockImplementation(() => {});
  const frame = () => {
    vi.advanceTimersByTime(16);
    clock.preUpdate();
    clock.update(Date.now(), 16);
    tweens.update();
  };
  const frames = (count: number) => { for (let i = 0; i < count; i++) frame(); };
  return { scene, cues, labels, frames };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('battle cue lifecycle', () => {
  it('keeps queued banners and the result wait paused while a tab is hidden', async () => {
    const { cues, labels, frames } = setup();
    cues.showBanner('Check!', 'ally');
    cues.showBanner('Foiled!', 'ally');
    frames(30);
    expect(labels[0].alpha).toBe(1);
    let idle = false;
    void cues.cues.whenIdle().then(() => { idle = true; });

    // A background tab stops animation frames, but window timers still run.
    await vi.advanceTimersByTimeAsync(4000);
    expect(labels.map((label) => label.text)).toEqual(['Check!']);
    expect(labels[0].alpha).toBe(1);
    expect(idle).toBe(false);

    frames(100);
    expect(labels.map((label) => label.text)).toEqual(['Check!', 'Foiled!']);
    expect(labels[0].destroyed).toBe(true);
    frames(100);
    await Promise.resolve();
    expect(idle).toBe(true);
    expect(labels[1].destroyed).toBe(true);
  });

  it('releases a pending result wait on resize and allows later banners', async () => {
    const { scene, cues, labels, frames } = setup();
    cues.showBanner('Check!', 'ally');
    cues.showBanner('Old queued banner', 'foe');
    frames(30); // put the hold timer on Phaser's active list before rebuilding
    let idle = false;
    void cues.cues.whenIdle().then(() => { idle = true; });

    scene.requestLayout(); // actual resize path through BattleScene and BaseScene.rebuild
    await Promise.resolve();
    expect(labels[0].destroyed).toBe(true);
    expect(cues.cues.busy).toBe(false);
    expect(idle).toBe(true);

    cues.showBanner('After resize', 'ally');
    frames(100);
    expect(labels.map((label) => label.text)).toEqual(['Check!', 'After resize']);
    expect(cues.cues.busy).toBe(false);
    expect(labels[1].destroyed).toBe(true);
  });
});
