import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto, countUp } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import { useSfx } from '@/lib/sfx';
import './S2AsanaNetsuite.css';

/**
 * Describe the project. It sets up the rest.
 * One idea: one sentence in, structured work out. The same frame plays both tools in turn.
 *  beat 0  headline + lede (the Asana sentence lit), an empty project with an input
 *  beat 1  a sentence types, then splits into a cascade of task rows; owners and dates land
 *  beat 2  the Asana recording takes over the frame
 *  beat 3  switch to NetSuite: "Which clients are over budget?" becomes the title of a bar chart that draws itself
 *  beat 4  the NetSuite recording takes over
 * All names and numbers are fictional.
 */
const SENTENCE = 'Plan the Larkline spring launch. Shoot mid-March, go live May 6.';
const QUESTION = 'Which clients are over budget?';
const TASKS = [
  { t: 'Brief and kickoff', o: 'Maya R.', i: 'MR', d: 'Feb 24' },
  { t: 'Casting and locations', o: 'Theo K.', i: 'TK', d: 'Mar 3' },
  { t: 'Shoot day, harbourfront', o: 'Priya S.', i: 'PS', d: 'Mar 18' },
  { t: 'Edit and colour', o: 'Dan O.', i: 'DO', d: 'Apr 8' },
  { t: 'Cutdowns and end cards', o: 'Lena M.', i: 'LM', d: 'Apr 22' },
  { t: 'Launch on socials', o: 'Sam W.', i: 'SW', d: 'May 6' },
];
const CLIENTS = [
  { n: 'Larkline Cycles', v: 128 },
  { n: 'Marlow & Finch', v: 114 },
  { n: 'Tidewater Health', v: 106 },
  { n: 'Okapi Foods', v: 92 },
  { n: 'Brightwell Transit', v: 81 },
  { n: 'Juniper Hall', v: 67 },
];
// chart geometry (body px)
const BAR_X = 290, PX_PER_PCT = 4.2, ROW0 = 168, ROW_H = 54;

