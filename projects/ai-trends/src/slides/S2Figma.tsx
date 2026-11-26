import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import { AgentCursor } from '@/components/AgentCursor';
import { generatedUrl } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import './S2Figma.css';

/**
 * Agentic design: you direct, it designs with you.
 * One idea: a screen assembling itself from our components on a canvas grid, then the real recording takes over.
 *  beat 0  headline, lede, footnote; the canvas fades up and the request types into a prompt box
 *  beat 1  three frames appear; components drop into them one by one under the agent's cursor (desktop, then mobile)
 *  beat 2  the canvas zooms into the desktop frame and the clip plays in it
 * The board is authored at its final (zoomed) size and shown at 0.7 during assembly, so the clip state is crisp.
 */
const ASK = 'A booking page for Larkline bike rentals, desktop and mobile. Use our components.';
const BOARD = { x: 790, y: 380, s: 0.7 };   // during assembly
const ZOOM = { x: 780, y: 259, s: 1 };      // desktop frame = 1000×562 clip slot

type Part = { id: string; name: string; x: number; y: number; w: number; h: number };
// Desktop frame components (board px inside the 1000×562 frame)
const PARTS: Part[] = [
  { id: 'nav', name: 'Nav / Default', x: 24, y: 18, w: 952, h: 44 },
  { id: 'hero', name: 'Image / Hero', x: 24, y: 84, w: 590, h: 300 },
  { id: 'title', name: 'Text / Display', x: 640, y: 104, w: 336, h: 196 },
  { id: 'cta', name: 'Button / Primary', x: 640, y: 318, w: 300, h: 46 },
  { id: 'cards', name: 'Card / Bike × 3', x: 24, y: 406, w: 952, h: 134 },
];
const CARDS = [
  { t: 'City', p: 'From $24 a day', img: 'rv-shot-2' },
  { t: 'Trail', p: 'From $32 a day', img: 'rv-shot-4' },
  { t: 'Cargo', p: 'From $38 a day', img: 'rv-shot-5' },
];

function Img({ id, className }: { id: string; className?: string }) {
  const url = generatedUrl(id);
  return url ? <img className={className} src={url} alt="" draggable={false} /> : <div className={`${className} fg-img-ph`} />;
}

