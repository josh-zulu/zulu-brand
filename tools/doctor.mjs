#!/usr/bin/env node
// Checks that everything the repo needs is in place. Never prints secret values.
//   npm run doctor
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { ROOT, loadEnv } from './lib/common.mjs';

loadEnv();
const require = createRequire(import.meta.url);
const rows = [];
const check = (name, pass, fix) => rows.push({ name, pass, fix });
const has = (cmd, args = ['--version']) => spawnSync(cmd, args, { encoding: 'utf8' });

const [maj, min] = process.versions.node.split('.').map(Number);
check(`Node ${process.versions.node}`, maj > 22 || (maj === 22 && min >= 18), 'Install Node 22.18+');
check('Dependencies installed', existsSync(resolve(ROOT, 'node_modules')), 'npm install');
let ff = false; try { ff = existsSync(require('ffmpeg-static')); } catch {}
check('ffmpeg (ffmpeg-static)', ff, 'npm install');
check('.env file', existsSync(resolve(ROOT, '.env')), 'cp .env.example .env, then paste your keys');
for (const k of ['FAL_KEY', 'ELEVENLABS_API_KEY', 'ANTHROPIC_API_KEY']) check(`${k} set`, !!process.env[k], `Add ${k} to .env`);
const codex = has('codex');
check('Codex CLI installed', codex.status === 0, 'npm i -g @openai/codex');
if (codex.status === 0) {
  const s = has('codex', ['login', 'status']);
  check('Codex signed in (ChatGPT)', s.status === 0 && !/not logged in/i.test(`${s.stdout}${s.stderr}`), 'codex login');
}
const git = has('git');
check('git available', git.status === 0 && !/xcode-select/.test(git.stderr || ''), 'xcode-select --install (Command Line Tools)');

for (const r of rows) console.log(`${r.pass ? '\x1b[32m✔\x1b[0m' : '\x1b[33m○\x1b[0m'} ${r.name}${r.pass ? '' : `\x1b[2m  → ${r.fix}\x1b[0m`}`);
const missing = rows.filter((r) => !r.pass).length;
console.log(missing ? `\n${missing} thing(s) to set up. The deck itself runs without keys; keys unlock generation and the live demos.` : '\nAll set.');
