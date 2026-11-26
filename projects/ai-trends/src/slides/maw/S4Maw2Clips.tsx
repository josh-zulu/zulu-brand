import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { countUp, typeInto } from '@/lib/motion';
import { Chip, MawStep, Terminal, f, mawMedia, stepIntro, usePush } from './shared';
import './S4Maw2Clips.css';

/**
 * Make-A-Wish 02 · Clip library (ported from maw-video/src/scenes/ClipLibrary.tsx).
 *  beat 0  Claude pulls the library: the command types, the log runs, 24 shots ripple in, the count runs to 84
 *  beat 1  one shot lifts out with its scene name: every clip is findable by name
 */
const STILLS = [
  '01_0105_ward-all-wishes', '01_lf0011_curtain-trex-reveal', '03_0005_rex-mri-scanner', '03_lf0008_rex-bed-looks-up',
  '03_lf0022_parents-hallway', '03_lf0025_rex-into-mri', '04_0022_dr-friedman-interview-b', '04_lf0030_rex-in-mri',
  '04_lf0040_night-trex-beside-bed', '06_0036_wish-mermaid-pool', '06_0040_wish-wheelchair-laughing', '06_0048_wish-bluejays-field',
  '06_0055_wish-skydive', '06_0059_wish-soccer-walkout', '08_0115_wish-prescription-princess', '08_lf0082_rex-writing-wish',
  '10_0010_lenna-princess-tea-party', '10_0118_cooper-luchador', '10_0120_ruthie-unicorn', '10_0154_nori-iv-pole-robot',
  '10_lf0087_museum-trex-wide', '11_0116_alice-selfie', '12_0101_campaign-grid', '15_0159_rex-bedside-end-frame',
];
const HERO = 12;
const GX = 740, GY = 170, TW = (1080 - 5 * 14) / 6, TH = (TW * 9) / 16, PITCH = 143;
const CMD = 'Pull clip library';
const LINES: [number, string][] = [
  [44, 'Reading CS_v8.mp4 · 2:03 rough cut'],
  [56, '45 shots from the cut'],
  [68, '+ 39 longer takes from the 120s master'],
  [80, 'Each one a still and a muted loop'],
  [92, 'Named by scene: 06_0055_wish-skydive'],
];

function S4Maw2Clips({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  usePush(root);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    stepIntro(tl, root.current!);

    // beat 0
    tl.from(q('.mc-term'), { opacity: 0, y: 24, duration: f(15), ease: 'zak.out' }, 0);
    gsap.set(q('.mc-caret-end'), { opacity: 0 });
    typeInto(tl, q('.mc-cmd')[0], CMD, { cps: CMD.length / f(22) }, f(10));
    q('.mc-line').forEach((el, i) => tl.from(el, { opacity: 0, y: 8, duration: f(9), ease: 'zak.out' }, f(LINES[i][0])));
    tl.set(q('.mc-caret-cmd'), { visibility: 'hidden' }, f(40));
    tl.set(q('.mc-caret-end'), { opacity: 1 }, f(104));
    q('.mc-tile').forEach((el, i) => {
      const r = Math.floor(i / 6), c = i % 6;
      tl.from(el, { opacity: 0, y: 14, duration: f(12), ease: 'zak.out' }, f(58 + (r + c) * 2));
      tl.from(el.querySelector('.mc-img'), { scale: 0.94, duration: f(12), ease: 'zak.out' }, f(58 + (r + c) * 2));
    });
    tl.from(q('.mc-counter'), { opacity: 0, y: 16, duration: f(14), ease: 'zak.out' }, f(56));
    countUp(tl, q('.mc-n')[0], 84, { duration: f(92) }, f(58));

    // beat 1: the hero shot lifts, the rest step back
    tl.addLabel('b1');
    const hero = q('.mc-tile')[HERO];
    tl.to(q('.mc-tile').filter((_, i) => i !== HERO), { opacity: 0.28, duration: f(15), ease: 'zak.out' }, 'b1');
    tl.to(hero.querySelector('.mc-img'), { scale: 1.45, y: -8, outlineColor: 'rgba(248,247,244,1)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', duration: f(15), ease: 'zak.out' }, 'b1');
    tl.from(q('.mc-name'), { opacity: 0, y: 10, duration: f(12), ease: 'zak.out' }, `b1+=${f(10)}`);
  });

  const heroTop = GY + 2 * PITCH + 28;
  return (
    <div ref={root}>
      <MawStep index={1} title="Clip library">
        <Terminal className="mc-term" style={{ left: 100, top: GY, width: 580, height: 552 }}>
          <div><span className="mws-prompt">› </span><span className="mc-cmd" /><span className="mws-caret mc-caret-cmd" /></div>
          <div style={{ height: 12 }} />
          {LINES.map(([, line]) => <div key={line} className="mws-term-line mc-line">{line}</div>)}
          <div className="mc-caret-end" style={{ marginTop: 12 }}><span className="mws-prompt">› </span><span className="mws-caret" /></div>
        </Terminal>

        {STILLS.map((name, i) => {
          const r = Math.floor(i / 6), c = i % 6;
          return (
            <div key={name} className={`mc-tile ${i === HERO ? 'is-hero' : ''}`} style={{ left: GX + c * (TW + 14), top: GY + r * PITCH, width: TW }}>
              <div className="mc-scene">{name.slice(0, 2)}</div>
              <div className="mc-img" style={{ width: TW, height: TH }}><img src={mawMedia(`s-${name}.jpg`)} alt="" draggable={false} /></div>
            </div>
          );
        })}

        <div className="mc-counter" style={{ left: GX, top: 742 }}>
          <div className="mc-n display">0</div>
          <div className="mc-count-label">Shots pulled from the films,<br />sorted by scene</div>
        </div>
        <div className="mc-name" style={{ left: GX, top: heroTop + TH * 1.225 + 10 }}><Chip size={20} upper={false}>06_0055_wish-skydive</Chip></div>
      </MawStep>
    </div>
  );
}

export default defineSlide({
  id: 's4-maw-clips',
  section: 4,
  title: 'Make-A-Wish · 02 Clip library',
  steps: 1,
  transition: 'fade',
  notes:
    'Clip library: Claude pulled 84 shots from the films (45 from the cut, 39 longer takes), each a still and a muted loop, sorted by scene.\n' +
    'Click: every shot is named by scene, so we could ask for any of them by name.',
  Component: S4Maw2Clips,
});
