import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, rng } from '@/lib/motion';
import { AgentCursor } from '@/components/AgentCursor';
import './S3ColourLab.css';

/**
 * Source slide 21 (AGO pitch · Colour lab). The lab actually works: pick a colour and every artwork is scored out of
 * 100 by colour distance (CIE Lab ΔE) against its palette, then the grid re-ranks itself.
 * The artworks are procedural colour studies drawn in code (exact palettes, honest stand-ins), never AGO collection data.
 *
 *  beat 0  title in, the lab window rises, nothing picked yet
 *  beat 1  a cursor drags the hue to cobalt blue → scores count up → the grid re-sorts, best match top-left
 *  beat 2  it drags to vermilion → the ranking reshuffles
 * Live mode: click or drag the hue strip to pick any colour yourself.
 */

// ───────────── colour maths ─────────────
type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const toHex = (c: RGB) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
function rgbToLab([r, g, b]: RGB) {
  const lin = (v: number) => { v /= 255; return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92; };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, y = R * 0.2126 + G * 0.7152 + B * 0.0722, z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
const deltaE = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ───────────── the studies (procedural stand-ins) ─────────────
type Draw = (x: CanvasRenderingContext2D, w: number, h: number, p: string[], r: () => number) => void;
interface Study { name: string; palette: [string, number][]; draw: Draw }

const soft = (x: CanvasRenderingContext2D, px: number, f: () => void) => { x.save(); x.filter = `blur(${px}px)`; f(); x.restore(); };
const STUDIES: Study[] = [
  { name: 'Study 01', palette: [['#1C2C86', 0.5], ['#2D54D2', 0.32], ['#C9D3F0', 0.18]], draw: (x, w, h, p) => {
    x.fillStyle = p[0]; x.fillRect(0, 0, w, h);
    soft(x, 5, () => { x.fillStyle = p[1]; x.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.46); x.fillStyle = p[2]; x.fillRect(w * 0.12, h * 0.64, w * 0.76, h * 0.22); });
  } },
  { name: 'Study 02', palette: [['#E1542C', 0.5], ['#F2A640', 0.3], ['#6A1E12', 0.2]], draw: (x, w, h, p) => {
    x.fillStyle = p[2]; x.fillRect(0, 0, w, h);
    const sq = (s: number, c: string) => { x.fillStyle = c; x.fillRect((w - s) / 2, h - s - (h - s) * 0.35, s, s); };
    sq(h * 0.92, p[0]); sq(h * 0.6, p[1]); sq(h * 0.3, p[0]);
  } },
  { name: 'Study 03', palette: [['#2A7F6F', 0.45], ['#9FD1C2', 0.25], ['#11312C', 0.15], ['#F1E7D0', 0.15]], draw: (x, w, h, p, r) => {
    let cx = 0; let i = 0;
    while (cx < w) { const sw = 14 + r() * 40; x.fillStyle = [p[0], p[1], p[0], p[2], p[3], p[0]][i++ % 6]; x.fillRect(cx, 0, sw + 1, h); cx += sw; }
  } },
  { name: 'Study 04', palette: [['#20325F', 0.55], ['#F2C14E', 0.25], ['#E8E1CF', 0.2]], draw: (x, w, h, p) => {
    x.fillStyle = p[0]; x.fillRect(0, 0, w, h);
    soft(x, 2, () => { x.fillStyle = p[2]; x.fillRect(0, h * 0.7, w, h * 0.3); });
    soft(x, 3, () => { x.fillStyle = p[1]; x.beginPath(); x.arc(w * 0.62, h * 0.4, h * 0.2, 0, Math.PI * 2); x.fill(); });
  } },
  { name: 'Study 05', palette: [['#C8B8A6', 0.45], ['#8A9BB0', 0.35], ['#3D4A5C', 0.2]], draw: (x, w, h, p) => {
    const bands = [[p[1], 0.42], [p[0], 0.2], [p[1], 0.06], [p[0], 0.14], [p[2], 0.18]] as const;
    let y = 0; soft(x, 3, () => bands.forEach(([c, f]) => { x.fillStyle = c; x.fillRect(-10, y, w + 20, h * f + 2); y += h * f; }));
  } },
  { name: 'Study 06', palette: [['#B03A5B', 0.5], ['#F4B6C2', 0.3], ['#3B1530', 0.2]], draw: (x, w, h, p) => {
    x.fillStyle = p[1]; x.fillRect(0, 0, w, h);
    x.fillStyle = p[0]; x.beginPath(); x.moveTo(0, h); x.lineTo(w * 0.72, 0); x.lineTo(w, 0); x.lineTo(w, h); x.fill();
    x.fillStyle = p[2]; x.beginPath(); x.moveTo(w * 0.38, h); x.lineTo(w, h * 0.2); x.lineTo(w, h * 0.42); x.lineTo(w * 0.6, h); x.fill();
  } },
  { name: 'Study 07', palette: [['#F4F1EA', 0.45], ['#D63C2F', 0.2], ['#1E47A8', 0.15], ['#F2C230', 0.1], ['#151515', 0.1]], draw: (x, w, h, p) => {
    x.fillStyle = p[0]; x.fillRect(0, 0, w, h);
    x.fillStyle = p[1]; x.fillRect(0, 0, w * 0.58, h * 0.55);
    x.fillStyle = p[2]; x.fillRect(w * 0.72, h * 0.68, w * 0.28, h * 0.32);
    x.fillStyle = p[3]; x.fillRect(0, h * 0.82, w * 0.22, h * 0.18);
    x.fillStyle = p[4]; [[0.58, 0, 0.025, 1], [0, 0.55, 1, 0.03], [0.72, 0.55, 0.025, 0.45], [0, 0.82, 0.72, 0.025], [0.22, 0.82, 0.025, 0.18]]
      .forEach(([a, b, c, d]) => x.fillRect(w * a, h * b, w * c, h * d));
  } },
  { name: 'Study 08', palette: [['#4B6B3A', 0.45], ['#C9D6A3', 0.35], ['#1F2A18', 0.2]], draw: (x, w, h, p) => {
    x.fillStyle = p[1]; x.fillRect(0, 0, w, h);
    [[0.95, p[0]], [0.72, p[1]], [0.5, p[0]], [0.26, p[2]]].forEach(([s, c]) => {
      x.fillStyle = c as string; x.beginPath(); x.arc(w * 0.5, h * 1.02, h * (s as number), Math.PI, 0); x.fill();
    });
  } },
  { name: 'Study 09', palette: [['#6D4C9F', 0.5], ['#B9A3E0', 0.3], ['#241A3A', 0.2]], draw: (x, w, h, p) => {
    const g = x.createRadialGradient(w * 0.42, h * 0.38, 4, w * 0.5, h * 0.5, w * 0.7);
    g.addColorStop(0, p[1]); g.addColorStop(0.45, p[0]); g.addColorStop(1, p[2]);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  } },
];
const LABS = STUDIES.map((s) => s.palette.map(([c, w]) => ({ lab: rgbToLab(hexToRgb(c)), w })));

