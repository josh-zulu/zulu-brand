import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { Chip, MawStep, f, mawMedia, stepIntro, usePush } from './shared';
import './S4Maw1Inputs.css';

/**
 * Make-A-Wish 01 · The inputs (ported from maw-video/src/scenes/Inputs.tsx).
 *  beat 0  everything the team had lands on the table: transcript, narrative, brief deck, toolkit, footage
 *  beat 1  "Everything the team had, handed to Claude"
 */
type Card = { x: number; y: number; w: number; h?: number; rot: number; from?: number; at: number; img?: string; doc?: 'transcript' | 'narrative' };
const CARDS: Card[] = [
  { doc: 'transcript', x: 100, y: 170, w: 500, rot: -1.2, from: -5, at: 0 },
  { doc: 'narrative', x: 660, y: 170, w: 600, rot: 0.8, at: 3 },
  { img: 'deck-17.jpg', x: 1320, y: 170, w: 440, h: 248, rot: -3, at: 6 },
  { img: 'deck-02.jpg', x: 1344, y: 192, w: 440, h: 248, rot: 1.5, at: 8 },
  { img: 'deck-10.jpg', x: 1368, y: 214, w: 440, h: 248, rot: -0.6, at: 10 },
  { img: 'toolkit-10.jpg', x: 1320, y: 560, w: 440, h: 248, rot: 2.4, at: 9 },
  { img: 'toolkit-06.jpg', x: 1344, y: 582, w: 440, h: 248, rot: -1.8, at: 11 },
  { img: 'toolkit-01.jpg', x: 1368, y: 604, w: 440, h: 248, rot: 0.5, at: 13 },
  { img: 's-01_lf0011_curtain-trex-reveal.jpg', x: 660, y: 560, w: 290, h: 163, rot: -1.4, at: 12 },
  { img: 's-03_lf0025_rex-into-mri.jpg', x: 962, y: 566, w: 290, h: 163, rot: 1.1, at: 13 },
  { img: 's-06_0055_wish-skydive.jpg', x: 664, y: 738, w: 290, h: 163, rot: 0.9, at: 14 },
  { img: 's-10_0010_lenna-princess-tea-party.jpg', x: 966, y: 742, w: 290, h: 163, rot: -0.7, at: 15 },
];
const GROUPS = [
  { x: 100, y: 170, text: 'Meeting transcript', at: 12 },
  { x: 660, y: 170, text: 'Narrative copy', at: 14 },
  { x: 1320, y: 170, text: 'Case video brief', at: 16 },
  { x: 660, y: 560, text: 'Footage', at: 18 },
  { x: 1320, y: 560, text: 'Brand toolkit', at: 20 },
];
const SPEAKERS = [
  { who: 'Web lead · 00:02', bars: [92, 78, 40] },
  { who: 'Creative · 00:41', bars: [86, 64] },
  { who: 'Producer · 01:15', bars: [95, 88, 52] },
  { who: 'Web lead · 02:03', bars: [70, 45] },
  { who: 'Strategy · 02:48', bars: [90, 82, 60] },
  { who: 'Creative · 03:30', bars: [84, 36] },
];

function Doc({ kind }: { kind: 'transcript' | 'narrative' }): ReactNode {
  if (kind === 'transcript') {
    return (
      <div className="mi-transcript">
        <div className="mi-doc-title">Meeting transcript · 2026-10-30</div>
        <div className="mi-doc-sub">Fast Company case video planning</div>
        <div className="mi-rule" />
        {SPEAKERS.map((s) => (
          <div key={s.who} className="mi-speaker">
            <div className="mi-who">{s.who}</div>
            {s.bars.map((b, j) => <div key={j} className="mi-bar" style={{ width: `${b}%` }} />)}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mi-narrative">
      <p className="mi-stat">Every year 1.25 million children are diagnosed with a critical illness.</p>
      <p className="mi-quote">“It’s not good enough to just treat the disease, you really have to treat the whole child.”</p>
      <div className="mi-cite">Dr. Jeremy Friedman</div>
    </div>
  );
}

function S4Maw1Inputs({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  usePush(root);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    stepIntro(tl, root.current!);

    // beat 0: Remotion <Settle>, 18 frames each, staggered by frame offset from T
    const T = 0.25;
    q('.mi-card').forEach((el, i) => {
      const c = CARDS[i];
      const at = T + f(c.at);
      tl.fromTo(el, { y: 56, rotation: c.rot + (c.from ?? 4), scale: 1.05 }, { y: 0, rotation: c.rot, scale: 1, duration: f(18), ease: 'zak.out' }, at);
      tl.from(el, { opacity: 0, duration: f(18) * 0.35, ease: 'none' }, at);
    });
    q('.mi-group').forEach((el, i) => {
      tl.from(el, { opacity: 0, y: 10, duration: f(12), ease: 'zak.out' }, T + f(GROUPS[i].at));
    });

    // beat 1: all of it, handed over
    tl.addLabel('b1');
    tl.to(q('.mi-card, .mi-group'), { opacity: 0.32, duration: 0.6, ease: 'power2.out' }, 'b1');
    tl.fromTo(q('.mi-band'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'zak.out' }, 'b1+=0.15');
  });

  return (
    <div ref={root}>
      <MawStep index={0} title="The inputs">
        {CARDS.map((c, i) => (
          <div key={i} className="mi-card" style={{ left: c.x, top: c.y, width: c.w, height: c.h }}>
            {c.doc ? <Doc kind={c.doc} /> : <img src={mawMedia(c.img!)} alt="" draggable={false} />}
          </div>
        ))}
        {GROUPS.map((g) => (
          <div key={g.text} className="mi-group" style={{ left: g.x, top: g.y - 50 }}><Chip size={20}>{g.text}</Chip></div>
        ))}
        <div className="mi-band"><Chip size={40}>Everything the team had, handed to Claude</Chip></div>
      </MawStep>
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-inputs',
  section: 4,
  title: 'Make-A-Wish · 01 The inputs',
  steps: 1,
  transition: 'fade',
  notes:
    'The inputs: the meeting transcript, the narrative copy, the case video brief, the footage and the brand toolkit.\n' +
    'Click: everything the team had, handed to Claude.',
  Component: S4Maw1Inputs,
});
