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
    const parts = q('.ct-mark rect, .ct-mark circle');
    tl.from(parts, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2)', stagger: { each: 0.06, from: 'random' } }, 0);
    revealLines(tl, q('.ct-head')[0], {}, 0.4);
    revealWords(tl, q('.ct-lede')[0], {}, 0.9);
    tl.from(q('.ct-ring'), { scale: 0.3, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.14 }, 0.7);
    tl.from(q('.ct-photo'), { scale: 1.25, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.14 }, 1.0);
    tl.from(q('.ct-meta'), { opacity: 0, x: -16, duration: 0.8, stagger: 0.14 }, 1.2);
    tl.from(q('.ct-sign'), { opacity: 0, duration: 0.8 }, 1.6);
  });

  return (
    <div ref={root} className="ct">
      <ZakMark className="ct-mark" />
      <div className="ct-copy">
        <h2 className="ct-head headline">Bring us the hard digital problems.</h2>
        <p className="ct-lede lede">Prototypes, motion, 3D and AI workflows, built in-house. We’re the go-to for digital and innovation at Zulu.</p>
      </div>
      <div className="ct-sign label"><span className="ct-rule" />Zulu Alpha Kilo · Digital team</div>

      <div className="ct-team">
        {TEAM.map((p) => {
          const photo = photoFor(p.name.split(' ')[0]);
          return (
            <div key={p.name} className="ct-person">
              <div className="ct-ring">
                <div className="ct-circle">
                  {photo && (
                    <div className="ct-frame" style={p.frame ? { transform: `translate(${50 - parseFloat(p.frame.x)}%, ${50 - parseFloat(p.frame.y)}%) scale(${p.frame.scale})`, transformOrigin: `${p.frame.x} ${p.frame.y}` } : undefined}>
                      <img className="ct-photo" src={photo} alt={p.name} draggable={false} />
                    </div>
                  )}
                </div>
              </div>
              <div className="ct-meta">
                <div className="ct-name display">{p.name}</div>
                <div className="ct-role label">{p.role}</div>
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
  section: 5,
  title: 'Bring us the hard digital problems',
  chrome: false,
  notes: 'Last slide. The ask: when you have a digital or innovation problem, bring it to us. Josh, Kyle and Hiep.',
  Component: S7Contact,
});
