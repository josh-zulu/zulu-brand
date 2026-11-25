import type { ReactNode } from 'react';
import type { SlideProps } from '@/engine/types';
import { Statement } from './Statement';
import { ClipFrame } from './ClipFrame';

/** First-pass slide: the approved copy in the house layout, with clip slots. Replace with a bespoke slide when it's built. */
export function Placeholder({ headline, lede, clip, clipDuration, note, ...p }: SlideProps & {
  headline: ReactNode; lede?: ReactNode; clip?: string; clipDuration?: string; note?: string;
}) {
  return (
    <>
      <Statement
        {...p}
        headline={headline}
        lede={lede}
        layout={clip ? 'split' : 'text'}
        media={clip ? <ClipFrame src={clip} duration={clipDuration} mode={p.mode} /> : undefined}
      />
      {note && <div className="ph-todo label"><i />{note}</div>}
    </>
  );
}
