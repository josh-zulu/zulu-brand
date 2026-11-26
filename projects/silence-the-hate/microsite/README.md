# Silence The Hate microsite (not started)

Where people learn about the initiative and download the plugin. Build starts after the content outline is agreed (December); design in February, build in March, soft launch 10 May, launch 17 May 2027.

## Sections (draft)

1. **Hero**: Silence The Hate, the equalizer mark, one line on what it does, download buttons (Mac / Windows).
2. **Why**: the pitch story. Music unites; it can also divide; these songs still earn money.
3. **How it works**: install, listen, learn.
4. **Privacy promise**: in plain words. Nothing about what you listen to leaves your computer.
5. **Flagged songs explorer**: search a song, see whether it's flagged, the flagged line (excerpt only), and why. Never calls an artist names.
6. **Learn**: "words matter" articles and pflag canada resources.
7. **Impact**: live count of skips and donations (once the partner is confirmed).
8. **Playlist unlock**: the inclusive playlist for people who install.
9. **FAQ** and **press kit**.
10. **Suggest a song** form (goes to review, never straight to a flag).

## Requirements

- English and French, switchable, same content.
- WCAG 2.1 AA, reduced motion respected.
- Static and fast on a CDN; the counter and explorer read from the content API with an offline fallback.
- Campaign look from the pitch (see `../CLAUDE.md`, Brand), not the Zulu system.

Stack to decide with the build (likely Vite + React to match the repo, or a static site generator).
