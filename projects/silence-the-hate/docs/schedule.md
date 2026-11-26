# Schedule: prototype fast, launch 17 May 2027

**Draft, 25 Nov 2026.** Launch is Monday 17 May 2027 (IDAHOBIT). Working prototype by the end of January; everything after that is making it safe, accurate, bilingual and legal.

## At a glance

| Phase | Dates | Outcome | Gate |
|---|---|---|---|
| **0. Discovery and spikes** | Mon 30 Nov – Fri 18 Dec | Playback-control spike, lyrics spike, IT review, legal questions out, costs agreed | **G1, Fri 18 Dec:** how we skip, where lyrics come from, who pays for what |
| *Holiday break* | 21 Dec – 1 Jan | | |
| **1. Prototype** | Mon 4 Jan – Fri 29 Jan | App skips from a hand-made list of ~50 songs on Mac and Windows; education view; classifier run on ~2,000 songs; microsite wireframes | **G2, Fri 29 Jan:** prototype demo to pflag |
| **2. Alpha** | Feb | Lyrics licence signed; pflag guidelines v1; full scan (10–25k songs); review tool live and reviewers working; signed flag feed; French content starts; microsite design | |
| **3. Beta** | Mar | Signed, auto-updating builds; closed beta (pflag staff, ZAK, community testers); skip counter; microsite built | **G3, Fri 26 Mar:** feature freeze |
| **4. Release candidate** | Apr | Security review and pen test, accessibility audit, load test, content lock (EN/FR), legal sign-off, press kit, media embargo briefings | **G4, Fri 23 Apr:** content and legal sign-off |
| **5. Launch** | 3 – 21 May | Final builds, microsite live (soft) 10 May, **launch Mon 17 May**, then a week of close monitoring | |

## Phase 0, week by week

| Week | Kyle (app) | Josh / agent (planning, lyrics, microsite) | pflag | Others |
|---|---|---|---|---|
| **30 Nov** | Share current spec; demo what works | One-pager and schedule to team; request LyricFind and Musixmatch trials; draft rubric v0 | Kick-off: guidelines timeline, reviewers, legal counsel | IT review meeting |
| **7 Dec** | Spike: detect + skip on Spotify app (Mac, Windows), Apple Music, one web player | Lyrics spike: 200 songs through lexicon + classifier | Share existing language guidance; name reviewers | Legal questions to pflag counsel; trademark search |
| **14 Dec** | Write up spike results: latency, reliability per service | Spike report; cost estimate; microsite content outline | Review 10 worked flag examples | Cost split agreed with leadership |
| **Fri 18 Dec** | **G1 decision** | | | |

## Dependencies and long poles

1. **Lyrics licence.** Procurement and contract can take 6–10 weeks. Ask this week or it blocks February's full scan.
2. **pflag guidelines.** The classifier and review tool need them. Draft by mid-January, v1 by mid-February.
3. **Reviewer hours.** Roughly 100 reviewer hours for ~2,000 candidate songs, February to mid-April.
4. **Legal answers** on platform terms, lyric excerpts and publisher of record before beta (March). If controlling the music apps is ruled out, the plan changes, so ask early.
5. **Signing accounts.** Apple Developer ID and Windows code signing take days to weeks to verify an organisation. Set up in January, under whichever organisation publishes.
6. **French translation** of explanations and the microsite: book a translator for March.
7. **Donation partner** confirmed by March so the microsite counter and claims can be written.

## Risks to the date

| Risk | If it happens | Mitigation |
|---|---|---|
| Music services object or break our control method | Skipping stops working on one service | Support several services; browser extension as fallback; legal read early; don't depend on one service's goodwill |
| Classifier flags queer artists' reclaimed language | Public backlash, harms the community | Gold set includes these cases; two-reviewer rule; nothing ships without a human |
| Review backlog | Fewer songs at launch | Prioritise by stream count; launch with fewer, well-reviewed flags rather than many shaky ones |
| Harassment / attacks around launch | Site or feed down on launch day | Static microsite on a CDN, signed feed, no accounts, WAF, on-call rota 17–21 May |
| Licence too expensive | No full lyrics source | Narrower catalog; ask provider for a cause-marketing rate; pflag partner covers it |
