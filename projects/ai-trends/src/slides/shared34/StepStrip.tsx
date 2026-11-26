import gsap from 'gsap';
import './shared34.css';

/** Progress strip for a process told one slide per step (AGO pitch, Make-A-Wish): done steps grey, the current one green. */
export function StepStrip({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="p34-strip">
      {steps.map((s, i) => (
        <div key={s} className={`p34-si ${i < active ? 'is-done' : ''} ${i === active ? 'is-on' : ''}`}>
          <span className="p34-si-fill" />
          <span className="label">{String(i + 1).padStart(2, '0')}</span>
          <b>{s}</b>
        </div>
      ))}
    </div>
  );
}

/** Beat-0 entry: the current segment fills. */
export function stripIn(tl: gsap.core.Timeline, root: Element, at = 0.1) {
  tl.from(gsap.utils.selector(root)('.p34-si.is-on .p34-si-fill'), { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }, at);
}

export const AGO_STEPS = ['The brief', 'Gather photos', 'The lab', 'GIF mockups', 'The prototype'];
