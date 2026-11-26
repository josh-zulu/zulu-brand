import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

const KEY = 'sth-motion';
export const REDUCED = '(prefers-reduced-motion: reduce)';

/** The visitor's own choice on this site (the nav's pause button, or ?motion=reduce|full for testing). */
function readUserReduced() {
  try {
    const q = new URLSearchParams(location.search).get('motion');
    if (q === 'reduce' || q === 'full') return q === 'reduce';
    return localStorage.getItem(KEY) === 'reduce';
  } catch { return false; }
}
export const USER_REDUCED = readUserReduced();
if (USER_REDUCED) document.documentElement.classList.add('reduce-motion');

export function systemReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia(REDUCED).matches;
}

/**
 * Query used by gsap.matchMedia(): scroll choreography only runs when neither the system setting nor the
 * site's pause button asks for less motion. 'not all' never matches.
 */
export const MOTION_OK = USER_REDUCED ? 'not all' : '(prefers-reduced-motion: no-preference)';

export function prefersReducedMotion() {
  return USER_REDUCED || systemReducedMotion();
}

/** Pause or resume animations site-wide (WCAG 2.2.2). Reloads so every timeline is rebuilt in the right mode. */
export function setUserReduced(reduce: boolean) {
  try { localStorage.setItem(KEY, reduce ? 'reduce' : 'full'); } catch { /* ignore */ }
  const url = new URL(location.href);
  url.searchParams.delete('motion');
  location.replace(url);
}

/** Live value of prefers-reduced-motion (system or site). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = matchMedia(REDUCED);
    const on = () => setReduced(prefersReducedMotion());
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** The rainbow from the equalizer mark, red to violet. Bar i uses SPECTRUM[i] → SPECTRUM[i+1]. */
export const SPECTRUM = ['#ff4a50', '#ff6f3c', '#ff9f2e', '#ffcb3a', '#a6dc55', '#3fd49a', '#2ec4d6', '#3b8bff', '#5b62ff', '#8a4dff', '#b34de6', '#d94dc0'];

export function barGradient(i: number, n: number) {
  const a = SPECTRUM[Math.round((i / Math.max(1, n - 1)) * (SPECTRUM.length - 2))];
  const b = SPECTRUM[Math.round((i / Math.max(1, n - 1)) * (SPECTRUM.length - 2)) + 1];
  return `linear-gradient(180deg, ${a}, ${b})`;
}

/** Cheap smooth pseudo-noise for bar levels: sum of sines with per-bar phase. Returns 0..1. */
export function level(t: number, i: number) {
  const v = Math.sin(t * 2.1 + i * 1.7) * 0.5 + Math.sin(t * 3.7 + i * 0.6) * 0.3 + Math.sin(t * 6.3 + i * 2.9) * 0.2;
  return 0.5 + v * 0.5;
}

// Dev aid: inspect triggers from the console (`__st.getAll()`), scrub with `__gsap.globalTimeline`.
if (import.meta.env.DEV) Object.assign(window, { __st: ScrollTrigger, __gsap: gsap });