function S2AsanaNetsuite({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['typing'], mode === 'live', 0.35);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);

    gsap.set(q('.asn-row'), { opacity: 0, y: -26, filter: 'blur(6px)' });
    gsap.set(q('.asn-ava, .asn-owner-name, .asn-date'), { opacity: 0 });
    gsap.set(q('.asn-ghost'), { opacity: 0 });
    gsap.set(q('.asn-ns'), { opacity: 0 });
    gsap.set(q('.asn-bubble'), { opacity: 0, y: 16 });
    gsap.set(q('.asn-bar'), { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(q('.asn-cname, .asn-val, .asn-think, .asn-answer, .asn-budget'), { opacity: 0 });
    gsap.set(q('.asn-s2'), { opacity: 0.32 });

    // ── beat 0 ──────────────────────────────────────────────────
    tl.from(q('.asn-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.asn-head')[0], {}, 0.05);
    revealWords(tl, q('.asn-lede')[0], {}, 0.4);
    tl.from(q('.asn-frame'), { y: 60, opacity: 0, duration: 1.3 }, 0.25);
    tl.from(q('.asn-input, .asn-thead'), { opacity: 0, y: 10, duration: 0.8, stagger: 0.1 }, 0.8);
    tl.addLabel('b1');

    // ── beat 1: sentence → task rows ────────────────────────────
    const a = tl.duration() + 0.05;
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); }, undefined, a);
    typeInto(tl, q('.asn-typed')[0], SENTENCE, { cps: 40 }, a);
    tl.call(() => sfx.stop('typing'));
    const split = tl.duration() + 0.3;
    // the sentence casts six copies of itself down the list; each one resolves into a task
    tl.set(q('.asn-ghost'), { opacity: 0.85, y: 0, filter: 'blur(0px)' }, split);
    tl.to(q('.asn-ghost'), { y: (i: number) => 128 + i * 64, duration: 0.6, ease: 'power2.out', stagger: 0.07 }, split);
    tl.to(q('.asn-ghost'), { opacity: 0, filter: 'blur(10px)', duration: 0.45, ease: 'power1.in', stagger: 0.07 }, split + 0.12);
    tl.to(q('.asn-typed'), { opacity: 0.35, duration: 0.4 }, split);
    tl.to(q('.asn-row'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.07 }, split + 0.3);
    tl.fromTo(q('.asn-ava'), { scale: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)', stagger: 0.06, immediateRender: false }, split + 1.1);
    tl.to(q('.asn-owner-name'), { opacity: 1, duration: 0.4, stagger: 0.06 }, split + 1.15);
    tl.fromTo(q('.asn-date'), { x: 12 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, immediateRender: false }, split + 1.25);
    tl.to(q('.asn-st-a'), { opacity: 1, duration: 0.4 }, split + 1.7);
    tl.addLabel('b2');

    // ── beat 2: the Asana recording ─────────────────────────────
    tl.fromTo(q('.asn-clip-a'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, tl.duration() + 0.05);
    tl.addLabel('b3');

    // ── beat 3: NetSuite, question → chart ──────────────────────
    const n = tl.duration() + 0.05;
    tl.to(q('.asn-asana, .asn-clip-a, .asn-st-a'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, n);
    tl.to(q('.asn-tab-hl'), { x: 132, width: 152, duration: 0.6, ease: 'power3.inOut' }, n);
    tl.to(q('.asn-tab-a'), { color: '#9e9d99', duration: 0.4 }, n);
    tl.to(q('.asn-tab-n'), { color: '#f8f7f4', duration: 0.4 }, n);
    tl.to(q('.asn-s1'), { opacity: 0.32, duration: 0.6 }, n);
    tl.to(q('.asn-s2'), { opacity: 1, duration: 0.6 }, n);
    tl.to(q('.asn-ns'), { opacity: 1, duration: 0.3 }, n + 0.4);
    tl.to(q('.asn-bubble'), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, n + 0.5);
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); }, undefined, n + 0.7);
    typeInto(tl, q('.asn-q')[0], QUESTION, { cps: 32 }, n + 0.7);
    tl.call(() => sfx.stop('typing'));
    const ask = tl.duration() + 0.25;
    tl.to(q('.asn-think'), { opacity: 1, duration: 0.3 }, ask);
    // the bubble resolves into the chart's title
    tl.to(q('.asn-bubble'), { x: -496, y: -8, scale: 0.84, duration: 0.9, ease: 'power3.inOut' }, ask + 0.5);
    tl.to(q('.asn-bubble-bg'), { opacity: 0, duration: 0.6 }, ask + 0.6);
    tl.to(q('.asn-think'), { opacity: 0, duration: 0.3 }, ask + 1.2);
    const chart = ask + 1.1;
    tl.fromTo(q('.asn-grid line'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.04, immediateRender: false }, chart);
    tl.to(q('.asn-cname'), { opacity: 1, duration: 0.4, stagger: 0.05 }, chart);
    tl.to(q('.asn-bar'), { scaleX: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, chart + 0.25);
    tl.to(q('.asn-val'), { opacity: 1, duration: 0.3, stagger: 0.08 }, chart + 0.35);
    q('.asn-val-n').forEach((el, i) => countUp(tl, el, CLIENTS[i].v, { suffix: '%', duration: 1.1 }, chart + 0.25 + i * 0.08));
    tl.to(q('.asn-budget'), { opacity: 1, duration: 0.5 }, chart + 1.0);
    tl.to(q('.asn-answer'), { opacity: 1, duration: 0.5 }, chart + 1.4);
    tl.to(q('.asn-st-n'), { opacity: 1, duration: 0.4 }, chart + 1.4);
    tl.addLabel('b4');

    // ── beat 4: the NetSuite recording ──────────────────────────
    tl.fromTo(q('.asn-clip-b'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, tl.duration() + 0.05);
  });

  const over = CLIENTS.filter((c) => c.v > 100).length;
  return (
    <div ref={root} className="asn">
      <div className="asn-text">
        <div className="asn-kicker label"><i /><span><b>04</b> · Production · Asana + NetSuite</span></div>
        <h2 className="asn-head headline">Describe the project. It sets up the rest.</h2>
        <p className="asn-lede lede">
          <span className="asn-s1">Every task, date and owner in Asana.</span>{' '}
          <span className="asn-s2">Then ask NetSuite, "Which clients are over budget?" and get an answer from real numbers.</span>
        </p>
      </div>

      <div className="asn-frame">
        <div className="asn-fhead">
          <div className="asn-tabs">
            <span className="asn-tab-hl" />
            <span className="asn-tab asn-tab-a">Asana</span>
            <span className="asn-tab asn-tab-n">NetSuite</span>
          </div>
          <span className="asn-st label">
            <span className="asn-st-a">6 tasks · 6 owners · 6 dates</span>
            <span className="asn-st-n">Budgets vs actuals · 6 clients</span>
          </span>
        </div>
        <div className="asn-body">
          {/* Asana */}
          <div className="asn-asana fill">
            <div className="asn-input">
              <span className="asn-chev">›</span>
              <span className="asn-typed" /><span className="caret blink" />
            </div>
            {TASKS.map((_, i) => <div key={i} className="asn-ghost">{SENTENCE}</div>)}
            <div className="asn-thead label"><span>Task</span><span>Owner</span><span>Due</span></div>
            {TASKS.map((t, i) => (
              <div key={i} className="asn-row" style={{ top: 158 + i * 64 }}>
                <span className="asn-check" />
                <span className="asn-task">{t.t}</span>
                <span className="asn-owner"><span className="asn-ava">{t.i}</span><span className="asn-owner-name">{t.o}</span></span>
                <span className="asn-date">{t.d}</span>
              </div>
            ))}
          </div>

          {/* NetSuite */}
          <div className="asn-ns fill">
            <div className="asn-bubble"><span className="asn-bubble-bg" /><span className="asn-q" /></div>
            <div className="asn-think label">› Reading budgets and actuals for 6 clients</div>
            <svg className="asn-grid" viewBox="0 0 1000 562" width="1000" height="562">
              {[0, 25, 50, 75, 125].map((p) => <line key={p} x1={BAR_X + p * PX_PER_PCT} y1={ROW0 - 18} x2={BAR_X + p * PX_PER_PCT} y2={ROW0 + CLIENTS.length * ROW_H - 12} />)}
            </svg>
            <div className="asn-budget" style={{ left: BAR_X + 100 * PX_PER_PCT }}><span className="label">Budget</span></div>
            {CLIENTS.map((c, i) => (
              <div key={c.n} className={`asn-crow${c.v > 100 ? ' is-over' : ''}`} style={{ top: ROW0 + i * ROW_H }}>
                <span className="asn-cname">{c.n}</span>
                <span className="asn-bar" style={{ left: BAR_X, width: c.v * PX_PER_PCT }} />
                <span className="asn-val" style={{ left: BAR_X + c.v * PX_PER_PCT + 14 }}><span className="asn-val-n">{c.v}%</span></span>
              </div>
            ))}
            <div className="asn-answer"><i />{over} of {CLIENTS.length} clients are over budget. Larkline Cycles is furthest over.</div>
          </div>

          <ClipFrame className="asn-clip asn-clip-a" src="clips/asana-ai-teammates-at-work.mp4" duration="32s" mode={mode} playing={step === 2} />
          <ClipFrame className="asn-clip asn-clip-b" src="clips/netsuite-top-customers-dashboard.mp4" duration="48s" mode={mode} playing={step >= 4} />
        </div>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's2-asana-netsuite',
  section: 2,
  title: 'Asana and NetSuite',
  steps: 4,
  notes:
    'Two tools, one pattern: say what you want in a sentence and it does the setup.\n' +
    'Click: one sentence becomes the whole project in Asana, with every task, owner and date. Click: the recording (32s).\n' +
    'Click: switch to NetSuite. Ask "Which clients are over budget?" and it answers from the real numbers, not a guess. Click: the recording (48s).\n' +
    'Names and figures on the animation are made up; the recordings are real.',
  Component: S2AsanaNetsuite,
});
