import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import { MockPhone } from './shared34/Device';
import './S3Experience.css';

/**
 * Source slide 23 (AGO pitch · iDropper). One motion idea: walk the journey before it exists.
 *  beat 0  five phones rise, asleep
 *  beat 1  a signal line runs under the first four; each phone wakes as the line reaches it
 *  beat 2  "Or just send a DM": a dashed branch reaches the fifth phone, the alternative way in
 */
const SCREENS = [
  { src: 'ago/idropper-intro.mp4', label: 'Open the app', still: 3.6 },
  { src: 'ago/idropper-sample.mp4', label: 'Sample a colour', still: 4.5 },
  { src: 'ago/idropper-match.mp4', label: 'Get your match', still: 3.5 },
  { src: 'ago/idropper-claimed.mp4', label: 'Claim a VIP preview', still: 4 },
  { src: 'ago/idropper-dm.mp4', label: 'Or just send a DM', still: 9 },
];
const W = 244;          // phone width
const X = [140, 452, 764, 1076, 1536]; // left edges; the DM phone stands apart
const cx = (i: number) => X[i] + W / 2;

function S3Experience({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const phones = q('.ex-phone');
    const sleeps = q('.ex-phone .p34-sleep');
    const caps = q('.ex-cap');
    const dots = q('.ex-dot');
    gsap.set(sleeps, { opacity: 1 });
    gsap.set(caps, { opacity: 0.35 });

    // beat 0
    tl.from(q('.ex-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    revealLines(tl, q('.ex-title')[0], {}, 0.05);
    tl.from(phones, { y: 110, opacity: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out' }, 0.3);
    tl.from(caps, { opacity: 0, y: 12, duration: 0.8, stagger: 0.06 }, 0.8);
    tl.from(q('.ex-track'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'expo.inOut' }, 0.7);
    tl.from(dots, { scale: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(2)' }, 1.0);

    // beat 1: the journey, phone by phone
    tl.addLabel('b1');
    const s1 = tl.duration();
    const per = 0.62;
    tl.to(q('.ex-fill'), { scaleX: 1, duration: per * 3, ease: 'none' }, s1);
    for (let i = 0; i < 4; i++) {
      const at = s1 + per * i;
      tl.to(dots[i], { backgroundColor: '#00e482', boxShadow: '0 0 0 6px rgba(0,228,130,.18), 0 0 22px rgba(0,228,130,.6)', duration: 0.3 }, at);
      tl.to(sleeps[i], { opacity: 0, duration: 0.7, ease: 'power2.out' }, at);
      tl.fromTo(phones[i], { y: 0 }, { y: -14, duration: 0.9, ease: 'expo.out' }, at);
      tl.to(caps[i], { opacity: 1, duration: 0.5 }, at);
    }

    // beat 2: or just send a DM
    tl.addLabel('b2');
    const s2 = tl.duration();
    tl.fromTo(q('.ex-branch'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' }, s2);
    tl.to(dots[4], { backgroundColor: '#4dd0e1', boxShadow: '0 0 0 6px rgba(77,208,225,.18), 0 0 22px rgba(77,208,225,.55)', duration: 0.3 }, s2 + 0.8);
    tl.to(sleeps[4], { opacity: 0, duration: 0.7, ease: 'power2.out' }, s2 + 0.8);
    tl.fromTo(phones[4], { y: 0 }, { y: -14, duration: 0.9, ease: 'expo.out' }, s2 + 0.8);
    tl.to(caps[4], { opacity: 1, duration: 0.5 }, s2 + 0.8);
  });

  const trackY = 26;
  return (
    <div ref={root} className="experience">
      <div className="ex-kicker p34-kicker label"><i /><b>AGO pitch</b> · iDropper</div>
      <h2 className="ex-title display">Show the experience before it exists</h2>

      {SCREENS.map((s, i) => (
        <div key={i} className="ex-phone" style={{ left: X[i] }}>
          <MockPhone width={W} src={s.src} mode={mode} still={s.still} on={i < 4 ? step >= 1 : step >= 2} />
        </div>
      ))}

      <div className="ex-journey">
        <div className="ex-track" style={{ left: cx(0), width: cx(3) - cx(0), top: trackY }}><div className="ex-fill" /></div>
        <div className="ex-branch" style={{ left: cx(3), width: cx(4) - cx(3), top: trackY }} />
        {SCREENS.map((s, i) => (
          <div key={i} className="ex-cap" style={{ left: cx(i) }}>
            <span className="ex-dot" style={{ top: trackY }} />
            <span className="ex-num label">{String(i + 1).padStart(2, '0')}</span>
            <span className="ex-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's3-experience',
  section: 3,
  title: 'AGO · Show the experience',
  steps: 2,
  notes:
    'Show the experience before it exists. These are GIF mockups, made before anything was built.\n' +
    'Click 1 walks the journey: open the app, sample a colour, get your match, claim a VIP preview. Click 2: or just send a DM, the same match without the app.',
  Component: S3Experience,
});
