import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto, rng } from '@/lib/motion';
import './S1HowWeWork.css';

/**
 * How we work with it now: the tee-up for "Give it a goal" and "Talk to it like a teammate".
 * One motion idea: the prompt grows into a brief.
 *  beat 0  "We don't prompt it anymore." A one-line prompt types into a chat box.
 *  beat 1  "We brief it." The prompt is struck through and the box opens into a brief: goal, context, done when.
 *  beat 2  The two habits land as a pair, each lighting the part of the brief it is about:
 *          01 Give it a goal (the goal row), 02 Say it out loud (the brief was dictated).
 */
const PROMPT = 'make a banner for the winter launch';
const FIELDS = [
  { k: 'Goal', v: 'Launch the winter campaign in every placement' },
  { k: 'Context', v: 'Brand kit, master banner, last year’s results' },
  { k: 'Done when', v: '12 sizes, checked, in the shared folder' },
];
const HABITS = [
  { n: '01', title: 'Give it a goal', sub: 'Hand over a whole job, not a question.' },
  { n: '02', title: 'Say it out loud', sub: 'Talk the brief instead of typing it.' },
];
const BARS = (() => {
  const r = rng(11);
  return Array.from({ length: 24 }, (_, i) => Math.max(3, Math.round(24 * (0.25 + 0.75 * Math.abs(Math.sin(i * 0.5 + 0.3))) * (0.4 + r() * 0.6))));
})();

function S1HowWeWork({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const brief = q('.hw-brief')[0] as HTMLElement;
    const habits = q('.hw-habit');
    const openH = brief.offsetHeight + 34;

    // ── beat 0: the prompt ────────────────────────────────────
    revealLines(tl, q('.hw-head')[0], {}, 0.05);
    tl.from(q('.hw-k-prompt'), { opacity: 0, y: 8, duration: 0.6 }, 0.5);
    tl.from(q('.hw-box'), { opacity: 0, y: 30, duration: 1.1 }, 0.4);
    typeInto(tl, q('.hw-prompt-text-in')[0], PROMPT, { cps: 26 }, 1.1);
    tl.addLabel('b1');

    // ── beat 1: it grows into a brief ─────────────────────────
    let t = tl.labels.b1;
    revealLines(tl, q('.hw-head-2')[0], {}, t);
    tl.to(q('.hw-prompt .caret'), { autoAlpha: 0, duration: 0.1 }, t);
    tl.to(q('.hw-strike'), { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, t + 0.1);
    tl.to(q('.hw-prompt'), { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' }, t + 0.65);
    tl.to(q('.hw-k-prompt'), { opacity: 0, y: -8, duration: 0.3 }, t + 0.6);
    tl.fromTo(q('.hw-k-brief'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: false }, t + 0.8);
    tl.to(q('.hw-box'), {
      height: openH, borderRadius: 28, backgroundColor: '#1d1c1c', boxShadow: '0 0 0 1px rgba(248,247,244,.12), 0 40px 100px rgba(0,0,0,.45)',
      duration: 1.0, ease: 'power3.inOut',
    }, t + 0.75);
    tl.to(brief, { opacity: 1, duration: 0.3 }, t + 1.1);
    tl.from(q('.hw-brief-top, .hw-field'), { opacity: 0, y: 18, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, t + 1.15);
    tl.addLabel('b2');

    // ── beat 2: the two habits ────────────────────────────────
    t = tl.labels.b2;
    habits.forEach((h, i) => {
      const at = t + i * 0.9;
      tl.fromTo(h.querySelector('.hw-rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, at);
      tl.from(h.querySelector('.hw-num'), { opacity: 0, y: 30, duration: 0.9 }, at + 0.15);
      revealLines(tl, h.querySelector('.hw-title'), { duration: 1 }, at + 0.2);
      revealWords(tl, h.querySelector('.hw-sub'), { stagger: 0.03 }, at + 0.4);
      tl.to(h.querySelector('.hw-rule'), { opacity: 0.25, duration: 0.6 }, at + 1.0);
    });
    // 01 lights the goal row; 02 shows the brief was spoken
    tl.to(q('.hw-mark'), { scaleY: 1, duration: 0.5, ease: 'power3.out' }, t + 0.3);
    tl.to(q('.hw-field').slice(1), { opacity: 0.45, duration: 0.5 }, t + 0.3);
    tl.to(q('.hw-said'), { opacity: 1, duration: 0.5 }, t + 1.2);
    tl.from(q('.hw-said rect'), { scaleY: 0.15, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.015, ease: 'power2.out' }, t + 1.2);
  });

  return (
    <div ref={root} className="howwework">
      <h2 className="hw-head headline">We don’t prompt it anymore.</h2>
      <h2 className="hw-head-2 headline">We brief it.</h2>

      <div className="hw-kicker label"><span className="hw-k-prompt">Prompt</span><span className="hw-k-brief">Brief</span></div>
      <div className="hw-box">
        <div className="hw-prompt">
          <span className="hw-prompt-mark">›</span>
          <span className="hw-prompt-text"><span className="hw-prompt-text-in" /><span className="hw-strike" /></span>
          <span className="caret blink" />
        </div>
        <div className="hw-brief">
          <div className="hw-brief-top">
            <span className="label">Winter launch</span>
            <span className="hw-said">
              <svg viewBox={`0 0 ${BARS.length * 5} 24`} preserveAspectRatio="none" aria-hidden>
                {BARS.map((h, i) => <rect key={i} x={i * 5} y={(24 - h) / 2} width="3" height={h} rx="1.5" />)}
              </svg>
              <span className="label">Said out loud · 0:42</span>
            </span>
          </div>
          {FIELDS.map((f, i) => (
            <div key={f.k} className="hw-field">
              {i === 0 && <span className="hw-mark" />}
              <span className="hw-field-k label">{f.k}</span>
              <span className="hw-field-v">{f.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hw-habits">
        {HABITS.map((h) => (
          <div key={h.n} className="hw-habit">
            <span className="hw-rule" />
            <span className="hw-num display">{h.n}</span>
            <div>
              <div className="hw-title headline">{h.title}</div>
              <p className="hw-sub lede">{h.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's1-howwework',
  section: 1,
  title: 'How we work with it now',
  steps: 2,
  notes:
    'So how do we work with it now? We used to type a line and hope.\n' +
    'Click: we brief it, the way we would brief a person. A goal, the context, and what done looks like.\n' +
    'Click: two habits make that easy, and they are the next two slides. One, give it a goal: hand over a whole job, not a question. Two, say it out loud: talk the brief instead of typing it.',
  Component: S1HowWeWork,
});
