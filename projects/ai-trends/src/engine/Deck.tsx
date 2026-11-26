import { useCallback, useEffect, useRef, useState } from 'react';
import type { SlideDef } from './types';
import { Stage } from './Stage';
import { SlideFrame } from './SlideFrame';
import { useDeckNav, useDeckKeys } from './navigation';
import { Overview } from './Overview';
import { Presenter } from './Presenter';
import { deckSyncKey } from './sync';
import { DebugPanel } from './DebugPanel';
import { useRunningSlides } from './order';
import { KEYS } from './keys';

const LEAVE_MS = 700;

interface Layer { key: number; index: number; step: number; leaving: boolean }

/** The audience view: one slide on stage, with a short overlap so slides can cross-dissolve. */
export function Deck({ slides: all }: { slides: SlideDef[] }) {
  const slides = useRunningSlides(all);
  if (new URLSearchParams(location.search).has('presenter')) return <Presenter slides={slides} />;
  return <AudienceDeck slides={slides} all={all} />;
}

function AudienceDeck({ slides, all }: { slides: SlideDef[]; all: SlideDef[] }) {
  const nav = useDeckNav(slides);
  const { pos, direction, blank } = nav;
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const keyRef = useRef(0);
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, index: pos.index, step: pos.step, leaving: false }]);

  // Slide change → previous slide becomes a leaving layer for LEAVE_MS, new slide enters on top.
  useEffect(() => {
    setLayers((ls) => {
      const live = ls.find((l) => !l.leaving);
      if (live && live.index === pos.index) return ls.map((l) => (l === live ? { ...l, step: pos.step } : l));
      keyRef.current += 1;
      const cut = (slides[pos.index]?.transition ?? 'fade') === 'cut';
      return [
        ...(live && !cut ? [{ ...live, leaving: true }] : []),
        { key: keyRef.current, index: pos.index, step: pos.step, leaving: false },
      ];
    });
  }, [pos.index, pos.step, slides]);

  useEffect(() => {
    if (!layers.some((l) => l.leaving)) return;
    const t = setTimeout(() => setLayers((ls) => ls.filter((l) => !l.leaving)), LEAVE_MS);
    return () => clearTimeout(t);
  }, [layers]);

  const openPresenter = useCallback(() => {
    const key = deckSyncKey();
    window.open(`${location.pathname}?presenter&sync=${key}${location.hash}`, `zak-presenter-${key}`, 'width=1400,height=860');
  }, []);
  const closeOverlays = useCallback(() => {
    if (help) { setHelp(false); return true; }
    if (overview) { setOverview(false); return true; }
    return false;
  }, [help, overview]);

  useDeckKeys({
    nav,
    toggleOverview: useCallback(() => setOverview((o) => !o), []),
    toggleHelp: useCallback(() => setHelp((h) => !h), []),
    openPresenter,
    closeOverlays,
  });

  const progress = slides.length > 1 ? pos.index / (slides.length - 1) : 1;

  return (
    <div className="deck">
      <Stage className="deck-stage">
        {layers.map((l) => {
          const s = slides[l.index];
          if (!s) return null;
          const tr = s.transition ?? 'fade';
          return (
            <div
              key={l.key}
              className={`layer ${l.leaving ? 'layer-leave' : `layer-enter tr-${tr}`} ${direction < 0 ? 'is-back' : ''}`}
            >
              <SlideFrame slide={s} number={l.index + 1} total={slides.length} step={l.step} direction={direction} mode="live" />
            </div>
          );
        })}
        <div className="progress" style={{ transform: `scaleX(${progress})`, opacity: slides[pos.index]?.chrome === false ? 0 : undefined }} />
        <div className={`blackout ${blank ? 'on' : ''}`} />
      </Stage>

      {overview && (
        <Overview
          slides={slides}
          current={pos.index}
          onPick={(i) => { nav.goto(i); setOverview(false); }}
          onClose={() => setOverview(false)}
        />
      )}
      {help && <Help onClose={() => setHelp(false)} />}
      <DebugPanel all={all} current={slides[pos.index]?.id} onPick={(id) => nav.goto(slides.findIndex((s) => s.id === id))} />
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay help" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <div className="label">Keys</div>
        {KEYS.map(([k, v]) => (
          <div className="help-row" key={k}><kbd>{k}</kbd><span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}
