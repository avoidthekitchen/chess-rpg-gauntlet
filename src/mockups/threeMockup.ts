/**
 * Three.js board mockup: how the battle could look and move in 3D.
 *
 * Two styles: procedural "3D toys" (compact, about one square tall) and the
 * existing painted sprites as upright cutouts. Two scripted captures show the
 * movement and capture effects: a frog knight's flip, a tortoise rook's stomp,
 * a kill-cam swoop with slow motion, a light flash and a shockwave, and the
 * captured piece breaking apart and tumbling off the board.
 *
 * Open /mockups/three.html on the dev server. Not part of the game build.
 */
import { gsap } from 'gsap';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SERVICES, cloneDeep, loadModel, tintFoe, type Service } from './models';

type Side = 'ally' | 'foe';
type Kind = 'knight' | 'rook';
/** Procedural toys, painted cutouts, or AI-generated models from one of the services. */
type Style = 'toy' | 'cutout' | Service;
const STYLES: Style[] = ['toy', 'cutout', ...SERVICES.map((s) => s.id)];
const styleLabel = (s: Style) =>
  s === 'toy' ? '3D toys' : s === 'cutout' ? 'Painted cutouts' : `${SERVICES.find((x) => x.id === s)!.label} models`;
const isModelStyle = (s: Style): s is Service => s !== 'toy' && s !== 'cutout';

interface Piece {
  kind: Kind;
  side: Side;
  root: THREE.Group; // sits on the square
  pose: THREE.Group; // lift + squash, pivots on the base
  spin: THREE.Group; // flips, pivots on the figure's middle
  body: THREE.Group; // the model itself
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
}

interface Debris {
  obj: THREE.Object3D;
  v: THREE.Vector3;
  w: THREE.Vector3;
  life: number;
  scale: THREE.Vector3;
  gravity: number;
  bounce: boolean;
}

const FILES = 'abcdefgh';
const at = (sq: string) => new THREE.Vector3(FILES.indexOf(sq[0]) - 3.5, 0, 8 - Number(sq[1]) - 3.5);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const done = (tl: gsap.core.Animation) => new Promise<void>((r) => void tl.then(() => r()));

const START: { kind: Kind; side: Side; sq: string }[] = [
  { kind: 'knight', side: 'ally', sq: 'c3' },
  { kind: 'rook', side: 'ally', sq: 'a1' },
  { kind: 'rook', side: 'foe', sq: 'd5' },
  { kind: 'knight', side: 'foe', sq: 'a6' },
];

// ---------- renderer, scene, camera ----------

const host = document.getElementById('scene')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15121a);
scene.fog = new THREE.Fog(0x15121a, 18, 34);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const HOME_POS = new THREE.Vector3(0, 8.2, 10.4);
const HOME = { pos: HOME_POS.clone(), target: new THREE.Vector3(0, 0, 1.2) };
const cam = { pos: HOME.pos.clone(), target: HOME.target.clone(), shake: 0 };

scene.add(new THREE.HemisphereLight(0xffe9c4, 0x2a1d14, 0.65));
const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
key.position.set(-5, 10, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb8ff, 0.9);
rim.position.set(6, 5, -6);
scene.add(rim);
const flash = new THREE.PointLight(0xfff0c0, 0, 7, 1.6);
scene.add(flash);

// ---------- board ----------

const tiles: THREE.Mesh[] = [];
{
  const geo = new THREE.BoxGeometry(1, 0.24, 1);
  for (let f = 0; f < 8; f++) {
    for (let r = 1; r <= 8; r++) {
      const light = (f + r) % 2 === 0;
      const color = new THREE.Color(light ? 0xdcc79c : 0xa27a52).multiplyScalar(1 + rand(-0.03, 0.03));
      const tile = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.82 }));
      tile.position.set(f - 3.5, -0.12, 8 - r - 3.5);
      tile.receiveShadow = true;
      scene.add(tile);
      tiles.push(tile);
    }
  }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.42, 9.2), new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 0.7 }));
  frame.position.y = -0.23;
  frame.receiveShadow = true;
  frame.castShadow = true;
  scene.add(frame);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x221811, roughness: 0.95 }));
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.44;
  table.receiveShadow = true;
  scene.add(table);
}

