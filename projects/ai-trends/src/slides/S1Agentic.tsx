import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, drawOn } from '@/lib/motion';
import './S1Agentic.css';

/**
 * Now it connects and does the work. One motion idea: a model becomes an agent when you add tools and a loop.
 *  beat 0  MODEL: headline and lede; the model sits alone, its six tool sockets empty (dashed, faint).
 *  beat 1  + TOOLS: wires draw out to every socket (MCP, connectors, APIs) and the tools come alive.
 *  beat 2  + LOOP: a ring draws round the model; a signal dot runs plan → act → check three times, each act
 *          pulsing out to a tool (files, design, project); on the last check the task ticks itself done.
 * Tools stay generic on purpose: section 2 shows the real ones (Figma, Blender, Resolve, Asana).
 */
const C = { x: 1330, y: 590 };
const R_TOOL = 330, R_RING = 150, R_VIA = 238, R_CORE = 100;
const at = (deg: number, r: number) => ({ x: C.x + r * Math.sin((deg * Math.PI) / 180), y: C.y - r * Math.cos((deg * Math.PI) / 180) });

type Tool = { name: string; via: string; deg: number; icon: ReactNode };
const TOOLS: Tool[] = [
  { name: 'Files', via: 'MCP', deg: 0, icon: <path d="M6 3h8l4 4v14H6z M14 3v4h4" /> },
  { name: 'Design', via: 'MCP', deg: 60, icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16 M9 9v11" /></> },
  { name: 'Edit', via: 'API', deg: 120, icon: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M10 9.5l5 2.5-5 2.5z" /></> },
  { name: 'Project', via: 'Connector', deg: 180, icon: <path d="M10 6h10 M10 12h10 M10 18h10 M4 6l1.2 1.2L7.5 5 M4 12l1.2 1.2L7.5 11 M4 18l1.2 1.2L7.5 17" /> },
  { name: 'Data', via: 'MCP', deg: 240, icon: <path d="M5 20v-8 M10 20V5 M15 20v-6 M20 20V9" /> },
  { name: 'Web', via: 'API', deg: 300, icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18 M12 3c3.2 3.2 3.2 14.8 0 18 M12 3c-3.2 3.2-3.2 14.8 0 18" /></> },
];
const STATIONS = [
  { label: 'Plan', deg: 30 },
  { label: 'Act', deg: 150 },
  { label: 'Check', deg: 270 },
];
/** Which tool each pass acts in. */
const ACTS = [0, 1, 3];
const STATUS = ['ready', '6 connected', 'plan', 'act · files', 'check', 'plan', 'act · design', 'check', 'plan', 'act · project', 'check', 'done'];
const RING_D = `M ${C.x} ${C.y - R_RING} A ${R_RING} ${R_RING} 0 1 1 ${C.x} ${C.y + R_RING} A ${R_RING} ${R_RING} 0 1 1 ${C.x} ${C.y - R_RING}`;

function S1Agentic({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const rows = q('.ax-row');
    const tools = q('.ax-tool');
    const status = q('.ax-status span');
    const orbit = q('.ax-orbit')[0];
    const pulse = q('.ax-pulse')[0];
    let cur = 0;
    const say = (i: number, t: number) => {
      tl.to(status[cur], { opacity: 0, y: -14, duration: 0.18, ease: 'power2.in' }, t);
      tl.fromTo(status[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, ease: 'power3.out', immediateRender: false }, t + 0.1);
      cur = i;
    };

    // ── beat 0: the model on its own ──────────────────────────
    revealLines(tl, q('.ax-head')[0], {}, 0.05);
    revealWords(tl, q('.ax-lede')[0], { stagger: 0.02 }, 0.45);
    tl.from(rows, { opacity: 0, y: 16, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.7);
    tl.to(rows[0], { opacity: 1, duration: 0.6 }, 1.1);
    tl.from(q('.ax-core'), { scale: 0.6, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.4);
    tl.from(tools, { opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.05, ease: 'power3.out' }, 0.8);
    tl.addLabel('b1');

    // ── beat 1: + tools ───────────────────────────────────────
    let t = tl.labels.b1;
    tl.to(rows[1], { opacity: 1, duration: 0.6 }, t);
    const wires = q('.ax-wire');
    TOOLS.forEach((_, i) => {
      const w = t + 0.15 + i * 0.12;
      drawOn(tl, wires[i], { duration: 0.6, ease: 'power2.inOut' }, w);
      tl.to(tools[i], { opacity: 1, outlineColor: 'rgba(248,247,244,0)', duration: 0.4 }, w + 0.5);
      tl.fromTo(tools[i].querySelector('.ax-tool-hit'), { opacity: 0 }, { opacity: 1, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, w + 0.5);
      tl.fromTo(q('.ax-via')[i], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, w + 0.35);
    });
    say(1, t + 1.1);
    tl.addLabel('b2');

    // ── beat 2: + loop ────────────────────────────────────────
    t = tl.labels.b2;
    tl.to(rows[2], { opacity: 1, duration: 0.6 }, t);
    tl.fromTo(q('.ax-task'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, t);
    drawOn(tl, q('.ax-ring-track')[0], { duration: 0.9, ease: 'power2.inOut' }, t + 0.1);
    tl.fromTo(q('.ax-station, .ax-tick'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2)', immediateRender: false }, t + 0.5);
    tl.set(orbit, { rotation: STATIONS[0].deg }, t);
    tl.to(orbit, { opacity: 1, duration: 0.3 }, t + 0.9);
    // dim the via labels so the loop reads first
    tl.to(q('.ax-via'), { opacity: 0.35, duration: 0.5 }, t + 0.5);

    let k = t + 1.1;
    let s = 2;
    ACTS.forEach((toolIdx, pass) => {
      const base = 360 * pass;
      say(s++, k); // plan
      tl.to(orbit, { rotation: base + STATIONS[1].deg, duration: 0.7, ease: 'power2.inOut' }, k + 0.35);
      say(s++, k + 1.0); // act
      const from = at(TOOLS[toolIdx].deg, R_CORE + 10), to = at(TOOLS[toolIdx].deg, R_TOOL - 40);
      tl.fromTo(pulse, { x: from.x, y: from.y, opacity: 1 }, { x: to.x, y: to.y, duration: 0.45, ease: 'power2.in', immediateRender: false }, k + 1.0);
      tl.to(pulse, { opacity: 0, duration: 0.1 }, k + 1.45);
      tl.fromTo(tools[toolIdx].querySelector('.ax-tool-hit'), { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, k + 1.4);
      tl.to(tools[toolIdx].querySelector('.ax-tool-hit'), { opacity: 0, duration: 0.5 }, k + 1.9);
      tl.to(orbit, { rotation: base + STATIONS[2].deg, duration: 0.7, ease: 'power2.inOut' }, k + 1.55);
      say(s++, k + 2.2); // check
      if (pass < ACTS.length - 1) tl.to(orbit, { rotation: base + 360 + STATIONS[0].deg, duration: 0.6, ease: 'power2.inOut' }, k + 2.55);
      k += 3.0;
    });
    // done
    const done = k - 0.2;
    say(s, done);
    tl.to(orbit, { opacity: 0, duration: 0.4 }, done);
    tl.to(q('.ax-core-glow'), { opacity: 1, duration: 0.5 }, done);
    tl.fromTo(q('.ax-task-fill'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, done + 0.1);
    drawOn(tl, q('.ax-task-box path')[0], { duration: 0.4, ease: 'power2.out' }, done + 0.2);
    tl.to(q('.ax-task-text'), { color: '#9e9d99', duration: 0.5 }, done + 0.3);
  });

  return (
    <div ref={root} className="agentic">
      <h2 className="ax-head headline">Now it connects and does the work.</h2>
      <p className="ax-lede lede">It plugs into our tools and data through MCP, connectors and APIs. Then it works in a loop until the job is done.</p>

      <div className="ax-eq">
        <div className="ax-row"><span className="ax-term display">Model</span><span className="ax-cap label">Reads, reasons, writes</span></div>
        <div className="ax-row"><span className="ax-term display"><em>+</em>Tools</span><span className="ax-cap label">MCP, connectors, APIs</span></div>
        <div className="ax-row"><span className="ax-term display"><em>+</em>Loop</span><span className="ax-cap label">Plan, act, check, until done</span></div>
      </div>

      <svg className="ax-wires" width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden>
        {TOOLS.map((tool) => {
          const a = at(tool.deg, R_CORE + 6), b = at(tool.deg, R_TOOL - 40);
          return <line key={tool.name} className="ax-wire" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        <path className="ax-ring-track" d={RING_D} />
      </svg>

      {TOOLS.map((tool) => {
        const p = at(tool.deg, R_TOOL), v = at(tool.deg, R_VIA);
        return (
          <div key={tool.name}>
            <div className="ax-tool pill-slot" style={{ left: p.x - 92, top: p.y - 32 }}>
              <svg viewBox="0 0 24 24" aria-hidden>{tool.icon}</svg>
              <span className="ax-tool-name label">{tool.name}</span>
              <span className="ax-tool-hit" />
            </div>
            <span className="ax-via" style={{ left: v.x, top: v.y }}>{tool.via}</span>
          </div>
        );
      })}

      {STATIONS.map((st) => {
        const p = at(st.deg, R_RING + 44), d = at(st.deg, R_RING);
        return (
          <div key={st.label}>
            <span className="ax-station label" style={{ left: p.x, top: p.y }}>{st.label}</span>
            <span className="ax-tick" style={{ left: d.x, top: d.y }} />
          </div>
        );
      })}

      <div className="ax-orbit" style={{ left: C.x, top: C.y }}><span className="ax-trail" /><i style={{ top: -R_RING - 9 }} /></div>
      <div className="ax-pulse" />

      <div className="ax-core" style={{ left: C.x - 100, top: C.y - 100 }}>
        <span className="ax-core-glow" />
        <span className="ax-core-label label">Model</span>
        <span className="ax-status">
          {STATUS.map((st, i) => <span key={i} className={`${i === 0 ? 'is-first' : ''} ${st === 'done' ? 'is-done' : ''}`}>{st}</span>)}
        </span>
      </div>

      <div className="ax-task" style={{ left: C.x, top: 138 }}>
        <span className="ax-task-box">
          <span className="ax-task-fill" />
          <svg viewBox="0 0 30 30" aria-hidden><path d="M9 15.5 L13.5 20 L21.5 11" /></svg>
        </span>
        <span className="ax-task-k label">Task</span>
        <span className="ax-task-text">Build the winter launch kit</span>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's1-agentic',
  section: 1,
  title: 'Now it connects and does',
  steps: 2,
  notes:
    'Three clicks build the formula. A model on its own can read, reason and write, but it can only hand you an answer.\n' +
    'Click: plus tools. Through MCP, the Model Context Protocol, plus connectors and APIs, it plugs into our files, design tools, edit suites, project boards and data.\n' +
    'Click: plus a loop. It plans, acts in a tool, checks the result and goes again until the job is done. A model, plus tools, plus a loop: that is an agent.\n' +
    "This is the “does” from the start of the talk. Section 2 shows it inside the tools we actually use.",
  Component: S1Agentic,
});
