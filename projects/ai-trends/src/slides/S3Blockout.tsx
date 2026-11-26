import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { ClipOrStill } from './shared34/ClipOrStill';
import './S3Blockout.css';

/**
 * Source slide 19. One motion idea: the same shot, rendered. One frame holds the Blender blockout; a signal-green line
 * sweeps across it and leaves the finished film behind, then settles in the middle so both read side by side.
 *  beat 0  the blockout
 *  beat 1  the render sweeps across (to the full final), then settles to a 50/50 Blockout | Final film
 * Clips: clips/blockout.mp4 and clips/final-film.mp4, Higgsfield's Blender plugin demo (higgsfield.ai/plugins/blender,
 * 800×450, 30s, same shot). Matched generated stills show if the files are missing. Live mode: drag across to compare.
 */
function S3Blockout({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const frame = q('.bo-frame')[0];
    gsap.set(frame, { '--p': 0 });

    revealLines(tl, q('.bo-headline')[0], {}, 0.05);
    revealWords(tl, q('.bo-lede')[0], {}, 0.45);
    tl.from(frame, { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.25);
    tl.from(q('.bo-tag-a'), { opacity: 0, x: -12, duration: 0.6 }, 1.0);

    tl.addLabel('b1');
    tl.to(q('.bo-line'), { opacity: 1, duration: 0.2 });
    tl.to(frame, { '--p': 100, duration: 1.7, ease: 'power2.inOut' }, '<');
    tl.to(q('.bo-tag-b'), { opacity: 1, duration: 0.5 }, '<0.5');
    tl.to(frame, { '--p': 56, duration: 1.0, ease: 'zak.settle' }, '>0.35');
    tl.from(q('.bo-knob'), { scale: 0, duration: 0.5, ease: 'back.out(2)' }, '<0.4');
  });

  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== 'live' || step < 1) return;
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const b = e.currentTarget.getBoundingClientRect();
    const p = 100 - Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)) * 100;
    gsap.to(e.currentTarget, { '--p': p, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  };

  return (
    <div ref={root} className="blockout">
      <div className="bo-copy">
        <h2 className="bo-headline headline">Rough 3D becomes a finished film.</h2>
        <p className="bo-lede lede">We block out the shot in Blender. AI renders the final look.</p>
      </div>

      <div className="bo-frame" onPointerDown={drag} onPointerMove={drag}>
        <ClipOrStill className="bo-layer" src="clips/blockout.mp4" still={generatedUrl('blockout-clay')} mode={mode} />
        <ClipOrStill className="bo-layer bo-final" src="clips/final-film.mp4" still={generatedUrl('final-still')} mode={mode} />
        <div className="bo-line"><span className="bo-knob"><i /><i /></span></div>
        <span className="bo-tag bo-tag-a label">Blockout</span>
        <span className="bo-tag bo-tag-b label">Final film</span>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's3-blockout',
  section: 3,
  title: 'Blockout to film',
  steps: 1,
  notes:
    'Rough 3D becomes a finished film. We block out the shot in Blender. AI renders the final look.\n' +
    'Click once: the render sweeps across the blockout and settles side by side. In the live window you can drag across the frame to compare.\n' +
    'Footage: Higgsfield\'s Blender plugin. A clay blockout of a hallway, rendered into a finished shot.',
  Component: S3Blockout,
});
