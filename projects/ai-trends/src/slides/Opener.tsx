import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { typeInto, rng } from '@/lib/motion';
import { generatedSet } from '@/components/GenArt';
import { AgentCursor } from '@/components/AgentCursor';
import { ZakMark } from '@/components/ZakMark';
import { useSfx } from '@/lib/sfx';
import './Opener.css';

/**
 * The whole talk in six seconds, without a word.
 *  beat 0  black, a chat caret blinks.                         (it talked)
 *  beat 1  "AI Trends" types → letters burst into generated     (it made)
 *          fragments → fragments gather into the title → an
 *          agent cursor drags the last letter into place.       (it does)
 */
const TYPED = 'AI Trends';
const FINAL = 'AI TRENDS';
const N = 150;

/** Random points that fall inside a glyph, in the coordinates of its DOM box (so fragments land on the letterform). */
function glyphPoints(ch: string, font: string, w: number, h: number, n: number, rand: () => number) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  const m = ctx.measureText(ch);
  // centre the glyph's ink box inside the DOM box
  const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  ctx.fillText(ch, w / 2, (h - inkH) / 2 + m.actualBoundingBoxAscent);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const pts: { x: number; y: number }[] = [];
  for (let tries = 0; pts.length < n && tries < n * 400; tries++) {
    const x = Math.floor(rand() * c.width), y = Math.floor(rand() * c.height);
    if (data[(y * c.width + x) * 4 + 3] > 128) pts.push({ x, y });
  }
  while (pts.length < n) pts.push({ x: w / 2, y: h / 2 });
  return pts;
}

interface Frag { shape: 'sq' | 'dot' | 'pill'; size: number; fill: 'img' | 'signal' | 'cyan' | 'paper' | 'lines'; img: number; bgSize: number; bx: number; by: number; rot: number }

