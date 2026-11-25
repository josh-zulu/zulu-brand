// Shared helpers for the Zulu tool scripts. Zero dependencies: Node 22 built-ins only.
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Load ROOT/.env into process.env (existing env vars win). */
export function loadEnv() {
  const file = resolve(ROOT, '.env');
  if (existsSync(file)) {
    try { process.loadEnvFile(file); } catch { /* malformed .env: ignore, checks below will report */ }
  }
}

export function requireEnv(name, hint) {
  loadEnv();
  const v = process.env[name];
  if (!v) {
    fail(`${name} is not set. Add it to ${resolve(ROOT, '.env')} (see .env.example).${hint ? ' ' + hint : ''}`);
  }
  return v;
}

export function fail(msg, code = 1) {
  console.error(`\x1b[31m✖\x1b[0m ${msg}`);
  process.exit(code);
}

export function ok(msg) { console.log(`\x1b[32m✔\x1b[0m ${msg}`); }
export function info(msg) { console.log(`\x1b[2m•\x1b[0m ${msg}`); }

export function ensureDir(file) { mkdirSync(dirname(file), { recursive: true }); }

/** Resolve a user path relative to the cwd the npm script was launched from. */
export function userPath(p) {
  return resolve(process.env.INIT_CWD || process.cwd(), p);
}

/** Write a provenance sidecar next to a generated file: <file>.prompt.json */
export function writeSidecar(file, data) {
  const side = `${file}.prompt.json`;
  writeFileSync(side, JSON.stringify({ createdAt: new Date().toISOString(), ...data }, null, 2));
  return side;
}

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
};
export function mimeOf(file) { return MIME[extname(file).toLowerCase()] || 'application/octet-stream'; }

/** Local file → data URI (fal accepts these anywhere it takes a URL). URLs pass through. */
export function toUrlOrDataUri(p) {
  if (/^https?:\/\//.test(p) || p.startsWith('data:')) return p;
  const abs = userPath(p);
  if (!existsSync(abs)) fail(`File not found: ${abs}`);
  return `data:${mimeOf(abs)};base64,${readFileSync(abs).toString('base64')}`;
}

export async function download(url, out) {
  ensureDir(out);
  const res = await fetch(url);
  if (!res.ok) fail(`Download failed (${res.status}) ${url}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  return out;
}

/** Parse repeated --param key=value flags; values are JSON when they parse, else strings. */
export function parseParams(list = []) {
  const out = {};
  for (const kv of list) {
    const i = kv.indexOf('=');
    if (i < 1) fail(`--param expects key=value, got "${kv}"`);
    const k = kv.slice(0, i), raw = kv.slice(i + 1);
    try { out[k] = JSON.parse(raw); } catch { out[k] = raw; }
  }
  return out;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
