import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { useSfx } from '@/lib/sfx';
import {
  type Brief, type Span, type Token, LiveCapture, SCRIPT_BRIEF, SCRIPT_DURATION, SCRIPT_TIMES, SCRIPT_TOKENS,
  localBrief, matchSpans, prefetchScribeToken, requestBrief, tokenize,
} from './S1Dictation.engine';
import './S1Dictation.css';

/**
 * Talk to it like a teammate. The slide is the live demo; the presenter drives it with the clicker.
 *  beat 0  headline + lede; the mic pill waits (silence drawn as a row of dots), a caret blinks.
 *  beat 1  listening: the mic goes live, the waveform answers the room, spoken words fall into a raw transcript.
 *  beat 2  stop and structure: the transcript slides left, a brief opens on the right, a scan strikes the filler,
 *          and the phrases that matter lift out of the ramble and fly into labelled fields, landing as clean copy.
 *  beat 3  the clean brief takes the stage: the transcript leaves and the brief settles into a one-page layout.
 *
 * Live: ElevenLabs Scribe realtime → Web Speech → scripted run (automatic). Preview mode always runs the script.
 * Press D on the audience window to force the scripted run if the room or the network misbehaves.
 */

const SCRIPT_N = SCRIPT_TOKENS.length;
const TOP = 236;           // content top once the demo takes over (beats 2–3)
const BOTTOM = 962;
const PANE_X = 980, PANE_Y = 372, CLIP_H = 556;
const SIDE_X = 1000, COL_W = 780, HALF_W = 380;
const TX_FONT = 34;

type Source = 'script' | 'live';
type BriefFrom = 'claude' | 'offline' | 'script';
type EngineName = 'scribe' | 'webspeech' | 'script' | null;

const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const joinText = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b).trim();

