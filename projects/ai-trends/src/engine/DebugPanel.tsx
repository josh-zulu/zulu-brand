import { useCallback, useEffect, useRef, useState } from 'react';
import type { SlideDef } from './types';
import { SECTIONS } from './types';
import { PRESENTERS, type Presenter, usePresenters } from './presenters';
import { useOrder } from './order';
import { KEYS, PANEL_KEYS } from './keys';

/**
 * Rehearsal panel: a small "Slides" button (bottom left, or the \ key) opens a side list of every slide.
 *  - Click a title to jump there. Tap a name (or press J, K, H) to assign who presents the current slide.
 *  - Drag a row by its handle to move it; Hide leaves a slide out of the run without deleting it.
 *    Moves and hides are a draft in this browser until "Push to main".
 *  - "Push to main" saves the running order (src/order.json) and presenters (public/presenters.json), checks the
 *    build, and pushes both, so Kyle and Hiep get them on their next pull. Dev server only.
 *  - While open, the presenting keys are mapped in the top-right corner.
 * Hidden while the deck is fullscreen, so it never shows on the projector.
 */
type Push = { state: 'idle' | 'busy' | 'done' | 'error'; message?: string; detail?: string };

export function DebugPanel({ all, current, onPick }: { all: SlideDef[]; current?: string; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Presenter | 'All'>('All');
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  const { map, assign, saveError } = usePresenters();
  const order = useOrder(all);
  const curRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; over?: string; after?: boolean } | null>(null);
  const [unpushed, setUnpushed] = useState<string[] | null>(null); // null = can't tell (no dev server)
  const [push, setPush] = useState<Push>({ state: 'idle' });

  const refreshStatus = useCallback(() => {
    fetch('/api/publish').then((r) => (r.ok ? r.json() : null)).then((s) => setUnpushed(s ? s.changed : null)).catch(() => setUnpushed(null));
  }, []);
  useEffect(() => { if (open) refreshStatus(); }, [open, map, refreshStatus]);

  // "Slide 05 · 1B · The part that stays human (s1-human)": easy to paste into chat and unambiguous to find in code.
  const copyRef = (s: SlideDef, n: number) => {
    const text = `Slide ${String(n).padStart(2, '0')} · ${s.title} (${s.id})`;
    const done = () => { setCopied(s.id); setTimeout(() => setCopied((c) => (c === s.id ? null : c)), 1400); };
    navigator.clipboard?.writeText(text).then(done).catch(() => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } finally { ta.remove(); }
    });
  };

  // \ toggles; while open, J / K / H assign the current slide (press again to clear).
  const stateRef = useRef({ open, current, map });
  stateRef.current = { open, current, map };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest?.('input,textarea,[contenteditable]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '\\') { setOpen((o) => !o); return; }
      const { open, current, map } = stateRef.current;
      const who = PRESENTERS.find((p) => p[0].toLowerCase() === e.key.toLowerCase());
      if (open && current && who) assign(current, map[current] === who ? null : who);
    };
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => { removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); };
  }, [assign]);

  useEffect(() => { if (open) curRef.current?.scrollIntoView({ block: 'center' }); }, [open, current]);

  const doPush = async () => {
    setPush({ state: 'busy', message: 'Checking the build, then pushing…' });
    const cfg = order.config;
    try {
      const r = await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: cfg }) });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) { setPush({ state: 'error', message: b.error || `Push failed (${r.status})`, detail: b.detail }); refreshStatus(); return; }
      order.markSaved(cfg);
      setPush({ state: 'done', message: b.message });
      refreshStatus();
      setTimeout(() => setPush((p) => (p.state === 'done' ? { state: 'idle' } : p)), 4000);
    } catch {
      setPush({ state: 'error', message: 'Needs the dev server (npm run dev) on this laptop' });
    }
  };

  if (fullscreen) return null;

  const running = order.ordered.filter((s) => !order.hidden.has(s.id));
  const counts = Object.fromEntries(PRESENTERS.map((p) => [p, running.filter((s) => map[s.id] === p).length]));
  const unassigned = running.filter((s) => !map[s.id]).length;
  const canDrag = filter === 'All';
  const pending = [...(order.dirty ? ['running order'] : []), ...(unpushed?.includes('presenters') ? ['presenters'] : []),
    ...(!order.dirty && unpushed?.includes('order') ? ['running order'] : [])];
  let lastSection = -1;
  let n = 0;

  return (
    <>
      <button className={`dbg-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} title="Slides and presenters (\)">
        <i /><i /><i /> Slides{(order.dirty || !!unpushed?.length) && <em className="dbg-dot" title="Changes not pushed" />}
      </button>
      {open && (
        <>
          <aside className="dbg-panel" onKeyDown={(e) => e.stopPropagation()}>
            <header className="dbg-head">
              <div className="dbg-title">Slides & presenters</div>
              <button className="dbg-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </header>
            <div className="dbg-filter">
              {(['All', ...PRESENTERS] as const).map((p) => (
                <button key={p} className={filter === p ? 'on' : ''} onClick={() => setFilter(p)}>
                  {p}{p !== 'All' && <b>{counts[p]}</b>}
                </button>
              ))}
            </div>
            <div className="dbg-meta">
              {running.length} slides{order.hidden.size ? ` · ${order.hidden.size} hidden` : ''} · {unassigned ? `${unassigned} unassigned` : 'every slide has a presenter'}
              {saveError && <span className="dbg-err"> · not saved (dev server needed)</span>}
            </div>
            <div className="dbg-list" onDragEnd={() => setDrag(null)}>
              {order.ordered.map((s) => {
                const hidden = order.hidden.has(s.id);
                const num = hidden ? null : ++n;
                if (filter !== 'All' && map[s.id] !== filter) return null;
                const header = s.section !== lastSection ? (lastSection = s.section, true) : false;
                const isOver = drag?.over === s.id && drag.id !== s.id;
                return (
                  <div key={s.id}>
                    {header && <div className="dbg-section">0{s.section} · {SECTIONS[s.section]}</div>}
                    <div
                      ref={s.id === current ? curRef : undefined}
                      className={`dbg-row ${s.id === current ? 'is-current' : ''} ${hidden ? 'is-hidden' : ''} ${drag?.id === s.id ? 'is-dragging' : ''} ${isOver ? (drag!.after ? 'drop-after' : 'drop-before') : ''}`}
                      draggable={canDrag}
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', s.id); setDrag({ id: s.id }); }}
                      onDragOver={(e) => {
                        if (!drag) return;
                        e.preventDefault();
                        const r = e.currentTarget.getBoundingClientRect();
                        const after = e.clientY > r.top + r.height / 2;
                        if (drag.over !== s.id || drag.after !== after) setDrag({ ...drag, over: s.id, after });
                      }}
                      onDrop={(e) => { e.preventDefault(); if (drag) order.move(drag.id, s.id, !!drag.after); setDrag(null); }}
                    >
                      {canDrag && <span className="dbg-grip" title="Drag to move">⋮⋮</span>}
                      <button className="dbg-go" onClick={() => !hidden && onPick(s.id)} disabled={hidden}>
                        <span className="dbg-num">{num ? String(num).padStart(2, '0') : '––'}</span>
                        <span className="dbg-name">{s.title}</span>
                      </button>
                      {num && (
                        <button className={`dbg-copy ${copied === s.id ? 'is-done' : ''}`} title="Copy slide reference for chat"
                          onClick={() => copyRef(s, num)}>{copied === s.id ? '✓' : 'Copy'}</button>
                      )}
                      <button className={`dbg-hide ${hidden ? 'on' : ''}`} title={hidden ? 'Hidden: click to put back in the run' : 'Hide: leave out of the run'}
                        aria-label={hidden ? `Show ${s.title}` : `Hide ${s.title}`} aria-pressed={hidden}
                        onClick={() => order.toggleHidden(s.id)}><Eye off={hidden} /></button>
                      <span className="dbg-who">
                        {PRESENTERS.map((p) => (
                          <button key={p} className={`dbg-chip ${map[s.id] === p ? 'on' : ''}`} title={p}
                            onClick={() => assign(s.id, map[s.id] === p ? null : p)}>{p[0]}</button>
                        ))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <footer className="dbg-foot">
              <div className={`dbg-status ${push.state}`}>
                {push.state !== 'idle' ? push.message
                  : unpushed === null && !order.dirty ? 'Pushing needs the dev server on this laptop'
                  : pending.length ? `Not pushed yet: ${pending.join(' and ')}`
                  : 'Everything is pushed'}
                {push.state === 'error' && push.detail && <pre>{push.detail}</pre>}
              </div>
              <div className="dbg-actions">
                {order.dirty && <button className="dbg-btn" onClick={order.reset} disabled={push.state === 'busy'}>Reset order</button>}
                <button className="dbg-btn primary" onClick={doPush} disabled={push.state === 'busy' || !pending.length}>
                  {push.state === 'busy' ? 'Pushing…' : 'Push to main'}
                </button>
              </div>
            </footer>
          </aside>
          <KeyMap />
        </>
      )}
    </>
  );
}

/** Eye (in the run) / eye struck through (hidden). */
function Eye({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}

/** The presenting keys, pinned top right while the panel is open. */
function KeyMap() {
  return (
    <div className="dbg-keys" aria-label="Keys">
      <div className="dbg-keys-label">Keys</div>
      {KEYS.map(([k, v]) => <div className="dbg-key" key={k}><kbd>{k}</kbd><span>{v}</span></div>)}
      <div className="dbg-keys-label sub">In this panel</div>
      {PANEL_KEYS.map(([k, v]) => <div className="dbg-key" key={k}><kbd>{k}</kbd><span>{v}</span></div>)}
    </div>
  );
}
