# Silence the Hate: App Stack

Nov 25, 2026 · @Kyle Collins

## Overview

The app is two pieces: a macOS menu bar app that skips blocked songs, and a Cloudflare backend where reviewers manage the block list. Both are still prototypes in `prototypes/`.

| Piece | Stack | Where it runs |
| --- | --- | --- |
| Menu bar app | Tauri 2, Rust, plain HTML panel | The listener's Mac |
| Review dashboard | Cloudflare Worker, vanilla JS, server-rendered HTML | `sth-review.zulubot.workers.dev`, behind Cloudflare Access |
| Block list feed | Cloudflare Worker, vanilla JS | `sth-blocklist.zulubot.workers.dev/blocklist.json`, public |
| Database | Cloudflare D1 (SQLite), one database `sth-review` | Shared by both Workers |

&#91;embedded content: how the pieces connect · 7 parts\]

Reviewers change songs in the dashboard. The menu bar app downloads only the blocked list and skips matches on the Mac.

## Desktop app

A Tauri 2 menu bar app written in Rust, chosen over the earlier Python prototype because it skips in about 22 ms instead of about 150 ms. It is 10 MB on disk, a 2.9 MB download, and idles at 11 MB of memory.

- **Detect:** listens for the players' own track-change notices (`com.spotify.client.PlaybackStateChanged`, `com.apple.Music.playerInfo`) through macOS distributed notifications. No polling.
- **Decide:** compares title plus artist against the downloaded block list, ignoring repeat notices and paused tracks.
- **Skip:** sends the player a "next track" Apple Event, run in-process with `NSAppleScript`.
- **Permission:** macOS asks once per player ("Silence The Hate wants access to control Spotify"). The app checks it with `AEDeterminePermissionToAutomateTarget`.
- **Block list:** downloaded on startup and every 15 minutes with `ureq`.
- **UI:** a tray icon and a small plain HTML panel (`src/index.html`), no framework.
- **Logs:** `~/Library/Logs/com.silencethehate.spike/events.tsv`.

Key crates: `tauri`, `objc2` + `objc2-foundation` (macOS APIs), `ureq`, `serde_json`, `tauri-plugin-notification`.

Open gaps: Apple Music skip is untested, Apple Music sends no artist for local files, only ad-hoc signing so far (no notarisation), no Windows.

## Block list and backend

Two Cloudflare Workers share one D1 database. They are split because Cloudflare Access on a workers.dev Worker covers every path, and the feed must stay public.

| Worker | Job | Access |
| --- | --- | --- |
| `sth-review` | Review dashboard: list songs, block or unblock, undo, add songs | Cloudflare Access, one-time code by email. Reviewers are managed in Zero Trust |
| `sth-blocklist` | Serves `blocklist.json`: title and artist of every blocked song | Public, cached 60 seconds |

- **Code:** vanilla JS ES modules, no framework. Pages are server-rendered HTML strings (`src/pages.js`, `src/html.js`).
- **Database:** D1 tables `songs` (status `review` or `blocked`) and `changes` (who changed what, when). Any one reviewer can block or unblock.
- **Add songs:** the dashboard searches Apple's free iTunes Search API (no key) and saves the song with Apple's exact title and artist.
- **Seed:** 60 songs from `seed/songs.csv`, already loaded into the live database.
- **Tests:** `node --test`, no test framework.
- **Tooling:** `wrangler` 4 is the only dependency.

A block or unblock reaches a running app within 15 minutes, or on restart.

## Song matching

The app matches on exact title plus artist, ignoring case and outer spaces. It is strict on purpose: skipping the wrong song is worse than missing one. Full reasoning: `docs/song-matching-and-search.md`.

- **Why title plus artist:** it is the only thing every player reports. No player gives the app an ISRC, so none is stored.
- **Why Apple titles:** platforms share distributor metadata, so Apple's title matches what Spotify and Music show.
- **Missed versions** (clean edits, live, remixes) are added by a reviewer as their own entries.

Open items:

- Some seeded songs use article spellings ("Korn feat. Fred Durst") that players never show. They need re-adding through Add songs.
- Curly apostrophes and "(feat. ...)" are not folded yet.
- Song length is stored but not used. It would separate two same-titled songs by one artist.
- iTunes Search API is rate limited to about 20 calls a minute, and its terms are written for store promotion. If Apple objects, swap the search source; the app does not change.

## Privacy

The app sends nothing about the listener. Its only network call is a plain download of the public block list.

- **No accounts** for listeners, and no sign-in to Spotify or Apple.
- **Matching happens on the Mac.** What someone plays never leaves the machine.
- **Logs stay local** in `~/Library/Logs`. The prototype's `payloads.log` records listening history for debugging, so it must be off or removed before release.
- **Reviewers are the only people the backend knows.** Their email is stored against each block or unblock in the `changes` table.

## Repo layout and tooling

| Folder | What it is | Run it |
| --- | --- | --- |
| `prototypes/tauri-menubar` | The menu bar app | `npm install`, then `npm run tauri build`. Needs Rust (`brew install rust`) |
| `prototypes/review-dashboard` | Both Workers, schema, seed, tests | `npm run db:local`, then `npm run dev` on `localhost:8787`. Tests: `npm test` |
| `prototypes/macos-detect` | First Python prototype, replaced by Tauri | Reference only |
| `docs/` | Feasibility, findings, matching decisions, specs and plans | n/a |

- Deploy both Workers with `npx wrangler deploy` and `npx wrangler deploy -c feed.wrangler.jsonc`, signed in to the Zulubot Cloudflare account.
- Test the permission prompt from the built `.app`, not `tauri dev`: macOS credits Terminal otherwise.
