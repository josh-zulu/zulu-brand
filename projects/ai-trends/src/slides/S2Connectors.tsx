import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { useSfx } from '@/lib/sfx';
import './S2Connectors.css';

/**
 * Connectors tee-up: the plumbing, and the map of the next four slides.
 * One idea: an AI hub with four empty sockets. Each click plugs in one theme + tool; the connection runs out from
 * the hub into it, the socket lights and a line of what it does there types in. It ends on the four themes in
 * order, which is the index for the tool slides that follow (their headers read "01 · Design · Figma" etc.).
 *  beat 0    kicker, headline, lede; the hub and four dashed sockets
 *  beat 1-4  01 Design · Figma → 02 3D · Blender → 03 Edit assembly · Resolve → 04 Production · Asana + NetSuite
 * Tool names are plain type, no official logos.
 */
type Theme = { num: string; theme: string; tool: string; act: string };
const THEMES: Theme[] = [
  { num: '01', theme: 'Design', tool: 'Figma', act: 'building frames from our components' },
  { num: '02', theme: '3D', tool: 'Blender', act: 'building the scene, lights and camera' },
  { num: '03', theme: 'Edit assembly', tool: 'Resolve', act: 'cutting the selects into a rough cut' },
  { num: '04', theme: 'Production', tool: 'Asana + NetSuite', act: 'setting up tasks, checking budgets' },
];

// Stage geometry (px)
const HUB = { x: 960, y: 560 };
const CHIP = { x: 1190, w: 590, h: 112, gap: 148 };
const rowY = (i: number) => HUB.y + (i - (THEMES.length - 1) / 2) * CHIP.gap;
const PORT_X = CHIP.x - 20;
const wire = (i: number) => {
  const y = rowY(i);
  return `M${HUB.x} ${HUB.y} C ${HUB.x + 150} ${HUB.y}, ${PORT_X - 120} ${y}, ${PORT_X} ${y} L ${CHIP.x} ${y}`;
};

