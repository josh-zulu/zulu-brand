import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { media } from '@/lib/asset';
import { AGO_STEPS, StepStrip, stripIn } from '../shared34/StepStrip';
import { Chip } from '../maw/shared';
import './ago.css';

/**
 * AGO pitch 01 · The brief. Same motion as Make-A-Wish 01: the material lands on the table and settles into groups.
 * Pages are rendered from ~/Projects/AGO/ago-idropper: the pitch's feasibility slides (docs/source), the AGO's
 * 396-object campaign list (DRMC Master Checklist) and the technical feasibility report.
 *  beat 0  the pages settle, each group labelled
 *  beat 1  "The brief, plus a PDF of the new artworks"
 */
type Page = { img: string; x: number; y: number; w: number; h: number; rot: number; at: number };
const PAGES: Page[] = [
  { img: 'pitch-4', x: 140, y: 290, w: 800, h: 450, rot: -2.2, at: 0 },
  { img: 'pitch-3', x: 160, y: 304, w: 800, h: 450, rot: 1.2, at: 0.08 },
  { img: 'pitch-2', x: 180, y: 318, w: 800, h: 450, rot: -0.8, at: 0.16 },
  { img: 'pitch-1', x: 200, y: 332, w: 800, h: 450, rot: 0.6, at: 0.24 },
  { img: 'objects-03', x: 1030, y: 290, w: 340, h: 440, rot: 2.4, at: 0.2 },
  { img: 'objects-02', x: 1048, y: 304, w: 340, h: 440, rot: -1.6, at: 0.28 },
  { img: 'objects-01', x: 1066, y: 318, w: 340, h: 440, rot: 0.5, at: 0.36 },
  { img: 'report-02', x: 1424, y: 290, w: 334, h: 432, rot: -2, at: 0.32 },
  { img: 'report-01', x: 1440, y: 306, w: 334, h: 432, rot: 0.9, at: 0.4 },
];
const GROUPS = [
  { x: 140, y: 290, text: 'The pitch · feasibility slides', at: 0.5 },
  { x: 1030, y: 290, text: 'New artworks · 396 objects', at: 0.58 },
  { x: 1424, y: 290, text: 'Feasibility report', at: 0.66 },
];

function S3AgoBrief({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.ab-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
    stripIn(tl, root.current!);

    const T = 0.25;
    q('.ab-page').forEach((el, i) => {
      const p = PAGES[i];
      tl.fromTo(el, { y: 56, rotation: p.rot + 4, scale: 1.05 }, { y: 0, rotation: p.rot, scale: 1, duration: 0.6, ease: 'zak.out' }, T + p.at);
      tl.from(el, { opacity: 0, duration: 0.21, ease: 'none' }, T + p.at);
    });
    q('.ab-group').forEach((el, i) => tl.from(el, { opacity: 0, y: 10, duration: 0.4, ease: 'zak.out' }, T + GROUPS[i].at));

    tl.addLabel('b1');
    tl.to(q('.ab-page, .ab-group'), { opacity: 0.32, duration: 0.6, ease: 'power2.out' }, 'b1');
    tl.fromTo(q('.ab-band'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'zak.out' }, 'b1+=0.15');
  });

  return (
    <div ref={root} className="ago-step">
      <div className="ab-kicker ago-kicker p34-kicker label"><i /><b>AGO pitch</b> · 01 The brief</div>
      {PAGES.map((p) => (
        <div key={p.img} className="ab-page" style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
          <img src={media(`ago/brief/${p.img}.webp`)} alt="" draggable={false} />
        </div>
      ))}
      {GROUPS.map((g) => (
        <div key={g.text} className="ab-group" style={{ left: g.x, top: g.y - 50 }}><Chip size={20}>{g.text}</Chip></div>
      ))}
      <div className="ab-band"><Chip size={40}>The brief, plus a PDF of the new artworks</Chip></div>
      <StepStrip steps={AGO_STEPS} active={0} />
    </div>
  );
}

export default defineSlide({
  id: 's3-ago-brief',
  section: 3,
  title: 'AGO · 01 The brief',
  steps: 1,
  transition: 'fade',
  notes:
    'The brief: the pitch, the AGO\'s list of 396 new artworks for the campaign, and our feasibility report.\n' +
    'Click: the brief, plus a PDF of the new artworks.',
  Component: S3AgoBrief,
});
