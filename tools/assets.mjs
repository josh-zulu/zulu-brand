#!/usr/bin/env node
// Generate a project's planned assets from its manifest: prompts live in code, not in someone's chat history.
//
//   npm run assets -- ai-trends            list every asset and whether it exists yet
//   npm run assets -- ai-trends --make     generate the missing ones
//   npm run assets -- ai-trends --make --only sameness-grid --force
//
// Manifests: projects/<project>/assets.d/*.json (one file per section, so people never collide)
//   { "assets": [ { "id", "tool": "fal" | "codex-image" | "eleven", "mode", "model", "prompt", "out", "aspect", "n", "refs", "params", "slide" } ] }
// "out" is relative to the project folder. Each run shells out to the matching tool script, so behaviour is identical.
//   --file section-2   only that manifest      --parallel 4   run up to 4 generations at once
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { ROOT, fail, ok, info } from './lib/common.mjs';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    make: { type: 'boolean' }, only: { type: 'string', multiple: true }, force: { type: 'boolean' },
    file: { type: 'string', multiple: true }, parallel: { type: 'string', default: '3' },
  },
});
const project = positionals[0] || 'ai-trends';
const dir = resolve(ROOT, 'projects', project);
const manifestDir = resolve(dir, 'assets.d');
if (!existsSync(manifestDir)) fail(`No manifests in ${manifestDir}`);
const assets = [];
for (const f of readdirSync(manifestDir).filter((f) => f.endsWith('.json')).sort()) {
  if (values.file && !values.file.some((x) => f === x || f === `${x}.json`)) continue;
  for (const a of JSON.parse(readFileSync(resolve(manifestDir, f), 'utf8')).assets) assets.push({ ...a, manifest: f });
}

const exists = (a) => {
  const out = resolve(dir, a.out);
  const ext = extname(out);
  const base = out.slice(0, -ext.length);
  // the original, its optimized .webp (npm run media -- optimize), or a multi-output -1 file
  return [out, `${base}.webp`, `${base}-1${ext}`, `${base}-1.webp`].some((p) => existsSync(p));
};

const picked = assets.filter((a) => !values.only || values.only.includes(a.id));
if (!values.make) {
  for (const a of picked) console.log(`${exists(a) ? '\x1b[32m●\x1b[0m' : '\x1b[2m○\x1b[0m'} ${a.id.padEnd(28)} ${(a.tool + (a.mode ? ':' + a.mode : '')).padEnd(18)} ${a.slide ?? ''}  → ${a.out}`);
  console.log(`\n${picked.filter(exists).length}/${picked.length} exist. Add --make to generate the missing ones.`);
  process.exit(0);
}

let failed = 0;
const jobs = [];
for (const a of picked) {
  if (exists(a) && !values.force) { info(`skip ${a.id} (exists)`); continue; }
  const out = resolve(dir, a.out);
  let script, args;
  if (a.tool === 'fal') {
    script = 'fal.mjs';
    args = [a.mode || 'image', a.prompt, '--out', out];
    if (a.model) args.push('--model', a.model);
    if (a.aspect) args.push('--aspect', a.aspect);
    if (a.n) args.push('--n', String(a.n));
    for (const r of a.refs || []) args.push('--image', resolve(dir, r));
    for (const [k, v] of Object.entries(a.params || {})) args.push('--param', `${k}=${JSON.stringify(v)}`);
  } else if (a.tool === 'codex-image') {
    script = 'codex-image.mjs';
    args = [a.prompt, '--out', out];
    for (const r of a.refs || []) args.push('--ref', resolve(dir, r));
  } else if (a.tool === 'eleven') {
    script = 'elevenlabs.mjs';
    args = [a.mode || 'sfx', a.prompt, '--out', out];
    if (a.duration) args.push('--duration', String(a.duration));
    if (a.length) args.push('--length', String(a.length));
  } else { console.error(`? ${a.id}: unknown tool ${a.tool}`); failed++; continue; }

  jobs.push({ a, script, args });
}

// Small worker pool; output is prefixed with the asset id so parallel logs stay readable.
const run = ({ a, script, args }) => new Promise((done) => {
  const p = spawn(process.execPath, [resolve(ROOT, 'tools', script), ...args], { env: { ...process.env, INIT_CWD: dir } });
  const tag = `\x1b[1m${a.id}\x1b[0m`;
  const pipe = (s) => s.on('data', (d) => String(d).split('\n').filter(Boolean).forEach((l) => console.log(`${tag} ${l}`)));
  pipe(p.stdout); pipe(p.stderr);
  p.on('close', (code) => { if (code !== 0) failed++; done(); });
});
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.max(1, Number(values.parallel)) }, async () => {
  while (queue.length) await run(queue.shift());
}));
failed ? fail(`${failed} asset(s) failed`) : ok(`${jobs.length} asset(s) generated`);
