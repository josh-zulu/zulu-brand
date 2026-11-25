import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import { MockPhone } from './shared34/Device';
import './S3Doordash.css';

/**
 * Source slide 24 (AGO pitch · AGO-to-go on DoorDash). One motion idea: the idea dropped into an app people already
 * use. The phone drops into place, then each click slides the flow on by one screen, like thumbing through the app.
 *  beat 0  Search "burgers"   · beat 1 Find the gallery · beat 2 Check out · beat 3 Ticket in your wallet
 */
const SCREENS = [
  { src: 'ago/dd-search.mp4', label: 'Search “burgers”', still: 5.5 },
  { src: 'ago/dd-gallery.mp4', label: 'Find the gallery', still: 6 },
  { src: 'ago/dd-checkout.mp4', label: 'Check out', still: 3.2 },
  { src: 'ago/dd-ticket.mp4', label: 'Ticket in your wallet', still: 6.5 },
];
const PITCH = 300;   // distance between neighbours in the carousel
const SIDE = 0.7;    // neighbour scale

const pose = (d: number) => ({
  x: d * PITCH,
  scale: d === 0 ? 1 : SIDE,
  opacity: d === 0 ? 1 : Math.abs(d) === 1 ? 0.38 : 0,
  zIndex: 10 - Math.abs(d),
});

function S3Doordash({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const phones = q('.dd-phone');
    const items = q('.dd-item');
    phones.forEach((p, i) => gsap.set(p, pose(i)));
    gsap.set(items.slice(1), { opacity: 0.35 });

    // beat 0: copy in, the phone drops into place
    tl.from(q('.dd-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    revealLines(tl, q('.dd-title')[0], {}, 0.05);
    tl.from(items, { opacity: 0, x: -20, duration: 0.8, stagger: 0.07, ease: 'expo.out' }, 0.6);
    tl.from(phones[0], { y: -900, rotation: -6, duration: 1.3, ease: 'zak.settle' }, 0.2);
    tl.from(phones[1], { opacity: 0, x: PITCH + 120, duration: 1.1, ease: 'expo.out' }, 0.9);
    tl.from(q('.dd-glow'), { opacity: 0, duration: 1.6 }, 0.9);
    tl.from(q('.dd-marker'), { scaleY: 0, duration: 0.6, ease: 'expo.out' }, 1.0);

    // beats 1–3: thumb through the flow
    for (let k = 1; k < SCREENS.length; k++) {
      tl.addLabel(`b${k}`);
      const s = tl.duration();
      phones.forEach((p, i) => tl.to(p, { ...pose(i - k), duration: 0.95, ease: 'power3.inOut' }, s));
      tl.to(items[k - 1], { opacity: 0.35, duration: 0.5 }, s);
      tl.to(items[k], { opacity: 1, duration: 0.5 }, s + 0.2);
      tl.to(q('.dd-marker'), { y: k * 84, duration: 0.8, ease: 'power3.inOut' }, s);
    }
  });

  return (
    <div ref={root} className="doordash">
      <div className="dd-copy">
        <div className="dd-kicker p34-kicker label"><i /><b>AGO pitch</b> · AGO-to-go on DoorDash</div>
        <h2 className="dd-title display">Drop the idea into apps people already use</h2>
        <ol className="dd-steps">
          <span className="dd-marker" />
          {SCREENS.map((s, i) => (
            <li key={i} className="dd-item"><span className="label">{String(i + 1).padStart(2, '0')}</span>{s.label}</li>
          ))}
        </ol>
      </div>

      <div className="dd-stage">
        <div className="dd-glow" />
        {SCREENS.map((s, i) => (
          <div key={i} className="dd-phone">
            <MockPhone width={330} src={s.src} mode={mode} still={s.still} on={step === i} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's3-doordash',
  section: 3,
  title: 'AGO · AGO-to-go on DoorDash',
  steps: 3,
  notes:
    'Drop the idea into apps people already use. AGO-to-go on DoorDash.\n' +
    'Search "burgers", find the gallery, check out, ticket in your wallet. One click per screen.',
  Component: S3Doordash,
});