function S2Figma({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['typing'], mode === 'live', 0.35);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const board = q('.fg-board')[0];
    const cursor = q('.fg-canvas .agent-cursor')[0];
    const toStage = (p: { x: number; y: number }) => ({ x: BOARD.x + p.x * BOARD.s, y: BOARD.y + p.y * BOARD.s });

    gsap.set(board, { x: BOARD.x, y: BOARD.y, scale: BOARD.s, transformOrigin: '0 0' });
    gsap.set(q('.fg-frame'), { opacity: 0, scale: 0.97, transformOrigin: '50% 50%' });
    gsap.set(q('.fg-flabel'), { opacity: 0 });
    gsap.set(q('.fg-part'), { opacity: 0, y: 14 });
    gsap.set(q('.fg-sel'), { opacity: 0 });
    gsap.set(q('.fg-col'), { scaleY: 0, transformOrigin: '50% 0' });
    gsap.set(cursor, { x: 1700, y: 1000, opacity: 0 });

    // ── beat 0 ──────────────────────────────────────────────────
    revealLines(tl, q('.fg-head')[0], {}, 0.05);
    revealWords(tl, q('.fg-lede')[0], {}, 0.4);
    tl.from(q('.fg-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    tl.from(q('.fg-canvas'), { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.2);
    tl.from(q('.fg-toolbar'), { y: 30, opacity: 0, duration: 1 }, 0.6);
    tl.from(q('.fg-prompt'), { y: 24, opacity: 0, duration: 1 }, 0.7);
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); }, undefined, 1.2);
    typeInto(tl, q('.fg-ask')[0], ASK, { cps: 46 }, 1.2);
    tl.call(() => sfx.stop('typing'));
    tl.addLabel('b1');

    // ── beat 1: assemble ────────────────────────────────────────
    const a = tl.duration() + 0.05;
    tl.to(q('.fg-lib'), { opacity: 1, duration: 0.3 }, a);
    tl.to(q('.fg-frame'), { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', stagger: 0.12 }, a);
    tl.to(q('.fg-flabel'), { opacity: 1, duration: 0.4, stagger: 0.12 }, a + 0.1);
    tl.to(q('.fg-col'), { scaleY: 1, duration: 0.6, ease: 'expo.out', stagger: 0.025 }, a + 0.25);
    tl.to(cursor, { opacity: 1, duration: 0.2 }, a + 0.3);

    const parts = q('.fg-d .fg-part');
    const sels = q('.fg-d .fg-sel');
    PARTS.forEach((p, k) => {
      const t = a + 0.7 + k * 0.42;
      const c = toStage({ x: p.x + Math.min(p.w * 0.5, 160), y: p.y + p.h * 0.55 });
      tl.to(cursor, { x: c.x, y: c.y, duration: 0.4, ease: 'power3.inOut' }, t - 0.3);
      tl.to(parts[k], { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, t);
      tl.to(sels[k], { opacity: 1, duration: 0.12 }, t);
      tl.to(sels[k], { opacity: 0, duration: 0.35 }, t + 0.5);
    });
    // mobile frames adapt in a quick cascade
    const m = a + 0.7 + PARTS.length * 0.42 + 0.05;
    const mc = toStage({ x: 1180, y: 300 });
    tl.to(cursor, { x: mc.x, y: mc.y, duration: 0.45, ease: 'power3.inOut' }, m - 0.3);
    tl.to(q('.fg-m .fg-part'), { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.07 }, m);
    tl.to(q('.fg-m .fg-sel'), { opacity: 1, duration: 0.12, stagger: 0.07 }, m);
    tl.to(q('.fg-m .fg-sel'), { opacity: 0, duration: 0.3, stagger: 0.07 }, m + 0.45);
    tl.to(q('.fg-col'), { opacity: 0, duration: 0.6 }, m + 0.4);
    tl.to(q('.fg-status'), { opacity: 1, duration: 0.4 }, m + 0.6);
    tl.to(cursor, { x: '+=120', y: '+=150', opacity: 0, duration: 0.6, ease: 'power2.in' }, m + 0.9);
    tl.addLabel('b2');

    // ── beat 2: the recording takes over ────────────────────────
    const z = tl.duration() + 0.05;
    tl.to(q('.fg-prompt'), { y: -40, opacity: 0, duration: 0.6, ease: 'power2.in' }, z);
    tl.to(board, { x: ZOOM.x, y: ZOOM.y, scale: ZOOM.s, duration: 1.2, ease: 'power3.inOut' }, z);
    tl.to(q('.fg-m, .fg-m-label'), { opacity: 0, duration: 0.6 }, z + 0.2);
    tl.fromTo(q('.fg-clip'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, z + 0.9);
  });

  const Sel = ({ p }: { p: Part }) => (
    <div className="fg-sel" style={{ left: p.x - 3, top: p.y - 3, width: p.w + 6, height: p.h + 6 }}>
      <i /><i /><i /><i /><span>{p.name}</span>
    </div>
  );

  return (
    <div ref={root} className="fg">
      <div className="fg-text">
        <div className="fg-kicker label"><i /><span><b>01</b> · Design · Figma</span></div>
        <h2 className="fg-head headline">You direct. It designs with you.</h2>
        <p className="fg-lede lede">AI works right on the Figma canvas, in our files, with our components. We set the direction and make the calls.</p>
      </div>

      <div className="fg-canvas">
        <div className="fg-dots fill" />

        <div className="fg-prompt">
          <div className="fg-prompt-top">
            <span className="label">Prompt</span>
            <span className="fg-lib label">Library · Larkline design system</span>
          </div>
          <div className="fg-prompt-text"><span className="fg-ask" /><span className="caret blink" /></div>
          <div className="fg-status label"><i />3 frames · 18 components</div>
        </div>

        <div className="fg-board">
          {/* desktop */}
          <div className="fg-flabel" style={{ left: 0, top: -34 }}>Booking · Desktop</div>
          <div className="fg-frame fg-d" style={{ left: 0, top: 0, width: 1000, height: 562 }}>
            <div className="fg-cols">{Array.from({ length: 12 }, (_, i) => <i key={i} className="fg-col" />)}</div>

            <div className="fg-part fg-nav" style={{ left: 24, top: 18, width: 952, height: 44 }}>
              <span className="fg-wordmark">Larkline</span>
              <span className="fg-links"><span>Bikes</span><span>Routes</span><span>Stores</span></span>
              <span className="fg-btn sm">Book a ride</span>
            </div>
            <div className="fg-part fg-hero" style={{ left: 24, top: 84, width: 590, height: 300 }}>
              <Img id="rv-shot-6" className="fg-cover" />
            </div>
            <div className="fg-part fg-title" style={{ left: 640, top: 104, width: 336 }}>
              <div className="fg-h1">Take the long way home.</div>
              <p>City bikes by the day, week or month. Pick one up anywhere downtown.</p>
            </div>
            <div className="fg-part fg-cta" style={{ left: 640, top: 318 }}>
              <span className="fg-btn">Find a bike</span>
              <span className="fg-btn ghost">See routes</span>
            </div>
            <div className="fg-part fg-cards" style={{ left: 24, top: 406, width: 952, height: 134 }}>
              {CARDS.map((c) => (
                <div key={c.t} className="fg-card">
                  <Img id={c.img} className="fg-thumb" />
                  <div><b>{c.t}</b><span>{c.p}</span></div>
                </div>
              ))}
            </div>
            {PARTS.map((p) => <Sel key={p.id} p={p} />)}

            <ClipFrame className="fg-clip" src="clips/figma-agent-builds-on-canvas.mp4" duration="36s" mode={mode} playing={step >= 2} />
          </div>

          {/* mobile: the same components, adapted */}
          <div className="fg-flabel fg-m-label" style={{ left: 1040, top: -34 }}>Booking · Mobile</div>
          <div className="fg-frame fg-m" style={{ left: 1040, top: 0, width: 264, height: 562 }}>
            <div className="fg-part fg-mnav" style={{ left: 16, top: 16, width: 232, height: 30 }}><span className="fg-wordmark sm">Larkline</span><span className="fg-burger"><i /><i /></span></div>
            <div className="fg-part" style={{ left: 16, top: 60, width: 232, height: 200 }}><Img id="rv-shot-6" className="fg-cover" /></div>
            <div className="fg-part fg-mtitle" style={{ left: 16, top: 276, width: 232 }}>Take the long way home.</div>
            <div className="fg-part" style={{ left: 16, top: 372 }}><span className="fg-btn">Find a bike</span></div>
            <div className="fg-part fg-mcard" style={{ left: 16, top: 440, width: 232, height: 104 }}><Img id="rv-shot-2" className="fg-thumb" /><div><b>City</b><span>From $24 a day</span></div></div>
            {[{ x: 16, y: 16, w: 232, h: 30 }, { x: 16, y: 60, w: 232, h: 200 }, { x: 16, y: 276, w: 232, h: 80 }, { x: 16, y: 372, w: 130, h: 46 }, { x: 16, y: 440, w: 232, h: 104 }].map((r, i) => (
              <div key={i} className="fg-sel" style={{ left: r.x - 3, top: r.y - 3, width: r.w + 6, height: r.h + 6 }}><i /><i /><i /><i /></div>
            ))}
          </div>
          <div className="fg-flabel fg-m-label" style={{ left: 1344, top: -34 }}>Bikes · Mobile</div>
          <div className="fg-frame fg-m" style={{ left: 1344, top: 0, width: 264, height: 562 }}>
            <div className="fg-part fg-mnav" style={{ left: 16, top: 16, width: 232, height: 30 }}><span className="fg-wordmark sm">Larkline</span><span className="fg-burger"><i /><i /></span></div>
            {CARDS.map((c, i) => (
              <div key={c.t} className="fg-part fg-mcard" style={{ left: 16, top: 64 + i * 118, width: 232, height: 104 }}><Img id={c.img} className="fg-thumb" /><div><b>{c.t}</b><span>{c.p}</span></div></div>
            ))}
            <div className="fg-part" style={{ left: 16, top: 430 }}><span className="fg-btn">Book a ride</span></div>
            {[{ x: 16, y: 16, w: 232, h: 30 }, ...CARDS.map((_, i) => ({ x: 16, y: 64 + i * 118, w: 232, h: 104 })), { x: 16, y: 430, w: 130, h: 46 }].map((r, i) => (
              <div key={i} className="fg-sel" style={{ left: r.x - 3, top: r.y - 3, width: r.w + 6, height: r.h + 6 }}><i /><i /><i /><i /></div>
            ))}
          </div>
        </div>

        <div className="fg-toolbar">
          {['move', 'frame', 'shape', 'pen', 'text'].map((t, i) => <span key={t} className={`fg-tool t-${t}${i === 1 ? ' on' : ''}`} />)}
          <span className="fg-tool-sep" />
          <span className="fg-tool-ai label">Agent</span>
        </div>
        <AgentCursor label="Agent" />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's2-figma',
  section: 2,
  title: 'Figma',
  steps: 2,
  notes:
    'Same connector idea, now in Figma. We give it the direction, like briefing a designer.\n' +
    'Click: it builds the frames on the canvas, in our file, using our component library, then adapts them for mobile. These are real, editable Figma layers, not a picture of a design.\n' +
    'Click again for the recording (36s). The point: we stay the director, it does the layout work alongside us.',
  Component: S2Figma,
});
