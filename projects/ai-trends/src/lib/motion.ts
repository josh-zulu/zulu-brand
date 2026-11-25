/**
 * Motion helpers for beat timelines (see engine/useBeats.ts). Each takes the slide timeline and appends to it,
 * so slides read as a script: reveal the headline, type the reply, count the number, draw the line.
 * All of them are reversible (scrubbing back through beats works).
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

type Pos = gsap.Position | undefined;

/** Masked line-by-line rise. The house way to bring in a headline. */
export function revealLines(tl: gsap.core.Timeline, target: Element | string | null, vars: gsap.TweenVars = {}, position?: Pos) {
  if (!target) return tl;
  const split = SplitText.create(target, { type: 'lines', mask: 'lines', linesClass: 'line' });
  return tl.from(split.lines, { yPercent: 105, duration: 1.1, ease: 'zak.out', stagger: 0.09, ...vars }, position);
}

/** Word-by-word fade/blur. Softer; good for ledes. */
export function revealWords(tl: gsap.core.Timeline, target: Element | string | null, vars: gsap.TweenVars = {}, position?: Pos) {
  if (!target) return tl;
  const split = SplitText.create(target, { type: 'words', wordsClass: 'word' });
  return tl.from(split.words, { opacity: 0, filter: 'blur(8px)', y: 12, duration: 0.8, ease: 'power3.out', stagger: 0.025, ...vars }, position);
}

/**
 * Typewriter: writes `text` into `el` at `cps` characters per second. Put a <span class="caret blink" /> after `el`
 * and it follows the text for free.
 */
export function typeInto(tl: gsap.core.Timeline, el: Element | null, text: string, opts: { cps?: number; ease?: string } = {}, position?: Pos) {
  if (!el) return tl;
  const state = { n: 0 };
  const cps = opts.cps ?? 38;
  el.textContent = '';
  return tl.to(state, {
    n: text.length,
    duration: text.length / cps,
    ease: opts.ease ?? 'none',
    onUpdate: () => { el.textContent = text.slice(0, Math.round(state.n)); },
  }, position);
}

/** Number counts up into `el`, formatted, with optional suffix (e.g. '%'). */
export function countUp(tl: gsap.core.Timeline, el: Element | null, to: number, opts: { from?: number; suffix?: string; duration?: number; decimals?: number } = {}, position?: Pos) {
  if (!el) return tl;
  const state = { v: opts.from ?? 0 };
  const fmt = (v: number) => `${v.toFixed(opts.decimals ?? 0)}${opts.suffix ?? ''}`;
  el.textContent = fmt(state.v);
  return tl.to(state, { v: to, duration: opts.duration ?? 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(state.v); } }, position);
}

/** Self-drawing stroke (SVG path/line/rect). */
export function drawOn(tl: gsap.core.Timeline, target: Element | string | null, vars: gsap.TweenVars = {}, position?: Pos) {
  if (!target) return tl;
  return tl.fromTo(target, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'zak.settle', ...vars }, position);
}

/** Deterministic pseudo-random generator (mulberry32) so "random" layouts are identical every run. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
