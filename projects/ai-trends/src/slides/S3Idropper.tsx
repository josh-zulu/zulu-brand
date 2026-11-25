import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import { Device, PhoneScreen } from './shared34/Device';
import './S3Idropper.css';

/**
 * Source slide 22 (AGO pitch · iDropper prototype). One motion idea: the prototype is handed to you.
 * The phone rises into frame and settles upright like it's been put in your hand; the sentence underneath is the
 * step indicator: each click lights the next phrase and the phone crossfades to that screen.
 *  beat 0  "Snap a photo,"        open the app on a photo
 *  beat 1  "tap a colour,"        sample a colour
 *  beat 2  "and it finds…"        the match
 */
const SCREENS = [
  { src: 'source/image34.mp4', still: 3.6, glow: 'rgba(96, 128, 196, 0.30)' },
  { src: 'source/image22.mp4', still: 4.5, glow: 'rgba(40, 70, 220, 0.36)' },
  { src: 'source/image12.mp4', still: 3.5, glow: 'rgba(60, 90, 200, 0.30)' },
];

function S3Idropper({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const screens = q('.id-screen');
    const phrases = q('.id-phrase');
    const glows = q('.id-glow');
    gsap.set(screens.slice(1), { opacity: 0 });
    gsap.set(glows.slice(1), { opacity: 0 });
    gsap.set(phrases.slice(1), { opacity: 0.3 });

    // beat 0: copy in; the phone is handed over
    tl.from(q('.id-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    revealLines(tl, q('.id-title')[0], {}, 0.05);
    tl.from(phrases, { opacity: 0, y: 14, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.6);
    tl.from(q('.id-hand'), { y: 620, x: 120, rotation: 16, duration: 1.6, ease: 'zak.settle' }, 0.15);
    tl.from(glows[0], { opacity: 0, scale: 0.6, duration: 1.8, ease: 'power2.out' }, 0.7);

    // beats 1–2: next phrase, next screen
    [1, 2].forEach((k) => {
      tl.addLabel(`b${k}`);
      tl.to(phrases[k - 1], { opacity: 0.3, duration: 0.5 });
      tl.to(phrases[k], { opacity: 1, duration: 0.5 }, '<');
      tl.to(screens[k], { opacity: 1, duration: 0.7, ease: 'power2.inOut' }, '<');
      tl.to(glows[k], { opacity: 1, duration: 0.9 }, '<');
      tl.to(glows[k - 1], { opacity: 0, duration: 0.9 }, '<');
      tl.fromTo(q('.id-hand'), { rotation: 0 }, { rotation: k === 1 ? -1.5 : 0, duration: 0.9, ease: 'power2.inOut' }, '<');
    });
  });

  return (
    <div ref={root} className="idropper">
      <div className="id-copy">
        <div className="id-kicker p34-kicker label"><i /><b>AGO pitch</b> · iDropper prototype</div>
        <h2 className="id-title display">Put a working<br />prototype in<br />their hand</h2>
        <p className="id-body">
          <span className="id-phrase">Snap a photo,</span>{' '}
          <span className="id-phrase">tap a colour,</span>{' '}
          <span className="id-phrase">and it finds the matching work in the AGO collection.</span>
        </p>
      </div>

      <div className="id-stage">
        {SCREENS.map((s, i) => <div key={i} className="id-glow" style={{ background: `radial-gradient(closest-side, ${s.glow}, transparent 72%)` }} />)}
        <div className="id-float">
          <div className="id-hand">
            <Device width={350} mode={mode}>
              {SCREENS.map((s, i) => (
                <PhoneScreen key={i} className="id-screen" src={s.src} mode={mode} still={s.still} on={step === i} />
              ))}
            </Device>
          </div>
        </div>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's3-idropper',
  section: 3,
  title: 'AGO · iDropper prototype',
  steps: 2,
  notes:
    'Put a working prototype in their hand. Snap a photo, tap a colour, and it finds the matching work in the AGO collection.\n' +
    'The sentence is the step indicator: click once for "tap a colour", again for the match.',
  Component: S3Idropper,
});
