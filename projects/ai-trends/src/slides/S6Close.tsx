import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, typeInto, rng } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { AgentCursor } from '@/components/AgentCursor';
import { HandLine, travellingUnderline, pathLength } from '@/components/HandLine';
import './S6Close.css';

/**
 * 6C · The close. Bookends 1A and 1B.
 *  beat 0  the three beats from 1A replay fast: the line types (talked), bursts into images (made),
 *          the agent sets the poster (does). "It talked. It made. Now it does."
 *  beat 1  everything clears to paper. "The doing is shared. The meaning is ours."
 *          and the hand-drawn line from 1B returns to underline the last sentence.
 */
const LINE = 'Taste the pause.';
const TILE = 118, GAP = 12, GX = 191, GY = 41;
const grid = (i: number) => ({ left: GX + (i % 3) * (TILE + GAP), top: GY + Math.floor(i / 3) * (TILE + GAP), width: TILE, height: TILE });
const SLOTS: Record<number, { left: number; top: number; width: number; height: number }> = {
  0: { left: 150, top: 40, width: 220, height: 270 },
  4: { left: 390, top: 40, width: 220, height: 128 },
  5: { left: 390, top: 182, width: 220, height: 128 },
};

function S6Close({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const l2 = useRef<HTMLHeadingElement>(null);
  const [line, setLine] = useState<{ d: string; approach: number } | null>(null);

  useLayoutEffect(() => {
    const el = root.current, h = l2.current;
    if (!el || !h) return;
    const scale = el.getBoundingClientRect().width / 1920 || 1;
    const rb = el.getBoundingClientRect(), hb = h.getBoundingClientRect();
    const { d, approachD } = travellingUnderline({
      from: { x: -60, y: 980 },
      x1: (hb.left - rb.left) / scale - 6,
      x2: (hb.right - rb.left) / scale,
      y: (hb.bottom - rb.top) / scale + 20,
      seed: 23,
    });
    setLine({ d, approach: pathLength(approachD) / pathLength(d) });
  }, []);

  useBeats(root, step, (tl) => {
    if (!line) return;
    const q = gsap.utils.selector(root);
    const tiles = q('.cl-tile');
    const cursor = q('.agent-cursor')[0];
    const words = q('.cl-beat');
    const r = rng(9);

    gsap.set(tiles, { left: 370, top: 200, width: 16, height: 16, opacity: 0, borderRadius: 999 });
    gsap.set(cursor, { x: 820, y: 520, opacity: 0 });
    gsap.set(q('.cl-paper'), { clipPath: 'circle(0% at 50% 52%)' });

    // ── beat 0 · the replay ───────────────────────────────────
    // talked
    tl.from(q('.cl-bubble'), { opacity: 0, y: 14, scale: 0.94, duration: 0.35, ease: 'back.out(2)' }, 0.2);
    typeInto(tl, q('.cl-bubble-text')[0], LINE, { cps: 34 }, 0.45);
    revealLines(tl, words[0], { duration: 0.7 }, 0.5);
    // made
    tl.to(q('.cl-bubble'), { opacity: 0, scale: 0.85, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, 1.35);
    tiles.forEach((t, i) => tl.to(t, { ...grid(i), opacity: 1, borderRadius: 8, duration: 0.6, ease: 'expo.out' }, 1.45 + Math.abs(i - 4) * 0.035));
    revealLines(tl, words[1], { duration: 0.7 }, 1.5);
    // does
    tl.fromTo(q('.cl-board-rect'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, 2.35);
    tl.to(cursor, { opacity: 1, duration: 0.15 }, 2.35);
    tl.to(cursor, { x: grid(0).left + 70, y: grid(0).top + 60, duration: 0.35, ease: 'power3.inOut' }, 2.35);
    tl.to(tiles.filter((_, i) => !(i in SLOTS)), { opacity: 0, scale: 0.85, duration: 0.3, stagger: 0.02 }, 2.7);
    tiles.forEach((t, i) => { if (SLOTS[i]) tl.to(t, { ...SLOTS[i], borderRadius: 4, duration: 0.5, ease: 'power3.inOut' }, 2.75 + (i === 0 ? 0 : 0.08 * i * 0.25)); });
    tl.to(cursor, { x: SLOTS[0].left + 120, y: SLOTS[0].top + 150, duration: 0.5, ease: 'power3.inOut' }, 2.75);
    tl.from(q('.cl-poster-head'), { opacity: 0, y: 10, duration: 0.4 }, 3.2);
    tl.to(cursor, { x: '+=120', y: '+=140', opacity: 0, duration: 0.45, ease: 'power2.in' }, 3.35);
    revealLines(tl, words[2], { duration: 0.8 }, 2.6);

    // ── beat 1 · everything clears; the human line returns ────
    tl.addLabel('b1', '+=0.2');
    tl.to([q('.cl-mini')[0], q('.cl-beats')[0]], { opacity: 0, filter: 'blur(14px)', scale: 0.97, duration: 0.8, ease: 'power2.in' }, 'b1');
    tl.to(q('.cl-paper'), { clipPath: 'circle(80% at 50% 52%)', duration: 1.3, ease: 'power3.inOut' }, 'b1+=0.45');
    revealLines(tl, q('.cl-l1')[0], { duration: 1.2 }, 'b1+=1.4');
    revealLines(tl, q('.cl-l2')[0], { duration: 1.2 }, 'b1+=2.1');
    const strokes = q('.cl-paper .hand-stroke');
    tl.fromTo(strokes, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.2, ease: 'power1.inOut' }, 'b1+=2.7');
    tl.to(strokes, { drawSVG: `${line.approach * 100}% 100%`, duration: 1.0, ease: 'power2.inOut' }, '+=0.1');
    void r;
  }, [line]);

  return (
    <div ref={root} className="close">
      <div className="cl-mini">
        <svg className="cl-board" width="760" height="460" viewBox="0 0 760 460" fill="none" aria-hidden>
          <rect className="cl-board-rect" x="130" y="20" width="500" height="400" rx="3" stroke="var(--zak-line-strong)" strokeWidth="2" />
        </svg>
        <div className="cl-bubble"><span className="cl-bubble-text" /><span className="caret blink" /></div>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="cl-tile" style={{ backgroundImage: `url(${generatedUrl(`campaign-${i + 1}`) ?? ''})` }} />
        ))}
        <div className="cl-poster-head display">Taste the pause.</div>
        <AgentCursor label="Agent" />
      </div>

      <div className="cl-beats display">
        <span className="cl-beat">It talked.</span>
        <span className="cl-beat">It made.</span>
        <span className="cl-beat cl-beat-now">Now it does.</span>
      </div>

      <div className="cl-paper">
        <h2 className="cl-l1 headline">The doing is shared.</h2>
        <h2 ref={l2} className="cl-l2 headline">The meaning is ours.</h2>
        {line && <HandLine className="cl-line" width={1920} height={1080} d={line.d} stroke={6} seed={23} color="var(--zak-graphite)" />}
        <div className="grain" aria-hidden />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's6-close',
  section: 6,
  title: '6C · The close',
  steps: 1,
  chrome: false,
  notes:
    'Let the replay run: “It talked. It made. Now it does.”\n' +
    'Click. Everything clears. Say the last two lines slowly: “The doing is shared. The meaning is ours.”\n' +
    'Pause on the line. Then go to questions.',
  Component: S6Close,
});