function S2Connectors({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s2-divider-plug'], mode === 'live', 0.45);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const chips = q('.s2c-chip');
    const ghosts = q('.s2c-ghost');
    const lives = q('.s2c-live');
    const pulses = q('.s2c-pulse');
    const ring = q('.s2c-ring')[0];

    gsap.set(chips, { x: 110, opacity: 0, filter: 'blur(10px)' });
    gsap.set(lives, { drawSVG: '0%' });

    // ── beat 0: the setting ────────────────────────────────────
    tl.from(q('.s2c-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.s2c-head')[0], {}, 0.05);
    revealWords(tl, q('.s2c-lede')[0], {}, 0.45);
    tl.from(q('.s2c-bg'), { opacity: 0, duration: 1.8, ease: 'power2.out' }, 0.1);
    tl.from(q('.s2c-hub'), { scale: 0.86, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.3);
    tl.from(q('.s2c-hub-label'), { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.9);
    tl.from(q('.s2c-trace, .s2c-port'), { opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power2.out' }, 0.6);
    tl.from(ghosts, { opacity: 0, x: 24, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0.7);
    tl.addLabel('b1');

    // ── beats 1-4: one theme plugs in per click ────────────────
    THEMES.forEach((t, i) => {
      const L = `b${i + 1}`;
      tl.to(chips[i], { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out' }, L);
      tl.to(ghosts[i], { opacity: 0, duration: 0.3 }, `${L}+=0.35`);
      // the connection runs out from the hub into the tool
      tl.to(lives[i], { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, `${L}+=0.45`);
      tl.set(pulses[i], { opacity: 1 }, `${L}+=0.45`);
      tl.fromTo(pulses[i], { drawSVG: '0% 0%' }, { drawSVG: '86% 100%', duration: 0.6, ease: 'power2.inOut', immediateRender: false }, `${L}+=0.45`);
      tl.to(pulses[i], { opacity: 0, duration: 0.25 }, `${L}+=1.0`);
      // seated: the socket lights
      tl.call(() => { if (dir.current > 0) sfx.play('s2-divider-plug'); }, undefined, `${L}+=1.02`);
      tl.fromTo(q('.s2c-flash')[i], { opacity: 0.9, scale: 0.97 }, { opacity: 0, scale: 1.05, duration: 0.7, ease: 'power2.out', immediateRender: false }, `${L}+=1.02`);
      tl.to(q('.s2c-port-on')[i], { opacity: 1, duration: 0.15 }, `${L}+=1.02`);
      tl.to(q('.s2c-led-on')[i], { opacity: 1, duration: 0.18 }, `${L}+=1.04`);
      tl.to(q('.s2c-num b')[i], { opacity: 1, duration: 0.25 }, `${L}+=1.04`);
      tl.to(ring, { opacity: (i + 1) / THEMES.length, duration: 0.5, ease: 'power2.out' }, `${L}+=1.02`);
      tl.set(q('.s2c-act em')[i], { opacity: 1 }, `${L}+=1.1`);
      typeInto(tl, q('.s2c-act-text')[i], t.act, { cps: 52 }, `${L}+=1.1`);
      if (i < THEMES.length - 1) tl.addLabel(`b${i + 2}`, '+=0.05');
    });
  });

  return (
    <div ref={root} className="s2c">
      <div className="s2c-bg fill" />

      <div className="s2c-text">
        <div className="s2c-kicker label"><i />The plumbing · MCP</div>
        <h2 className="s2c-head headline">Connectors plug AI straight into our tools.</h2>
        <p className="s2c-lede lede">Built on MCP, the Model Context Protocol. AI works inside the tool, in our files, instead of telling us what to click.</p>
      </div>

      <svg className="s2c-wires" viewBox="0 0 1920 1080" aria-hidden>
        {THEMES.map((t, i) => <path key={`t${t.num}`} className="s2c-trace" d={wire(i)} />)}
        {THEMES.map((t, i) => <path key={`l${t.num}`} className="s2c-live" d={wire(i)} />)}
        {THEMES.map((t, i) => <path key={`p${t.num}`} className="s2c-pulse" d={wire(i)} />)}
        {THEMES.map((t, i) => (
          <g key={`o${t.num}`}>
            <circle className="s2c-port" cx={PORT_X} cy={rowY(i)} r="6" />
            <circle className="s2c-port-on" cx={PORT_X} cy={rowY(i)} r="6" />
          </g>
        ))}
      </svg>

      <div className="s2c-hub" style={{ left: HUB.x, top: HUB.y }}>
        <div className="s2c-well" />
        <div className="s2c-ring" />
        <div className="s2c-node"><span>AI</span></div>
        <div className="s2c-hub-label label">MCP</div>
      </div>

      {THEMES.map((t, i) => (
        <div key={t.num} className="s2c-socket" style={{ left: CHIP.x, top: rowY(i) - CHIP.h / 2, width: CHIP.w }}>
          <div className="s2c-ghost"><span>{t.num}</span></div>
          <div className="s2c-flash" />
          <div className="s2c-chip">
            <span className="s2c-num">{t.num}<b>{t.num}</b></span>
            <div className="s2c-body">
              <div className="s2c-title">
                <span className="s2c-theme">{t.theme}</span>
                <span className="s2c-tool label">{t.tool}</span>
              </div>
              <div className="s2c-act"><em style={{ opacity: 0 }}>›</em><span className="s2c-act-text" /></div>
            </div>
            <span className="s2c-led"><i className="s2c-led-on" /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default defineSlide({
  id: 's2-connectors',
  section: 2,
  title: 'Connectors plug AI into our tools',
  steps: 4,
  notes:
    'Before we go tool by tool, how this actually works. Connectors, built on MCP, the Model Context Protocol, plug AI straight into software we already use. It doesn\'t tell us what to click. It opens our file and does the work inside the tool.\n' +
    'Click through the map. These are the next four slides.\n' +
    'Click: 01, Design, in Figma. Click: 02, 3D, in Blender. Click: 03, Edit assembly, in Resolve. Click: 04, Production, in Asana and NetSuite.\n' +
    'Same idea every time: our tools, our files, our standards. We direct, it does the hands-on work.',
  Component: S2Connectors,
});
