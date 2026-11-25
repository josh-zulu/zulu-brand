import { rng } from '@/lib/motion';

/**
 * Stand-ins for generated imagery. Real images (from `npm run assets -- ai-trends --make`) land in
 * src/assets/generated/ and are picked up automatically by <GenImage id>. Until then, a deterministic
 * procedural composition (mesh gradient + a subject shape + horizon) keeps every layout honest.
 */

// Vite bundles anything generated into src/assets/generated (png, jpg, webp).
const generated = import.meta.glob('../assets/generated/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const byId: Record<string, string> = {};
for (const [path, url] of Object.entries(generated)) {
  const name = path.split('/').pop()!.replace(/\.(png|jpe?g|webp)$/, '');
  byId[name] = url;
}
export const generatedUrl = (id: string): string | undefined => byId[id];
/** All generated images whose id starts with a prefix, sorted (e.g. 'sameness-' → sameness-1…sameness-24). */
export const generatedSet = (prefix: string): string[] =>
  Object.keys(byId).filter((k) => k.startsWith(prefix)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((k) => byId[k]);

const PALETTES = [
  ['#1f2a44', '#e86a3a', '#f3c98b', '#6c8fb3'], // dusk
  ['#0f3b3a', '#2fd6a3', '#e9f5db', '#118ab2'], // lagoon
  ['#2b1d2f', '#d6456b', '#ffb4a2', '#6d597a'], // rose
  ['#151515', '#f8f7f4', '#9e9d99', '#3a3837'], // mono (brand)
  ['#3d2b1f', '#e9b44c', '#f1e3c6', '#9b5d2e'], // ochre
  ['#0b1d3a', '#4dd0e1', '#c7f9ff', '#3a86ff'], // cyan
  ['#1b2b1a', '#9bd16a', '#f0f7d4', '#4c7a34'], // moss
  ['#2a1033', '#a06cd5', '#f2d7ff', '#6247aa'], // violet
];

export interface GenStyle { background: string; subject: { x: number; y: number; r: number; color: string }; horizon: number; palette: string[] }

/** Deterministic composition from a seed. `jitter` near 0 makes near-identical siblings (the sea of sameness). */
export function genStyle(seed: number, opts: { palette?: number; jitter?: number } = {}): GenStyle {
  const r = rng(seed);
  const j = opts.jitter ?? 1;
  const pal = PALETTES[(opts.palette ?? Math.floor(r() * PALETTES.length)) % PALETTES.length];
  const base = rng(opts.palette ?? seed); // shared base when palette is fixed
  const mix = (a: number) => a * (1 - j) + r() * j;
  const ax = mix(base()) * 100, ay = mix(base()) * 60, bx = mix(base()) * 100, by = 40 + mix(base()) * 60;
  const background = [
    `radial-gradient(60% 70% at ${ax}% ${ay}%, ${pal[1]}cc, transparent 70%)`,
    `radial-gradient(70% 60% at ${bx}% ${by}%, ${pal[3]}dd, transparent 72%)`,
    `radial-gradient(50% 40% at ${100 - ax}% ${100 - ay * 0.5}%, ${pal[2]}88, transparent 70%)`,
    `linear-gradient(${Math.round(160 + mix(base()) * 40)}deg, ${pal[0]}, ${pal[3]})`,
  ].join(',');
  return {
    background,
    subject: { x: 30 + mix(base()) * 40, y: 30 + mix(base()) * 30, r: 14 + mix(base()) * 16, color: pal[2] },
    horizon: 55 + mix(base()) * 25,
    palette: pal,
  };
}

/** A procedural "generated image" tile. Fills its parent. */
export function GenTile({ seed, palette, jitter, className = '', style, showSubject = true }: {
  seed: number; palette?: number; jitter?: number; className?: string; style?: React.CSSProperties; showSubject?: boolean;
}) {
  const g = genStyle(seed, { palette, jitter });
  return (
    <div className={`gen-tile ${className}`} style={{ background: g.background, ...style }}>
      <div className="gen-horizon" style={{ top: `${g.horizon}%`, background: `linear-gradient(180deg, ${g.palette[0]}00, ${g.palette[0]}cc)` }} />
      {showSubject && (
        <div
          className="gen-subject"
          style={{ left: `${g.subject.x}%`, top: `${g.subject.y}%`, width: `${g.subject.r}%`, background: `radial-gradient(circle at 35% 30%, #fff8, ${g.subject.color} 45%, ${g.palette[1]} 100%)` }}
        />
      )}
    </div>
  );
}

/** Real generated image if it exists (src/assets/generated/<id>.png|jpg|webp), procedural tile otherwise. */
export function GenImage({ id, seed = 1, palette, jitter, className = '', style, alt = '' }: {
  id: string; seed?: number; palette?: number; jitter?: number; className?: string; style?: React.CSSProperties; alt?: string;
}) {
  const url = generatedUrl(id);
  if (url) return <img className={`gen-img ${className}`} style={style} src={url} alt={alt} draggable={false} />;
  return <GenTile seed={seed} palette={palette} jitter={jitter} className={className} style={style} />;
}
