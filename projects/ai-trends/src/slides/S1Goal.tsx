import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, drawOn } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { AgentCursor } from '@/components/AgentCursor';
import { useSfx } from '@/lib/sfx';
import './S1Goal.css';

/**
 * Give it a goal, not a prompt.
 *  beat 0  headline, lede, the agent's workspace (master banner, brief, 12 empty placements) and its task card.
 *  beat 1  hand it the goal: in step with the log it opens the file, reads the brief, fills every placement,
 *          checks its own work (two bad crops flagged), fixes them, and the to-do ticks itself off.
 * The workspace is a motion graphic, so the slide needs no footage.
 */
const GOAL = 'Resize the launch banner for every placement';
const RUN: { t: string; line: string; at: number }[] = [
  { t: '00:01', line: 'opening file', at: 0.3 },
  { t: '00:03', line: 'reading the brief', at: 1.5 },
  { t: '00:06', line: 'resizing 12 placements', at: 2.8 },
  { t: '00:09', line: 'checking work', at: 4.9 },
  { t: '00:11', line: 'fixing 2 crops', at: 6.4 },
  { t: '00:12', line: 'done', at: 7.9 },
];

// The 12 placements: real ad sizes, laid out in rows by height. x/y/w/h in workspace pixels.
type Slot = { label: string; x: number; y: number; w: number; h: number; pos: string; fix?: string };
const SLOTS: Slot[] = [
  { label: '1080×1080', x: 330, y: 40, w: 120, h: 120, pos: '50% 60%' },
  { label: '1080×1920', x: 462, y: 40, w: 68, h: 120, pos: '95% 40%', fix: '38% 60%' },
  { label: '1080×1350', x: 542, y: 40, w: 96, h: 120, pos: '45% 60%' },
  { label: '300×250', x: 650, y: 40, w: 144, h: 120, pos: '50% 62%' },
  { label: '300×600', x: 806, y: 40, w: 60, h: 120, pos: '40% 60%' },
  { label: '160×600', x: 878, y: 40, w: 32, h: 120, pos: '40% 60%' },
  { label: '1920×1080', x: 330, y: 200, w: 124, h: 70, pos: '50% 60%' },
  { label: '1200×628', x: 466, y: 200, w: 134, h: 70, pos: '50% 62%' },
  { label: '970×250', x: 330, y: 310, w: 171, h: 44, pos: '50% 65%' },
  { label: '728×90', x: 513, y: 310, w: 356, h: 44, pos: '50% 10%', fix: '50% 66%' },
  { label: '320×50', x: 330, y: 394, w: 166, h: 26, pos: '50% 66%' },
  { label: '320×100', x: 508, y: 394, w: 83, h: 26, pos: '50% 66%' },
];
const IMG = generatedUrl('campaign-1') ?? '';

