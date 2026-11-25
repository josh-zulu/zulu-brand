/**
 * Engine for the dictation demo (S1Dictation): the scripted brief, live transcription and brief structuring.
 *
 * Live path, in order of preference:
 *   1. ElevenLabs Scribe realtime (model scribe_v2_realtime), single-use token from POST /api/scribe-token
 *   2. the browser's Web Speech API
 *   3. the scripted demo (no mic, no permission, no network). Preview mode always uses the script.
 * Structuring: POST /api/brief → Claude. When that is unavailable: the hand-written brief for the script,
 * or a local heuristic brief (flagged "offline") for live speech.
 */

export interface Brief {
  title: string;
  objective: string;
  audience: string;
  deliverables: string[];
  tone: string;
  timing: string;
  open_questions: string[];
}

/** Where each phrase of the transcript lands in the brief: 'title' | 'objective' | 'audience' | 'deliv-0' | 'tone' | 'timing' | 'q-0' … */
export type FieldKey = string;

export interface Token { text: string; filler?: boolean; field?: FieldKey; group?: number; partial?: boolean }

/* ───────────────────────── the scripted brief ───────────────────────── */

// Markup: {filler}  [field|phrase that becomes a field]
const SCRIPT_SRC =
  '{Okay so,} {um,} this is for [title|Northline.] The outdoor gear people? They’re launching a winter jacket, {the, uh,} [title|the Coldfront,] in February. ' +
  'What we really need is to get [audience|people under thirty-five] to [objective|see it as a city jacket, not just a hiking thing.] ' +
  '{So like,} [audience|commuters, people biking to work in the snow.] We’re thinking [deliv-0|a thirty-second hero film,] and then, {you know,} ' +
  '[deliv-1|six social cutdowns,] and maybe [deliv-2|three transit shelters downtown.] It should feel [tone|warm, a bit funny, not, like, extreme sports.] ' +
  'First look by [timing|January fifteenth,] live [timing|February third.] {Oh and, um,} I’m [q-0|not sure on budget yet,] and we still need to figure out [q-1|who signs off on their side.]';

export const SCRIPT_BRIEF: Brief = {
  title: 'Northline Coldfront launch',
  objective: 'Reposition the Coldfront as an everyday city jacket, not just hiking gear.',
  audience: 'Commuters under 35 who walk or bike to work through the winter.',
  deliverables: ['30s hero film', '6 social cutdowns', '3 transit shelters'],
  tone: 'Warm, a little funny, never extreme.',
  timing: 'First look Jan 15. Live Feb 3.',
  open_questions: ['What’s the budget?', 'Who signs off at Northline?', 'Do we need French versions?'],
};

export function parseScript(src = SCRIPT_SRC): Token[] {
  const out: Token[] = [];
  let group = 0;
  const re = /\{([^}]+)\}|\[([^|\]]+)\|([^\]]+)\]|([^\s{[]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[1]) m[1].split(/\s+/).filter(Boolean).forEach((w) => out.push({ text: w, filler: true }));
    else if (m[2]) { const g = group++; m[3].split(/\s+/).filter(Boolean).forEach((w) => out.push({ text: w, field: m![2], group: g })); }
    else if (m[4]) out.push({ text: m[4] });
  }
  return out;
}

export const SCRIPT_TOKENS = parseScript();
export const SCRIPT_TEXT = SCRIPT_TOKENS.map((t) => t.text).join(' ');

/** When each scripted word is "spoken" (seconds), paced like a quick, slightly rambling talker. */
export const SCRIPT_TIMES: number[] = (() => {
  const times: number[] = [];
  let t = 0.5;
  SCRIPT_TOKENS.forEach((tok) => {
    times.push(t);
    const w = tok.text;
    t += (tok.filler ? 0.17 : 0.19) + Math.min(w.length, 10) * 0.011;
    if (/[.?!]$/.test(w)) t += 0.42;
    else if (/,$/.test(w)) t += 0.17;
  });
  return times;
})();
export const SCRIPT_DURATION = SCRIPT_TIMES[SCRIPT_TIMES.length - 1] + 0.6;

/* ───────────────────────── live tokens ───────────────────────── */