function scoresFor(rgb: RGB) {
  const lab = rgbToLab(rgb);
  return LABS.map((pal) => {
    const wmax = Math.max(...pal.map((p) => p.w));
    let best = 0;
    // smooth falloff: a near-identical colour scores high 90s, an opposite one still gets a low score
    for (const p of pal) best = Math.max(best, Math.exp(-((deltaE(lab, p.lab) / 52) ** 1.35)) * (0.84 + 0.16 * (p.w / wmax)));
    return Math.round(best * 100);
  });
}
/** rank[i] = slot of study i (0 = best) */
const ranksFor = (scores: number[]) => {
  const order = scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, i]) => i);
  const rank: number[] = []; order.forEach((i, slot) => { rank[i] = slot; }); return rank;
};

function paint(study: Study, seed: number) {
  const w = 360, h = 280;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!;
  const r = rng(seed);
  study.draw(x, w, h, study.palette.map(([col]) => col), r);
  // canvas tooth: fine grain so they read as paint, not CSS
  const img = x.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) { const n = (r() - 0.5) * 18; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  x.putImageData(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.9);
}

// ───────────── layout ─────────────
const COLS = 3, TW = 196, TH = 190, GAP = 19;
const slot = (k: number) => ({ x: (k % COLS) * (TW + GAP), y: Math.floor(k / COLS) * (TH + GAP) });
const PICKS = [{ h: 226, s: 70, l: 45 }, { h: 14, s: 76, l: 52 }];
const HUE_MAX = 360;

