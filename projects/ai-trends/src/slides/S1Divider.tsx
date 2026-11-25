import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { defineSlide, type SlideProps } from '@/engine/types';
import { SectionDivider } from '@/components/SectionDivider';
import { AgentCursor } from '@/components/AgentCursor';
import { generatedSet, GenTile } from '@/components/GenArt';
import { rng } from '@/lib/motion';
import './S1Divider.css';
import { media } from '@/lib/asset';

/**
 * Section 1 divider. Full-bleed agent footage behind the title (clips/agent-loop.mp4).
 * Until that clip exists, a generative stand-in plays instead: a desk of app windows seen at an angle,
 * with three agent cursors doing real-looking work (dragging cards, filling a sheet, writing a doc,
 * placing images, cutting a timeline) while a mono log streams. Kept low-contrast under the scrim.
 */
const CLIP = 'clips/agent-loop.mp4';

// Vite's SPA fallback answers missing files with index.html, so check the content type, not just the status.
let clipKnown: boolean | null = null;
let clipCheck: Promise<boolean> | null = null;
function checkClip() {
  clipCheck ??= fetch(media(CLIP), { method: 'HEAD', cache: 'no-store' })
    .then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('video/'))
    .catch(() => false)
    .then((v) => (clipKnown = v));
  return clipCheck;
}

function S1DividerSlide(p: SlideProps) {
  const [clip, setClip] = useState<boolean | null>(clipKnown);
  useEffect(() => {
    let alive = true;
    checkClip().then((v) => { if (alive) setClip(v); });
    return () => { alive = false; };
  }, []);
  return (
    <SectionDivider
      {...p}
      number={1}
      title="The year AI started working"
      video={clip ? CLIP : undefined}
      background={clip === false ? <AgentsAtWork mode={p.mode} /> : null}
    />
  );
}

/* ───────────────────────── generative stand-in ───────────────────────── */

const LOG = [
  ['›', 'open  brief_northline.pdf'], ['✓', 'read 14 pages'], ['›', "search drive  'winter 2026'"], ['✓', '38 files'],
  ['›', 'draft  shot list v2'], ['…', 'checking against brief'], ['✓', '3 fixes applied'], ['›', 'export  storyboard.pdf'],
  ['✓', 'uploaded to Asana'], ['›', 'resize  hero  ×12'], ['…', 'checking crops'], ['✓', 'done'],
  ['›', 'update  media plan'], ['✓', '6 rows changed'], ['›', 'summarise  call notes'], ['✓', 'sent to #northline'],
  ['›', 'build  pitch deck'], ['…', '9 of 14 slides'],
];
const LOG_LH = 34;

const SHEET_COLS = 6, SHEET_ROWS = 10, CELL_W = 118, CELL_H = 36;
const SHEET_FILL = [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4]]; // [row, col]

function Win({ x, y, w, h, title, className = '', children }: { x: number; y: number; w: number; h: number; title: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`d1-win ${className}`} style={{ left: x, top: y, width: w, height: h }}>
      <div className="d1-bar"><i /><i /><i /><span>{title}</span></div>
      <div className="d1-body">{children}</div>
    </div>
  );
}