const FILLER_RE = /^(um+|uh+|er+|ah+|hmm+|mm+|erm|okay|ok|so|like|yeah|basically|literally|actually|right)[,.]?$/i;
const FILLER_PAIRS = [['you', 'know'], ['i', 'mean'], ['kind', 'of'], ['sort', 'of']];

/** Split live text into tokens and mark obvious filler (um, uh, "you know", a "like," set off by commas…). */
export function tokenize(text: string, partial = false): Token[] {
  const words = text.split(/\s+/).filter(Boolean);
  const toks: Token[] = words.map((w) => ({ text: w, partial }));
  const bare = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''));
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^(um+|uh+|er+|ah+|hmm+|erm)[,.]?$/i.test(w)) toks[i].filler = true;
    else if (FILLER_RE.test(w) && /,$/.test(w)) toks[i].filler = true; // "so," "like," "okay,"
    for (const [a, b] of FILLER_PAIRS) {
      if (bare[i] === a && bare[i + 1] === b && /,$/.test(words[i + 1] ?? '')) { toks[i].filler = true; toks[i + 1].filler = true; }
    }
  }
  return toks;
}

/* ───────────────────────── phrase matching (live) ───────────────────────── */

const STOP = new Set((
  'a an the and or but so to of for in on at by with from it its is are was were be been being this that these those we you they i me my our ' +
  'your their them us he she his her as if then than just really very also too into about up out over not no yes do does did have has had get got ' +
  'make made going gonna wanna want need like um uh er ah oh okay ok yeah well kind sort basically actually literally maybe something thing things stuff ' +
  'what who when where how which will would should could can there here some any all more most one'
).split(' '));
const NUM: Record<string, string> = {
  one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12',
  fifteen: '15', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60', ninety: '90', hundred: '100',
};
function norm(w: string) {
  let s = w.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (NUM[s]) s = NUM[s];
  if (/^\d+s$/.test(s)) s = s.slice(0, -1);
  if (s.length > 4) s = s.replace(/(ing|ed|es|s)$/, '');
  return s;
}
const contentWords = (text: string) => text.split(/[\s\-–—/]+/).map(norm).filter((x) => x && !STOP.has(x));

export interface Span { field: FieldKey; start: number; end: number }

/** For each brief field, find the stretch of transcript it most likely came from (so that phrase can fly into it). */
export function matchSpans(words: string[], brief: Brief): Span[] {
  const wn = words.map(norm);
  const content = wn.map((x) => !!x && !STOP.has(x));
  const used = new Array(words.length).fill(false);
  const targets: [FieldKey, string][] = [
    ['title', brief.title], ['objective', brief.objective], ['audience', brief.audience],
    ...brief.deliverables.map((d, i) => [`deliv-${i}`, d] as [FieldKey, string]),
    ['tone', brief.tone], ['timing', brief.timing],
    ...brief.open_questions.map((q, i) => [`q-${i}`, q] as [FieldKey, string]),
  ];
  const spans: Span[] = [];
  for (const [field, value] of targets) {
    const want = new Set(contentWords(value || ''));
    if (!want.size) continue;
    let best: { start: number; end: number; score: number; hits: number } | null = null;
    for (let s = 0; s < wn.length; s++) {
      if (used[s] || !content[s] || !want.has(wn[s])) continue;
      const seen = new Set<string>();
      let hits = 0;
      for (let e = s; e < Math.min(wn.length, s + 12); e++) {
        if (used[e]) break;
        if (content[e] && want.has(wn[e]) && !seen.has(wn[e])) {
          seen.add(wn[e]); hits++;
          const score = hits - 0.08 * (e - s + 1);
          if (!best || score > best.score) best = { start: s, end: e, score, hits };
        }
      }
    }
    if (best && best.hits >= Math.min(2, want.size)) {
      for (let i = best.start; i <= best.end; i++) used[i] = true;
      spans.push({ field, start: best.start, end: best.end });
    }
  }
  return spans.sort((a, b) => a.start - b.start);
}

/* ───────────────────────── local brief (no Claude) ───────────────────────── */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trimWords = (s: string, n: number) => { const w = s.split(/\s+/); return w.length > n ? w.slice(0, n).join(' ') + '…' : s; };
const sentence = (s: string) => { const t = s.trim().replace(/^[,;:\s]+|[,;:\s]+$/g, ''); return t ? cap(t).replace(/[^.?!…]$/, (c) => c + '.') : ''; };

