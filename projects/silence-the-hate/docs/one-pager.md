# Silence The Hate: what we're building (one-pager)

**Draft, 25 Nov 2026.** pflag canada × Zulu Alpha Kilo. Launch Monday 17 May 2027 (IDAHOBIT).

A desktop plugin that skips homophobic and transphobic songs as they start, and lets people see which lines were flagged, why they hurt, and where to learn more from pflag canada. People find it on a bilingual microsite.

## The one finding that shapes everything

**We probably can't build this on Spotify's official API.** Since February 2026, new Spotify apps in development mode are limited to 5 users, and opening up to the public ("extended access") is only granted to registered businesses with at least 250,000 monthly active users. Spotify's developer policy also restricts apps that control playback. So the plugin either:

1. **Controls the music app on the computer directly** (recommended for v1): read "now playing" and press "next" through the operating system (Windows media controls; AppleScript for the Spotify and Apple Music apps on macOS), plus a browser extension for web players. No Spotify developer account needed, works across services. Still needs a legal read on each service's user terms.
2. **Gets Spotify's blessing**: a partnership or approved exemption. Worth asking, but it can't be on the critical path, and a campaign that says platforms "profit from hate" makes a yes less likely.

Also worth saying out loud to pflag early: **most listening happens on phones, and v1 is desktop only.** iOS does not let one app skip another app's songs. Android might, later.

## Front end

| Piece | What it needs to do |
|---|---|
| **Desktop app** (Kyle, Rust) | Runs quietly in the menu bar / system tray. Detects the playing track (title, artist, duration). Matches it against the flag list **on the device**. Skips within about a second. On/off toggle, "skip only the most severe" setting, pause per song ("play it anyway"). Signed, notarized, auto-updating. macOS and Windows. |
| **Education view** | For each skipped or flagged song: the flagged line(s) only, a short "words matter" explanation in pflag's voice, a resource card linking to pflag content. History of what was skipped (kept locally). English and French. |
| **Browser extension** (optional, v1.1) | Same skip and education behaviour for web players (open.spotify.com, YouTube Music, Apple Music web). |
| **Microsite** | What it is and why, how it works, download for Mac / Windows, a privacy promise in plain words, a searchable flagged-songs explorer, pflag learning hub, live skip / donation counter, the inclusive playlist unlock, FAQ, press kit. Bilingual, WCAG 2.1 AA. |
| **Review tool** (internal) | Where pflag reviewers approve, edit or reject proposed flags and write the explanations. |

## Back end

| Piece | What it needs to do |
|---|---|
| **Lyrics scanning pipeline** | Pull licensed lyrics for a candidate list of songs, find likely-harmful lines with a slur lexicon plus an AI classifier that applies pflag's guidelines and understands context (reclaimed language, critique, narrative). Proposes flags; never publishes them. Detail: `lyrics-system.md`. |
| **Flag catalog** | The approved list: song identity (ISRC where possible, plus title / artist / duration variants), flagged line refs, category, severity, explanation id, rubric version, reviewer, date. |
| **Flag list feed** | A small, **signed**, versioned file the app downloads and checks daily. Signing stops anyone tampering with what gets skipped. |
| **Content API / CMS** | Explanations and resource links in EN/FR, edited by pflag. Feeds the app and the microsite. |
| **Skip counter** | Anonymous, opt-in, aggregate counts (no song, no user id) for the donation match and the press number. Rate-limited per install so the count can't be inflated, since money depends on it. |
| **Admin / ops** | SSO-protected admin, logs, alerts, a kill switch to pull a flag quickly, hosting in Canada. |

No user accounts in v1. Nothing about what someone listens to leaves their computer.

## Legal to investigate

1. **Music platform terms.** Is controlling the Spotify / Apple Music / YouTube apps from outside allowed under their user terms and developer policies? Can we show their names or logos? Do we approach Spotify at all?
2. **Lyrics rights.** A licence (LyricFind, a Toronto company, or Musixmatch) that covers analysing lyrics, storing what we derive, and showing flagged lines in the app and on the microsite. Where does Canadian fair dealing (criticism, education) stop?
3. **Defamation and artist pushback.** Publicly flagging named songs invites complaints and legal letters. We need wording that flags lines, not people; a documented rubric; human sign-off on every flag; an appeals process; and errors-and-omissions cover.
4. **Privacy.** Listening and skip behaviour can reveal sexual orientation or gender identity. PIPEDA, Quebec Law 25 (privacy impact assessment, privacy by default), plus US state laws if the plugin is offered outside Canada. Privacy policy and EULA.
5. **Donation match claims.** "Every skip = a donation" must be literally true (Competition Act, misleading claims): caps, partner agreements, how it's counted and audited. pflag's charity obligations.
6. **Who publishes the software.** Is pflag or ZAK the publisher on the signing certificates, app listing and EULA? Who owns the code and IP (the pitch says ZAK owns the thinking unless partnering), who maintains it after the campaign, and how it is retired.
7. **French language and accessibility.** Quebec's Charter of the French Language for the app and site; AODA / WCAG.
8. **Name clearance.** Trademark search on "Silence The Hate".

## What we need from pflag canada

The flagging guidelines (draft by mid-January), named reviewers and their hours, education content and resource links in EN/FR, their legal counsel (or a pro bono firm), the corporate donation partner, and a decision on who publishes the app.

## Next steps

- **Kyle:** share the current spec; confirm how the app detects and skips today, and on which services.
- **Josh:** IT review (`it-review.md`); cost alignment with leadership (`costs.md`).
- **Lyrics spike (this week or next):** request trial access from LyricFind and Musixmatch; run the classifier on ~200 songs with a draft rubric.
- **pflag:** legal questions above to their counsel; guidelines timeline.
- **Gate 1, Fri 18 Dec:** decide how the app controls playback and where lyrics come from. Schedule: `schedule.md`.
