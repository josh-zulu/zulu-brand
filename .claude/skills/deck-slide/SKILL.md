---
name: deck-slide
description: Build or change a slide in the AI Trends web deck (projects/ai-trends). Use for any new slide, motion change, clip slot, live demo, speaker note or running-order change.
---

# Building a slide

## Contract
- File: `projects/ai-trends/src/slides/<Name>.tsx`, default export `defineSlide({...})`; list it in `src/deck.ts`.
- Fields: `id` (hash slug), `section` (0–6), `title`, `steps` (clicks after arrival), `notes` (speaker notes, `\n` between paragraphs), `theme` ('dark' | 'paper'), `chrome` (false hides logo/footer for dividers and full-bleed moments), `transition` ('fade' | 'cut' | 'rise' | 'blur').
- Canvas is 1920×1080 px. Keep text inside 140px side margins, 120px top/bottom (chrome sits at 52–72px).
- Styles: a co-located `<Name>.css` imported by the slide, every class prefixed with a short slide prefix (e.g. `.tl-` for Throughline) so nothing leaks.

## Motion
```tsx
const root = useRef<HTMLDivElement>(null);
useBeats(root, step, (tl) => {
  const q = gsap.utils.selector(root);
  revealLines(tl, q('.x-head')[0]);          // beat 0: entry
  tl.addLabel('b1');                          // click 1 starts here
  tl.to(q('.x-thing'), { opacity: 1 });
  tl.addLabel('b2');                          // click 2
});
```
- One motion idea per slide, and it must explain the point. Durations: arrivals 0.8–1.4s with `expo.out`/`zak.out`, moves `power3.inOut`, hand-made things `zak.settle`.
- Measure DOM inside the build function (the stage is already scaled; divide rects by `root.getBoundingClientRect().width / 1920`).
- A `tl.set`/`tl.call` placed exactly on a label belongs to the beat that label starts (the engine rests a hair before each label), so `tl.call(playSound, [], 'b2')` fires on click 2, not at the end of beat 1.
- Thumbnails in the overview show the last beat; set `overviewStep` if another beat represents the slide better.
- Ambient loops are separate tweens, never on `tl`. Use `rng(seed)` for any randomness so every run is identical.
- `mode === 'preview'` → no audio, mic, autoplaying sound or network calls. Sounds: `useSfx(['name'], mode === 'live')`, only play when `direction > 0`.
- Clips: `<ClipFrame src="clips/x.mp4" duration="45s" mode={mode} />`. Missing files show a designed placeholder, so slides work before footage arrives.
- Live demos: always ship an offline fallback (scripted run) that looks identical.

## Reuse before you build
`Statement`, `SectionDivider`, `ClipFrame`, `AgentCursor`, `HandLine` (human moments only: 1B and the close), `GenImage`/`GenTile`, `ZakMark`, `motion.ts` helpers. The opener (`slides/Opener.tsx`) is the reference for a complex measured sequence.

## Verify
1. `cd projects/ai-trends && npx tsc --noEmit`
2. Dev server on http://localhost:5180 (start with `npm run dev` from the repo root if it isn't running). Open `#/<id>/<step>`.
3. The browser pane may be hidden (animations throttled). Scrub instead of waiting: `__beats.pause().seek(t, false)` (`false` = run onUpdate, so typed text and counters render) then screenshot. Check the first frame, each beat's end state, and stepping backwards.
4. Press `O` (overview) to see the slide's final state as a thumbnail.
