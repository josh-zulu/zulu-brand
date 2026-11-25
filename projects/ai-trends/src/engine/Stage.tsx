import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { STAGE_W, STAGE_H } from './types';

/**
 * Fixed 1920×1080 canvas scaled to fit its container, letterboxed. Slides are authored in canvas pixels,
 * so layout is identical on a laptop, a projector or a thumbnail.
 */
export function Stage({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className={`stage-outer ${className}`} style={style}>
      <div
        className="stage"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
          ['--stage-scale' as any]: scale,
        }}
      >
        {/* Mount slides only once the scale is known, so anything they measure on mount is real. */}
        {scale ? children : null}
      </div>
    </div>
  );
}
