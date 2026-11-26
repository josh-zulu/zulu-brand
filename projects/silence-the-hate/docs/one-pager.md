# Silence The Hate: what we're building (one-pager)

**Draft, 26 Nov 2026.** pflag canada × Zulu Alpha Kilo. Launch Monday 17 May 2027 (IDAHOBIT). Shared version: https://claude.ai/artifact/QNfthY7FFaZgzDcc6sTmQq

A desktop plugin that skips homophobic and transphobic songs as they start, and lets people see which lines were flagged, why they hurt, and where to learn more from pflag canada. People find it on a bilingual microsite.

## How we're building it

Silence The Hate sits **beside** the music app, not inside it. It runs on the listener's computer, listens for the player's own "track changed" notice, checks the song against the block list on the machine, and presses "next" if it matches. No music service has to approve it, nobody signs in to Spotify or Apple, and nothing about what someone plays leaves their computer. Kyle's macOS prototype already works this way and skips in about 22 ms (`desktop-app-spec.md`).

### What we can't build on

- **Spotify's API:** new apps capped at 5 users (Feb 2026); public access only for businesses with 250,000+ monthly users; developer policy restricts apps that control playback.
- **Apple Music's MusicKit:** built for apps that play Apple Music themselves, not for watching and skipping inside the Music app on a Mac.
- **YouTube Music, Amazon Music, Tidal and the rest:** no public API for controlling their players.
- **Any platform deal:** a campaign that says platforms "profit from hate" can't depend on their goodwill.

### Why not mobile

- **iPhone: not possible.** iOS doesn't let one app see or control what another app plays. The only player an app can reach is Apple's own Music app, and iOS suspends apps in the background, so ours couldn't be there when the next song starts.
- **Android: possible later, not for launch.** "Notification access" lets an app read and skip media, but users must switch it on in system settings, it can read every notification on the phone (a hard ask for a privacy-first campaign), and it's a second app to build and support.

Tell pflag early: most listening happens on phones, and v1 is desktop only.

### Recommendation

1. **Launch on desktop:** Kyle's macOS menu bar app for the Spotify and Apple Music apps, plus Windows through its built-in media controls (to scope with Kyle).
2. **v1.1:** browser extension for web players.
3. **After launch:** Android if v1 lands. iPhone stays out of reach.
4. **Legal check:** pressing "next" from outside uses no API and touches no music, but each service's user terms are broad.

## Front end

| Piece | Status | What it does / what's left |
|---|---|---|
| **Menu bar app** (Tauri 2, Rust) | Prototype, macOS | Distributed notifications from Spotify / Music, exact title + artist match, "next track" Apple Event (~22 ms). 2.9 MB download, 11 MB memory. One permission prompt per player. **Left:** Apple Music skip test, notarisation, Windows, settings (on/off, "play it anyway"), auto-update, French, remove `payloads.log`. |
| **Education view** | Not started | Flagged line only, "words matter" explanation, pflag resource card, local skip history. Needs more in the block list than title + artist. |
| **Browser extension** | v1.1 | Web players. |
| **Microsite** | Not started | See `../microsite/README.md`. Bilingual, WCAG 2.1 AA. |
| **Review dashboard** | Prototype, live | Cloudflare Access (email one-time code). List, block, unblock, undo, add via iTunes Search. **Left:** flagged lines, guideline, severity, explanation; second reviewer for severe cases (today any one reviewer can block); queue fed by the lyrics scan. |

## Back end

Two Cloudflare Workers sharing one D1 database, on the Zulubot Cloudflare account. No listener accounts; reviewers are the only people the back end knows.

| Piece | Status | What it does / what's left |
|---|---|---|
| **D1 `sth-review`** | Prototype, 60 seed songs | `songs` (review / blocked), `changes` (who, what, when). **Left:** flagged lines, guideline, severity, explanation, rubric version. |
| **Feed `sth-blocklist`** | Prototype, public | `blocklist.json` (title + artist), cached 60 s; app fetches at start and every 15 min. **Left:** signature, version number, education fields. |
| **Song search** | Prototype | iTunes Search API, no key, ~20 calls/min, store-promotion terms; swappable. |
| **Lyrics pipeline** | Not started | Proposes songs into the review queue. `lyrics-system.md`. |
| **Content** | Not started | EN/FR explanations and links, edited by pflag; likely same Worker + D1. |
| **Skip counter** | Not started | Anonymous, opt-in, aggregate. The app's first upload: needs its own privacy review and rate limits. |

## Legal to investigate

1. **Music platform terms.** Is pressing "next" in the Spotify / Apple Music / YouTube apps from outside allowed under their user terms? Names and logos? Approach Spotify at all?
2. **Lyrics rights.** Licence covering analysis, stored derived data and excerpt display; where Canadian fair dealing stops. Also the iTunes Search API terms (written for store promotion).
3. **Defamation and artist pushback.** Flag lines, not people; documented rubric; human sign-off; appeals; E&O cover.
4. **Privacy.** Listening and skip behaviour can reveal orientation or gender identity. PIPEDA, Quebec Law 25, US state laws if offered outside Canada. Privacy policy and EULA.
5. **Donation match claims.** Competition Act; caps, partner agreement, counting and audit.
6. **Publisher of record and IP.** pflag or ZAK on signing certificates and EULA; code ownership; maintenance; retirement.
7. **French and accessibility.** Charter of the French Language; AODA / WCAG.
8. **Name clearance.** Trademark search on "Silence The Hate".

## What we need from pflag canada

Flagging guidelines (draft mid-January), named reviewers and hours, EN/FR education content, legal counsel, the donation partner, and a decision on who publishes the app.
