import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { ProcessRail, type RailStep } from './shared34/ProcessRail';
import { ClipOrStill } from './shared34/ClipOrStill';
import './S4MakeAWish.css';

/**
 * Make-A-Wish intro: the film and the plan. The five steps each get their own slide next (S4Maw1–5), so here the
 * rail is laid out in full as the map of what's coming.
 */
const STEPS: RailStep[] = [
  { icon: 'maw/icon-inputs.png', title: 'The inputs', sub: 'Transcript, brief, brand, footage' },
  { icon: 'maw/icon-clips.png', title: 'Clip library', sub: '84 shots, sorted by scene' },
  { icon: 'maw/icon-figma.png', title: 'Figma', sub: 'Wireframe and scene options' },
  { icon: 'maw/icon-animatic.png', title: 'Animatic', sub: 'Every scene in motion' },
  { icon: 'maw/icon-site.png', title: 'The site', sub: 'Built from the animatic' },
];

function S4MakeAWish({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    revealLines(tl, q('.mw-title')[0], {}, 0);
    revealWords(tl, q('.mw-lede')[0], {}, 0.45);
    tl.from(q('.mw-frame'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.25);
    tl.from(q('.p34-rail-track'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, ease: 'expo.inOut' }, 0.5);
    tl.from(q('.p34-step'), { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.6);
  });

  return (
    <div ref={root} className="make-a-wish">
      <h2 className="mw-title display">Make-A-Wish:<br />Wishes are medicine</h2>
      <p className="mw-lede lede">How we built our Fast Company World Changing Ideas award site with Claude.</p>
      <div className="mw-frame">
        <ClipOrStill className="mw-film" src="maw/film-loop.mp4" mode={mode} hint={false} />
      </div>
      <ProcessRail steps={STEPS} className="mw-rail" />
    </div>
  );
}

export default defineSlide({
  id: 's4-make-a-wish',
  section: 4,
  title: 'Make-A-Wish: Wishes Are Medicine',
  steps: 0,
  notes:
    'Make-A-Wish: Wishes Are Medicine. How we built our Fast Company World Changing Ideas award site with Claude.\n' +
    'Five steps, one slide each next: the inputs · the clip library · Figma · the animatic · the site.',
  Component: S4MakeAWish,
});
