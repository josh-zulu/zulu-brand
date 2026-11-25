import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto, rng } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { AgentCursor } from '@/components/AgentCursor';
import './S1Throughline.css';

/**
 * 1A · The through-line. Three beats, one per click, and one thread through all of them:
 *  beat 0  TALKED  a chat reply types out: "Warm hands. Slow mornings. Taste the pause."
 *  beat 1  MADE    the reply dissolves into a grid of nine generated campaign images.
 *  beat 2  DOES    an agent cursor drags three of them onto an artboard and sets the line as the headline.
 */
const PROMPT = 'Write a line for our winter coffee campaign.';
const REPLY = 'Warm hands. Slow mornings. Taste the pause.';
const HEADLINE = 'Taste the pause.';

const BEATS = [
  { role: 'Chat', head: 'First it talked.', lede: 'We learned to prompt it.' },
  { role: 'Generated', head: 'Then it made things.', lede: 'Then we learned to make with it.' },
  { role: 'Agentic', head: 'Now it does things.', lede: 'This year it became a coworker.' },
];

// Panel-space geometry (panel is 880×820).
const TILE = 220, GAP = 18, GX = 92, GY = 62;
const gridPos = (i: number) => ({ left: GX + (i % 3) * (TILE + GAP), top: GY + Math.floor(i / 3) * (TILE + GAP), width: TILE, height: TILE });
const PICKS: { tile: number; slot: { left: number; top: number; width: number; height: number } }[] = [
  { tile: 0, slot: { left: 90, top: 80, width: 400, height: 480 } },
  { tile: 4, slot: { left: 510, top: 80, width: 280, height: 230 } },
  { tile: 5, slot: { left: 510, top: 330, width: 280, height: 230 } },
];