function stripFillers(text: string) {
  return tokenize(text).filter((t) => !t.filler).map((t) => t.text).join(' ')
    .replace(/\b(you know|i mean|kind of|sort of)\b,?\s*/gi, '')
    .replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim();
}

/** A believable brief from arbitrary speech, without a model. Rough on purpose; the slide labels it "offline". */
export function localBrief(text: string): Brief {
  const clean = stripFillers(text);
  let sentences = clean.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length < 2) { // no punctuation (browser speech): chunk it
    const w = clean.split(/\s+/);
    sentences = [];
    for (let i = 0; i < w.length; i += 16) sentences.push(w.slice(i, i + 16).join(' '));
  }
  const find = (re: RegExp, not?: string) => sentences.find((s) => re.test(s) && s !== not);

  const objS = find(/\b(want|need|trying|have)( is)? to\b|\bgoal\b|\bso that\b/i)
    ?? find(/\b(need|want|objective|aim|launch|drive|grow|increase|sell|reposition|change)\b/i) ?? sentences[0] ?? '';
  const objective = sentence(trimWords(objS.replace(/\b(basically|really|just)\s+/gi, '').replace(/^(so|and|but|okay|well)\s+/i, '')
    .replace(/^.*?\b(?:want|need|trying|have)(?: is)? to\s+/i, '').replace(/^.*?\b(?:the goal is|goal is)\s+(?:to\s+)?/i, ''), 18));

  const audM = clean.match(/\b(?:get|getting)\s+((?:more\s+)?[a-z][\w\s-]{3,60}?)\s+to\s+\w/i) ?? clean.match(/\b(?:for|targeting|aimed at|audience is|talking to|reach)\s+((?:people|anyone|parents|families|students|kids|teens|gen z|millennials|commuters|customers|young|women|men|small business|businesses|new|existing)[^.,;?!]{0,70})/i);
  const audience = audM ? sentence(trimWords(audM[1], 14)) : 'Not specified.';

  const delivRe = /\b((?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+)[\s-]+)?(?:[\w-]+\s){0,3}(films?|videos?|spots?|cut-?downs?|posts?|stories|reels?|billboards?|boards|banners?|ooh|print ads?|landing pages?|websites?|emails?|decks?|radio spots?|podcasts?|ads|shelters?)\b/gi;
  const deliverables = Array.from(new Set((clean.match(delivRe) ?? []).map((d) => cap(d.trim().replace(/^(and|or|maybe|then)\s+/i, ''))))).slice(0, 4);

  const toneM = clean.match(/\b(?:feel|tone|vibe|sound|come across)(?:s)?\s+(?:should be\s+|is\s+|like\s+)?([^.?!]{3,60})/i);
  const toneWords = clean.match(/\b(warm|bold|funny|playful|premium|confident|simple|honest|human|cinematic|minimal|calm|energetic|smart|friendly|serious)\b/gi);
  const tone = toneM ? sentence(trimWords(toneM[1], 8)) : toneWords ? sentence(Array.from(new Set(toneWords.map((w) => w.toLowerCase()))).slice(0, 3).join(', ')) : 'Not specified.';

  const timeRe = /\b(?:by|on|before|for|in|live|launch(?:es|ing)?|due)?\s*(?:(?:jan|feb|mar|apr|may(?=\s*\d)|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{0,2}(?:st|nd|rd|th)?(?:\s+\w+)?|next (?:week|month|quarter)|end of (?:the )?(?:week|month|quarter|year)|q[1-4]|\d+\s+weeks?|(?:monday|tuesday|wednesday|thursday|friday)\b)/gi;
  const times = (clean.match(timeRe) ?? []).map((t) => t.trim()).filter((t) => t.length > 2).slice(0, 2);
  const timing = times.length ? sentence(times.map((t) => cap(t.replace(/[.,;]+$/, ''))).join('. ')) : 'Not specified.';

  const props = Array.from(new Set((clean.match(/(?<=[a-z,]\s)[A-Z][a-zA-Z]+/g) ?? []).filter((w) => !['I', 'OK', 'Okay'].includes(w))));
  const title = props.length ? `${props.slice(0, 2).join(' ')} brief` : cap(trimWords(contentWords(objective).slice(0, 3).join(' ') || 'New', 4)) + ' brief';

  const qs: string[] = [];
  if (!/\b(budget|\$|dollars?|spend)\b/i.test(clean) || /not sure (on|about) budget/i.test(clean)) qs.push('What’s the budget?');
  if (audience === 'Not specified.') qs.push('Who is this for?');
  if (timing === 'Not specified.') qs.push('When does it need to be live?');
  if (!/\b(sign(s)? off|approv)/i.test(clean) || /figure out who signs off/i.test(clean)) qs.push('Who signs off?');
  if (!deliverables.length) qs.push('What do we need to make?');

  return {
    title: cap(title),
    objective: objective || 'Not specified.',
    audience,
    deliverables: deliverables.length ? deliverables : ['To confirm'],
    tone,
    timing,
    open_questions: qs.slice(0, 3),
  };
}

