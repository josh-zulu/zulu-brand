# Decision log

Newest first. One line per decision: date, decision, who, link to detail.

- **2026-11-26** Build direction: the app sits beside the music player on the listener's computer, using no music platform API (Spotify, Apple, YouTube). Desktop only for v1; iPhone not possible, Android after launch at the earliest. (Josh)
- **2026-11-25** Kyle's stack adopted as the base: Tauri 2 + Rust macOS menu bar app; Cloudflare Workers + D1 for the review dashboard and public block list; exact title + artist matching in Apple's spelling, no ISRC. (Kyle, `desktop-app-spec.md`)
- **2026-11-25** Project set up in `projects/silence-the-hate/`. Launch fixed at Mon 17 May 2027 (IDAHOBIT). Proposed (not yet agreed): on-device matching, no accounts, human approval for every flag, OS-level playback control rather than Spotify's Web API. (Josh)
