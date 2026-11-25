/**
 * URLs for files in public/ that work at the site root (local dev) and under a sub-path (GitHub Pages: /ai-trends/).
 *   media('sfx/key.mp3')      → '/ai-trends/media/sfx/key.mp3' on Pages, '/media/sfx/key.mp3' locally
 *   asset('/presenters.json') → '/ai-trends/presenters.json' on Pages
 * External, data: and blob: URLs pass through untouched.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const external = (p: string) => /^(https?:|data:|blob:)/.test(p);

export const asset = (p: string) => (external(p) ? p : `${BASE}${p.startsWith('/') ? p : `/${p}`}`);
export const media = (p: string) => (external(p) ? p : p.startsWith('/') ? asset(p) : asset(`/media/${p}`));
