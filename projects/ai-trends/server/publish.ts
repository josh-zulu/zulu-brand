/**
 * "Push to main" from the slides panel (dev server only, so only on a laptop with the repo checked out).
 *
 *   GET  /api/publish  → { branch, changed: ['order' | 'presenters'] }   what's saved locally but not pushed
 *   POST /api/publish  → { order: { order, hidden } }  writes src/order.json, checks the build, commits order.json and
 *                        presenters.json (nothing else), pulls, pushes to main.
 *
 * Presenter assignments are already written to public/presenters.json on every click; this only pushes them.
 */
import { execFile } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = fileURLToPath(new URL('..', import.meta.url));
const ORDER_FILE = fileURLToPath(new URL('../src/order.json', import.meta.url));
const FILES = { order: 'src/order.json', presenters: 'public/presenters.json' } as const;
// npm/node live next to the node running Vite (~/.local/node/bin), which may not be on the server's PATH.
const ENV = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` };

function run(cmd: string, args: string[], timeout = 180_000): Promise<{ ok: boolean; out: string }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: PROJECT, env: ENV, timeout, maxBuffer: 8 << 20 }, (err, stdout, stderr) =>
      resolve({ ok: !err, out: `${stdout}${stderr}`.trim() }));
  });
}

const tail = (s: string, n = 12) => s.split('\n').slice(-n).join('\n');

export async function publishStatus() {
  const branch = (await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).out;
  const st = await run('git', ['status', '--porcelain', '--', ...Object.values(FILES)]);
  const changed = (Object.keys(FILES) as (keyof typeof FILES)[]).filter((k) => st.out.includes(FILES[k]));
  return { branch, changed };
}

let busy = false;

export async function publish(body: any): Promise<{ status: number; body: unknown }> {
  const cfg = body?.order;
  const ok = (a: unknown) => Array.isArray(a) && a.every((x) => typeof x === 'string' && /^[a-z0-9-]+$/.test(x));
  if (!cfg || !ok(cfg.order) || !ok(cfg.hidden) || !cfg.order.length) return { status: 400, body: { error: 'Bad running order' } };
  if (busy) return { status: 409, body: { error: 'A push is already running' } };
  busy = true;
  try {
    const { branch } = await publishStatus();
    if (branch !== 'main') return { status: 409, body: { error: `This copy is on "${branch}", not main. Switch to main first.` } };

    writeFileSync(ORDER_FILE, JSON.stringify({ order: cfg.order, hidden: cfg.hidden }, null, 2) + '\n');
    const { changed } = await publishStatus();
    if (!changed.length) return { status: 200, body: { ok: true, pushed: false, message: 'Nothing new to push' } };

    // Same rule as by hand: don't push a broken deck.
    const build = await run('npm', ['run', 'build']);
    if (!build.ok) return { status: 500, body: { error: 'The build failed, so nothing was pushed', detail: tail(build.out) } };

    const what = changed.map((k) => (k === 'order' ? 'running order' : 'presenters')).join(' and ');
    const files = changed.map((k) => FILES[k]);
    await run('git', ['add', '--', ...files]);
    const commit = await run('git', ['commit', '-m', `Update ${what} from the slides panel`, '--only', '--', ...files]);
    if (!commit.ok) return { status: 500, body: { error: 'Commit failed', detail: tail(commit.out) } };

    const pull = await run('git', ['pull', '--no-rebase', '--no-edit']);
    if (!pull.ok) {
      await run('git', ['merge', '--abort']);
      return { status: 409, body: { error: 'Your change is committed here, but it clashes with what someone else pushed. Ask Claude to merge it.', detail: tail(pull.out) } };
    }
    const push = await run('git', ['push']);
    if (!push.ok) return { status: 500, body: { error: 'Committed here, but the push failed', detail: tail(push.out) } };
    return { status: 200, body: { ok: true, pushed: true, message: `Pushed ${what} to main` } };
  } finally {
    busy = false;
  }
}
