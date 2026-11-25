import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { AgentCursor } from '@/components/AgentCursor';
import { GenImage } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import './S2Endcards.css';

/**
 * Five directions from one brief. Pick a favourite. Change it with a sentence.
 * One idea: choice, then change. Cards are authored at full 1920×1080 and scaled, so the picked one can grow to
 * fill the frame at full sharpness. Images are generated (fal); the type on them is real HTML.
 *  beat 0  headline + lede + brief; five end cards deal out of a stack into a fan
 *  beat 1  a person's cursor picks one; the rest fall away; it grows to fill the frame
 *  beat 2  "make it warmer, sunset light" types; the image regenerates in place behind a scan line (fal edit of the same card)
 */
type Card = { img: string; tag: string; look: string; seed: number; palette: number };
const CARDS: Card[] = [
  { img: 'ec-2', tag: 'Graphic', look: 'graphic', seed: 21, palette: 4 },
  { img: 'ec-3', tag: 'Clay', look: 'clay', seed: 33, palette: 6 },
  { img: 'ec-5', tag: 'Studio', look: 'studio', seed: 55, palette: 2 },
  { img: 'ec-1', tag: 'Photographic', look: 'photo', seed: 11, palette: 5 },
  { img: 'ec-4', tag: 'Print', look: 'print', seed: 44, palette: 2 },
];
const PICK = 3;
const EDIT = 'make it warmer, sunset light';
const FAN = { s: 0.31, gap: 272, cy: 668, arc: 14, rot: 7 };

function EndCardType({ look }: { look: string }) {
  return (
    <div className={`ec-type look-${look}`}>
      <div className="ec-word">Larkline</div>
      <div className="ec-line">Take the long way home.</div>
    </div>
  );
}

