# Zulu brand repo

Brand system, generative tools and Claude skills for Zulu Alpha Kilo, plus the projects built with them.
First project: **AI Trends**, the Zulu AI Working Group's December 2026 talk, as a web-native animated deck.

## Run the deck

```bash
npm install
npm run dev        # http://localhost:5180
```

Present: open the deck full screen (`F`), press `P` for the presenter window (notes, timer, next beat) and put that on your laptop. Clickers work (PageUp/PageDown). `O` shows every slide, `B` blacks out, `M` mutes sound effects, `?` lists all keys.

## Make things

Add your keys to `.env` (copy `.env.example`), then `npm run doctor` to check.

```bash
npm run fal -- image "editorial photo of …, no text" --out projects/ai-trends/src/assets/generated/x.png
npm run eleven -- sfx "soft glassy UI tick" --duration 0.8 --out projects/ai-trends/public/media/sfx/tick.mp3
npm run eleven -- music "warm minimal piano, 90 bpm" --length 30 --out projects/ai-trends/public/media/music/bed.mp3
npm run eleven -- clean noisy.wav --out clean.mp3
npm run codex-image -- "…" --out x.png        # uses your ChatGPT plan (run `codex login` once)
npm run media -- web recording.mov --out projects/ai-trends/public/media/clips/name.mp4
npm run assets -- ai-trends                   # every planned asset and its prompt; --make generates
```

## Working with Claude here

`CLAUDE.md` explains the repo, the story and the motion rules. `.claude/skills/` holds the how-tos (brand, building a slide, generating images, audio, media prep). Ask for what you want ("add a slide after 1B that…", "make a whoosh for the divider") and Claude follows them.

## Where things live

| Path | What |
|---|---|
| `brand/` | tokens.css (colours, type, motion), BRAND.md, logos |
| `tools/` | the CLI scripts behind the npm commands |
| `projects/ai-trends/src/slides/` | one file per slide; running order in `src/deck.ts` |
| `projects/ai-trends/docs/` | approved outline and the source deck's text |
| `projects/ai-trends/assets.d/` | prompts for every generated asset |
| `projects/ai-trends/public/media/clips/` | demo footage (not in git; share via OneDrive) |
