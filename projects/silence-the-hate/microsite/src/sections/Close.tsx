import { useRef } from 'react';
import { useI18n } from '../i18n';
import { EqBars, type EqHandle } from '../components/EqBars';
import { AppleMark, Draft, PflagLogo, Prism } from '../components/Marks';
import { gsap, MOTION_OK, useGSAP } from '../lib/motion';

/**
 * Motion idea: the music returns. The closing line lights up word by word as you read it, and the bars
 * that went silent in the hero rise again underneath, in full colour.
 */
export function Close() {
  const { t, lang } = useI18n();
  const root = useRef<HTMLElement>(null);
  const eq = useRef<EqHandle>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const s = eq.current!.state;
      s.energy = 0;
      gsap.timeline({ scrollTrigger: { trigger: '.close__statement', start: 'top 80%', end: 'bottom 40%', scrub: 0.5 } })
        .fromTo('.close__word', { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none' })
        .to(s, { energy: 1, ease: 'power1.in', duration: 1 }, 0.2);
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [lang], revertOnUpdate: true });

  return (
    <section className="close" id="get" ref={root} aria-labelledby="close-statement">
      <Prism className="close__prism" hue={260} />
      <p className="close__statement" id="close-statement">
        {t.close.statement.split(' ').map((w, i) => <span key={i} className="close__word">{w} </span>)}
      </p>
      <EqBars ref={eq} bars={23} className="close__eq" speed={0.9} />
      <div className="close__cta">
        <a className="btn btn--big" href="#get" aria-disabled="true" onClick={(e) => e.preventDefault()}><AppleMark />{t.close.cta}</a>
        <p className="note">{t.close.ctaNote} <Draft /></p>
        <a className="link" href={t.close.resourcesUrl} target="_blank" rel="noopener">{t.close.resources} ↗</a>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="h2 faq__title">{t.faq.label} <Draft /></h2>
      <div className="faq__list">
        {t.faq.items.map((f) => (
          <details key={f.q} className="faq__item">
            <summary><span>{f.q}</span><span className="faq__plus" aria-hidden="true" /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="foot">
      <PflagLogo className="foot__logo" />
      <div>
        <p>{t.footer.org}</p>
        <p>{t.footer.made}</p>
        <p className="note">{t.footer.reducedMotion}</p>
      </div>
      <a className="link" href={t.footer.pflagUrl} target="_blank" rel="noopener">{t.footer.pflag} ↗</a>
    </footer>
  );
}
