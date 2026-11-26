// English strings. The source of truth for structure: fr.ts must match this shape (see Strings below).
//
// Provenance, so nobody mistakes a draft for approved copy:
//   PITCH  = words from the approved pitch deck (source/pitch.md). Keep as is.
//   DRAFT  = new copy written for this build. Shown on the page with a "Draft" marker until pflag canada approves it.
//   SAMPLE = invented example content (songs, lines). Never real songs, artists or lyrics until the rubric,
//            a pflag reviewer and a lyrics licence are in place (see ../../CLAUDE.md).

const en = {
  meta: {
    lang: 'en',
    title: 'Silence The Hate · pflag canada',
    switchTo: 'Français',
    switchLabel: 'Afficher le site en français',
  },
  common: {
    draft: 'Draft',
    draftTitle: 'Draft copy: awaiting pflag canada approval',
    sample: 'Sample',
    sampleTitle: 'Invented example, not a real song or lyric',
    placeholder: 'Placeholder',
    illustrative: 'Illustration, not real data',
    skipToContent: 'Skip to content',
    wip: 'Draft site · not for publication',
    banner: 'Work in progress. Copy marked “Draft” and examples marked “Sample” are placeholders until pflag canada approves them.',
  },
  nav: {
    label: 'Main',
    why: 'Why',
    try: 'Try it',
    how: 'How it works',
    learn: 'Learn',
    privacy: 'Privacy',
    impact: 'Impact',
    download: 'Download',
    motion: 'Pause animations',
    motionSystem: 'Animations are off in your system settings',
  },
  hero: {
    titleA: 'Silence', // PITCH
    titleB: 'The Hate', // PITCH
    kicker: 'A pflag canada initiative', // DRAFT
    // PITCH (slide 9)
    lede: 'The tool that skips homophobia and transphobia in music, turning every skip into an opportunity for education.',
    launch: 'Launching May 17, 2027', // PITCH (date)
    launchNote: 'International Day Against Homophobia, Biphobia and Transphobia',
    ctaPrimary: 'Get it for Mac', // DRAFT
    ctaSecondary: 'See how it works', // DRAFT
    scrollHint: 'Scroll',
  },
  why: {
    label: 'Why we’re here',
    // PITCH slides 3–6, word for word.
    lines: [
      'Music has always brought together the 2SLGBTQIA+ community and the people who love them.',
      'But music can divide as much as it can unite.',
      'Homophobia and transphobia are still everywhere in people’s playlists.',
      'And as long as these songs keep playing, platforms and artists keep profiting from hate.',
    ],
    playlistTitle: 'Your mix', // SAMPLE
    flaggedRow: 'Lines flagged',
    counterLabel: 'plays and counting',
  },
  tryIt: {
    label: 'Try it',
    title: 'Switch it on. Keep listening.', // DRAFT
    // PITCH (slide 10, Listen)
    body: 'Once installed, the plugin automatically skips problematic songs without you noticing, turning your music algorithm into a safe space.',
    toggleOn: 'ON',
    toggleOff: 'OFF',
    toggleLabel: 'Silence The Hate',
    // PITCH (mock-up copy, frame 02)
    statusOn: 'Our plugin is now active and will automatically skip songs with homophobic and transphobic lyrics.',
    statusOff: 'The plugin is off. Every song plays.', // DRAFT
    nowPlaying: 'Now playing',
    upNext: 'Up next',
    play: 'Play',
    pause: 'Pause',
    skipped: 'Skipped', // DRAFT
    willSkip: 'Will skip',
    skippedLive: (title: string) => `Skipped “${title}”. Its lines were flagged under pflag canada’s guidelines.`,
    playingFlagged: 'This song has lines flagged under pflag canada’s guidelines.', // DRAFT
    skipsThisSession: 'Skips this session',
    whyFlagged: 'Why was it flagged?',
    demoNote: 'A demo with invented songs. No audio plays and nothing is recorded.', // DRAFT
    // SAMPLE playlist. Invented titles and artists only.
    tracks: [
      { title: 'Golden Hour Drive', artist: 'Sample Artist A', flagged: false },
      { title: 'Track With Flagged Lines', artist: 'Sample Artist B', flagged: true, guideline: 0 },
      { title: 'Kitchen Dance', artist: 'Sample Artist C', flagged: false },
      { title: 'Northern Lights', artist: 'Sample Artist D', flagged: false },
      { title: 'Another Flagged Track', artist: 'Sample Artist E', flagged: true, guideline: 1 },
      { title: 'Family For All', artist: 'Sample Artist F', flagged: false },
    ],
  },
  how: {
    label: 'How it works', // PITCH
    title: 'One skip. Three things happen.', // DRAFT
    steps: [
      // PITCH (slide 10)
      { name: 'Install', body: 'People are directed to a microsite where they can learn about the initiative and download the plugin.' },
      { name: 'Listen', body: 'Once installed, the plugin automatically skips problematic songs without you noticing, turning your music algorithm into a safe space.' },
      { name: 'Educate', body: 'Users can explore flagged songs and learn why certain lyrics are hurtful, and be redirected to pflag resources where they can learn more.' },
    ],
    platformNote: 'Desktop first: the Spotify and Apple Music apps on Mac at launch. Windows to be confirmed.', // DRAFT (see docs/one-pager.md)
  },
  words: {
    label: 'Flagging lyrics', // PITCH
    title: 'Words matter.', // PITCH (mock-up)
    // PITCH (slide 11)
    body: 'We’ll flag individual sentences or words in the song and include information where they can learn more about the importance of choosing the right words.',
    back: 'Back',
    next: 'Next',
    of: (i: number, n: number) => `${i} of ${n}`,
    guideline: 'Guideline',
    deepDive: 'Deep dive',
    quickStart: 'Quick start',
    minRead: (m: number) => `${m} min read`,
    openResource: 'Read on pflagcanada.ca',
    sampleNote: 'Sample lines describe the kind of lyric that gets flagged. Real flags show the flagged line only, approved by a pflag canada reviewer.', // DRAFT
    // SAMPLE lines + DRAFT explanations. Guideline names are placeholders until pflag’s flagging guidelines exist (draft due mid-January).
    cards: [
      {
        line: 'A lyric that jokes a woman is “really a man”',
        guideline: 'Mocking gender identity',
        // PITCH (mock-up): first sentence. Second sentence DRAFT.
        why: 'Words matter. Gendered language can be hurtful and reinforce harmful stereotypes.',
        resource: { kind: 'deep', tag: 'Understanding identity', title: 'Understanding Gender Diversity', blurb: 'Trans 101, the words in plain language, how common it is, and the questions parents ask.', url: 'https://pflagcanada.ca/resources/understanding-gender-diversity/', minutes: 15 },
      },
      {
        line: 'A lyric that uses a slur to put someone down',
        guideline: 'Slurs used to demean',
        why: 'When a slur is aimed at someone, it tells every queer listener what the singer thinks of them. Hearing it on repeat makes it sound normal.',
        resource: { kind: 'quick', tag: 'Starting out', title: 'Your Child Just Came Out as Gay, Lesbian or Bi', blurb: 'What changes, what doesn’t, and how to support them.', url: 'https://pflagcanada.ca/resources/your-child-just-came-out-as-gay-lesbian-or-bi/', minutes: 8 },
      },
      {
        line: 'A lyric that uses “gay” to mean weak or bad',
        guideline: 'Identity used as an insult',
        why: 'Using who someone is as a put-down teaches that being queer is something to be ashamed of, even when it’s meant as a joke.',
        resource: { kind: 'quick', tag: 'Schools and community', title: 'Being an Ally to Your Friend’s Kid', blurb: 'Small things that tell a young person they’re safe with you.', url: 'https://pflagcanada.ca/resources/being-an-ally-to-your-friends-kid/', minutes: 5 },
      },
      {
        line: 'A lyric that laughs at someone’s pronouns',
        guideline: 'Erasing non-binary people',
        why: 'Pronouns are how people are seen. Mocking them says some people don’t count.',
        resource: { kind: 'quick', tag: 'Supporting your child', title: 'Supporting Your Non-binary Child', blurb: 'What it means, getting comfortable with new names and pronouns, and how to support them.', url: 'https://pflagcanada.ca/resources/supporting-your-non-binary-child/', minutes: 8 },
      },
      {
        line: 'A lyric that threatens violence against a gay man',
        guideline: 'Threats and violence',
        why: 'Songs that cheer on violence make it feel acceptable. For many queer people, these threats aren’t abstract.',
        resource: { kind: 'quick', tag: 'Starting out', title: 'What to Expect at Your First pflag Meeting', blurb: 'How to pick the right group, and what happens in the room.', url: 'https://pflagcanada.ca/resources/what-to-expect-at-your-first-pflag-meeting/', minutes: 4 },
      },
    ],
  },
  context: {
    label: 'Context matters', // DRAFT
    title: 'Same word. Different song.', // DRAFT
    body: 'Queer artists have taken back words that were once used against them. Reclaimed language is not hate, so it isn’t flagged by default. A person reviews the context.', // DRAFT (rule from CLAUDE.md)
    word: 'queer',
    options: [
      { name: 'Sung with pride', before: 'An artist sings about their own life, calling themselves', after: 'and proud of it.', verdict: 'Not flagged', tone: 'ok' as const },
      { name: 'Thrown as an insult', before: 'A lyric spits the word at someone, calling them', after: 'to put them down.', verdict: 'Sent for review', tone: 'flag' as const },
    ],
  },
  decide: {
    label: 'Who decides', // DRAFT
    title: 'A machine suggests. A person decides.', // DRAFT
    steps: [
      { who: 'Scan', body: 'Software reads lyrics and suggests lines that may break the guidelines. It never publishes anything.' },
      { who: 'pflag reviewer', body: 'A person appointed by pflag canada reads the line in context and approves or rejects it.' },
      { who: 'Flag', body: 'Approved flags record the guideline version, the reviewer and the date.' },
    ],
    principle: 'We flag lines, not people. A flag says a song’s lines break pflag canada’s guidelines. It never labels an artist.', // DRAFT (rule from CLAUDE.md)
    machineLog: ['scanning…', 'line 14: possible match', 'proposed → review queue'],
    record: ['guidelines v0.x', 'reviewer ✓', '2027-05-17'],
  },
  letters: {
    label: 'The letters', // DRAFT
    title: 'What 2SLGBTQIA+ stands for.', // DRAFT
    hint: 'Pick a letter.',
    // DRAFT definitions: pflag canada to approve wording.
    items: [
      { key: '2S', term: 'Two-Spirit', def: 'A term used by some Indigenous people to describe a gender, sexual or spiritual identity. It belongs to Indigenous communities and comes first in the acronym in Canada.' },
      { key: 'L', term: 'Lesbian', def: 'A woman or non-binary person attracted to women.' },
      { key: 'G', term: 'Gay', def: 'Someone attracted to people of the same gender. Often used by men, and by many people as an umbrella term.' },
      { key: 'B', term: 'Bisexual', def: 'Someone attracted to more than one gender.' },
      { key: 'T', term: 'Transgender', def: 'Someone whose gender is different from the one they were assigned at birth.' },
      { key: 'Q', term: 'Queer or Questioning', def: 'Queer is a reclaimed umbrella term for people who aren’t straight or cisgender. Questioning describes someone exploring their identity.' },
      { key: 'I', term: 'Intersex', def: 'Someone born with sex characteristics that don’t fit typical ideas of male or female bodies.' },
      { key: 'A', term: 'Asexual, Aromantic, Agender', def: 'People who feel little or no sexual attraction, little or no romantic attraction, or no gender.' },
      { key: '+', term: 'And more', def: 'Every identity the letters don’t name yet. The plus says: you belong here too.' },
    ],
  },
  privacy: {
    label: 'Privacy promise', // README section name
    title: 'Nothing about what you listen to leaves your computer.', // DRAFT (microsite README)
    points: [
      { name: 'Matched on your computer', body: 'The list of flagged songs downloads to your computer. Checking each song happens there.' },
      { name: 'No accounts', body: 'No sign-up, and no sign-in to Spotify or Apple Music. The plugin sits beside your music app.' },
      { name: 'Only anonymous totals', body: 'If you opt in, the plugin shares a count of skips, never which songs. Still being designed.' },
    ],
    stays: ['what you play', 'what you skip', 'your playlists', 'when you listen'],
    ringsLabel: 'Your computer',
  },
  impact: {
    label: 'Potential impact', // PITCH
    title: 'Every skip can do something.', // DRAFT
    items: [
      // PITCH (slide 12)
      { name: 'Generating donations', body: 'We could leverage pflag canada’s corporate partnerships to match the value of every skipped stream with a donation, redirecting it towards positive change.' },
      { name: 'Igniting conversations', body: 'We expect this initiative to generate significant earned media, attracting attention towards pflag canada starting a conversation around who benefits.' },
      { name: 'Creating change', body: 'Everyone who downloads and uses the plug-in unlocks an exclusive playlist celebrating inclusive music and artists.' },
    ],
    counterLabel: 'Skips matched with a donation',
    counterPending: 'Live once the donation partner is confirmed.', // DRAFT
    playlistTitle: 'The inclusive playlist', // DRAFT
    playlistLocked: 'Install to unlock', // DRAFT
  },
  close: {
    // PITCH (slide 13)
    statement: 'pflag canada is turning harmful lyrics into opportunities for education.',
    cta: 'Get it for Mac',
    ctaNote: 'Available May 17, 2027. Windows to be confirmed.', // DRAFT
    resources: 'Explore pflag canada resources',
    resourcesUrl: 'https://pflagcanada.ca/resources/',
  },
  faq: {
    label: 'Questions', // DRAFT (all answers drawn from docs/one-pager.md)
    items: [
      { q: 'Is it free?', a: 'Yes.' },
      { q: 'Which music apps does it work with?', a: 'At launch, the Spotify and Apple Music apps on a Mac. Windows is being scoped, and a browser extension for web players is planned next.' },
      { q: 'Why not on my phone?', a: 'iPhone doesn’t let one app see or control what another app plays, so it isn’t possible there. Android may come after launch.' },
      { q: 'Does it know what I listen to?', a: 'Your computer does; we don’t. Songs are checked on your machine and nothing about what you play leaves it.' },
      { q: 'Who decides what gets flagged?', a: 'pflag canada’s guidelines, and a person appointed by pflag who approves every flag. Software only suggests.' },
      { q: 'Does a flag mean the artist is homophobic or transphobic?', a: 'No. We flag lines, not people. A flag says a song’s lines break pflag canada’s guidelines.' },
      { q: 'Can I suggest a song?', a: 'Yes, from launch. Suggestions go to review; they never become a flag on their own.' },
    ],
  },
  footer: {
    org: 'A pflag canada initiative. Family for all.',
    made: 'Made with Zulu Alpha Kilo.',
    pflag: 'pflagcanada.ca',
    pflagUrl: 'https://pflagcanada.ca/',
    reducedMotion: 'Animations follow your system’s reduced-motion setting. You can also pause them with the button at the top of the page.',
  },
};

// Widen literal types so the French file can provide its own words with the same shape.
type Widen<T> = T extends string
  ? string
  : T extends (...a: infer A) => infer R
    ? (...a: A) => Widen<R>
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Strings = Widen<typeof en>;
export default en as Strings;
