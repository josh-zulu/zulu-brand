import { useEffect, useRef, useState } from 'react';
import type { SlideDef } from './types';
import { SECTIONS } from './types';
import { PRESENTERS, type Presenter, usePresenters } from './presenters';

/**
 * Rehearsal panel: a small "Slides" button (bottom left, or the \ key) opens a side list of every slide.
 * Click a title to jump there; tap a name to assign who presents it (tap again to clear).
 * Hidden while the deck is fullscreen, so it never shows on the projector.
 */
export function DebugPanel({ slides, current, onPick }: { slides: SlideDef[]; current: number; onPick: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Presenter | 'All'>('All');
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  const { map, assign, saveError } = usePresenters();
  const curRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // "Slide 05 · 1B · The part that stays human (s1-human)": easy to paste into chat and unambiguous to find in code.
  const copyRef = (s: SlideDef, i: number) => {
    const text = `Slide ${String(i + 1).padStart(2, '0')} · ${s.title} (${s.id})`;
    const done = () => { setCopied(s.id); setTimeout(() => setCopied((c) => (c === s.id ? null : c)), 1400); };
    navigator.clipboard?.writeText(text).then(done).catch(() => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } finally { ta.remove(); }
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest?.('input,textarea,[contenteditable]')) return;
      if (e.key === '\\') setOpen((o) => !o);
    };
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => { removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); };
  }, []);

  useEffect(() => { if (open) curRef.current?.scrollIntoView({ block: 'center' }); }, [open, current]);

  if (fullscreen) return null;

  const counts = Object.fromEntries(PRESENTERS.map((p) => [p, slides.filter((s) => map[s.id] === p).length]));
  const unassigned = slides.filter((s) => !map[s.id]).length;
  let lastSection = -1;

  return (
    <>
      <button className={`dbg-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} title="Slides and presenters (\)">
        <i /><i /><i /> Slides
      </button>
      {open && (
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
          <div className="dbg-meta">{unassigned ? `${unassigned} unassigned` : 'Every slide has a presenter'}{saveError && <span className="dbg-err"> · not saved (dev server needed)</span>}</div>
          <div className="dbg-list">
            {slides.map((s, i) => {
              if (filter !== 'All' && map[s.id] !== filter) return null;
              const header = s.section !== lastSection ? (lastSection = s.section, true) : false;
              return (
                <div key={s.id}>
                  {header && <div className="dbg-section">0{s.section} · {SECTIONS[s.section]}</div>}
                  <div ref={i === current ? curRef : undefined} className={`dbg-row ${i === current ? 'is-current' : ''}`}>
                    <button className="dbg-go" onClick={() => onPick(i)}>
                      <span className="dbg-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="dbg-name">{s.title}</span>
                    </button>
                    <button className={`dbg-copy ${copied === s.id ? 'is-done' : ''}`} title="Copy slide reference for chat"
                      onClick={() => copyRef(s, i)}>{copied === s.id ? '✓' : 'Copy'}</button>
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
          <footer className="dbg-foot">Click a title to jump · Copy puts its reference on the clipboard · J, K, H assign · \ toggles</footer>
        </aside>
      )}
    </>
  );
}
