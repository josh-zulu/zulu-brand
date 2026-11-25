import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, rng } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import { generatedUrl } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import './S2Resolve.css';

/**
 * Hand it the footage. Get back a rough cut.
 * One idea: chaos to sequence. Six clips lie scattered like a dump from the card; on the click they slide onto the
 * timeline in story order, the playhead runs the cut through the viewer, then the real recording takes over.
 *  beat 0  headline; scattered clips; an empty editor (viewer + timeline)
 *  beat 1  clips land on V1 in order, audio fills in, playhead plays the rough cut in the viewer
 *  beat 2  the viewer grows and the clip plays
 */
type Shot = { id: string; name: string; dur: number; at: { x: number; y: number; r: number } };
const SHOTS: Shot[] = [
  { id: 'rv-shot-1', name: 'A002_C014', dur: 3.2, at: { x: 430, y: 352, r: 3 } },
  { id: 'rv-shot-2', name: 'A001_C007', dur: 2.0, at: { x: 170, y: 500, r: -4 } },
  { id: 'rv-shot-3', name: 'A003_C002', dur: 2.4, at: { x: 150, y: 352, r: -5 } },
  { id: 'rv-shot-4', name: 'A001_C021', dur: 3.6, at: { x: 700, y: 498, r: 4 } },
  { id: 'rv-shot-5', name: 'A002_C003', dur: 2.8, at: { x: 690, y: 356, r: -3 } },
  { id: 'rv-shot-6', name: 'A003_C011', dur: 4.0, at: { x: 440, y: 512, r: -6 } },
];
const CARD = { w: 280, h: 158 };
const TL = { x: 140, y: 700, w: 1640, label: 64 };
const TRACK = { x: TL.x + TL.label, w: TL.w - TL.label, v1: 764, v1h: 104 };
const TOTAL = SHOTS.reduce((s, c) => s + c.dur, 0);
const PXS = TRACK.w / TOTAL;
// viewer is authored at its final size and shown smaller until the clip takes over
const VIEW = { w: 1100, h: 619, head: 40 };
const VIEW_SMALL = { x: 1000, y: 140, s: 780 / 1100 };
const VIEW_BIG = { x: 680, y: 306, s: 1 };
const FPS = 24;

const tc = (sec: number) => {
  const f = Math.floor(sec * FPS);
  const p = (n: number) => String(n).padStart(2, '0');
  return `00:${p(Math.floor(f / (FPS * 60)))}:${p(Math.floor(f / FPS) % 60)}:${p(f % FPS)}`;
};

