import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import type { SlideProps } from '@/engine/types';

/**
 * The workhorse layout: headline + lede on the left, a media slot on the right (or below).
 * Entry: headline lines rise from a mask, lede words soften in, media slides up.
 * Pass `extend` to add your own beats after the entry (it receives the timeline and a scoped selector).
 */
export function Statement({
  step, headline, lede, media, layout = 'split', kicker, footnote, extend, className = '', children,
}: SlideProps & {
  headline: ReactNode;
  lede?: ReactNode;
  media?: ReactNode;
  layout?: 'split' | 'stack' | 'text';
  kicker?: ReactNode;
  footnote?: ReactNode;
  extend?: (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void;
  className?: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    if (q('.st-kicker')[0]) tl.from(q('.st-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.st-headline')[0], {}, 0.05);
    revealWords(tl, q('.st-lede')[0], {}, 0.45);
    if (q('.st-media')[0]) tl.from(q('.st-media'), { y: 80, opacity: 0, duration: 1.3 }, 0.25);
    if (q('.st-footnote')[0]) tl.from(q('.st-footnote'), { opacity: 0, duration: 0.8 }, 1);
    extend?.(tl, q);
  });

  return (
    <div ref={root} className={`statement layout-${layout} ${className}`}>
      <div className="st-text">
        {kicker && <div className="st-kicker label">{kicker}</div>}
        <h2 className="st-headline headline">{headline}</h2>
        {lede && <p className="st-lede lede">{lede}</p>}
        {footnote && <p className="st-footnote source">{footnote}</p>}
      </div>
      {media && <div className="st-media">{media}</div>}
      {children}
    </div>
  );
}
