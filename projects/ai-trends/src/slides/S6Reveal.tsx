import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { generatedUrl } from '@/components/GenArt';
import { useSfx } from '@/lib/sfx';
import openerSrc from './Opener.tsx?raw';
import outlineSrc from '../../docs/outline.md?raw';
import sourceDeckSrc from '../../docs/source-deck.md?raw';
import './S6Reveal.css';

/**
 * 6A · One more thing: this deck was built with AI.
 *  beat 0  an ordinary statement slide.
 *  beat 1  it peels apart into the layers it was made from, in 3D: prompts, code, generated images, human edits, the slide.
 *  beat 2  three receipts come forward: a real prompt, a real edit, the real totals.
 *  beat 3  everything snaps back into one slide, and the human half of the sentence stays lit.
 * Every receipt is read from this repo at build time: the .prompt.json sidecars, the source files, the outline.
 */

// ── receipts, read from the repo ─────────────────────────────
interface Sidecar { model?: string; input?: { prompt?: string }; seconds?: number }
const SIDECARS = import.meta.glob('../assets/generated/*.prompt.json', { eager: true, import: 'default' }) as Record<string, Sidecar>;
const PROMPTS = Object.entries(SIDECARS)
  .map(([path, s]) => {
    const file = path.split('/').pop()!.replace(/\.prompt\.json$/, '');
    return { file, id: file.replace(/\.(png|jpe?g|webp)$/, ''), model: (s.model ?? '').split('/').pop() ?? '', prompt: s.input?.prompt ?? '', seconds: s.seconds ?? 0 };
  })
  .filter((p) => p.prompt)
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
const GEN_SECONDS = PROMPTS.reduce((t, p) => t + p.seconds, 0);

