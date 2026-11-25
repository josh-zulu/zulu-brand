import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, countUp, rng } from '@/lib/motion';
import { generatedSet, GenTile } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import './S2Sameness.css';

/**
 * Slide 14 · The catch.
 *  beat 0  headline rises.
 *  beat 1  the two numbers count up, sources underneath.
 *  beat 2  a sea of near-identical generated ads floods the background from one tile outwards,
 *          washing over the numbers. Only the headline is left above water.
 *
 * The sea is exported (SeaGrid + geometry) so slide 15 can start from exactly this frame.
 */

// ── The sea: one fixed grid, shared with S2Taste ─────────────────────────────
export const SEA = { cellW: 192, cellH: 240, gap: 12, cols: 10, rows: 5 } as const;
const PITCH_X = SEA.cellW + SEA.gap;
const PITCH_Y = SEA.cellH + SEA.gap;
/** Grid origin: centred on the 1920×1080 stage, overflowing on every side so it reads as endless. */
export const SEA_OX = (1920 - (SEA.cols * SEA.cellW + (SEA.cols - 1) * SEA.gap)) / 2;
export const SEA_OY = (1080 - (SEA.rows * SEA.cellH + (SEA.rows - 1) * SEA.gap)) / 2;
/** The block of cells that becomes slide 15's "Default AI" panel (5×3, every image different). */
export const SEA_BLOCK = { c0: 1, r0: 1, cols: 5, rows: 3 } as const;
export const seaBlockRect = () => ({
  x: SEA_OX + SEA_BLOCK.c0 * PITCH_X,
  y: SEA_OY + SEA_BLOCK.r0 * PITCH_Y,
  w: SEA_BLOCK.cols * SEA.cellW + (SEA_BLOCK.cols - 1) * SEA.gap,
  h: SEA_BLOCK.rows * SEA.cellH + (SEA_BLOCK.rows - 1) * SEA.gap,
});

// The copy default AI writes for every one of them. Near-identical on purpose.
const SLOGANS = [
  'Refresh your world', 'Refresh your vibe', 'Taste the refresh', 'Unleash refreshment', 'Elevate your refresh',
  'Pure refreshment', 'Refresh. Reimagined.', 'Experience refreshment', 'Your world, refreshed', 'Feel the fizz',
  'Refresh your day', 'Redefine refreshment',
];
const CTAS = ['Shop now', 'Try it today', 'Discover more', 'Shop now', 'Learn more'];

interface SeaCell { r: number; c: number; x: number; y: number; img: number; flip: boolean; slogan: string; cta: string; inBlock: boolean }

/** Deterministic layout. Block cells get 15 distinct images; the rest reuse the pool, never next to a twin. */
function buildSea(pool: number): SeaCell[] {
  const r = rng(1414);
  const n = Math.max(pool, 1);
  const grid: number[][] = Array.from({ length: SEA.rows }, () => Array(SEA.cols).fill(-1));
  const uses: number[] = Array(n).fill(0);
  const blockOrder = Array.from({ length: n }, (_, i) => i).sort(() => r() - 0.5);
  let bi = 0;
  for (let row = SEA_BLOCK.r0; row < SEA_BLOCK.r0 + SEA_BLOCK.rows; row++)
    for (let col = SEA_BLOCK.c0; col < SEA_BLOCK.c0 + SEA_BLOCK.cols; col++) {
      const img = blockOrder[bi++ % n];
      grid[row][col] = img; uses[img]++;
    }
  const near = (row: number, col: number) => {
    const s = new Set<number>();
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const v = grid[row + dr]?.[col + dc];
      if (v !== undefined && v >= 0) s.add(v);
    }
    return s;
  };
  for (let row = 0; row < SEA.rows; row++)
    for (let col = 0; col < SEA.cols; col++) {
      if (grid[row][col] >= 0) continue;
      const blocked = near(row, col);
      const options = Array.from({ length: n }, (_, i) => i).filter((i) => !blocked.has(i));
      const pickFrom = options.length ? options : Array.from({ length: n }, (_, i) => i);
      const least = Math.min(...pickFrom.map((i) => uses[i]));
      const cands = pickFrom.filter((i) => uses[i] === least);
      const img = cands[Math.floor(r() * cands.length)];
      grid[row][col] = img; uses[img]++;
    }
  const seen: number[] = Array(n).fill(0);
  const cells: SeaCell[] = [];
  for (let row = 0; row < SEA.rows; row++)
    for (let col = 0; col < SEA.cols; col++) {
      const img = grid[row][col];
      const inBlock = row >= SEA_BLOCK.r0 && row < SEA_BLOCK.r0 + SEA_BLOCK.rows && col >= SEA_BLOCK.c0 && col < SEA_BLOCK.c0 + SEA_BLOCK.cols;
      seen[img]++;
      cells.push({
        r: row, c: col, x: SEA_OX + col * PITCH_X, y: SEA_OY + row * PITCH_Y, img,
        flip: !inBlock && seen[img] % 2 === 0, // repeats outside the block are mirrored
        slogan: SLOGANS[Math.floor(r() * SLOGANS.length)], cta: CTAS[Math.floor(r() * CTAS.length)], inBlock,
      });
    }
  return cells;
}

