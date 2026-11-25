import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import './S0Team.css';

/**
 * Tee-up: the Digital team at Zulu Alpha Kilo. Just the title and three circle headshots.
 * One motion idea: three rings are carved into the page like the dots of the ZAK mark, and each of us fills one.
 * Photos: src/assets/team/<firstname>.jpg (black and white looks best; any colour photo is shown in greyscale).
 */
export interface Person { name: string; role: string; frame?: { scale: number; x: string; y: string } }

const photos = import.meta.glob('../assets/team/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export const photoFor = (first: string) => Object.entries(photos).find(([p]) => p.toLowerCase().includes(`/${first.toLowerCase()}.`))?.[1];

// frame: x, y = where the face is in the photo as shown in the circle (percent); the face is moved to the centre and zoomed by scale.
export const TEAM: Person[] = [
  { name: 'Josh Maldonado', role: 'Director of Digital & Innovation', frame: { scale: 2.4, x: '55%', y: '19%' } },
  { name: 'Kyle Collins', role: 'Web Developer', frame: { scale: 1.25, x: '50%', y: '36%' } },
  { name: 'Hiep Vu', role: 'AI Production Specialist', frame: { scale: 1.2, x: '48%', y: '38%' } },
];

function S0Team({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.dt-kicker'), { opacity: 0, y: 10, duration: 0.7 }, 0);
    revealLines(tl, q('.dt-head')[0], { duration: 1.2 }, 0.1);
    tl.from(q('.dt-ring'), { scale: 0.2, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.14 }, 0.5);
    tl.from(q('.dt-photo, .dt-initial'), { scale: 1.25, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.14 }, 0.9);
    tl.from(q('.dt-name'), { opacity: 0, y: 16, duration: 0.8, stagger: 0.14 }, 1.3);
    tl.from(q('.dt-role'), { opacity: 0, duration: 0.6, stagger: 0.14 }, 1.5);
  });

  return (
    <div ref={root} className="team">
      <div className="dt-title">
        <div className="dt-kicker label">Zulu Alpha Kilo</div>
        <h2 className="dt-head display">Digital team</h2>
      </div>
      <div className="dt-row">
        {TEAM.map((p) => {
          const first = p.name.split(' ')[0];
          const photo = photoFor(first);
          return (
            <div key={p.name} className="dt-person">
              <div className="dt-ring">
                <div className="dt-circle">
                  {photo
                    ? <div className="dt-frame" style={p.frame ? { transform: `translate(${50 - parseFloat(p.frame.x)}%, ${50 - parseFloat(p.frame.y)}%) scale(${p.frame.scale})`, transformOrigin: `${p.frame.x} ${p.frame.y}` } : undefined}>
                        <img className="dt-photo" src={photo} alt={p.name} draggable={false} />
                      </div>
                    : <div className="dt-initial display">{first[0]}</div>}
                </div>
              </div>
              <div className="dt-meta">
                <div className="dt-name display">{p.name}</div>
                <div className={`dt-role label ${p.role ? '' : 'is-todo'}`}>{p.role || 'Title to add'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 'team',
  section: 0,
  title: 'The Digital team',
  chrome: false,
  notes: 'Introduce the three of us before the talk starts: Josh, Kyle and Hiep, the Digital team. When you have a digital or innovation problem, come to us first.',
  Component: S0Team,
});
