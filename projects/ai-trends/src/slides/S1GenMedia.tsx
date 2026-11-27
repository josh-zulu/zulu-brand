import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, rng } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { AgentCursor } from '@/components/AgentCursor';
import { media } from '@/lib/asset';
import './S1GenMedia.css';

/**
 * Generative media got really good. One motion idea: every example develops out of noise, the way these models render.
 *  beat 0  headline; the release rail draws; Nano Banana (Pro → 2) lands and its example develops.
 *  beat 1  Seedance 2.0 lands: a real Seedance clip (Hiep's Thanksgiving gone wrong) plays over its 15s timeline with sound.
 *  beat 2  GPT Image 2 lands: a beat of "thinking", then a poster and a magazine spread full of text develop.
 *  beat 3  "And agents can call them." An agent cursor calls each model in turn and each example re-renders;
 *          the receipt: this deck's generated images were made that way.
 * Example images are this deck's own (Nano Banana 2 / Pro via tools/fal.mjs); the caption says so.
 */
const img = (id: string) => `url(${generatedUrl(id) ?? ''})`;

type Card = { x: number; date: string; maker: string; name: string; facts: string[]; src: string; call: { model: string; job: string } };
const CARDS: Card[] = [
  {
    x: 140, date: 'Nov 2025 · Feb 2026', maker: 'Google', name: 'Nano Banana Pro → 2',
    facts: ['Flash speed, up to 4K', 'Blends up to 14 objects into one scene'],
    src: 'Source: Google (blog.google), TechCrunch',
    call: { model: 'nano-banana-2', job: 'image' },
  },
  {
    x: 700, date: 'Feb 2026', maker: 'ByteDance', name: 'Seedance 2.0',
    facts: ['15-second video, with sound', 'Directed by text, image, audio and video'],
    src: 'Source: ByteDance Seed (seed.bytedance.com)',
    call: { model: 'seedance-2.0', job: 'video' },
  },
  {
    x: 1260, date: 'Apr 2026', maker: 'OpenAI', name: 'GPT Image 2',
    facts: ['Reasons before it draws', 'Much better text and layout'],
    src: 'Source: OpenAI (developers.openai.com), TechCrunch, 21 Apr 2026',
    call: { model: 'gpt-image-2', job: '8 images' },
  },
];
const RAIL_W = 1640;
const WELL = { y: 420, w: 520, h: 270 };
const SEG_W = 520 - 14 - 72; // seedance timeline width
const WAVE = (() => {
  const r = rng(7);
  return Array.from({ length: 62 }, (_, i) => {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.21 + 0.6));
    return Math.max(2, Math.round(16 * env * (0.35 + r() * 0.65)));
  });
})();

const BLUR = { filter: 'blur(26px) saturate(0.15) brightness(1.25)', scale: 1.14 };
const CLEAR = { filter: 'blur(0px) saturate(1) brightness(1)', scale: 1 };