// ---------- materials and helpers ----------

const mat = (color: number, roughness = 0.7, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

function part(geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

const GOLD = mat(0xd4a64a, 0.35, 0.8);
const CRIMSON = mat(0xa8323a, 0.4, 0.4);

function addBase(g: THREE.Group, side: Side) {
  const rimMat = side === 'ally' ? GOLD : CRIMSON;
  g.add(part(new THREE.CylinderGeometry(0.38, 0.41, 0.12, 36), mat(0x4a2e1a, 0.6), 0, 0.06, 0));
  for (const [r, y] of [
    [0.385, 0.12],
    [0.41, 0.012],
  ]) {
    const ring = part(new THREE.TorusGeometry(r, 0.022, 8, 44), rimMat, 0, y, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }
}

/** The classic knight silhouette, used as the frog's helmet crest. */
const crestGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.17, 0);
  s.lineTo(0.15, 0);
  s.quadraticCurveTo(0.17, 0.1, 0.07, 0.17);
  s.quadraticCurveTo(0.16, 0.2, 0.27, 0.27);
  s.quadraticCurveTo(0.31, 0.33, 0.25, 0.37);
  s.quadraticCurveTo(0.16, 0.44, 0.08, 0.5);
  s.lineTo(0.05, 0.6);
  s.lineTo(-0.01, 0.51);
  s.quadraticCurveTo(-0.2, 0.47, -0.22, 0.28);
  s.quadraticCurveTo(-0.23, 0.12, -0.17, 0);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.translate(0, 0, -0.07);
  return geo;
})();

function frogKnight(side: Side): THREE.Group {
  const g = new THREE.Group();
  addBase(g, side);
  const ally = side === 'ally';
  const skin = mat(ally ? 0x7f8f3c : 0x6c7a38, 0.65);
  const belly = mat(0xd9cf9c, 0.75);
  const metal = mat(ally ? 0xd5dbe0 : 0x55555e, 0.3, 0.9);
  const cloth = mat(ally ? 0x1d8a86 : 0x8f1f2e, 0.85);

  for (const sx of [-1, 1]) {
    const foot = part(new THREE.SphereGeometry(0.1, 16, 10), skin, sx * 0.13, 0.15, 0.08);
    foot.scale.set(1.3, 0.45, 1.6);
    g.add(foot);
    const arm = part(new THREE.CapsuleGeometry(0.05, 0.14, 4, 10), skin, sx * 0.24, 0.36, 0.04);
    arm.rotation.z = sx * 0.5;
    g.add(arm);
    const eye = part(new THREE.SphereGeometry(0.07, 16, 12), mat(0xe6b64a, 0.3), sx * 0.12, 0.66, 0.12);
    g.add(eye, part(new THREE.SphereGeometry(0.035, 12, 8), mat(0x111111, 0.2), sx * 0.13, 0.67, 0.18));
  }
  const body = part(new THREE.SphereGeometry(0.22, 24, 16), skin, 0, 0.36, 0);
  body.scale.set(1.05, 1.1, 0.95);
  const tummy = part(new THREE.SphereGeometry(0.17, 20, 14), belly, 0, 0.34, 0.08);
  tummy.scale.set(1, 1.05, 0.8);
  const tabard = part(new THREE.BoxGeometry(0.24, 0.24, 0.05), cloth, 0, 0.33, 0.2);
  const head = part(new THREE.SphereGeometry(0.21, 24, 16), skin, 0, 0.58, 0.02);
  head.scale.set(1.2, 0.72, 1.05);
  const cap = part(new THREE.SphereGeometry(0.23, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), metal, 0, 0.63, -0.02);
  cap.scale.set(1.18, 0.72, 1.08);
  const crest = part(crestGeo, metal, 0, 0.7, -0.02);
  crest.scale.setScalar(0.72);
  g.add(body, tummy, tabard, head, cap, crest);

  if (ally) {
    const badge = part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 18), GOLD, 0, 0.36, 0.23);
    badge.rotation.x = Math.PI / 2;
    g.add(badge);
    g.add(part(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8), mat(0x6b4428, 0.7), 0.31, 0.55, 0.06));
    g.add(part(new THREE.ConeGeometry(0.04, 0.14, 10), metal, 0.31, 1.06, 0.06));
  } else {
    const mask = part(new THREE.TorusGeometry(0.2, 0.03, 8, 30), mat(0x141014, 0.6), 0, 0.66, 0.02);
    mask.rotation.x = Math.PI / 2;
    mask.scale.set(1.2, 1.08, 1);
    const cloak = part(new THREE.ConeGeometry(0.27, 0.5, 20, 1, true), mat(0x8f1f2e, 0.85, 0, { side: THREE.DoubleSide }), 0, 0.37, -0.06);
    const blade = part(new THREE.BoxGeometry(0.04, 0.38, 0.015), metal, 0.31, 0.56, 0.08);
    blade.rotation.z = -0.3;
    g.add(mask, cloak, blade);
  }
  return g;
}

