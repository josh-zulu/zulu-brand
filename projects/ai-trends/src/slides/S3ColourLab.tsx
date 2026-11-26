import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { AGO_STEPS, StepStrip, stripIn } from './shared34/StepStrip';
import { revealLines, revealWords } from '@/lib/motion';
import { ClipOrStill } from './shared34/ClipOrStill';
import { LinkChip } from './shared34/LinkChip';
import { LINKS } from '@/links';
import './S3ColourLab.css';

/**
 * AGO pitch · Colour lab. The real lab, recorded: pick a colour, see the colour wall, and the closest works in the
 * collection scored out of 100. The window is sized to the recording (1920×1086) so nothing is cropped.
 * colour-lab.mp4 is the first 60s of mockups/slides/ago/assets/ago-colour-lab.mp4.
 */
function S3ColourLab({ mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, 0, (tl) => {
    const q = gsap.utils.selector(root);
    stripIn(tl, root.current!);
    tl.from(q('.clab-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    revealLines(tl, q('.clab-title')[0], {}, 0.05);
    revealWords(tl, q('.clab-body')[0], {}, 0.6);
    tl.from(q('.clab-window'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.25);
    tl.from(q('.clab-link'), { opacity: 0, y: 12, duration: 0.6, ease: 'expo.out' }, 1.0);
  });

  return (
    <div ref={root} className="colour-lab">
      <div className="clab-copy">
        <div className="clab-kicker p34-kicker label"><i /><b>AGO pitch</b> · Colour lab</div>
        <h2 className="clab-title display">Test the idea<br />before we<br />pitch it</h2>
        <p className="clab-body">Pick any colour and see which works in the collection match it, scored out of 100.</p>
      </div>
      <div className="clab-window">
        <div className="clab-bar"><span className="clab-dots"><i /><i /><i /></span></div>
        <ClipOrStill className="clab-rec" src="ago/colour-lab.mp4" mode={mode} hint={false} />
      </div>
      <LinkChip className="clab-link" href={LINKS.agoLab} label="Open the lab" />
      <StepStrip steps={AGO_STEPS} active={2} />
    </div>
  );
}

export default defineSlide({
  id: 's3-colour-lab',
  section: 3,
  title: 'AGO · Colour lab',
  steps: 0,
  notes:
    'Test the idea before we pitch it. Pick any colour and see which works in the collection match it, scored out of 100.\n' +
    'This is the real lab: pick a colour, the colour wall, then the closest works ranked by score.',
  Component: S3ColourLab,
});
