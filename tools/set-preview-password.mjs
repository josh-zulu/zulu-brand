#!/usr/bin/env node
// Sets the password for the shared GitHub Pages preview, without the password ever touching the repo.
//   npm run preview-password
// You type the password (hidden). Only its SHA-256 hash is stored, as the repo secret VITE_PREVIEW_PASSWORD_SHA256,
// via the GitHub CLI (`gh`, signed in). The next deploy picks it up. Run it again any time to change the password.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline';

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

const a = await ask('New preview password: ');
const b = await ask('Type it again: ');
if (!a || a !== b) { console.error('The two entries were empty or did not match. Nothing changed.'); process.exit(1); }
const hash = createHash('sha256').update(a).digest('hex');
const r = spawnSync('gh', ['secret', 'set', 'VITE_PREVIEW_PASSWORD_SHA256', '--body', hash], { stdio: 'inherit' });
if (r.status !== 0) { console.error('Could not save the secret. Is the GitHub CLI installed and signed in (gh auth status)?'); process.exit(1); }
spawnSync('gh', ['workflow', 'run', 'pages.yml'], { stdio: 'inherit' });
console.log('Saved. The preview is redeploying with the new password (takes about a minute).');
