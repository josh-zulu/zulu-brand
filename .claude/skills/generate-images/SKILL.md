---
name: generate-images
description: Generate or edit images (and, with approval, video) for Zulu projects using fal.ai or the Codex CLI, tracked in asset manifests. Use whenever a slide or page needs imagery, textures, variations or a generated clip.
---

# Generating imagery

1. **Write the prompt into the project's manifest**, not just the shell: `projects/<p>/assets.d/<section>.json`
   ```json
   { "assets": [ { "id": "endcard-1", "slide": "s2-endcards", "tool": "fal", "model": "nano-banana-2",
       "aspect": "16:9", "out": "src/assets/generated/endcard-1.png", "prompt": "…" } ] }
   ```
   Tools: `codex-image` (**default**: ChatGPT plan, `refs` for style), `fal` (**only with the user's OK**, limited budget; modes `image` default, `edit` with `refs`, `video`), `eleven` (audio).
2. Generate missing ones: `npm run assets -- ai-trends --make --file <section> --parallel 4`.
3. Shrink: `npm run media -- optimize projects/ai-trends/src/assets/generated` (PNG → WebP, originals archived in `assets.raw/`).
4. Look at what you made (build a contact sheet with ffmpeg `tile=` if there are many) and regenerate weak ones with `--only <id> --force`.
5. Use in slides by id: `<GenImage id="endcard-1" />`, `generatedUrl(id)`, `generatedSet('endcard-')`.

Models (aliases in `tools/fal.mjs`): `nano-banana-2` (fast, cheap, default), `nano-banana-pro` (hero quality), `*-edit` (image + prompt → image, good for consistent variations), `veo3.1-i2v` / `kling3-i2v` (video: **ask the user first**, it costs dollars per clip).

Prompting: say the medium (photograph, risograph, 3D render), subject, light, palette, composition, and end with "no text, no logos". For sets that must feel related (end cards, before/after), generate one, then use `edit` with it as a reference. For deliberately samey sets (the "sea of sameness"), reuse one prompt and vary only small details.

Budget: default to `codex-image`. Never spend fal credits without the user's OK. Every output gets a `.prompt.json` sidecar, which the reveal slide (6A) uses as receipts, so never delete sidecars.
