import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { typeInto } from '@/lib/motion';
import { BrowserWindow, Chip, MawStep, Recording, Terminal, f, mawMedia, stepIntro, usePush } from './shared';
import './S4Maw3Figma.css';

/**
 * Make-A-Wish 03 · Claude → Figma (ported from maw-video/src/scenes/ClaudeFigma.tsx).
 *  beat 0  the ask: "Build the wireframe in Figma from narrative.md", and the log of it happening
 *  beat 1  the wireframe Claude built in Figma (screen recording)
 *  beat 2  scene options: design directions for every scene, panned top to bottom
 * The window is smaller than Remotion's (1240 vs 1600 wide) so it clears the progress strip.
 */
const CMD = 'Build the wireframe in Figma from narrative.md';
const LINES: [number, string][] = [
  [62, 'Reading content/narrative.md · 15 scenes'],
  [70, 'Connected to Figma · Website Wireframe'],
  [78, 'Building 15 sections at desktop 1440'],
  [86, 'Adding a motion note to every section'],
  [94, 'Done · Wireframe v1'],
];
const WIN = { x: 340, y: 165, w: 1240, chrome: 44 };
const CONTENT_H = (WIN.w * 9) / 16;
const OPTIONS_H = (WIN.w * 3300) / 2650;

function S4Maw3Figma({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  usePush(root, 1.03, 12);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    stepIntro(tl, root.current!);
    gsap.set(q('.mf-win, .mf-chip'), { autoAlpha: 0 });
    gsap.set(q('.mf-options, .mf-chip-b'), { autoAlpha: 0 });

    // beat 0: the prompt
    tl.from(q('.mf-term'), { opacity: 0, y: 24, duration: f(15), ease: 'zak.out' }, 0);
    typeInto(tl, q('.mf-cmd')[0], CMD, { cps: CMD.length / f(46) }, f(8));
    q('.mf-line').forEach((el, i) => tl.from(el, { opacity: 0, y: 8, duration: f(9), ease: 'zak.out' }, f(LINES[i][0])));
    tl.set(q('.mf-caret-cmd'), { visibility: 'hidden' }, f(60));

    // beat 1: the wireframe, in Figma
    tl.addLabel('b1');
    tl.to(q('.mf-term'), { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 'b1');
    tl.fromTo(q('.mf-win'), { autoAlpha: 0, y: 24, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: f(18), ease: 'zak.out' }, 'b1+=0.35');
    tl.fromTo(q('.mf-chip-a'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: f(14), ease: 'zak.out' }, `b1+=${0.35 + f(14)}`);

    // beat 2: scene options, panned top to bottom
    tl.addLabel('b2');
    tl.to(q('.mf-url-a'), { opacity: 0, duration: 0.3 }, 'b2');
    tl.fromTo(q('.mf-url-b'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'b2+=0.2');
    tl.to(q('.mf-chip-a'), { autoAlpha: 0, y: -10, duration: 0.3 }, 'b2');
    tl.to(q('.mf-options'), { autoAlpha: 1, duration: 0.5 }, 'b2+=0.1');
    tl.fromTo(q('.mf-chip-b'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: f(14), ease: 'zak.out' }, 'b2+=0.3');
    tl.fromTo(q('.mf-options img'), { y: 0 }, { y: CONTENT_H - OPTIONS_H, duration: f(200), ease: 'power3.inOut' }, `b2+=${f(10)}`);
  });

  return (
    <div ref={root}>
      <MawStep index={2} title="Figma">
        <Terminal className="mf-term" size={28} style={{ left: 360, top: 320, width: 1200, height: 440 }}>
          <div><span className="mws-prompt">› </span><span className="mf-cmd" /><span className="mws-caret mf-caret-cmd" /></div>
          <div style={{ height: 14 }} />
          {LINES.map(([, line], i) => <div key={line} className={`mws-term-line mf-line ${i === LINES.length - 1 ? 'is-last' : ''}`}>{line}</div>)}
        </Terminal>

        <BrowserWindow
          className="mf-win"
          url={<><span className="mf-url-a">Figma · Wishes Are Medicine — Website Wireframe</span><span className="mf-url-b">Figma · Scene options</span></>}
          style={{ left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.chrome + CONTENT_H }}>
          <Recording src="figma-wireframe.mp4" mode={mode} on={step === 1} still={3} />
          <div className="mf-options"><img src={mawMedia('figma-scene-options.jpg')} alt="" draggable={false} style={{ width: WIN.w, height: OPTIONS_H }} /></div>
        </BrowserWindow>
        <div className="mf-chip mf-chip-a" style={{ right: WIN.x - 24, top: WIN.y - 26 }}><Chip size={22}>Claude's wireframe · 15 sections, a motion note on each</Chip></div>
        <div className="mf-chip mf-chip-b" style={{ right: WIN.x - 24, top: WIN.y - 26 }}><Chip size={22}>Scene options · design directions for every scene</Chip></div>
      </MawStep>
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-figma',
  section: 4,
  title: 'Make-A-Wish · 03 Figma',
  steps: 2,
  transition: 'fade',
  notes:
    'Figma: we asked Claude to build the wireframe in Figma from the narrative, 15 scenes.\n' +
    'Click: the wireframe it built, 15 sections with a motion note on each.\n' +
    'Click: scene options, design directions for every scene.',
  Component: S4Maw3Figma,
});
