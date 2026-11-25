import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { MockPhone } from './shared34/Device';
import { ProcessRail, railLight, type RailStep } from './shared34/ProcessRail';
import './S3Pitches.css';

/**
 * Source slide 20. One motion idea: the afternoon, step by step. The five steps sit on a rail, dim; each click sends
 * a signal pulse along the rail and lights the next step. The three phones wait asleep and wake at the end:
 * the app at "The prototype", the other mockups at "GIF mockups".
 */
const STEPS: RailStep[] = [
  { icon: 'ago/icon-brief.png', title: 'The brief', sub: 'Plus a PDF of the new artworks' },
  { icon: 'ago/icon-photos.png', title: 'Gather photos', sub: 'From our Art Rate Monitor work and the AGO website' },
  { icon: 'ago/icon-lab.png', title: 'The lab', sub: 'Test the colour matching' },
  { icon: 'ago/icon-prototype.png', title: 'The prototype', sub: 'A real app clients can try' },
  { icon: 'ago/icon-mockups.png', title: 'GIF mockups', sub: 'The experience before it exists' },
];

const PHONES = [
  { src: 'ago/idropper-intro.mp4', width: 228, still: 3.4, wakeAt: 4 },
  { src: 'ago/idropper-match.mp4', width: 256, still: 3, wakeAt: 5 },
  { src: 'ago/dd-search.mp4', width: 228, still: 5.5, wakeAt: 5 },
];

function S3Pitches({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const phones = q('.pi-phone');
    gsap.set(q('.pi-phone .p34-sleep'), { opacity: 1 });

    // beat 0: title, lede, the plan laid out (dim), phones asleep
    revealLines(tl, q('.pi-title')[0], {}, 0);
    revealWords(tl, q('.pi-lede')[0], {}, 0.45);
    tl.from(phones, { y: 90, opacity: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.25);
    tl.from(q('.p34-rail-track'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, ease: 'expo.inOut' }, 0.5);
    tl.from(q('.p34-step'), { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.6);

    // beats 1–5: one step each
    STEPS.forEach((_, i) => {
      tl.addLabel(`b${i + 1}`);
      const lit = railLight(tl, el, i);
      PHONES.forEach((p, k) => {
        if (p.wakeAt !== i + 1) return;
        const at = lit - 0.5 + (k === 2 ? 0.15 : 0);
        tl.to(phones[k].querySelector('.p34-sleep'), { opacity: 0, duration: 0.9, ease: 'power2.out' }, at);
        tl.fromTo(phones[k], { y: 0 }, { y: -16, duration: 1.1, ease: 'expo.out' }, at);
        tl.to(phones[k].querySelector('.pi-glow'), { opacity: 1, duration: 1.2 }, at);
      });
    });
  });

  return (
    <div ref={root} className="pitches">
      <h2 className="pi-title display">Pitches they<br />can play with</h2>
      <p className="pi-lede lede">From brief to working prototype in an afternoon.</p>

      <div className="pi-phones">
        {PHONES.map((p, k) => (
          <div key={k} className="pi-phone">
            <div className="pi-glow" />
            <MockPhone width={p.width} src={p.src} mode={mode} still={p.still} on={step >= p.wakeAt} />
          </div>
        ))}
      </div>

      <ProcessRail steps={STEPS} className="pi-rail" />
    </div>
  );
}

export default defineSlide({
  id: 's3-pitches',
  section: 3,
  title: 'Pitches they can play with',
  steps: 5,
  notes:
    'From brief to working prototype in an afternoon. Five clicks, one per step.\n' +
    '1 The brief, plus a PDF of the new artworks. 2 Gather photos, from our Art Rate Monitor work and the AGO website. 3 The lab: test the colour matching. 4 The prototype: a real app clients can try (the first phone wakes). 5 GIF mockups: the experience before it exists (the other two wake).',
  Component: S3Pitches,
});
