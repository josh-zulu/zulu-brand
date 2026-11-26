import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../i18n';
import { Draft, Label } from '../components/Marks';
import { gsap, prefersReducedMotion, useGSAP } from '../lib/motion';

/**
 * Interactive 2: the flagged-lines pager from the pitch mock-up (source/frames/03-flagged-lyrics.jpg).
 * Motion idea: the line is muted. Each sample line arrives, a coral bar sweeps across it and it drops back,
 * struck through, and only then does the explanation speak.
 */
export function WordsMatter() {
  const { t } = useI18n();
  const cards = t.words.cards;
  const [i, setI] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  // The first card waits until the panel is on screen, so its muting is seen.
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(root.current!.querySelector('.wm__panel')!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const on = (e: Event) => setI(Math.max(0, Math.min(cards.length - 1, (e as CustomEvent<number>).detail)));
    addEventListener('sth:words-card', on);
    return () => removeEventListener('sth:words-card', on);
  }, [cards.length]);

  useGSAP(() => {
    const el = root.current!;
    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('.wm__mute'), { scaleX: 1, opacity: 0 });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: !seen });
    tl.fromTo('.wm__line-text', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 })
      .fromTo('.wm__x', { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)' }, 0.25)
      .fromTo('.wm__mute', { scaleX: 0, transformOrigin: 'left center', opacity: 1 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, 0.6)
      .to('.wm__mute', { opacity: 0, duration: 0.35 }, 1.1)
      .fromTo('.wm__line-text', { '--muted': 0 }, { '--muted': 1, duration: 0.35 }, 1.05)
      .fromTo('.wm__chip, .wm__note', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1.15)
      .fromTo('.wm__card', { autoAlpha: 0, x: 40, rotate: 1.5 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.7 }, 1.2);
  }, { scope: root, dependencies: [i, t, seen], revertOnUpdate: true });

  const go = (d: number) => setI((v) => (v + d + cards.length) % cards.length);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };
  const c = cards[i];
  const r = c.resource;

  return (
    <div className="wm" ref={root} role="region" aria-roledescription="carousel" aria-labelledby="wm-title" onKeyDown={onKey}>
      <div className="wm__intro">
        <Label>{t.words.label}</Label>
        <h2 id="wm-title" className="h2">{t.words.title}</h2>
        <p className="lede">{t.words.body}</p>
      </div>
      <div className="wm__panel">
        <div className="wm__left" aria-live="polite" aria-atomic="true">
          <p className="sr-only">{t.words.of(i + 1, cards.length)}</p>
          <div className="wm__line">
            <span className="wm__x" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
            <p className="wm__line-text">
              {c.line}
              <span className="wm__mute" aria-hidden="true" />
            </p>
          </div>
          <p className="wm__chip"><span>{t.words.guideline}</span> {c.guideline} <Draft kind="placeholder" /></p>
          <div className="wm__note">
            <svg className="wm__bulb" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p>{c.why} {i > 0 && <Draft />}</p>
          </div>
        </div>
        <a className="wm__card" href={r.url} target="_blank" rel="noopener">
          <span className="wm__card-art" aria-hidden="true" />
          <span className="wm__tags">
            <span className={`tag ${r.kind === 'deep' ? 'tag--hot' : ''}`}>{r.kind === 'deep' ? t.words.deepDive : t.words.quickStart}</span>
            <span className="tag tag--line">{r.tag}</span>
          </span>
          <span className="wm__card-title">{r.title}</span>
          <span className="wm__card-blurb">{r.blurb}</span>
          <span className="wm__card-foot">
            <span>{t.words.minRead(r.minutes)}</span>
            <span className="wm__card-go">{t.words.openResource} <span aria-hidden="true">↗</span></span>
          </span>
        </a>
        <div className="wm__pager">
          <button type="button" className="btn btn--ghost btn--small" onClick={() => go(-1)}>
            <span aria-hidden="true">‹</span> {t.words.back}
          </button>
          <div className="wm__dots" role="group" aria-label={t.words.of(i + 1, cards.length)}>
            {cards.map((_, k) => (
              <button key={k} type="button" className={`wm__dot ${k === i ? 'is-on' : ''}`} aria-label={t.words.of(k + 1, cards.length)} aria-current={k === i ? 'true' : undefined} onClick={() => setI(k)} />
            ))}
          </div>
          <button type="button" className="btn btn--grad btn--small" onClick={() => go(1)}>
            {t.words.next} <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <p className="note">{t.words.sampleNote} <Draft kind="sample" /></p>
    </div>
  );
}
