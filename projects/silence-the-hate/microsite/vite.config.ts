import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static site: no server code, no keys. STH_BASE lets a preview deploy serve it from a sub-path.
export default defineConfig({
  base: process.env.STH_BASE || '/',
  plugins: [react()],
  server: { port: 5193, strictPort: true },
  preview: { port: 5194 },
});
