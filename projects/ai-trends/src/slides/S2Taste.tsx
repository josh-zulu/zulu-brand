import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import { SeaGrid, seaBlockRect } from './S2Sameness';
import './S2Sameness.css';
import './S2Taste.css';

/**
 * Slide 15 · Taste is the difference.
 *  beat 0  arrives on slide 14's last frame (same sea, same tiles, same positions; slide 14's headline
 *          cross-fades away). The sea closes down into the left panel: "Default AI". Headline + lede rise.
 *  beat 1  the right panel wipes in with the same brief made with our standards: "With Impeccable".
 *
 * Brief (both sides): launch ad for Alder, a sparkling spring water. Left = default AI's output, right = a
 * real art-directed layout (HTML type over a stronger generated photograph).
 */

// Panels, in stage px. The left panel is exactly the 5×3 block of the sea, scaled.
const PANEL_Y = 356;
const LEFT_X = 140;
const RIGHT_X = 980;
const PANEL_W = 800;
const BLOCK = seaBlockRect();
const S = PANEL_W / BLOCK.w;
const PANEL_H = BLOCK.h * S;
const R = 12;

function S2Taste({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['taste-wipe'], mode === 'live');
  const dir = useRef(direction);
  dir.current = direction;
  const hero = generatedUrl('taste-impeccable-b') ?? generatedUrl('taste-impeccable-a');

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const sea = q('.sm-sea')[0];
    const clip = q('.ts-sea-clip')[0];

    // Frame 0 = slide 14's last frame (minus its headline).
    gsap.set(sea, { transformOrigin: '0 0', x: 0, y: 0, scale: 1 });
    gsap.set(clip, { clipPath: 'inset(0px 0px 0px 0px round 0px)' });

    // ── beat 0: the sea closes down into "Default AI" ───────
    const at = 0.5; // let slide 14 finish cross-fading first
    const bottom = 1080 - PANEL_Y - PANEL_H;
    tl.to(clip, { clipPath: `inset(${PANEL_Y}px ${1920 - LEFT_X - PANEL_W}px ${bottom}px ${LEFT_X}px round ${R}px)`, duration: 1.4, ease: 'power3.inOut' }, at);
    tl.to(sea, { x: LEFT_X - S * BLOCK.x, y: PANEL_Y - S * BLOCK.y, scale: S, duration: 1.4, ease: 'power3.inOut' }, at);
    tl.to(q('.sm-scrim'), { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, at);
    revealLines(tl, q('.ts-head')[0], {}, at + 0.55);
    revealWords(tl, q('.ts-lede')[0], { stagger: 0.02 }, at + 0.85);
    tl.from(q('.ts-label-l'), { opacity: 0, y: 10, duration: 0.7 }, at + 1.15);
    tl.from(q('.ts-well'), { opacity: 0, duration: 0.9, ease: 'power2.out' }, at + 1.1);
    tl.addLabel('b1');

    // ── beat 1: the right side wipes in ─────────────────────
    tl.call(() => { if (dir.current > 0) sfx.play('taste-wipe'); }, undefined, 'b1+=0.02');
    tl.fromTo(q('.ts-imp'), { clipPath: `inset(0px 100% 0px 0px round ${R}px)` }, { clipPath: `inset(0px 0% 0px 0px round ${R}px)`, duration: 1.25, ease: 'expo.inOut' }, 'b1');
    tl.set(q('.ts-edge'), { opacity: 1 }, 'b1+=0.02');
    tl.fromTo(q('.ts-edge'), { x: 0 }, { x: PANEL_W, duration: 1.25, ease: 'expo.inOut' }, 'b1+=0.02');
    tl.to(q('.ts-edge'), { opacity: 0, duration: 0.3 }, 'b1+=1.1');
    tl.fromTo(q('.ts-imp-photo'), { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 'b1');
    tl.from(q('.ts-ad-in'), { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out', stagger: 0.09 }, 'b1+=0.8');
    tl.from(q('.ts-label-r'), { opacity: 0, y: 10, duration: 0.7 }, 'b1+=0.6');
    tl.to(clip, { filter: 'saturate(0.6) brightness(0.62)', duration: 1.2, ease: 'power2.inOut' }, 'b1+=0.4');
  });

  const panel = (x: number) => ({ left: x, top: PANEL_Y, width: PANEL_W, height: PANEL_H });

  return (
    <div ref={root} className="taste">
      {/* the sea, carried over from slide 14 */}
      <div className="ts-sea-clip fill">
        <SeaGrid />
      </div>
      <div className="sm-scrim fill" style={{ opacity: 1 }} />

      <h2 className="ts-head headline">Taste is the difference.</h2>
      <p className="ts-lede lede">Same brief, twice. Give AI our standards and it stops looking like AI.</p>

      <div className="ts-label ts-label-l label" style={{ left: LEFT_X, width: PANEL_W }}><i />Default AI</div>
      <div className="ts-label ts-label-r label" style={{ left: RIGHT_X, width: PANEL_W }}><i />With Impeccable</div>

      <div className="ts-well" style={panel(RIGHT_X)} />

      {/* the same brief, art-directed: real type over a stronger photograph */}
      <div className="ts-imp" style={panel(RIGHT_X)}>
        {hero ? <img className="ts-imp-photo" src={hero} alt="" draggable={false} /> : <div className="ts-imp-photo ts-imp-fallback" />}
        <div className="ts-imp-shade" />
        <div className="ts-ad">
          <div className="ts-ad-top">
            <span className="ts-ad-mark ts-ad-in">Alder</span>
            <span className="ts-ad-kind ts-ad-in">Sparkling spring water</span>
          </div>
          <div className="ts-ad-bottom">
            <h3 className="ts-ad-head ts-ad-in">Forty years<br />in the rock.</h3>
            <p className="ts-ad-sub ts-ad-in">Spring water that rises cold through Canadian Shield granite. We only add the bubbles.</p>
            <div className="ts-ad-meta ts-ad-in"><span>355 mL</span><span>No. 01</span><span>Muskoka, ON</span></div>
          </div>
        </div>
      </div>
      <div className="ts-edge" style={{ left: RIGHT_X, top: PANEL_Y, height: PANEL_H }} />
    </div>
  );
}

export default defineSlide({
  id: 's2-taste',
  section: 2,
  title: 'Taste is the difference',
  steps: 1,
  notes:
    'Second echo of the human line. The machine does the work, and people decide what\'s good. Brand systems and our own skills are how our taste gets into the tool.\n' +
    'Both sides are the same brief: a launch ad for a sparkling spring water. Left is what default AI gives everyone. Click: right is the same brief with our standards loaded (Impeccable, a design skill pack for AI agents).',
  Component: S2Taste,
});
