import { useRef } from 'react';
import { useI18n } from '../i18n';
import { Draft, Label } from '../components/Marks';
import { gsap, MOTION_OK, useGSAP } from '../lib/motion';

// Beam ends sit over the centres of the three-column grid below (1/6, 3/6, 5/6 of the width).
const ENDS = [200, 600, 1000];
const BEAMS = [
  ['#ff4a50', '#ffcb3a'],
  ['#a6dc55', '#2ec4d6'],
  ['#3b8bff', '#b34de6'],
];

/**
 * Motion idea: refraction. One white beam (a skip) enters the prism and leaves as three colours:
 * install, listen, educate. Each step lights up as its beam reaches it.
 */
export function How() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const el = root.current!;
      const draw = (sel: string) => {
        el.querySelectorAll<SVGPathElement>(sel).forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
      };
      draw('.how__beam-in'); draw('.how__beam-out');
      gsap.set('.how__step', { '--lit': 0, y: 30, autoAlpha: 0.35 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.how__diagram', start: 'top 80%', end: 'bottom 35%', scrub: 0.6 },
      });
      tl.to('.how__beam-in', { strokeDashoffset: 0, duration: 1 })
        .to('.how__prism-glow', { opacity: 1, duration: 0.4 }, 0.8)
        .to('.how__prism', { '--spin': 1, duration: 0.6 }, 0.8);
      gsap.utils.toArray<SVGPathElement>('.how__beam-out', el).forEach((p, i) => {
        tl.to(p, { strokeDashoffset: 0, duration: 1 }, 1.1 + i * 0.25);
      });
      // Cards answer their beam outside the scrub, so they never sit half-lit.
      gsap.utils.toArray<HTMLElement>('.how__step', el).forEach((card, i) => {
        gsap.to(card, {
          '--lit': 1, y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.how__diagram', start: `bottom ${62 - i * 6}%`, toggleActions: 'play none none reverse' },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="how" id="how" ref={root} aria-labelledby="how-title">
      <div className="how__head">
        <Label>{t.how.label}</Label>
        <h2 id="how-title" className="h2">{t.how.title} <Draft /></h2>
      </div>
      <div className="how__diagram" aria-hidden="true">
        <svg viewBox="0 0 1200 430" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="beam-in" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" />
            </linearGradient>
            {BEAMS.map(([a, b], i) => (
              <linearGradient key={i} id={`beam-${i}`} gradientUnits="userSpaceOnUse" x1="600" y1="262" x2={ENDS[i]} y2="430">
                <stop offset="0" stopColor={a} />
                <stop offset="1" stopColor={b} />
              </linearGradient>
            ))}
            <linearGradient id="prism-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".22" />
              <stop offset=".45" stopColor="#8a4dff" stopOpacity=".18" />
              <stop offset="1" stopColor="#2ec4d6" stopOpacity=".28" />
            </linearGradient>
            <radialGradient id="prism-glow">
              <stop offset="0" stopColor="#fff" stopOpacity=".55" />
              <stop offset=".4" stopColor="#d94dc0" stopOpacity=".18" />
              <stop offset="1" stopColor="#3b8bff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path className="how__beam-in" d="M600 0 L600 180" stroke="url(#beam-in)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle className="how__prism-glow" cx="600" cy="200" r="170" fill="url(#prism-glow)" opacity="0" />
          <g className="how__prism">
            <polygon points="600,120 696,272 504,272" fill="url(#prism-fill)" stroke="rgba(255,255,255,.75)" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="600,120 640,272 504,272" fill="rgba(255,255,255,.08)" />
            <line x1="600" y1="120" x2="640" y2="272" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
          </g>
          {ENDS.map((x, i) => (
            <path key={i} className="how__beam-out" d={`M600 262 C 600 330, ${x} 330, ${x} 430`} stroke={`url(#beam-${i})`} strokeWidth="6" strokeLinecap="round" fill="none" />
          ))}
        </svg>
      </div>
      <ol className="how__steps">
        {t.how.steps.map((s, i) => (
          <li key={s.name} className="how__step" style={{ ['--c1' as string]: BEAMS[i][0], ['--c2' as string]: BEAMS[i][1] }}>
            <span className="how__num">0{i + 1}</span>
            <h3 className="how__name">{s.name}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="note how__note">{t.how.platformNote} <Draft /></p>
    </section>
  );
}
