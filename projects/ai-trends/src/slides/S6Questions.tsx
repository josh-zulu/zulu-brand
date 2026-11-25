import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { rng } from '@/lib/motion';
import { ZAK_PARTS, pillGeom } from '@/components/ZakMark';
import './S6Questions.css';

/**
 * Questions. The quiet sign-off after the close.
 * The ZAK mark's slots are carved first; then each pill and dot settles into its slot, the way the opener's cursor
 * set the last letter of the title. Then the word, a hairline and the group's name. No loops, nothing else moving.
 */
const S = 0.36;               // mark scale
const BOX = { x: 40, y: 200, w: 1050, h: 620 }; // the mark's crop, same as the chrome logo
const R = 50;

function Questions({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  const parts = useMemo(() => ZAK_PARTS.map((p) => {
    if (p.kind === 'dot') {
      const d = R * 2 * S;
      return { id: p.id, left: (p.cx - BOX.x) * S - d / 2, top: (p.cy - BOX.y) * S - d / 2, w: d, h: d, angle: 0 };
    }
    const g = pillGeom(p);
    return { id: p.id, left: (g.cx - BOX.x) * S - (g.len * S) / 2, top: (g.cy - BOX.y) * S - (g.t * S) / 2, w: g.len * S, h: g.t * S, angle: g.angle };
  }), []);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const r = rng(66);
    const pieces = q('.qs-part');
    tl.from(q('.qs-slot'), { opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.04 }, 0.1);
    pieces.forEach((el, i) => {
      const a = parts[i].angle;
      tl.fromTo(el,
        { opacity: 0, x: (r() - 0.5) * 70, y: -30 - r() * 40, rotation: a + (r() - 0.5) * 18, scale: 1.08 },
        { opacity: 1, x: 0, y: 0, rotation: a, scale: 1, duration: 1.1, ease: 'zak.settle' },
        0.7 + i * 0.09);
    });
    tl.from(q('.qs-title'), { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.3, ease: 'power3.out' }, 1.5);
    tl.from(q('.qs-rule'), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 1.9);
    tl.from(q('.qs-sub'), { opacity: 0, y: 10, duration: 0.9 }, 2.2);
  });

  return (
    <div ref={root} className="qs">
      <div className="qs-wrap">
        <div className="qs-mark" style={{ width: BOX.w * S, height: BOX.h * S }} aria-label="Zulu Alpha Kilo">
          {parts.map((p) => <i key={`s-${p.id}`} className="qs-slot" style={{ left: p.left, top: p.top, width: p.w, height: p.h, transform: `rotate(${p.angle}deg)` }} />)}
          {parts.map((p) => <i key={p.id} className="qs-part" style={{ left: p.left, top: p.top, width: p.w, height: p.h, transform: `rotate(${p.angle}deg)` }} />)}
        </div>
        <h1 className="qs-title display">Questions</h1>
        <div className="qs-rule" />
        <div className="qs-sub label">Zulu AI Working Group</div>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's6-questions',
  section: 6,
  title: 'Questions',
  chrome: false,
  transition: 'fade',
  notes: 'Questions. Leave this up while you take them. Nothing moves after the mark settles.',
  Component: Questions,
});
