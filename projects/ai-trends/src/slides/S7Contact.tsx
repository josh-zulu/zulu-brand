import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { ZakMark } from '@/components/ZakMark';
import { TEAM, photoFor } from './S0Team';
import './S7Contact.css';

/**
 * The last slide: ZAK sign-off and the ask. "Bring us the hard digital problems." with the Digital team.
 * One motion idea: the ZAK mark assembles piece by piece (its pills and dots), then the three of us fill our rings.
 * Names, titles and photos come from the Digital team slide (S0Team), so there's one place to edit them.
 */
function S7Contact({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const parts = q('.cx-mark rect, .cx-mark circle');
    tl.from(parts, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2)', stagger: { each: 0.06, from: 'random' } }, 0);
    revealLines(tl, q('.cx-head')[0], {}, 0.4);
    revealWords(tl, q('.cx-lede')[0], {}, 0.9);
    tl.from(q('.cx-ring'), { scale: 0.3, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.14 }, 0.7);
    tl.from(q('.cx-photo'), { scale: 1.25, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.14 }, 1.0);
    tl.from(q('.cx-meta'), { opacity: 0, x: -16, duration: 0.8, stagger: 0.14 }, 1.2);
    tl.from(q('.cx-sign'), { opacity: 0, duration: 0.8 }, 1.6);
  });

  return (
    <div ref={root} className="cx">
      <ZakMark className="cx-mark" />
      <div className="cx-copy">
        <h2 className="cx-head headline">Bring us the hard digital problems.</h2>
        <p className="cx-lede lede">Prototypes, motion, 3D and AI workflows, built in-house. We’re the go-to for digital and innovation at Zulu.</p>
      </div>
      <div className="cx-sign label"><span className="cx-rule" />Zulu Alpha Kilo · Digital team</div>

      <div className="cx-team">
        {TEAM.map((p) => {
          const photo = photoFor(p.name.split(' ')[0]);
          return (
            <div key={p.name} className="cx-person">
              <div className="cx-ring">
                <div className="cx-circle">
                  {photo && (
                    <div className="cx-frame" style={p.frame ? { transform: `translate(${50 - parseFloat(p.frame.x)}%, ${50 - parseFloat(p.frame.y)}%) scale(${p.frame.scale})`, transformOrigin: `${p.frame.x} ${p.frame.y}` } : undefined}>
                      <img className="cx-photo" src={photo} alt={p.name} draggable={false} />
                    </div>
                  )}
                </div>
              </div>
              <div className="cx-meta">
                <div className="cx-name display">{p.name}</div>
                <div className="cx-role label">{p.role}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's7-contact',
  section: 6,
  title: 'Bring us the hard digital problems',
  chrome: false,
  notes: 'Last slide. The ask: when you have a digital or innovation problem, bring it to us. Josh, Kyle and Hiep.',
  Component: S7Contact,
});
