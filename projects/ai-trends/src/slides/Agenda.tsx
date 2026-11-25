import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { defineSlide, SECTIONS, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import './Agenda.css';

/**
 * Agenda. One idea: the talk counts itself in.
 * Each section number rolls up like an odometer (01 lands first, 06 last, each running a little longer),
 * and its title rises letter by letter just as the number settles. The hairline under each row draws on.
 */
const ROWS = [1, 2, 3, 4, 5, 6].map((n) => ({ n, title: SECTIONS[n].replace(/'/g, '’') }));

function Agenda({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.ag-label'), { opacity: 0, x: -16, duration: 0.8, ease: 'power3.out' }, 0);
    tl.from(q('.ag-label-dot'), { scale: 0, duration: 0.5, ease: 'back.out(3)' }, 0.1);

    q('.ag-row').forEach((row, i) => {
      const strip = row.querySelector('.ag-strip')!;
      const n = ROWS[i].n;
      // all counters start almost together; later rows have further to count, so they land in sequence
      const start = 0.2 + i * 0.07;
      const roll = 0.55 + i * 0.13;
      const land = start + roll;
      tl.fromTo(row.querySelector('.ag-rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, start - 0.05);
      tl.from(row.querySelector('.ag-zero'), { yPercent: 60, opacity: 0, duration: 0.6, ease: 'power3.out' }, start);
      tl.fromTo(strip, { yPercent: 0 }, { yPercent: (-100 * n) / (n + 1), duration: roll, ease: 'power3.out' }, start);
      tl.fromTo(row.querySelector('.ag-num'), { opacity: 0.35 }, { opacity: 1, duration: roll * 0.8, ease: 'power2.in' }, start);

      const split = SplitText.create(row.querySelector('.ag-title')!, { type: 'chars,lines', mask: 'lines', charsClass: 'ag-ch' });
      tl.from(split.chars, { yPercent: 110, duration: 0.9, ease: 'zak.out', stagger: 0.016 }, land - 0.22);
    });
  });

  return (
    <div ref={root} className="ag">
      <div className="ag-label label"><i className="ag-label-dot" />Agenda</div>
      <ol className="ag-list">
        {ROWS.map(({ n, title }) => (
          <li key={n} className="ag-row">
            <span className="ag-num display" aria-label={`0${n}`}>
              <span className="ag-zero">0</span>
              <span className="ag-digit" aria-hidden>
                <span className="ag-strip">
                  {Array.from({ length: n + 1 }, (_, d) => <span key={d}>{d}</span>)}
                </span>
              </span>
            </span>
            <span className="ag-title display">{title}</span>
            <span className="ag-rule" />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default defineSlide({
  id: 'agenda',
  section: 0,
  title: 'Agenda',
  transition: 'fade',
  notes: 'Six sections. The numbers count themselves in; no click needed.',
  Component: Agenda,
});
