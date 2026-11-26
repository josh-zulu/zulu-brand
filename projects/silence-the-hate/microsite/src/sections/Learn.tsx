import { useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../i18n';
import { Draft, Label } from '../components/Marks';
import { gsap, MOTION_OK, prefersReducedMotion, SPECTRUM, useGSAP } from '../lib/motion';
import { WordsMatter } from './WordsMatter';

export function Learn() {
  return (
    <section className="learn" id="learn">
      <WordsMatter />
      <Context />
      <Decide />
      <Letters />
    </section>
  );
}

/**
 * Same word, different song. Motion idea: the word never moves. Only what surrounds it changes,
 * and with it the verdict.
 */
function Context() {
  const { t } = useI18n();
  const [k, setK] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const opt = t.context.options[k];

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo('.ctx__around', { autoAlpha: 0, filter: 'blur(6px)' }, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.08, ease: 'power2.out' });
    gsap.fromTo('.ctx__verdict', { rotateX: -90, autoAlpha: 0 }, { rotateX: 0, autoAlpha: 1, duration: 0.5, delay: 0.25, ease: 'back.out(2)' });
  }, { scope: root, dependencies: [k], revertOnUpdate: true });

  const onKey = (e: KeyboardEvent) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const n = (k + 1) % 2;
      setK(n);
      root.current?.querySelectorAll<HTMLButtonElement>('[role=radio]')[n]?.focus();
    }
  };

  return (
    <div className="ctx" ref={root}>
      <div className="ctx__intro">
        <Label draft>{t.context.label}</Label>
        <h3 className="h3">{t.context.title}</h3>
        <p>{t.context.body}</p>
      </div>
      <div className="ctx__demo">
        <div className="seg" role="radiogroup" aria-label={t.context.title} onKeyDown={onKey}>
          {t.context.options.map((o, i) => (
            <button key={o.name} type="button" role="radio" aria-checked={k === i} tabIndex={k === i ? 0 : -1} className={`seg__btn ${k === i ? 'is-on' : ''}`} onClick={() => setK(i)}>
              {o.name}
            </button>
          ))}
        </div>
        <figure className={`ctx__stage ctx__stage--${opt.tone}`} aria-live="polite">
          <p className="ctx__around">{opt.before}</p>
          <p className="ctx__word">{t.context.word}</p>
          <p className="ctx__around">{opt.after}</p>
          <figcaption className="ctx__verdict">
            <span className="ctx__icon" aria-hidden="true">{opt.tone === 'ok' ? '✓' : '!'}</span>
            {opt.verdict}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/**
 * Who decides. Motion idea: a line travels from machine to person to flag, and stops at the person.
 * Scrubbed by scroll, so the reader sets the pace.
 */
function Decide() {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const el = root.current!;
      gsap.set('.dec__step', { autoAlpha: 0.3 });
      gsap.set('.dec__log li', { autoAlpha: 0 });
      gsap.set('.dec__stamp', { scale: 2.2, autoAlpha: 0 });
      gsap.set('.dec__fill', { scaleX: 0 });
      gsap.set('.dec__record span', { autoAlpha: 0, x: -8 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
      });
      tl.to('.dec__step--0', { autoAlpha: 1, duration: 0.2 })
        .to('.dec__log li', { autoAlpha: 1, stagger: 0.2, duration: 0.1 })
        .to('.dec__fill', { scaleX: 0.5, duration: 0.6 })
        .to('.dec__step--1', { autoAlpha: 1, duration: 0.2 })
        .to('.dec__stamp', { scale: 1, autoAlpha: 1, duration: 0.25, ease: 'back.out(2)' })
        .to({}, { duration: 0.3 }) // the pause at the person
        .to('.dec__fill', { scaleX: 1, duration: 0.6 })
        .to('.dec__step--2', { autoAlpha: 1, duration: 0.2 })
        .to('.dec__record span', { autoAlpha: 1, x: 0, stagger: 0.12, duration: 0.15 });
    });
    return () => mm.revert();
  }, { scope: root });

  const [s0, s1, s2] = t.decide.steps;
  return (
    <div className="dec" ref={root}>
      <Label draft>{t.decide.label}</Label>
      <h3 className="h3">{t.decide.title}</h3>
      <div className="dec__track" aria-hidden="true"><span className="dec__fill" /></div>
      <ol className="dec__steps">
        <li className="dec__step dec__step--0">
          <p className="dec__who dec__who--machine">{s0.who}</p>
          <ul className="dec__log" aria-hidden="true">{t.decide.machineLog.map((l) => <li key={l}>{l}</li>)}</ul>
          <p>{s0.body}</p>
        </li>
        <li className="dec__step dec__step--1">
          <p className="dec__who dec__who--human">{s1.who} <span className="dec__stamp" aria-hidden="true">✓</span></p>
          <p>{s1.body}</p>
        </li>
        <li className="dec__step dec__step--2">
          <p className="dec__who">{s2.who}</p>
          <p className="dec__record" aria-hidden="true">{t.decide.record.map((r) => <span key={r}>{r}</span>)}</p>
          <p>{s2.body}</p>
        </li>
      </ol>
      <p className="dec__principle">{t.decide.principle}</p>
    </div>
  );
}

/**
 * The letters. Motion idea: each letter is a bar in the equalizer; picking one makes it sing
 * (it jumps like a bar on a beat) while the others hold.
 */
function Letters() {
  const { t } = useI18n();
  const items = t.letters.items;
  const [k, setK] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tab = tabs.current[k];
    if (tab) gsap.fromTo(tab.querySelector('.let__glyph'), { scaleY: 0.6, y: 10 }, { scaleY: 1, y: 0, duration: 0.7, ease: 'elastic.out(1.1, 0.35)', transformOrigin: '50% 100%' });
    gsap.fromTo('.let__panel > *', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' });
  }, { scope: root, dependencies: [k, t], revertOnUpdate: true });

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from('.let__tab', { yPercent: 60, autoAlpha: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -k, End: items.length - 1 - k };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = (k + map[e.key] + items.length) % items.length;
    setK(n);
    tabs.current[n]?.focus();
  };

  return (
    <div className="let" ref={root}>
      <Label draft>{t.letters.label}</Label>
      <h3 className="h3">{t.letters.title}</h3>
      <p className="note">{t.letters.hint}</p>
      <div className="let__tabs" role="tablist" aria-label={t.letters.title} onKeyDown={onKey}>
        {items.map((it, i) => (
          <button
            key={it.key}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`let-tab-${i}`}
            aria-selected={k === i}
            aria-controls="let-panel"
            tabIndex={k === i ? 0 : -1}
            className={`let__tab ${k === i ? 'is-on' : ''}`}
            style={{ ['--c' as string]: SPECTRUM[Math.round((i / (items.length - 1)) * (SPECTRUM.length - 1))] }}
            onClick={() => setK(i)}
          >
            <span className="let__glyph">{it.key}</span>
            <span className="sr-only">{it.term}</span>
          </button>
        ))}
      </div>
      <div className="let__panel" id="let-panel" role="tabpanel" aria-labelledby={`let-tab-${k}`} tabIndex={0}>
        <p className="let__term">{items[k].term}</p>
        <p className="let__def">{items[k].def}</p>
      </div>
    </div>
  );
}
