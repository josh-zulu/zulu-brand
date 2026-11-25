import { useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { rng } from '@/lib/motion';
import { useSfx } from '@/lib/sfx';
import './S2Divider.css';
import { media } from '@/lib/asset';

/**
 * Section 2 divider: IT WORKS WHERE WE WORK.
 * One idea: our tools plug into one place. Five tool chips drift in from the dark and click into the sockets of a
 * debossed pill (the ZAK slot), each socket's light comes on, then a signal pulse runs the length of the strip.
 * The title block keeps the shared divider rhythm (number roll, rule, title wipe) using SectionDivider's classes.
 *
 * Tool marks are brand-neutral glyphs. To use real logos, drop SVGs into public/media/logos/<slug>.svg
 * (figma, asana, blender, resolve, google-workspace); they replace the glyphs automatically.
 */
type Tool = { slug: string; name: string };
const TOOLS: Tool[] = [
  { slug: 'figma', name: 'Figma' },
  { slug: 'asana', name: 'Asana' },
  { slug: 'blender', name: 'Blender' },
  { slug: 'resolve', name: 'Resolve' },
  { slug: 'google-workspace', name: 'Google Workspace' },
];
/** Order the chips plug in (not left to right, so it feels like hands, not a loop). */
const PLUG_ORDER = [2, 0, 4, 1, 3];

function Glyph({ slug }: { slug: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (slug) {
    case 'figma': // a frame: the canvas tool
      return <svg viewBox="0 0 48 48"><path {...s} d="M16 7v34M32 7v34M7 16h34M7 32h34" /></svg>;
    case 'asana': // tasks: a done dot, two open ones, three bars
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="11" cy="13" r="4.5" fill="currentColor" />
          <circle {...s} cx="11" cy="24" r="4" /><circle {...s} cx="11" cy="35" r="4" />
          <path {...s} d="M21 13h18M21 24h14M21 35h17" />
        </svg>
      );
    case 'blender': // a cube in wireframe: 3D
      return <svg viewBox="0 0 48 48"><path {...s} d="M24 6l16 9v18l-16 9-16-9V15zM24 24v18M24 24l16-9M24 24L8 15" /></svg>;
    case 'resolve': // clips on a timeline, with a playhead
      return (
        <svg viewBox="0 0 48 48">
          <path {...s} strokeWidth={5} d="M8 14h14M18 24h20M11 34h16" />
          <path {...s} d="M31 7v34" />
        </svg>
      );
    default: // workspace: a grid of apps
      return (
        <svg viewBox="0 0 48 48">
          <circle {...s} cx="15" cy="15" r="6" /><circle {...s} cx="33" cy="15" r="6" />
          <circle {...s} cx="15" cy="33" r="6" /><circle cx="33" cy="33" r="6" fill="currentColor" />
        </svg>
      );
  }
}

/** A real logo from public/media/logos/<slug>.svg if one has been dropped in, the abstract glyph otherwise. */
function ToolMark({ slug }: { slug: string }) {
  const [logo, setLogo] = useState<'try' | 'ok' | 'none'>('try');
  return (
    <span className="s2d-mark">
      {logo !== 'ok' && <Glyph slug={slug} />}
      {logo !== 'none' && (
        <img
          src={media(`logos/${slug}.svg`)}
          alt=""
          draggable={false}
          style={{ display: logo === 'ok' ? 'block' : 'none' }}
          onLoad={(e) => setLogo((e.currentTarget as HTMLImageElement).naturalWidth > 0 ? 'ok' : 'none')}
          onError={() => setLogo('none')}
        />
      )}
    </span>
  );
}

function S2Divider({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s2-divider-plug'], mode === 'live', 0.5);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const chips = q('.s2d-chip');
    const r = rng(208);

    // ── title block: the shared divider rhythm ─────────────────
    tl.from(q('.s2d-bg'), { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0);
    tl.from(q('.div-digit-strip'), { yPercent: -90, duration: 1.4, ease: 'expo.out' }, 0.15);
    tl.from(q('.div-rule'), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.35);
    tl.fromTo(q('.div-title'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut' }, 0.55);
    tl.from(q('.div-title'), { x: -40, duration: 1.6, ease: 'expo.out' }, 0.55);

    // ── the hub: an empty slot with five sockets ───────────────
    tl.from(q('.s2d-slot'), { scaleX: 0.86, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.1);
    tl.from(q('.s2d-socket-ghost'), { opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, 0.4);

    // ── drift: each chip floats in from the dark toward a spot near its socket ──
    const hover = chips.map((_, i) => ({
      x: (i - 2) * 46 + (r() - 0.5) * 80,
      y: i % 2 ? 110 + r() * 40 : -(150 + r() * 60),
      rotation: (r() - 0.5) * 16,
    }));
    chips.forEach((c, i) => {
      const angle = (i / chips.length) * Math.PI * 2 + r();
      gsap.set(c, {
        x: hover[i].x + Math.cos(angle) * (520 + r() * 260),
        y: hover[i].y + Math.sin(angle) * 260,
        rotation: hover[i].rotation * 3, scale: 0.78, opacity: 0, filter: 'blur(10px)',
      });
    });
    tl.to(chips, {
      x: (i: number) => hover[i].x, y: (i: number) => hover[i].y, rotation: (i: number) => hover[i].rotation,
      scale: 0.94, opacity: 1, filter: 'blur(0px)', duration: 1.9, ease: 'power2.out', stagger: 0.08,
    }, 0.2);

    // ── plug in: one by one, a fast seat and a small settle ─────
    const plugStart = 1.75;
    PLUG_ORDER.forEach((i, k) => {
      const at = plugStart + k * 0.26;
      const chip = chips[i];
      tl.to(chip, { x: 0, y: 0, rotation: 0, duration: 0.42, ease: 'power3.in' }, at);
      tl.to(chip, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, at + 0.38);
      tl.call(() => { if (dir.current > 0) sfx.play('s2-divider-plug'); }, undefined, at + 0.4);
      tl.fromTo(q('.s2d-flash')[i], { opacity: 0.9, scale: 0.92 }, { opacity: 0, scale: 1.14, duration: 0.7, ease: 'power2.out', immediateRender: false }, at + 0.4);
      tl.to(q('.s2d-led-on')[i], { opacity: 1, duration: 0.18, ease: 'power1.out' }, at + 0.42);
    });

    // ── connected: a signal pulse runs the strip; the hub glows ──
    const sweepAt = plugStart + PLUG_ORDER.length * 0.26 + 0.55;
    gsap.set(q('.s2d-sweep'), { xPercent: -120 });
    tl.set(q('.s2d-sweep'), { opacity: 1 }, sweepAt);
    tl.to(q('.s2d-sweep'), { xPercent: 820, duration: 1.3, ease: 'power2.inOut' }, sweepAt);
    tl.set(q('.s2d-sweep'), { opacity: 0 }, sweepAt + 1.3);
    tl.to(q('.s2d-glow'), { opacity: 1, duration: 1.6, ease: 'power2.out' }, sweepAt + 0.2);
    tl.from(q('.s2d-status'), { opacity: 0, y: 8, duration: 0.7, ease: 'power2.out' }, sweepAt + 0.7);
  });

  const strip = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2];
  return (
    <div ref={root} className="s2d section-divider align-bottom">
      <div className="s2d-bg fill" />
      <div className="s2d-glow" />

      <div className="s2d-hub">
        <div className="s2d-slot">
          <div className="s2d-sweep-clip"><div className="s2d-sweep" /></div>
          {TOOLS.map((t) => (
            <div key={t.slug} className="s2d-socket" data-tool={t.slug}>
              <div className="s2d-socket-ghost" />
              <div className="s2d-flash" />
              <div className="s2d-chip">
                <ToolMark slug={t.slug} />
                <span className="s2d-name">{t.name}</span>
                <span className="s2d-led"><i className="s2d-led-on" /></span>
              </div>
            </div>
          ))}
        </div>
        <div className="s2d-status label"><i />Connected</div>
      </div>

      <div className="div-content">
        <div className="div-number display">
          <span className="div-zero">0</span>
          <span className="div-digit"><span className="div-digit-strip">{strip.map((d, i) => <span key={i}>{d}</span>)}</span></span>
        </div>
        <div className="div-rule" />
        <h1 className="div-title display display-l">It works where we work</h1>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's2-divider',
  section: 2,
  title: 'Divider: It works where we work',
  chrome: false,
  notes:
    'Section 2 is the "it does" part of the story, made concrete.\n' +
    'The tools on screen are the ones we already use every day: Figma, Asana, Blender, Resolve, Google Workspace. AI now plugs straight into them. Next few slides: what that looks like in each one.',
  Component: S2Divider,
});
