import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { MockPhone } from './shared34/Device';
import { ProcessRail, type RailStep } from './shared34/ProcessRail';
import './S3Pitches.css';

/**
 * AGO pitch intro: the afternoon as a map. Each of the five steps gets its own slide next (brief, photos, lab,
 * GIF mockups, prototype), so here the whole rail is readable at once and the phones are already awake.
 */
const STEPS: RailStep[] = [
  { icon: 'ago/icon-brief.png', title: 'The brief', sub: 'Plus a PDF of the new artworks' },
  { icon: 'ago/icon-photos.png', title: 'Gather photos', sub: 'From our Art Rate Monitor work and the AGO website' },
  { icon: 'ago/icon-lab.png', title: 'The lab', sub: 'Test the colour matching' },
  { icon: 'ago/icon-mockups.png', title: 'GIF mockups', sub: 'The experience before it exists' },
  { icon: 'ago/icon-prototype.png', title: 'The prototype', sub: 'A real app clients can try' },
];

const PHONES = [
  { src: 'ago/idropper-intro.mp4', width: 228, still: 3.4 },
  { src: 'ago/idropper-match.mp4', width: 256, still: 3 },
  { src: 'ago/dd-search.mp4', width: 228, still: 5.5 },
];

function S3Pitches({ mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, 0, (tl) => {
    const q = gsap.utils.selector(root);
    revealLines(tl, q('.pi-title')[0], {}, 0);
    revealWords(tl, q('.pi-lede')[0], {}, 0.45);
    tl.from(q('.pi-phone'), { y: 90, opacity: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.25);
    tl.from(q('.pi-glow'), { opacity: 0, duration: 1.4, stagger: 0.1 }, 0.6);
    tl.from(q('.p34-rail-track'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, ease: 'expo.inOut' }, 0.5);
    tl.from(q('.p34-step'), { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.6);
  });

  return (
    <div ref={root} className="pitches">
      <h2 className="pi-title display">Pitches they<br />can play with</h2>
      <p className="pi-lede lede">From brief to working prototype in an afternoon.</p>

      <div className="pi-phones">
        {PHONES.map((p, k) => (
          <div key={k} className="pi-phone">
            <div className="pi-glow" />
            <MockPhone width={p.width} src={p.src} mode={mode} still={p.still} />
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
  steps: 0,
  notes:
    'From brief to working prototype in an afternoon. Five steps, one slide each next:\n' +
    'the brief · gather photos · the lab · GIF mockups · the prototype.',
  Component: S3Pitches,
});
