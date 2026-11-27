import { useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { media } from '@/lib/asset';
import { HvKicker, HvStages, HvText, HvVideo } from './shared';

/**
 * Hiep 04 · PC Optimum app spot. One idea: boards become the film. The three storyboard pages sit stacked in the
 * frame; on the click they slide away and the finished spot plays where they were.
 *  beat 0  text; the storyboard pages fan in
 *  beat 1  the pages slide off; the 76-second spot plays (hover for sound)
 */
const BOARDS = [1, 2, 3].map((n) => `hv/pc-optimum-board-${n}.jpg`);

function PcOptimum({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.hv-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.hv-head')[0], {}, 0.05);
    revealWords(tl, q('.hv-lede')[0], {}, 0.45);
    tl.from(q('.hv-stages'), { opacity: 0, y: 12, duration: 0.8 }, 0.8);
    gsap.set(q('.pc-film'), { opacity: 0 });
    tl.from(q('.pc-board'), { y: 90, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.3);
    tl.addLabel('b1');
    tl.to(q('.pc-board'), { x: 1100, opacity: 0, duration: 0.9, ease: 'power3.in', stagger: 0.08 }, 'b1');
    tl.to(q('.pc-film'), { opacity: 1, duration: 0.8, ease: 'power2.out' }, 'b1+=0.5');
  });

  return (
    <div ref={root} className="hv">
      <HvKicker project="PC Optimum" />
      <HvText
        head="From storyboard to spot."
        lede="An app launch spot for PC Optimum. Boards first, then AI-built scenes cut to the voiceover."
      />
      <div className="pc-boards">
        {BOARDS.map((b, i) => (
          <img key={b} className="pc-board" src={media(b)} alt="" draggable={false} style={{ top: i * 70, left: i * 50, zIndex: 3 - i }} />
        ))}
      </div>
      <div className="hv-frame pc-film">
        <HvVideo src="hv/pc-optimum-film.mp4" mode={mode} playing={step >= 1} restartOn={step >= 1} muted={muted} />
        {mode === 'live' && step >= 1 && (
          <button className={`hv-sound ${muted ? '' : 'on'}`} onClick={() => setMuted((m) => !m)}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
        )}
      </div>
      <HvStages stages={['Storyboard', 'AI scenes', 'The spot']} at={step >= 1 ? 2 : 0} />
    </div>
  );
}

export default defineSlide({
  id: 's4-hv-pc-optimum',
  section: 3,
  title: 'Hiep · PC Optimum',
  steps: 1,
  notes:
    'PC Optimum: a spot for the new app. It started as boards, every scene and every line of voiceover planned on paper.\n' +
    'Click: the spot. The scenes were built with AI and cut to the voiceover. 76 seconds; hover the clip for sound.',
  Component: PcOptimum,
});
