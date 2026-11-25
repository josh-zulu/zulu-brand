import { useEffect, useRef } from 'react';
import type { SlideDef } from './types';
import { SECTIONS } from './types';
import { Stage } from './Stage';
import { SlideFrame } from './SlideFrame';

/** Grid of every slide (final state, preview mode). Click to jump. */
export function Overview({ slides, current, onPick, onClose }: {
  slides: SlideDef[]; current: number; onPick: (i: number) => void; onClose: () => void;
}) {
  const curRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { curRef.current?.scrollIntoView({ block: 'center' }); }, []);

  let lastSection = -1;
  return (
    <div className="overlay overview" onClick={onClose}>
      <div className="overview-grid" onClick={(e) => e.stopPropagation()}>
        {slides.map((s, i) => {
          const header = s.section !== lastSection ? (lastSection = s.section, true) : false;
          return (
            <div key={s.id} className="overview-cell-wrap">
              {header && <div className="overview-section label">0{s.section} · {SECTIONS[s.section]}</div>}
              <button
                ref={i === current ? curRef : undefined}
                className={`overview-cell ${i === current ? 'is-current' : ''}`}
                onClick={() => onPick(i)}
              >
                <Stage className="overview-stage">
                  <SlideFrame slide={s} number={i + 1} total={slides.length} step={s.overviewStep ?? s.steps ?? 0} direction={1} mode="preview" />
                </Stage>
                <span className="overview-caption"><b>{i + 1}</b> {s.title}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
