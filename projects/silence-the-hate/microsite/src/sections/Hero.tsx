import { useRef } from 'react';
import { useI18n } from '../i18n';
import { EqBars, type EqHandle } from '../components/EqBars';
import { AppleMark, Arrow, Draft, PflagLogo, Prism } from '../components/Marks';
import { gsap, MOTION_OK, useGSAP } from '../lib/motion';

/**
 * Motion idea: the music goes quiet. The bars play on arrival; scrolling pulls them flat into dots (silence)
 * while the promise takes their place.
 */
export function Hero() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const top = useRef<EqHandle>(null);
  const bottom = useRef<EqHandle>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const a = top.current!.state, b = bottom.current!.state;
      // Arrival: bars rise from silence, title lifts in.
      a.gain = 0; b.gain = 0;
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.hero__line > span', { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.1)
        .to([a, b], { gain: 1, duration: 1.6, ease: 'power2.out' }, 0.2)
        .from('.hero__logo', { autoAlpha: 0, y: 12, duration: 0.8 }, 0.7)
        .from('.hero__kicker', { autoAlpha: 0, duration: 0.8 }, 0.6);

      // Scroll: silence. Bars flatten, the logo steps back, the promise and the date arrive.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=90%', scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      tl.fromTo([a, b], { energy: 1 }, { energy: 0, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.hero__title', { scale: 0.86, yPercent: -18, ease: 'none', duration: 1 }, 0)
        .to('.hero__logo, .hero__kicker, .hero__hint', { autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo('.hero__after', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
        .to('.hero .prism', { yPercent: -30, rotate: '+=12', ease: 'none', duration: 1 }, 0);

      // Keyboard: the buttons stay focusable while faded; tabbing to them scrolls to the end of the pin so they show.
      const after = root.current!.querySelector<HTMLElement>('.hero__after')!;
      const onFocus = () => { const st = tl.scrollTrigger; if (st && scrollY < st.end) scrollTo({ top: st.end, behavior: 'instant' }); };
      after.addEventListener('focusin', onFocus);
      return () => after.removeEventListener('focusin', onFocus);
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="hero" id="top" ref={root}>
      <Prism className="hero__prism hero__prism--a" />
      <Prism className="hero__prism hero__prism--b" hue={140} />
      <EqBars ref={top} anchor="down" bars={11} className="hero__eq hero__eq--top" />
      <div className="hero__center">
        <p className="hero__kicker">{t.hero.kicker}</p>
        <h1 className="hero__title">
          <span className="hero__line"><span>{t.hero.titleA}</span></span>
          <span className="hero__line"><span>{t.hero.titleB}</span></span>
        </h1>
        <PflagLogo className="hero__logo" />
        <div className="hero__after">
          <p className="hero__lede">{t.hero.lede}</p>
          <p className="hero__launch"><strong>{t.hero.launch}</strong> · {t.hero.launchNote}</p>
          <div className="hero__ctas">
            <a className="btn" href="#get"><AppleMark />{t.hero.ctaPrimary}</a>
            <a className="btn btn--ghost" href="#how">{t.hero.ctaSecondary}<Arrow /></a>
            <Draft />
          </div>
        </div>
      </div>
      <EqBars ref={bottom} anchor="up" bars={11} className="hero__eq hero__eq--bottom" />
      <p className="hero__hint" aria-hidden="true">{t.hero.scrollHint}</p>
    </section>
  );
}
