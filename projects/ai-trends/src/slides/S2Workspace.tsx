import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { ClipFrame } from '@/components/ClipFrame';
import './S2Workspace.css';

/**
 * Docs, sheets and decks, built in place.
 * One idea: the tabs follow the footage. The recording runs Docs → Sheets → Slides; the active tab and the agent's
 * status line track the clip's playhead, so the room always knows which app they are watching.
 *  beat 0  kicker, headline, lede; the window rises with the Docs tab active
 *  beat 1  the clip plays; the signal marker moves tab to tab as the recording reaches each app
 */
const APPS = [
  { id: 'docs', name: 'Docs', at: 0, status: 'Rewriting the summary · tables' },
  { id: 'sheets', name: 'Sheets', at: 8.2, status: 'Budget vs actuals · tab per team' },
  { id: 'slides', name: 'Slides', at: 23.2, status: 'QBR deck · Drive + Salesforce' },
];
const TAB_W = 170;

const appAt = (t: number) => APPS.reduce((k, a, i) => (t >= a.at ? i : k), 0);

function S2Workspace({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState(0);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.ws-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.ws-head')[0], {}, 0.1);
    revealWords(tl, q('.ws-lede')[0], {}, 0.5);
    tl.from(q('.ws-win'), { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.25);
    tl.from(q('.ws-tab'), { opacity: 0, y: 8, duration: 0.5, stagger: 0.08 }, 0.8);
    tl.from(q('.ws-marker'), { scaleX: 0, transformOrigin: '0 50%', duration: 0.6, ease: 'power3.out' }, 1.1);

    tl.addLabel('b1');
    tl.to(q('.ws-status'), { opacity: 1, duration: 0.4 }, 'b1');
    tl.to(q('.ws-live'), { opacity: 1, duration: 0.3 }, 'b1');
  });

  useEffect(() => {
    const v = root.current?.querySelector<HTMLVideoElement>('.ws-clip video');
    if (!v) return;
    const sync = () => setApp(appAt(v.currentTime));
    sync();
    v.addEventListener('timeupdate', sync);
    v.addEventListener('seeked', sync);
    return () => { v.removeEventListener('timeupdate', sync); v.removeEventListener('seeked', sync); };
  }, [mode]);

  useEffect(() => {
    const q = gsap.utils.selector(root);
    gsap.to(q('.ws-marker'), { x: app * TAB_W, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' });
    q('.ws-tab').forEach((el, i) => el.classList.toggle('on', i === app));
    q('.ws-status-line').forEach((el, i) => gsap.to(el, { opacity: i === app ? 1 : 0, y: i === app ? 0 : 6, duration: 0.4, overwrite: 'auto' }));
  }, [app]);

  return (
    <div ref={root} className="ws">
      <div className="ws-text">
        <div className="ws-kicker label"><i /><span><b>05</b> · Office · Google Workspace</span></div>
        <h2 className="ws-head headline">Docs, sheets and decks, built in place.</h2>
        <p className="ws-lede lede">Ask from the side panel. It rewrites the doc, turns two CSVs into a budget report, and builds the deck from Drive and Salesforce.</p>
      </div>

      <div className="ws-win">
        <div className="ws-bar">
          <div className="ws-tabs">
            {APPS.map((a, i) => (
              <span key={a.id} className={`ws-tab ws-tab-${a.id}${i === 0 ? ' on' : ''}`} style={{ width: TAB_W }}>
                <i className="ws-glyph" />{a.name}
              </span>
            ))}
            <span className="ws-marker" style={{ width: TAB_W }} />
          </div>
          <span className="ws-status label">
            <i className="ws-live" />
            {APPS.map((a, i) => <span key={a.id} className="ws-status-line" style={{ opacity: i === 0 ? 1 : 0 }}>{a.status}</span>)}
          </span>
        </div>
        <ClipFrame className="ws-clip" src="clips/workspace-docs-sheets-slides.mp4" duration="39s" mode={mode} playing={step >= 1} />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's2-workspace',
  section: 2,
  title: 'Google Workspace',
  steps: 1,
  notes:
    'Same idea, in the apps we all live in. Claude sits in a side panel inside Docs, Sheets and Slides and works on the file in front of you.\n' +
    'Click to play (39s). Docs: it tightens an exec summary and puts the next steps in a table. Sheets: two CSVs in, a budget-vs-actuals report out, a tab per team and the overspends flagged. Slides: it pulls call notes from Drive and numbers from Salesforce and builds the QBR deck.\n' +
    'The tabs follow the recording, so you can talk over it.',
  Component: S2Workspace,
});