/** Ask Claude (via the dev server) to structure the transcript. Resolves null when unavailable (no key, offline, slow). */
export async function requestBrief(transcript: string, signal: AbortSignal, timeoutMs = 15000): Promise<Brief | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  signal.addEventListener('abort', () => ctrl.abort());
  try {
    const r = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }), signal: ctrl.signal });
    if (!r.ok) return null;
    const { brief } = await r.json();
    if (!brief || typeof brief.objective !== 'string') return null;
    return {
      title: String(brief.title ?? ''), objective: String(brief.objective ?? ''), audience: String(brief.audience ?? ''),
      deliverables: Array.isArray(brief.deliverables) ? brief.deliverables.map(String).slice(0, 5) : [],
      tone: String(brief.tone ?? ''), timing: String(brief.timing ?? ''),
      open_questions: Array.isArray(brief.open_questions) ? brief.open_questions.map(String).slice(0, 3) : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ───────────────────────── live capture ───────────────────────── */

export type LiveEngine = 'scribe' | 'webspeech';

interface LiveCallbacks {
  /** committed + in-progress text for this session */
  onText: (committed: string, partial: string) => void;
  onEngine: (e: LiveEngine) => void;
  /** live transcription isn't possible (no mic, denied, no engine); switch to the script */
  onFail: (reason: string) => void;
}

const join = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b).replace(/\s{2,}/g, ' ').trim();

/** Prefetched single-use Scribe token (they expire after ~15 minutes, so refetch when stale). */
let tokenCache: { token: string; at: number } | null = null;
let tokenInFlight: Promise<boolean> | null = null;
const tokenFresh = () => !!tokenCache && Date.now() - tokenCache.at < 10 * 60_000;
export function prefetchScribeToken(): Promise<boolean> {
  if (tokenFresh()) return Promise.resolve(true);
  tokenInFlight ??= (async () => {
    try {
      const r = await fetch('/api/scribe-token', { method: 'POST' });
      if (!r.ok) return false;
      const { token } = await r.json();
      if (!token) return false;
      tokenCache = { token, at: Date.now() };
      return true;
    } catch { return false; } finally { tokenInFlight = null; }
  })();
  return tokenInFlight;
}
async function takeScribeToken(): Promise<string | null> {
  if (!tokenFresh()) await prefetchScribeToken();
  const t = tokenCache?.token ?? null;
  tokenCache = null; // single use
  return t;
}

/**
 * Mic + realtime transcription. Owns one analyser stream (for the waveform) and either a Scribe socket
 * (which opens its own mic stream) or a Web Speech recogniser. Everything is released by dispose().
 */
export class LiveCapture {
  private stream?: MediaStream;
  private ctx?: AudioContext;
  private analyser?: AnalyserNode;
  private buf?: Float32Array<ArrayBuffer>;
  private conn?: { close: () => void; commit: () => void };
  private rec?: any;
  private committed = '';
  private partial = '';
  private webBase = '';
  private stopped = false;
  private engine?: LiveEngine;

  private cb: LiveCallbacks;
  constructor(cb: LiveCallbacks) { this.cb = cb; }

  /** 0..1 loudness for the waveform. */
  level() {
    if (!this.analyser || !this.buf) return 0;
    this.analyser.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
    const rms = Math.sqrt(sum / this.buf.length);
    return Math.min(1, Math.max(0, (rms - 0.004) * 9)) ** 0.7;
  }

