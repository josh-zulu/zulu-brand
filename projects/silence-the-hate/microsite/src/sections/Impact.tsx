import { useRef } from 'react';
import { useI18n } from '../i18n';
import { EqBars, type EqHandle } from '../components/EqBars';
import { Draft, Label } from '../components/Marks';
import { gsap, MOTION_OK, useGSAP } from '../lib/motion';

/**
 * Motion idea: the music comes back. Each impact card's bars start silent and rise as it arrives;
 * the playlist that rewards installing stays behind frosted glass.
 */
export function Impact() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const bars = useRef<(EqHandle | null)[]>([]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>('.imp__card').forEach((card, i) => {
        const s = bars.current[i]?.state;
        if (s) s.energy = 0;
        gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', once: true } })
          .from(card, { y: 50, autoAlpha: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.08 })
          .to(s ?? {}, { energy: 1, duration: 1.2, ease: 'power2.out' }, 0.2);
      });
      gsap.from('.imp__playlist', { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.imp__extra', start: 'top 80%', once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="imp" id="impact" ref={root} aria-labelledby="imp-title">
      <Label>{t.impact.label}</Label>
      <h2 id="imp-title" className="h2">{t.impact.title} <Draft /></h2>
      <ul className="imp__cards">
        {t.impact.items.map((it, i) => (
          <li key={it.name} className="imp__card">
            <EqBars ref={(h) => { bars.current[i] = h; }} bars={7} speed={0.6 + i * 0.15} className="imp__eq" />
            <h3>{it.name}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
      <div className="imp__extra">
        <div className="imp__counter">
          <p className="imp__count" aria-label={t.impact.counterPending}>—</p>
          <p className="imp__count-label">{t.impact.counterLabel}</p>
          <p className="note">{t.impact.counterPending} <Draft kind="placeholder" /></p>
        </div>
        <div className="imp__playlist">
          <div className="imp__pl-glass" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => <span key={i} className="imp__pl-row"><i /><b style={{ width: `${40 + ((i * 29) % 45)}%` }} /></span>)}
          </div>
          <div className="imp__lock">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            <p className="imp__pl-title">{t.impact.playlistTitle}</p>
            <p>{t.impact.playlistLocked} <Draft /></p>
          </div>
        </div>
      </div>
    </section>
  );
}
