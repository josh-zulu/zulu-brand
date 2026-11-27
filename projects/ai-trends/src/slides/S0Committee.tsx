import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { countUp } from '@/lib/motion';
import './S0Committee.css';

/**
 * The AI Committee: everyone at Zulu in it, right after the Innovation Trio.
 * One idea: the committee assembles. Each person's dot (the pill-and-dot language of the ZAK mark) lands in the grid
 * as the count runs up to 19. The Innovation Trio's dots carry the signal ring, tying back to the slide before.
 *  beat 0  kicker, title, count; the 19 names land in sequence
 */
const PEOPLE = [
  'Felipe Chaparro', 'Gary Stothers', 'Gaston Figallo', 'Henry Eugenio', 'Hiep Vu', 'Josh Maldonado', 'Kelly Mikhael',
  'Kenneth Haz', 'Kyle Collins', 'Matthew Vares', 'Nicole Pagano', 'Ola Stodulska', 'Paulina Marxuach', 'Sarah Dayus',
  'Sarah Yim', 'Sean Bell', 'Spencer MacEachern', 'Sunny Jung', 'Trong Nguyen',
];
const TRIO = new Set(['Josh Maldonado', 'Kyle Collins', 'Hiep Vu']);
const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);

function Committee({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.cm-kicker'), { opacity: 0, y: 10, duration: 0.7 }, 0);
    tl.from(q('.cm-head'), { opacity: 0, y: 30, duration: 1.1, ease: 'expo.out' }, 0.05);
    countUp(tl, q('.cm-count-n')[0], PEOPLE.length, { duration: 2.2 }, 0.4);
    tl.from(q('.cm-dot'), { scale: 0, duration: 0.55, ease: 'back.out(2.4)', stagger: 0.09 }, 0.45);
    tl.from(q('.cm-name'), { opacity: 0, x: -14, duration: 0.6, ease: 'power3.out', stagger: 0.09 }, 0.6);
  });

  return (
    <div ref={root} className="committee">
      <div className="cm-top">
        <div className="cm-title">
          <div className="cm-kicker label">Zulu Alpha Kilo</div>
          <h2 className="cm-head display">AI Committee</h2>
        </div>
        <div className="cm-count"><span className="cm-count-n display">{PEOPLE.length}</span><span className="label">people</span></div>
      </div>
      <ol className="cm-grid">
        {PEOPLE.map((p) => (
          <li key={p} className={`cm-person ${TRIO.has(p) ? 'is-trio' : ''}`}>
            <span className="cm-dot">{initials(p)}</span>
            <span className="cm-name">{p}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default defineSlide({
  id: 'committee',
  section: 0,
  title: 'The AI Committee',
  steps: 0,
  notes:
    'And it is not just the three of us. This is the AI Committee: nineteen people across Zulu.\n' +
    'Name a few in the room. If you want to try something with AI, any of them is a good first call.',
  Component: Committee,
});
