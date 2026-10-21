// Turns figurine art into textured 3D models (GLB) with fal.ai image-to-3D services.
//
//   node scripts/generate-3d.mjs                          # every service x piece not generated yet
//   node scripts/generate-3d.mjs hunyuan knight-ally      # only these services / pieces
//
// Needs FAL_AI (or FAL_KEY) in the environment. Inputs are the raw figurines in
// art/raw/, cut out at full resolution. Raw models land in art/3d/raw/ (not
// committed); run scripts/optimize-3d.mjs to shrink them into public/models/.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cutOut } from './process-art.mjs';

const KEY = process.env.FAL_AI ?? process.env.FAL_KEY;
const OUT_DIR = join('art', '3d', 'raw');

/** Each service: fal endpoint, input built from the image URL, and where the GLB is in the result. */
const SERVICES = {
  hunyuan: {
    endpoint: 'fal-ai/hunyuan3d-v3/image-to-3d',
    input: (url) => ({ input_image_url: url, generate_type: 'Normal', enable_pbr: true, face_count: 40000 }),
    glb: (r) => r.model_glb?.url ?? r.model_urls?.glb?.url,
  },
  trellis: {
    endpoint: 'fal-ai/trellis-2',
    input: (url) => ({ image_url: url, resolution: '1024', texture_size: '1024', decimation_target: 20000 }),
    glb: (r) => r.model_glb?.url,
  },
  rodin: {
    endpoint: 'fal-ai/hyper3d/rodin',
    input: (url) => ({ input_image_urls: [url], geometry_file_format: 'glb', material: 'PBR', quality: 'medium', tier: 'Regular' }),
    glb: (r) => r.model_mesh?.url,
  },
};

const PIECES = ['knight-ally', 'rook-ally'];

const headers = { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' };

async function call(endpoint, input) {
  const submit = await fetch(`https://queue.fal.run/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(input) });
  const job = await submit.json();
  if (!submit.ok) throw new Error(`${endpoint}: HTTP ${submit.status} ${JSON.stringify(job).slice(0, 400)}`);
  const started = Date.now();
  for (;;) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await (await fetch(job.status_url, { headers })).json();
    if (s.status === 'COMPLETED') break;
    if (!['IN_QUEUE', 'IN_PROGRESS'].includes(s.status)) throw new Error(`${endpoint}: ${JSON.stringify(s).slice(0, 400)}`);
    if (Date.now() - started > 15 * 60_000) throw new Error(`${endpoint}: timed out`);
  }
  const res = await fetch(job.response_url, { headers });
  const body = await res.json();
  if (!res.ok) throw new Error(`${endpoint}: result HTTP ${res.status} ${JSON.stringify(body).slice(0, 400)}`);
  return { result: body, seconds: Math.round((Date.now() - started) / 1000) };
}

async function imageDataUrl(piece) {
  // Full-resolution cutout on white: image-to-3D models expect one object on a plain background.
  const png = await (await cutOut(join('art', 'raw', `${piece}.png`)))
    .flatten({ background: '#ffffff' })
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: '#ffffff' })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

if (!KEY) {
  console.error('Set FAL_AI (or FAL_KEY) first.');
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const args = process.argv.slice(2);
const services = args.filter((a) => SERVICES[a]);
const pieces = args.filter((a) => PIECES.includes(a));
for (const a of args) if (!SERVICES[a] && !PIECES.includes(a)) throw new Error(`Unknown "${a}". Services: ${Object.keys(SERVICES)}; pieces: ${PIECES}`);
const explicit = args.length > 0;

const jobs = [];
for (const service of services.length ? services : Object.keys(SERVICES)) {
  for (const piece of pieces.length ? pieces : PIECES) {
    const out = join(OUT_DIR, `${service}-${piece}.glb`);
    if (!explicit && existsSync(out)) continue;
    jobs.push({ service, piece, out });
  }
}

// Run all jobs at once; each waits in fal's queue independently.
const images = Object.fromEntries(await Promise.all(PIECES.map(async (p) => [p, await imageDataUrl(p)])));
const results = await Promise.allSettled(
  jobs.map(async ({ service, piece, out }) => {
    const s = SERVICES[service];
    const { result, seconds } = await call(s.endpoint, s.input(images[piece]));
    const url = s.glb(result);
    if (!url) throw new Error(`${service} ${piece}: no GLB in result ${JSON.stringify(result).slice(0, 300)}`);
    const glb = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(out, glb);
    console.log(`${service} ${piece}: ${(glb.length / 1e6).toFixed(1)} MB in ${seconds}s → ${out}`);
  }),
);
for (const r of results) if (r.status === 'rejected') console.error(`FAILED: ${r.reason.message}`);
