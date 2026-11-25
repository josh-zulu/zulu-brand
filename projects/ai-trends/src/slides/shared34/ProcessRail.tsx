import gsap from 'gsap';
import './shared34.css';
import { media } from '@/lib/asset';

/**
 * A process as a rail of steps (source slides 20 and 26). Every step is visible but dim from the start so the room
 * can read the plan; railLight() lights one step per beat: a signal pulse travels the dashed track to the node,
 * the track fills behind it, the icon turns green and the copy comes up to full strength.
 */
export interface RailStep { icon: string; title: string; sub: string }

const icon = (src: string) => media(src);

export function ProcessRail({ steps, className = '', style }: { steps: RailStep[]; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`p34-rail ${className}`} style={{ ['--n' as string]: steps.length, ...style }}>
      <div className="p34-rail-track"><div className="p34-rail-fill" /><div className="p34-rail-pulse" /></div>
      {steps.map((s, i) => (
        <div key={i} className="p34-step">
          <div className="p34-node"><img src={icon(s.icon)} alt="" draggable={false} /><span className="p34-node-ring" /></div>
          <div className="p34-step-num label">{String(i + 1).padStart(2, '0')}</div>
          <div className="p34-step-title">{s.title}</div>
          <div className="p34-step-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/** Append "light step i" to the beat timeline (at `at`, default the end). Returns the time the step is fully lit. */
export function railLight(tl: gsap.core.Timeline, root: Element, i: number, at?: number) {
  const q = gsap.utils.selector(root);
  const steps = q('.p34-step');
  const n = steps.length;
  const step = steps[i];
  const sq = gsap.utils.selector(step);
  const s = at ?? tl.duration();
  const travel = i === 0 ? 0.35 : 0.85;
  const frac = n > 1 ? i / (n - 1) : 0;

  tl.to(q('.p34-rail-pulse'), { opacity: 1, left: `${frac * 100}%`, duration: travel, ease: 'power3.inOut' }, s);
  tl.to(q('.p34-rail-fill'), { scaleX: frac, duration: travel, ease: 'power3.inOut' }, s);
  const lit = s + travel * 0.75;
  tl.to(sq('.p34-node img'), { filter: 'grayscale(0) brightness(1) opacity(1)', duration: 0.5, ease: 'power2.out' }, lit);
  tl.fromTo(sq('.p34-node-ring'), { opacity: 0, scale: 0.72 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, lit);
  tl.to(sq('.p34-step-num'), { color: '#00e482', duration: 0.4 }, lit);
  tl.to(sq('.p34-step-title, .p34-step-sub'), { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, lit);
  if (i > 0) tl.to(gsap.utils.selector(steps[i - 1])('.p34-node-ring'), { opacity: 0.3, duration: 0.6 }, lit);
  return lit + 0.6;
}