function Opener({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const textures = generatedSet('frag-');
  const sfx = useSfx(['typing', 'scatter', 'settle'], mode === 'live');
  const dir = useRef(direction);
  dir.current = direction;

  const frags = useMemo<Frag[]>(() => {
    const r = rng(2026);
    return Array.from({ length: N }, () => {
      const roll = r();
      const fill: Frag['fill'] = roll < 0.74 ? 'img' : roll < 0.84 ? 'signal' : roll < 0.9 ? 'cyan' : roll < 0.95 ? 'paper' : 'lines';
      const s = r();
      return {
        shape: s < 0.55 ? 'sq' : s < 0.8 ? 'dot' : 'pill',
        size: 16 + Math.round(r() ** 1.6 * 70),
        fill, img: Math.floor(r() * 8), bgSize: 260 + r() * 520, bx: 22 + r() * 56, by: 22 + r() * 56, rot: (r() - 0.5) * 70,
      };
    });
  }, []);

  useBeats(root, step, (tl) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const scale = el.getBoundingClientRect().width / 1920 || 1;
    const origin = el.getBoundingClientRect();
    const rel = (n: Element) => {
      const b = n.getBoundingClientRect();
      return { x: (b.left - origin.left) / scale, y: (b.top - origin.top) / scale, w: b.width / scale, h: b.height / scale };
    };
    const typedChars = q('.op-measure .ch').map(rel).filter((_, i) => TYPED[i] !== ' ');
    const finalLetters = q('.op-letter');
    const finalBoxes = finalLetters.map(rel).filter((_, i) => FINAL[i] !== ' ');
    const lettersNoSpace = finalLetters.filter((_, i) => FINAL[i] !== ' ');
    const lastLetter = lettersNoSpace[lettersNoSpace.length - 1];
    const fragEls = q('.op-frag');
    const cursor = q('.agent-cursor')[0];
    const r = rng(7);

    // The last letter lands crooked; the cursor will set it straight.
    const OFF = { x: 150, y: 110, rot: 14 };
    const lastBox = finalBoxes[finalBoxes.length - 1];

    gsap.set(fragEls, { opacity: 0, scale: 0 });
    gsap.set(finalLetters, { opacity: 0 });
    gsap.set(lastLetter, { x: OFF.x, y: OFF.y, rotation: OFF.rot });
    gsap.set(cursor, { x: 2050, y: 1180, opacity: 0 });

    // ── beat 0: the waiting caret ─────────────────────────────
    tl.from(q('.op-prompt'), { opacity: 0, duration: 1.2, ease: 'power2.out' });
    tl.addLabel('b1');

    // ── beat 1: talked ────────────────────────────────────────
    tl.call(() => { if (dir.current > 0) sfx.play('typing'); });
    typeInto(tl, q('.op-typed')[0], TYPED, { cps: 12 });
    tl.call(() => sfx.stop('typing'));
    tl.to({}, { duration: 0.25 });

    // ── made: burst into fragments, scatter across the stage ──
    const burstAt = tl.duration();
    fragEls.forEach((f, i) => {
      const c = typedChars[i % typedChars.length];
      const sz = frags[i].size;
      tl.set(f, { x: c.x + r() * c.w - sz / 2, y: c.y + c.h * 0.15 + r() * c.h * 0.7 - sz / 2, rotation: 0 }, burstAt);
    });
    tl.call(() => { if (dir.current > 0) sfx.play('scatter'); }, undefined, burstAt);
    tl.to(q('.op-prompt'), { opacity: 0, scale: 1.04, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' }, burstAt);
    tl.to(fragEls, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: { each: 0.004, from: 'center' } }, burstAt);
    tl.to(fragEls, {
      x: () => 80 + r() * 1760, y: () => 70 + r() * 940, rotation: (i: number) => frags[i].rot,
      duration: 1.15, ease: 'expo.out', stagger: { each: 0.003, from: 'center' },
    }, burstAt + 0.12);
    tl.to(fragEls, { y: '-=18', rotation: '+=8', duration: 0.4, ease: 'sine.inOut' });

    // ── does: gather onto the letterforms of the title ────────
    const gatherAt = tl.duration() - 0.15;
    const titleFont = `300 ${parseFloat(getComputedStyle(q('.op-title')[0]).fontSize)}px Oswald`;
    const perLetter = Math.ceil(N / finalBoxes.length);
    const points = finalBoxes.map((b, li) => glyphPoints(lettersNoSpace[li].textContent || '', titleFont, b.w, b.h, perLetter, r));
    fragEls.forEach((f, i) => {
      const li = i % finalBoxes.length;
      const b = finalBoxes[li];
      const p = points[li][Math.floor(i / finalBoxes.length)];
      const isLast = li === finalBoxes.length - 1;
      const sz = frags[i].size;
      tl.to(f, {
        // centre the fragment on the sampled point (fragments are positioned by their top-left corner)
        x: b.x + p.x - sz / 2 + (isLast ? OFF.x : 0),
        y: b.y + p.y - sz / 2 + (isLast ? OFF.y : 0),
        rotation: isLast ? OFF.rot : 0, scale: 0.42, duration: 0.95, ease: 'power3.inOut',
      }, gatherAt + r() * 0.18);
    });
    const formAt = tl.duration() - 0.25;
    tl.fromTo(finalLetters, { opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out', stagger: 0.03 }, formAt);
    tl.to(fragEls, { opacity: 0, scale: 0.2, duration: 0.45, ease: 'power2.in', stagger: { each: 0.002, from: 'random' } }, formAt + 0.05);

    // ── the cursor reaches in and sets the last letter ────────
    const grab = { x: lastBox.x + lastBox.w * 0.55 + OFF.x, y: lastBox.y + lastBox.h * 0.45 + OFF.y };
    tl.to(cursor, { opacity: 1, duration: 0.2 }, formAt + 0.25);
    tl.to(cursor, { x: grab.x, y: grab.y, duration: 0.75, ease: 'power3.inOut' }, formAt + 0.25);
    tl.to(cursor, { scale: 0.86, duration: 0.1, ease: 'power2.out' });
    tl.to(lastLetter, { scale: 1.04, duration: 0.1 }, '<');
    const dragAt = tl.duration();
    tl.to([lastLetter], { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.6, ease: 'zak.settle' }, dragAt);
    tl.to(cursor, { x: grab.x - OFF.x, y: grab.y - OFF.y, duration: 0.6, ease: 'zak.settle' }, dragAt);
    tl.call(() => { if (dir.current > 0) sfx.play('settle'); }, undefined, dragAt + 0.5);
    tl.to(cursor, { scale: 1, duration: 0.12 }, dragAt + 0.6);
    tl.to(cursor, { x: '+=160', y: '+=140', opacity: 0, duration: 0.6, ease: 'power2.in' }, dragAt + 0.85);

    // ── sign-off ──────────────────────────────────────────────
    tl.from(q('.op-rule'), { scaleX: 0, duration: 1, ease: 'expo.inOut' }, dragAt + 0.5);
    tl.from(q('.op-sub'), { opacity: 0, y: 14, duration: 0.8 }, dragAt + 0.8);
    tl.from(q('.op-mark'), { opacity: 0, duration: 1 }, dragAt + 0.9);
  }, [textures.length]);

  return (
    <div ref={root} className="opener">
      <div className="op-vignette fill" />

      {/* chat line */}
      <div className="op-prompt">
        <span className="op-chev">›</span>
        <span className="op-typed" />
        <span className="caret blink" />
      </div>
      {/* invisible per-character copy, same metrics, used to find where each letter sits */}
      <div className="op-prompt op-measure" aria-hidden>
        <span className="op-chev">›</span>
        {TYPED.split('').map((c, i) => <span key={i} className="ch">{c === ' ' ? ' ' : c}</span>)}
      </div>

      {/* final title */}
      <div className="op-title-wrap">
        <h1 className="op-title display">
          {FINAL.split('').map((c, i) => <span key={i} className="op-letter">{c === ' ' ? ' ' : c}</span>)}
        </h1>
        <div className="op-rule" />
        <div className="op-sub label">Zulu AI Working Group <span className="op-dot">·</span> December 2026</div>
      </div>

      <div className="op-frags fill" aria-hidden>
        {frags.map((f, i) => {
          const h = f.shape === 'pill' ? f.size * 0.42 : f.size;
          const w = f.shape === 'pill' ? f.size * 1.3 : f.size;
          const bg =
            f.fill === 'img' && textures.length
              ? { backgroundImage: `url(${textures[f.img % textures.length]})`, backgroundSize: `${f.bgSize}%`, backgroundPosition: `${f.bx}% ${f.by}%` }
              : f.fill === 'lines'
                ? { backgroundImage: 'repeating-linear-gradient(135deg, #f8f7f4 0 2px, transparent 2px 7px)' }
                : { background: { img: '#2a2828', signal: 'var(--zak-signal)', cyan: 'var(--zak-signal-2)', paper: 'var(--zak-paper)', lines: '' }[f.fill] };
          return <div key={i} className={`op-frag shape-${f.shape}`} style={{ width: w, height: h, ...bg }} />;
        })}
      </div>

      <AgentCursor label="" />
      <ZakMark className="op-mark" />
    </div>
  );
}

export default defineSlide({
  id: 'opener',
  section: 0,
  title: 'Opener: AI Trends',
  steps: 1,
  chrome: false,
  transition: 'cut',
  notes:
    'Wait on the blinking cursor until the room settles. Then click.\n' +
    'No words needed: it types (talked), breaks into generated fragments (made), and a cursor sets the title in place (does). That is the whole talk in six seconds.',
  Component: Opener,
});
