# Silence The Hate microsite

Where people learn about the initiative and download the plugin. Bilingual (EN/FR), WCAG 2.1 AA, launch **17 May 2027**.

**Status (26 Nov 2026): first build.** The full scroll story and the education pieces run locally. All new copy is a **draft** and all songs and lines are **samples** until pflag canada approves them; the page marks both.

## Run it

```bash
npm install                     # once, from the repo root
npm run sth:dev                 # http://localhost:5193
npm run sth:build               # typecheck + production build into dist/
```

`?lang=fr` opens the French version. `?motion=reduce` previews the reduced-motion layout (the same as the system setting or the nav's pause button); `?motion=full` turns it back on.

## The scroll story

The rainbow equalizer from the pitch is the whole motion language: bars playing = music, bars flat = silence (a skip), bars rising again = the good music back. One motion idea per section, written at the top of each section file.

| Section | File | Motion idea | Copy |
|---|---|---|---|
| Hero | `sections/Hero.tsx` | Bars play, then scrolling flattens them into silence while the promise appears | Pitch |
| Why | `sections/Why.tsx` | The four pitch lines over one equalizer: together, split and drained of colour, a playlist with flagged rows, plays that keep climbing | Pitch (counter is illustrative) |
| **Try it** (interactive) | `sections/TryIt.tsx` | Mock player with the pitch's ON switch. Flagged songs are skipped instantly; only the evidence moves. Off = the song plays and the player says so | Pitch + draft; sample songs |
| How it works | `sections/How.tsx` | A white beam through a prism splits into install / listen / educate | Pitch |
| **Words matter** (interactive) | `sections/WordsMatter.tsx` | The pitch's flagged-lines pager: the line is muted by a coral bar, then the explanation and a real pflag resource card | Pitch + draft; sample lines |
| **Context matters** (interactive) | `sections/Learn.tsx` | Reclaimed vs hateful: the word stays still, the context and verdict change | Draft |
| Who decides | `sections/Learn.tsx` | A line travels machine → pflag reviewer → flag, and stops at the person | Draft |
| **The letters** (interactive) | `sections/Learn.tsx` | 2SLGBTQIA+ as tabs; the chosen letter jumps like a bar | Draft definitions |
| Privacy | `sections/Privacy.tsx` | pflag's rings as the edge of your computer; your listening drifts to the edge and comes back | Draft |
| Impact | `sections/Impact.tsx` | Each card's bars start silent and rise; donation counter and playlist wait for partners | Pitch + placeholders |
| Close + FAQ | `sections/Close.tsx` | The closing line lights word by word; the bars come back in full colour | Pitch + draft FAQ |

## Rules this build follows

- **No real songs, artists or lyrics.** Sample lines describe the *kind* of lyric that gets flagged. Real flags need pflag's guidelines, a reviewer's approval and a lyrics licence (see `../CLAUDE.md`).
- **Flag lines, not people.** No copy calls an artist anything.
- **Resource links are real** pflagcanada.ca articles (checked 26 Nov 2026).
- **Strings live in `src/i18n/en.ts` and `fr.ts`.** Each English line is tagged PITCH, DRAFT or SAMPLE. TypeScript makes French match English's shape. The French is a draft translation for review.
- **Motion:** scroll choreography only runs under `MOTION_OK` (`src/lib/motion.ts`). With reduced motion (system setting or the nav's pause button, which also satisfies WCAG 2.2.2) everything shows in a still, readable layout.
- **Brand:** campaign look from the pitch (black ground, Schibsted Grotesk heavy, rainbow equalizer, CSS glass prisms) plus pflag canada's coral `#FF4A50`, purple `#5A2B81` and rings. Colour tokens and contrast notes are in `src/styles/base.css`.
- **Logo:** `public/pflag-canada-logo.png` is from the pitch deck; the wordmark is turned white with a CSS mask. Swap in pflag's official reversed lock-up when we have it.

## Open before launch

- pflag approval of all DRAFT copy, guideline names and letter definitions; professional French translation.
- Real download links (Mac build, notarised), Windows decision.
- Flagged-songs explorer and suggest-a-song form (need Kyle's feed with education fields).
- Live skip/donation counter once the partner and the opt-in counter are designed.
- Hosting, analytics (privacy-first or none), favicon/social images, French campaign name.
