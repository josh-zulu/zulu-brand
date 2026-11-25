import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deckApi } from './server/api';

const here = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(here, '../..');

export default defineConfig(({ mode }) => {
  // Keys live in the repo-root .env and stay server-side (no VITE_ prefix = never shipped to the browser).
  const env = loadEnv(mode, ROOT, '');
  return {
    // GitHub Pages serves the deck from a sub-path (/ai-trends/); the deploy workflow sets DECK_BASE.
    base: process.env.DECK_BASE || '/',
    plugins: [
      react(),
      deckApi(env),
      {
        // Dev only: a slide whose stylesheet hasn't been written yet gets an empty one instead of a fatal overlay.
        // Re-saving the slide (or a reload) picks up the real file once it exists. Builds still fail loudly.
        name: 'zulu-missing-slide-css',
        apply: 'serve',
        enforce: 'pre',
        resolveId(id, importer) {
          if (!importer || !id.startsWith('./') || !id.endsWith('.css') || !importer.includes('/src/slides/')) return null;
          const file = resolve(importer, '..', id);
          if (existsSync(file)) return null;
          this.warn(`missing ${id} (imported by ${importer.split('/src/')[1]}); using an empty stylesheet for now`);
          return `\0zulu-empty-css:${file}`;
        },
        load(id) { return id.startsWith('\0zulu-empty-css:') ? '' : null; },
      },
      {
        // Restart the dev server when the repo-root .env changes, so new keys apply without a manual restart.
        name: 'zulu-root-env-watch',
        configureServer(server) {
          const file = resolve(ROOT, '.env');
          server.watcher.add(file);
          server.watcher.on('change', (f) => { if (f === file) server.restart(); });
          server.watcher.on('add', (f) => { if (f === file) server.restart(); });
        },
      },
    ],
    resolve: {
      alias: {
        '@': resolve(here, 'src'),
        '@brand': resolve(ROOT, 'brand'),
      },
    },
    server: {
      port: 5180,
      fs: { allow: [ROOT] },
    },
    preview: { port: 5181 },
    // Pre-bundle the lazily loaded ElevenLabs client so the live dictation demo never triggers a reload on stage.
    optimizeDeps: { include: ['@elevenlabs/client'] },
  };
});
