/**
 * The ZAK mark, rebuilt as geometry from the master logo: Z (bar, diagonal, two dots), A (dot over a dash),
 * K (dot and two diagonals). Pills and dots only. Exported pieces let slides animate the mark part by part.
 * Coordinates are in a 1100×850 box (same as brand/logos/zak-hero-cities.png).
 */
export const ZAK_W = 1100;
export const ZAK_H = 850;
const T = 66;   // pill thickness
const R = 50;   // dot radius

export type ZakPart =
  | { kind: 'pill'; id: string; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'dot'; id: string; cx: number; cy: number };

export const ZAK_PARTS: ZakPart[] = [
  { kind: 'pill', id: 'z-top', x1: 83, y1: 284, x2: 372, y2: 284 },
  { kind: 'pill', id: 'z-diag', x1: 342, y1: 392, x2: 172, y2: 618 },
  { kind: 'dot', id: 'z-dot-1', cx: 97, cy: 742 },
  { kind: 'dot', id: 'z-dot-2', cx: 350, cy: 742 },
  { kind: 'dot', id: 'a-dot', cx: 605, cy: 285 },
  { kind: 'pill', id: 'a-dash', x1: 451, y1: 516, x2: 740, y2: 516 },
  { kind: 'dot', id: 'k-dot', cx: 880, cy: 515 },
  { kind: 'pill', id: 'k-up', x1: 950, y1: 405, x2: 1040, y2: 272 },
  { kind: 'pill', id: 'k-down', x1: 950, y1: 627, x2: 1022, y2: 760 },
];

/** Pill as a rotated rounded rect (so it can be filled, stroked, or drawn on). */
export function pillGeom(p: Extract<ZakPart, { kind: 'pill' }>) {
  const dx = p.x2 - p.x1, dy = p.y2 - p.y1;
  const len = Math.hypot(dx, dy) + T;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (p.x1 + p.x2) / 2, cy = (p.y1 + p.y2) / 2;
  return { cx, cy, len, angle, t: T };
}

export function ZakPartShape({ part, className }: { part: ZakPart; className?: string }) {
  if (part.kind === 'dot') return <circle className={className} data-part={part.id} cx={part.cx} cy={part.cy} r={R} />;
  const g = pillGeom(part);
  return (
    <rect
      className={className}
      data-part={part.id}
      x={g.cx - g.len / 2}
      y={g.cy - g.t / 2}
      width={g.len}
      height={g.t}
      rx={g.t / 2}
      transform={`rotate(${g.angle} ${g.cx} ${g.cy})`}
    />
  );
}

/** Small solid mark for chrome. Inherits currentColor. */
export function ZakMark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox={`40 200 1050 620`} fill="currentColor" aria-label="Zulu Alpha Kilo">
      {ZAK_PARTS.map((p) => <ZakPartShape key={p.id} part={p} />)}
    </svg>
  );
}