const SOURCES = import.meta.glob('../**/*.{ts,tsx,css}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const CODE_FILES = Object.keys(SOURCES).filter((k) => !k.includes('zz-')).length;
const CODE_LINES = Object.entries(SOURCES).filter(([k]) => !k.includes('zz-')).reduce((t, [, s]) => t + s.split('\n').length, 0);

// Draft lines from the source deck and the lines that replaced them in the approved outline. A pair only shows if both are really there.
const EDITS = ([
  ['AI stopped talking and started doing.', 'Give it a goal, not a prompt.'],
  ['Talking instead of typing.', 'Talk to it like a teammate.'],
  ['AI designs right on the Figma canvas.', 'Describe the screen. Watch it appear.'],
  ['One meeting, every tool.', 'One meeting. Every tool.'],
  ['AI design that doesn’t look like AI.', 'Taste is the difference.'],
] as const).filter(([a, b]) => sourceDeckSrc.includes(a) && outlineSrc.includes(b));
const MOTION_NOTES = [...outlineSrc.matchAll(/Motion: ([^\n]+)/g)].map((m) => m[1]).filter((n) => n.length < 150).slice(0, 5);

const RECEIPT_PROMPT = PROMPTS.find((p) => p.id === 'fourd-moment') ?? PROMPTS[0];
const RECEIPT_EDIT = EDITS.find(([a]) => a.startsWith('Talking')) ?? EDITS[0];
const ASSET_IDS = PROMPTS.map((p) => p.id).filter((id) => generatedUrl(id));
const fmtTime = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

const LAYERS = [
  { key: 'prompts', label: 'Prompts', meta: `${PROMPTS.length} sidecar files` },
  { key: 'code', label: 'Code', meta: `${CODE_FILES} files · ${CODE_LINES.toLocaleString('en-CA')} lines` },
  { key: 'assets', label: 'Generated', meta: `${ASSET_IDS.length} images` },
  { key: 'human', label: 'Human edits', meta: 'the outline, rewritten' },
  { key: 'slide', label: 'The slide', meta: '' },
] as const;
const PEELED = { rotationX: 52, rotationZ: -30, scale: 0.25, x: 110, y: -6 };
const RECEIPTS_POSE = { x: -360, y: -6, scale: 0.23 };
// Each layer lifts (z, not affected by the stack's 2D scale) and slides back along the plane (y), so every layer shows.
const GAP_Z = 180;
const GAP_Y = -320;
const spread = (i: number) => ({ z: (i - 2) * GAP_Z, y: (i - 2) * GAP_Y });

function CodeLines() {
  const lines = openerSrc.split('\n').slice(0, 150);
  return (
    <div className="rv-code">
      {lines.map((l, i) => {
        const t = l.trim();
        const cls = t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') ? 'is-c' : /^(export|function|const|import|interface)\b/.test(t) ? 'is-k' : '';
        return <div key={i} className={cls}>{l || ' '}</div>;
      })}
    </div>
  );
}

function Reveal({ step, direction, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useSfx(['s6-reveal-peel', 's6-reveal-snap'], mode === 'live', 0.55);
  const dir = useRef(direction);
  dir.current = direction;

  useBeats(root, step, (tl) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const stack = q('.rv-stack')[0];
    const layers = q('.rv-layer');
    const labels = q('.rv-lab');
    const scale = el.getBoundingClientRect().width / 1920 || 1;
    const origin = el.getBoundingClientRect();

    // Where does each layer's left-most corner land in the exploded poses? Pose it, measure, put it back.
    const measure = (pose: gsap.TweenVars) => {
      gsap.set(stack, { ...PEELED, ...pose });
      layers.forEach((l, i) => gsap.set(l, spread(i)));
      const pts = layers.map((l) => {
        const c = [...l.querySelectorAll('.rv-anchor')].map((a) => a.getBoundingClientRect());
        const left = c.reduce((m, r) => (r.left < m.left ? r : m), c[0]);
        return { x: (left.left - origin.left) / scale, y: (left.top - origin.top) / scale };
      });
      return pts;
    };
    const atPeel = measure({});
    gsap.set(stack, { rotationX: 0, rotationZ: 0, scale: 1, x: 0, y: 0 });
    layers.forEach((l, i) => gsap.set(l, { z: i * 0.4, y: 0, opacity: i === layers.length - 1 ? 1 : 0 }));
    labels.forEach((lab, i) => gsap.set(lab, { x: atPeel[i].x - 24, y: atPeel[i].y, xPercent: -100, yPercent: -50 }));

    // ── beat 0: an ordinary slide ─────────────────────────────
    revealLines(tl, q('.rv-head')[0], {}, 0);
    revealWords(tl, q('.rv-lede')[0], {}, 0.45);
    tl.addLabel('b1');

    // ── beat 1: peel apart into its layers ────────────────────
    tl.call(() => { if (dir.current > 0) sfx.play('s6-reveal-peel'); }, undefined, 'b1');
    tl.to(stack, { ...PEELED, duration: 1.6, ease: 'expo.inOut' }, 'b1');
    layers.forEach((l, i) => {
      tl.to(l, { ...spread(i), duration: 1.5, ease: 'expo.inOut' }, `b1+=${0.35 + (layers.length - 1 - i) * 0.05}`);
      if (i < layers.length - 1) tl.to(l, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 'b1+=0.45');
    });
    tl.to(layers, { '--rv-ring': 'rgba(248, 247, 244, 0.16)', duration: 0.6 }, 'b1+=0.3');
    tl.to(labels, { opacity: 1, duration: 0.6, stagger: 0.08 }, 'b1+=1.5');
    tl.addLabel('b2');

    // ── beat 2: three receipts come forward ───────────────────
    tl.to(stack, { ...RECEIPTS_POSE, duration: 1.1, ease: 'power3.inOut' }, 'b2');
    tl.to(labels, { opacity: 0, duration: 0.4 }, 'b2');
    const receipts = q('.rv-rc');
    const sourceLayer = [0, 3, 1]; // prompt ← prompts, edit ← human edits, totals ← code
    receipts.forEach((r, i) => {
      const at = `b2+=${0.6 + i * 0.32}`;
      tl.fromTo(r, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.8 }, at);
      tl.to(layers[sourceLayer[i]], { '--rv-ring': 'rgba(0, 228, 130, 0.9)', duration: 0.3 }, at);
    });
    tl.addLabel('b3');

    // ── beat 3: snap back together ────────────────────────────
    tl.to(receipts, { opacity: 0, x: 40, duration: 0.45, ease: 'power2.in', stagger: 0.05 }, 'b3');
    tl.to(layers, { '--rv-ring': 'rgba(248, 247, 244, 0)', duration: 0.6 }, 'b3+=0.6');
    tl.to(stack, { rotationX: 0, rotationZ: 0, scale: 1, x: 0, y: 0, duration: 1.1, ease: 'expo.inOut' }, 'b3+=0.2');
    layers.forEach((l, i) => tl.to(l, { z: i * 0.4, y: 0, duration: 0.9, ease: 'back.in(1.2)' }, 'b3+=0.25'));
    tl.call(() => { if (dir.current > 0) sfx.play('s6-reveal-snap'); }, undefined, 'b3+=1.12');
    tl.to(layers.slice(0, -1), { opacity: 0, duration: 0.2 }, 'b3+=1.25');
    tl.fromTo(stack, { scale: 1 }, { scale: 1.012, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 'b3+=1.15');
    tl.to(q('.rv-lede-a'), { color: '#737068', duration: 0.8 }, 'b3+=1.4');
    tl.to(q('.rv-lede-b'), { color: '#f8f7f4', duration: 0.8 }, 'b3+=1.4');
  });

  const anchors = (
    <>
      <i className="rv-anchor" style={{ left: 0, top: 0 }} />
      <i className="rv-anchor" style={{ left: 1919, top: 0 }} />
      <i className="rv-anchor" style={{ left: 0, top: 1079 }} />
      <i className="rv-anchor" style={{ left: 1919, top: 1079 }} />
    </>
  );

  return (
    <div ref={root} className="rv">
      <div className="rv-scene">
        <div className="rv-stack">
          <div className="rv-layer rv-l-prompts">
            <div className="rv-layer-k label">01 · Prompts</div>
            <div className="rv-prompts">
              {PROMPTS.slice(0, 16).map((p) => (
                <div key={p.file} className="rv-pc">
                  <div className="rv-pc-h"><b>{p.id}</b><span>{p.model} · {p.seconds} s</span></div>
                  <p>{p.prompt}</p>
                </div>
              ))}
            </div>
            {anchors}
          </div>

          <div className="rv-layer rv-l-code">
            <div className="rv-layer-k label">02 · src/slides/Opener.tsx</div>
            <CodeLines />
            {anchors}
          </div>

          <div className="rv-layer rv-l-assets">
            <div className="rv-layer-k label">03 · src/assets/generated</div>
            <div className="rv-assets">
              {ASSET_IDS.slice(0, 18).map((id) => (
                <div key={id} className="rv-ac"><img src={generatedUrl(id)} alt="" draggable={false} /><span>{id}</span></div>
              ))}
            </div>
            {anchors}
          </div>

          <div className="rv-layer rv-l-human">
            <div className="rv-layer-k label">04 · docs/outline.md</div>
            <div className="rv-human">
              <div>
                <h4>Draft → approved</h4>
                {EDITS.map(([a, b]) => (
                  <div key={a} className="rv-edit"><em>Edit</em><s>{a}</s><b>{b}</b></div>
                ))}
              </div>
              <div>
                <h4>Motion notes</h4>
                {MOTION_NOTES.map((n) => <p key={n} className="rv-note">{n}</p>)}
              </div>
            </div>
            {anchors}
          </div>

          <div className="rv-layer rv-l-slide">
            <div className="rv-slide">
              <h2 className="rv-head headline">One more thing: this deck was built with AI.</h2>
              <p className="rv-lede lede">
                <span className="rv-lede-a">AI did the research, drafts, layouts, code and animation.</span>{' '}
                <span className="rv-lede-b">We did the ideas, the edit and the taste.</span>
              </p>
            </div>
            {anchors}
          </div>
        </div>
      </div>

      <div className="rv-labels" aria-hidden>
        {LAYERS.map((l, i) => (
          <div key={l.key} className="rv-lab">
            <b>0{i + 1} {l.label}</b>{l.meta && <span>{l.meta}</span>}<i />
          </div>
        ))}
      </div>

      <div className="rv-receipts">
        {RECEIPT_PROMPT && (
          <div className="rv-rc">
            <div className="rv-rc-k label"><span>Receipt · a prompt</span><span>{RECEIPT_PROMPT.file}.prompt.json</span></div>
            <div className="rv-rc-prompt">
              {generatedUrl(RECEIPT_PROMPT.id) ? <img src={generatedUrl(RECEIPT_PROMPT.id)} alt="" /> : <span />}
              <div>
                <p>“{RECEIPT_PROMPT.prompt}”</p>
                <div className="rv-rc-meta">{RECEIPT_PROMPT.model} · {RECEIPT_PROMPT.seconds} s</div>
              </div>
            </div>
          </div>
        )}
        {RECEIPT_EDIT && (
          <div className="rv-rc">
            <div className="rv-rc-k label"><span>Receipt · an edit</span><span>source deck → outline</span></div>
            <div className="rv-rc-edit"><s>{RECEIPT_EDIT[0]}</s><b>{RECEIPT_EDIT[1]}</b></div>
          </div>
        )}
        <div className="rv-rc">
          <div className="rv-rc-k label"><span>Receipt · the totals</span><span>counted from this repo</span></div>
          <div className="rv-rc-time">
            <div><b>{PROMPTS.length}</b><span>generated files, {fmtTime(GEN_SECONDS)} of machine time</span></div>
            <div><b>{CODE_LINES.toLocaleString('en-CA')}</b><span>lines of code in {CODE_FILES} files</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's6-reveal',
  section: 5,
  title: '6A · This deck was built with AI',
  steps: 3,
  notes:
    'Show two or three real receipts here, like a prompt, a before-and-after or the time saved. It’s the proof of everything you just said.\n' +
    'Click 1: the slide peels apart into what it is made of: the prompts, the code, the generated images and our edits.\n' +
    `Click 2: three receipts. A real prompt (${RECEIPT_PROMPT?.id ?? 'one image'}). A real edit: our draft line struck out and the line we chose. And the totals, counted live from the repo: ${PROMPTS.length} generated files in ${fmtTime(GEN_SECONDS)} of machine time, ${CODE_LINES.toLocaleString('en-CA')} lines of code.\n` +
    'Click 3: it snaps back into one slide. Land on the second sentence: we did the ideas, the edit and the taste.',
  Component: Reveal,
});
