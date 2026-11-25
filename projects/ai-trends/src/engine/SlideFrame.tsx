import { memo } from 'react';
import type { SlideDef, SlideProps } from './types';
import { SECTIONS } from './types';
import { ZakMark } from '@/components/ZakMark';
import { SlideBoundary } from './SlideBoundary';

interface Props extends SlideProps {
  slide: SlideDef;
  number: number;
  total: number;
  className?: string;
}

/** One slide on the stage: theme ground, grain, the slide's own content, then the brand chrome on top. */
export const SlideFrame = memo(function SlideFrame({ slide, number, total, className = '', ...props }: Props) {
  const { Component } = slide;
  const theme = slide.theme ?? 'dark';
  const chrome = slide.chrome ?? true;
  return (
    <div className={`slide theme-${theme} ${className}`} data-slide={slide.id}>
      <SlideBoundary id={slide.id}><Component {...props} /></SlideBoundary>
      {chrome && (
        <div className="chrome" aria-hidden>
          <ZakMark className="chrome-mark" />
          {slide.section > 0 && (
            <div className="chrome-section label">
              <span className="chrome-num">0{slide.section}</span>
              <span className="chrome-rule" />
              {SECTIONS[slide.section]}
            </div>
          )}
          <div className="chrome-page label">
            {String(number).padStart(2, '0')}
            <span className="chrome-of"> / {String(total).padStart(2, '0')}</span>
          </div>
        </div>
      )}
      <div className="grain" aria-hidden />
    </div>
  );
});
