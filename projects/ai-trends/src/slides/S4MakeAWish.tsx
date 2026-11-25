import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, rng } from '@/lib/motion';
import { ProcessRail, railLight, type RailStep } from './shared34/ProcessRail';
import { ClipOrStill } from './shared34/ClipOrStill';
import shotsUrl from './shared34/media/maw-shots.jpg';
import './S4MakeAWish.css';

/**
 * Source slide 26. One motion idea: one frame travels the whole process while the rail lights step by step.
 *  b1 The inputs    the raw footage comes up
 *  b2 Clip library  the footage breaks into 84 shots (real frames of the film) that sort themselves by scene
 *  b3 Figma         the shots clear and a wireframe draws itself
 *  b4 Animatic      the film plays inside the wireframe, a playhead runs
 *  b5 The site      the frame becomes the finished site (source image29)
 * maw-shots.jpg is a 12×7 contact sheet cut from source/image36.mp4 (ffmpeg, 84 frames).
 */
const STEPS: RailStep[] = [
  { icon: 'source/image19.png', title: 'The inputs', sub: 'Transcript, brief, brand, footage' },
  { icon: 'source/image10.png', title: 'Clip library', sub: '84 shots, sorted by scene' },
  { icon: 'source/image27.png', title: 'Figma', sub: 'Wireframe and scene options' },
  { icon: 'source/image6.png', title: 'Animatic', sub: 'Every scene in motion' },
  { icon: 'source/image16.png', title: 'The site', sub: 'Built from the animatic' },
];

// frame and shot-grid geometry
const FW = 760, FH = 428, SITE_H = 454;
const COLS = 12, ROWS = 7, G = 3;
const TW = (FW - (COLS - 1) * G) / COLS, TH = (FH - (ROWS - 1) * G) / ROWS;
const SPR = { w: 2304, h: 756, tw: 192, th: 108 };
const S = Math.max(TW / SPR.tw, TH / SPR.th);
const cell = (k: number) => ({ x: (k % COLS) * (TW + G), y: Math.floor(k / COLS) * (TH + G) });

