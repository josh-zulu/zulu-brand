import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import { SplatView, type SplatViewHandle } from '@/components/SplatView';
import './S3PhotoWorld.css';

/**
 * Source slide 18. One motion idea: a flat photo becomes a place you can move through.
 *  beat 0  a single print sits on the table: one still view of the world
 *  beat 1  the print opens up to fill the window and the camera walks inside it. This is a real 3D world
 *          (World Labs Marble sample "painted bedroom", Gaussian splats) rendered live with World Labs' Spark.
 *  beat 2  the real thing takes over: the World Labs Marble clip (clips/photo-to-world-marble.mp4, clip to add)
 * Live mode: move the mouse over the window to steer the camera.
 */
const SCENE = 'splats/painted_bedroom.spz';

interface Cam { amt: number; walk: number; mx: number; my: number }

function S3PhotoWorld({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const view = useRef<SplatViewHandle>(null);
  const cam = useRef<Cam>({ amt: 0, walk: 0, mx: 0, my: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  // Drive the 3D camera every frame: a slow, unhurried walk into the room, plus the presenter's mouse.
  useEffect(() => {
    const tick = (t: number) => {
      const c = cam.current, s = view.current?.cam;
      if (!s) return;
      c.mx += (mouse.current.x - c.mx) * 0.06; c.my += (mouse.current.y - c.my) * 0.06;
      const sway = Math.sin(t * 0.42) * 0.3 * c.amt, bob = Math.cos(t * 0.31) * 0.05 * c.amt;
      s.px = sway + c.mx * 0.2;
      s.py = 0.05 + bob;
      s.pz = -0.25 - c.walk * 0.9;
      s.tx = s.px - 0.3 + c.mx * 0.9 + Math.sin(t * 0.21) * 0.25 * c.amt;
      s.ty = s.py + 0.15 - c.my * 0.35;
      s.tz = s.pz - 3.6;
    };
    tick(0);
    if (mode === 'preview') return;
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [mode]);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const c = cam.current;
    c.amt = 0; c.walk = 0;

    gsap.set(q('.pw-print'), { scale: 0.56, rotation: -4 });

    // beat 0: the print
    tl.from(q('.pw-kicker'), { opacity: 0, y: 10, duration: 0.8 }, 0);
    revealLines(tl, q('.pw-headline')[0], {}, 0.05);
    revealWords(tl, q('.pw-lede')[0], {}, 0.45);
    tl.from(q('.pw-print'), { y: 120, opacity: 0, rotation: -9, duration: 1.4, ease: 'expo.out' }, 0.2);

    // beat 1: open it up and step inside
    tl.addLabel('b1');
    tl.to(q('.pw-print'), { scale: 1, rotation: 0, borderWidth: 0, borderRadius: 18, duration: 1.4, ease: 'power3.inOut' });
    tl.to(c, { amt: 1, duration: 2.2, ease: 'power2.inOut' }, '<0.5');
    tl.to(c, { walk: 1, duration: 5, ease: 'power1.inOut' }, '<');

    // beat 2: the real thing (Marble)
    tl.addLabel('b2');
    tl.to(q('.pw-print'), { scale: 0.94, opacity: 0.25, filter: 'blur(6px)', duration: 0.9, ease: 'power2.inOut' });
    tl.fromTo(q('.pw-clip'), { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }, '<0.25');
  });

  return (
    <div ref={root} className="photo-world">
      <div className="pw-kicker label"><b>Trend 03</b><span className="pw-kicker-sep">·</span>Next year<span className="pw-rank" aria-hidden>{[0, 1, 2, 3, 4].map((k) => <i key={k} className={k === 2 ? 'on' : ''} />)}</span></div>
      <div className="pw-copy">
        <h2 className="pw-headline headline">Take one photo. Walk around inside it.</h2>
        <p className="pw-lede lede">AI builds a 3D world from it that we can explore and film.</p>
      </div>

      <div
        className="pw-window"
        onPointerMove={(e) => {
          if (step !== 1) return;
          const b = e.currentTarget.getBoundingClientRect();
          mouse.current = { x: ((e.clientX - b.left) / b.width) * 2 - 1, y: ((e.clientY - b.top) / b.height) * 2 - 1 };
        }}
        onPointerLeave={() => { mouse.current = { x: 0, y: 0 }; }}
      >
        <div className="pw-print">
          <SplatView ref={view} src={SCENE} flip className="pw-splat" dpr={mode === 'preview' ? 0.5 : undefined} cam={{ fov: 68 }} />
        </div>
        <ClipFrame className="pw-clip" src="clips/photo-to-world-marble.mp4" label="photo-to-world-marble.mp4" duration="clip to add" mode={mode} playing={step >= 2} />
      </div>
      <div className="pw-credit label">3D world: World Labs Marble · rendered with Spark</div>
    </div>
  );
}

export default defineSlide({
  id: 's3-photo-world',
  section: 4,
  title: 'Photo to 3D world',
  steps: 2,
  notes:
    'Trend three, within the next year.\n' +
    'Take one photo. Walk around inside it. AI builds a 3D world from it that we can explore and film.\n' +
    'Click 1: the photo opens up and the camera walks inside it. This is a real 3D world made with World Labs Marble (their sample scene, credited on the slide), rendered live. You can steer it with the mouse.\n' +
    'Click 2: the real thing, World Labs Marble. Clip to add: clips/photo-to-world-marble.mp4.',
  Component: S3PhotoWorld,
});
