import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { AgentCursor } from '@/components/AgentCursor';
import { generatedUrl } from '@/components/GenArt';
import './S5Context.css';

/**
 * Trend 01 · Brand agents. Agents keep what stays the same, so we can make the work different.
 *  beat 0  a brand's guidelines (logo, type, colour) and a grid of empty formats waiting to be made.
 *  beat 1  a brand agent reads the guidelines and fills every format, all on brand. Guidelines were built for sameness.
 *  beat 2  the split: the grid steps aside ("Agents keep this the same") and one format breaks out of it with a
 *          different idea ("We make this different"). The breakout is the Alder ad from the taste slide in section 2,
 *          a deliberate callback to the sea of sameness.
 * Alder is the fictional brand from section 2.
 */
const GRID = { x: 1180, y: 300, cols: 4, rows: 3, w: 138, h: 150, gx: 154, gy: 166 };
const OUT_FROM = 6; // row 1, col 2: the format that breaks out
const OUT_TO = { left: 1460, top: 300, width: 320, height: 482 };
const PHOTO = generatedUrl('taste-impeccable-b') ?? generatedUrl('taste-impeccable-a');
const STATUS = 'brand agent · 12 formats made · all on brand';

const TILES = Array.from({ length: GRID.cols * GRID.rows }, (_, i) => ({ i, c: i % GRID.cols, r: Math.floor(i / GRID.cols), v: i % 3 }));
/** The agent works row by row, snaking back and forth. */
const ORDER = TILES.slice().sort((a, b) => (a.r - b.r) || (a.r % 2 ? b.c - a.c : a.c - b.c));

/** One format from the system. Same wordmark, type and colour every time; only the layout flexes. */
function TileArt({ v, seed }: { v: number; seed: number }) {
  const w = (n: number) => 40 + ((seed * 37 + n * 23) % 50);
  return (
    <>
      <span className="cx-mini-word">ALDER</span>
      {v === 0 && <>
        <i className="cx-block" style={{ left: 12, top: 30, width: 114, height: 52 }} />
        <i className="cx-bar" style={{ top: 92, width: w(1) + 30 }} />
        <i className="cx-bar" style={{ top: 106, width: w(2) }} />
      </>}
      {v === 1 && <>
        <i className="cx-bar" style={{ top: 50, width: 110, height: 11 }} />
        <i className="cx-bar" style={{ top: 66, width: w(3) + 20, height: 11 }} />
        <i className="cx-bar is-thin" style={{ top: 90, width: w(4) }} />
      </>}
      {v === 2 && <>
        <i className="cx-can" style={{ left: 80, top: 34, width: 44, height: 82 }} />
        <i className="cx-bar" style={{ top: 58, width: 56 }} />
        <i className="cx-bar" style={{ top: 72, width: 40 }} />
      </>}
      <i className="cx-cta" />
    </>
  );
}

function Kicker() {
  return (
    <div className="cx-kicker label">
      <b>Trend 01</b><span className="cx-kicker-sep">·</span>Now
      <span className="cx-rank" aria-hidden>{[0, 1, 2, 3, 4].map((k) => <i key={k} className={k === 0 ? 'on' : ''} />)}</span>
    </div>
  );
}