function AgentsAtWork({ mode }: { mode: SlideProps['mode'] }) {
  const root = useRef<HTMLDivElement>(null);
  const images = generatedSet('campaign-');
  const r = rng(11);
  const docLines = Array.from({ length: 15 }, (_, i) => (i === 0 ? 0.55 : i % 5 === 4 ? 0.4 + r() * 0.2 : 0.72 + r() * 0.26));
  const sheetBars = Array.from({ length: SHEET_ROWS * SHEET_COLS }, () => 0.35 + r() * 0.55);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const loops: gsap.core.Animation[] = [];
    const loop = (vars: gsap.TimelineVars = {}) => { const t = gsap.timeline({ repeat: -1, ...vars }); loops.push(t); return t; };

    // the whole desk drifts slowly, like a handheld shot
    loops.push(gsap.fromTo(q('.d1-plane'), { x: -50, y: 10 }, { x: 50, y: -16, duration: 26, ease: 'sine.inOut', repeat: -1, yoyo: true }));

    // ── log: one line every 0.9s; the list is doubled so the wrap is seamless
    {
      const t = loop();
      LOG.forEach((_, k) => t.to(q('.d1-log-list'), { y: -LOG_LH * (k + 1), duration: 0.32, ease: 'power2.out' }, k * 0.9 + 0.6));
      t.set(q('.d1-log-list'), { y: 0 }, LOG.length * 0.9 + 0.6);
    }

    // ── sheet: a selection walks two columns; each cell fills as it lands; cursor 2 rides with it
    {
      const sel = q('.d1-sel')[0];
      const cur = q('.d1-cur-2')[0];
      const cells = SHEET_FILL.map(([rw, c]) => q(`.d1-cell[data-rc="${rw}-${c}"] .d1-bar-fill`)[0]);
      const sx = 740 + 20, sy = 60 + 44 + 16;
      const t = loop({ repeatDelay: 1.2 });
      t.set(cells, { scaleX: 0 });
      SHEET_FILL.forEach(([rw, c], k) => {
        const x = sx + (c - 1) * CELL_W, y = sy + rw * CELL_H;
        const at = 0.4 + k * 0.62;
        t.to(sel, { x, y, duration: 0.28, ease: 'power3.inOut' }, at);
        t.to(cur, { x: x + CELL_W - 18, y: y + CELL_H - 8, duration: 0.3, ease: 'power3.inOut' }, at);
        t.to(cells[k], { scaleX: 1, duration: 0.24, ease: 'power2.out' }, at + 0.3);
      });
      t.to(cells, { scaleX: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in' }, '+=1.4');
    }

    // ── board: cursor 1 drags a card from To do → Doing → Done, then a new one appears
    {
      const card = q('.d1-card-live')[0];
      const cur = q('.d1-cur-1')[0];
      const bx = 1560 + 20, by = 110 + 44 + 56; // first card slot
      const colX = (c: number) => bx + c * 244;
      const t = loop({ repeatDelay: 0.4 });
      t.set(card, { x: colX(0), y: by + 3 * 92, opacity: 0, scale: 1 });
      t.to(card, { opacity: 1, duration: 0.4 });
      t.to(cur, { x: colX(0) + 150, y: by + 3 * 92 + 40, duration: 0.8, ease: 'power3.inOut' }, '<');
      t.to([cur, card], { scale: 0.96, duration: 0.12 });
      t.to(card, { x: colX(1), y: by + 92, rotation: -2, duration: 0.9, ease: 'power3.inOut' }, '+=0.05');
      t.to(cur, { x: colX(1) + 150, y: by + 92 + 40, duration: 0.9, ease: 'power3.inOut' }, '<');
      t.to([cur, card], { scale: 1, rotation: 0, duration: 0.25, ease: 'zak.settle' });
      t.to(cur, { x: colX(1) + 210, y: by + 260, duration: 0.9, ease: 'power2.inOut' }, '+=0.4');
      t.to(cur, { x: colX(1) + 150, y: by + 92 + 40, duration: 0.7, ease: 'power3.inOut' }, '+=0.6');
      t.to([cur, card], { scale: 0.96, duration: 0.12 });
      t.to(card, { x: colX(2), y: by + 2 * 92, rotation: 2, duration: 0.9, ease: 'power3.inOut' }, '+=0.05');
      t.to(cur, { x: colX(2) + 150, y: by + 2 * 92 + 40, duration: 0.9, ease: 'power3.inOut' }, '<');
      t.to([cur, card], { scale: 1, rotation: 0, duration: 0.25, ease: 'zak.settle' });
      t.to(card.querySelector('.d1-tick'), { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(3)' });
      t.to(card, { opacity: 0, duration: 0.5 }, '+=1.4');
      t.set(card.querySelector('.d1-tick'), { scale: 0, opacity: 0 });
    }

    // ── doc: lines write themselves, caret leading
    {
      const lines = q('.d1-doc-line');
      const caret = q('.d1-doc-caret')[0];
      const writeFrom = 6;
      const t = loop({ repeatDelay: 0.6 });
      t.set(lines.slice(writeFrom), { scaleX: 0 });
      lines.slice(writeFrom).forEach((ln, k) => {
        const w = docLines[writeFrom + k];
        const y = 22 + (writeFrom + k) * 30;
        t.set(caret, { y, x: 0 }, k === 0 ? 0.3 : '>');
        t.to(ln, { scaleX: 1, duration: 0.5 + w * 0.9, ease: 'none' }, '<');
        t.to(caret, { x: w * 560, duration: 0.5 + w * 0.9, ease: 'none' }, '<');
      });
      t.to(lines.slice(writeFrom), { opacity: 0, duration: 0.4 }, '+=1.6');
      t.set(lines.slice(writeFrom), { opacity: 1, scaleX: 0 });
    }

    // ── moodboard: tiles resolve one by one; cursor 3 places each
    {
      const tiles = q('.d1-tile-img');
      const flashes = q('.d1-tile-flash');
      const cur = q('.d1-cur-3')[0];
      const t = loop({ repeatDelay: 0.8 });
      t.set(tiles, { clipPath: 'inset(0 0 100% 0)' });
      tiles.forEach((tile, k) => {
        const cx = 920 + 20 + (k % 3) * 228 + 150, cy = 590 + 44 + 20 + Math.floor(k / 3) * 222 + 160;
        const at = 0.3 + k * 0.85;
        t.to(cur, { x: cx, y: cy, duration: 0.55, ease: 'power3.inOut' }, at);
        t.to(tile, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power3.out' }, at + 0.5);
        t.fromTo(flashes[k], { opacity: 0.9 }, { opacity: 0, duration: 0.8, ease: 'power2.out', immediateRender: false }, at + 0.5);
      });
      t.to(tiles, { opacity: 0, duration: 0.5, stagger: 0.05 }, '+=1.5');
      t.set(tiles, { opacity: 1, clipPath: 'inset(0 0 100% 0)' });
    }

    // ── timeline: clips slide onto tracks in order
    {
      const clips = q('.d1-clip');
      const playhead = q('.d1-playhead')[0];
      const t = loop({ repeatDelay: 0.6 });
      t.set(clips, { x: 380, opacity: 0 });
      t.set(playhead, { x: 0 });
      clips.forEach((c, k) => t.to(c, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.3 + k * 0.45));
      t.to(playhead, { x: 600, duration: 3.2, ease: 'none' }, '+=0.2');
      t.to(clips, { opacity: 0, duration: 0.4, stagger: 0.03 }, '+=0.6');
    }

    // Thumbnails and the presenter view get a still frame, not a running loop.
    if (mode === 'preview') loops.forEach((l) => l.progress(0.45).pause());
  }, { scope: root, dependencies: [mode] });

  return (
    <div ref={root} className="d1-aw fill" aria-hidden>
      <div className="d1-tilt">
      <div className="d1-plane">
        <Win x={80} y={120} w={600} h={470} title="agent.log" className="d1-win-log">
          <div className="d1-log-list">
            {[...LOG, ...LOG].map(([tag, line], i) => (
              <div key={i} className={`d1-log-line ${tag === '✓' ? 'is-ok' : tag === '…' ? 'is-run' : ''}`}><b>{tag}</b>{line}</div>
            ))}
          </div>
        </Win>

        <Win x={740} y={60} w={760} h={470} title="media-plan.xlsx">
          <div className="d1-sheet">
            {Array.from({ length: SHEET_ROWS }, (_, rw) => Array.from({ length: SHEET_COLS }, (_, c) => (
              <div key={`${rw}-${c}`} className={`d1-cell ${rw === 0 ? 'is-head' : ''}`} data-rc={`${rw}-${c + 1}`}>
                <span className="d1-bar-fill" style={{ width: `${sheetBars[rw * SHEET_COLS + c] * 100}%` }} />
              </div>
            )))}
          </div>
        </Win>
        <div className="d1-sel" />

        <Win x={1560} y={110} w={760} h={470} title="Northline · launch board">
          <div className="d1-board">
            {['To do', 'Doing', 'Done'].map((c, ci) => (
              <div key={c} className="d1-col">
                <div className="d1-col-head">{c}</div>
                {Array.from({ length: [3, 1, 2][ci] }, (_, k) => (
                  <div key={k} className={`d1-card ${ci === 2 ? 'is-done' : ''}`}><i style={{ width: `${60 + ((k * 37 + ci * 13) % 30)}%` }} /><i style={{ width: '42%' }} /></div>
                ))}
              </div>
            ))}
          </div>
        </Win>
        <div className="d1-card d1-card-live"><i style={{ width: '72%' }} /><i style={{ width: '44%' }} /><span className="d1-tick">✓</span></div>

        <Win x={220} y={650} w={640} h={560} title="script_v3.doc">
          <div className="d1-doc">
            {docLines.map((w, i) => (
              <span key={i} className={`d1-doc-line ${i === 0 ? 'is-h' : ''}`} style={{ top: 22 + i * 30, width: `${w * 560}px` }} />
            ))}
            <span className="d1-doc-caret" />
          </div>
        </Win>

        <Win x={920} y={590} w={720} h={520} title="moodboard">
          <div className="d1-grid">
            {Array.from({ length: 6 }, (_, k) => (
              <div key={k} className="d1-tile">
                <div className="d1-tile-img">
                  {images[k] ? <img src={images[k]} alt="" draggable={false} /> : <GenTile seed={40 + k} />}
                </div>
                <div className="d1-tile-flash" />
              </div>
            ))}
          </div>
        </Win>

        <Win x={1700} y={640} w={700} h={380} title="rough cut · timeline">
          <div className="d1-tracks">
            {[0, 1, 2, 3].map((tk) => <div key={tk} className="d1-track" style={{ top: 30 + tk * 64 }} />)}
            {[[0, 0, 150], [0, 158, 120], [0, 286, 210], [1, 40, 240], [1, 290, 160], [2, 0, 330], [3, 90, 190], [3, 290, 120]].map(([tk, x, w], k) => (
              <div key={k} className={`d1-clip ${tk === 2 ? 'is-audio' : ''}`} style={{ top: 36 + tk * 64, left: 20 + x, width: w }} />
            ))}
            <div className="d1-playhead" />
          </div>
        </Win>

        <AgentCursor label="Agent" className="d1-cur d1-cur-1" style={{ transform: 'translate(1900px, 420px)' }} />
        <AgentCursor label="Agent" className="d1-cur d1-cur-2" style={{ transform: 'translate(1200px, 300px)' }} />
        <AgentCursor label="Agent" className="d1-cur d1-cur-3" style={{ transform: 'translate(1300px, 900px)' }} />
      </div>
      </div>
      <div className="d1-dim fill" />
    </div>
  );
}

export default defineSlide({
  id: 's1-divider',
  section: 1,
  title: 'Divider: The year AI started working',
  chrome: false,
  transition: 'fade',
  Component: S1DividerSlide,
});