function S1Throughline({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const blocks = q('.tl-block');
    const tiles = q('.tl-tile');
    const cursor = q('.agent-cursor')[0];
    const r = rng(42);

    const revealBlock = (i: number, at?: gsap.Position) => {
      const b = blocks[i];
      tl.fromTo(b.querySelector('.tl-node'), { scale: 0.2, backgroundColor: '#3a3837' }, { scale: 1, backgroundColor: '#00e482', duration: 0.6, ease: 'back.out(3)' }, at);
      tl.from(b.querySelector('.tl-role'), { opacity: 0, x: -12, duration: 0.6 }, '<');
      revealLines(tl, b.querySelector('.tl-head'), { duration: 1 }, '<0.05');
      revealWords(tl, b.querySelector('.tl-lede'), { duration: 0.7, stagger: 0.03 }, '<0.3');
    };
    const dimBlock = (i: number, at?: gsap.Position) => {
      tl.to(blocks[i], { opacity: 0.34, duration: 0.6, ease: 'power2.out' }, at);
      tl.to(blocks[i].querySelector('.tl-node'), { backgroundColor: '#9e9d99', scale: 0.7, duration: 0.6 }, at);
    };

    gsap.set(blocks.map((b) => b.querySelector('.tl-node')), { scale: 0.2 });
    gsap.set(tiles, { left: 340, top: 300, width: 24, height: 24, opacity: 0, borderRadius: 999 });
    gsap.set(cursor, { x: 940, y: 900, opacity: 0 });
    gsap.set(q('.tl-reply-split'), { autoAlpha: 0 });

    // ── beat 0 · talked ───────────────────────────────────────
    tl.from(q('.tl-rail-track'), { scaleY: 0, duration: 1.2, ease: 'expo.inOut' }, 0);
    revealBlock(0, 0.2);
    tl.from(q('.tl-panel'), { opacity: 0, y: 50, duration: 1.2 }, 0.1);
    tl.from(q('.tl-user'), { opacity: 0, y: 18, scale: 0.96, duration: 0.7, ease: 'back.out(1.6)' }, 0.7);
    tl.from(q('.tl-ai'), { opacity: 0, y: 18, duration: 0.6 }, 1.3);
    tl.fromTo(q('.tl-typing i'), { opacity: 0.25 }, { opacity: 1, duration: 0.25, stagger: { each: 0.12, repeat: 3, yoyo: true } }, 1.4);
    tl.set(q('.tl-typing'), { display: 'none' });
    typeInto(tl, q('.tl-reply')[0], REPLY, { cps: 32 });

    // ── beat 1 · made ─────────────────────────────────────────
    tl.addLabel('b1');
    dimBlock(0, 'b1');
    tl.to(q('.tl-rail-fill'), { scaleY: 0.5, duration: 0.8, ease: 'power3.inOut' }, 'b1');
    revealBlock(1, 'b1+=0.25');
    tl.to(q('.tl-user'), { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 'b1');
    tl.set(q('.tl-reply-split'), { autoAlpha: 1 }, 'b1');
    tl.set([q('.tl-reply')[0], q('.tl-ai .caret')[0]], { autoAlpha: 0 }, 'b1');
    tl.to(q('.tl-reply-split .ch'), {
      x: () => (r() - 0.5) * 160, y: () => (r() - 0.5) * 120, opacity: 0, filter: 'blur(8px)',
      duration: 0.7, ease: 'power2.out', stagger: { each: 0.008, from: 'random' },
    }, 'b1+=0.05');
    tl.to(q('.tl-ai-bg'), { opacity: 0, scale: 0.9, duration: 0.5 }, 'b1+=0.15');
    tl.to(q('.tl-ai-label'), { opacity: 0, duration: 0.3 }, 'b1');
    tiles.forEach((t, i) => {
      tl.to(t, { ...gridPos(i), opacity: 1, borderRadius: 14, duration: 1.05, ease: 'expo.out' }, `b1+=${0.3 + Math.abs(i - 4) * 0.05}`);
    });

    // ── beat 2 · does ─────────────────────────────────────────
    tl.addLabel('b2');
    dimBlock(1, 'b2');
    tl.to(q('.tl-rail-fill'), { scaleY: 1, duration: 0.8, ease: 'power3.inOut' }, 'b2');
    revealBlock(2, 'b2+=0.25');
    tl.fromTo(q('.tl-board-rect'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, 'b2+=0.1');
    tl.from(q('.tl-board-label'), { opacity: 0, duration: 0.5 }, 'b2+=0.3');
    tl.to(cursor, { opacity: 1, duration: 0.2 }, 'b2+=0.35');

    const picked = new Set(PICKS.map((p) => p.tile));
    let at = 0.4;
    PICKS.forEach(({ tile, slot }, k) => {
      const t = tiles[tile];
      const from = gridPos(tile);
      const pos = `b2+=${at}`;
      tl.to(cursor, { x: from.left + from.width * 0.55, y: from.top + from.height * 0.5, duration: k === 0 ? 0.6 : 0.42, ease: 'power3.inOut' }, pos);
      tl.to(cursor, { scale: 0.86, duration: 0.08 }, '>');
      tl.to(t, { scale: 1.04, zIndex: 5 + k, boxShadow: '0 30px 60px rgba(0,0,0,.55)', duration: 0.1 }, '<');
      if (k === 0) {
        tl.to(tiles.filter((_, i) => !picked.has(i)), { opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.03, ease: 'power2.in' }, '<');
      }
      tl.to(t, { ...slot, borderRadius: 6, duration: 0.62, ease: 'power3.inOut' }, '>');
      tl.to(cursor, { x: slot.left + slot.width * 0.55, y: slot.top + slot.height * 0.5, duration: 0.62, ease: 'power3.inOut' }, '<');
      tl.to(cursor, { scale: 1, duration: 0.08 }, '>');
      tl.to(t, { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.18 }, '<');
      at += k === 0 ? 1.45 : 1.25;
    });
    tl.to(cursor, { x: 600, y: 630, duration: 0.45, ease: 'power3.inOut' });
    tl.set(q('.tl-poster-caret'), { autoAlpha: 1 });
    typeInto(tl, q('.tl-poster-head')[0], HEADLINE.toUpperCase(), { cps: 20 });
    tl.from(q('.tl-poster-label'), { opacity: 0, y: 8, duration: 0.5 });
    tl.set(q('.tl-poster-caret'), { autoAlpha: 0 }, '+=0.3');
    tl.to(cursor, { x: 980, y: 860, opacity: 0, duration: 0.7, ease: 'power2.in' }, '<');
  });

  return (
    <div ref={root} className="throughline">
      <div className="tl-rail"><div className="tl-rail-track" /><div className="tl-rail-fill" /></div>
      <div className="tl-blocks">
        {BEATS.map((b) => (
          <div key={b.role} className="tl-block">
            <div className="tl-role label"><span className="tl-node" />{b.role}</div>
            <h2 className="tl-head headline">{b.head}</h2>
            <p className="tl-lede lede">{b.lede}</p>
          </div>
        ))}
      </div>

      <div className="tl-panel">
        {/* talked */}
        <div className="tl-user">{PROMPT}</div>
        <div className="tl-ai">
          <div className="tl-ai-bg" />
          <div className="tl-ai-label label"><i /> AI</div>
          <div className="tl-typing"><i /><i /><i /></div>
          <div className="tl-reply-wrap">
            <span className="tl-reply" /><span className="caret blink" />
            {/* per-character copy for the dissolve; grouped by word so it wraps exactly like the typed text */}
            <span className="tl-reply-split" aria-hidden>
              {REPLY.split(' ').map((w, wi) => (
                <span key={wi}>
                  <span className="tl-w">{w.split('').map((c, i) => <span key={i} className="ch">{c}</span>)}</span>{' '}
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* does: the artboard */}
        <div className="tl-board-label label">Artboard · Winter campaign · 4:5</div>
        <svg className="tl-board" width="880" height="820" viewBox="0 0 880 820" fill="none" aria-hidden>
          <rect className="tl-board-rect" x="60" y="50" width="760" height="720" rx="4" stroke="var(--zak-line-strong)" strokeWidth="2" strokeDasharray="0" />
        </svg>

        {/* made */}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="tl-tile" style={{ backgroundImage: `url(${generatedUrl(`campaign-${i + 1}`) ?? ''})` }} />
        ))}

        <div className="tl-poster">
          <div className="tl-poster-line display"><span className="tl-poster-head" /><span className="caret blink tl-poster-caret" /></div>
          <div className="tl-poster-label label">Winter Blend · 2026</div>
        </div>

        <AgentCursor label="Agent" />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's1-throughline',
  section: 1,
  title: '1A · The through-line',
  steps: 2,
  notes:
    'A few seconds per beat. Click for each.\n' +
    '“Talked” is ChatGPT in 2023. “Made” is images and video. “Does” is now: it opens the file, uses the tool and finishes the job.\n' +
    'Point out the thread: the line it wrote becomes the headline it sets.',
  Component: S1Throughline,
});
