import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import './S4Watching.css';

/**
 * What we're paying attention to at Zulu: the index for the five slides that follow, in the order they run.
 * One idea: the watch list fills in. Each row's hairline draws across, its dot lights (signal: we're watching it)
 * and the line rises in. No ranking and no timeline, just what's on our radar.
 *  beat 0  kicker and headline; the five rows land one after another
 * Descriptions are the existing lines from each slide (Kyle and Hiep's copy).
 */
const ITEMS = [
  { name: 'Brand agents', why: 'Agents keep the brand consistent. We make the work different.' },
  { name: 'Blockout to film', why: 'We block out the shot in Blender. AI renders the final look.' },
  { name: 'Agents that build hardware', why: 'Agents write the firmware, so we can prototype physical work fast.' },
  { name: 'Worlds from a photo', why: 'One photo becomes a 3D world we can explore and film.' },
  { name: 'Made as you watch', why: 'MiniMax H3: real-time video you steer while it plays.' },
] as const;

function Watching({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.wa-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.wa-head')[0], {}, 0.05);
    q('.wa-row').forEach((row, i) => {
      const at = 0.55 + i * 0.16;
      tl.fromTo(row.querySelector('.wa-rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'expo.inOut' }, at);
      tl.from(row.querySelector('.wa-dot'), { scale: 0, duration: 0.5, ease: 'back.out(3)' }, at + 0.35);
      tl.from(row.querySelectorAll('.wa-name, .wa-why'), { opacity: 0, y: 18, duration: 0.8, ease: 'zak.out', stagger: 0.07 }, at + 0.3);
    });
  });

  return (
    <div ref={root} className="wa">
      <div className="wa-text">
        <div className="wa-kicker label"><i />On our radar</div>
        <h2 className="wa-head headline">What we’re paying attention to at Zulu.</h2>
      </div>
      <ol className="wa-list">
        {ITEMS.map((it) => (
          <li key={it.name} className="wa-row">
            <i className="wa-rule" />
            <span className="wa-dot" />
            <span className="wa-name">{it.name}</span>
            <span className="wa-why">{it.why}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default defineSlide({
  id: 's4-watching',
  section: 4,
  title: 'What we’re paying attention to at Zulu',
  steps: 0,
  notes:
    'Here’s what we’re paying attention to at Zulu. Five things, and the next five slides take them in this order.\n' +
    'Brand agents. Blockout to film. Agents that build hardware. Worlds from a photo. And made as you watch.',
  Component: Watching,
});
