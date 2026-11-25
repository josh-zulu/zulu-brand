#!/usr/bin/env node
// fal.ai generation: images, edits and video through fal's queue API.
//
//   npm run fal -- image "prompt" --out projects/ai-trends/public/media/generated/x.png [--model nano-banana-pro] [--aspect 16:9] [--n 4]
//   npm run fal -- edit  "prompt" --image ref.png [--image ref2.png] --out out.png [--model nano-banana-pro-edit]
//   npm run fal -- video "prompt" [--image start.png] --out clip.mp4 [--model veo3.1-i2v] [--duration 8] [--aspect 16:9]
//   npm run fal -- run fal-ai/some/model --input input.json --out out-dir/name
//   npm run fal -- models
//
// Any extra model input: --param key=value (repeatable; JSON values allowed, e.g. --param seed=42).
// Every output gets a <file>.prompt.json sidecar (model, input, request id) for provenance.
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import {
  requireEnv, fail, ok, info, userPath, writeSidecar, toUrlOrDataUri, download, parseParams, sleep,
} from './lib/common.mjs';

// Short names → fal endpoint ids. Model ids change often: check https://fal.ai/explore and add aliases here.
export const MODELS = {
  // text → image
  'nano-banana-pro': 'fal-ai/nano-banana-pro',
  'nano-banana-2': 'fal-ai/nano-banana-2',
  'flux-dev': 'fal-ai/flux/dev',
  'seedream': 'fal-ai/bytedance/seedream/v4/text-to-image',
  // image(s) + prompt → image
  'nano-banana-pro-edit': 'fal-ai/nano-banana-pro/edit',
  'nano-banana-2-edit': 'fal-ai/nano-banana-2/edit',
  // video
  'veo3.1': 'fal-ai/veo3.1',
  'veo3.1-i2v': 'fal-ai/veo3.1/image-to-video',
  'kling3-i2v': 'fal-ai/kling-video/v3/pro/image-to-video',
  'seedance2': 'bytedance/seedance-2.0/text-to-video',
};
const DEFAULTS = { image: 'nano-banana-pro', edit: 'nano-banana-pro-edit', video: 'veo3.1-i2v' };

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: 'string', short: 'm' },
    out: { type: 'string', short: 'o' },
    image: { type: 'string', multiple: true, short: 'i' },
    aspect: { type: 'string', short: 'a' },
    n: { type: 'string' },
    duration: { type: 'string', short: 'd' },
    input: { type: 'string' },
    param: { type: 'string', multiple: true, short: 'p' },
    help: { type: 'boolean', short: 'h' },
  },
});

const [mode, promptOrModel] = positionals;
if (!mode || values.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(0);
}
if (mode === 'models') {
  for (const [k, v] of Object.entries(MODELS)) console.log(`${k.padEnd(22)} ${v}`);
  process.exit(0);
}

const key = requireEnv('FAL_KEY', 'Get one at https://fal.ai/dashboard/keys');
const headers = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' };

let modelId, input;
if (mode === 'run') {
  modelId = promptOrModel;
  if (!modelId) fail('Usage: fal run <model-id> --input input.json --out <path>');
  input = values.input ? JSON.parse(readFileSync(userPath(values.input), 'utf8')) : {};
} else if (['image', 'edit', 'video'].includes(mode)) {
  if (!promptOrModel) fail(`Usage: fal ${mode} "prompt" --out <path>`);
  const alias = values.model || DEFAULTS[mode];
  modelId = MODELS[alias] || alias;
  input = { prompt: promptOrModel };
  if (values.aspect) input.aspect_ratio = values.aspect;
  if (values.n) input.num_images = Number(values.n);
  if (values.duration) input.duration = /^\d+$/.test(values.duration) && modelId.includes('veo') ? `${values.duration}s` : values.duration;
  const imgs = (values.image || []).map(toUrlOrDataUri);
  if (imgs.length) {
    if (mode === 'edit') input.image_urls = imgs;
    else input.image_url = imgs[0];
  } else if (mode === 'edit') fail('edit needs at least one --image');
} else {
  fail(`Unknown mode "${mode}". Use image | edit | video | run | models.`);
}
Object.assign(input, parseParams(values.param));
if (!values.out) fail('--out <path> is required (extension decides file type; multiple outputs get -1, -2… suffixes)');

info(`fal → ${modelId}`);
const submit = await fetch(`https://queue.fal.run/${modelId}`, { method: 'POST', headers, body: JSON.stringify(input) });
if (!submit.ok) fail(`Submit failed (${submit.status}): ${await submit.text()}`);
const job = await submit.json();
info(`queued ${job.request_id}`);

const started = Date.now();
let lastStatus = '';
for (;;) {
  const s = await fetch(`${job.status_url}?logs=1`, { headers });
  if (!s.ok) fail(`Status failed (${s.status}): ${await s.text()}`);
  const st = await s.json();
  if (st.status !== lastStatus) { info(`${st.status}${st.queue_position != null ? ` (position ${st.queue_position})` : ''}`); lastStatus = st.status; }
  if (st.status === 'COMPLETED') break;
  if (Date.now() - started > 20 * 60_000) fail('Timed out after 20 minutes');
  await sleep(mode === 'video' ? 4000 : 1500);
}

const res = await fetch(job.response_url, { headers });
if (!res.ok) fail(`Result failed (${res.status}): ${await res.text()}`);
const result = await res.json();

// Collect every media URL in the result (images[], image, video, audio…).
const urls = [];
(function walk(v) {
  if (!v || typeof v !== 'object') return;
  if (typeof v.url === 'string' && /^https?:/.test(v.url)) urls.push(v.url);
  for (const x of Object.values(v)) walk(x);
})(result);
if (!urls.length) { console.log(JSON.stringify(result, null, 2)); fail('No media URLs in the result (printed above).'); }

const out = userPath(values.out);
const ext = extname(out);
const base = out.slice(0, out.length - ext.length);
const sidecarInput = { ...input };
for (const k of ['image_url', 'image_urls']) if (sidecarInput[k]) sidecarInput[k] = values.image;
for (let i = 0; i < urls.length; i++) {
  const file = urls.length === 1 ? out : `${base}-${i + 1}${ext}`;
  await download(urls[i], file);
  writeSidecar(file, { tool: 'fal', model: modelId, input: sidecarInput, requestId: job.request_id, seconds: Math.round((Date.now() - started) / 1000) });
  ok(file);
}
