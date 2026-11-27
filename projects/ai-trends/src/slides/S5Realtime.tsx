import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { generatedUrl, GenTile } from '@/components/GenArt';
import { ClipFrame } from '@/components/ClipFrame';
import './S5Realtime.css';

/**
 * Made as you watch: real-time generative video, MiniMax H3 (H3 Max Director streams video and sound live, steered by
 * prompts mid-session; 24 fps, 768p, 10-second chunks, per fal).
 *  beat 0  a photo and a sentence go into the prompt bar. The photo drops into the frame and the world grows out of it,
 *          blocky at the edge and sharp behind, frame counter running. Then the camera starts walking in. Nothing pre-rendered.
 *  beat 1  the real thing: a live H3 Max Director session (fal's published example) takes over the same frame.
 *  beat 2-5 choose your own adventure: each click types a new direction into the bar and the stream jumps to where it
 *           took the broadcast. Directions are paraphrased from what happens on screen, except the England one, which
 *           fal quotes. The clip runs a touch fast (1.25x) so it keeps moving.
 */
const WORLD = generatedUrl('realtime-portal');
const SENTENCE = 'Breaking news: a portal opens over Tokyo.';
/** Each click after the clip arrives: a new direction, and where in the stream it lands (seconds). */
const DIRECTIONS = [
  { text: SENTENCE, at: 0 },
  { text: 'Cut to our reporter at the portal.', at: 16 },
  { text: 'The portal turns violet and starts to pull.', at: 28 },
  { text: 'Show the readings.', at: 45 },
  { text: 'Report: something bad happened in England.', at: 57 },
];
const RATE = 1.25;
// Frame and bar positions on the 1920×1080 canvas (CSS mirrors these).
const FRAME = { x: 820, y: 214, w: 960, h: 540 };
// The "photo" is a crop of the world it seeds, so the growth is seamless.
const SEED = { x: 380, y: 160, w: 240, h: 240 };
const THUMB = { x: 820 + 18, y: 778 + 16, s: 52 };

/** The world image, cover-fitted to the frame and positioned so `SEED` lands at the crop origin. */
function WorldImg({ offset = false }: { offset?: boolean }) {
  const style = offset ? { left: -SEED.x, top: -SEED.y } : undefined;
  return WORLD
    ? <img className="rt-img" src={WORLD} alt="" draggable={false} style={style} />
    : <div className="rt-img" style={style}><GenTile seed={12} palette={5} /></div>;
}

