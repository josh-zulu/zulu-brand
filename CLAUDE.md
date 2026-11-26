# Zulu brand repo

Zulu Alpha Kilo's home for brand-led, AI-made work. Shared brand system, generative tools and Claude skills live at the top level; each piece of work is a project under `projects/`. First project: **AI Trends**, the December 2026 company talk by the Zulu AI Working Group.

```
brand/            tokens.css (source of truth), BRAND.md (rules + voice), logos/, reference/
tools/            zero-dependency Node CLIs: fal.mjs, elevenlabs.mjs, codex-image.mjs, media.mjs, assets.mjs, doctor.mjs
.claude/skills/   how to do recurring jobs here (brand, slides, generation, audio, media)
projects/
  ai-trends/      the web-native deck (Vite + React + GSAP)
  silence-the-hate/  pflag canada campaign: planning docs + educational microsite (own CLAUDE.md; launch 17 May 2027)
```

## Setup and everyday commands

Node lives in `~/.local/node` (user install, no admin). If `node` isn't found, `export PATH="$HOME/.local/node/bin:$PATH"`.

```bash
npm install                 # once
npm run doctor              # what's configured (never prints secrets)
npm run dev                 # deck at http://localhost:5180
npm run build               # typecheck + production build of the deck
```

Keys go in the repo-root `.env` (template: `.env.example`): `FAL_KEY`, `ELEVENLABS_API_KEY`, `ANTHROPIC_API_KEY`. **Never read, print, or edit `.env` values.** Check presence with `npm run doctor`. Codex image generation uses the user's ChatGPT sign-in (`codex login`), not a key.

## Generative tools (all write a `<file>.prompt.json` provenance sidecar)

| Job | Command | Notes |
|---|---|---|
| Image (**default**) | `npm run codex-image -- "prompt" --out path.png [--ref style.png]` | Uses the ChatGPT plan, no per-image cost. Needs `codex login` once |
| Image via fal (**only with the user's OK**: limited budget) | `npm run fal -- image "prompt" --out path.png --model nano-banana-2` | |
| Image edit / variations from a reference | `npm run fal -- edit "prompt" --image ref.png --out out.png` | |
| Video | `npm run fal -- video "prompt" --image start.png --out clip.mp4` | Costs real money (dollars per clip). **Ask before generating video.** |
| Sound effect | `npm run eleven -- sfx "description" --duration 1.5 --out sfx/x.mp3` | |
| Music bed | `npm run eleven -- music "prompt" --length 30 --out music/bed.mp3` | |
| Voiceover | `npm run eleven -- tts "line" --out vo/x.mp3 [--voice id]` | `npm run eleven -- voices` |
| Audio clean-up | `npm run eleven -- clean noisy.wav --out clean.mp3` | Voice Isolator |
| Transcribe | `npm run eleven -- stt file.m4a --out transcript.json` | |
| Web video | `npm run media -- web in.mov --out clips/x.mp4` | H.264 + faststart |
| GIF → MP4, loops, posters | `npm run media -- gif|loop|poster …` | ffmpeg bundled via ffmpeg-static |
| Shrink generated images | `npm run media -- optimize projects/ai-trends/src/assets/generated` | PNG → WebP, originals to `assets.raw/` |

Planned assets are **prompts in code**: `projects/<p>/assets.d/*.json` (one file per section). `npm run assets -- ai-trends` lists them, `--make` generates the missing ones (`--file <name>`, `--only <id>`, `--parallel 4`). Run `media optimize` afterwards. Budget: **default to `codex-image`**. fal costs real money on a limited budget: never use it without the user's OK.

## AI Trends deck: how it works

- `src/deck.ts` is the running order. One slide = one file in `src/slides/` that default-exports `defineSlide({ id, section, title, steps, notes, theme, chrome, transition, Component })`.
- Every slide is authored on a fixed **1920×1080** canvas, scaled to fit (`engine/Stage.tsx`).
- **Beats**: `steps` = number of clicks after the slide arrives. Inside the component, `useBeats(rootRef, step, (tl) => { … tl.addLabel('b1'); … })` builds one paused GSAP timeline cut by labels `b1`, `b2`…; forward plays to the next label, back rewinds. Build animations on `tl`; loops (blinking, drifting) as separate tweens.
- Slides get `mode: 'live' | 'preview'`. Preview = presenter view and overview thumbnails: no audio, mic, or network side effects.
- Shared pieces in `src/components/`: `Statement` (headline + lede + media), `SectionDivider`, `ClipFrame` (video slot with designed placeholder when the file is missing), `AgentCursor`, `HandLine` (the human mark), `GenImage`/`GenTile` (generated image or procedural stand-in), `ZakMark`. `SplatView` renders real 3D scenes (Gaussian splats, World Labs' Spark) from `public/media/splats/`; the 4DV and photo-world slides use World Labs sample scenes, credited on the slide. Pick scenes and camera framing in the dev-only `/splat-lab.html`. Helpers in `src/lib/motion.ts`: `revealLines`, `revealWords`, `typeInto`, `countUp`, `drawOn`, `rng`. `src/lib/sfx.ts`: `useSfx`.
- Generated images live in `src/assets/generated/<id>.webp` and are found by id (`generatedUrl('campaign-3')`, `generatedSet('frag-')`). Clips live in `public/media/clips/` (gitignored, shared via OneDrive). Source-deck media (converted) is in `public/media/source/`.
- Live demo endpoints (`server/api.ts`, run inside Vite): `/api/status`, `/api/scribe-token` (ElevenLabs realtime transcription), `/api/brief` (Claude structured brief). Every live demo needs an offline fallback.
- Keys while presenting: arrows/space/PageUp/PageDown, Shift+arrow skips beats, number+Enter jumps, `O` overview, `P` presenter window (notes, timer, next beat; synced over BroadcastChannel), `F` fullscreen, `B` black, `M` mute SFX, `?` help.
- Dev aid: `window.__beats` is the latest slide timeline. In a hidden browser pane animations are throttled, so verify frames by scrubbing: `__beats.pause().seek(2.4, false)` (pass `false` so typing and counters, which update in onUpdate, render).

## The story and the rules (read before designing anything)

Three beats, said at the top, echoed in section 2, closed in section 6: **It talked** (chat partner, we learned to prompt) → **It made** (generator, we learned to make with it) → **It does** (coworker, we're learning to hand off the work). Underneath: *creativity that means something still starts with a person. The idea, the taste and the reason to make something stay human.*

Motion language:
- **One motion idea per slide.** Every animation explains the point of the slide; nothing decorative for its own sake.
- **Machine moments** are charcoal with signal green (`--zak-signal`) for cursors, live states and agent activity, mono type (JetBrains Mono) for anything the machine says.
- **Human moments** go quiet: paper ground (`theme: 'paper'`), no particles, no UI, and the hand-drawn `HandLine`. It appears on 1B and returns at the close. Don't use it elsewhere.
- Display type is Oswald Light caps; statements are Schibsted Grotesk 500, sentence case; labels are mono caps.
- Copy is approved: use the outline's words exactly. Sections 3–5 copy belongs to Kyle and Hiep; keep it as in the source deck.

See `brand/BRAND.md` for the brand system and `.claude/skills/` for step-by-step how-tos.
