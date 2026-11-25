#!/usr/bin/env node
// Media prep for the web, using the ffmpeg binary bundled by ffmpeg-static (no system install needed).
//
//   npm run media -- web    in.mov  --out clips/blender.mp4 [--width 1920] [--crf 23] [--mute]
//   npm run media -- loop   in.mp4  --out loops/agent-bg.mp4 [--start 3] [--duration 8] [--width 1920]
//   npm run media -- gif    in.gif  --out clips/demo.mp4            (GIF → small looping MP4)
//   npm run media -- poster in.mp4  --out clips/blender.jpg [--at 1.5]
//   npm run media -- probe  in.mp4
//   npm run media -- optimize projects/ai-trends/src/assets/generated [--width 1600]
//        PNG/JPG → WebP (q82) in place; originals + sidecars move to projects/<p>/assets.raw/ (gitignored)
//
// "web" = H.264, yuv420p, +faststart: plays everywhere, starts instantly. Loops are muted and lighter.
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fail, ok, info, userPath, ensureDir } from './lib/common.mjs';

const require = createRequire(import.meta.url);
let ffmpeg;
try { ffmpeg = require('ffmpeg-static'); } catch { fail('ffmpeg-static is missing. Run: npm install'); }

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o' },
    width: { type: 'string', short: 'w' },
    crf: { type: 'string' },
    mute: { type: 'boolean' },
    start: { type: 'string' },
    duration: { type: 'string', short: 'd' },
    at: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});
const [mode, input] = positionals;
if (!mode || values.help) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  process.exit(0);
}
if (!input) fail(`Usage: media ${mode} <input> --out <output>`);
const inp = userPath(input);

function run(args, { quiet = true } = {}) {
  return new Promise((resolve) => {
    const p = spawn(ffmpeg, ['-hide_banner', '-y', ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (!quiet) process.stderr.write(d); });
    p.on('close', (code) => resolve({ code, err }));
  });
}
const scale = (w) => `scale='min(${w},iw)':-2:flags=lanczos`;
async function must(args) {
  const out = userPath(values.out || fail('--out is required'));
  ensureDir(out);
  info(`ffmpeg ${mode}…`);
  const { code, err } = await run([...args, out]);
  if (code !== 0) { console.error(err.split('\n').slice(-15).join('\n')); fail(`ffmpeg failed (${code})`); }
  ok(out);
}

const w = values.width || '1920';
switch (mode) {
  case 'web':
    await must(['-i', inp, '-vf', scale(w), '-c:v', 'libx264', '-preset', 'slow', '-crf', values.crf || '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      ...(values.mute ? ['-an'] : ['-c:a', 'aac', '-b:a', '128k'])]);
    break;
  case 'loop':
    await must([...(values.start ? ['-ss', values.start] : []), '-i', inp, ...(values.duration ? ['-t', values.duration] : []),
      '-vf', scale(w), '-c:v', 'libx264', '-preset', 'slow', '-crf', values.crf || '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']);
    break;
  case 'gif':
    await must(['-i', inp, '-vf', `${scale(w)},fps=30`, '-c:v', 'libx264', '-crf', values.crf || '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']);
    break;
  case 'poster':
    await must(['-ss', values.at || '1', '-i', inp, '-frames:v', '1', '-q:v', '3']);
    break;
  case 'optimize': {
    const { readdirSync, renameSync, mkdirSync, existsSync: ex, copyFileSync } = await import('node:fs');
    const { join, relative, sep } = await import('node:path');
    const files = readdirSync(inp).filter((f) => /\.(png|jpe?g)$/i.test(f));
    if (!files.length) { info('nothing to optimize'); break; }
    // archive next to the project: projects/<p>/assets.raw/<same relative path>
    const parts = inp.split(sep); const pi = parts.lastIndexOf('projects');
    const projectDir = pi >= 0 ? parts.slice(0, pi + 2).join(sep) : inp;
    const rawDir = join(projectDir, 'assets.raw', relative(projectDir, inp));
    mkdirSync(rawDir, { recursive: true });
    for (const f of files) {
      const src = join(inp, f);
      const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
      const { code, err } = await run(['-i', src, '-vf', scale(values.width || '1600'), '-c:v', 'libwebp', '-quality', '82', out]);
      if (code !== 0) { console.error(err.split('\n').slice(-5).join('\n')); continue; }
      renameSync(src, join(rawDir, f));
      const side = `${src}.prompt.json`;
      if (ex(side)) { copyFileSync(side, `${out}.prompt.json`); renameSync(side, join(rawDir, `${f}.prompt.json`)); }
      ok(relative(process.cwd(), out));
    }
    break;
  }
  case 'probe': {
    const { err } = await run(['-i', inp]);
    console.log(err.split('\n').filter((l) => /Duration|Stream/.test(l)).join('\n'));
    break;
  }
  default:
    fail(`Unknown mode "${mode}". Use web | loop | gif | poster | probe.`);
}
