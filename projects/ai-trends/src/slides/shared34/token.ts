/** Read a brand token (CSS custom property) as a concrete value, for GSAP tweens that can't interpolate var(). */
export const token = (name: string, fallback = '') =>
  (typeof document !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;
