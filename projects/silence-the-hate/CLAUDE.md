# Silence The Hate (pflag canada × Zulu Alpha Kilo)

Read this before doing anything in this folder. It is the working context for the agent that helps Josh plan this project and build its educational microsite.

## What it is

A desktop plugin that **skips homophobic and transphobic songs** while people listen, and turns every skip into a moment of education: users can see which lines were flagged, why the words hurt, and follow links to pflag canada resources. People get it from a **microsite** that explains the initiative.

- **Client / partner:** pflag canada ("family for all"). They provide the **flagging guidelines** (the rubric for what gets flagged and why).
- **Launch:** **Monday 17 May 2027**, International Day Against Homophobia, Biphobia and Transphobia (IDAHOBIT). Prototype well before that.
- **Impact ideas from the pitch:** corporate partners match each skipped stream with a donation; earned media; users who install unlock an exclusive playlist of inclusive music.
- **Pitch deck:** `source/ZAK-x-PFLAG-V2.pptx` (local only, gitignored, 57 MB). Text and frames: `source/pitch.md`, `source/frames/`.

## People

- **Josh Maldonado**: lead on planning, IT liaison, microsite.
- **Kyle Collins**: building the app and the review back end. His stack spec is `docs/desktop-app-spec.md` (Tauri 2 + Rust macOS menu bar app; Cloudflare Workers + D1 review dashboard and public `blocklist.json`; exact title + artist matching in Apple's spelling). Don't redesign his app here; raise questions for him in `docs/open-questions.md`.
- **pflag canada**: guidelines, human review of flags, education content, resources, corporate partners.
- **ZAK IT**: reviewing security, hosting, signing and data concerns (`docs/it-review.md`).

## Folder map

```
CLAUDE.md               this file
source/                 the pitch: pitch.md (deck text), frames/ (key slides), the .pptx (local only)
docs/
  one-pager.md          front end, back end, lyrics system, legal to investigate
  lyrics-system.md      how songs get scanned and flagged (the biggest unknown)
  schedule.md           prototype-first plan to 17 May 2027, with gates
  it-review.md          brief for the ZAK IT conversation
  costs.md              line items: agency investment vs ask vs pass-through
  open-questions.md     questions by owner (pflag, Kyle, IT, legal)
  decisions.md          dated decision log
  desktop-app-spec.md   Kyle's app stack spec (25 Nov)
microsite/              the educational microsite (not started; see microsite/README.md)
```

**Shared plan (Claude Doc):** https://claude.ai/artifact/QNfthY7FFaZgzDcc6sTmQq ("Silence The Hate: one-pager and plan"). It summarises `docs/`; when a decision changes the plan, update both.

## Rules for working here

- **Keep the docs current.** When a decision lands, add a dated line to `docs/decisions.md` and update the doc it changes. Questions get an owner in `docs/open-questions.md`.
- **Privacy is a design rule, not a feature.** What someone listens to, and what they choose to skip, can reveal their sexual orientation or gender identity. Default to matching on the device, no accounts, and only anonymous, aggregate counts leaving the machine. Flag anything that would change this.
- **Never let a machine publish a flag.** Automated scanning proposes; a pflag-appointed human approves every flag that ships. Every flag records the rubric version, reviewer and date.
- **Flag lyrics, not people.** Copy says a song's lines were flagged under pflag canada's guidelines. It never calls an artist homophobic or transphobic.
- **Reclaimed language is not hate.** Queer artists using reclaimed words must not be flagged by default. The rubric and the classifier prompt must handle this explicitly.
- **Lyrics are licensed content.** Don't store or display full lyrics without a licence that covers it. Use short excerpts (the flagged line) only, with attribution, until legal confirms more.
- **Costs:** follow the repo budget rules (images default to `codex-image`; fal and video only with Josh's OK). Any paid API trial (lyrics providers) needs Josh's OK first.

## Brand

This is a **pflag canada campaign**, not a Zulu-branded piece. The microsite and app follow the campaign look from the pitch, not `brand/tokens.css`:
- Black ground, bold white grotesk headline ("Silence / The Hate"), the **rainbow equalizer bars** as the mark, iridescent glass prisms as texture (`source/frames/04-look-prisms.jpg`), the pflag canada logo lock-up.
- Warm, plain, direct voice. Educational, never preachy or shaming of listeners.
- Bilingual (English and French) from the start.
- Accessible: WCAG 2.1 AA minimum.

Internal planning pages for ZAK (status, schedule, IT brief) can use the Zulu brand system in `brand/`.

## Copy

Use the pitch's lines where they exist (see `source/pitch.md`). New public copy is a draft until pflag approves it; mark it as such.
