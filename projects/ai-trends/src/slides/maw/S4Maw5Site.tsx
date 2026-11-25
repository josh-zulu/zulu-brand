import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import { BrowserWindow, Chip, MawStrip, Recording, f } from './shared';
import { ANIMATIC_WIN } from './S4Maw4Animatic';
import './S4Maw5Site.css';

/**
 * Make-A-Wish 05 · The site (ported from the Site scene in Browser.tsx and EndCard.tsx).
 *  beat 0  the window starts where the animatic's was and grows to full bleed: the real site, scrolling
 *  beat 1  it pulls back into a panel: "Meeting notes in. A scrolling site out."
 * Slide coordinates here (no scene scaling), so the start rect is the animatic window run through .mws-scene's transform.
 */
const S = 0.953, OX = 44.7, OY = 62;
const A = ANIMATIC_WIN;
const START = { left: OX + A.x * S, top: OY + A.y * S, width: A.w * S, height: (A.chrome + (A.w * 9) / 16) * S, borderRadius: 12 };
const FULL = { left: 0, top: -A.chrome, width: 1920, height: 1080 + A.chrome, borderRadius: 0 };
const PANEL = { left: 1180, top: 190, width: 600, height: 700, borderRadius: 12 };

function S4Maw5Site({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);

    // beat 0: one window growing out of the animatic
    tl.fromTo(q('.mx-win'), START, { ...FULL, duration: f(20), ease: 'power3.inOut' }, f(24));
    tl.to(q('.mx-kicker, .mws-strip'), { opacity: 0, duration: f(10), ease: 'power2.in' }, f(16));

    // beat 1: end card
    tl.addLabel('b1');
    tl.to(q('.mx-win'), { ...PANEL, duration: 0.9, ease: 'power3.inOut' }, 'b1');
    revealLines(tl, q('.mx-head')[0], { stagger: 0.12 }, 'b1+=0.4');
    tl.from(q('.mx-sub'), { opacity: 0, y: 20, duration: f(16), ease: 'zak.out' }, `b1+=${0.4 + f(8)}`);
    tl.from(q('.mx-chip'), { opacity: 0, y: 16, duration: f(16), ease: 'zak.out' }, `b1+=${0.4 + f(12)}`);
  });

  return (
    <div ref={root} className="mx">
      <div className="mx-kicker mws-kicker p34-kicker label"><i /><b>Make-A-Wish</b> · 05 The site</div>
      <BrowserWindow className="mx-win" url="wishes-are-medicine / site" style={START}>
        <Recording src="site-cut.mp4" mode={mode} still={6} />
      </BrowserWindow>
      <div className="mx-end">
        <h2 className="mx-head display">Meeting notes in.<br />A scrolling site out.</h2>
        <p className="mx-sub">Make-A-Wish · Wishes Are Medicine</p>
        <div className="mx-chip"><Chip size={28}>Built with Claude</Chip></div>
      </div>
      <MawStrip active={4} />
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-site',
  section: 4,
  title: 'Make-A-Wish · 05 The site',
  steps: 1,
  chrome: false,
  transition: 'fade',
  notes:
    'The site, built from the animatic. Let it scroll.\n' +
    'Click: meeting notes in, a scrolling site out. Make-A-Wish, Wishes Are Medicine. Built with Claude.',
  Component: S4Maw5Site,
});
