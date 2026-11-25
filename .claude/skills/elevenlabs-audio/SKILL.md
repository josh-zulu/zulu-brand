---
name: elevenlabs-audio
description: Make or fix audio with ElevenLabs: sound effects, music beds, voiceover, voice clean-up and transcription. Use for any deck SFX, demo audio, music or a noisy recording.
---

# Audio with ElevenLabs

Commands (key from `.env`, never print it):
- SFX: `npm run eleven -- sfx "soft glassy UI tick, short, dry" --duration 0.8 --out projects/ai-trends/public/media/sfx/tick.mp3`
- Music: `npm run eleven -- music "minimal warm piano and soft pulse, hopeful, 90 bpm, no vocals" --length 45 --out …/music/bed.mp3`
- Voiceover: `npm run eleven -- voices` to pick, then `npm run eleven -- tts "line" --voice <id> --out …/vo/line.mp3`
- Clean-up: `npm run eleven -- clean raw.wav --out clean.mp3` (Voice Isolator: removes room noise, music and hum from speech; also accepts video files)
- Transcribe: `npm run eleven -- stt recording.m4a --out transcript.json`

Prompting SFX: describe material, size, length, character and space ("close-miked, dry, no reverb"). Generate 2–3 variants with different wording and pick by ear. Keep deck SFX subtle and short: they punctuate motion, they don't narrate it.

In slides: put files in `projects/ai-trends/public/media/sfx/<name>.mp3` and play with `const sfx = useSfx(['name'], mode === 'live'); sfx.play('name')` (only when `direction > 0`). `M` mutes all SFX during a talk.

Planned audio belongs in the manifest too (`"tool": "eleven", "mode": "sfx" | "music"`, `"duration"` or `"length"`).

Live dictation (slide 7) uses ElevenLabs realtime transcription: the browser gets a single-use token from `/api/scribe-token` and streams the mic with `@elevenlabs/client` (`model scribe_v2_realtime`).