function S2Resolve({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s2-resolve-snap'], mode === 'live', 0.45);
  const dir = useRef(direction);
  dir.current = direction;

  const slots = useMemo(() => {
    let x = TRACK.x;
    return SHOTS.map((s) => { const slot = { x: x + 1, w: s.dur * PXS - 2 }; x += s.dur * PXS; return slot; });
  }, []);
  const wave = useMemo(() => {
    const r = rng(46);
    return Array.from({ length: 196 }, (_, i) => 6 + Math.abs(Math.sin(i * 0.21) * 14 + (r() - 0.5) * 18));
  }, []);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const cards = q('.rsv-card');
    const viewer = q('.rsv-viewer')[0];
    const shots = q('.rsv-vshot');
    const lives = q('.rsv-live');
    cards.forEach((c, i) => gsap.set(c, { rotation: SHOTS[i].at.r }));
    gsap.set(lives, { opacity: 0 });

    gsap.set(viewer, { x: VIEW_SMALL.x, y: VIEW_SMALL.y, scale: VIEW_SMALL.s, transformOrigin: '0 0' });
    gsap.set(shots, { opacity: 0 });
    gsap.set(q('.rsv-playhead'), { x: 0, opacity: 0 });
    gsap.set(q('.rsv-wave'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(q('.rsv-status-run, .rsv-status-done, .rsv-vlabel-cut'), { opacity: 0 });

    // ── beat 0: the dump ────────────────────────────────────────
    revealLines(tl, q('.rsv-head')[0], {}, 0.05);
    tl.from(viewer, { opacity: 0, y: VIEW_SMALL.y + 40, duration: 1.2 }, 0.3);
    tl.from(q('.rsv-tl'), { opacity: 0, y: 40, duration: 1.2 }, 0.4);
    tl.from(cards, {
      opacity: 0, y: '-=40', rotation: (i: number) => SHOTS[i].at.r * 2.5, scale: 0.92,
      duration: 1, ease: 'expo.out', stagger: { each: 0.07, from: 'random' },
    }, 0.5);
    tl.addLabel('b1');

    // ── beat 1: onto the timeline, in order ─────────────────────
    const a = tl.duration() + 0.05;
    tl.to(q('.rsv-status-idle'), { opacity: 0, duration: 0.2 }, a);
    tl.to(q('.rsv-status-run'), { opacity: 1, duration: 0.2 }, a);
    tl.to(q('.rsv-vempty'), { opacity: 0, duration: 0.3 }, a);
    SHOTS.forEach((_, i) => {
      const t = a + 0.15 + i * 0.24;
      const c = cards[i];
      tl.set(c, { zIndex: 10 + i }, t);
      tl.to(c, { scale: 1.05, duration: 0.18, ease: 'power2.out' }, t);
      tl.to(c, {
        left: slots[i].x, top: TRACK.v1, width: slots[i].w, height: TRACK.v1h, rotation: 0, scale: 1,
        duration: 0.7, ease: 'power3.inOut',
      }, t + 0.1);
      tl.to(q('.rsv-cap')[i], { opacity: 0, duration: 0.25 }, t + 0.1);
      tl.to(q('.rsv-blabel')[i], { opacity: 1, duration: 0.3 }, t + 0.65);
      tl.call(() => { if (dir.current > 0) sfx.play('s2-resolve-snap'); }, undefined, t + 0.78);
    });
    const landed = a + 0.15 + SHOTS.length * 0.24 + 0.8;
    tl.to(q('.rsv-wave'), { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' }, landed - 0.6);

    // the playhead plays the cut through the viewer
    const play = landed + 0.15;
    const sweep = 3.6;
    const tcEl = q('.rsv-tc')[0];
    const clock = { s: 0 };
    tl.to(q('.rsv-playhead'), { opacity: 1, duration: 0.2 }, play - 0.2);
    tl.to(q('.rsv-playhead'), { x: TRACK.w, duration: sweep, ease: 'none' }, play);
    tl.to(clock, { s: TOTAL, duration: sweep, ease: 'none', onUpdate: () => { if (tcEl) tcEl.textContent = tc(clock.s); } }, play);
    let acc = 0;
    SHOTS.forEach((s, i) => {
      const t = play + (acc / TOTAL) * sweep;
      tl.set(shots[i], { opacity: 1 }, t);
      if (i > 0) tl.set(shots[i - 1], { opacity: 0 }, t);
      tl.set(lives[i], { opacity: 1 }, t);
      if (i > 0) tl.set(lives[i - 1], { opacity: 0 }, t);
      acc += s.dur;
    });
    tl.set(lives[SHOTS.length - 1], { opacity: 0 }, play + sweep);
    tl.to(q('.rsv-status-run'), { opacity: 0, duration: 0.2 }, play + sweep);
    tl.to(q('.rsv-status-done'), { opacity: 1, duration: 0.3 }, play + sweep);
    tl.to(q('.rsv-vlabel-cut'), { opacity: 1, duration: 0.3 }, play + sweep);
    tl.addLabel('b2');

    // ── beat 2: the recording takes over ────────────────────────
    const z = tl.duration() + 0.05;
    tl.to(q('.rsv-tl'), { opacity: 0, y: 30, duration: 0.6, ease: 'power2.in' }, z);
    tl.to(cards, { opacity: 0, y: '+=30', duration: 0.6, ease: 'power2.in' }, z);
    tl.to(viewer, { x: VIEW_BIG.x, y: VIEW_BIG.y, scale: VIEW_BIG.s, duration: 1.2, ease: 'power3.inOut' }, z + 0.1);
    tl.fromTo(q('.rsv-clip'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, z + 0.9);
    tl.to(q('.rsv-vlabel-cut, .rsv-tc'), { opacity: 0, duration: 0.3 }, z + 0.9);
    tl.to(q('.rsv-vlabel-clip'), { opacity: 1, duration: 0.3 }, z + 1.0);
  });

  return (
    <div ref={root} className="rsv">
      <h2 className="rsv-head headline">Hand it the footage.<br />Get back a rough cut.</h2>

      {/* viewer */}
      <div className="rsv-viewer" style={{ width: VIEW.w }}>
        <div className="rsv-vhead">
          <span className="label">Viewer</span>
          <span className="rsv-vlabels label">
            <span className="rsv-vlabel-cut">Rough cut v1 · {tc(TOTAL)}</span>
            <span className="rsv-vlabel-clip">Resolve · AI assistant</span>
          </span>
        </div>
        <div className="rsv-vbody" style={{ height: VIEW.h }}>
          <div className="rsv-vempty label">No timeline yet</div>
          {SHOTS.map((s) => {
            const url = generatedUrl(s.id);
            return url ? <img key={s.id} className="rsv-vshot" src={url} alt="" draggable={false} /> : <div key={s.id} className="rsv-vshot rsv-ph" />;
          })}
          <div className="rsv-tc">{tc(0)}</div>
          <ClipFrame className="rsv-clip" src="clips/resolve-ai-assistant.mp4" duration="46s" mode={mode} playing={step >= 2} />
        </div>
      </div>

      {/* timeline */}
      <div className="rsv-tl" style={{ left: TL.x, top: TL.y, width: TL.w }}>
        <div className="rsv-tl-top">
          <span className="label">Timeline 1</span>
          <span className="rsv-status label">
            <span className="rsv-status-idle">6 clips · unsorted</span>
            <span className="rsv-status-run">Watching clips · ordering by story</span>
            <span className="rsv-status-done">Rough cut v1 · 6 shots · {TOTAL.toFixed(0)}s</span>
          </span>
        </div>
        <div className="rsv-ruler" style={{ marginLeft: TL.label }}>
          {Array.from({ length: Math.floor(TOTAL) + 1 }, (_, s) => (
            <span key={s} className={`rsv-tick${s % 2 ? '' : ' major'}`} style={{ left: s * PXS }}>{s % 2 ? '' : tc(s)}</span>
          ))}
        </div>
        <div className="rsv-track v1"><span className="rsv-tname label">V1</span></div>
        <div className="rsv-track a1">
          <span className="rsv-tname label">A1</span>
          <svg className="rsv-wave" viewBox={`0 0 ${wave.length * 8} 50`} preserveAspectRatio="none">
            {wave.map((h, i) => <rect key={i} x={i * 8 + 1} y={25 - h / 2} width="5" height={h} rx="2" />)}
          </svg>
        </div>
        <div className="rsv-playhead" style={{ left: TL.label }}><i /></div>
      </div>

      {/* the footage */}
      {SHOTS.map((s, i) => {
        const url = generatedUrl(s.id);
        return (
          <div key={s.id} className="rsv-card" style={{ left: s.at.x, top: s.at.y, width: CARD.w, height: CARD.h }}>
            {url ? <img src={url} alt="" draggable={false} /> : <div className="rsv-ph fill" />}
            <span className="rsv-cap"><b>{s.name}</b>{tc(s.dur)}</span>
            <i className="rsv-live" />
            <span className="rsv-blabel">{String(i + 1).padStart(2, '0')} · {s.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default defineSlide({
  id: 's2-resolve',
  section: 2,
  title: 'Resolve',
  steps: 2,
  notes:
    'DaVinci Resolve now has an AI assistant that works on the actual timeline.\n' +
    'Click: hand it a pile of clips and it watches them, puts them in story order and lays down a rough cut. That first assembly used to be hours of an editor\'s day.\n' +
    'Click for the recording (46s). The editor still makes the cut good. The machine just gets you to the starting line faster.',
  Component: S2Resolve,
});