function tortoiseRook(side: Side): THREE.Group {
  const g = new THREE.Group();
  addBase(g, side);
  const ally = side === 'ally';
  const skin = mat(0x8c8a4a, 0.7);
  const shell = mat(ally ? 0x6b5a2c : 0x4b3a28, 0.6, 0, { flatShading: true });
  const stone = mat(ally ? 0xa29d92 : 0x5d5a57, 0.9, 0, { flatShading: true });

  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    g.add(part(new THREE.CylinderGeometry(0.075, 0.085, 0.16, 12), skin, sx * 0.21, 0.2, sz * 0.17));
  }
  const head = part(new THREE.SphereGeometry(0.11, 18, 12), skin, 0, 0.26, 0.36);
  head.scale.set(1, 0.9, 1.25);
  const dome = part(new THREE.SphereGeometry(0.34, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), shell, 0, 0.17, 0);
  dome.scale.set(1.05, 0.95, 1.15);
  const tower = part(new THREE.CylinderGeometry(0.19, 0.22, 0.36, 18), stone, 0, 0.58, 0);
  const top = part(new THREE.CylinderGeometry(0.235, 0.215, 0.07, 18), stone, 0, 0.79, 0);
  const door = part(new THREE.BoxGeometry(0.07, 0.11, 0.02), mat(0x1c1410, 0.9), -0.07, 0.6, 0.2);
  g.add(head, dome, tower, top, door);
  for (const sx of [-1, 1]) g.add(part(new THREE.SphereGeometry(0.025, 8, 6), mat(0x111111, 0.2), sx * 0.05, 0.3, 0.46));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = part(new THREE.BoxGeometry(0.1, 0.09, 0.07), stone, Math.cos(a) * 0.19, 0.865, Math.sin(a) * 0.19);
    c.rotation.y = -a;
    g.add(c);
  }
  if (ally) {
    g.add(part(new THREE.BoxGeometry(0.12, 0.17, 0.012), mat(0x1d8a86, 0.85), 0.08, 0.58, 0.215));
    const badge = part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), GOLD, 0.08, 0.6, 0.225);
    badge.rotation.x = Math.PI / 2;
    g.add(badge);
  } else {
    const rag = part(new THREE.BoxGeometry(0.11, 0.2, 0.012), mat(0x8f1f2e, 0.85), 0.09, 0.6, 0.215);
    rag.rotation.z = 0.2;
    const mask = part(new THREE.TorusGeometry(0.1, 0.022, 8, 24), mat(0x141014, 0.6), 0, 0.29, 0.38);
    mask.rotation.x = Math.PI / 2;
    g.add(rag, mask);
  }
  return g;
}

