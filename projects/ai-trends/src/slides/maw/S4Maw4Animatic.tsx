import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { BrowserWindow, Chip, MawStep, Recording, f, stepIntro, usePush } from './shared';
import { LinkChip } from '../shared34/LinkChip';
import { LINKS } from '@/links';
import './S4Maw4Animatic.css';

/**
 * Make-A-Wish 04 · The animatic (ported from the Animatic scene in maw-video/src/scenes/Browser.tsx).
 *  beat 0  the animatic plays in its window: every scene moving before a line of the site was built
 * ANIMATIC_WIN is shared with the site slide, whose window starts exactly here and grows to full bleed.
 */
export const ANIMATIC_WIN = { x: 380, y: 130, w: 1160, chrome: 44 };
const CONTENT_H = (ANIMATIC_WIN.w * 9) / 16;

function S4Maw4Animatic({ mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  usePush(root, 1.03, 8);

  useBeats(root, 0, (tl) => {
    const q = gsap.utils.selector(root);
    stepIntro(tl, root.current!);
    tl.fromTo(q('.ma-win'), { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: f(18), ease: 'zak.out' }, 0);
    tl.from(q('.ma-chip'), { opacity: 0, y: 10, duration: f(14), ease: 'zak.out' }, f(14));
    tl.from(q('.ma-caption'), { opacity: 0, y: 16, duration: f(16), ease: 'zak.out' }, f(10));
    tl.from(q('.ma-link'), { opacity: 0, y: 10, duration: f(14), ease: 'zak.out' }, f(18));
  });

  const W = ANIMATIC_WIN;
  return (
    <div ref={root}>
      <MawStep index={3} title="Animatic">
        <BrowserWindow className="ma-win" url="wishes-are-medicine / animatic" style={{ left: W.x, top: W.y, width: W.w, height: W.chrome + CONTENT_H }}>
          <Recording src="animatic-cut.mp4" mode={mode} still={2} />
        </BrowserWindow>
        <div className="ma-chip" style={{ right: W.x - 24, top: W.y - 26 }}><Chip size={22}>19 scenes · every one moving</Chip></div>
        <div className="ma-caption" style={{ top: W.y + W.chrome + CONTENT_H + 34 }}>A working animatic, before a line of the site was built</div>
        <LinkChip className="ma-link" href={LINKS.mawAnimatic} label="Open the animatic" style={{ position: 'absolute', left: W.x - 24, top: W.y - 26 }} />
      </MawStep>
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-animatic',
  section: 4,
  title: 'Make-A-Wish · 04 Animatic',
  steps: 0,
  transition: 'fade',
  notes: 'The animatic: 19 scenes, every one moving. A working animatic, before a line of the site was built.',
  Component: S4Maw4Animatic,
});
