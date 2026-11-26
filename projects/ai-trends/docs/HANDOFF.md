# AI Trends: handoff

Everything a new Claude Code session (or person) needs to pick this project up. Read with the repo-root `CLAUDE.md`, which covers how the repo, tools and deck work. This file covers where the project stands and what's open. Last updated 26 Nov 2026.

## What it is
The Zulu AI Working Group's December 2026 company talk, built as a web-native animated deck (Vite + React + GSAP) inside the Zulu brand repo. Presenters: Josh Maldonado (Director of Digital & Innovation), Kyle Collins, Hiep Vu.

## Where things live
| Thing | Where |
|---|---|
| Repo | https://github.com/wearezulubot/ai-trends (private, Zulubot org; moved from `josh-zulu/zulu-brand` on 26 Nov 2026). Org members get write access; Josh and Kyle are org admins. |
| Live preview | None while the repo is private: the org's free plan has no Pages for private repos. Run `npm run dev`. The `pages.yml` deploy workflow will fail on merges until it's disabled or the org upgrades. |
| Running order | `projects/ai-trends/src/order.json`, edited in the slides panel (`\` key: drag, Hide, Push to main). Every slide is listed in `src/deck.ts` (one file per slide in `src/slides/`) |
| Approved outline | `projects/ai-trends/docs/outline.md` (marked where Josh changed it) |
| Source deck text | `projects/ai-trends/docs/source-deck.md` |
| Presenter assignments | `projects/ai-trends/public/presenters.json` (slides panel: tap a name or press J, K, H; Push to main shares it) |
| Build status page (for Josh) | `projects/ai-trends/docs/build-status.html`. Was published as a claude.ai artifact from Josh's personal account; republish it from the work account to keep a live link. |

## Accounts, keys and tools on this Mac
- **GitHub CLI** (`~/.local/bin/gh`) is signed in as `josh-zulu`, with `repo` and `workflow` scopes. Git commits use `josh-zulu`'s no-reply address.
- **Node 22** lives in `~/.local/node`, and both are on PATH via `~/.zshrc`.
- **`.env`** (repo root, gitignored; never read or print it) holds `FAL_KEY` and `ELEVENLABS_API_KEY`. `ANTHROPIC_API_KEY` is still empty. If the keys are personal, swap in Zulu's own.
- **Codex CLI** is installed but not signed in. `codex login` with a ChatGPT account makes Codex the image generator.
- **Image generation defaults to Codex.** Fal costs money on a limited budget: only use it with Josh's OK.

## How we work
- Push straight to `main` after `npm run build` passes; the **Check** workflow (typecheck + build) runs on every push. Pull requests only for big or risky changes. See "Working together" in `CLAUDE.md`.
- Each slide is its own file; conflict hotspots are `deck.ts`, `presenters.json` and shared components.
- When work is split across helper agents, keep one live status page updated for Josh. No need to ask before splitting.

## Deck structure (46 slides, five sections)
Intro (opener, Digital team, agenda) → **1 The year AI started working** (setup, generative media, agentic context, how we work with it: goal + dictation) → **2 It works where we work** (connectors tee-up; 01 Design · Figma, 02 3D · Blender, 03 Edit assembly · Resolve, 04 Production · Asana + NetSuite, 05 Office · Google Workspace; sameness; taste) → **3 Work we made** (AGO steps, Make-A-Wish steps) → **4 What's next, ranked** (brand agents, blockout to film, hardware, worlds from a photo, 4DV, real-time) → **5** close (built with AI, the close, questions, Bring us the hard digital problems).

## Open items
_26 Nov 2026: Josh cut "New ways to make things". Its divider and the End cards slide are deleted, Blockout to film moved to What's next, and the sections renumbered 01–05._

1. **Copy approval.** All new copy written during the restructure needs Josh's sign-off:
   - section 1: generative media, agentic, "We brief it"
   - section 2: connectors tee-up, Blender's new headline
   - section 4 (What's next): ranked, brand agents, hardware
   - earlier: the Alder ad line on the taste slide, the sameness slogans, the team slide lines
2. **Workspace in the connectors index.** Done: "05 · Office · Google Workspace" is the fifth socket on `s2-connectors` (five clicks now), and the Workspace slide header matches. Josh approved its copy ("Office", "building docs, sheets and decks") on 26 Nov 2026.
3. **Missing clips** (they show "clip to add"): the Blender, Figma, Asana, NetSuite and Resolve recordings, `workspace-docs-sheets-slides.mp4`, `blockout.mp4`, `final-film.mp4`, `photo-to-world-marble.mp4`, `genie-world-live.mp4`, and the two hardware clips. They go in `projects/ai-trends/public/media/clips/` (gitignored: share via OneDrive, or commit web-encoded versions).
4. **Real GPT Image 2 examples.** The generative-media slide's GPT Image 2 and Seedance cards currently show Nano Banana images (captioned). Fix with `codex login` and `npm run codex-image`.
5. **Live dictation on the shared link.** It only works on the presenting laptop (needs the dev server). For a shared live demo: Vercel functions plus a passcode. Optional: make the offline fallback always show the polished Northline brief.
6. **Hiep's photo** is 313 px (from LinkedIn). Ask him for a larger black-and-white headshot: `src/assets/team/hiep.jpg`.
7. **World Labs sample scenes** (forge, painted bedroom) are credited on the slides. Their reuse terms aren't stated, so check before any public use beyond the internal talk.
8. **Repo co-ownership.** Done: moved to `wearezulubot/ai-trends` (private). To get the hosted preview and branch protection back, the org needs GitHub Team, or the repo goes public again.
9. **Rehearse on the presenting laptop:** allow the microphone for slide 8, check sound levels (`M` mutes), and watch every slide at full speed once.
