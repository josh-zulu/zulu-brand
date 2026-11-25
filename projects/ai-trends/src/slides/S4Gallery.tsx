import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import './S4Gallery.css';
import { media } from '@/lib/asset';

/**
 * Source slides 27–32: six full-bleed frames (image25, 20, 26, 33, 29, 28) that play as one sequence on the
 * Make-A-Wish blue grid: empty grid → a Claude terminal opens → it widens to centre → clears → the finished site →
 * clears. Here it's a real morph instead of six stills: the grid is the source image, the terminal is rebuilt in DOM
 * at the exact positions and colours of the frames, and the site is the source screenshot.
 *  beat 0  grid, then the terminal opens (frames 1–2)
 *  beat 1  the terminal widens to centre (frame 3)
 *  beat 2  it clears and the site rises in (frames 4–5); the slide transition is the last clear (frame 6)
 * Note: three of the six frames are an empty grid, which suggests the source slides were poster frames of embedded
 * videos. If those recordings turn up, they belong here.
 */
const F2 = { left: 100, top: 187, width: 580, height: 553 };
const F3 = { left: 360, top: 337, width: 1200, height: 440 };

function S4Gallery({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const term = q('.ga-term')[0];
    gsap.set(term, F2);

    // beat 0: frame 1 → 2
    tl.from(q('.ga-grid'), { opacity: 0, scale: 1.04, duration: 1.2, ease: 'power2.out' }, 0);
    tl.from(term, { opacity: 0, y: 36, scale: 0.97, duration: 1.0, ease: 'expo.out' }, 0.6);

    // beat 1: frame 3
    tl.addLabel('b1');
    tl.to(term, { ...F3, duration: 1.25, ease: 'power3.inOut' });

    // beat 2: frames 4 → 5
    tl.addLabel('b2');
    tl.to(term, { opacity: 0, scale: 0.96, duration: 0.5, ease: 'power2.in' });
    tl.from(q('.ga-site'), { opacity: 0, y: 70, scale: 0.98, duration: 1.2, ease: 'expo.out' }, '>0.15');
  });

  return (
    <div ref={root} className="gallery">
      <img className="ga-grid" src={media('source/image25.jpg')} alt="" draggable={false} />
      <div className="ga-term">
        <div className="ga-bar"><span className="ga-dots"><i /><i /><i /></span><span className="ga-title">claude · wishes-are-medicine</span></div>
        <div className="ga-prompt"><span className="ga-chev">›</span><span className="ga-caret caret blink" /></div>
      </div>
      <div className="ga-site" />
    </div>
  );
}

export default defineSlide({
  id: 's4-gallery',
  section: 4,
  title: 'Make-A-Wish: the build',
  steps: 2,
  chrome: false,
  transition: 'fade',
  notes:
    'The Make-A-Wish build, in three moves. A Claude session opens on the project, it widens to take the whole job, then the finished site.\n' +
    'Two clicks: the terminal widens, then the site arrives.',
  Component: S4Gallery,
});
