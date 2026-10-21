/**
 * Side-by-side viewer for the AI-generated 3D figurines: the original art, then
 * one column per service, knight on top and rook below, on turning pedestals.
 * Open /mockups/models.html on the dev server. Not part of the game build.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SERVICES, loadModel, type ModelPiece } from './models';

const host = document.getElementById('scene')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15121a);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;
scene.add(new THREE.HemisphereLight(0xffe9c4, 0x2a1d14, 0.7));
const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
key.position.set(-4, 7, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: 1, far: 25 });
key.shadow.bias = -0.0004;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb8ff, 0.9);
rim.position.set(5, 4, -6);
scene.add(rim);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.2;
controls.maxDistance = 22;

// Columns: original art, then each service. Rows: knight, rook.
const COLUMNS = [{ id: 'art', label: 'Original art', model: '2D sprite' }, ...SERVICES];
const ROWS: { piece: ModelPiece; label: string }[] = [
  { piece: 'knight', label: 'Frog knight' },
  { piece: 'rook', label: 'Tortoise rook' },
];
const GAP_X = 1.9;
const GAP_Y = 2.1;
const HEIGHT = 1.35;
const colX = (c: number) => (c - (COLUMNS.length - 1) / 2) * GAP_X;
const rowY = (r: number) => -r * GAP_Y;

const turntables: THREE.Group[] = [];
const labels: { el: HTMLElement; at: THREE.Vector3 }[] = [];
const labelHost = document.getElementById('labels')!;

function label(html: string, at: THREE.Vector3) {
  const el = document.createElement('span');
  el.innerHTML = html;
  labelHost.appendChild(el);
  labels.push({ el, at });
}

const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 0.7 });
const textureLoader = new THREE.TextureLoader();

COLUMNS.forEach((col, c) => {
  label(`${col.label}<br><small>${col.model}</small>`, new THREE.Vector3(colX(c), rowY(0) + HEIGHT + 0.45, 0));
  ROWS.forEach((row, r) => {
    const base = new THREE.Group();
    base.position.set(colX(c), rowY(r), 0);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.12, 48), pedestalMat);
    pedestal.position.y = -0.06;
    pedestal.receiveShadow = true;
    base.add(pedestal);
    const turn = new THREE.Group();
    base.add(turn);
    scene.add(base);
    turntables.push(turn);

    if (col.id === 'art') {
      // The source sprite as a flat card, for comparing likeness.
      textureLoader.load(`/sprites/${row.piece}-ally.webp`, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const img = tex.image as { width: number; height: number };
        const w = (HEIGHT * img.width) / img.height;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(w, HEIGHT),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }),
        );
        plane.position.y = HEIGHT / 2;
        turn.add(plane);
      });
    } else {
      void loadModel(col.id as (typeof SERVICES)[number]['id'], row.piece, HEIGHT).then((m) => {
        if (m) turn.add(m);
        else label('<small>not generated</small>', new THREE.Vector3(colX(c), rowY(r) + 0.6, 0));
      });
    }
  });
});

// ---------- views ----------

const views: { name: string; target: THREE.Vector3; dist: number }[] = [
  { name: 'All', target: new THREE.Vector3(0, rowY(0.5) + 0.6, 0), dist: 0 },
  ...COLUMNS.map((col, c) => ({ name: col.label, target: new THREE.Vector3(colX(c), rowY(0.5) + 0.6, 0), dist: 7.6 })),
];
let spin = true;
let current = 0;

function fitDistance(): number {
  // Distance that fits every column across the screen width.
  const halfW = (COLUMNS.length * GAP_X) / 2 + 0.2;
  const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
  const halfH = GAP_Y + 1.4;
  return Math.max(halfW / Math.tan(hfov / 2), halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * 1.05;
}

function setView(i: number) {
  current = i;
  const v = views[i];
  const d = v.dist || fitDistance();
  controls.target.copy(v.target);
  camera.position.copy(v.target).add(new THREE.Vector3(0, d * 0.32, d));
  controls.update();
  syncButtons();
}

const controlsEl = document.getElementById('controls')!;
function syncButtons() {
  controlsEl.innerHTML =
    views.map((v, i) => `<button data-view="${i}" aria-pressed="${i === current}">${v.name}</button>`).join('') +
    `<button data-spin aria-pressed="${spin}">Spin: ${spin ? 'on' : 'off'}</button>`;
}
controlsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button');
  if (!b) return;
  if (b.dataset.view) setView(Number(b.dataset.view));
  if (b.hasAttribute('data-spin')) {
    spin = !spin;
    // Stopping the spin turns every model to face the camera, for a fair comparison.
    if (!spin) for (const tt of turntables) tt.rotation.y = 0;
    syncButtons();
  }
});

// ---------- loop ----------

const timer = new THREE.Timer();
const tmp = new THREE.Vector3();
renderer.setAnimationLoop((t) => {
  timer.update(t);
  const dt = Math.min(timer.getDelta(), 0.05);
  if (spin) for (const tt of turntables) tt.rotation.y += dt * 0.5;
  controls.update();
  renderer.render(scene, camera);
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (const l of labels) {
    tmp.copy(l.at).project(camera);
    l.el.style.left = `${(tmp.x * 0.5 + 0.5) * w}px`;
    l.el.style.top = `${(-tmp.y * 0.5 + 0.5) * h}px`;
    l.el.style.display = tmp.z < 1 ? '' : 'none';
  }
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (views[current].dist === 0) setView(current);
}
window.addEventListener('resize', resize);
resize();
setView(0);
