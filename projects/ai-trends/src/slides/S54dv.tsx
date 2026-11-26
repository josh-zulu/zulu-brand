import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { SplatView, type SplatViewHandle } from '@/components/SplatView';
import './S54dv.css';

/**
 * Video you can step inside.
 *  beat 0  a moment plays, then freezes (the timecode stops) … and the camera keeps moving around it.
 *          The moment is a real 3D capture (Gaussian splats): World Labs' forge sample, rendered with their Spark renderer.
 *  beat 1  "step inside": the copy clears, the camera pushes into the scene and swings wider. Cue for the live demo (4DV.ai).
 */
const SCENE = 'splats/forge.spz';

/** Camera state shared by the beat timeline (amp, zoom) and the ambient orbit loop (x, y). */
interface Cam { x: number; y: number; amp: number; zoom: number; shift: number }

// Orbit around the anvil: base angle, distance and height in scene units (scene is flipped to Y-up).
const ORBIT = { yaw: Math.atan2(0.9, -1.9), dist: 2.1, height: 0.25, target: { x: 0, y: 0.15, z: 0 } };

const pad = (n: number) => String(n).padStart(2, '0');
const tc = (frame: number) => `00:00:${pad(Math.floor(frame / 25))}:${pad(frame % 25)}`;

function FourDV({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<SplatViewHandle>(null);
  const cam = useRef<Cam>({ x: 0, y: 0, amp: 0, zoom: 1, shift: 0.55 });

  // The 3D camera and every readout redraw from the same camera state.
  const render = () => {
    const c = cam.current;
    const el = root.current;
    if (!el) return;
    const s = view.current?.cam;
    if (s) {
      const yaw = ORBIT.yaw + c.x * 0.55;
      const dist = ORBIT.dist / c.zoom;
      s.px = ORBIT.target.x + Math.sin(yaw) * dist;
      s.pz = ORBIT.target.z + Math.cos(yaw) * dist;
      s.py = ORBIT.height + c.y * 0.35;
      // shift: look past the subject to the left so it sits right of the headline (0 = centred)
      const rx = Math.cos(yaw), rz = -Math.sin(yaw);
      s.tx = ORBIT.target.x - rx * c.shift; s.ty = ORBIT.target.y; s.tz = ORBIT.target.z - rz * c.shift;
    }
    const deg = c.x * 31.5;
    const read = el.querySelector('.fdv-orbit-val');
    if (read) read.textContent = `${deg >= 0 ? '+' : '−'}${Math.abs(deg).toFixed(1)}°`;
    const dot = el.querySelector<SVGCircleElement>('.fdv-orbit-dot');
    if (dot) {
      const a = (-90 + deg * 1.6) * (Math.PI / 180);
      dot.setAttribute('cx', String(60 + Math.cos(a) * 46));
      dot.setAttribute('cy', String(60 + Math.sin(a) * 46));
    }
  };

  // Ambient orbit: a slow figure-eight around the frozen moment. Its size is set by the beat timeline (cam.amp).
  useGSAP(() => {
    const clock = { t: 0 };
    const c = cam.current;
    const tick = () => {
      const a = clock.t * Math.PI * 2;
      c.x = Math.sin(a) * c.amp;
      c.y = Math.sin(a * 2) * 0.32 * c.amp;
      render();
    };
    if (mode === 'preview') { clock.t = 0.18; c.amp = 1; tick(); return; }
    gsap.to(clock, { t: 1, duration: 16, ease: 'none', repeat: -1, onUpdate: tick });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, { scope: root, dependencies: [mode] });

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const c = cam.current;
    const time = { f: 78 };
    const showTime = () => { const t = q('.fdv-tc')[0]; if (t) t.textContent = tc(Math.round(time.f)); };
    c.amp = 0; c.zoom = 0.92; c.shift = 0.55;
    showTime();
    render();

    // ── beat 0: the moment plays … and stops ─────────────────
    tl.fromTo(q('.fdv-view'), { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0);
    tl.to(c, { zoom: 1, duration: 2.6, ease: 'power2.out', onUpdate: render }, 0);
    tl.from(q('.fdv-kicker'), { opacity: 0, y: 10, duration: 0.8 }, 0.2);
    revealLines(tl, q('.fdv-head')[0], {}, 0.2);
    revealWords(tl, q('.fdv-lede')[0], {}, 0.6);
    tl.from(q('.fdv-live'), { opacity: 0, x: -16, duration: 0.8 }, 0.5);
    tl.from(q('.fdv-bar'), { opacity: 0, duration: 0.8 }, 0.4);
    tl.fromTo(q('.fdv-bar-fill'), { width: '18%' }, { width: '42%', duration: 1.3, ease: 'none' }, 0.4);
    tl.to(time, { f: 112, duration: 1.3, ease: 'none', onUpdate: showTime }, 0.4);
    tl.set(q('.fdv-state-play'), { opacity: 0 }, 1.7);
    tl.fromTo(q('.fdv-state-pause'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.7);
    // time is frozen; the camera starts to move
    tl.from(q('.fdv-orbit'), { opacity: 0, y: 10, duration: 0.8 }, 1.8);
    tl.to(c, { amp: 1, duration: 2.4, ease: 'power2.inOut' }, 1.9);
    tl.addLabel('b1');

    // ── beat 1: step inside ──────────────────────────────────
    tl.to(q('.fdv-copy'), { opacity: 0, y: 40, duration: 0.7, ease: 'power2.in' }, 'b1');
    tl.to(q('.fdv-kicker'), { opacity: 0, duration: 0.5 }, 'b1');
    tl.to(q('.fdv-scrim'), { opacity: 0.35, duration: 1.2, ease: 'power2.inOut' }, 'b1');
    tl.to(c, { zoom: 1.45, amp: 1.5, shift: 0, duration: 2.2, ease: 'power3.inOut', onUpdate: render }, 'b1');
    tl.to(q('.fdv-live'), { scale: 1.18, x: 16, y: 8, duration: 1, ease: 'power3.inOut' }, 'b1+=0.4');
    tl.to(q('.fdv-live'), { '--fdv-live-bg': 'rgba(0, 228, 130, 0.14)', duration: 0.6 }, 'b1+=0.6');
  });

  return (
    <div ref={root} className="fdv is-gl">
      <div className="fdv-view fill">
        <SplatView ref={view} src={SCENE} flip className="fdv-splat fill" dpr={mode === 'preview' ? 0.5 : undefined}
          cam={{ fov: 46 }} onReady={render} />
      </div>
      <div className="fdv-scrim fill" />

      <div className="fdv-kicker label"><b>On our radar</b></div>
      <div className="fdv-live label"><i className="fdv-live-dot" />Live demo <span className="fdv-sep">·</span> 4DV.ai</div>

      <div className="fdv-copy">
        <h2 className="fdv-head headline">Video you can step inside.</h2>
        <p className="fdv-lede lede">Move the camera around a moment after it’s been filmed.</p>
      </div>

      <div className="fdv-orbit" aria-hidden>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="46" className="fdv-orbit-ring" />
          <circle cx="60" cy="60" r="5" className="fdv-orbit-subject" />
          <circle cx="60" cy="14" r="7" className="fdv-orbit-dot" />
        </svg>
        <div className="fdv-orbit-text">
          <span className="label">Camera</span>
          <span className="fdv-orbit-val mono">+0.0°</span>
        </div>
      </div>

      <div className="fdv-bar" aria-hidden>
        <span className="fdv-state label">
          <span className="fdv-state-play"><i className="fdv-play" />Playing</span>
          <span className="fdv-state-pause"><i className="fdv-pause" />Paused</span>
        </span>
        <span className="fdv-track"><span className="fdv-bar-fill" /></span>
        <span className="fdv-tc mono">00:00:03:03</span>
      </div>

      <div className="fdv-credit label">3D scene: World Labs · rendered with Spark</div>
    </div>
  );
}

export default defineSlide({
  id: 's5-4dv',
  section: 4,
  title: 'Video you can step inside',
  steps: 1,
  transition: 'fade',
  notes:
    'About two years out.\n' +
    'Live demo: 4DV.ai. Have it open in a browser tab with a scene loaded before the talk.\n' +
    'On arrival the moment plays, then pauses, and the camera keeps moving around it. That is the idea: the video is stopped, the viewpoint is not.\n' +
    'Click once to "step inside" (the copy clears and the camera pushes in), then switch to 4DV.ai and drag the camera around a real capture.\n' +
    'Backup if the network fails: stay here. The scene on this slide is a real 3D capture (a World Labs sample, credited bottom right), rendered live.',
  Component: FourDV,
});
