import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { StepStrip } from '../shared34/StepStrip';
import { BrowserWindow, MAW_STEPS, Recording, f } from './shared';
import { ANIMATIC_WIN } from './S4Maw4Animatic';
import './S4Maw5Site.css';

/**
 * Make-A-Wish 05 · The site (ported from the Site scene in maw-video/src/scenes/Browser.tsx).
 *  beat 0  the window starts where the animatic's was and grows to full bleed: the real site, scrolling
 * Slide coordinates here (no scene scaling), so the start rect is the animatic window run through .mws-scene's transform.
 */
const S = 0.953, OX = 44.7, OY = 62;
const A = ANIMATIC_WIN;
const START = { left: OX + A.x * S, top: OY + A.y * S, width: A.w * S, height: (A.chrome + (A.w * 9) / 16) * S, borderRadius: 12 };
const FULL = { left: 0, top: -A.chrome, width: 1920, height: 1080 + A.chrome, borderRadius: 0 };

function S4Maw5Site({ mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, 0, (tl) => {
    const q = gsap.utils.selector(root);
    tl.fromTo(q('.mx-win'), START, { ...FULL, duration: f(20), ease: 'power3.inOut' }, f(24));
    tl.to(q('.mx-kicker, .p34-strip'), { opacity: 0, duration: f(10), ease: 'power2.in' }, f(16));
  });

  return (
    <div ref={root} className="mx">
      <div className="mx-kicker mws-kicker p34-kicker label"><i /><b>Make-A-Wish</b> · 05 The site</div>
      <BrowserWindow className="mx-win" url="wishes-are-medicine / site" style={START}>
        <Recording src="site-cut.mp4" mode={mode} still={6} />
      </BrowserWindow>
      <StepStrip steps={MAW_STEPS} active={4} />
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-site',
  section: 4,
  title: 'Make-A-Wish · 05 The site',
  steps: 0,
  chrome: false,
  transition: 'fade',
  notes: 'The site, built from the animatic. Let it scroll.',
  Component: S4Maw5Site,
});