// Painted sprites from the 2D spike, standing upright and turned toward the camera.
const textures: Record<string, THREE.Texture> = {};
async function loadTextures() {
  const loader = new THREE.TextureLoader();
  await Promise.all(
    ['knight-ally', 'knight-foe', 'rook-ally', 'rook-foe'].map(async (n) => {
      const t = await loader.loadAsync(`/sprites/${n}.webp`);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      textures[n] = t;
    }),
  );
}

function cutout(kind: Kind, side: Side): THREE.Group {
  const tex = textures[`${kind}-${side}`];
  const img = tex.image as { width: number; height: number };
  const h = kind === 'knight' ? 1.45 : 1.2;
  const w = (h * img.width) / img.height;
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2 - 0.02, 0);
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 1,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 0.45,
  });
  const plane = new THREE.Mesh(geo, m);
  plane.castShadow = true;
  plane.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  plane.userData.billboard = true;
  const g = new THREE.Group();
  g.add(plane);
  return g;
}

// ---------- pieces ----------

let style: Style = 'toy';
let pieces: Piece[] = [];
/** Loaded AI models, keyed "service-kind". Bandit pieces are tinted copies of the ally model. */
const templates = new Map<string, THREE.Object3D | null>();
const MODEL_HEIGHT: Record<Kind, number> = { knight: 1.2, rook: 1.1 };

async function loadStyle(s: Style) {
  if (!isModelStyle(s)) return;
  await Promise.all(
    (['knight', 'rook'] as Kind[]).map(async (kind) => {
      if (!templates.has(`${s}-${kind}`)) templates.set(`${s}-${kind}`, await loadModel(s, kind, MODEL_HEIGHT[kind]));
    }),
  );
}

function modelBody(kind: Kind, side: Side): THREE.Group | null {
  const t = isModelStyle(style) ? templates.get(`${style}-${kind}`) : null;
  if (!t) return null;
  const m = cloneDeep(t);
  if (side === 'foe') tintFoe(m);
  const g = new THREE.Group();
  g.add(m);
  // A team ring on the board, since the generated bases all have gold trim.
  const ring = part(new THREE.TorusGeometry(0.46, 0.03, 8, 48), side === 'ally' ? GOLD : CRIMSON, 0, 0.02, 0);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return g;
}
let debris: Debris[] = [];
let busy = false;

function makePiece(kind: Kind, side: Side, sq: string): Piece {
  const root = new THREE.Group();
  root.position.copy(at(sq));
  const pose = new THREE.Group();
  const spin = new THREE.Group();
  spin.position.y = 0.45;
  const body =
    style === 'cutout'
      ? cutout(kind, side)
      : (modelBody(kind, side) ?? (kind === 'knight' ? frogKnight(side) : tortoiseRook(side)));
  body.position.y = -0.45;
  if (style === 'toy') {
    body.rotation.y = side === 'ally' ? 0.35 : -0.35; // three-quarter view
    body.scale.setScalar(1.15);
  } else if (isModelStyle(style)) {
    body.rotation.y = side === 'ally' ? 0.35 : -0.35;
  }
  spin.add(body);
  pose.add(spin);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.44, 0.52, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd15c, transparent: true, opacity: 0, toneMapped: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  root.add(pose, ring);
  scene.add(root);
  return { kind, side, root, pose, spin, body, ring };
}

function reset() {
  gsap.globalTimeline.clear();
  bullet = 1;
  applyTimeScale();
  for (const p of pieces) scene.remove(p.root);
  for (const d of debris) d.obj.removeFromParent();
  pieces = START.map((s) => makePiece(s.kind, s.side, s.sq));
  debris = [];
  for (const t of tiles) t.position.y = -0.12;
  cam.pos.copy(HOME.pos);
  cam.target.copy(HOME.target);
  flash.intensity = 0;
  busy = false;
  syncButtons();
}

