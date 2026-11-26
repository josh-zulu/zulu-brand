import { useSyncExternalStore } from 'react';
import type { SlideDef } from './types';
import savedJson from '../order.json';

/**
 * Running order. `src/deck.ts` lists every slide that exists; `src/order.json` decides the order they run in and
 * which are hidden. The slides panel (\) edits a draft of it: drag to reorder, hide or show. The draft lives in this
 * browser (and every open window: deck, presenter view) until "Push to main" saves order.json and presenters.json,
 * checks the build and pushes both. A slide added to deck.ts but missing from order.json runs right after the slide
 * it follows in deck.ts, so new slides never go missing.
 */
export interface OrderConfig { order: string[]; hidden: string[] }

const DRAFT_KEY = 'zak-order-draft';
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zak-order') : null;

const clean = (c: any): OrderConfig => ({
  order: Array.isArray(c?.order) ? c.order.filter((x: unknown) => typeof x === 'string') : [],
  hidden: Array.isArray(c?.hidden) ? c.hidden.filter((x: unknown) => typeof x === 'string') : [],
});

function readDraft(): OrderConfig | null {
  try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? clean(JSON.parse(raw)) : null; } catch { return null; }
}
function writeDraft(d: OrderConfig | null) {
  try { d ? localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) : localStorage.removeItem(DRAFT_KEY); } catch { /* private window */ }
}

let state: { saved: OrderConfig; draft: OrderConfig | null } = { saved: clean(savedJson), draft: readDraft() };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setDraft(draft: OrderConfig | null, broadcast = true) {
  // A draft identical to what's saved is no draft.
  if (draft && same(draft, state.saved)) draft = null;
  state = { ...state, draft };
  writeDraft(draft);
  if (broadcast) channel?.postMessage({ type: 'draft', draft });
  emit();
}
channel?.addEventListener('message', (e) => { if (e.data?.type === 'draft') setDraft(e.data.draft, false); });

// Saving rewrites src/order.json; take the new file without reloading the page.
if (import.meta.hot) {
  import.meta.hot.accept('../order.json', (mod) => {
    if (!mod) return;
    state = { ...state, saved: clean(mod.default) };
    if (state.draft && same(state.draft, state.saved)) setDraft(null, false); else emit();
  });
}

function same(a: OrderConfig, b: OrderConfig) {
  return a.order.join() === b.order.join() && [...a.hidden].sort().join() === [...b.hidden].sort().join();
}

/** Every slide in running order (hidden ones included), with new deck.ts slides slotted in after their neighbour. */
export function resolveOrder(all: SlideDef[], cfg: OrderConfig): SlideDef[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const ids = cfg.order.filter((id, i, arr) => byId.has(id) && arr.indexOf(id) === i);
  all.forEach((s, i) => {
    if (ids.includes(s.id)) return;
    const before = all.slice(0, i).reverse().find((p) => ids.includes(p.id));
    ids.splice(before ? ids.indexOf(before.id) + 1 : 0, 0, s.id);
  });
  return ids.map((id) => byId.get(id)!);
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => state;

export function useOrder(all: SlideDef[]) {
  const { saved, draft } = useSyncExternalStore(subscribe, snapshot);
  const cfg = draft ?? saved;
  const ordered = resolveOrder(all, cfg);
  const hidden = new Set(cfg.hidden);
  return {
    /** Every slide, in order, hidden ones included (for the panel). */
    ordered,
    hidden,
    /** What the deck actually runs. */
    running: ordered.filter((s) => !hidden.has(s.id)),
    dirty: !!draft,
    /** The draft as a full config (every slide listed), ready to save. */
    config: { order: ordered.map((s) => s.id), hidden: ordered.filter((s) => hidden.has(s.id)).map((s) => s.id) } as OrderConfig,
    move(id: string, targetId: string, after: boolean) {
      if (id === targetId) return;
      const ids = ordered.map((s) => s.id).filter((x) => x !== id);
      ids.splice(ids.indexOf(targetId) + (after ? 1 : 0), 0, id);
      setDraft({ order: ids, hidden: [...hidden] });
    },
    toggleHidden(id: string) {
      const next = new Set(hidden);
      next.has(id) ? next.delete(id) : next.add(id);
      setDraft({ order: ordered.map((s) => s.id), hidden: [...next] });
    },
    reset() { setDraft(null); },
    /** After a push: the file on disk now matches the draft. */
    markSaved(cfg: OrderConfig) { state = { ...state, saved: cfg }; setDraft(null); },
  };
}

/** Running slides only, stable while nothing changes (for Deck and Presenter). */
export function useRunningSlides(all: SlideDef[]): SlideDef[] {
  const { saved, draft } = useSyncExternalStore(subscribe, snapshot);
  const cfg = draft ?? saved;
  return memo(all, cfg);
}
let memoKey: [SlideDef[], OrderConfig] | null = null;
let memoVal: SlideDef[] = [];
function memo(all: SlideDef[], cfg: OrderConfig) {
  if (memoKey && memoKey[0] === all && memoKey[1] === cfg) return memoVal;
  const hidden = new Set(cfg.hidden);
  memoKey = [all, cfg];
  memoVal = resolveOrder(all, cfg).filter((s) => !hidden.has(s.id));
  return memoVal;
}
