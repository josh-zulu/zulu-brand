import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import { useSfx } from '@/lib/sfx';
import './S2Blender.css';

/**
 * It doesn't describe the scene. It builds it.
 * One idea: the connector. A chat panel and a 3D viewport sit side by side; on the click a line runs out of the chat,
 * plugs into the viewport and on into the scene. Where it lands, the scene builds itself (wireframe, then solid),
 * while the agent's tool calls tick down the chat. Then the real recording takes over the viewport.
 *  beat 0  headline, lede, the empty viewport, the request types into the chat
 *  beat 1  connector draws → build → clip plays in the viewport
 */
const ASK = 'Build a product stage: a round plinth, a sphere on top and one warm key light.';
const CALLS = ['connect  blender', 'add plinth', 'add sphere', 'add key light · warm', 'frame camera · 50mm'];

// Viewport geometry (stage px). Body is 16:9 so real footage fills it exactly.
const VP = { x: 780, y: 288, w: 1000, head: 44 };
const BODY_H = 562;
const ORIGIN = { x: 500, y: 392 }; // scene origin inside the body

/** Self-drawing strokes for one or many SVG elements (motion.ts drawOn, for arrays). */
const draw = (tl: gsap.core.Timeline, targets: Element[], vars: gsap.TweenVars, at: number) =>
  tl.fromTo(targets, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'zak.settle', ...vars }, at);