const find = (kind: Kind, side: Side) => pieces.find((p) => p.kind === kind && p.side === side);

// ---------- time: slow-motion toggle and bullet time ----------

let base = 1; // the "Slow motion" button
let bullet = 1; // brief slow-down on impact
const applyTimeScale = () => void gsap.globalTimeline.timeScale(base * bullet);

/** Drops time to `scale` now, holds for `holdMs` of real time, then ramps back over `rampMs`. */
function bulletTime(scale: number, holdMs: number, rampMs: number) {
  bullet = scale;
  applyTimeScale();
  const start = performance.now() + holdMs / base;
  const step = () => {
    const t = (performance.now() - start) / (rampMs / base);
    if (t >= 0) {
      bullet = t >= 1 ? 1 : scale + (1 - scale) * t * t;
      applyTimeScale();
    }
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- effects ----------

function killCam(target: THREE.Vector3, dir: THREE.Vector3, low: boolean) {
  // Swing to the side of the action that faces the player, and drop in close.
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  if (side.z < 0) side.negate();
  const pos = target.clone().addScaledVector(side, 3.1).add(new THREE.Vector3(0, low ? 1.6 : 2.4, 2.2));
  gsap.to(cam.pos, { x: pos.x, y: pos.y, z: pos.z, duration: 0.5, ease: 'power2.inOut' });
  gsap.to(cam.target, { x: target.x, y: 0.5, z: target.z, duration: 0.5, ease: 'power2.inOut' });
}

function camHome(delay: number) {
  gsap.to(cam.pos, { ...xyz(HOME.pos), duration: 1, delay, ease: 'power2.inOut' });
  return gsap.to(cam.target, { ...xyz(HOME.target), duration: 1, delay, ease: 'power2.inOut' });
}
const xyz = (v: THREE.Vector3) => ({ x: v.x, y: v.y, z: v.z });

function ripple(center: THREE.Vector3, strength: number) {
  for (const t of tiles) {
    const d = Math.hypot(t.position.x - center.x, t.position.z - center.z);
    if (d > 3.6) continue;
    const amp = strength * Math.exp(-d * 0.9);
    gsap
      .timeline({ delay: d * 0.045 })
      .to(t.position, { y: -0.12 - amp, duration: 0.06, ease: 'power2.out' })
      .to(t.position, { y: -0.12, duration: 0.55, ease: 'elastic.out(1.2, 0.35)' });
  }
}

const dustMat = new THREE.MeshStandardMaterial({ color: 0xd9c49a, roughness: 1, transparent: true, opacity: 0.8 });
function dust(p: THREE.Vector3, n: number, power: number) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
    const m = new THREE.Mesh(new THREE.SphereGeometry(rand(0.04, 0.08), 8, 6), dustMat);
    m.position.set(p.x + Math.cos(a) * 0.3, 0.06, p.z + Math.sin(a) * 0.3);
    scene.add(m);
    debris.push({
      obj: m,
      v: new THREE.Vector3(Math.cos(a) * power * rand(0.8, 1.4), rand(0.4, 1.0) * power, Math.sin(a) * power * rand(0.8, 1.4)),
      w: new THREE.Vector3(),
      life: rand(0.5, 0.8),
      scale: new THREE.Vector3(1, 1, 1).multiplyScalar(rand(1, 1.8)),
      gravity: 1.5,
      bounce: false,
    });
  }
}

const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, toneMapped: false });
function sparks(p: THREE.Vector3, n: number) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.16), sparkMat);
    m.position.set(p.x, 0.5, p.z);
    const v = new THREE.Vector3(rand(-1, 1), rand(0.2, 1.2), rand(-1, 1)).normalize().multiplyScalar(rand(4, 8));
    m.lookAt(m.position.clone().add(v));
    scene.add(m);
    debris.push({ obj: m, v, w: new THREE.Vector3(), life: rand(0.3, 0.6), scale: new THREE.Vector3(1, 1, 1), gravity: 6, bounce: false });
  }
}

