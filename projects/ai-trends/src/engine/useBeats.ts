import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * The deck's motion contract: one paused GSAP timeline per slide, cut into beats by labels.
 *
 *   useBeats(scope, step, (tl) => {
 *     // beat 0: the entry animation, plays when the slide arrives
 *     tl.from('.title', { yPercent: 100 });
 *     tl.addLabel('b1');            // ← everything after this plays on click 1
 *     tl.to('.bubble', { opacity: 1 });
 *     tl.addLabel('b2');            // ← click 2
 *     tl.to('.grid', { scale: 1 });
 *   });
 *
 * Going forward plays up to the next label. Going back rewinds quickly to that beat's end state.
 * Looping ambience (blinking cursors, drifting particles) should be separate tweens, not on `tl`.
 * Selectors are scoped to `scope`, and everything is cleaned up when the slide unmounts.
 */
export function useBeats(
  scope: RefObject<HTMLElement | null>,
  step: number,
  build: (tl: gsap.core.Timeline, ctx: { step: number }) => void,
  deps: unknown[] = [],
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const lastStep = useRef(step);

  useGSAP(
    () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1 } });
      build(tl, { step });
      tlRef.current = tl;
      // Dev aid: the most recently built slide timeline, for scrubbing from the console (__beats.seek(3.2)).
      if (import.meta.env.DEV) (window as any).__beats = tl;
      // Arriving mid-slide (deep link, going back): jump straight to that beat's end state.
      if (step > 0) tl.seek(labelTime(tl, step + 1), false);
      else tl.tweenTo(labelTime(tl, 1));
      lastStep.current = step;
    },
    { scope, dependencies: deps },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || step === lastStep.current) return;
    const target = labelTime(tl, step + 1);
    if (step > lastStep.current) {
      // Forward: if the previous beat is still animating, finish it first so beats never blend.
      if (tl.time() < labelTime(tl, lastStep.current + 1)) tl.seek(labelTime(tl, lastStep.current + 1));
      tl.tweenTo(target);
    } else {
      tl.tweenTo(target, { duration: Math.min(0.45, Math.abs(tl.time() - target)), ease: 'power2.inOut' });
    }
    lastStep.current = step;
  }, [step]);

  return tlRef;
}

/**
 * Where beat n-1 rests: just before label `b{n}` (or the end of the timeline).
 * Stopping a hair early matters: a zero-duration tl.set / tl.call placed exactly on a label belongs to the
 * NEXT beat, and GSAP would fire it if the playhead landed exactly on the label.
 */
const EPS = 0.0005;
function labelTime(tl: gsap.core.Timeline, n: number) {
  const t = tl.labels[`b${n}`];
  return t === undefined ? tl.duration() : Math.max(0, t - EPS);
}
