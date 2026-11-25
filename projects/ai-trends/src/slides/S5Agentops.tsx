import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines } from '@/lib/motion';
import { AgentCursor } from '@/components/AgentCursor';
import { GenImage } from '@/components/GenArt';
import './S5Agentops.css';

/**
 * Managing agents becomes a job. The lede names the job in three parts; each click does one of them on the board,
 * and that phrase lights up in the lede.
 *  beat 1  setting agents up: brief, tools and brand kit snap into each lane, and they start running.
 *  beat 2  checking their work: a person (paper cursor) reviews each output. Three pass, one is off brand.
 *  beat 3  keeping them on brand: the rule is pushed to every agent and the off-brand piece corrects itself.
 */
const LANES = [
  { name: 'Copy agent', job: 'Social posts', img: 'campaign-2', seed: 3 },
  { name: 'Design agent', job: 'Key visual', img: 'campaign-8', seed: 5, off: true },
  { name: 'Media agent', job: 'Banner set', img: 'campaign-4', seed: 7 },
  { name: 'Report agent', job: 'Weekly recap', img: 'campaign-6', seed: 9 },
];
const LANE_Y0 = 236;   // top of first lane (canvas px)
const LANE_H = 136;
const LANE_GAP = 20;

function Agentops({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const lanes = q('.ao-lane');
    const cursor = q('.agent-cursor')[0];
    const thumbX = 1670; // centre of the output thumbnails (canvas px)
    const laneMid = (i: number) => LANE_Y0 + i * (LANE_H + LANE_GAP) + LANE_H / 2;
    gsap.set(cursor, { x: 1960, y: 980, opacity: 0 });

    // ── beat 0: an empty board ────────────────────────────────
    revealLines(tl, q('.ao-head')[0], {}, 0);
    tl.from(q('.ao-lede'), { opacity: 0, y: 14, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out' }, 0.45);
    tl.from(q('.ao-board-head'), { opacity: 0, duration: 0.8 }, 0.4);
    tl.from(lanes, { opacity: 0, x: 40, duration: 0.9, stagger: 0.08 }, 0.4);
    tl.addLabel('b1');

    // ── beat 1: setting agents up ─────────────────────────────
    tl.to(q('.ao-k1'), { '--ao-hl': 1, color: '#f8f7f4', duration: 0.6, ease: 'expo.inOut' }, 'b1');
    lanes.forEach((lane, i) => {
      const at = `b1+=${0.15 + i * 0.12}`;
      tl.fromTo(lane.querySelectorAll('.ao-chip'), { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)', stagger: 0.07, immediateRender: false }, at);
      tl.to(lane.querySelector('.ao-dot'), { backgroundColor: '#4dd0e1', boxShadow: '0 0 12px #4dd0e1', duration: 0.3 }, `b1+=${0.5 + i * 0.12}`);
      tl.to(lane.querySelector('.ao-st-idle'), { opacity: 0, duration: 0.2 }, `b1+=${0.5 + i * 0.12}`);
      tl.to(lane.querySelector('.ao-st-run'), { opacity: 1, duration: 0.3 }, `b1+=${0.55 + i * 0.12}`);
      tl.fromTo(lane.querySelector('.ao-prog i'), { scaleX: 0 }, { scaleX: 0.55 + i * 0.1, duration: 1.4, ease: 'power1.inOut', immediateRender: false }, `b1+=${0.55 + i * 0.12}`);
    });
    tl.addLabel('b2');

    // ── beat 2: checking their work ───────────────────────────
    tl.to(q('.ao-k2'), { '--ao-hl': 1, color: '#f8f7f4', duration: 0.6, ease: 'expo.inOut' }, 'b2');
    lanes.forEach((lane, i) => {
      tl.to(lane.querySelector('.ao-prog i'), { scaleX: 1, duration: 0.5, ease: 'power2.out' }, `b2+=${i * 0.08}`);
      tl.fromTo(lane.querySelector('.ao-out'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)', immediateRender: false }, `b2+=${0.25 + i * 0.08}`);
    });
    tl.to(cursor, { opacity: 1, duration: 0.2 }, 'b2+=0.6');
    let t = 0.6;
    LANES.forEach((l, i) => {
      tl.to(cursor, { x: thumbX + 30, y: laneMid(i) + 10, duration: i === 0 ? 0.6 : 0.4, ease: 'power3.inOut' }, `b2+=${t}`);
      t += i === 0 ? 0.6 : 0.4;
      const lane = lanes[i];
      tl.fromTo(lane.querySelector(l.off ? '.ao-flag' : '.ao-tick'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, `b2+=${t}`);
      tl.to(lane.querySelector('.ao-st-run'), { opacity: 0, duration: 0.2 }, `b2+=${t}`);
      tl.to(lane.querySelector(l.off ? '.ao-st-flag' : '.ao-st-ok'), { opacity: 1, duration: 0.3 }, `b2+=${t}`);
      tl.to(lane.querySelector('.ao-dot'), { backgroundColor: l.off ? '#f8f7f4' : '#00e482', boxShadow: l.off ? '0 0 0 rgba(0,0,0,0)' : '0 0 12px #00e482', duration: 0.3 }, `b2+=${t}`);
      if (l.off) tl.to(lane, { '--ao-lane-ring': 'rgba(248, 247, 244, 0.55)', duration: 0.3 }, `b2+=${t}`);
      t += 0.25;
    });
    tl.to(cursor, { x: thumbX + 70, y: laneMid(1) + 46, duration: 0.6, ease: 'power3.inOut' }, `b2+=${t + 0.1}`);
    tl.addLabel('b3');

    // ── beat 3: keeping them on brand ─────────────────────────
    tl.to(q('.ao-k3'), { '--ao-hl': 1, color: '#f8f7f4', duration: 0.6, ease: 'expo.inOut' }, 'b3');
    tl.fromTo(q('.ao-push'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, 'b3+=0.1');
    lanes.forEach((lane, i) => {
      tl.fromTo(lane.querySelector('.ao-chip.is-brand'), { '--ao-chip-flash': 0 }, { '--ao-chip-flash': 1, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, `b3+=${0.35 + i * 0.07}`);
    });
    const off = lanes[1];
    tl.to(off.querySelector('.ao-out-wrong'), { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 'b3+=0.7');
    tl.to(off.querySelector('.ao-flag'), { scale: 0, opacity: 0, duration: 0.25 }, 'b3+=0.9');
    tl.fromTo(off.querySelector('.ao-tick'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, 'b3+=1.05');
    tl.to(off.querySelector('.ao-st-flag'), { opacity: 0, duration: 0.2 }, 'b3+=1.05');
    tl.to(off.querySelector('.ao-st-ok'), { opacity: 1, duration: 0.3 }, 'b3+=1.05');
    tl.to(off.querySelector('.ao-dot'), { backgroundColor: '#00e482', boxShadow: '0 0 12px #00e482', duration: 0.3 }, 'b3+=1.05');
    tl.to(off, { '--ao-lane-ring': 'rgba(248, 247, 244, 0.1)', duration: 0.4 }, 'b3+=1.05');
    tl.to(cursor, { x: '+=120', y: '+=160', opacity: 0, duration: 0.6, ease: 'power2.in' }, 'b3+=1.3');
  });

  return (
    <div ref={root} className="ao">
      <div className="ao-text">
        <h2 className="ao-head headline">Managing agents becomes a job.</h2>
        <p className="ao-lede lede">
          The 4A’s calls it AgentOps: <span className="ao-k ao-k1">setting agents up</span>, <span className="ao-k ao-k2">checking their work</span> and <span className="ao-k ao-k3">keeping them on brand</span>.
        </p>
      </div>

      <div className="ao-board-head label">
        <span>AgentOps <span className="ao-sep">·</span> Halden spring launch</span>
        <span className="ao-push"><i />Brand rules v5 · sent to 4 agents</span>
      </div>

      {LANES.map((l, i) => (
        <div key={l.name} className={`ao-lane${l.off ? ' is-off' : ''}`} style={{ top: LANE_Y0 + i * (LANE_H + LANE_GAP) }}>
          <div className="ao-who">
            <i className="ao-dot" />
            <div>
              <div className="ao-name">{l.name}</div>
              <div className="ao-job">{l.job}</div>
            </div>
          </div>
          <div className="ao-chips">
            <span className="ao-chip">Brief</span>
            <span className="ao-chip">Tools</span>
            <span className="ao-chip is-brand">Brand kit</span>
          </div>
          <div className="ao-status label">
            <span className="ao-st-idle">Idle</span>
            <span className="ao-st-run">Running<span className="ao-prog"><i /></span></span>
            <span className="ao-st-ok">✓ Approved</span>
            <span className="ao-st-flag">⚑ Off brand</span>
          </div>
          <div className="ao-out">
            <GenImage id={l.img} seed={l.seed} className="ao-out-img" />
            {l.off && (
              <div className="ao-out-wrong">
                <GenImage id={l.img} seed={l.seed} className="ao-out-img" />
                <span className="ao-wrong-type">WINTER<br />SALE!!</span>
              </div>
            )}
            <span className="ao-tick">✓</span>
            {l.off && <span className="ao-flag">⚑</span>}
          </div>
        </div>
      ))}

      <AgentCursor label="You" tone="paper" />
    </div>
  );
}

export default defineSlide({
  id: 's5-agentops',
  section: 5,
  title: 'Managing agents becomes a job',
  steps: 3,
  notes:
    'The 4A’s calls it AgentOps. Three parts to the job, one per click; the phrase lights up in the lede as the board does it.\n' +
    'Click 1, setting agents up: each one gets a brief, its tools and the brand kit, and starts running.\n' +
    'Click 2, checking their work: a person reviews what comes back. Three pass. One is off brand.\n' +
    'Click 3, keeping them on brand: the brand rules go to every agent and the piece is fixed. Someone has to own that loop. That is the new job.',
  Component: Agentops,
});
