import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { countUp } from '@/lib/motion';
import { media } from '@/lib/asset';
import { AGO_STEPS, StepStrip, stripIn } from '../shared34/StepStrip';
import ARTWORKS from './artworks.json';
import './ago.css';

/**
 * AGO pitch 02 · Gather photos. Same motion as Make-A-Wish 02: the library ripples in and the count runs up.
 * The 122 artworks of the prototype (ago-idropper/data/prototype-artworks.json), shown whole: the AGO brief says
 * never crop an artwork or put text over it, so every work sits uncropped in its cell with labels outside.
 *  beat 0  122 works ripple in, the count runs to 122
 *  beat 1  where they came from: 8 from our Art Rate Monitor work, 114 from the AGO website
 */
const COLS = 16, GAP = 12, LEFT = 140, TOP = 214, W = 1640;
const CW = (W - (COLS - 1) * GAP) / COLS, CH = 64;
const ARM = ARTWORKS.filter((a) => a.src === 'arm').length;

function S3AgoPhotos({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.ap-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    stripIn(tl, root.current!);

    q('.ap-cell').forEach((el, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      tl.from(el, { opacity: 0, y: 14, scale: 0.92, duration: 0.4, ease: 'zak.out' }, 0.3 + (r + c) * 0.045);
    });
    tl.from(q('.ap-count'), { opacity: 0, y: 16, duration: 0.5, ease: 'zak.out' }, 0.3);
    countUp(tl, q('.ap-n')[0], ARTWORKS.length, { duration: 2.2 }, 0.35);

    tl.addLabel('b1');
    tl.to(q('.ap-cell.is-web'), { opacity: 0.22, duration: 0.6, ease: 'power2.out' }, 'b1');
    tl.to(q('.ap-cell.is-arm img'), { outlineColor: 'rgba(0, 228, 130, 1)', duration: 0.5, ease: 'power2.out' }, 'b1+=0.1');
    tl.to(q('.ap-count'), { opacity: 0, y: -10, duration: 0.4 }, 'b1');
    tl.fromTo(q('.ap-split'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'zak.out' }, 'b1+=0.3');
  });

  return (
    <div ref={root} className="ago-step">
      <div className="ap-kicker ago-kicker p34-kicker label"><i /><b>AGO pitch</b> · 02 Gather photos</div>
      {ARTWORKS.map((a, i) => (
        <div
          key={a.f}
          className={`ap-cell is-${a.src}`}
          style={{ left: LEFT + (i % COLS) * (CW + GAP), top: TOP + Math.floor(i / COLS) * (CH + GAP), width: CW, height: CH }}
        >
          <img src={media(`ago/art/${a.f}`)} alt="" draggable={false} />
        </div>
      ))}
      <div className="ap-row">
        <div className="ap-count"><span className="ap-n display">0</span><span className="ap-label">Artworks gathered,<br />each one whole</span></div>
        <div className="ap-split is-arm"><span className="ap-n display">{ARM}</span><span className="ap-label">From our Art Rate<br />Monitor work</span></div>
        <div className="ap-split"><span className="ap-n display">{ARTWORKS.length - ARM}</span><span className="ap-label">From the AGO<br />website</span></div>
      </div>
      <StepStrip steps={AGO_STEPS} active={1} />
    </div>
  );
}

export default defineSlide({
  id: 's3-ago-photos',
  section: 3,
  title: 'AGO · 02 Gather photos',
  steps: 1,
  transition: 'fade',
  notes:
    'Gather photos: 122 artworks for the prototype, every one shown whole (the AGO brief: never crop the art).\n' +
    `Click: where they came from. ${ARM} from our Art Rate Monitor work, ${ARTWORKS.length - ARM} from the AGO website.`,
  Component: S3AgoPhotos,
});
