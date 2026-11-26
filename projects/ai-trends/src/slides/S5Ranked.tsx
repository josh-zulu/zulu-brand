import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import './S5Ranked.css';

/**
 * What's next, ranked. The index for the five trend slides that follow.
 *  beat 0  five trends arrive unranked (shuffled, no numbers) under a horizon scale: Now · Next year · In 2 years · Watch.
 *  beat 1  the list ranks itself: rows slide into order, the numbers roll and settle on 01–05, and each trend's
 *          horizon tag travels out along the scale from "now" to where it lands. The further right, the further away.
 * Horizons are shared with the kicker on each trend slide ("Trend 01 · Now" …).
 */
const TRENDS = [
  { name: 'Brand agents', why: 'Agents keep the brand consistent. We make the work different.', when: 'Now', at: 0.5 },
  { name: 'Agents that build hardware', why: 'Agents write the firmware, so we can prototype physical work fast.', when: 'Next year', at: 1.4 },
  { name: 'Worlds from a photo', why: 'One photo becomes a 3D world we can explore and film.', when: 'Next year', at: 1.6 },
  { name: 'Video you can step inside', why: 'Move the camera around a moment after it’s been filmed.', when: 'In 2 years', at: 2.5 },
  { name: 'Made as you watch', why: 'Video and worlds generated in real time, from a sentence.', when: 'Watch', at: 3.5 },
] as const;

const COLS = ['Now', 'Next year', 'In 2 years', 'Watch'];
const SCALE = { x: 1080, w: 700 };
const COL_W = SCALE.w / COLS.length;
const ROW0 = 438;
const ROW_H = 98;
const LEFT = 140;
/** Where each trend (by rank) sits before it's ranked. */
const SHUFFLE = [2, 4, 0, 3, 1];
const STRIP = ['··', '01', '02', '03', '04', '05'];

function Ranked({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const rows = q('.rk-row');

    // ── beat 0: the trends, unranked, under the scale ─────────
    revealLines(tl, q('.rk-head')[0], {}, 0);
    revealWords(tl, q('.rk-lede')[0], {}, 0.35);
    tl.fromTo(q('.rk-rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0.3);
    tl.fromTo(q('.rk-guide'), { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: 'power3.inOut', stagger: 0.06 }, 0.6);
    tl.from(q('.rk-band'), { opacity: 0, duration: 1 }, 1.0);
    tl.from(q('.rk-th'), { opacity: 0, y: 8, duration: 0.7, stagger: 0.05 }, 0.6);
    rows.forEach((r, i) => {
      // sit in the shuffled slot until the ranking beat
      tl.fromTo(r, { y: (SHUFFLE[i] - i) * ROW_H, opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.7 + SHUFFLE[i] * 0.08);
    });
    tl.addLabel('b1');

    // ── beat 1: the list ranks itself ─────────────────────────
    rows.forEach((r, i) => {
      const moves = SHUFFLE[i] !== i;
      tl.to(r, { y: 0, duration: 1.1, ease: 'power3.inOut' }, 'b1');
      if (moves) tl.to(r, { keyframes: { opacity: [1, 0.45, 1] }, duration: 1.1, ease: 'none' }, 'b1');
      tl.fromTo(r.querySelector('.rk-strip'), { yPercent: 0 }, { yPercent: (-100 * (i + 1)) / STRIP.length, duration: 0.9 + i * 0.12, ease: 'power3.out' }, 'b1+=0.7');
      const at = `b1+=${1.2 + i * 0.14}`;
      const dist = TRENDS[i].at * COL_W;
      tl.fromTo(r.querySelector('.rk-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.5 + dist / 900, ease: 'power3.out' }, at);
      tl.fromTo(r.querySelector('.rk-mark'), { x: -dist, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 + dist / 900, ease: 'power3.out' }, at);
    });
  });

  return (
    <div ref={root} className="rk">
      <h2 className="rk-head headline">What’s next, ranked.</h2>
      <p className="rk-lede lede">By how soon each one changes our work.</p>

      <span className="rk-th label" style={{ left: LEFT }}>Rank</span>
      <span className="rk-th label" style={{ left: LEFT + 150 }}>Trend</span>
      {COLS.map((c, i) => (
        <span key={c} className={`rk-th label is-col ${i === 0 ? 'is-now' : ''}`} style={{ left: SCALE.x + COL_W * (i + 0.5) }}>{c}</span>
      ))}
      <i className="rk-band" style={{ left: SCALE.x, width: COL_W }} />
      {COLS.map((c, i) => <i key={c} className="rk-guide" style={{ left: SCALE.x + COL_W * i }} />)}
      <i className="rk-guide" style={{ left: SCALE.x + SCALE.w }} />
      <i className="rk-rule" />

      {TRENDS.map((t, i) => {
        const kind = t.when === 'Now' ? 'is-now' : t.when === 'Watch' ? 'is-watch' : '';
        return (
          <div key={t.name} className="rk-row" style={{ top: ROW0 + i * ROW_H }}>
            <div className="rk-num display">
              <div className="rk-strip">{STRIP.map((s, k) => <span key={k} className={k === 0 ? 'is-blank' : ''}>{s}</span>)}</div>
            </div>
            <div className="rk-t">
              <span className="rk-name">{t.name}</span>
              <span className="rk-why">{t.why}</span>
            </div>
            <i className={`rk-line ${kind}`} style={{ left: SCALE.x - LEFT, width: t.at * COL_W }} />
            <span className="rk-mark" style={{ left: SCALE.x - LEFT + t.at * COL_W }}>
              <span className={`rk-pill label ${kind}`}>{t.when}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default defineSlide({
  id: 's5-ranked',
  section: 4,
  title: 'What’s next, ranked',
  steps: 1,
  notes:
    'Five things we think are coming, and we have ranked them by how soon each one changes our work. The next five slides take them in this order.\n' +
    'Click: the list sorts itself. Number one, brand agents, is here now. Agents that build hardware and worlds from a photo, within the next year. Video you can step inside, about two years out. Made as you watch is the one to watch: impressive, not ready for client work yet.\n' +
    'The further right the tag, the further away it is.',
  Component: Ranked,
});