function S1Goal({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s1-goal-done'], mode === 'live', 0.55);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const counter = q('.gl-count')[0];
    const lines = q('.gl-line');

    // ── beat 0: the setup ─────────────────────────────────────
    tl.from(q('.gl-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.gl-head')[0], {}, 0.05);
    revealWords(tl, q('.gl-lede')[0], {}, 0.4);
    tl.from(q('.gl-win'), { y: 70, opacity: 0, duration: 1.3 }, 0.3);
    tl.from(q('.gl-slot'), { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.03 }, 0.8);
    gsap.set(q('.gl-master, .gl-mhead, .gl-brief'), { opacity: 0.25 });
    const cursor = q('.gl-ws .agent-cursor')[0];
    gsap.set(cursor, { x: 900, y: 520, opacity: 0 });
    tl.from(q('.gl-panel > *'), { y: 30, opacity: 0, duration: 1, stagger: 0.07 }, 0.5);
    tl.addLabel('b1');

    // ── beat 1: it does the job ───────────────────────────────
    const t0 = tl.duration();
    tl.to(q('.gl-state-wait'), { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in' }, t0);
    tl.fromTo(q('.gl-state-run'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, t0 + 0.1);
    tl.to(q('.gl-live'), { backgroundColor: '#00e482', scale: 1, duration: 0.3 }, t0);
    tl.to(q('.gl-empty'), { opacity: 0, duration: 0.3 }, t0);

    const prog = { v: 0 };
    RUN.forEach((r, k) => {
      const line = lines[k];
      const at = t0 + r.at;
      const last = k === RUN.length - 1;
      const doneAt = last ? at + 0.55 : t0 + RUN[k + 1].at;
      tl.fromTo(line, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, at);
      if (!last) {
        tl.fromTo(line.querySelector('.gl-spin'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, at);
        tl.to(line.querySelector('.gl-spin'), { opacity: 0, duration: 0.15 }, doneAt - 0.05);
      }
      tl.fromTo(line.querySelector('.gl-ok'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)' }, doneAt);
      tl.to(line, { color: last ? '#00e482' : '#cfcec9', duration: 0.3 }, doneAt);
      tl.to(q('.gl-fill'), { scaleX: (k + 1) / RUN.length, duration: 0.5, ease: 'power3.out' }, doneAt);
      tl.to(prog, { v: k + 1, duration: 0.3, ease: 'none', onUpdate: () => { counter.textContent = `${Math.round(prog.v)} / ${RUN.length}`; } }, doneAt);
    });

    // ── the workspace, in step with the log ──────────────────
    const at = (k: number) => t0 + RUN[k].at;
    const slots = q('.gl-slot');
    // opening file
    tl.to(cursor, { opacity: 1, duration: 0.2 }, at(0));
    tl.to(cursor, { x: 170, y: 120, duration: 0.6, ease: 'power3.inOut' }, at(0));
    tl.to(q('.gl-master, .gl-mhead'), { opacity: 1, duration: 0.5 }, at(0) + 0.5);
    // reading the brief
    tl.to(q('.gl-brief'), { opacity: 1, duration: 0.4 }, at(1));
    tl.fromTo(q('.gl-scan'), { opacity: 1, y: 0 }, { y: 150, duration: 0.9, ease: 'power1.inOut' }, at(1));
    tl.to(q('.gl-scan'), { opacity: 0, duration: 0.2 }, at(1) + 0.9);
    tl.to(cursor, { x: 160, y: 270, duration: 0.5, ease: 'power3.inOut' }, at(1) + 0.1);
    // resizing 12 placements: each fills as the cursor visits
    const span = (RUN[3].at - RUN[2].at - 0.3) / SLOTS.length;
    SLOTS.forEach((sl, i) => {
      const t = at(2) + i * span;
      tl.to(cursor, { x: sl.x + sl.w * 0.6, y: sl.y + sl.h * 0.55, duration: Math.min(0.28, span), ease: 'power2.inOut' }, t);
      tl.to(slots[i].querySelector('.gl-fillimg'), { clipPath: 'inset(0 0% 0 0)', duration: 0.3, ease: 'power2.out' }, t + 0.08);
      tl.to(slots[i], { outlineColor: 'rgba(248,247,244,0)', duration: 0.3 }, t + 0.08);
    });
    // checking work: a sweep over every placement, two bad crops flagged
    tl.fromTo(q('.gl-sweep'), { opacity: 1, x: 0 }, { x: 560, duration: 1.2, ease: 'power1.inOut' }, at(3));
    tl.to(q('.gl-sweep'), { opacity: 0, duration: 0.2 }, at(3) + 1.2);
    tl.to(cursor, { x: 620, y: 470, duration: 0.6, ease: 'power3.inOut' }, at(3));
    const flagged = SLOTS.map((sl, i) => (sl.fix ? i : -1)).filter((i) => i >= 0);
    flagged.forEach((i) => tl.to(slots[i].querySelector('.gl-flag'), { opacity: 1, duration: 0.25 }, at(3) + 0.5 + i * 0.03));
    // fixing 2 crops
    flagged.forEach((i, n) => {
      const sl = SLOTS[i], t = at(4) + n * 0.6;
      tl.to(cursor, { x: sl.x + sl.w * 0.6, y: sl.y + sl.h * 0.55, duration: 0.35, ease: 'power3.inOut' }, t);
      tl.to(slots[i].querySelector('.gl-fillimg'), { backgroundPosition: sl.fix, duration: 0.5, ease: 'power2.inOut' }, t + 0.25);
      tl.to(slots[i].querySelector('.gl-flag'), { boxShadow: '0 0 0 2px #00e482', duration: 0.3 }, t + 0.6);
      tl.to(slots[i].querySelector('.gl-flag'), { opacity: 0, duration: 0.4 }, t + 1.0);
    });
    // done: every placement gets a tick, the cursor leaves
    tl.to(q('.gl-badge'), { scale: 1, duration: 0.3, ease: 'back.out(3)', stagger: 0.03 }, at(5));
    tl.to(cursor, { x: 960, y: 560, opacity: 0, duration: 0.6, ease: 'power2.in' }, at(5));

    // ── the to-do ticks itself off ────────────────────────────
    const tick = t0 + RUN[RUN.length - 1].at + 0.75;
    tl.call(() => { if (dir.current > 0) sfx.play('s1-goal-done'); }, undefined, tick);
    tl.fromTo(q('.gl-box-fill'), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, tick);
    drawOn(tl, q('.gl-check path')[0], { duration: 0.45, ease: 'power2.out' }, tick + 0.12);
    tl.fromTo(q('.gl-strike'), { backgroundSize: '0% 3px' }, { backgroundSize: '100% 3px', duration: 0.7, ease: 'power2.inOut' }, tick + 0.2);
    tl.to(q('.gl-goal-text'), { color: '#9e9d99', duration: 0.6 }, tick + 0.3);
    tl.to(q('.gl-state-run'), { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in' }, tick + 0.3);
    tl.fromTo(q('.gl-state-done'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, tick + 0.4);
    tl.to(q('.gl-live'), { backgroundColor: '#737068', duration: 0.4 }, tick + 0.3);
    tl.fromTo(q('.gl-done-note'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, tick + 0.5);
  });

  return (
    <div ref={root} className="gl">
      <div className="gl-kicker label"><b>How we work with it now</b><span className="gl-kicker-sep">·</span>01</div>
      <h2 className="gl-head headline">Give it a goal, not a prompt.</h2>
      <p className="gl-lede lede">It opens our files, uses our tools, checks its own work and comes back when it's done.</p>

      <div className="gl-win">
        <div className="gl-win-bar"><span className="dots"><i /><i /><i /></span><span className="gl-win-title">Agent · working on its own</span></div>
        <div className="gl-ws">
          <span className="gl-cap" style={{ left: 28, top: 16 }}>Master · 1920×1080</span>
          <div className="gl-master" style={{ backgroundImage: `url(${IMG})` }}><span className="gl-mhead">Taste the<br />pause.</span></div>
          <div className="gl-scan" />
          <div className="gl-brief"><b>Brief</b> · Winter launch<br />All 12 placements<br />Keep the line and the cup in frame</div>
          <span className="gl-cap" style={{ left: 330, top: 16 }}>Placements · 12</span>
          {SLOTS.map((sl) => (
            <div key={sl.label} className="gl-slot" style={{ left: sl.x, top: sl.y, width: sl.w, height: sl.h }}>
              <div className="gl-fillimg" style={{ backgroundImage: `url(${IMG})`, backgroundPosition: sl.pos }}>
                {sl.h >= 44 && sl.w >= 60 && <span className="gl-fhead" style={{ fontSize: Math.round(Math.min(sl.h * 0.2, sl.w * 0.14)) }}>Taste the pause.</span>}
              </div>
              <div className="gl-flag" />
              <span className="gl-badge">✓</span>
              <span className="gl-cap" style={{ left: 0, top: sl.h + 5 }}>{sl.label}</span>
            </div>
          ))}
          <div className="gl-sweep" />
          <AgentCursor label="Agent" />
        </div>
      </div>

      <aside className="gl-panel">
        <div className="gl-row label">
          <span>Goal</span>
          <span className="gl-state">
            <span className="gl-state-wait">Assigned</span>
            <span className="gl-state-run">Working</span>
            <span className="gl-state-done">Done</span>
          </span>
        </div>

        <div className="gl-goal">
          <span className="gl-box">
            <span className="gl-box-fill" />
            <svg className="gl-check" viewBox="0 0 52 52" aria-hidden><path d="M15 27 L23 35 L38 18" /></svg>
          </span>
          <span className="gl-goal-text"><span className="gl-strike">{GOAL}</span></span>
        </div>

        <div className="gl-progress">
          <span className="gl-pill pill-slot"><span className="gl-fill" /></span>
          <span className="gl-count mono">0 / {RUN.length}</span>
        </div>

        <div className="gl-row label gl-log-head">
          <span className="gl-log-title"><i className="gl-live" />Log</span>
          <span className="gl-done-note">Finished · 00:12</span>
        </div>
        <div className="gl-log">
          <span className="gl-empty"><span className="caret blink" /></span>
          {RUN.map((r) => (
            <div key={r.line} className={`gl-line ${r.line === 'done' ? 'is-done' : ''}`}>
              <span className="gl-t">{r.t}</span>
              <span className="gl-mark"><i className="gl-spin" /><i className="gl-ok">✓</i></span>
              <span className="gl-msg">{r.line}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default defineSlide({
  id: 's1-goal',
  section: 1,
  title: 'Give it a goal, not a prompt',
  steps: 1,
  notes:
    'Click once to hand it the goal. The agent opens the file, reads the brief, makes all 12 placements, checks its own work, fixes two bad crops, and the to-do ticks itself off.\n' +
    'This is the gap between generative and agentic. Generative gives you a thing. An agent gets a thing done: a model, plus tools, plus a loop.',
  Component: S1Goal,
});