function S3ColourLab({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const applyRef = useRef<((clientX: number) => void) | null>(null);
  const arts = useMemo(() => STUDIES.map((s, i) => paint(s, 40 + i)), []);
  const states = useMemo(() => PICKS.map((p) => { const sc = scoresFor(hslToRgb(p.h, p.s, p.l)); return { scores: sc, ranks: ranksFor(sc) }; }), []);

  useBeats(root, step, (tl) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const tiles = q('.clab-tile');
    const scale = el.getBoundingClientRect().width / 1920 || 1;
    const o = el.getBoundingClientRect();
    const strip = q('.clab-hue')[0].getBoundingClientRect();
    const hueX = (h: number) => (strip.left - o.left) / scale + (h / HUE_MAX) * (strip.width / scale);
    const hueY = (strip.top - o.top) / scale + strip.height / scale / 2;
    const cursor = q('.agent-cursor')[0];

    // live state the timeline tweens
    const pick = { h: 0, s: 0, l: 86 };
    const swatch = q('.clab-swatch')[0] as HTMLElement, hex = q('.clab-hex')[0], knob = q('.clab-knob')[0] as HTMLElement;
    const renderPick = () => {
      const rgb = hslToRgb(pick.h, pick.s, pick.l);
      swatch.style.background = toHex(rgb);
      hex.textContent = pick.s < 1 ? '#——————' : toHex(rgb);
      knob.style.left = `${(pick.h / HUE_MAX) * 100}%`;
      knob.style.background = toHex(hslToRgb(pick.h, 90, 50));
    };
    const proxies = tiles.map(() => ({ v: -1 })); // -1 = not scored yet
    const renderScore = (i: number) => {
      const v = proxies[i].v;
      tiles[i].querySelector('.clab-score b')!.textContent = v < 0 ? '—' : String(Math.round(v));
      (tiles[i].querySelector('.clab-bar i') as HTMLElement).style.transform = `scaleX(${Math.max(0, v) / 100})`;
    };
    tiles.forEach((t, i) => { gsap.set(t, slot(i)); renderScore(i); });
    renderPick();
    gsap.set(cursor, { x: 1990, y: 1000, opacity: 0 });

    // beat 0
    tl.from(q('.clab-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    revealLines(tl, q('.clab-title')[0], {}, 0.05);
    revealWords(tl, q('.clab-body')[0], {}, 0.6);
    tl.from(q('.clab-window'), { y: 90, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.3);
    tl.from(tiles, { opacity: 0, y: '+=24', duration: 0.8, stagger: 0.04, ease: 'expo.out' }, 0.8);

    const pickBeat = (n: number, from: number) => {
      const p = PICKS[n], st = states[n];
      tl.addLabel(`b${n + 1}`);
      if (n === 0) {
        tl.to(cursor, { opacity: 1, duration: 0.2 });
        tl.to(cursor, { x: hueX(from), y: hueY, duration: 0.8, ease: 'power3.inOut' }, '<');
      }
      tl.to(cursor, { scale: 0.86, duration: 0.12 });
      tl.to(pick, { s: p.s, l: p.l, duration: 0.25, onUpdate: renderPick }, '<');
      const drag = tl.duration();
      tl.to(pick, { h: p.h, duration: 1.15, ease: 'power2.inOut', onUpdate: renderPick }, drag);
      tl.to(cursor, { x: hueX(p.h), duration: 1.15, ease: 'power2.inOut' }, drag);
      tl.to(cursor, { scale: 1, duration: 0.15 });
      const res = tl.duration();
      tiles.forEach((t, i) => {
        tl.to(proxies[i], { v: st.scores[i], duration: 0.9, ease: 'power3.out', onUpdate: () => renderScore(i) }, res);
        tl.to(t, { ...slot(st.ranks[i]), duration: 1.0, ease: 'power3.inOut' }, res + 0.35 + st.ranks[i] * 0.03);
        tl.to(t.querySelector('.clab-ring'), { opacity: st.ranks[i] === 0 ? 1 : 0, duration: 0.4 }, res + 1.1);
        tl.to(t, { opacity: st.ranks[i] < 3 ? 1 : 0.55, duration: 0.6 }, res + 1.0);
      });
    };
    pickBeat(0, 0);
    pickBeat(1, PICKS[0].h);

    // Live: pick any colour by clicking or dragging the hue strip (wired up in JSX through applyRef).
    let raf = 0;
    applyRef.current = mode !== 'live' ? null : (clientX: number) => {
      const b = q('.clab-hue')[0].getBoundingClientRect();
      const h = Math.max(0, Math.min(1, (clientX - b.left) / b.width)) * HUE_MAX;
      Object.assign(pick, { h, s: 72, l: 48 }); renderPick();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sc = scoresFor(hslToRgb(pick.h, pick.s, pick.l)), rk = ranksFor(sc);
        gsap.to(cursor, { opacity: 0, duration: 0.2 });
        tiles.forEach((t, i) => {
          gsap.to(proxies[i], { v: sc[i], duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => renderScore(i) });
          gsap.to(t, { ...slot(rk[i]), opacity: rk[i] < 3 ? 1 : 0.55, duration: 0.8, ease: 'power3.inOut', overwrite: 'auto' });
          gsap.to(t.querySelector('.clab-ring'), { opacity: rk[i] === 0 ? 1 : 0, duration: 0.3, overwrite: true });
        });
      });
    };
  }, [arts.length]);

  return (
    <div ref={root} className="colour-lab">
      <div className="clab-copy">
        <div className="clab-kicker p34-kicker label"><i /><b>AGO pitch</b> · Colour lab</div>
        <h2 className="clab-title display">Test the idea<br />before we<br />pitch it</h2>
        <p className="clab-body">Pick any colour and see which works in the collection match it, scored out of 100.</p>
      </div>

      <div className="clab-window">
        <div className="clab-bar"><span className="clab-dots"><i /><i /><i /></span></div>
        <div className="clab-app">
          <div className="clab-pick">
            <div className="clab-label">Pick a colour</div>
            <div className="clab-swatch" />
            <div className="clab-hex">#——————</div>
            <div
              className="clab-hue"
              onPointerDown={(e) => { if (!applyRef.current) return; e.currentTarget.setPointerCapture(e.pointerId); applyRef.current(e.clientX); }}
              onPointerMove={(e) => { if (applyRef.current && e.currentTarget.hasPointerCapture(e.pointerId)) applyRef.current(e.clientX); }}
            ><div className="clab-knob" /></div>
          </div>
          <div className="clab-results">
            <div className="clab-label">Matches <span>/ 100</span></div>
            <div className="clab-grid">
              {STUDIES.map((s, i) => (
                <div key={s.name} className="clab-tile">
                  <div className="clab-art" style={{ backgroundImage: `url(${arts[i]})` }}><span className="clab-ring" /></div>
                  <div className="clab-cap"><span>{s.name}</span><span className="clab-score"><b>—</b></span></div>
                  <div className="clab-bar"><i /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AgentCursor label="" tone="paper" />
    </div>
  );
}

export default defineSlide({
  id: 's3-colour-lab',
  section: 4,
  title: 'AGO · Colour lab',
  steps: 2,
  notes:
    'Test the idea before we pitch it. Pick any colour and see which works in the collection match it, scored out of 100.\n' +
    'Click 1 picks a cobalt blue, click 2 a vermilion: every work is re-scored and the grid re-ranks itself. The scoring is real (colour distance against each palette), but the tiles are stand-in colour studies drawn in code, not the AGO collection.\n' +
    'In the live window you can click or drag the colour strip to pick any colour yourself.',
  Component: S3ColourLab,
});
