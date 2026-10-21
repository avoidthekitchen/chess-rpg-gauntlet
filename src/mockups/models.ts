/**
 * Loading the AI-generated figurine models (public/models/*.glb) for the mockups.
 * Each model is normalized to stand on the origin at a fixed height.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export type Service = 'hunyuan' | 'trellis' | 'rodin';
export type ModelPiece = 'knight' | 'rook';

export const SERVICES: { id: Service; label: string; model: string }[] = [
  { id: 'hunyuan', label: 'Hunyuan3D', model: 'v3, 40k faces, PBR' },
  { id: 'trellis', label: 'TRELLIS 2', model: '1K textures, ~20k verts' },
  { id: 'rodin', label: 'Rodin', model: 'Gen-2, medium, PBR' },
];

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<string, Promise<THREE.Object3D | null>>();

/** Loads one model, scaled to `height` and standing on the origin. Resolves null if missing. */
export function loadModel(service: Service, piece: ModelPiece, height: number): Promise<THREE.Object3D | null> {
  const key = `${service}-${piece}-${height}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      loader
        .loadAsync(`/models/${service}-${piece}-ally.glb`)
        .then((gltf) => {
          const model = gltf.scene;
          model.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          // Normalize: bottom center on the origin, scaled to the target height.
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const s = height / size.y;
          model.scale.setScalar(s);
          model.position.set(-center.x * s, -box.min.y * s, -center.z * s);
          const wrap = new THREE.Group();
          wrap.add(model);
          return wrap as THREE.Object3D;
        })
        .catch(() => null),
    );
  }
  return cache.get(key)!.then((m) => (m ? cloneDeep(m) : null));
}

/** Clones with materials copied, so each copy can be tinted on its own. */
export function cloneDeep(o: THREE.Object3D): THREE.Object3D {
  const c = o.clone(true);
  c.traverse((n) => {
    const mesh = n as THREE.Mesh;
    if (mesh.isMesh) mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
  });
  return c;
}

/** Darkens and reddens a model so it reads as a bandit. A stand-in until bandit models exist. */
export function tintFoe(o: THREE.Object3D) {
  o.traverse((n) => {
    const mesh = n as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const std = m as THREE.MeshStandardMaterial;
      if (std.color) std.color.multiply(new THREE.Color(0.62, 0.42, 0.44));
    }
  });
}