function S1Dictation({ step, direction, mode }: SlideProps) {
  const live = mode === 'live';
  const root = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const sfx = useSfx(['s1-dictation-snap'], live, 0.5);

  // Arriving at beat 2+ (deep link, overview thumbnail, stepping back from the next slide): start structured.
  const startFinal = useRef(step >= 2).current;

  // ── transcript state ───────────────────────────────────────
  const [source, setSource] = useState<Source>('script');
  const [scriptN, setScriptN] = useState(startFinal ? SCRIPT_N : 0);
  const [liveText, setLiveText] = useState({ base: '', committed: '', partial: '' });
  const [engine, setEngine] = useState<EngineName>(startFinal ? 'script' : null);
  const [listening, setListening] = useState(false);
  const [instant, setInstant] = useState(startFinal);
  const [flushFrom, setFlushFrom] = useState<number | null>(null);
  // ── brief state ────────────────────────────────────────────
  const [brief, setBrief] = useState<Brief | null>(startFinal ? SCRIPT_BRIEF : null);
  const [briefFrom, setBriefFrom] = useState<BriefFrom | null>(startFinal ? 'script' : null);
  const [briefKey, setBriefKey] = useState(0);
  const [spans, setSpans] = useState<Span[]>([]);
  const [layoutKey, setLayoutKey] = useState(0);

  // mutable mirrors for callbacks that outlive a render
  const stepRef = useRef(step); stepRef.current = step;
  const dirRef = useRef(direction); dirRef.current = direction;
  const sourceRef = useRef(source); sourceRef.current = source;
  const scriptNRef = useRef(scriptN); scriptNRef.current = scriptN;
  const listeningRef = useRef(listening); listeningRef.current = listening;
  const liveTextRef = useRef(liveText); liveTextRef.current = liveText;
  const captureRef = useRef<LiveCapture | null>(null);
  const briefAbort = useRef<AbortController | null>(null);
  const forceDemo = useRef(false);
  const scriptClock = useRef<{ startedAt: number | null; offset: number }>({ startedAt: null, offset: 0 });
  const listenClock = useRef<{ acc: number; since: number | null }>({ acc: startFinal ? SCRIPT_DURATION * 1000 : 0, since: null });
  const structureAt = useRef(0);
  /** true once the beat-2 content (final transcript + brief or skeleton) is in state, so layout measures the right thing */
  const structured = useRef(startFinal);
  const snapTl = useRef<gsap.core.Timeline | null>(null);
  const snapCall = useRef<gsap.core.Tween | null>(null);
  const snapMode = useRef<'animate' | 'instant'>(startFinal ? 'instant' : 'animate');
  const paneScale = useRef(1);
  const laidOutStep = useRef<number | null>(null);

  // ── tokens on screen ───────────────────────────────────────
  const tokens: Token[] = useMemo(() => {
    if (source === 'script') return SCRIPT_TOKENS.slice(0, scriptN);
    const all = [...tokenize(joinText(liveText.base, liveText.committed)), ...tokenize(liveText.partial, true)];
    spans.forEach((s, g) => {
      for (let i = s.start; i <= s.end && i < all.length; i++) all[i] = { ...all[i], field: s.field, group: 1000 + g };
    });
    return all;
  }, [source, scriptN, liveText, spans]);

  /* ───────────────────────── engine control ───────────────────────── */

  const stopCapture = () => {
    const cap = captureRef.current;
    captureRef.current = null;
    return cap ? cap.stop() : '';
  };
  const abortBrief = () => { briefAbort.current?.abort(); briefAbort.current = null; };
  const killSnap = (revert: boolean) => {
    snapCall.current?.kill(); snapCall.current = null;
    const tl = snapTl.current;
    snapTl.current = null;
    if (tl) { if (revert) tl.revert(); else tl.progress(1); tl.kill(); }
    if (flyRef.current) flyRef.current.innerHTML = '';
  };
  const useScriptBrief = () => { setSpans([]); setBrief(SCRIPT_BRIEF); setBriefFrom('script'); setBriefKey((k) => k + 1); };

  const switchToScript = () => {
    scriptClock.current = { startedAt: null, offset: 0 };
    setSpans([]);
    setLiveText({ base: '', committed: '', partial: '' });
    setScriptN(0);
    setSource('script');
    setEngine('script');
  };

  const startListening = (resume: boolean) => {
    structured.current = false;
    setInstant(false);
    setFlushFrom(null);
    setListening(true);
    if (!live || forceDemo.current) {
      if (sourceRef.current !== 'script') switchToScript();
      setSource('script'); setEngine('script');
      return;
    }
    if (resume && sourceRef.current === 'script') return; // the script just carries on
    const t = liveTextRef.current;
    const base = resume ? joinText(t.base, joinText(t.committed, t.partial)) : '';
    setSource('live');
    setEngine(null);
    setLiveText({ base, committed: '', partial: '' });
    const cap = new LiveCapture({
      onText: (committed, partial) => { if (captureRef.current === cap) setLiveText((x) => ({ ...x, committed, partial })); },
      onEngine: (e) => { if (captureRef.current === cap) setEngine(e); },
      onFail: (reason) => {
        if (captureRef.current !== cap) return;
        console.info('[dictation] live transcription unavailable, using the scripted run:', reason);
        cap.dispose();
        captureRef.current = null;
        switchToScript();
      },
    });
    captureRef.current = cap;
    cap.start();
  };

  const stopAndStructure = () => {
    setListening(false);
    structureAt.current = performance.now();
    snapMode.current = 'animate';
    structured.current = true;
    setLayoutKey((k) => k + 1);
    if (sourceRef.current === 'live') {
      const t = liveTextRef.current;
      const heard = stopCapture() || joinText(t.committed, t.partial);
      const text = joinText(t.base, heard);
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length < 6) { // nothing usable came through: show the scripted run instead
        switchToScript();
        setFlushFrom(0);
        setScriptN(SCRIPT_N);
        useScriptBrief();
        return;
      }
      setLiveText({ base: text, committed: '', partial: '' });
      setSpans([]); setBrief(null); setBriefFrom(null);
      abortBrief();
      const ctrl = new AbortController();
      briefAbort.current = ctrl;
      requestBrief(text, ctrl.signal).then((b) => {
        if (ctrl.signal.aborted) return;
        const result = b ?? localBrief(text);
        setSpans(matchSpans(words, result));
        setBrief(result);
        setBriefFrom(b ? 'claude' : 'offline');
        setBriefKey((k) => k + 1);
      });
    } else {
      if (scriptNRef.current < SCRIPT_N) { setFlushFrom(scriptNRef.current); setScriptN(SCRIPT_N); }
      useScriptBrief();
    }
  };

  const restoreFinal = () => {
    stopCapture();
    setListening(false);
    setInstant(true);
    setFlushFrom(null);
    setSource('script');
    setEngine('script');
    setScriptN(SCRIPT_N);
    listenClock.current = { acc: SCRIPT_DURATION * 1000, since: null };
    snapMode.current = 'instant';
    structured.current = true;
    setLayoutKey((k) => k + 1);
    useScriptBrief();
  };

  const resetAll = () => {
    structured.current = false;
    stopCapture();
    abortBrief();
    killSnap(true);
    setListening(false);
    setInstant(false);
    setFlushFrom(null);
    setSource('script');
    setScriptN(0);
    scriptClock.current = { startedAt: null, offset: 0 };
    listenClock.current = { acc: 0, since: null };
    setLiveText({ base: '', committed: '', partial: '' });
    setSpans([]); setBrief(null); setBriefFrom(null);
    setEngine(null);
  };

  // ── beats drive the demo ───────────────────────────────────
  const prevStep = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevStep.current;
    prevStep.current = step;
    if (prev === null) {
      if (step === 1) startListening(false);
      else if (step >= 2 && !startFinal) restoreFinal();
      return;
    }
    if (step === prev) return;
    if (step === 0) { resetAll(); return; }
    if (step === 1) {
      if (prev === 0) startListening(false);
      else { killSnap(true); abortBrief(); setSpans([]); setBrief(null); setBriefFrom(null); startListening(true); }
      return;
    }
    if (prev === 1) stopAndStructure();
    else if (prev === 0) restoreFinal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // live only: warm up a Scribe token, and D forces the scripted run
  useEffect(() => {
    if (!live) return;
    prefetchScribeToken();
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== 'd' && e.key !== 'D') || e.metaKey || e.ctrlKey || e.altKey) return;
      forceDemo.current = !forceDemo.current;
      console.info(`[dictation] scripted run ${forceDemo.current ? 'forced' : 'released'}`);
      if (forceDemo.current && sourceRef.current === 'live' && stepRef.current === 1) { stopCapture(); switchToScript(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  // release mic, sockets, audio and requests when the slide goes away
  useEffect(() => () => {
    captureRef.current?.dispose();
    captureRef.current = null;
    briefAbort.current?.abort();
    snapCall.current?.kill();
    snapTl.current?.kill();
  }, []);

  // scripted feed: words arrive on their schedule while "listening"
  useEffect(() => {
    if (!(listening && source === 'script')) return;
    const clock = scriptClock.current;
    clock.startedAt = performance.now();
    const tick = () => {
      const t = clock.offset + (performance.now() - (clock.startedAt ?? performance.now())) / 1000;
      let n = scriptNRef.current;
      while (n < SCRIPT_N && SCRIPT_TIMES[n] <= t) n++;
      if (n !== scriptNRef.current) { scriptNRef.current = n; setScriptN(n); }
    };
    const id = setInterval(tick, 40);
    return () => {
      clearInterval(id);
      if (clock.startedAt !== null) clock.offset += (performance.now() - clock.startedAt) / 1000;
      clock.startedAt = null;
    };
  }, [listening, source]);

  // listening clock for the timer
  useEffect(() => {
    const c = listenClock.current;
    if (listening) c.since = performance.now();
    else if (c.since !== null) { c.acc += performance.now() - c.since; c.since = null; }
  }, [listening]);

  /** 0..1 loudness: the real mic when live, a speech-shaped envelope from the script otherwise. */
  const getLevel = useRef<() => number>(() => 0);
  getLevel.current = () => {
    if (!listeningRef.current) return 0;
    if (sourceRef.current === 'live') return captureRef.current?.level() ?? 0;
    const clock = scriptClock.current;
    if (clock.startedAt === null) return 0;
    const t = clock.offset + (performance.now() - clock.startedAt) / 1000;
    const n = scriptNRef.current;
    if (n >= SCRIPT_N && t > SCRIPT_DURATION) return 0;
    const last = n > 0 ? SCRIPT_TIMES[n - 1] : -10;
    const next = SCRIPT_TIMES[n] ?? Infinity;
    const since = t - last;
    if (since < 0) return 0; // script already complete (restored state): silence
    const voiced = since < Math.min(next - last, 0.34) ? 1 : Math.max(0, 1 - (since - 0.34) * 5);
    const syll = 0.5 + 0.5 * Math.abs(Math.sin(t * Math.PI * 8.6 + n * 1.7));
    const grit = 0.75 + 0.25 * Math.sin(t * 37.3 + n);
    return Math.min(1, voiced * syll * grit * 0.95);
  };
  const getElapsed = () => listenClock.current.acc + (listenClock.current.since !== null ? performance.now() - listenClock.current.since : 0);

  /* ───────────────────────── beats: the static choreography ───────────────────────── */

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    // beat 0
    tl.from(q('.dx-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.dx-headline')[0], {}, 0.05);
    revealWords(tl, q('.dx-lede')[0], {}, 0.45);
    tl.from(q('.dx-mic'), { y: 50, opacity: 0, duration: 1.2 }, 0.3);
    tl.from(q('.dx-txwrap'), { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.6);
    tl.addLabel('b1');
    // beat 1: the mic goes live
    tl.to(q('.dx-mic-btn'), { backgroundColor: '#00e482', color: '#161515', duration: 0.35, ease: 'power2.out' });
    tl.to(q('.dx-mic'), { boxShadow: 'inset 0 6px 14px rgba(0,0,0,.75), inset 0 -1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(0,228,130,.35)', duration: 0.4 }, '<');
    tl.to(q('.dx-state-ready'), { yPercent: -100, opacity: 0, duration: 0.3, ease: 'power2.in' }, '<');
    tl.fromTo(q('.dx-state-live'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '<0.1');
    tl.addLabel('b2');
    // beat 2: the demo takes the stage
    tl.to(q('.dx-left'), { x: -90, opacity: 0, duration: 0.6, ease: 'power2.in' });
    tl.to(q('.dx-mic'), { y: -36, opacity: 0, duration: 0.5, ease: 'power2.in' }, '<');
    tl.fromTo(q('.dx-compact'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, '-=0.15');
    tl.addLabel('b3');
    tl.to(q('.dx-compact'), { opacity: 1, duration: 0.6 });
  });

  /* ───────────────────────── layout: pane + brief blocks ───────────────────────── */

  const move = (el: Element | undefined, vars: gsap.TweenVars, animate: boolean) => {
    if (!el) return;
    if (animate) gsap.to(el, { ...vars, overwrite: true });
    else {
      const { duration: _d, delay: _dl, ease: _e, ...rest } = vars;
      gsap.set(el, { ...rest, overwrite: true });
    }
  };

  const layoutPane = (s: number, animate: boolean) => {
    const q = gsap.utils.selector(root);
    const pane = q('.dx-tx')[0] as HTMLElement, clip = q('.dx-tx-clip')[0] as HTMLElement, body = q('.dx-tx-body')[0] as HTMLElement, head = q('.dx-tx-head')[0] as HTMLElement;
    if (!pane) return;
    const bodyH = body.offsetHeight;
    if (s <= 1) {
      paneScale.current = 1;
      move(pane, { x: PANE_X, y: PANE_Y, scale: 1, opacity: 1, duration: 0.9, ease: 'power3.inOut' }, animate);
      move(clip, { height: CLIP_H, duration: 0.7, ease: 'power3.inOut' }, animate);
      const over = Math.max(0, bodyH - CLIP_H + 12);
      clip.classList.toggle('is-scrolled', over > 0);
      move(body, { y: -over, duration: 0.5, ease: 'power3.out' }, animate);
    } else {
      const headH = head.offsetHeight + 16;
      const sc = Math.min(0.82, (BOTTOM - TOP) / (headH + bodyH + 10));
      paneScale.current = sc;
      clip.classList.remove('is-scrolled');
      move(pane, { x: s >= 3 ? 40 : 140, y: TOP, scale: sc, opacity: s >= 3 ? 0 : 1, duration: s >= 3 ? 0.7 : 1, ease: s >= 3 ? 'power2.in' : 'power3.inOut' }, animate);
      move(clip, { height: bodyH + 10, duration: 0.9, ease: 'power3.inOut' }, animate);
      move(body, { y: 0, duration: 0.9, ease: 'power3.inOut' }, animate);
    }
  };

  const layoutBrief = (s: number, animate: boolean, entering: boolean) => {
    const q = gsap.utils.selector(root);
    const b: Record<string, HTMLElement> = {};
    q('.dx-b').forEach((el) => { b[(el as HTMLElement).dataset.b!] = el as HTMLElement; });
    if (!b.head) return;
    const h = (k: string) => b[k].offsetHeight;
    const pos: Record<string, { x: number; y: number; scale?: number; width?: number }> = {};
    if (s < 3) {
      let y = TOP;
      const G = 18;
      pos.head = { x: SIDE_X, y, width: COL_W }; y += h('head') + 14;
      pos.title = { x: SIDE_X, y, scale: 1 }; y += h('title') + G;
      pos.objective = { x: SIDE_X, y }; y += h('objective') + G;
      pos.audience = { x: SIDE_X, y }; y += h('audience') + G;
      pos.deliv = { x: SIDE_X, y }; y += h('deliv') + G;
      pos.tone = { x: SIDE_X, y }; pos.timing = { x: SIDE_X + HALF_W + 20, y }; y += Math.max(h('tone'), h('timing')) + G;
      pos.questions = { x: SIDE_X, y };
    } else {
      const G = 34, TS = 1.3;
      const headH = h('head'), titleH = h('title') * TS;
      const leftH = h('objective') + G + h('audience');
      const rightH = h('deliv') + G + Math.max(h('tone'), h('timing')) + G + h('questions');
      const total = headH + 18 + titleH + 46 + Math.max(leftH, rightH);
      const y0 = TOP + Math.max(0, (BOTTOM - TOP - total) * 0.45);
      pos.head = { x: 140, y: y0, width: 1640 };
      pos.title = { x: 140, y: y0 + headH + 18, scale: TS };
      const cy = y0 + headH + 18 + titleH + 46;
      pos.objective = { x: 140, y: cy };
      pos.audience = { x: 140, y: cy + h('objective') + G };
      pos.deliv = { x: SIDE_X, y: cy };
      const ty = cy + h('deliv') + G;
      pos.tone = { x: SIDE_X, y: ty };
      pos.timing = { x: SIDE_X + HALF_W + 20, y: ty };
      pos.questions = { x: SIDE_X, y: ty + Math.max(h('tone'), h('timing')) + G };
    }
    Object.keys(pos).forEach((k, i) => {
      const p = pos[k];
      const wv = p.width ? { width: p.width } : {};
      if (s < 2) move(b[k], { ...wv, x: p.x, y: p.y + 26, scale: p.scale ?? 1, opacity: 0, duration: 0.35, ease: 'power2.in' }, animate);
      else if (entering) move(b[k], { ...wv, x: p.x, y: p.y, scale: p.scale ?? 1, opacity: 1, duration: 0.9, delay: 0.38 + i * 0.05, ease: 'expo.out' }, animate);
      else move(b[k], { ...wv, x: p.x, y: p.y, scale: p.scale ?? 1, opacity: 1, duration: 1.05, delay: i * 0.03, ease: 'power3.inOut' }, animate);
    });
  };

  /* ───────────────────────── the snap: ramble → brief ───────────────────────── */

  const buildSnap = () => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const box = el.getBoundingClientRect();
    const k = box.width / 1920 || 1;
    const rel = (n: Element) => { const r = n.getBoundingClientRect(); return { x: (r.left - box.left) / k, y: (r.top - box.top) / k, w: r.width / k, h: r.height / k }; };
    const fly = flyRef.current!;
    fly.innerHTML = '';
    const tl = gsap.timeline({ onComplete: () => { fly.innerHTML = ''; } });
    const ps = paneScale.current;
    const clip = q('.dx-tx-clip')[0] as HTMLElement;
    const cb = rel(clip);
    const words = q('.dx-w') as HTMLElement[];

    // 1 · the scan: a beam reads the ramble top to bottom, striking filler and lighting what matters
    const SCAN = 1.0;
    const beam = q('.dx-beam')[0];
    tl.fromTo(beam, { y: 0, opacity: 1 }, { y: clip.offsetHeight, duration: SCAN, ease: 'power1.inOut', immediateRender: false }, 0);
    tl.to(beam, { opacity: 0, duration: 0.2 }, SCAN - 0.1);
    const at = (w: Element) => Math.max(0, Math.min(1, (rel(w).y - cb.y) / Math.max(1, cb.h))) * SCAN;
    words.forEach((w) => {
      if (w.classList.contains('is-filler')) tl.to(w, { opacity: 0.26, backgroundSize: '100% 2px', duration: 0.3, ease: 'power2.out' }, at(w));
      else if (w.dataset.g !== undefined) tl.to(w, { color: '#f8f7f4', backgroundColor: 'rgba(0, 228, 130, 0.22)', duration: 0.25 }, at(w));
      else tl.to(w, { opacity: 0.42, duration: 0.4 }, at(w));
    });

    // 2 · the flights: each phrase lifts out and lands in its field as clean copy
    const groups = new Map<string, HTMLElement[]>();
    words.forEach((w) => { const g = w.dataset.g; if (g !== undefined) { if (!groups.has(g)) groups.set(g, []); groups.get(g)!.push(w); } });
    const revealed = new Set<Element>();
    const reveal = (target: Element, t: number) => {
      if (revealed.has(target)) return;
      revealed.add(target);
      tl.fromTo(target, { opacity: 0, filter: 'blur(10px)', y: 8 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, t);
      const sk = target.closest('.dx-vwrap')?.querySelector('.dx-skel');
      if (sk && !revealed.has(sk)) { revealed.add(sk); tl.to(sk, { opacity: 0, duration: 0.3 }, t - 0.05); }
    };
    const FLY0 = SCAN + 0.15;
    let i = 0;
    let lastLand = FLY0 + 0.4;
    groups.forEach((els) => {
      const field = els[0].dataset.f;
      const target = field ? q(`.dx-val[data-field="${field}"]`)[0] : undefined;
      if (!target) return;
      const s = rel(els[0]);
      if (s.y < cb.y - 4 || s.y > cb.y + cb.h) return; // scrolled out of view: just reveal
      const tb = rel(target);
      const clone = document.createElement('div');
      clone.className = 'dx-clone';
      clone.textContent = els.map((e) => e.textContent).join(' ').replace(/[,.?!;:]+$/, '');
      clone.style.fontSize = `${TX_FONT * ps}px`;
      fly.appendChild(clone);
      const t0 = FLY0 + i * 0.14;
      gsap.set(clone, { x: s.x, y: s.y, opacity: 0 });
      tl.to(clone, { opacity: 1, duration: 0.16 }, t0);
      tl.to(els, { opacity: 0.32, backgroundColor: 'rgba(0, 228, 130, 0)', duration: 0.45 }, t0 + 0.08);
      const mid = { x: (s.x + tb.x) / 2, y: Math.min(s.y, tb.y) - 60 - (i % 3) * 22 };
      tl.to(clone, { motionPath: { path: [{ x: s.x, y: s.y }, mid, { x: tb.x, y: tb.y }], curviness: 1.15 }, duration: 0.95, ease: 'power3.inOut' }, t0);
      tl.to(clone, { opacity: 0, filter: 'blur(6px)', duration: 0.3, ease: 'power1.in' }, t0 + 0.8);
      reveal(target, t0 + 0.76);
      lastLand = Math.max(lastLand, t0 + 1.0);
      i++;
    });
    if (i > 0) tl.call(() => { if (dirRef.current > 0) sfx.play('s1-dictation-snap'); }, undefined, FLY0 + 0.75);

    // 3 · anything that had no phrase to come from fills in after
    q('.dx-val').forEach((v, j) => reveal(v, lastLand - 0.25 + j * 0.05));
    const end = tl.duration() + 0.05;
    tl.to(q('.dx-chip-a'), { yPercent: -100, opacity: 0, duration: 0.3, ease: 'power2.in' }, end);
    tl.fromTo(q('.dx-chip-b'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out', immediateRender: false }, end + 0.08);
    tl.to(q('.dx-chip'), { color: '#00e482', borderColor: 'rgba(0, 228, 130, 0.45)', duration: 0.4 }, end);
    tl.to(q('.dx-chip-dot'), { backgroundColor: '#00e482', duration: 0.3 }, end);
    if (import.meta.env.DEV) (window as any).__dxSnap = tl;
    return tl;
  };

  // pane + brief layout follows the beat (and re-flows when content changes)
  useLayoutEffect(() => {
    if (step >= 2 && !structured.current) return; // the structured content renders next pass
    const prevLaid = laidOutStep.current;
    const first = prevLaid === null;
    const changed = prevLaid !== step;
    laidOutStep.current = step;
    const animate = !first && changed && !instant;
    if (changed && step >= 3 && snapTl.current) snapTl.current.progress(1);
    layoutPane(step, animate);
    layoutBrief(step, animate || (!first && !changed && step >= 2), changed && !first && step >= 2 && (prevLaid ?? 0) < 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, briefKey, brief === null, instant, layoutKey]);

  // keep the newest words in view while listening
  useEffect(() => {
    if (step <= 1) layoutPane(step, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.length]);

  // once the brief exists and the layout has settled, run (or jump to the end of) the snap
  useLayoutEffect(() => {
    if (step < 2 || !brief || snapTl.current || snapCall.current) return;
    const go = () => {
      snapCall.current = null;
      const tl = buildSnap();
      snapTl.current = tl;
      if (snapMode.current === 'instant' || stepRef.current >= 3) { tl.progress(1); if (flyRef.current) flyRef.current.innerHTML = ''; }
    };
    if (snapMode.current === 'instant' || step >= 3) { go(); return; }
    const wait = Math.max(0.45, 1.45 - (performance.now() - structureAt.current) / 1000);
    snapCall.current = gsap.delayedCall(wait, go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, briefKey, brief]);

  /* ───────────────────────── render ───────────────────────── */

  const engineLabel =
    engine === 'scribe' ? 'Live · ElevenLabs Scribe'
      : engine === 'webspeech' ? 'Live · browser speech'
        : engine === 'script' ? (live ? 'Offline demo' : 'Preview · scripted run')
          : listening ? 'Connecting…' : '';
  const wordCount = tokens.length;
  const b = brief;
  const deliverables = b ? b.deliverables : [];
  const questions = b ? b.open_questions : [];
  const scanning = step >= 2 && !brief;

  return (
    <div ref={root} className={`dx ${listening ? 'is-listening' : ''}`}>
      <div className="dx-kicker label"><b>How we work with it now</b><span className="dx-kicker-sep">·</span>02</div>
      <div className="dx-left">
        <h2 className="dx-headline headline">Talk to it like a teammate.</h2>
        <p className="dx-lede lede">Say the brief out loud. AI turns the ramble into a clear, structured request.</p>
      </div>
      <div className="dx-compact">Talk to it like a teammate.</div>

      {/* the mic */}
      <div className="dx-mic">
        <div className="dx-mic-btn">
          <span className="dx-pulse" />
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden>
            <rect x="8.5" y="2.5" width="7" height="12.5" rx="3.5" fill="currentColor" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </div>
        <Waveform getLevel={getLevel} getElapsed={getElapsed} timerRef={timerRef} active={listening} />
        <div className="dx-mic-meta">
          <span className="dx-mic-state label"><span className="dx-state-ready">Ready</span><span className="dx-state-live">Listening</span></span>
          <span ref={timerRef} className="dx-timer mono">00:00</span>
        </div>
      </div>

      {/* the transcript */}
      <div className="dx-txwrap">
        <div className={`dx-tx ${scanning ? 'is-scanning' : ''}`}>
          <div className="dx-tx-head">
            <span className="label">Transcript{wordCount ? <span className="dx-count"> · {wordCount} words</span> : null}</span>
            <span className="label dx-engine">{engineLabel}</span>
          </div>
          <div className="dx-tx-clip">
            <div className={`dx-tx-body ${instant ? 'is-instant' : ''}`}>
              {tokens.map((t, i) => (
                <Fragment key={i}>
                  <span
                    className={`dx-w${t.filler ? ' is-filler' : ''}${t.partial ? ' is-partial' : ''}${listening && i === tokens.length - 1 ? ' is-last' : ''}`}
                    data-g={t.group}
                    data-f={t.field}
                    style={flushFrom !== null && i >= flushFrom ? { animationDelay: `${(i - flushFrom) * 10}ms` } : undefined}
                  >{t.text}</span>{' '}
                </Fragment>
              ))}
              {step <= 1 && <span className="caret blink dx-caret" />}
            </div>
            <div className="dx-beam" />
          </div>
        </div>
      </div>

      {/* the brief */}
      <div className="dx-brief" data-key={briefKey}>
        <div className="dx-b dx-b-head" data-b="head">
          <span className="label dx-b-name">Brief</span>
          {briefFrom === 'claude' && <span className="label dx-src">Claude</span>}
          {briefFrom === 'offline' && <span className="label dx-src is-offline">Offline</span>}
          <span className="dx-chip label"><i className="dx-chip-dot" /><span className="dx-chip-txt"><span className="dx-chip-a">Structuring</span><span className="dx-chip-b">Ready</span></span></span>
        </div>
        <div className="dx-b dx-b-title" data-b="title">
          <div className="dx-vwrap">
            <h3 className="dx-title display dx-val" data-field="title">{b ? b.title : ' '}</h3>
            <Skel bars={[0.62]} tall />
          </div>
        </div>
        <Field k="objective" label="Objective" value={b?.objective} />
        <Field k="audience" label="Audience" value={b?.audience} />
        <div className="dx-b dx-b-deliv" data-b="deliv">
          <div className="label dx-flabel">Deliverables</div>
          <div className="dx-vwrap dx-chips">
            {deliverables.length
              ? deliverables.map((d, i) => <span key={i} className="dx-dchip dx-val" data-field={`deliv-${i}`}>{d}</span>)
              : <span className="dx-dchip dx-val">{' '}</span>}
            <span className="dx-skel dx-skel-chips"><i /><i /><i /></span>
          </div>
        </div>
        <Field k="tone" label="Tone" value={b?.tone} half />
        <Field k="timing" label="Timing" value={b?.timing} half />
        <div className="dx-b dx-b-qs" data-b="questions">
          <div className="label dx-flabel">Open questions</div>
          <div className="dx-vwrap">
            <ul className="dx-qs">
              {(questions.length ? questions : [' ', ' ']).map((qq, i) => (
                <li key={i} className="dx-val" data-field={questions.length ? `q-${i}` : undefined}><i />{qq}</li>
              ))}
            </ul>
            <Skel bars={[0.5, 0.4]} />
          </div>
        </div>
      </div>

      <div ref={flyRef} className="dx-fly" aria-hidden />
    </div>
  );
}

function Field({ k, label, value, half }: { k: string; label: string; value?: string; half?: boolean }) {
  return (
    <div className={`dx-b dx-field ${half ? 'is-half' : ''}`} data-b={k}>
      <div className="label dx-flabel">{label}</div>
      <div className="dx-vwrap">
        <p className="dx-fval dx-val" data-field={k}>{value ?? '  '}</p>
        <Skel bars={half ? [0.8, 0.5] : [0.95, 0.6]} />
      </div>
    </div>
  );
}

function Skel({ bars, tall }: { bars: number[]; tall?: boolean }) {
  return (
    <span className={`dx-skel ${tall ? 'is-tall' : ''}`} aria-hidden>
      {bars.map((w, i) => <i key={i} style={{ width: `${w * 100}%` }} />)}
    </span>
  );
}

/** Rolling level meter: silence is a row of dots, speech stretches them into pills (the ZAK mark's geometry). */
function Waveform({ getLevel, getElapsed, timerRef, active }: {
  getLevel: React.RefObject<() => number>; getElapsed: () => number; timerRef: React.RefObject<HTMLSpanElement | null>; active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const elapsedRef = useRef(getElapsed);
  elapsedRef.current = getElapsed;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = 480, H = 80, N = 41, DPR = 2;
    c.width = W * DPR; c.height = H * DPR;
    ctx.scale(DPR, DPR);
    const hist = new Array(N).fill(0);
    let smooth = 0, last = 0, raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 50) return;
      last = now;
      const lvl = getLevel.current?.() ?? 0;
      smooth = smooth * 0.3 + lvl * 0.7;
      hist.shift(); hist.push(smooth);
      if (timerRef.current) timerRef.current.textContent = fmt(elapsedRef.current());
      ctx.clearRect(0, 0, W, H);
      const pitch = W / N, bw = 6;
      const on = activeRef.current;
      for (let i = 0; i < N; i++) {
        const a = hist[i];
        const h = Math.max(bw, a * (H - 4));
        const x = i * pitch + (pitch - bw) / 2, y = (H - h) / 2;
        ctx.fillStyle = on ? `rgba(0, 228, 130, ${0.28 + 0.72 * (i / (N - 1))})` : 'rgba(248, 247, 244, 0.22)';
        ctx.beginPath();
        ctx.roundRect(x, y, bw, h, bw / 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [getLevel, timerRef]);

  return <canvas ref={canvas} className="dx-wave" aria-hidden />;
}

export default defineSlide({
  id: 's1-dictation',
  section: 1,
  title: 'Dictation (live demo)',
  steps: 3,
  notes:
    'Live demo. Click 1: start talking, say a messy brief out loud. Click 2: stop, watch it structure. Click 3: the clean brief.\n' +
    'If the transcript corner reads "Offline demo", there is no mic or network: a recorded brief plays instead, so narrate over it. Press D on the audience screen to force that run.\n' +
    "We speak about three times faster than we type, and we say more. Agents run on context, and talking is the fastest way to give it. It's the easiest habit in the deck to start tomorrow.",
  Component: S1Dictation,
});
