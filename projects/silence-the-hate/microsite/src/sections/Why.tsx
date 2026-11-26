import { useRef } from 'react';
import { useI18n } from '../i18n';
import { EqBars, type EqHandle } from '../components/EqBars';
import { Draft, Label } from '../components/Marks';
import { gsap, MOTION_OK, useGSAP } from '../lib/motion';

const ROWS = 7;
const FLAGGED = new Set([2, 5]);
const PLAYS = 12_483_920; // illustrative only, labelled on the page

/**
 * Motion idea: one sound pulled apart. The four pitch lines play in sequence over the same equalizer:
 * together in one wave → split and drained of colour → a playlist with flagged rows → plays that keep climbing.
 */
export function Why() {
  const { t, lang } = useI18n();
  const root = useRef<HTMLElement>(null);
  const left = useRef<EqHandle>(null);
  const right = useRef<EqHandle>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => n.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA');

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const el = root.current!;
      el.classList.add('is-anim');
      const L = left.current!.state, R = right.current!.state;
      L.sync = R.sync = 1;
      const lines = gsap.utils.toArray<HTMLElement>('.why__line', el);
      gsap.set(lines, { autoAlpha: 0, y: 40 });
      gsap.set(lines[0], { autoAlpha: 1, y: 0 });
      gsap.set('.why__playlist, .why__counter', { autoAlpha: 0 });
      const count = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=320%', scrub: 0.8, pin: true, anticipatePin: 1 },
      });
      const swap = (from: number, to: number, at: number) => {
        tl.to(lines[from], { autoAlpha: 0, y: -40, duration: 0.4 }, at).to(lines[to], { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.25);
      };
      // 1 → 2: divide. The wave splits in two and loses its colour.
      swap(0, 1, 1);
      tl.to([L, R], { sync: 0, duration: 0.8 }, 1)
        .to('.why__half--l', { xPercent: -22, duration: 0.8 }, 1)
        .to('.why__half--r', { xPercent: 22, duration: 0.8 }, 1)
        .to([L, R], { sat: 0.08, duration: 0.8 }, 1.1);
      // 2 → 3: the playlist. Bars sink back, rows rise, two rows turn.
      swap(1, 2, 2.2);
      tl.to([L, R], { energy: 0.35, duration: 0.6 }, 2.2)
        .to('.why__bars', { autoAlpha: 0.25, duration: 0.6 }, 2.2)
        .to('.why__playlist', { autoAlpha: 1, duration: 0.4 }, 2.4)
        .from('.why__row', { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.4 }, 2.4)
        .to('.why__row.is-flagged', { '--flag': 1, duration: 0.4, stagger: 0.15 }, 2.9);
      // 3 → 4: profit. The plays keep climbing.
      swap(2, 3, 3.6);
      tl.to('.why__playlist', { autoAlpha: 0.15, scale: 0.94, duration: 0.5 }, 3.6)
        .to('.why__counter', { autoAlpha: 1, duration: 0.4 }, 3.8)
        .to(count, { v: PLAYS, duration: 1.2, ease: 'none', onUpdate: () => { if (counter.current) counter.current.textContent = fmt(Math.round(count.v)); } }, 3.8)
        .to({}, { duration: 0.3 });
      return () => el.classList.remove('is-anim');
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [lang], revertOnUpdate: true });

  return (
    <section className="why" id="why" ref={root} aria-labelledby="why-label">
      <div className="why__inner">
        <div className="why__text">
          <Label><span id="why-label">{t.why.label}</span></Label>
          <ol className="why__lines">
            {t.why.lines.map((line, i) => <li key={i} className="why__line">{line}</li>)}
          </ol>
        </div>
        <div className="why__stage" aria-hidden="true">
          <div className="why__bars">
            <div className="why__half why__half--l"><EqBars ref={left} bars={10} anchor="mid" sync={1} speed={0.7} /></div>
            <div className="why__half why__half--r"><EqBars ref={right} bars={10} anchor="mid" sync={1} speed={0.7} /></div>
          </div>
          <div className="why__playlist">
            <p className="why__pl-title">{t.why.playlistTitle}</p>
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className={`why__row ${FLAGGED.has(i) ? 'is-flagged' : ''}`}>
                <span className="why__art" />
                <span className="why__skel"><i style={{ width: `${48 + ((i * 37) % 40)}%` }} /><i style={{ width: `${30 + ((i * 23) % 25)}%` }} /></span>
                {FLAGGED.has(i) && <span className="why__flag">{t.why.flaggedRow}</span>}
              </div>
            ))}
          </div>
          <div className="why__counter">
            <span className="why__count" ref={counter}>{fmt(PLAYS)}</span>
            <span className="why__count-label">{t.why.counterLabel}</span>
            <Draft kind="illustrative" />
          </div>
        </div>
      </div>
    </section>
  );
}