function shockwave(p: THREE.Vector3) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.42, 64),
    new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.95, toneMapped: false, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(p.x, 0.03, p.z);
  scene.add(ring);
  gsap.to(ring.scale, { x: 6, y: 6, duration: 0.7, ease: 'power2.out' });
  gsap.to(ring.material, { opacity: 0, duration: 0.7, ease: 'power1.in', onComplete: () => void ring.removeFromParent() });
}

/** Breaks a piece into its parts (toys) or launches it whole (cutouts). */
function shatter(v: Piece, dir: THREE.Vector3, power: number) {
  pieces = pieces.filter((p) => p !== v);
  scene.updateMatrixWorld(true);
  const center = v.root.position.clone();
  const parts = style === 'toy' ? [...v.body.children] : [v.body];
  for (const obj of parts) {
    scene.attach(obj); // keep its world position as it leaves the piece
    const out = obj.getWorldPosition(new THREE.Vector3()).sub(center).setY(0);
    if (out.lengthSq() < 1e-4) out.set(rand(-1, 1), 0, rand(-1, 1));
    out.normalize();
    const vel = dir
      .clone()
      .multiplyScalar(power * rand(0.7, 1.2))
      .addScaledVector(out, rand(1, 2.4))
      .add(new THREE.Vector3(0, rand(3, 5.5), 0));
    debris.push({
      obj,
      v: vel,
      w: new THREE.Vector3(rand(-14, 14), rand(-14, 14), rand(-14, 14)),
      life: 2.6,
      scale: obj.scale.clone(),
      gravity: 14,
      bounce: true,
    });
  }
  scene.remove(v.root);
}

function impact(target: THREE.Vector3, victim: Piece, dir: THREE.Vector3, power: number) {
  bulletTime(0.1, 420, 520);
  flash.position.set(target.x, 0.9, target.z);
  flash.intensity = 40;
  gsap.to(flash, { intensity: 0, duration: 0.55, ease: 'power2.out' });
  cam.shake = 0.14;
  shockwave(target);
  sparks(target, 28);
  dust(target, 14, 1.6);
  ripple(target, 0.14);
  shatter(victim, dir, power);
}

// ---------- the two captures ----------

function select(p: Piece) {
  gsap.to(p.ring.material, { opacity: 0.9, duration: 0.15 });
  return done(gsap.to(p.pose.position, { y: 0.1, duration: 0.18, ease: 'power2.out' }));
}

