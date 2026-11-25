import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { media } from '@/lib/asset';

/**
 * Real 3D (Gaussian splat) scene, rendered with World Labs' open-source Spark renderer.
 * Scenes live in public/media/splats/ (World Labs sample scenes; credit them on the slide).
 *
 * The camera is a plain object the slide's GSAP timeline can tween:
 *   const view = useRef<SplatViewHandle>(null);
 *   tl.to(view.current!.cam, { px: 0.4, pz: -0.6, duration: 2 });
 * position (px, py, pz) looks at (tx, ty, tz) with field of view `fov`. Units are the scene's own.
 * The World Labs sample scenes are already Y-up, so no axis flip is applied (pass flip for OpenCV-axis captures).
 * `bounds()` is a robust box (2nd–98th percentile of splat centres), because some files carry invalid splats.
 */
export interface SplatCam { px: number; py: number; pz: number; tx: number; ty: number; tz: number; fov: number }
export interface SplatViewHandle { cam: SplatCam; bounds: () => THREE.Box3 | null; ready: Promise<void>; mesh: () => SplatMesh | null }

export const SplatView = forwardRef<SplatViewHandle, {
  src: string;                 // e.g. "splats/snow-street.spz" (relative to /media/)
  cam?: Partial<SplatCam>;     // starting camera
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;              // rotate 180° about X for OpenCV-axis files
  dpr?: number;                // render resolution multiplier (default: device pixel ratio, max 2)
  paused?: boolean;            // stop the render loop (e.g. preview thumbnails after first frame)
  onReady?: (bounds: THREE.Box3) => void;
}>(function SplatView({ src, cam: initial, className = '', style, flip = false, dpr, paused = false, onReady }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const cam = useRef<SplatCam>({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: -1, fov: 55, ...initial });
  const boundsRef = useRef<THREE.Box3 | null>(null);
  const meshRef = useRef<SplatMesh | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const readyResolve = useRef<() => void>(() => {});
  const ready = useRef(new Promise<void>((r) => { readyResolve.current = r; }));
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({ cam: cam.current, bounds: () => boundsRef.current, ready: ready.current, mesh: () => meshRef.current }), []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch { setFailed(true); return; }
    renderer.setPixelRatio(dpr ?? Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(cam.current.fov, 16 / 9, 0.01, 1000);
    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const url = media(src);
    const mesh = new SplatMesh({ url });
    meshRef.current = mesh;
    if (flip) mesh.quaternion.set(1, 0, 0, 0);
    scene.add(mesh);
    mesh.initialized.then(() => {
      mesh.updateMatrixWorld();
      boundsRef.current = robustBounds(mesh);
      readyResolve.current();
      onReady?.(boundsRef.current);
    }).catch((e) => { console.error("[splat] load failed", url, e); setFailed(true); });

    const size = () => {
      // The stage is CSS-scaled, so measure the layout size (offsetWidth), not the scaled rect.
      const w = el.offsetWidth || 1, h = el.offsetHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const target = new THREE.Vector3();
    renderer.setAnimationLoop(() => {
      if (pausedRef.current) return;
      const c = cam.current;
      camera.position.set(c.px, c.py, c.pz);
      target.set(c.tx, c.ty, c.tz);
      camera.lookAt(target);
      if (camera.fov !== c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      mesh.dispose?.();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div ref={host} className={`splat-view ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {failed && <div className="splat-failed label">3D scene unavailable</div>}
    </div>
  );
});

/** Box spanning the 2nd–98th percentile of splat centres (sampled), in world space. Ignores NaN splats. */
function robustBounds(mesh: SplatMesh) {
  const xs: number[] = [], ys: number[] = [], zs: number[] = [];
  const step = Math.max(1, Math.floor((mesh.numSplats || 1) / 20000));
  mesh.forEachSplat((i: number, c: THREE.Vector3) => {
    if (i % step === 0 && Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.z)) { xs.push(c.x); ys.push(c.y); zs.push(c.z); }
  });
  const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))] ?? 0; };
  const box = new THREE.Box3(new THREE.Vector3(q(xs, 0.02), q(ys, 0.02), q(zs, 0.02)), new THREE.Vector3(q(xs, 0.98), q(ys, 0.98), q(zs, 0.98)));
  return box.applyMatrix4(mesh.matrixWorld);
}
