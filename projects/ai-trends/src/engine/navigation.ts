import { useCallback, useEffect, useRef, useState } from 'react';
import type { SlideDef } from './types';
import { createSync, type DeckPosition } from './sync';

export interface Nav {
  pos: DeckPosition;
  direction: 1 | -1;
  blank: boolean;
  next: () => void;
  prev: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goto: (index: number, step?: number) => void;
  setBlank: (on: boolean) => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function parseHash(slides: SlideDef[]): DeckPosition {
  const [, id, s] = location.hash.split('/');
  const index = slides.findIndex((x) => x.id === decodeURIComponent(id || ''));
  if (index < 0) return { index: 0, step: 0 };
  return { index, step: clamp(Number(s) || 0, 0, slides[index].steps ?? 0) };
}

/** Deck position, keyboard-free. Syncs to the URL hash and to other windows (presenter ⇄ audience). */
export function useDeckNav(slides: SlideDef[]): Nav {
  const [pos, setPos] = useState<DeckPosition>(() => parseHash(slides));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [blank, setBlankState] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;
  const syncRef = useRef<ReturnType<typeof createSync> | null>(null);

  const apply = useCallback((p: DeckPosition, broadcast = true) => {
    const cur = posRef.current;
    if (p.index === cur.index && p.step === cur.step) return;
    setDirection(p.index > cur.index || (p.index === cur.index && p.step > cur.step) ? 1 : -1);
    setPos(p);
    posRef.current = p;
    history.replaceState(null, '', `#/${slides[p.index].id}/${p.step}`);
    if (broadcast) syncRef.current?.goto(p);
  }, [slides]);

  useEffect(() => {
    const sync = createSync((m) => {
      if (m.type === 'goto') apply(m.pos, false);
      if (m.type === 'hello') sync.goto(posRef.current);
      if (m.type === 'blank') setBlankState(m.on);
    });
    syncRef.current = sync;
    sync.hello();
    // The running order changed (slides panel draft, or a saved order.json): stay on the same slide by id. If it was
    // just hidden, stay at the same position instead.
    const [, id] = location.hash.split('/');
    const at = slides.findIndex((x) => x.id === decodeURIComponent(id || ''));
    const cur = posRef.current;
    const p = at >= 0 ? { index: at, step: at === cur.index ? cur.step : clamp(cur.step, 0, slides[at].steps ?? 0) }
      : { index: clamp(cur.index, 0, slides.length - 1), step: 0 };
    if (p.index !== cur.index || p.step !== cur.step) { posRef.current = p; setPos(p); }
    history.replaceState(null, '', `#/${slides[p.index].id}/${p.step}`);
    const onHash = () => apply(parseHash(slides));
    addEventListener('hashchange', onHash);
    return () => { sync.close(); removeEventListener('hashchange', onHash); };
  }, [apply, slides]);

  const steps = (i: number) => slides[i]?.steps ?? 0;

  const next = useCallback(() => {
    const { index, step } = posRef.current;
    if (step < steps(index)) apply({ index, step: step + 1 });
    else if (index < slides.length - 1) apply({ index: index + 1, step: 0 });
  }, [apply, slides]);

  const prev = useCallback(() => {
    const { index, step } = posRef.current;
    if (step > 0) apply({ index, step: step - 1 });
    else if (index > 0) apply({ index: index - 1, step: steps(index - 1) });
  }, [apply, slides]);

  const nextSlide = useCallback(() => {
    const { index } = posRef.current;
    if (index < slides.length - 1) apply({ index: index + 1, step: 0 });
  }, [apply, slides]);

  const prevSlide = useCallback(() => {
    const { index, step } = posRef.current;
    if (step > 0) apply({ index, step: 0 });
    else if (index > 0) apply({ index: index - 1, step: 0 });
  }, [apply, slides]);

  const goto = useCallback((index: number, step = 0) => {
    const i = clamp(index, 0, slides.length - 1);
    apply({ index: i, step: clamp(step, 0, steps(i)) });
  }, [apply, slides]);

  const setBlank = useCallback((on: boolean) => { setBlankState(on); syncRef.current?.blank(on); }, []);

  return { pos, direction, blank, next, prev, nextSlide, prevSlide, goto, setBlank };
}

export interface KeyHandlers {
  nav: Nav;
  toggleOverview: () => void;
  toggleHelp: () => void;
  openPresenter?: () => void;
  closeOverlays: () => boolean;
}

/** Clicker- and keyboard-friendly bindings. Clickers send PageUp/PageDown or arrows. */
export function useDeckKeys({ nav, toggleOverview, toggleHelp, openPresenter, closeOverlays }: KeyHandlers) {
  const goBuffer = useRef('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) { goBuffer.current += k; return; }
      if (k === 'Enter' && goBuffer.current) { nav.goto(Number(goBuffer.current) - 1); goBuffer.current = ''; e.preventDefault(); return; }
      goBuffer.current = '';
      switch (k) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
          e.preventDefault(); e.shiftKey ? nav.nextSlide() : nav.next(); break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
          e.preventDefault(); e.shiftKey ? nav.prevSlide() : nav.prev(); break;
        case 'Home': nav.goto(0); break;
        case 'End': nav.goto(Number.MAX_SAFE_INTEGER); break;
        case 'o': case 'O': toggleOverview(); break;
        case 'Escape': if (!closeOverlays()) toggleOverview(); break;
        case '?': toggleHelp(); break;
        case 'b': case 'B': case '.': nav.setBlank(!nav.blank); break;
        case 'p': case 'P': openPresenter?.(); break;
        case 'f': case 'F':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen?.();
          break;
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [nav, toggleOverview, toggleHelp, openPresenter, closeOverlays]);
}