function S1GenMedia({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    const cards = q('.gm-card');
    const cursor = q('.agent-cursor')[0];
    const imgsOf = (k: number) => Array.from(cards[k].querySelectorAll<HTMLElement>('.gm-img'));
    const noiseOf = (k: number) => cards[k].querySelector('.gm-noise');

    gsap.set(q('.gm-img'), BLUR);
    gsap.set(cursor, { x: 960, y: 1120, opacity: 0 });

    /** Noise to image, like a diffusion render. */
    const develop = (k: number, at: gsap.Position, stagger = 0) => {
      tl.set(imgsOf(k), BLUR, at);
      tl.fromTo(noiseOf(k), { opacity: 0.75 }, { opacity: 0, duration: 1.3, ease: 'sine.in', immediateRender: false }, at);
      tl.to(imgsOf(k), { ...CLEAR, duration: 1.5, ease: 'power3.out', stagger }, at);
    };
    const arrive = (k: number, at: number) => {
      const c = cards[k];
      tl.to(q('.gm-rail-fill'), { scaleX: (CARDS[k].x - 140 + 8) / RAIL_W, duration: 0.9, ease: 'power3.inOut' }, at);
      tl.to(c.querySelector('.gm-node'), { scale: 1, duration: 0.6, ease: 'back.out(3)' }, at + 0.45);
      tl.from(c.querySelector('.gm-meta'), { opacity: 0, x: -14, duration: 0.7, ease: 'power3.out' }, at + 0.5);
      tl.from(c.querySelector('.gm-well'), { opacity: 0, y: 36, duration: 1.1 }, at + 0.55);
      revealLines(tl, c.querySelector('.gm-name'), { duration: 1 }, at + 0.8);
      tl.from(c.querySelectorAll('.gm-facts li'), { opacity: 0, y: 12, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, at + 1.0);
      tl.from(c.querySelector('.gm-src'), { opacity: 0, duration: 0.6 }, at + 1.3);
    };

    // ── beat 0: headline, rail, Nano Banana ───────────────────
    revealLines(tl, q('.gm-head')[0], {}, 0.05);
    revealWords(tl, q('.gm-lede')[0], { stagger: 0.03 }, 0.45);
    tl.from(q('.gm-rail-track'), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.3);
    tl.from(q('.gm-caption'), { opacity: 0, duration: 0.8 }, 1.2);
    arrive(0, 0.6);
    develop(0, 1.2, 0.12);

    // ── beat 1: Seedance 2.0 ──────────────────────────────────
    tl.addLabel('b1');
    let t = tl.labels.b1;
    arrive(1, t);
    develop(1, t + 0.6);
    tl.from(cards[1].querySelector('.gm-strip'), { yPercent: 100, duration: 0.8, ease: 'power3.out' }, t + 1.0);

    // ── beat 2: GPT Image 2 ───────────────────────────────────
    tl.addLabel('b2');
    t = tl.labels.b2;
    arrive(2, t);
    tl.fromTo(q('.gm-think'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t + 0.7);
    tl.fromTo(q('.gm-think i'), { opacity: 0.2 }, { opacity: 1, duration: 0.2, stagger: { each: 0.1, repeat: 3, yoyo: true }, immediateRender: false }, t + 0.8);
    tl.to(q('.gm-think'), { opacity: 0, duration: 0.3 }, t + 1.75);
    develop(2, t + 1.7, 0.07);

    // ── beat 3: and agents can call them ──────────────────────
    tl.addLabel('b3');
    t = tl.labels.b3;
    tl.to(q('.gm-lede'), { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in' }, t);
    revealLines(tl, q('.gm-turn')[0], {}, t + 0.25);
    tl.to(q('.gm-rail-fill'), { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, t + 0.2);
    tl.to(cursor, { opacity: 1, duration: 0.2 }, t + 0.6);
    let at = t + 0.6;
    CARDS.forEach((c, k) => {
      const cx = c.x + WELL.w * 0.55, cy = WELL.y + WELL.h * 0.52;
      tl.to(cursor, { x: cx, y: cy, duration: k === 0 ? 0.75 : 0.6, ease: 'power3.inOut' }, at);
      const press = at + (k === 0 ? 0.75 : 0.6);
      tl.to(cursor, { scale: 0.86, duration: 0.08 }, press);
      tl.to(cursor, { scale: 1, duration: 0.12 }, press + 0.1);
      develop(k, press + 0.1, k === 2 ? 0.05 : 0.08);
      at = press + 0.85;
    });
    tl.to(cursor, { x: 1180, y: 1120, opacity: 0, duration: 0.7, ease: 'power2.in' }, at);
    tl.to(q('.gm-receipt'), { opacity: 1, duration: 0.3 }, at + 0.1);
    revealWords(tl, q('.gm-receipt-text')[0], { stagger: 0.035, duration: 0.6 }, at + 0.1);
  });

  // Ambient: the real Seedance clip plays (live only); the playhead and timecode follow it (not on the beat timeline).
  const clip = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = root.current, v = clip.current;
    if (!el || !v) return;
    if (mode === 'live' && step >= 1) v.play().catch(() => {}); else v.pause();
    const head = el.querySelector<HTMLElement>('.gm-playhead');
    const time = el.querySelector<HTMLElement>('.gm-time');
    let raf = 0;
    const tick = () => {
      const d = v.duration || 15;
      if (head) head.style.transform = `translateX(${(v.currentTime / d) * SEG_W}px)`;
      if (time) time.textContent = `00:${String(Math.floor(v.currentTime)).padStart(2, '0')}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, step]);

  return (
    <div ref={root} className="genmedia">
      <h2 className="gm-head headline">Generative media got really good.</h2>
      <p className="gm-lede lede">Three releases in five months.</p>
      <h2 className="gm-turn headline">And agents can call them.</h2>
      <p className="gm-receipt"><span className="gm-receipt-text"><b>›</b> The generated images in this deck were made this way: Claude calling Nano Banana from a script.</span></p>

      <div className="gm-rail"><div className="gm-rail-track" /><div className="gm-rail-fill" /></div>

      {CARDS.map((c, k) => (
        <div key={c.name} className="gm-card" style={{ left: c.x }}>
          <div className="gm-meta label"><span className="gm-date">{c.date}</span><span className="gm-maker">{c.maker}</span></div>
          <span className="gm-node" />
          <div className="gm-well">
            {k === 0 && (
              <>
                <div className="gm-img" style={{ left: 0, top: 0, width: 344, height: 270, backgroundImage: img('nb-blend') }} />
                <div className="gm-img" style={{ left: 348, top: 0, width: 172, height: 133, backgroundImage: img('nb-camera') }} />
                <div className="gm-img" style={{ left: 348, top: 137, width: 172, height: 133, backgroundImage: img('nb-bag') }} />
              </>
            )}
            {k === 1 && (
              <>
                <div className="gm-img gm-clip" style={{ left: 0, top: 0, width: 520, height: 218 }}>
                  <video ref={clip} src={media('hv/thanksgiving-film.mp4')} muted loop playsInline preload={mode === 'live' ? 'auto' : 'metadata'} />
                </div>
                <div className="gm-strip">
                  <div className="gm-segs"><i /></div>
                  <svg className="gm-wave" viewBox={`0 0 ${WAVE.length * 7} 16`} preserveAspectRatio="none" aria-hidden>
                    {WAVE.map((h, i) => <rect key={i} x={i * 7} y={(16 - h) / 2} width="4" height={h} rx="2" />)}
                  </svg>
                  <span className="gm-playhead" />
                  <span className="gm-time">00:00</span>
                </div>
              </>
            )}
            {k === 2 && (
              <>
                <div className="gm-img" style={{ left: 0, top: 4, width: 196, height: 262, backgroundImage: img('gpt-poster') }} />
                <div className="gm-img" style={{ left: 200, top: 28, width: 320, height: 213, backgroundImage: img('gpt-spread') }} />
                <div className="gm-think"><span>thinking <i>·</i><i>·</i><i>·</i></span></div>
              </>
            )}
            <div className="gm-noise" />
          </div>
          <div className="gm-name headline">{c.name}</div>
          <ul className="gm-facts">{c.facts.map((f) => <li key={f}>{f}</li>)}</ul>
          <div className="gm-src source">{c.src}</div>
        </div>
      ))}

      <div className="gm-caption source">Examples made for this deck: Nano Banana Pro blending two product shots into one 4K scene; a poster and spread from ChatGPT’s image tool (via Codex). Seedance clip: Hiep Vu.</div>
      <AgentCursor label="Agent" />
    </div>
  );
}

export default defineSlide({
  id: 's1-genmedia',
  section: 1,
  title: 'Generative media got really good',
  steps: 3,
  notes:
    'One click per release, then one for the turn. Keep it brisk: this is context, not a product tour.\n' +
    'Nano Banana, from Google: Pro last November, then Nano Banana 2 in February. Flash speed, up to 4K, and it blends up to 14 objects into one scene.\n' +
    'Seedance 2.0, from ByteDance, in February: 15 seconds of video with sound, directed with text, images, audio and video. That clip is Hiep’s; you’ll see how he made it later.\n' +
    'GPT Image 2, from OpenAI, in April: it reasons before it draws, so text and layout finally hold up.\n' +
    'The turn: and agents can call them. An agent can pick the right model for the job and generate as one step in a bigger task. That is how this deck was made: Claude calling image models through scripts.',
  Component: S1GenMedia,
});
