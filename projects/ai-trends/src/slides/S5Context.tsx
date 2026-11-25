import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, drawOn } from '@/lib/motion';
import './S5Context.css';

/**
 * Every agent knows every client.
 *  beat 0  one place for client knowledge in the middle; around it, agents with no context.
 *  beat 1  every agent reads it first: a line to the hub, a pulse back, and each one now knows the client.
 *  beat 2  the brand changes once, in that one place, and every agent has it at the same moment.
 * Client names are fictional.
 */
const HUB = { x: 1290, y: 540 };
const AGENTS = [
  { name: 'Brief agent', a: -150 },
  { name: 'Copy agent', a: -90 },
  { name: 'Design agent', a: -30 },
  { name: 'Media agent', a: 30 },
  { name: 'Research agent', a: 90 },
  { name: 'Report agent', a: 150 },
].map((g) => {
  const r = (g.a * Math.PI) / 180;
  return { ...g, x: Math.round(HUB.x + Math.cos(r) * 430), y: Math.round(HUB.y + Math.sin(r) * 310) };
});

const ROWS: [string, string][] = [
  ['Tone of voice', '✓'],
  ['Audiences', '✓'],
  ['Past work', '214 files'],
  ['Approvals', '✓'],
];

function Context({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const agents = q('.cx-agent');
    const lines = q('.cx-line');

    // ── beat 0: the hub, and agents who know nothing yet ──────
    revealLines(tl, q('.cx-head')[0], {}, 0);
    revealWords(tl, q('.cx-lede')[0], {}, 0.4);
    tl.from(q('.cx-hub'), { opacity: 0, scale: 0.92, duration: 1.1 }, 0.3);
    tl.from(q('.cx-hub-back'), { opacity: 0, y: 0, x: 0, duration: 0.8, stagger: 0.1 }, 0.7);
    tl.from(agents, { opacity: 0, scale: 0.85, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.06 }, 0.6);
    tl.addLabel('b1');

    // ── beat 1: every agent reads it first ────────────────────
    AGENTS.forEach((g, i) => {
      const at = `b1+=${i * 0.12}`;
      drawOn(tl, lines[i], { duration: 0.7, ease: 'power3.inOut' }, at);
      const p = q('.cx-pulse-a')[i];
      tl.fromTo(p, { attr: { cx: HUB.x, cy: HUB.y }, opacity: 1 }, { attr: { cx: g.x, cy: g.y }, duration: 0.7, ease: 'power2.in', immediateRender: false }, `b1+=${0.35 + i * 0.12}`);
      tl.to(p, { opacity: 0, duration: 0.15 }, `b1+=${1.05 + i * 0.12}`);
      const t = `b1+=${1.0 + i * 0.12}`;
      tl.to(agents[i], { '--cx-ring': 'rgba(0, 228, 130, 0.5)', duration: 0.4 }, t);
      tl.to(agents[i].querySelector('.cx-dot'), { backgroundColor: '#00e482', boxShadow: '0 0 12px #00e482', duration: 0.3 }, t);
      tl.to(agents[i].querySelector('.cx-s0'), { opacity: 0, y: -8, duration: 0.25 }, t);
      tl.fromTo(agents[i].querySelector('.cx-s1'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, immediateRender: false }, t);
    });
    tl.addLabel('b2');

    // ── beat 2: one change, everywhere at once ────────────────
    tl.to(q('.cx-ver-old'), { opacity: 0, y: -10, duration: 0.3 }, 'b2');
    tl.fromTo(q('.cx-ver-new'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: false }, 'b2+=0.15');
    tl.fromTo(q('.cx-row-hi'), { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, 'b2');
    tl.to(q('.cx-upd-old'), { opacity: 0, duration: 0.2 }, 'b2');
    tl.fromTo(q('.cx-upd-new'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 'b2+=0.1');
    tl.fromTo(q('.cx-ripple'), { attr: { r: 150 }, opacity: 0.7 }, { attr: { r: 560 }, opacity: 0, duration: 1.3, ease: 'power2.out', immediateRender: false }, 'b2+=0.3');
    AGENTS.forEach((g, i) => {
      const p = q('.cx-pulse-b')[i];
      tl.fromTo(p, { attr: { cx: HUB.x, cy: HUB.y }, opacity: 1 }, { attr: { cx: g.x, cy: g.y }, duration: 0.6, ease: 'power2.in', immediateRender: false }, 'b2+=0.35');
      tl.to(p, { opacity: 0, duration: 0.15 }, 'b2+=0.95');
      tl.to(agents[i].querySelector('.cx-s1'), { opacity: 0, y: -8, duration: 0.2 }, 'b2+=0.9');
      tl.fromTo(agents[i].querySelector('.cx-s2'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, immediateRender: false }, 'b2+=0.95');
      tl.fromTo(agents[i], { '--cx-flash': 0 }, { '--cx-flash': 1, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, 'b2+=0.92');
    });
  });

  return (
    <div ref={root} className="cx">
      <div className="cx-text">
        <h2 className="cx-head headline">Every agent knows every client.</h2>
        <p className="cx-lede lede">One up-to-date place for client and brand knowledge that every agent reads first.</p>
      </div>

      <svg className="cx-wires" width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden>
        <circle className="cx-ripple" cx={HUB.x} cy={HUB.y} r={150} opacity={0} />
        {AGENTS.map((g, i) => <line key={i} className="cx-line" x1={HUB.x} y1={HUB.y} x2={g.x} y2={g.y} />)}
        {AGENTS.map((_, i) => <circle key={`a${i}`} className="cx-pulse cx-pulse-a" cx={HUB.x} cy={HUB.y} r={7} opacity={0} />)}
        {AGENTS.map((_, i) => <circle key={`b${i}`} className="cx-pulse cx-pulse-b" cx={HUB.x} cy={HUB.y} r={7} opacity={0} />)}
      </svg>

      <div className="cx-hub" style={{ left: HUB.x, top: HUB.y }}>
        <div className="cx-hub-back is-2"><span className="label">Bayline Transit</span></div>
        <div className="cx-hub-back is-1"><span className="label">Orchard Health</span></div>
        <div className="cx-card">
          <div className="label cx-card-k">Client knowledge</div>
          <div className="cx-card-name">Halden</div>
          <div className="cx-rows">
            <div className="cx-row">
              <i className="cx-row-hi" />
              <span>Brand guidelines</span>
              <b className="cx-ver"><span className="cx-ver-old">v4</span><span className="cx-ver-new">v5</span></b>
            </div>
            {ROWS.map(([k, v]) => <div key={k} className="cx-row"><span>{k}</span><b>{v}</b></div>)}
          </div>
          <div className="cx-upd label">
            <span className="cx-upd-old">Updated 2 days ago</span>
            <span className="cx-upd-new"><i />Updated just now</span>
          </div>
        </div>
      </div>

      {AGENTS.map((g) => (
        <div key={g.name} className="cx-agent" style={{ left: g.x, top: g.y }}>
          <i className="cx-dot" />
          <div className="cx-agent-t">
            <span className="cx-agent-name">{g.name}</span>
            <span className="cx-status">
              <span className="cx-s0">No context</span>
              <span className="cx-s1">Read · Halden v4</span>
              <span className="cx-s2">Read · Halden v5</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default defineSlide({
  id: 's5-context',
  section: 5,
  title: 'Every agent knows every client',
  steps: 2,
  notes:
    'On arrival: one place in the middle that holds what we know about a client. Around it, agents that know nothing yet.\n' +
    'Click: every agent reads it first, before it starts any job.\n' +
    'Click: the brand guidelines change once, in that one place, and every agent has the new version at the same moment. That is what up to date means. (Client names are made up.)',
  Component: Context,
});
