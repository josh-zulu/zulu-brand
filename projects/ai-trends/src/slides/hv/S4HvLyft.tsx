import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { HvKicker, HvStages, HvText, HvVideo } from './shared';

/**
 * Hiep 03 · Lyft. One idea: side by side. The clip is already two halves, the Blender animation on the left and
 * the AI render on the right, so the slide only names them: a seam draws down the middle and each side gets its tag.
 *  beat 0  text; the clip plays; seam and tags land
 */
function Lyft({ mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, 0, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.hv-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.hv-head')[0], {}, 0.05);
    revealWords(tl, q('.hv-lede')[0], {}, 0.45);
    tl.from(q('.hv-frame'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.2);
    tl.fromTo(q('.ly-seam'), { scaleY: 0 }, { scaleY: 1, duration: 1.0, ease: 'expo.inOut' }, 0.9);
    tl.from(q('.ly-tag'), { opacity: 0, y: -8, duration: 0.5, stagger: 0.15 }, 1.4);
    tl.from(q('.hv-stages'), { opacity: 0, y: 12, duration: 0.8 }, 1.0);
  });

  return (
    <div ref={root} className="hv">
      <HvKicker project="Lyft" />
      <HvText
        head="Same motion, real world."
        lede="Hiep animates the bill in Blender. AI renders it onto the street. The timing and the camera stay his."
      />
      <div className="hv-frame">
        <HvVideo src="hv/lyft.mp4" mode={mode} />
        <i className="ly-seam" />
        <span className="hv-tag ly-tag" style={{ left: 16, top: 16 }}>Blender</span>
        <span className="hv-tag is-ai ly-tag" style={{ left: 'calc(50% + 16px)', top: 16 }}>AI render</span>
      </div>
      <HvStages stages={['Blender', 'AI render']} at={1} />
    </div>
  );
}

export default defineSlide({
  id: 's4-hv-lyft',
  section: 3,
  title: 'Hiep · Lyft',
  steps: 0,
  notes:
    'Left: the animation, in Blender. A plain grey bill, but every bend and every frame of timing is mine.\n' +
    'Right: AI renders that motion onto a real street. The motion stays mine; AI does the look.',
  Component: Lyft,
});
