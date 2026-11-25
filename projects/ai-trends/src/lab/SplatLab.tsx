/**
 * Dev-only page for choosing splat scenes and camera framing: http://localhost:5180/splat-lab.html?s=snow-street
 * Arrow keys / WASD move, Q/E up/down, mouse drag looks around. The current camera is printed so it can be
 * pasted into a slide. window.__lab exposes the camera for scripted checks.
 */
import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { SplatView, type SplatViewHandle } from '@/components/SplatView';

// Only the scenes the deck uses ship in public/media/splats. The other World Labs samples are in assets.raw/splats (copy one back to try it).
const SCENES = ['painted_bedroom', 'forge'];

function Lab() {
  const params = new URLSearchParams(location.search);
  const [scene, setScene] = useState(params.get('s') || SCENES[0]);
  const view = useRef<SplatViewHandle>(null);
  const [info, setInfo] = useState('loading…');

  useEffect(() => {
    const keys = new Set<string>();
    const down = (e: KeyboardEvent) => keys.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    addEventListener('keydown', down); addEventListener('keyup', up);
    let raf = 0;
    const tick = () => {
      const c = view.current?.cam;
      if (c) {
        const s = 0.02;
        const fx = c.tx - c.px, fz = c.tz - c.pz, len = Math.hypot(fx, fz) || 1;
        const dx = (fx / len) * s, dz = (fz / len) * s;
        const mv = (x: number, y: number, z: number) => { c.px += x; c.py += y; c.pz += z; c.tx += x; c.ty += y; c.tz += z; };
        if (keys.has('w') || keys.has('arrowup')) mv(dx, 0, dz);
        if (keys.has('s') || keys.has('arrowdown')) mv(-dx, 0, -dz);
        if (keys.has('a') || keys.has('arrowleft')) mv(dz, 0, -dx);
        if (keys.has('d') || keys.has('arrowright')) mv(-dz, 0, dx);
        if (keys.has('q')) mv(0, s, 0);
        if (keys.has('e')) mv(0, -s, 0);
        setInfo(`px:${c.px.toFixed(2)} py:${c.py.toFixed(2)} pz:${c.pz.toFixed(2)}  tx:${c.tx.toFixed(2)} ty:${c.ty.toFixed(2)} tz:${c.tz.toFixed(2)}  fov:${c.fov}`);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    let drag: { x: number; y: number } | null = null;
    const md = (e: MouseEvent) => { drag = { x: e.clientX, y: e.clientY }; };
    const mm = (e: MouseEvent) => {
      const c = view.current?.cam; if (!drag || !c) return;
      const yaw = (e.clientX - drag.x) * -0.004, pitch = (e.clientY - drag.y) * -0.004;
      drag = { x: e.clientX, y: e.clientY };
      const vx = c.tx - c.px, vy = c.ty - c.py, vz = c.tz - c.pz;
      const cos = Math.cos(yaw), sin = Math.sin(yaw);
      c.tx = c.px + vx * cos - vz * sin; c.tz = c.pz + vx * sin + vz * cos; c.ty = c.py + vy + pitch;
    };
    const mu = () => { drag = null; };
    addEventListener('mousedown', md); addEventListener('mousemove', mm); addEventListener('mouseup', mu);
    (window as any).__lab = { view };
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('mousedown', md); removeEventListener('mousemove', mm); removeEventListener('mouseup', mu); };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
        {SCENES.map((s) => <button key={s} onClick={() => { history.replaceState(null, '', `?s=${s}`); setScene(s); }} style={{ fontWeight: s === scene ? 700 : 400 }}>{s}</button>)}
        <code style={{ marginLeft: 12 }}>{info}</code>
      </div>
      <SplatView key={scene} ref={view} src={`splats/${scene}.spz`} style={{ width: '100%', height: '100%' }}
        onReady={(b) => console.log('[lab] bounds', scene, b.min.toArray().map((v) => +v.toFixed(2)), b.max.toArray().map((v) => +v.toFixed(2)))} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Lab />);