async function knightCapture() {
  const k = find('knight', 'ally');
  const v = find('rook', 'foe');
  if (!k || !v || busy) return;
  busy = true;
  syncButtons();
  const from = k.root.position.clone();
  const to = at('d5');
  const dir = to.clone().sub(from).setY(0).normalize();
  const flipAxis = new THREE.Vector3(-dir.z, 0, dir.x);
  const peak = 1.7;
  await select(k);

  const t = { k: 0 };
  const tl = gsap
    .timeline()
    .to(k.ring.material, { opacity: 0, duration: 0.2 })
    .to(k.pose.scale, { x: 1.15, y: 0.78, z: 1.15, duration: 0.14, ease: 'power2.out' }, 0)
    .addLabel('jump')
    .to(k.pose.scale, { x: 0.88, y: 1.18, z: 0.88, duration: 0.15 }, 'jump')
    .to(
      t,
      {
        k: 1,
        duration: 0.66,
        ease: 'none',
        onUpdate: () => {
          k.root.position.lerpVectors(from, to, t.k);
          k.pose.position.y = 0.1 * (1 - t.k) + 4 * peak * t.k * (1 - t.k);
          k.spin.quaternion.setFromAxisAngle(flipAxis, t.k * Math.PI * 2); // a full forward flip
        },
      },
      'jump',
    )
    .to(k.pose.scale, { x: 1, y: 1, z: 1, duration: 0.2 }, 'jump+=0.2')
    .add(() => killCam(to, dir, false), 'jump+=0.22')
    .add(() => impact(to, v, dir, 2.2), 'jump+=0.58')
    .add(() => dust(to, 10, 1.2), 'jump+=0.66')
    .to(k.pose.scale, { x: 1.25, y: 0.72, z: 1.25, duration: 0.07 }, 'jump+=0.66')
    .to(k.pose.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  await done(tl);
  await done(camHome(0.35));
  busy = false;
  syncButtons();
}

async function rookCapture() {
  const r = find('rook', 'ally');
  const v = find('knight', 'foe');
  if (!r || !v || busy) return;
  busy = true;
  syncButtons();
  const from = r.root.position.clone();
  const to = at('a6');
  const dir = to.clone().sub(from).setY(0).normalize();
  const steps = 5;
  await select(r);

  const tl = gsap
    .timeline()
    .to(r.ring.material, { opacity: 0, duration: 0.2 })
    .to(r.pose.position, { y: 0, duration: 0.12 }, 0)
    .to(r.pose.scale, { x: 1.08, y: 0.9, z: 1.08, duration: 0.14, ease: 'power2.out' }, 0)
    .to(r.spin.rotation, { x: -0.12, duration: 0.2 }, 0); // lean into the charge
  for (let i = 1; i <= steps; i++) {
    const last = i === steps;
    const p = from.clone().lerp(to, i / steps);
    const L = `s${i}`;
    tl.addLabel(L)
      .to(r.root.position, { x: p.x, z: p.z, duration: 0.2, ease: 'power1.inOut' }, L)
      .to(r.pose.position, { y: 0.24, duration: 0.1, ease: 'power2.out' }, L)
      .to(r.pose.position, { y: 0, duration: 0.1, ease: 'power2.in' }, `${L}+=0.1`)
      .to(r.pose.scale, { x: 0.95, y: 1.08, z: 0.95, duration: 0.1 }, L);
    if (last) {
      tl.add(() => impact(p, v, dir, 4.5), `${L}+=0.12`);
    } else {
      tl.add(() => {
        ripple(p, 0.06);
        dust(p, 5, 0.9);
        cam.shake = Math.max(cam.shake, 0.035);
      }, `${L}+=0.2`);
      if (i === steps - 1) tl.add(() => killCam(to, dir, true), `${L}+=0.05`);
    }
    tl.to(r.pose.scale, { x: last ? 1.2 : 1.1, y: last ? 0.78 : 0.9, z: last ? 1.2 : 1.1, duration: 0.05 }, `${L}+=0.2`).to(
      r.pose.scale,
      { x: 1, y: 1, z: 1, duration: last ? 0.5 : 0.08, ease: last ? 'elastic.out(1, 0.45)' : 'power1.out' },
      `${L}+=0.25`,
    );
  }
  tl.to(r.spin.rotation, { x: 0, duration: 0.3 });
  await done(tl);
  await done(camHome(0.35));
  busy = false;
  syncButtons();
}

// ---------- frame loop ----------

const timer = new THREE.Timer();
const tmp = new THREE.Vector3();
renderer.setAnimationLoop((time) => {
  timer.update(time);
  const real = Math.min(timer.getDelta(), 0.05);
  const dt = real * gsap.globalTimeline.timeScale();

  debris = debris.filter((d) => {
    d.v.y -= d.gravity * dt;
    d.obj.position.addScaledVector(d.v, dt);
    d.obj.rotation.x += d.w.x * dt;
    d.obj.rotation.y += d.w.y * dt;
    d.obj.rotation.z += d.w.z * dt;
    if (d.bounce) {
      const onBoard = Math.abs(d.obj.position.x) < 4.6 && Math.abs(d.obj.position.z) < 4.6;
      const floor = onBoard ? 0.05 : -0.42;
      if (d.obj.position.y < floor) {
        d.obj.position.y = floor;
        d.v.y = Math.abs(d.v.y) * 0.35;
        d.v.x *= 0.7;
        d.v.z *= 0.7;
        d.w.multiplyScalar(0.6);
      }
    }
    d.life -= dt;
    const k = Math.min(1, Math.max(0, d.life / 0.5));
    d.obj.scale.copy(d.scale).multiplyScalar(d.bounce ? k : Math.max(0.05, k));
    if (d.life <= 0) d.obj.removeFromParent();
    return d.life > 0;
  });

  cam.shake = Math.max(0, cam.shake - real * 0.5);
  camera.position.copy(cam.pos).add(tmp.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(cam.shake));
  camera.lookAt(cam.target);

  // Cutouts always face the camera (turning around the vertical axis only).
  for (const p of pieces) {
    if (style !== 'cutout') break;
    p.root.getWorldPosition(tmp);
    p.body.rotation.y = Math.atan2(camera.position.x - tmp.x, camera.position.z - tmp.z);
  }

  renderer.render(scene, camera);
});

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  // Keep the whole board in view: fix the horizontal field of view, so tall
  // phone screens get a taller vertical one.
  const hfov = THREE.MathUtils.degToRad(50);
  const want = 2 * Math.atan(Math.tan(hfov / 2) / camera.aspect);
  const maxV = THREE.MathUtils.degToRad(58);
  const vfov = THREE.MathUtils.clamp(want, THREE.MathUtils.degToRad(30), maxV);
  camera.fov = THREE.MathUtils.radToDeg(vfov);
  camera.updateProjectionMatrix();
  // Past the widest comfortable lens, back the camera away instead.
  const back = Math.tan(want / 2) / Math.tan(vfov / 2);
  HOME.pos.copy(HOME.target).addScaledVector(HOME_POS.clone().sub(HOME.target), Math.max(1, back));
  if (!busy) cam.pos.copy(HOME.pos);
}
window.addEventListener('resize', resize);
resize();

