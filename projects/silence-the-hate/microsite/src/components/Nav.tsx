import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { EqBars } from './EqBars';
import { setUserReduced, systemReducedMotion, useReducedMotion } from '../lib/motion';

export function Nav() {
  const { t, toggle } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const system = systemReducedMotion();
  useEffect(() => {
    const on = () => setScrolled(scrollY > 40);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  const links: [string, string][] = [
    ['#why', t.nav.why], ['#try', t.nav.try], ['#how', t.nav.how], ['#learn', t.nav.learn], ['#privacy', t.nav.privacy], ['#impact', t.nav.impact],
  ];
  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <a className="nav__brand" href="#top">
        <EqBars bars={7} speed={0.8} className="nav__eq" />
        <span>Silence The Hate</span>
      </a>
      <nav aria-label={t.nav.label} className="nav__links">
        {links.map(([href, text]) => <a key={href} href={href}>{text}</a>)}
      </nav>
      <div className="nav__end">
        <button type="button" className="nav__lang" onClick={toggle} aria-label={t.meta.switchLabel} lang={t.meta.lang === 'en' ? 'fr' : 'en'}>
          {t.meta.lang === 'en' ? 'FR' : 'EN'}
        </button>
        <button
          type="button"
          className="nav__motion"
          aria-pressed={reduced}
          disabled={system}
          title={system ? t.nav.motionSystem : undefined}
          onClick={() => setUserReduced(!reduced)}
        >
          {reduced
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>}
          <span className="sr-only">{t.nav.motion}</span>
        </button>
        <a className="btn btn--small" href="#get">{t.nav.download}</a>
      </div>
    </header>
  );
}