function S2Endcards({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s2-endcards-deal', 's2-endcards-regen', 'typing'], mode === 'live', 0.45);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const cards = q('.ec-card');
    const picked = cards[PICK];
    const cursor = q('.agent-cursor')[0];
    const fan = (i: number) => {
      const o = i - 2;
      return { x: o * FAN.gap, y: FAN.cy - 540 + o * o * FAN.arc, rotation: o * FAN.rot, scale: FAN.s };
    };

    gsap.set(cards, { transformOrigin: '50% 50%', filter: 'brightness(1) saturate(1)' });
    cards.forEach((c, i) => gsap.set(c, { x: 0, y: FAN.cy - 540 + 40 - i * 4, rotation: (i - 2) * 1.6, scale: 0.26, opacity: 0 }));
    gsap.set(q('.ec-warm'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(q('.ec-scan'), { xPercent: -50, left: '0%', opacity: 0 });
    gsap.set(cursor, { x: 2000, y: 1160, opacity: 0 });
    gsap.set(q('.ec-prompt'), { y: 40, opacity: 0 });
    gsap.set(q('.ec-st-run, .ec-st-done'), { opacity: 0 });

    // ── beat 0: the fan ─────────────────────────────────────────
    revealLines(tl, q('.ec-head')[0], {}, 0.05);
    revealWords(tl, q('.ec-lede')[0], {}, 0.4);
    tl.from(q('.ec-brief'), { opacity: 0, y: 10, duration: 0.8 }, 0.8);
    tl.to(cards, { opacity: 1, y: '-=40', duration: 0.6, ease: 'power2.out', stagger: 0.04 }, 0.5);
    tl.call(() => { if (dir.current > 0) sfx.play('s2-endcards-deal'); }, undefined, 1.0);
    cards.forEach((c, i) => tl.to(c, { ...fan(i), duration: 1.1, ease: 'expo.out' }, 1.0 + Math.abs(i - 2) * 0.06));
    tl.addLabel('b1');

    // ── beat 1: pick, then grow to fill the frame ───────────────
    const a = tl.duration() + 0.05;
    const p = fan(PICK);
    const aim = { x: 960 + p.x + 40, y: 540 + p.y + 30 };
    tl.to(cursor, { opacity: 1, duration: 0.2 }, a);
    tl.to(cursor, { x: aim.x, y: aim.y, duration: 0.85, ease: 'power3.inOut' }, a);
    tl.to(picked, { y: p.y - 34, rotation: 0, scale: FAN.s * 1.07, zIndex: 20, duration: 0.5, ease: 'power3.out' }, a + 0.55);
    tl.to(cursor, { y: aim.y - 34, duration: 0.5, ease: 'power3.out' }, a + 0.55);
    tl.to(cards.filter((_, i) => i !== PICK), { filter: 'brightness(0.42) saturate(0.7)', duration: 0.4 }, a + 0.55);
    tl.to(cursor, { scale: 0.85, duration: 0.1, transformOrigin: '0 0' }, a + 1.1);
    tl.to(cursor, { scale: 1, duration: 0.14 }, a + 1.22);
    const g = a + 1.3;
    cards.forEach((c, i) => {
      if (i === PICK) return;
      tl.to(c, { y: '+=520', rotation: `+=${(i - PICK) * 6}`, opacity: 0, duration: 0.8, ease: 'power3.in' }, g + Math.abs(i - PICK) * 0.05);
    });
    tl.to(q('.ec-head, .ec-lede, .ec-brief'), { opacity: 0, y: -16, duration: 0.5, ease: 'power2.in' }, g);
    tl.to(cursor, { x: '+=220', y: '+=260', opacity: 0, duration: 0.6, ease: 'power2.in' }, g + 0.1);
    tl.to(picked, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.25, ease: 'power3.inOut' }, g + 0.3);
    tl.to(picked.querySelector('.ec-frame'), { borderRadius: 0, duration: 1.25, ease: 'power3.inOut' }, g + 0.3);
    tl.to(picked.querySelector('.ec-tag'), { opacity: 0, duration: 0.4 }, g + 0.3);
    tl.addLabel('b2');

    // ── beat 2: change it with a sentence ───────────────────────
    const e = tl.duration() + 0.05;
    tl.to(q('.ec-prompt'), { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, e);
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); }, undefined, e + 0.45);
    typeInto(tl, q('.ec-edit')[0], EDIT, { cps: 26 }, e + 0.45);
    tl.call(() => sfx.stop('typing'));
    const r = tl.duration() + 0.3;
    tl.set(q('.ec-prompt .caret'), { visibility: 'hidden' }, r);
    tl.to(q('.ec-st-run'), { opacity: 1, duration: 0.25 }, r);
    tl.call(() => { if (dir.current > 0) sfx.play('s2-endcards-regen'); }, undefined, r + 0.2);
    tl.set(q('.ec-scan'), { opacity: 1 }, r + 0.25);
    tl.to(q('.ec-scan'), { left: '100%', duration: 1.6, ease: 'power2.inOut' }, r + 0.25);
    tl.to(q('.ec-warm'), { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power2.inOut' }, r + 0.25);
    tl.to(q('.ec-scan'), { opacity: 0, duration: 0.3 }, r + 1.75);
    tl.to(q('.ec-st-run'), { opacity: 0, duration: 0.2 }, r + 1.85);
    tl.to(q('.ec-st-done'), { opacity: 1, duration: 0.3 }, r + 1.85);
  });

  return (
    <div ref={root} className="ec">
      <div className="ec-text">
        <h2 className="ec-head headline">Five directions from one brief.</h2>
        <p className="ec-lede lede">Pick a favourite. Change it with a sentence.</p>
        <div className="ec-brief label"><span className="ec-brief-k">Brief</span>Larkline city bikes · 6s end card · “Take the long way home.”</div>
      </div>

      <div className="ec-cards">
        {CARDS.map((c, i) => (
          <div key={c.img} className={`ec-card look-${c.look}`}>
            <div className="ec-frame">
              <GenImage id={c.img} seed={c.seed} palette={c.palette} className="ec-img" />
              {i === PICK && <GenImage id={`${c.img}-warm`} seed={c.seed + 1} palette={0} className="ec-img ec-warm" />}
              <EndCardType look={c.look} />
              {i === PICK && <div className="ec-scan" />}
            </div>
            <div className="ec-tag">{String(i + 1).padStart(2, '0')} · {c.tag}</div>
          </div>
        ))}
      </div>

      <div className="ec-prompt">
        <span className="ec-prompt-k label">Edit</span>
        <span className="ec-prompt-text"><span className="ec-edit" /><span className="caret blink" /></span>
        <span className="ec-st label">
          <span className="ec-st-run">Regenerating</span>
          <span className="ec-st-done"><i />Same shot, new light</span>
        </span>
      </div>

      <AgentCursor label="You" tone="paper" />
    </div>
  );
}

export default defineSlide({
  id: 's2-endcards',
  section: 2,
  title: 'End cards',
  steps: 2,
  notes:
    'One brief for a made-up bike brand, five art directions back: graphic, clay, studio, photographic, print. Minutes, not days.\n' +
    'Click: we pick one. Picking is still our job, and it is the part that takes taste.\n' +
    'Click: change it with a sentence, "make it warmer, sunset light". Same shot, same composition, new light. That is the loop now: generate wide, choose, refine by talking.',
  Component: S2Endcards,
});
