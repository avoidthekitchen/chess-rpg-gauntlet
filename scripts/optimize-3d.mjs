// Shrinks generated 3D models for the web: caps triangles, converts textures to
// 1K WebP, and compresses geometry with meshopt.
//
//   node scripts/optimize-3d.mjs        # art/3d/raw/*.glb → public/models/*.glb
//
// Three.js loads the result with GLTFLoader + MeshoptDecoder.
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const IN_DIR = join('art', '3d', 'raw');
const OUT_DIR = join('public', 'models');
const MAX_TRIANGLES = 30000; // enough for a figurine seen at board scale and in a close-up

const triangles = (doc) => {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const p of mesh.listPrimitives()) n += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
  }
  return Math.round(n);
};

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
mkdirSync(OUT_DIR, { recursive: true });

for (const file of readdirSync(IN_DIR).filter((f) => f.endsWith('.glb'))) {
  const src = join(IN_DIR, file);
  const doc = await io.read(src);
  const before = triangles(doc);
  await doc.transform(dedup(), prune(), weld());
  if (before > MAX_TRIANGLES) {
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: MAX_TRIANGLES / before, error: 0.002 }));
  }
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }), prune());
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
  const out = join(OUT_DIR, file);
  await io.write(out, doc);
  const mb = (p) => (statSync(p).size / 1e6).toFixed(2);
  console.log(`${basename(file)}: ${before} → ${triangles(doc)} triangles, ${mb(src)} → ${mb(out)} MB`);
}
