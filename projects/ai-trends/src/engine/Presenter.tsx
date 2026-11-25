import { useCallback, useEffect, useState } from 'react';
import type { SlideDef } from './types';
import { SECTIONS } from './types';
import { Stage } from './Stage';
import { SlideFrame } from './SlideFrame';
import { useDeckNav, useDeckKeys } from './navigation';
import { usePresenters } from './presenters';

/**
 * Presenter view (open with P, or ?presenter). Current slide, what the next click shows, notes, timers.
 * Drives the audience window over BroadcastChannel, so put this on the laptop and the deck on the projector.
 * Slides render here in 'preview' mode: no audio, no mic. The live demos run in the audience window.
 */
export function Presenter({ slides }: { slides: SlideDef[] }) {
  const nav = useDeckNav(slides);
  const { pos } = nav;
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [fontScale, setFontScale] = useState(1);
  const { map: presenters } = usePresenters();

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  useEffect(() => { if (started === null && (pos.index > 0 || pos.step > 0)) setStarted(Date.now()); }, [pos, started]);

  useDeckKeys({
    nav,
    toggleOverview: useCallback(() => {}, []),
    toggleHelp: useCallback(() => {}, []),
    closeOverlays: useCallback(() => false, []),
  });

  const slide = slides[pos.index];
  const steps = slide.steps ?? 0;
  const nextPos = pos.step < steps ? { index: pos.index, step: pos.step + 1 } : pos.index < slides.length - 1 ? { index: pos.index + 1, step: 0 } : null;
  const nextSlide = nextPos ? slides[nextPos.index] : null;
  const elapsed = started ? now - started : 0;
  const mmss = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

  return (
    <div className="presenter">
      <header className="presenter-bar">
        <span className="label">0{slide.section} · {SECTIONS[slide.section]}</span>
        {presenters[slide.id] && <span className="presenter-who">{presenters[slide.id]} presenting</span>}
        {nextSlide && nextPos && nextPos.index !== pos.index && presenters[nextSlide.id] && presenters[nextSlide.id] !== presenters[slide.id] && (
          <span className="presenter-handoff">Next: hand over to {presenters[nextSlide.id]}</span>
        )}
        <span className="presenter-count"><b>{pos.index + 1}</b> / {slides.length}</span>
        <span className="presenter-timer" onClick={() => setStarted(Date.now())} title="Click to reset">{mmss(elapsed)}</span>
        <span className="presenter-clock">{new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </header>

      <div className="presenter-main">
        <div className="presenter-current">
          <Stage className="presenter-stage">
            <SlideFrame slide={slide} number={pos.index + 1} total={slides.length} step={pos.step} direction={nav.direction} mode="preview" />
          </Stage>
          <div className="presenter-beats">
            {Array.from({ length: steps + 1 }, (_, i) => <span key={i} className={i <= pos.step ? 'on' : ''} />)}
            <span className="label">{steps ? `beat ${pos.step + 1} of ${steps + 1}` : 'single beat'}</span>
          </div>
        </div>

        <aside className="presenter-side">
          <div className="label">Next {nextPos && nextPos.index === pos.index ? '· click' : '· slide'}</div>
          <div className="presenter-next">
            {nextSlide && nextPos ? (
              <Stage className="presenter-stage">
                <SlideFrame key={`${nextPos.index}-${nextPos.step}`} slide={nextSlide} number={nextPos.index + 1} total={slides.length} step={nextPos.step} direction={1} mode="preview" />
              </Stage>
            ) : <div className="presenter-end label">End of deck</div>}
          </div>
          <div className="presenter-notes-head">
            <span className="label">Notes · {slide.title}</span>
            <span className="presenter-font">
              <button onClick={() => setFontScale((f) => Math.max(0.7, f - 0.1))}>A−</button>
              <button onClick={() => setFontScale((f) => Math.min(1.8, f + 0.1))}>A+</button>
            </span>
          </div>
          <div className="presenter-notes" style={{ fontSize: `${22 * fontScale}px` }}>
            {(slide.notes || 'No notes for this slide.').split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </aside>
      </div>

      <footer className="presenter-controls">
        <button onClick={nav.prev}>← Back</button>
        <button onClick={() => nav.setBlank(!nav.blank)}>{nav.blank ? 'Unblank' : 'Black screen'}</button>
        <button className="primary" onClick={nav.next}>Next →</button>
      </footer>
    </div>
  );
}
