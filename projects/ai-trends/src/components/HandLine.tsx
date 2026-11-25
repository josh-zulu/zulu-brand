import { useMemo } from 'react';
import { rng } from '@/lib/motion';

/**
 * The human mark. A pencil-like line with a slight wobble and an uneven, pressure-ish edge.
 * It is the only hand-made element in the deck: it appears on "the part that stays human" and returns at the close.
 * Animate it with drawOn(tl, el.querySelectorAll('.hand-stroke')).
 *
 * Default shape is a confident underline: starts light, sweeps right with a faint rise, ends with a small flick.
 */
export function HandLine({
  width = 1200,
  height = 80,
  seed = 7,
  color = 'currentColor',
  stroke = 7,
  className = '',
  style,
  d,
}: {
  width?: number; height?: number; seed?: number; color?: string; stroke?: number;
  className?: string; style?: React.CSSProperties; d?: string;
}) {
  const path = useMemo(() => d ?? underlinePath(width, height, seed), [d, width, height, seed]);
  const fid = `hand-rough-${seed}`;
  return (
    <svg className={`hand-line ${className}`} style={style} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden>
      <defs>
        <filter id={fid} x="-5%" y="-50%" width="110%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`} stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* body */}
        <path className="hand-stroke" d={path} strokeWidth={stroke} />
        {/* a second, thinner pass slightly offset: reads as graphite grain and pressure */}
        <path className="hand-stroke" d={path} strokeWidth={stroke * 0.45} opacity={0.55} transform="translate(1.5 -1.2)" />
      </g>
    </svg>
  );
}

/**
 * A stroke that travels in from off-canvas and settles as an underline from (x1, y) to (x2, y).
 * Returns the full path plus the approach segment alone, so a timeline can draw everything and then
 * erase the approach: drawOn(…), then tl.to(paths, { drawSVG: `${approachFraction * 100}% 100%` }).
 */
export function travellingUnderline({ from, x1, x2, y, seed = 11 }: { from: { x: number; y: number }; x1: number; x2: number; y: number; seed?: number }) {
  const r = rng(seed);
  const w = x2 - x1;
  // approach: a loose, unhurried curve that dips below the line and comes up into its start
  const approach = `M ${from.x} ${from.y} C ${from.x + (x1 - from.x) * 0.45} ${from.y - 40 - r() * 40}, ${x1 - 160} ${y + 120 + r() * 30}, ${x1} ${y + 4}`;
  // underline: slight rise across, a hair of wobble, and a pen-lift flick at the end
  const under = ` C ${x1 + w * 0.3} ${y + 10 + r() * 6}, ${x1 + w * 0.68} ${y - 10 - r() * 6}, ${x2} ${y - 6} q 26 -4 40 -20`;
  return { d: approach + under, approachD: approach };
}

/** Length helper that works on detached paths (for computing the approach fraction). */
export function pathLength(d: string) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  return p.getTotalLength();
}

function underlinePath(w: number, h: number, seed: number) {
  const r = rng(seed);
  const pad = 10;
  const y0 = h * 0.62 + (r() - 0.5) * 6;
  const y1 = h * 0.42 + (r() - 0.5) * 8;
  const c1x = w * (0.28 + r() * 0.08), c1y = h * (0.72 + r() * 0.08);
  const c2x = w * (0.66 + r() * 0.08), c2y = h * (0.36 + r() * 0.08);
  const endX = w - pad - 40;
  // main sweep, then a short tail flick (pen lifting off)
  return `M ${pad} ${y0} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${y1} q 22 -6 34 -18`;
}
