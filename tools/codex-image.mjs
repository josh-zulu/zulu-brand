#!/usr/bin/env node
// Image generation through the Codex CLI, billed to your ChatGPT plan (no API key).
// One-time setup:  codex login   (choose "Sign in with ChatGPT")
//
//   npm run codex-image -- "prompt" --out projects/ai-trends/public/media/generated/x.png [--ref style.png] [--ref layout.png]
//
// Codex runs non-interactively with its built-in image generation tool, then copies the result to --out.
// If Codex doesn't copy it, we pick up the newest image it saved under ~/.codex. Writes a .prompt.json sidecar.
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync, copyFileSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { homedir } from 'node:os';
import { fail, ok, info, userPath, ensureDir, writeSidecar } from './lib/common.mjs';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o' },
    ref: { type: 'string', multiple: true, short: 'r' },
    model: { type: 'string', short: 'm' },
    help: { type: 'boolean', short: 'h' },
  },
});
const prompt = positionals.join(' ').trim();
if (!prompt || values.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(prompt ? 0 : 1);
}
if (!values.out) fail('--out <file.png> is required');

const out = userPath(values.out);
ensureDir(out);
const refs = (values.ref || []).map(userPath);
for (const r of refs) if (!existsSync(r)) fail(`Reference image not found: ${r}`);

const instruction = [
  'Use your built-in image generation tool to create exactly one image for this brief.',
  '',
  `BRIEF: ${prompt}`,
  '',
  refs.length ? 'The attached image(s) are references for style, composition or content. Follow them closely.' : '',
  `When the image is generated, copy the saved image file to this exact path: ${out}`,
  'Do not write any code or create any other files. Reply with only the final path.',
].filter(Boolean).join('\n');

const args = ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', dirname(out), '--add-dir', dirname(out)];
if (values.model) args.push('-m', values.model);
for (const r of refs) args.push('-i', r);
args.push(instruction);

const started = Date.now();
info('codex → image_generation (this can take a minute)…');
const code = await new Promise((resolve) => {
  const p = spawn('codex', args, { stdio: ['ignore', 'pipe', 'inherit'] });
  p.stdout.on('data', (d) => process.stdout.write(`\x1b[2m${d}\x1b[0m`));
  p.on('error', (e) => fail(`Could not start codex (${e.message}). Is it installed? npm i -g @openai/codex`));
  p.on('close', resolve);
});
if (code !== 0) fail(`codex exited with ${code}. If it says you're not logged in, run: codex login`);

if (!existsSync(out) || statSync(out).mtimeMs < started) {
  // Fallback: newest image Codex wrote anywhere under CODEX_HOME since we started.
  const home = process.env.CODEX_HOME || join(homedir(), '.codex');
  let best = null;
  (function walk(d, depth = 0) {
    if (depth > 6 || !existsSync(d)) return;
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      let s; try { s = statSync(p); } catch { continue; }
      if (s.isDirectory()) walk(p, depth + 1);
      else if (/\.(png|jpe?g|webp)$/i.test(name) && s.mtimeMs >= started && (!best || s.mtimeMs > best.t)) best = { p, t: s.mtimeMs };
    }
  })(home);
  if (!best) fail('Codex finished but no new image was found. Try again, or check `codex login status`.');
  const target = extname(out) ? out : `${out}${extname(best.p)}`;
  copyFileSync(best.p, target);
}
writeSidecar(out, { tool: 'codex-image', model: values.model || 'codex default', prompt, refs: values.ref || [], seconds: Math.round((Date.now() - started) / 1000) });
ok(out);
