import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { useSfx } from '@/lib/sfx';
import './S2Chain.css';

/**
 * Slide 16 · One meeting, every tool. An illustration of one meeting flowing through our tools.
 *  beat 0  headline + lede; four tool tiles and their wiring draw in; Notes lights up (the meeting is the input).
 *  beat 1  pulse Notes → Asana: the project and its tasks appear.
 *  beat 2  pulse Asana → Figma: wireframes assemble.
 *  beat 3  pulse Figma → Slides: the deck fans out, then the whole row glows once and settles.
 */

const TILE_W = 300;
const TILE_H = 262;
const ROW_Y = 462;
const GAP = (1640 - 4 * TILE_W) / 3;
const TX = [0, 1, 2, 3].map((i) => 140 + i * (TILE_W + GAP));
const MID_Y = ROW_Y + TILE_H / 2;

const TOOLS = [
  { key: 'notes', name: 'Notes' },
  { key: 'asana', name: 'Asana' },
  { key: 'figma', name: 'Figma' },
  { key: 'slides', name: 'Slides' },
] as const;

/** Wires: three straight hops, left to right. */
const WIRES = [
  { d: `M${TX[0] + TILE_W + 16},${MID_Y} L${TX[1] - 16},${MID_Y}`, from: 0, to: 1 },
  { d: `M${TX[1] + TILE_W + 16},${MID_Y} L${TX[2] - 16},${MID_Y}`, from: 1, to: 2 },
  { d: `M${TX[2] + TILE_W + 16},${MID_Y} L${TX[3] - 16},${MID_Y}`, from: 2, to: 3 },
];
const wireEnds = (d: string) => {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return [[n[0], n[1]], [n[n.length - 2], n[n.length - 1]]];
};

function NotesBody() {
  const bars = [0.35, 0.6, 0.9, 0.5, 0.75, 0.3, 0.55, 1, 0.7, 0.4, 0.85, 0.5, 0.3, 0.65, 0.95, 0.45, 0.7, 0.35, 0.8, 0.55, 0.3, 0.6];
  return (
    <div className="ch-notes">
      <div className="ch-wave">{bars.map((h, i) => <i key={i} style={{ height: `${h * 100}%` }} />)}</div>
      <div className="ch-lines">{[94, 80, 88, 62].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}</div>
    </div>
  );
}
function AsanaBody() {
  const rows = [72, 58, 80, 50];
  return (
    <div className="ch-tasks">
      {rows.map((w, i) => (
        <div key={i} className="ch-task"><b className="ch-check" /><i style={{ width: `${w}%` }} /><span className="ch-av" /><span className="ch-date" /></div>
      ))}
    </div>
  );
}
function FigmaBody() {
  return (
    <div className="ch-frames">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ch-frame">
          <i className="wf-nav" /><i className="wf-hero" /><i className="wf-a" /><i className="wf-b" />
        </div>
      ))}
    </div>
  );
}
function SlidesBody() {
  return (
    <div className="ch-deck">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ch-slide"><i className="t" /><i className="b" /><i className="c" /></div>
      ))}
    </div>
  );
}
const BODIES = [NotesBody, AsanaBody, FigmaBody, SlidesBody];