function S4MakeAWish({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const shuffled = useMemo(() => {
    const r = rng(84);
    const a = Array.from({ length: COLS * ROWS }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, []);

  useBeats(root, step, (tl) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const shots = q('.mw-shot');
    shots.forEach((s, i) => gsap.set(s, { ...cell(shuffled[i]), opacity: 0, scale: 0.6 }));
    gsap.set(q('.mw-film'), { filter: 'brightness(0.4) saturate(0.6)' });

    // beat 0
    revealLines(tl, q('.mw-title')[0], {}, 0);
    revealWords(tl, q('.mw-lede')[0], {}, 0.45);
    tl.from(q('.mw-frame'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.25);
    tl.from(q('.p34-rail-track'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, ease: 'expo.inOut' }, 0.5);
    tl.from(q('.p34-step'), { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.6);

    // b1 the inputs
    tl.addLabel('b1');
    let lit = railLight(tl, el, 0);
    tl.to(q('.mw-film'), { filter: 'brightness(1) saturate(1)', duration: 1, ease: 'power2.out' }, lit - 0.6);

    // b2 clip library: 84 shots, shuffled, then sorted by scene
    tl.addLabel('b2');
    lit = railLight(tl, el, 1);
    const s2 = lit - 0.7;
    tl.to(q('.mw-film'), { opacity: 0, duration: 0.6 }, s2 + 0.2);
    tl.to(shots, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: { each: 0.006, from: 'random' } }, s2);
    shots.forEach((s, i) => tl.to(s, { ...cell(i), duration: 1.1, ease: 'power3.inOut' }, s2 + 0.85 + (i % COLS) * 0.012 + Math.floor(i / COLS) * 0.03));

    // b3 figma: the wireframe draws itself
    tl.addLabel('b3');
    lit = railLight(tl, el, 2);
    const s3 = lit - 0.7;
    tl.to(shots, { opacity: 0, scale: 0.85, duration: 0.5, stagger: { each: 0.003, from: 'end' } }, s3);
    tl.to(q('.mw-canvas'), { opacity: 1, duration: 0.5 }, s3 + 0.2);
    tl.fromTo(q('.mw-wire *'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut', stagger: 0.05 }, s3 + 0.35);

    // b4 animatic: the film runs inside the wireframe
    tl.addLabel('b4');
    lit = railLight(tl, el, 3);
    const s4 = lit - 0.7;
    tl.to(q('.mw-canvas'), { backgroundColor: 'rgba(11,11,11,0)', duration: 0.6 }, s4);
    tl.to(q('.mw-film'), { opacity: 1, filter: 'brightness(0.75) saturate(0.9)', duration: 0.8 }, s4);
    tl.to(q('.mw-wire'), { opacity: 0.55, duration: 0.6 }, s4);
    tl.to(q('.mw-scrub'), { opacity: 1, duration: 0.4 }, s4 + 0.2);
    tl.fromTo(q('.mw-head'), { left: '0%' }, { left: '100%', duration: 2.6, ease: 'none' }, s4 + 0.3);

    // b5 the site
    tl.addLabel('b5');
    lit = railLight(tl, el, 4);
    const s5 = lit - 0.7;
    tl.to(q('.mw-frame'), { height: SITE_H, y: -(SITE_H - FH) / 2, duration: 0.9, ease: 'power3.inOut' }, s5);
    tl.to(q('.mw-canvas, .mw-scrub'), { opacity: 0, duration: 0.4 }, s5);
    tl.fromTo(q('.mw-site'), { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, s5 + 0.3);
  });

  return (
    <div ref={root} className="make-a-wish">
      <h2 className="mw-title display">Make-A-Wish:<br />Wishes are medicine</h2>
      <p className="mw-lede lede">How we built our Fast Company World Changing Ideas award site with Claude.</p>

      <div className="mw-frame">
        <ClipOrStill className="mw-film" src="source/image36.mp4" mode={mode} hint={false} />
        <div className="mw-shots">
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const col = i % COLS, row = Math.floor(i / COLS);
            return (
              <div
                key={i}
                className="mw-shot"
                style={{
                  width: TW, height: TH, backgroundImage: `url(${shotsUrl})`,
                  backgroundSize: `${SPR.w * S}px ${SPR.h * S}px`,
                  backgroundPosition: `${-(col * SPR.tw * S + (SPR.tw * S - TW) / 2)}px ${-(row * SPR.th * S + (SPR.th * S - TH) / 2)}px`,
                }}
              />
            );
          })}
        </div>
        <div className="mw-canvas">
          <svg className="mw-wire" viewBox={`0 0 ${FW} ${FH}`} width={FW} height={FH} aria-hidden>
            <rect x="26" y="22" width="92" height="22" rx="3" />
            <line x1="520" y1="33" x2="626" y2="33" />
            <line x1="642" y1="33" x2="734" y2="33" />
            <rect x="26" y="92" width="300" height="86" rx="3" />
            <rect x="476" y="92" width="258" height="86" rx="3" />
            <rect x="26" y="226" width="708" height="86" rx="3" />
            <line x1="360" y1="388" x2="400" y2="388" />
          </svg>
        </div>
        <div className="mw-scrub"><span className="mw-ticks" /><span className="mw-head" /></div>
        <div className="mw-site" />
      </div>

      <ProcessRail steps={STEPS} className="mw-rail" />
    </div>
  );
}

export default defineSlide({
  id: 's4-make-a-wish',
  section: 4,
  title: 'Make-A-Wish: Wishes Are Medicine',
  steps: 5,
  notes:
    'Make-A-Wish: Wishes Are Medicine. How we built our Fast Company World Changing Ideas award site with Claude.\n' +
    'Five clicks, one per step: the inputs (transcript, brief, brand, footage) · the clip library (84 shots, sorted by scene) · Figma (wireframe and scene options) · the animatic (every scene in motion) · the site, built from the animatic.\n' +
    'The frame on the right follows along: the footage, the shots sorting themselves, the wireframe, the animatic, then the finished site.',
  Component: S4MakeAWish,
});