  text() { return join(this.committed, this.partial); }

  async start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no mediaDevices');
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e: any) {
      return this.cb.onFail(`mic: ${e?.name || e}`);
    }
    if (this.stopped) return this.dispose();
    try {
      this.ctx = new AudioContext();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.buf = new Float32Array(this.analyser.fftSize);
      src.connect(this.analyser);
      this.ctx.resume().catch(() => {});
    } catch { /* waveform is a nicety; carry on */ }

    if (!(await this.startScribe())) {
      if (this.stopped) return;
      if (!this.startWebSpeech()) this.cb.onFail('no transcription engine');
    }
  }

  private emit() { if (!this.stopped) this.cb.onText(this.committed, this.partial); }

  private async startScribe(): Promise<boolean> {
    const token = await takeScribeToken();
    if (!token || this.stopped) return false;
    let mod: typeof import('@elevenlabs/client');
    try { mod = await import('@elevenlabs/client'); } catch { return false; }
    if (this.stopped) return false;
    return new Promise<boolean>((resolve) => {
      let settled = false;
      let heard = false;
      const settle = (ok: boolean) => { if (!settled) { settled = true; clearTimeout(timer); resolve(ok); } };
      const { Scribe, RealtimeEvents, CommitStrategy } = mod;
      const conn = Scribe.connect({
        token,
        modelId: 'scribe_v2_realtime',
        commitStrategy: CommitStrategy.VAD,
        vadSilenceThresholdSecs: 0.9,
        languageCode: 'en',
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      this.conn = conn;
      const timer = setTimeout(() => { if (!settled) { try { conn.close(); } catch { /* */ } this.conn = undefined; settle(false); } }, 6000);
      conn.on(RealtimeEvents.SESSION_STARTED, () => {
        this.engine = 'scribe';
        this.cb.onEngine('scribe');
        settle(true);
      });
      conn.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (m) => { heard = true; this.partial = m.text ?? ''; this.emit(); });
      conn.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (m) => { heard = true; this.committed = join(this.committed, m.text ?? ''); this.partial = ''; this.emit(); });
      const lost = () => {
        if (this.stopped) return;
        if (!settled) { this.conn = undefined; return settle(false); }
        // dropped mid-demo: keep what we have and carry on with the browser recogniser
        this.conn = undefined;
        this.committed = join(this.committed, this.partial); this.partial = '';
        if (!this.startWebSpeech() && !heard) this.cb.onFail('scribe lost');
      };
      conn.on(RealtimeEvents.ERROR, (e) => { console.warn('[dictation] scribe error', e); try { conn.close(); } catch { /* */ } lost(); });
      conn.on(RealtimeEvents.CLOSE, () => lost());
    });
  }

  private startWebSpeech(): boolean {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || this.stopped) return false;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-CA';
    this.webBase = this.committed;
    rec.onresult = (e: any) => {
      let fin = '', int = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript + ' ';
        else int += r[0].transcript + ' ';
      }
      this.committed = join(this.webBase, fin.trim());
      this.partial = int.trim();
      this.emit();
    };
    rec.onerror = (e: any) => {
      if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture'].includes(e?.error) && !this.text()) { this.stopped || this.cb.onFail(`webspeech: ${e.error}`); }
    };
    rec.onend = () => {
      if (this.stopped) return;
      this.webBase = this.committed; // results reset when the recogniser restarts
      try { rec.start(); } catch { /* already started */ }
    };
    try { rec.start(); } catch { return false; }
    this.rec = rec;
    this.engine = 'webspeech';
    this.cb.onEngine('webspeech');
    return true;
  }

  /** Stop listening and return the full text heard. */
  stop(): string {
    const text = this.text();
    this.stopped = true;
    try { this.conn?.commit(); } catch { /* socket may be closing */ }
    this.dispose();
    return text;
  }

  dispose() {
    this.stopped = true;
    try { this.conn?.close(); } catch { /* */ }
    this.conn = undefined;
    if (this.rec) { this.rec.onend = null; this.rec.onresult = null; this.rec.onerror = null; try { this.rec.abort(); } catch { /* */ } }
    this.rec = undefined;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
    this.ctx?.close().catch(() => {});
    this.ctx = undefined;
    this.analyser = undefined;
  }

  get current() { return this.engine; }
}