function S2Chain({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['chain-pulse', 'chain-complete'], mode === 'live');
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const tiles = q('.ch-tile');
    const T = (i: number, sel: string) => tiles[i].querySelectorAll(sel);
    const wire = (k: number, sel: string) => q(`.ch-wire-${k} ${sel}`);
    const SIGNAL = '#00e482';
    // Sets and calls sit just after a label: a playhead parked on the label (end of the previous beat) must not trigger them.
    const EPS = 0.02;

    gsap.set(q('.ch-pulse'), { opacity: 0 });
    gsap.set(q('.ch-lit'), { drawSVG: '0%' });

    /** A tile comes alive: ring + glow flash, state working → done, its artifact builds. */
    const activate = (i: number, at: number, build: (t: number) => void) => {
      tl.to(T(i, '.ch-ring'), { opacity: 1, duration: 0.25, ease: 'power2.out' }, at);
      tl.fromTo(T(i, '.ch-glow'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out', immediateRender: false }, at);
      tl.to(T(i, '.ch-glow'), { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, at + 0.25);
      tl.to(T(i, '.ch-dot'), { backgroundColor: SIGNAL, boxShadow: '0 0 12px rgba(0,228,130,.8)', duration: 0.3 }, at);
      tl.to(T(i, '.ch-st-wait'), { opacity: 0, duration: 0.2 }, at);
      tl.to(T(i, '.ch-st-run'), { opacity: 1, duration: 0.2 }, at);
      build(at + 0.1);
      tl.to(T(i, '.ch-st-run'), { opacity: 0, duration: 0.2 }, at + 1.05);
      tl.to(T(i, '.ch-st-done'), { opacity: 1, duration: 0.25 }, at + 1.05);
      tl.to(T(i, '.ch-ring'), { opacity: 0.5, duration: 0.6, ease: 'power2.inOut' }, at + 1.2);
    };

    /** The pulse runs wire k (the line lights behind it), then the target tile activates. */
    const hop = (k: number, at: number, travel: number, build: (t: number) => void) => {
      const path = wire(k, '.ch-lit')[0] as unknown as SVGPathElement;
      const pulse = wire(k, '.ch-pulse');
      tl.call(() => { if (dir.current > 0) sfx.play('chain-pulse'); }, undefined, at);
      tl.to(T(WIRES[k].from, '.ch-ring'), { opacity: 1, duration: 0.2 }, at);
      tl.to(T(WIRES[k].from, '.ch-ring'), { opacity: 0.5, duration: 0.6 }, at + 0.3);
      tl.set(pulse, { opacity: 1 }, at);
      tl.to(pulse, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: travel, ease: 'power2.inOut' }, at);
      tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: travel, ease: 'power2.inOut', immediateRender: false }, at);
      tl.to(pulse, { opacity: 0, scale: 2.4, duration: 0.35, ease: 'power2.out', transformOrigin: '50% 50%' }, at + travel);
      tl.to(path, { opacity: 0.55, duration: 0.8 }, at + travel + 0.2);
      activate(WIRES[k].to, at + travel - 0.05, build);
    };

    // ── beat 0: arrive, draw the chain, Notes lights up ─────
    revealLines(tl, q('.ch-head')[0], {}, 0.05);
    revealWords(tl, q('.ch-lede')[0], { stagger: 0.02 }, 0.4);
    tl.from(tiles, { opacity: 0, y: 40, duration: 1.0, ease: 'expo.out', stagger: 0.09 }, 0.35);
    tl.fromTo(q('.ch-base'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power3.inOut', stagger: 0.12 }, 0.8);
    tl.from(q('.ch-end'), { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.04 }, 1.0);
    activate(0, 1.7, (t) => {
      tl.from(T(0, '.ch-wave i'), { scaleY: 0.08, duration: 0.6, ease: 'expo.out', stagger: { each: 0.018, from: 'start' } }, t);
      tl.from(T(0, '.ch-lines i'), { scaleX: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }, t + 0.25);
    });
    tl.addLabel('b1');

    // ── beat 1: Notes → Asana ───────────────────────────────
    hop(0, tl.labels.b1 + EPS, 0.75, (t) => {
      tl.from(T(1, '.ch-task'), { opacity: 0, x: -16, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, t);
      tl.from(T(1, '.ch-task i'), { scaleX: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, t + 0.05);
    });
    tl.addLabel('b2');

    // ── beat 2: Asana → Figma ───────────────────────────────
    hop(1, tl.labels.b2 + EPS, 0.75, (t) => {
      tl.from(T(2, '.ch-frame'), { opacity: 0, y: 14, scale: 0.94, duration: 0.55, ease: 'expo.out', stagger: 0.12 }, t);
      tl.from(T(2, '.ch-frame i'), { opacity: 0, duration: 0.3, stagger: 0.025 }, t + 0.2);
    });
    tl.addLabel('b3');

    // ── beat 3: Figma → Slides ──────────────────────────────
    hop(2, tl.labels.b3 + EPS, 0.75, (t) => {
      tl.from(T(3, '.ch-slide'), { opacity: 0, x: -30, rotation: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12 }, t);
      tl.from(T(3, '.ch-slide i'), { scaleX: 0, duration: 0.4, ease: 'power3.out', stagger: 0.03 }, t + 0.3);
    });
    // The meeting has flowed all the way through: the whole row glows once, then settles.
    const end = tl.duration();
    tl.call(() => { if (dir.current > 0) sfx.play('chain-complete'); }, undefined, end);
    tl.to(q('.ch-lit'), { opacity: 1, duration: 0.3 }, end);
    tl.to(q('.ch-ring'), { opacity: 1, duration: 0.3 }, end);
    tl.to(q('.ch-lit'), { opacity: 0.7, duration: 1.0, ease: 'power2.inOut' }, end + 0.4);
    tl.to(q('.ch-ring'), { opacity: 0.6, duration: 1.0, ease: 'power2.inOut' }, end + 0.4);
  });

  return (
    <div ref={root} className="chain" data-step={step}>
      <h2 className="ch-head headline">One meeting. Every tool.</h2>
      <p className="ch-lede lede">Notes become an Asana project, Figma wireframes and a Slides deck.</p>

      <div className="ch-chain">
        <svg className="ch-wires" width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden>
          <defs>
            <filter id="ch-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {WIRES.map((w, k) => (
            <g key={k} className={`ch-wire ch-wire-${k}`}>
              <path className="ch-groove" d={w.d} />
              <path className="ch-base" d={w.d} />
              <path className="ch-ants" d={w.d} />
              <path className="ch-lit" d={w.d} />
              {wireEnds(w.d).map(([x, y], j) => <circle key={j} className="ch-end" cx={x} cy={y} r={4.5} />)}
              <circle className="ch-pulse" cx={0} cy={0} r={7} filter="url(#ch-glow)" />
            </g>
          ))}
        </svg>

        {TOOLS.map((t, i) => {
          const Body = BODIES[i];
          return (
            <div key={t.key} className={`ch-tile ch-${t.key}`} data-i={i} style={{ left: TX[i], top: ROW_Y, width: TILE_W, height: TILE_H }}>
              <div className="ch-glow" />
              <div className="ch-ring" />
              <div className="ch-play" />
              <div className="ch-tile-head">
                <span className="ch-dot" /><span className="ch-name">{t.name}</span><span className="ch-idx">0{i + 1}</span>
              </div>
              <div className="ch-tile-body"><Body /></div>
              <div className="ch-tile-foot">
                <span className="ch-st ch-st-wait">waiting</span>
                <span className="ch-st ch-st-run">working</span>
                <span className="ch-st ch-st-done">done</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's2-chain',
  section: 2,
  title: 'One meeting, every tool',
  steps: 3,
  notes:
    'The peak of section 2. One meeting’s notes flow through our tools: they become an Asana project, then Figma wireframes, then a Slides deck.\n' +
    'Click once per step: 1 Notes → Asana, 2 Asana → Figma, 3 Figma → Slides. The point is how smoothly one conversation turns into real work across every tool.',
  Component: S2Chain,
});