// ---------- controls ----------

const btn = (a: string) => document.querySelector<HTMLButtonElement>(`[data-action="${a}"]`)!;
function syncButtons() {
  btn('knight').disabled = busy || !find('knight', 'ally') || !find('rook', 'foe');
  btn('rook').disabled = busy || !find('rook', 'ally') || !find('knight', 'foe');
  btn('style').textContent = `Style: ${styleLabel(style)}`;
  btn('style').setAttribute('aria-pressed', String(style !== 'toy'));
  btn('slowmo').textContent = `Slow motion: ${base < 1 ? 'on' : 'off'}`;
  btn('slowmo').setAttribute('aria-pressed', String(base < 1));
}

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
  if (!b) return;
  switch (b.dataset.action) {
    case 'knight':
      void knightCapture();
      break;
    case 'rook':
      void rookCapture();
      break;
    case 'style': {
      const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
      btn('style').textContent = `Loading ${styleLabel(next)}…`;
      void loadStyle(next).then(() => {
        style = next;
        reset();
      });
      break;
    }
    case 'slowmo':
      base = base < 1 ? 1 : 0.25;
      applyTimeScale();
      syncButtons();
      break;
    case 'reset':
      reset();
      break;
  }
});

// Dev hook for screenshots: __mockup.knight(), __mockup.rook(), __mockup.timeScale(0.1).
Object.assign(window, {
  __mockup: {
    knight: knightCapture,
    rook: rookCapture,
    reset,
    style: async (s: Style) => {
      await loadStyle(s);
      style = s;
      reset();
    },
    timeScale: (s: number) => {
      base = s;
      applyTimeScale();
    },
  },
});

loadTextures()
  .catch((err) => console.warn('Sprites failed to load; cutout style unavailable', err))
  .finally(reset);