function Realtime({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const pix = useRef<HTMLCanvasElement>(null);
  const drift = useRef({ amp: 0, t: 0 });
  const counting = useRef({ on: 0, start: 0 });

  // Low-res pass: the same image drawn into a tiny canvas and shown with hard pixels.
  useEffect(() => {
    const c = pix.current;
    if (!c || !WORLD) return;
    const img = new Image();
    img.onload = () => {
      const ctx = c.getContext('2d')!;
      // cover-fit into the 48×27 canvas, like the full-size layer
      const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    };
    img.src = WORLD;
  }, []);

  // Ambient: the camera keeps walking forward once the world exists, and the frame counter runs at 24 fps.
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const camEl = q('.rt-cam')[0];
    const counter = q('.rt-frame-n')[0];
    const d = drift.current;
    const tick = () => {
      const e = Math.sin(d.t * Math.PI); // 0 → 1 → 0 over one loop, yoyo-like but seamless
      gsap.set(camEl, { scale: 1 + 0.16 * d.amp * e, x: -18 * d.amp * e, y: 10 * d.amp * e });
      if (counter && counting.current.on) counter.textContent = String(Math.floor((performance.now() - counting.current.start) / (1000 / 24)) % 100000).padStart(5, '0');
    };
    if (mode === 'preview') { d.t = 0.35; return; }
    gsap.to(d, { t: 1, duration: 22, ease: 'none', repeat: -1, onUpdate: tick });
  }, { scope: root, dependencies: [mode] });

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const inset = (r: typeof SEED) => `inset(${r.y}px ${FRAME.w - r.x - r.w}px ${FRAME.h - r.y - r.h}px ${r.x}px round 14px)`;
    const full = 'inset(0px 0px 0px 0px round 0px)';
    drift.current.amp = 0;
    counting.current.on = 0;
    gsap.set(q('.rt-pix'), { clipPath: inset(SEED) });
    gsap.set(q('.rt-sharp'), { clipPath: inset(SEED) });
    gsap.set(q('.rt-clone'), { x: THUMB.x - (FRAME.x + SEED.x), y: THUMB.y - (FRAME.y + SEED.y), scale: THUMB.s / SEED.w, transformOrigin: '0 0', opacity: 0 });

    // ── beat 0: text, empty frame, the prompt ─────────────────
    tl.from(q('.rt-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.rt-head')[0], {}, 0);
    revealWords(tl, q('.rt-lede')[0], {}, 0.3);
    tl.from(q('.rt-frame'), { opacity: 0, y: 40, duration: 0.9 }, 0.15);
    tl.from(q('.rt-bar'), { opacity: 0, y: 24, duration: 0.7 }, 0.3);
    tl.from(q('.rt-thumb'), { scale: 0.4, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.55);
    typeInto(tl, q('.rt-typed')[0], SENTENCE, { cps: 60 }, 0.7);

    // ── the photo drops in and the world grows out of it ──────
    const drop = 0.7 + SENTENCE.length / 60 + 0.15;
    tl.to(q('.rt-bar-enter'), { opacity: 1, duration: 0.15 }, drop - 0.2);
    tl.to(q('.rt-bar-enter'), { opacity: 0.35, duration: 0.3 }, drop);
    tl.set(q('.rt-clone'), { opacity: 1 }, drop);
    tl.to(q('.rt-clone'), { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.inOut' }, drop);
    tl.to(q('.rt-empty'), { opacity: 0, duration: 0.4 }, drop + 0.3);
    const grow = drop + 0.55;
    tl.set(q('.rt-pix, .rt-sharp'), { opacity: 1 }, grow);
    tl.call(() => { counting.current.on = 1; counting.current.start = performance.now(); }, undefined, grow);
    tl.to(q('.rt-hud'), { opacity: 1, duration: 0.4 }, grow);
    tl.to(q('.rt-pix'), { clipPath: full, duration: 0.9, ease: 'power2.inOut' }, grow);
    tl.to(q('.rt-sharp'), { clipPath: full, duration: 1.0, ease: 'power2.inOut' }, grow + 0.3);
    tl.set(q('.rt-clone'), { opacity: 0 }, grow + 0.1);
    tl.set(q('.rt-state-gen'), { opacity: 0 }, grow + 1.3);
    tl.set(q('.rt-state-live'), { opacity: 1 }, grow + 1.3);
    tl.to(drift.current, { amp: 1, duration: 3, ease: 'power2.inOut' }, grow + 1.1);
    tl.addLabel('b1');

    // ── beat 1: the real clip takes the frame ─────────────────
    tl.fromTo(q('.rt-clip'), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 'b1');
    tl.to(q('.rt-bar-mode-live'), { opacity: 0, duration: 0.3 }, 'b1');
    tl.fromTo(q('.rt-bar-mode-clip'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 'b1+=0.25');
    tl.fromTo(q('.rt-credit'), { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 'b1+=0.4');

    // ── beats 2–5: a new direction per click; the stream follows (seek in the effect below) ──
    const typed = q('.rt-typed')[0];
    DIRECTIONS.slice(1).forEach((d, i) => {
      const prev = DIRECTIONS[i].text;
      tl.addLabel(`b${i + 2}`, '+=0.05');
      const s = { n: 0 };
      tl.fromTo(s, { n: 0 }, {
        n: d.text.length, duration: d.text.length / 70, ease: 'none', immediateRender: false,
        onUpdate: () => { if (typed) typed.textContent = s.n < 0.5 ? prev : d.text.slice(0, Math.round(s.n)); },
      }, `b${i + 2}`);
      tl.fromTo(q('.rt-bar-enter'), { opacity: 1 }, { opacity: 0.35, duration: 0.3, immediateRender: false }, `b${i + 2}+=${d.text.length / 70}`);
    });
  });

  // The stream follows the directions: each click jumps the clip to where that direction took the broadcast.
  useEffect(() => {
    if (mode !== 'live' || step < 1) return;
    const v = root.current?.querySelector<HTMLVideoElement>('.rt-clip video');
    if (!v) return;
    const go = () => {
      const d = DIRECTIONS[Math.min(step, DIRECTIONS.length) - 1];
      v.currentTime = d.at + (step >= 2 ? d.text.length / 70 : 0);
      v.playbackRate = RATE;
      v.play().catch(() => {});
    };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
  }, [step, mode]);

  return (
    <div ref={root} className="rt">
      <div className="rt-kicker label"><b>On our radar</b><span className="rt-kicker-sep">·</span>MiniMax H3</div>
      <div className="rt-text">
        <h2 className="rt-head headline">Made as you watch.</h2>
        <p className="rt-lede lede">Real-time generative video. MiniMax H3 streams picture and sound live, and you steer it with prompts while it plays.</p>
      </div>

      <div className="rt-frame">
        <div className="rt-empty fill"><span className="label">Waiting for a prompt</span></div>
        <div className="rt-cam fill">
          <canvas ref={pix} className="rt-pix fill" width={48} height={27} />
          <div className="rt-sharp fill"><WorldImg /></div>
        </div>
        <div className="rt-hud label">
          <span className="rt-state">
            <span className="rt-state-gen"><i className="rt-dot is-run" />Generating</span>
            <span className="rt-state-live"><i className="rt-dot" />Live</span>
          </span>
          <span className="rt-frame-count">Frame <span className="rt-frame-n">00000</span> <span className="rt-sep">·</span> 24 fps</span>
        </div>
        <div className="rt-clip fill">
          <ClipFrame src="realtime/h3max-broadcast.mp4" label="h3max-broadcast.mp4" duration="80s" mode={mode} playing={step >= 1} className="rt-clipframe" />
        </div>
      </div>

      <div className="rt-bar pill-slot">
        <div className="rt-thumb"><div className="rt-thumb-in"><WorldImg offset /></div></div>
        <span className="rt-chev">›</span>
        <span className="rt-typed" />
        <span className="caret blink" />
        <span className="rt-bar-right label">
          <span className="rt-bar-mode-live">Real time</span>
          <span className="rt-bar-mode-clip">Direction {Math.min(Math.max(step, 1), DIRECTIONS.length)}/{DIRECTIONS.length}</span>
          <span className="rt-bar-enter">↵</span>
        </span>
      </div>

      <div className="rt-credit source">Live session: MiniMax H3 Max Director, via fal (fal.ai). Directions paraphrased from the session, played at 1.25x.</div>

      {/* the photo on its way from the prompt bar into the frame */}
      <div className="rt-clone" style={{ left: FRAME.x + SEED.x, top: FRAME.y + SEED.y, width: SEED.w, height: SEED.h }}>
        <WorldImg offset />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's5-realtime',
  section: 4,
  title: 'Made as you watch',
  steps: 5,
  notes:
    'The one to watch: real-time generative video. MiniMax H3, and its fast version H3 Max, stream picture and sound live instead of handing you a finished file.\n' +
    'On arrival: a photo and one sentence go in, and the world grows while you watch. The frame counter is the point: it is made frame by frame, not played back.\n' +
    'Click: the real thing. A live H3 Max session, an anime news broadcast, generated as it plays at 24 frames a second.\n' +
    'Then keep clicking, quickly: it is choose your own adventure. Each click is a new direction typed in mid-stream, and the broadcast goes there: cut to the reporter at the portal, the portal turns violet, show the readings, report that something bad happened in England. Nobody wrote a script; the story is steered live.\n' +
    'Impressive now, not ready for client work yet. Hover the clip for sound.',
  Component: Realtime,
});
