import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealWords } from '@/lib/motion';
import { HandLine, travellingUnderline, pathLength } from '@/components/HandLine';
import './S1Human.css';

/**
 * 1B · The part that stays human.
 * The opposite of everything around it: paper, silence, one hand-drawn line. No particles, no UI.
 *  beat 0  the headline settles in; a pencil line travels across the page and becomes its underline.
 *  beat 1  the reason, in two quiet sentences.
 */
function S1Human({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const [line, setLine] = useState<{ d: string; approach: number } | null>(null);

  // Fit the underline to the rendered headline (in stage pixels).
  useLayoutEffect(() => {
    const el = root.current, h = head.current;
    if (!el || !h) return;
    const scale = el.getBoundingClientRect().width / 1920 || 1;
    const rb = el.getBoundingClientRect(), hb = h.getBoundingClientRect();
    const x1 = (hb.left - rb.left) / scale - 6;
    const x2 = (hb.right - rb.left) / scale;
    const y = (hb.bottom - rb.top) / scale + 22;
    const { d, approachD } = travellingUnderline({ from: { x: -60, y: 930 }, x1, x2, y, seed: 23 });
    setLine({ d, approach: pathLength(approachD) / pathLength(d) });
  }, []);

  useBeats(root, step, (tl) => {
    if (!line) return;
    const q = gsap.utils.selector(root);
    const strokes = q('.hand-stroke');
    tl.from(q('.hu-head'), { opacity: 0, y: 18, duration: 1.8, ease: 'power2.out' }, 0.3);
    tl.fromTo(strokes, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.4, ease: 'power1.inOut' }, 1.1);
    // the travelling part lifts away; only the underline stays
    tl.to(strokes, { drawSVG: `${line.approach * 100}% 100%`, duration: 1.1, ease: 'power2.inOut' }, '+=0.15');
    tl.addLabel('b1');
    revealWords(tl, q('.hu-body-1')[0], { duration: 1.1, stagger: 0.04, filter: 'blur(4px)' });
    revealWords(tl, q('.hu-body-2')[0], { duration: 1.1, stagger: 0.04, filter: 'blur(4px)' }, '-=0.4');
  }, [line]);

  return (
    <div ref={root} className="human">
      <h2 ref={head} className="hu-head headline">The part that stays human.</h2>
      {line && <HandLine className="hu-line" width={1920} height={1080} d={line.d} stroke={6} seed={23} color="var(--zak-graphite)" />}
      <div className="hu-body">
        <p className="hu-body-1 lede">AI can do more of the work every year. It still can’t want something.</p>
        <p className="hu-body-2 lede">The idea, the taste and the reason to make it start with a person.</p>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's1-human',
  section: 1,
  title: '1B · The part that stays human',
  steps: 1,
  theme: 'paper',
  chrome: false,
  transition: 'blur',
  notes:
    'Let the room go quiet with the slide. Wait for the line to land before you speak.\n' +
    'This frames everything that follows. Every demo today shows AI doing more. None of them replaces knowing what’s worth making.',
  Component: S1Human,
});
