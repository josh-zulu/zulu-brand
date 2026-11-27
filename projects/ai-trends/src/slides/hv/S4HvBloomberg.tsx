import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { media } from '@/lib/asset';
import { HvKicker, HvStages, HvText, HvVideo } from './shared';

/**
 * Hiep 02 · Bloomberg AI. One idea: the same frame, three passes. Each click dissolves to the next pass in place.
 *  beat 0  the grey Blender render of the exchange floor (camera and layout)
 *  beat 1  the AI render of that frame, with the headline
 *  beat 2  the final, in motion
 */
const STAGES = ['Blender', 'AI render', 'Motion'];

function Bloomberg({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.hv-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.hv-head')[0], {}, 0.05);
    revealWords(tl, q('.hv-lede')[0], {}, 0.45);
    tl.from(q('.hv-frame'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.2);
    tl.from(q('.hv-stages'), { opacity: 0, y: 12, duration: 0.8 }, 0.8);
    gsap.set(q('.bb-still, .bb-final'), { opacity: 0 });
    tl.addLabel('b1');
    tl.to(q('.bb-still'), { opacity: 1, duration: 1.0, ease: 'power2.inOut' }, 'b1');
    tl.addLabel('b2', '+=0.1');
    tl.to(q('.bb-final'), { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 'b2');
  });

  return (
    <div ref={root} className="hv">
      <HvKicker project="Bloomberg AI" />
      <HvText
        head="One frame, three passes."
        lede="A grey Blender render sets the floor and the camera. AI renders the look. Then the headline moves."
      />
      <div className="hv-frame">
        <HvVideo src="hv/bloomberg-clay.mp4" mode={mode} />
        <img className="bb-still" src={media('hv/bloomberg-still.jpg')} alt="" draggable={false} />
        <HvVideo src="hv/bloomberg-final.mp4" mode={mode} className="bb-final" playing={step >= 2} restartOn={step >= 2} />
      </div>
      <HvStages stages={STAGES} at={Math.min(step, 2)} />
    </div>
  );
}

export default defineSlide({
  id: 's4-hv-bloomberg',
  section: 3,
  title: 'Hiep · Bloomberg AI',
  steps: 2,
  notes:
    'This one starts grey. A quick Blender render of the exchange floor: where everyone stands, where the camera sits.\n' +
    'Click: AI renders that same frame, traders, screens, light, with the headline on top.\n' +
    'Click: and the final, in motion.',
  Component: Bloomberg,
});
