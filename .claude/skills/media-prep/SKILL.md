---
name: media-prep
description: Prepare screen recordings, demo clips, GIFs and stills for the web deck: encode, trim, loop, poster frames, compress. Use when someone hands over footage or a slide needs a clip.
---

# Media prep

ffmpeg is bundled (ffmpeg-static), so there's nothing to install.

- Probe: `npm run media -- probe in.mov`
- Web encode (any source → H.264 MP4, faststart): `npm run media -- web in.mov --out projects/ai-trends/public/media/clips/blender-connector.mp4 [--width 1920] [--mute]`
- Background loop (muted, lighter): `npm run media -- loop in.mp4 --start 4 --duration 8 --out …/clips/agent-loop.mp4`
- GIF → MP4 (10× smaller): `npm run media -- gif in.gif --out …/x.mp4`
- Poster frame: `npm run media -- poster clip.mp4 --at 2 --out clip.jpg`
- Generated stills → WebP: `npm run media -- optimize <dir>`

Where files go:
- Clips named in the outline go in `projects/ai-trends/public/media/clips/` with the exact filename the slide expects (e.g. `blender-connector.mp4`, `figma-agent-builds-on-canvas.mp4`, `asana-ai-teammates-at-work.mp4`, `netsuite-top-customers-dashboard.mp4`, `resolve-ai-assistant.mp4`). Clips are gitignored: share through OneDrive.
- Source-deck media already converted: `projects/ai-trends/public/media/source/`.

Screen recordings: record at 1920×1080 or larger, hide notifications and bookmarks, use a clean browser profile, and speed up dead time (`setpts=0.5*PTS`) rather than cutting mid-action.
