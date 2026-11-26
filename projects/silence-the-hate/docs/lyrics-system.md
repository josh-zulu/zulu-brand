# The lyrics system: how songs get scanned and flagged

**Draft, 25 Nov 2026.** The biggest open question in the project. pflag canada supplies the guidelines; we build the machine that applies them at scale and the review step that keeps humans in charge.

## Principles

- **Machines propose, people decide.** Nothing ships without a pflag-appointed reviewer's approval.
- **Context matters.** The same word can be a slur, a reclaimed word in a queer artist's song, a quote being criticised, or a character's voice. Keyword matching alone will get this wrong in public.
- **Explainable and auditable.** Every flag can answer: which line, which guideline, who approved it, when, under which rubric version.
- **Licensed text only.** Lyrics come from a provider whose licence covers analysis and showing short excerpts.

## Pipeline

```
 candidate songs ─▶ licensed lyrics ─▶ 1. lexicon pass ─▶ 2. AI classifier ─▶ 3. human review ─▶ flag catalog ─▶ signed flag list
 (charts, lists,     (LyricFind /        (recall: slurs,     (precision: context,   (pflag reviewers:     (ISRC + title /      (app downloads,
  nominations)        Musixmatch)         variants, coded)    guideline, severity)   approve / edit /      artist variants)     matches locally)
                                                                                      reject, explain)
```

### 0. Which songs to scan

We can't scan every song ever recorded, and we don't need to: people mostly play what's popular. Start with:
- Top streamed tracks, Canada and US, current and back catalogue (target 10,000 to 25,000 tracks for launch). Sources to price: Luminate chart data (paid), Spotify's public charts (check terms before using), Billboard archives.
- Songs pflag and community partners already know are harmful.
- A "suggest a song" form on the microsite after launch (goes to the review queue, never straight to a flag).

### 1. Lyrics source

| Option | Licensed? | Notes |
|---|---|---|
| **LyricFind** (Toronto) | Yes. Represents 5,000+ rightsholders including Sony, UMPG, Warner Chappell | Canadian, which suits the client. Pricing by quote. Ask for analysis + storage of derived data + excerpt display. |
| **Musixmatch** | Yes. Spotify's own lyrics partner | Free developer key returns only about 30% of each lyric, so it's not enough for scanning. Commercial use is by sales quote. |
| LRCLIB | Unclear | Free, crowd-sourced synced lyrics. The code is open source but that doesn't license the lyrics. Fine for an internal spike at most; not for production. |
| Genius API | No lyrics in the API | Getting lyrics means scraping, which breaks their terms. No. |

**Recommendation:** request quotes and trial keys from LyricFind and Musixmatch this week. The licence must cover: (a) programmatic analysis, (b) keeping flag records and line references after the term, (c) showing the flagged line (not the full lyric) in the app and on the microsite, (d) Canada and any other launch markets.

### 2. Lexicon pass (cheap, high recall)

A list of slurs and terms from pflag's guidelines, with spelling variants, censored forms (f*g, f@g), regional and coded terms, in English and French. Any song with a hit goes to the classifier. Songs with no hit still get a lighter classifier pass, because hateful lines don't always use slurs (mocking trans people, violence against gay men).

### 3. AI classifier (context and severity)

Claude, run line by line with the song in context, prompted with pflag's rubric. Output per line (structured JSON):
- `flag`: yes / no / unsure
- `guideline`: which rule it breaks (e.g. slur, dehumanising, mockery of gender identity, incitement to violence)
- `severity`: 1 (insensitive) to 3 (hateful / violent)
- `context`: reclaimed / critical / narrative / endorsing
- `rationale`: one or two sentences a reviewer can check quickly
- `confidence`

Tune it against a **gold set**: 200 to 300 songs labelled by pflag reviewers, deliberately including queer artists using reclaimed language, songs that critique homophobia, and borderline cases. Measure precision and recall before every rubric or prompt change. The classifier is cheap to run at this scale; the licence and the human review time are the real costs.

### 4. Human review

- Review tool shows the song, the proposed lines highlighted, the classifier's reasoning, and the guideline. Reviewer approves, edits the line selection or severity, or rejects, and picks or writes the explanation.
- Two reviewers for severity 3 and for anything involving a 2SLGBTQIA+ artist.
- **Throughput is the real constraint.** If 2,000 songs reach review at ~3 minutes each, that's about 100 reviewer hours. pflag needs to commit people to this from February.

### 5. Matching songs on the computer

Kyle's approach (see `desktop-app-spec.md`, "Song matching"): players only report title and artist, never an ISRC, so none is stored.
- The app matches **exact title + artist**, ignoring case and outer spaces. Strict on purpose: skipping the wrong song is worse than missing one.
- Songs are saved with **Apple's exact title and artist** (from the iTunes Search API); Spotify shows the same distributor metadata.
- Clean, live and remix versions are added by a reviewer as their own entries.
- **The lyrics pipeline must output Apple's spelling** so its proposals drop straight into the review dashboard.
- Still open: fold curly apostrophes and "(feat. ...)"; use the stored song length to separate two same-titled songs by one artist.
- Clean (radio edit) versions: decide with pflag whether the clean version is flagged too. A muted slur is still the song.

### 6. After launch

- Appeals: a form for artists, labels and listeners to contest a flag; reviewed within a set time; outcome logged.
- Kill switch: pull a flag from the feed within an hour.
- Re-scan when the rubric changes; every flag keeps its rubric version.

## Spike plan (before Gate 1, 18 Dec)

1. Draft rubric v0 from pflag's existing language guidance (until their guidelines arrive).
2. Hand-pick 200 songs: clearly harmful, clearly fine, reclaimed, critical, borderline.
3. Get lyrics via provider trials (or LRCLIB for internal testing only, not kept).
4. Run lexicon + classifier; compare to our own labels; note where it fails.
5. Show pflag 10 worked examples to agree the explanation format.

Output: a short report with precision / recall, failure cases, a cost estimate for 20,000 songs, and a recommended lyrics provider.
