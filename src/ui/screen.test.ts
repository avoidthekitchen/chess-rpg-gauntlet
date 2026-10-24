import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';

// screen.ts extends Scene, but these queue regressions need no browser renderer.
vi.mock('phaser', () => ({ default: { Scene: class {} } }));
import { goTo } from './screen';

type Status = 'dormant' | 'initializing' | 'creating' | 'running' | 'shutdown';
type Operation = { kind: 'stop' | 'start'; key: string; data?: object };
interface TestScene {
  status: Status;
  scene: { key: string; stop: () => void; start: (key: string, data?: object) => void };
  init?: (data?: object) => void;
  create?: () => void;
  shutdown?: () => void;
}

/** Phaser 4 ScenePlugin queues stop/start; SceneManager.start initializes immediately.
 * processQueue also drains operations added by init/create during that same frame.
 * getScenes(true) includes RUNNING scenes, excluding init/create and queued starts.
 */
class TransitionHarness {
  private scenes: TestScene[] = [];
  private queue: Operation[] = [];
  readonly manager = {
    getScenes: (activeOnly = true) => this.scenes.filter(scene => !activeOnly || scene.status === 'running'),
    getScene: (key: string) => {
      const scene = this.scenes.find(scene => scene.scene.key === key);
      if (!scene) throw new Error(`Unknown scene ${key}`);
      return scene;
    },
    start: (key: string, data?: object) => {
      const scene = this.manager.getScene(key);
      if (scene.status === 'initializing' || scene.status === 'creating') return;
      if (scene.status === 'running') this.stop(key);
      scene.status = 'initializing';
      scene.init?.(data);
      scene.status = 'creating';
      scene.create?.();
      scene.status = 'running';
    },
  };
  readonly game = { scene: this.manager } as unknown as Phaser.Game;

  add(key: string, status: Status = 'dormant'): TestScene {
    const scene: TestScene = { status, scene: {
      key,
      stop: () => { this.queue.push({ kind: 'stop', key }); },
      start: (target, data) => {
        // ScenePlugin.start stops its own scene before starting its target.
        this.queue.push({ kind: 'stop', key }, { kind: 'start', key: target, data });
      },
    } };
    this.scenes.push(scene);
    return scene;
  }
  private stop(key: string) {
    const scene = this.manager.getScene(key);
    if (scene.status === 'shutdown') return;
    scene.status = 'shutdown';
    scene.shutdown?.();
  }
  frame() {
    for (let index = 0; index < this.queue.length; index++) {
      const operation = this.queue[index];
      if (operation.kind === 'stop') this.stop(operation.key);
      else this.manager.start(operation.key, operation.data);
    }
    this.queue = [];
  }
  get active() { return this.manager.getScenes().map(scene => scene.scene.key); }
}

// The former helper queued shutdown but initialized the destination immediately.
function legacyGoTo(game: Phaser.Game, key: string, data?: object) {
  for (const scene of game.scene.getScenes(true)) if (scene.scene.key !== key) scene.scene.stop();
  game.scene.start(key, data);
}

describe('screen transitions', () => {
  it('initializes the destination only after outgoing HUD and save cleanup', () => {
    const exercise = (navigate: typeof goTo) => {
      const engine = new TransitionHarness();
      const state = { lessonHud: true, resultSaved: false };
      const course = engine.add('CoursePlay', 'running');
      course.shutdown = () => { state.lessonHud = false; state.resultSaved = true; };
      const observed: object[] = [];
      const ending = engine.add('ChapterEnding');
      ending.init = data => { observed.push({ ...state, data }); };
      navigate(engine.game, 'ChapterEnding', { region: 'finale' });
      const beforeFrame = [...observed];
      engine.frame();
      return { beforeFrame, observed, active: engine.active };
    };
    const transition = exercise(goTo);
    expect(transition.beforeFrame).toEqual([]);
    expect(transition.observed).toEqual([{ lessonHud: false, resultSaved: true, data: { region: 'finale' } }]);
    expect(transition.active).toEqual(['ChapterEnding']);
    // This same observable would catch the original overlapping-HUD regression.
    expect(exercise(legacyGoTo).observed).toEqual([{ lessonHud: true, resultSaved: false, data: { region: 'finale' } }]);
  });

  it('leaves only the last destination active after two navigations before a frame', () => {
    const engine = new TransitionHarness();
    engine.add('CoursePlay', 'running');
    engine.add('Journey');
    engine.add('ChapterEnding');
    goTo(engine.game, 'Journey');
    goTo(engine.game, 'ChapterEnding');
    engine.frame();
    expect(engine.active).toEqual(['ChapterEnding']);
  });

  it('cleans an initializing CoursePlay that redirects before it becomes active', () => {
    const engine = new TransitionHarness();
    const course = engine.add('CoursePlay');
    engine.add('Journey');
    let lessonHud = false;
    course.init = () => {
      expect(engine.active).not.toContain('CoursePlay');
      goTo(engine.game, 'Journey');
    };
    course.create = () => { lessonHud = true; };
    course.shutdown = () => { lessonHud = false; };
    engine.manager.start('CoursePlay');
    engine.frame();
    expect(engine.active).toEqual(['Journey']);
    expect(lessonHud).toBe(false);
  });

  it('shuts down Boot when it navigates from create before RUNNING status', () => {
    const engine = new TransitionHarness();
    const boot = engine.add('Boot');
    engine.add('Journey');
    let bootResources = true;
    boot.create = () => {
      expect(engine.active).not.toContain('Boot');
      goTo(engine.game, 'Journey');
    };
    boot.shutdown = () => { bootResources = false; };
    engine.manager.start('Boot');
    engine.frame();
    expect(engine.active).toEqual(['Journey']);
    expect(bootResources).toBe(false);
  });
});
