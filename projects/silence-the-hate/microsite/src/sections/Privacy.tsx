import { useRef } from 'react';
import { useI18n } from '../i18n';
import { Draft, Label } from '../components/Marks';
import { gsap, MOTION_OK, SPECTRUM, useGSAP } from '../lib/motion';

const RINGS = [0, 2, 5, 7, 9];

/**
 * Motion idea: contained. pflag canada's rings become the edge of your computer. What you listen to drifts
 * toward the edge, touches the inner ring, and comes back. Nothing gets out.
 */
export function Privacy() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const chips = gsap.utils.toArray<HTMLElement>('.priv__chip');
      const rings = gsap.utils.toArray<SVGCircleElement>('.priv__ring');
      const edge = rings[rings.length - 1]; // the innermost ring is the boundary the data meets
      const viz = root.current!.querySelector<HTMLElement>('.priv__viz')!;
      // How far a chip can travel before it touches the inner ring (its half-width kept inside).
      const reach = (chip: HTMLElement, a: number) => {
        const r = viz.offsetWidth * (126 / 400) - 6;
        const hw = chip.offsetWidth / 2, hh = chip.offsetHeight / 2;
        return Math.max(20, r - Math.abs(Math.cos(a)) * hw - Math.abs(Math.sin(a)) * hh);
      };
      const loops: gsap.core.Timeline[] = [];
      chips.forEach((chip, i) => {
        const a = (i / chips.length) * Math.PI * 2 + 0.5;
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.9, repeatDelay: 0.4, paused: true });
        tl.fromTo(chip, { x: 0, y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
          .to(chip, { x: () => Math.cos(a) * reach(chip, a), y: () => Math.sin(a) * reach(chip, a), duration: 1.5, ease: 'power2.in' }, 0)
          .to(edge, { attr: { 'stroke-width': 7 }, duration: 0.1, yoyo: true, repeat: 1 }, 1.45)
          .to(chip, { x: () => Math.cos(a) * reach(chip, a) * 0.25, y: () => Math.sin(a) * reach(chip, a) * 0.25, duration: 1.2, ease: 'power3.out' }, 1.5)
          .to(chip, { autoAlpha: 0, duration: 0.4 }, 2.4);
        loops.push(tl);
      });
      gsap.fromTo(rings, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%' }, {
        scale: 1, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.priv__viz', start: 'top 75%', once: true },
      });
      gsap.timeline({ scrollTrigger: {
        trigger: '.priv__viz', start: 'top bottom', end: 'bottom top',
        onToggle: (st) => loops.forEach((l) => (st.isActive ? l.play() : l.pause())),
      } });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="priv" id="privacy" ref={root} aria-labelledby="priv-title">
      <div className="priv__text">
        <Label>{t.privacy.label}</Label>
        <h2 id="priv-title" className="h2">{t.privacy.title} <Draft /></h2>
        <ul className="priv__points">
          {t.privacy.points.map((p) => (
            <li key={p.name}><h3>{p.name}</h3><p>{p.body}</p></li>
          ))}
        </ul>
      </div>
      <div className="priv__viz" aria-hidden="true">
        <svg viewBox="0 0 400 400">
          {RINGS.map((c, i) => (
            <circle key={i} className="priv__ring" cx="200" cy="200" r={190 - i * 16} fill="none" stroke={SPECTRUM[c]} strokeWidth="3" opacity={1 - i * 0.12} />
          ))}
        </svg>
        <div className="priv__core">
          <p className="priv__core-label">{t.privacy.ringsLabel}</p>
          <div className="priv__chips">
            {t.privacy.stays.map((s) => <span key={s} className="priv__chip">{s}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