function BrandAgents({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const tiles = q('.cx-tile');
    const cursor = q('.cx-cursor')[0];

    // ── beat 0: the guidelines, and formats waiting to be made ──
    tl.from(q('.cx-kicker'), { opacity: 0, y: 10, duration: 0.8 }, 0);
    revealLines(tl, q('.cx-head')[0], {}, 0.05);
    revealWords(tl, q('.cx-lede')[0], {}, 0.4);
    tl.from(q('.cx-sheet'), { opacity: 0, y: 40, duration: 1.2 }, 0.3);
    tl.from(q('.cx-sec'), { opacity: 0, y: 14, duration: 0.8, stagger: 0.12 }, 0.7);
    tl.from(q('.cx-well'), { opacity: 0, scale: 0.9, duration: 0.7, stagger: { each: 0.035, from: 'start' } }, 0.6);
    tl.addLabel('b1');

    // ── beat 1: the agent makes every format, on brand ──────────
    revealWords(tl, q('.cx-p-same')[0], { stagger: 0.02 }, 'b1');
    tl.fromTo(q('.cx-sec-tick'), { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.15, immediateRender: false }, 'b1+=0.2');
    tl.fromTo(cursor, { x: 1060, y: 560, opacity: 0 }, { opacity: 1, duration: 0.3 }, 'b1+=0.5');
    const step0 = 0.75, each = 0.17;
    ORDER.forEach((t, k) => {
      const at = `b1+=${step0 + k * each + 0.1}`;
      const cx = GRID.x + t.c * GRID.gx + GRID.w * 0.55, cy = GRID.y + t.r * GRID.gy + GRID.h * 0.55;
      tl.to(cursor, { x: cx, y: cy, duration: k === 0 ? 0.35 : each, ease: k === 0 ? 'power2.inOut' : 'none' }, k === 0 ? `b1+=${step0 - 0.25}` : `b1+=${step0 + (k - 1) * each + 0.1}`);
      const el = tiles[t.i];
      tl.fromTo(el.querySelector('.cx-art'), { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }, at);
      tl.fromTo(el.querySelector('.cx-flash'), { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, at);
    });
    const done = step0 + ORDER.length * each;
    tl.to(cursor, { x: GRID.x + GRID.cols * GRID.gx + 10, y: GRID.y + GRID.rows * GRID.gy + 10, opacity: 0, duration: 0.5, ease: 'power2.in' }, `b1+=${done + 0.1}`);
    tl.fromTo(q('.cx-status'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, `b1+=${done - 0.3}`);
    typeInto(tl, q('.cx-status-t')[0], STATUS, { cps: 48 }, `b1+=${done - 0.2}`);
    tl.addLabel('b2');

    // ── beat 2: they keep it the same; we make it different ─────
    tl.to(q('.cx-p-same'), { color: 'var(--zak-stone)', duration: 0.6 }, 'b2');
    revealWords(tl, q('.cx-p-diff')[0], { stagger: 0.02 }, 'b2+=0.3');
    tl.to(q('.cx-status'), { opacity: 0, duration: 0.3 }, 'b2');
    tl.to(q('.cx-sheet'), { opacity: 0, x: -50, duration: 0.6, ease: 'power2.in' }, 'b2');
    tl.to(q('.cx-grid'), { x: 820 - GRID.x, duration: 1.1, ease: 'power3.inOut' }, 'b2+=0.2');
    tl.to(q('.cx-grid'), { filter: 'saturate(0.55) brightness(0.8)', duration: 0.8 }, 'b2+=0.9');
    // the breakout: the format leaves its slot (the empty well travels with the grid) and grows into a different idea
    tl.set(tiles[OUT_FROM].querySelector('.cx-art'), { opacity: 0 }, 'b2+=0.2');
    tl.set(q('.cx-out'), { opacity: 1 }, 'b2+=0.2');
    tl.to(q('.cx-out'), { ...OUT_TO, borderRadius: 18, rotation: -1.5, duration: 1.2, ease: 'power3.inOut' }, 'b2+=0.2');
    tl.to(q('.cx-out-tile'), { opacity: 0, duration: 0.3 }, 'b2+=0.4');
    tl.fromTo(q('.cx-out-photo'), { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 'b2+=0.4');
    tl.fromTo(q('.cx-out-photo img'), { scale: 1.18 }, { scale: 1, duration: 2, ease: 'power2.out', immediateRender: false }, 'b2+=0.4');
    tl.fromTo(q('.cx-out-word, .cx-out-line'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, immediateRender: false }, 'b2+=1.1');
    tl.fromTo(q('.cx-split'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, immediateRender: false }, 'b2+=1.0');
  });

  return (
    <div ref={root} className="cx">
      <Kicker />
      <div className="cx-text">
        <h2 className="cx-head headline">Brand agents.</h2>
        <p className="cx-lede lede">Agents that use brand guidelines to run creative ops.</p>
        <p className="cx-p cx-p-same">Guidelines were built for what stays the same: logo, type, colour.</p>
        <p className="cx-p cx-p-diff">Good news for us. Agents keep what stays the same. We decide where the work breaks out of it.</p>
      </div>

      <div className="cx-sheet">
        <div className="label cx-sheet-k">Brand guidelines</div>
        <div className="cx-sheet-name">Alder</div>
        <div className="cx-sec">
          <span className="label">Logo</span><span className="cx-sec-tick label">Locked</span>
          <span className="cx-word">ALDER</span>
        </div>
        <div className="cx-sec">
          <span className="label">Type</span><span className="cx-sec-tick label">Locked</span>
          <div className="cx-type"><b>Aa</b><span><i style={{ width: 120 }} /><i style={{ width: 84 }} /></span></div>
        </div>
        <div className="cx-sec">
          <span className="label">Colour</span><span className="cx-sec-tick label">Locked</span>
          <div className="cx-swatches"><i style={{ background: '#2c3a2e' }} /><i style={{ background: '#a9b79a' }} /><i style={{ background: '#efe9dc' }} /></div>
        </div>
      </div>

      <div className="cx-grid">
        {TILES.map((t) => (
          <div key={t.i} className="cx-tile" style={{ left: t.c * GRID.gx, top: t.r * GRID.gy }}>
            <i className="cx-well" />
            <div className="cx-art"><TileArt v={t.v} seed={t.i} /></div>
            <i className="cx-flash" />
          </div>
        ))}
      </div>
      <div className="cx-status label"><span className="cx-chev">›</span> <span className="cx-status-t" /></div>
      <AgentCursor label="Brand agent" className="cx-cursor" />

      <div className="cx-split is-same"><span className="label"><i />Agents keep this the same</span></div>
      <div className="cx-split is-diff"><span className="label"><i />We make this different</span></div>

      <div className="cx-out">
        <div className="cx-out-tile cx-art"><TileArt v={TILES[OUT_FROM].v} seed={OUT_FROM} /></div>
        <div className="cx-out-photo">
          {PHOTO && <img src={PHOTO} alt="" draggable={false} />}
          <span className="cx-out-word">ALDER</span>
          <span className="cx-out-line">Forty years in the rock.</span>
        </div>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's5-context',
  section: 4,
  title: 'Brand agents',
  steps: 2,
  notes:
    'Trend one, and it is here now: brand agents. Agents that use a brand’s guidelines to run creative ops: making every format, versioning, checking the work against the guidelines.\n' +
    'Click: brand guidelines were built for what stays the same. The logo, the type, the colours. That is exactly the kind of rule an agent can follow, every time, across every format.\n' +
    'Click: and that is good news for us. Agents manage what stays the same, and we manage where things should be different. Remember the sea of sameness from earlier: the risk is that everything looks alike. The system has to leave room to break out of it, and that part is our job. (The Alder ad is the one from the taste slide.)',
  Component: BrandAgents,
});