/** The sea of sameness, absolutely positioned in stage pixels. Tiles are `.sm-tile` in row-major order. */
export function SeaGrid({ className = '' }: { className?: string }) {
  const images = generatedSet('sameness-');
  const cells = buildSea(images.length || 20);
  return (
    <div className={`sm-sea ${className}`} aria-hidden>
      {cells.map((cell, i) => (
        <div key={i} className={`sm-tile ${cell.flip ? 'is-flip' : ''} ${cell.inBlock ? 'in-block' : ''}`} style={{ left: cell.x, top: cell.y, width: SEA.cellW, height: SEA.cellH }}>
          {images.length
            ? <img src={images[cell.img % images.length]} alt="" draggable={false} />
            : <GenTile seed={30 + cell.img} palette={7} jitter={0.12} />}
          <span className="sm-ad-head">{cell.slogan}</span>
          <span className="sm-ad-cta">{cell.cta}</span>
        </div>
      ))}
    </div>
  );
}

function S2Sameness({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['sameness-flood'], mode === 'live');
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const tiles = q('.sm-tile');

    // ── beat 0: the headline ────────────────────────────────
    revealLines(tl, q('.sm-head')[0], {}, 0.05);
    tl.addLabel('b1');

    // ── beat 1: the numbers ─────────────────────────────────
    const stats = q('.sm-stat');
    stats.forEach((s, i) => {
      const at = `b1+=${i * 0.4}`;
      const num = s.querySelector('.sm-num-val');
      tl.from(s.querySelector('.sm-num'), { opacity: 0, y: 30, duration: 0.9 }, at);
      countUp(tl, num, Number(num?.getAttribute('data-to')), { duration: 1.5 }, at);
      revealWords(tl, s.querySelector('.sm-stat-text'), { stagger: 0.02 }, `${at}+0.35`);
      tl.from(s.querySelector('.sm-src'), { opacity: 0, duration: 0.8 }, `${at}+0.9`);
    });
    tl.addLabel('b2');

    // ── beat 2: the sea floods in ───────────────────────────
    gsap.set(tiles, { opacity: 0, scale: 0.72, transformOrigin: '50% 50%' });
    tl.call(() => { if (dir.current > 0) sfx.play('sameness-flood'); }, undefined, 'b2+=0.02');
    // one tile first, then the rest ripple out from it, faster and faster
    tl.to(tiles, {
      opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out',
      stagger: { grid: [SEA.rows, SEA.cols], from: [0.72, 0.55], amount: 1.7, ease: 'power2.out' },
    }, 'b2');
    tl.fromTo(q('.sm-sea'), { scale: 1.07 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 'b2');
    tl.to(stats, { opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: -0.15 }, 'b2+=0.55');
    tl.to(q('.sm-scrim'), { opacity: 1, duration: 1.2, ease: 'power2.out' }, 'b2+=0.5');
  });

  return (
    <div ref={root} className="sameness">
      <div className="sm-stats">
        <div className="sm-stat">
          <div className="sm-num display"><span className="sm-num-val" data-to="79">79</span><span className="sm-pct">%</span></div>
          <p className="sm-stat-text">of CMOs worry about a “sea of sameness.”</p>
          <p className="sm-src source">Dentsu Creative, 2025 CMO Report (1,950+ senior marketers, 14 markets)</p>
        </div>
        <div className="sm-stat">
          <div className="sm-num display"><span className="sm-num-val" data-to="69">69</span><span className="sm-pct">%</span></div>
          <p className="sm-stat-text">of consumers expect ads to become the same AI slop.</p>
          <p className="sm-src source">Canva, 2026 State of Marketing and AI, with The Harris Poll (3,547 consumers, 7 countries)</p>
        </div>
      </div>

      <SeaGrid />
      <div className="sm-scrim fill" />

      <h2 className="sm-head headline"><span className="sm-catch">The catch:</span> everything starts to look the same.</h2>
    </div>
  );
}

export default defineSlide({
  id: 's2-sameness',
  section: 2,
  title: 'The catch: sameness',
  steps: 2,
  notes:
    'This is the pivot of the section. Doing is cheap now. Taste isn\'t.\n' +
    'Click 1: the two numbers count up. 79% of CMOs worry about a "sea of sameness" (Dentsu Creative, 2025 CMO Report, 1,950+ senior marketers in 14 markets). 69% of consumers expect ads to become the same AI slop (Canva with The Harris Poll, 3,547 consumers in 7 countries).\n' +
    'Click 2: the sea. Every tile is the same brief (a sparkling water launch ad) run through default AI. Let it sit for a second.',
  Component: S2Sameness,
});
