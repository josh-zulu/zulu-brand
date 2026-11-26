import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { barGradient, gsap, level, prefersReducedMotion } from '../lib/motion';

/**
 * The rainbow equalizer mark: the site's whole motion language.
 *   energy 1   = music playing (bars bounce)
 *   energy 0   = silence (bars sit flat as dots)
 * `gain` multiplies energy, so an arrival animation (gain) and a scroll animation (energy) never fight.
 * Parents drive `energy` (and optionally `sat`, `spread`) through the handle, usually from a ScrollTrigger.
 * With reduced motion the bars hold a still, designed profile instead of bouncing.
 */
export type EqHandle = {
  state: { energy: number; gain: number; sat: number; spread: number; sync: number };
  el: HTMLDivElement | null;
};

type Props = {
  bars?: number;
  /** 'up' grows from the bottom, 'down' hangs from the top, 'mid' grows both ways. */
  anchor?: 'up' | 'down' | 'mid';
  energy?: number;
  /** Minimum bar height as a fraction, the "dot" when silent. */
  floor?: number;
  speed?: number;
  /** 0..1: 1 = all bars move together (a wave), 0 = each bar on its own. */
  sync?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

const STILL = [0.35, 0.6, 0.45, 0.8, 0.55, 1, 0.7, 0.85, 0.5, 0.65, 0.4, 0.3];

export const EqBars = forwardRef<EqHandle, Props>(function EqBars(
  { bars = 11, anchor = 'up', energy = 1, floor = 0.08, speed = 1, sync = 0, className = '', style, label },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  const state = useRef({ energy, gain: 1, sat: 1, spread: 0, sync });
  useImperativeHandle(ref, () => ({ state: state.current, get el() { return root.current; } }), []);

  useEffect(() => { state.current.energy = energy; }, [energy]);

  useEffect(() => {
    const el = root.current!;
    const kids = Array.from(el.children) as HTMLElement[];
    const reduced = prefersReducedMotion();
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(el);
    const draw = (t: number) => {
      const s = state.current;
      const n = kids.length;
      for (let i = 0; i < n; i++) {
        const own = reduced ? STILL[i % STILL.length] : level(t * speed, i);
        const wave = reduced ? STILL[i % STILL.length] : 0.5 + 0.5 * Math.sin(t * speed * 2.4 - i * 0.45);
        const v = own * (1 - s.sync) + wave * s.sync;
        const h = floor + (1 - floor) * v * s.energy * s.gain;
        const k = kids[i];
        // Height (not scaleY) keeps the rounded caps round when the bar shrinks to a dot. The container uses
        // `contain: layout paint`, so this layout work stays inside it.
        k.style.height = `${(h * 100).toFixed(2)}%`;
        k.style.transform = s.spread ? `translateX(${(i - (n - 1) / 2) * s.spread}px)` : '';
        k.style.filter = s.sat < 1 ? `saturate(${s.sat.toFixed(2)})` : '';
      }
    };
    if (reduced) {
      // Still frame, but parents can still move energy/sat/spread (e.g. on scroll); redraw cheaply on change.
      draw(0);
      const tick = () => draw(0);
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); io.disconnect(); };
    }
    const tick = (time: number) => { if (visible) draw(time); };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); };
  }, [floor, speed]);

  return (
    <div
      ref={root}
      className={`eq eq--${anchor} ${className}`}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="eq__bar" style={{ background: barGradient(i, bars) }} />
      ))}
    </div>
  );
});