function S2Blender({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['typing'], mode === 'live', 0.35);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);

    // ── beat 0: the setting ────────────────────────────────────
    tl.from(q('.bl-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.bl-head')[0], {}, 0.05);
    revealWords(tl, q('.bl-lede')[0], {}, 0.4);
    tl.from(q('.bl-vp'), { y: 60, opacity: 0, duration: 1.3 }, 0.25);
    tl.from(q('.bl-floor line'), { opacity: 0, duration: 1.2, stagger: 0.015, ease: 'power2.out' }, 0.7);
    tl.from(q('.bl-gizmo'), { rotation: -90, scale: 0.6, opacity: 0, duration: 1.2, transformOrigin: '50% 50%' }, 0.9);
    tl.from(q('.bl-chat'), { y: 40, opacity: 0, duration: 1.1 }, 0.45);
    tl.from(q('.bl-bubble'), { opacity: 0, y: 12, duration: 0.5 }, 1.1);
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); }, undefined, 1.2);
    typeInto(tl, q('.bl-ask')[0], ASK, { cps: 44 }, 1.2);
    tl.call(() => sfx.stop('typing'));
    tl.addLabel('b1');

    // ── beat 1: connect ────────────────────────────────────────
    const at = tl.duration() + 0.1;
    const cable = q('.bl-cable')[0] as unknown as SVGPathElement;
    const wireIn = q('.bl-wire-in')[0] as unknown as SVGPathElement;
    gsap.set(q('.bl-port'), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
    tl.to(q('.bl-plug'), { fill: '#00e482', duration: 0.2 }, at);
    tl.set(q('.bl-bubble .caret'), { visibility: 'hidden' }, at);
    tl.to(q('.bl-port'), { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, at);
    draw(tl, q('.bl-cable'), { duration: 0.75, ease: 'power2.inOut' }, at + 0.1);
    draw(tl, q('.bl-wire-in'), { duration: 0.7, ease: 'power2.out' }, at + 0.8);
    tl.fromTo(q('.bl-pulse'), { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, at + 0.1);
    tl.to(q('.bl-pulse'), { motionPath: { path: cable, align: cable, alignOrigin: [0.5, 0.5] }, duration: 0.75, ease: 'power2.inOut' }, at + 0.1);
    tl.to(q('.bl-pulse'), { motionPath: { path: wireIn, align: wireIn, alignOrigin: [0.5, 0.5] }, duration: 0.7, ease: 'power2.out' }, at + 0.85);
    tl.to(q('.bl-pulse'), { opacity: 0, duration: 0.2 }, at + 1.5);
    tl.fromTo(q('.bl-ring'), { scale: 0.2, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 0.9, ease: 'power2.out', transformOrigin: '50% 50%', immediateRender: false }, at + 1.45);
    tl.to(q('.bl-origin'), { opacity: 1, duration: 0.3 }, at + 1.45);
    tl.to(q('.bl-conn-off'), { opacity: 0, duration: 0.2 }, at + 0.8);
    tl.to(q('.bl-conn-on'), { opacity: 1, duration: 0.2 }, at + 0.8);
    tl.to(q('.bl-status-wait'), { opacity: 0, duration: 0.2 }, at + 1.4);
    tl.to(q('.bl-status-build'), { opacity: 1, duration: 0.2 }, at + 1.4);

    // the build: each tool call lands as its object draws, newest object outlined in signal
    const buildAt = at + 1.55;
    const lines = q('.bl-call');
    tl.to(lines[0], { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, at + 0.9);
    tl.to(q('.bl-call .done')[0], { opacity: 1, duration: 0.15 }, at + 1.3);
    tl.to(q('.bl-call .run')[0], { opacity: 0, duration: 0.15 }, at + 1.3);
    const objs = ['.bl-o-plinth', '.bl-o-sphere', '.bl-o-light', '.bl-o-camera'];
    objs.forEach((sel, k) => {
      const t = buildAt + k * 0.62;
      const li = k + 1;
      tl.to(lines[li], { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, t);
      draw(tl, q(`${sel} .w`), { duration: 0.6, ease: 'power2.inOut', stagger: 0.04 }, t);
      tl.set(q(`${sel} .w`), { stroke: '#00e482' }, t);
      tl.to(q(`${sel} .w`), { stroke: '#cfcec9', duration: 0.5 }, t + 0.6);
      tl.to(q('.bl-call .done')[li], { opacity: 1, duration: 0.15 }, t + 0.55);
      tl.to(q('.bl-call .run')[li], { opacity: 0, duration: 0.15 }, t + 0.55);
    });
    // solid view
    const solidAt = buildAt + objs.length * 0.62 + 0.15;
    tl.to(q('.bl-solid'), { opacity: 1, duration: 0.9, ease: 'power2.out' }, solidAt);
    tl.to(q('.bl-scene .w'), { opacity: 0.35, duration: 0.9 }, solidAt);
    tl.to(q('.bl-status-build'), { opacity: 0, duration: 0.2 }, solidAt + 0.3);
    tl.to(q('.bl-status-done'), { opacity: 1, duration: 0.2 }, solidAt + 0.3);
    tl.to(q('.bl-ready'), { opacity: 1, duration: 0.4 }, solidAt + 0.3);

    // the recording takes over the viewport
    const clipAt = solidAt + 1.0;
    tl.to(q('.bl-wire-in, .bl-origin'), { opacity: 0, duration: 0.6 }, clipAt);
    tl.fromTo(q('.bl-clip'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, clipAt);
    tl.addLabel('b2');
  });

  return (
    <div ref={root} className="bl">
      <div className="bl-text">
        <div className="bl-kicker label"><i /><span><b>02</b> · 3D · Blender</span></div>
        <h2 className="bl-head headline">It doesn't describe the scene. It builds it.</h2>
        <p className="bl-lede lede">Plugged into Blender, it lays out the set, the lights and the camera in our file, ready for an artist to take further.</p>
      </div>

      {/* chat panel */}
      <div className="bl-chat">
        <div className="bl-chat-head">
          <span className="label">Chat</span>
          <span className="bl-conn label"><i className="bl-conn-off" /><i className="bl-conn-on" />Blender connector</span>
        </div>
        <div className="bl-bubble"><span className="bl-ask" /><span className="caret blink" /></div>
        <div className="bl-calls">
          {CALLS.map((c, i) => (
            <div key={i} className="bl-call">
              <span className="bl-tag"><span className="run">→</span><span className="done">✓</span></span>
              <span>{c}</span>
            </div>
          ))}
          <div className="bl-call bl-ready"><span className="bl-tag"><span className="done" style={{ opacity: 1 }}>●</span></span><span>scene ready</span></div>
        </div>
      </div>

      {/* viewport */}
      <div className="bl-vp" style={{ left: VP.x, top: VP.y, width: VP.w }}>
        <div className="bl-vp-head">
          <div className="bl-tabs"><span>Scene</span><span className="on">Model</span><span>Shade</span><span>Render</span></div>
          <span className="bl-vp-mode label">Perspective</span>
        </div>
        <div className="bl-body" style={{ height: BODY_H }}>
          <svg className="bl-scene" viewBox={`0 0 ${VP.w} ${BODY_H}`} width={VP.w} height={BODY_H}>
            <defs>
              <linearGradient id="bl-floor-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="1" />
              </linearGradient>
              <mask id="bl-floor-mask"><rect x="0" y="0" width={VP.w} height={BODY_H} fill="url(#bl-floor-fade)" /></mask>
              <radialGradient id="bl-sphere-g" cx="0.36" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#fbf6ec" />
                <stop offset="0.35" stopColor="#d9d3c7" />
                <stop offset="0.8" stopColor="#5e5a55" />
                <stop offset="1" stopColor="#2d2b2a" />
              </radialGradient>
              <linearGradient id="bl-plinth-side" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8a857d" />
                <stop offset="0.4" stopColor="#5b5853" />
                <stop offset="1" stopColor="#2e2c2b" />
              </linearGradient>
              <radialGradient id="bl-key-g" cx="0.25" cy="0.15" r="0.9">
                <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.22" />
                <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
              </radialGradient>
              <filter id="bl-blur"><feGaussianBlur stdDeviation="14" /></filter>
            </defs>

            {/* perspective floor */}
            <g className="bl-floor" mask="url(#bl-floor-mask)">
              {Array.from({ length: 25 }, (_, i) => {
                const x = -1700 + i * 141.6;
                return <line key={`v${i}`} x1={ORIGIN.x} y1={150} x2={x} y2={BODY_H + 400} />;
              })}
              {[0.03, 0.08, 0.15, 0.24, 0.36, 0.52, 0.74, 1.02].map((f, i) => {
                const y = 150 + (BODY_H - 150) * f;
                return <line key={`h${i}`} x1={0} y1={y} x2={VP.w} y2={y} />;
              })}
              <line className="bl-axis-x" x1={0} y1={ORIGIN.y + 26} x2={VP.w} y2={ORIGIN.y + 26} />
              <line className="bl-axis-y" x1={ORIGIN.x} y1={150} x2={ORIGIN.x} y2={BODY_H} />
            </g>

            {/* solid (shaded) layer, fades in after the wireframe */}
            <g className="bl-solid">
              <rect x="0" y="0" width={VP.w} height={BODY_H} fill="url(#bl-key-g)" />
              <ellipse cx={ORIGIN.x + 30} cy={ORIGIN.y + 44} rx="230" ry="40" fill="#000" opacity="0.55" filter="url(#bl-blur)" />
              <path d={`M350 ${ORIGIN.y - 40} L350 ${ORIGIN.y + 20} A150 34 0 0 0 650 ${ORIGIN.y + 20} L650 ${ORIGIN.y - 40} Z`} fill="url(#bl-plinth-side)" />
              <ellipse cx={ORIGIN.x} cy={ORIGIN.y - 40} rx="150" ry="34" fill="#a39e95" />
              <ellipse cx={ORIGIN.x + 10} cy={ORIGIN.y - 40} rx="88" ry="16" fill="#000" opacity="0.35" filter="url(#bl-blur)" />
              <circle cx={ORIGIN.x} cy={ORIGIN.y - 128} r="88" fill="url(#bl-sphere-g)" />
            </g>

            {/* wireframe objects */}
            <g className="bl-wire">
              <g className="bl-o-plinth">
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 40} rx="150" ry="34" />
                <path className="w" d={`M350 ${ORIGIN.y + 20} A150 34 0 0 0 650 ${ORIGIN.y + 20}`} />
                <line className="w" x1="350" y1={ORIGIN.y - 40} x2="350" y2={ORIGIN.y + 20} />
                <line className="w" x1="650" y1={ORIGIN.y - 40} x2="650" y2={ORIGIN.y + 20} />
                <line className="w" x1={ORIGIN.x} y1={ORIGIN.y - 6} x2={ORIGIN.x} y2={ORIGIN.y + 54} />
              </g>
              <g className="bl-o-sphere">
                <circle className="w" cx={ORIGIN.x} cy={ORIGIN.y - 128} r="88" />
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 128} rx="88" ry="22" />
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 168} rx="70" ry="15" />
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 88} rx="70" ry="15" />
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 128} rx="34" ry="88" />
                <ellipse className="w" cx={ORIGIN.x} cy={ORIGIN.y - 128} rx="68" ry="88" />
              </g>
              <g className="bl-o-light">
                <path className="w" d="M168 92 L262 70 L282 132 L188 156 Z" />
                <line className="w" x1="225" y1="113" x2="410" y2="230" strokeDasharray="6 8" />
                <circle className="w" cx="225" cy="113" r="7" />
              </g>
              <g className="bl-o-camera">
                <path className="w" d="M842 196 L900 170 L900 236 Z" />
                <rect className="w" x="900" y="178" width="56" height="50" rx="4" />
                <line className="w" x1="842" y1="196" x2="610" y2="250" strokeDasharray="4 8" />
                <line className="w" x1="842" y1="212" x2="610" y2="330" strokeDasharray="4 8" />
              </g>
            </g>

            {/* where the connector lands */}
            <g className="bl-origin">
              <circle cx={ORIGIN.x} cy={ORIGIN.y + 26} r="9" />
              <circle className="bl-ring" cx={ORIGIN.x} cy={ORIGIN.y + 26} r="18" />
            </g>

            {/* axis gizmo */}
            <g className="bl-gizmo" transform={`translate(${VP.w - 74} 66)`}>
              <circle r="44" className="bl-gizmo-bg" />
              <line x1="0" y1="0" x2="30" y2="10" className="gx" /><circle cx="30" cy="10" r="9" className="gx-d" />
              <line x1="0" y1="0" x2="-14" y2="20" className="gy" /><circle cx="-14" cy="20" r="9" className="gy-d" />
              <line x1="0" y1="0" x2="0" y2="-32" className="gz" /><circle cx="0" cy="-32" r="9" className="gz-d" />
            </g>
            <text x="22" y="34" className="bl-vp-label">Perspective</text>
            <text x="22" y="56" className="bl-vp-label dim">(1) Stage</text>
          </svg>

          <ClipFrame className="bl-clip" src="clips/blender-connector.mp4" duration="45s" mode={mode} playing={step >= 1} />
        </div>
        <div className="bl-vp-foot label">
          <span className="bl-status"><span className="bl-status-wait">Waiting for instructions</span><span className="bl-status-build">Building scene</span><span className="bl-status-done">Scene ready · 4 objects</span></span>
          <span>Blender</span>
        </div>
      </div>

      {/* the connector: out of the chat, into the frame, on into the scene */}
      <svg className="bl-connector" viewBox="0 0 1920 1080" width="1920" height="1080">
        <path className="bl-cable" d={`M660 742 C 720 742, 724 ${VP.y + VP.head + ORIGIN.y + 26}, ${VP.x} ${VP.y + VP.head + ORIGIN.y + 26}`} />
        <path className="bl-wire-in" d={`M${VP.x} ${VP.y + VP.head + ORIGIN.y + 26} L ${VP.x + ORIGIN.x - 12} ${VP.y + VP.head + ORIGIN.y + 26}`} />
        <circle className="bl-port" cx={VP.x} cy={VP.y + VP.head + ORIGIN.y + 26} r="7" />
        <circle className="bl-plug" cx="660" cy="742" r="6" />
        <circle className="bl-pulse" cx="0" cy="0" r="7" />
      </svg>
    </div>
  );
}

export default defineSlide({
  id: 's2-blender',
  section: 2,
  title: 'Blender',
  steps: 1,
  notes:
    'Connectors (MCP) are the plumbing: they let an AI open and drive the tools we already use.\n' +
    'Click to connect. The request goes in as plain language and the agent works inside Blender itself: it adds the objects, the light and the camera. It does not describe the scene. It builds it.\n' +
    'Let the clip run (45s). Same idea works in Figma, Asana and the rest, which is the next few slides.',
  Component: S2Blender,
});
