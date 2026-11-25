import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useBeats } from '@/engine/useBeats';
import type { SlideProps } from '@/engine/types';
import { ClipFrame } from './ClipFrame';

/**
 * Section divider, shared by every section so the deck has one rhythm:
 *   the section number rolls in (digits spin like a counter), a hairline extends, the title wipes in left to right.
 * Background: a looping clip (`video`), a custom animated layer (`background`), or the ink ground.
 * A dark scrim always sits between background and type so any footage works.
 */
export function SectionDivider({
  number, title, kicker, video, background, step, mode, align = 'bottom',
}: SlideProps & {
  number: number; title: ReactNode; kicker?: string; video?: string; background?: ReactNode; align?: 'bottom' | 'center';
}) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.div-bg'), { opacity: 0, scale: 1.08, duration: 2.2, ease: 'power2.out' }, 0);
    // digit roll: the strip translates from a random high digit down to the target
    tl.from(q('.div-digit-strip'), { yPercent: -90, duration: 1.4, ease: 'expo.out' }, 0.15);
    tl.from(q('.div-rule'), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.35);
    tl.from(q('.div-kicker'), { opacity: 0, x: -20, duration: 0.8 }, 0.6);
    tl.fromTo(q('.div-title'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut' }, 0.55);
    tl.from(q('.div-title'), { x: -40, duration: 1.6, ease: 'expo.out' }, 0.55);
  });

  // Digit strip: 9 → 0 then the target, so the roll lands on `number`.
  const strip = [9, 8, 7, 6, 5, 4, 3, 2, 1, number];

  return (
    <div ref={root} className={`section-divider align-${align}`}>
      <div className="div-bg fill">
        {video ? <ClipFrame src={video} mode={mode} className="fill div-video" /> : background}
      </div>
      <div className="div-scrim fill" />
      <div className="div-content">
        <div className="div-number display">
          <span className="div-zero">0</span>
          <span className="div-digit"><span className="div-digit-strip">{strip.map((d, i) => <span key={i}>{d}</span>)}</span></span>
        </div>
        <div className="div-rule" />
        {kicker && <div className="div-kicker label">{kicker}</div>}
        <h1 className="div-title display display-l">{title}</h1>
      </div>
    </div>
  );
}
