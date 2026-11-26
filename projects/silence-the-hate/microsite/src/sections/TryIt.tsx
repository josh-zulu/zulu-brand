import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { EqBars, type EqHandle } from '../components/EqBars';
import { Draft, Label } from '../components/Marks';
import { gsap, prefersReducedMotion, SPECTRUM } from '../lib/motion';

const TRACK_SECONDS = 4.5;

/** Ask the Words Matter pager to open a given card (the skip demo's "Why was it flagged?" link). */
export function showWordsCard(i: number) {
  dispatchEvent(new CustomEvent('sth:words-card', { detail: i }));
}

type Ghost = { id: number; title: string };

/**
 * Interactive 1: the skip. A mock player runs through a playlist of invented songs. With the plugin ON,
 * a flagged track never gets a beat: the next song starts at once and the skipped one drops away, struck out.
 * With it OFF, the flagged song plays and the player says so. Motion idea: the skip is instant; only the
 * evidence of it moves.
 */
export function TryIt() {
  const { t } = useI18n();
  const tracks = t.tryIt.tracks;
  const root = useRef<HTMLElement>(null);
  const eq = useRef<EqHandle>(null);
  const bar = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [on, setOn] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [skips, setSkips] = useState(0);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [lastSkipped, setLastSkipped] = useState<number | null>(null);
  const [live, setLive] = useState('');
  const started = useRef(false);
  const ghostId = useRef(0);

  // Move to the track after `from`, skipping flagged tracks while the plugin is on.
  const advance = useCallback((from: number) => {
    let next = (from + 1) % tracks.length;
    if (on && tracks[next].flagged) {
      const skipped = next;
      next = (next + 1) % tracks.length;
      setSkips((s) => s + 1);
      setLastSkipped(skipped);
      setGhosts((g) => [...g.slice(-2), { id: ++ghostId.current, title: tracks[skipped].title }]);
      setLive(t.tryIt.skippedLive(tracks[skipped].title));
    }
    setIndex(next);
  }, [on, tracks, t]);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // Each track: progress bar runs, then advance.
  useEffect(() => {
    tween.current?.kill();
    if (!bar.current) return;
    gsap.set(bar.current, { scaleX: 0 });
    tween.current = gsap.to(bar.current, {
      scaleX: 1, duration: TRACK_SECONDS, ease: 'none', paused: !playing,
      onComplete: () => advanceRef.current(index),
    });
    return () => { tween.current?.kill(); };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tween.current) return;
    if (playing) tween.current.play(); else tween.current.pause();
    if (eq.current) gsap.to(eq.current.state, { energy: playing ? 1 : 0, duration: 0.4 });
  }, [playing]);

  // Flagged song playing with the plugin off: the bars lose their colour.
  const flaggedNow = tracks[index].flagged;
  useEffect(() => {
    if (eq.current) gsap.to(eq.current.state, { sat: flaggedNow && !on ? 0 : 1, duration: 0.5 });
  }, [flaggedNow, on]);

  // Switching ON while a flagged song plays skips it straight away.
  useEffect(() => {
    if (on && tracks[index].flagged) {
      setSkips((s) => s + 1);
      setLastSkipped(index);
      setGhosts((g) => [...g.slice(-2), { id: ++ghostId.current, title: tracks[index].title }]);
      setLive(t.tryIt.skippedLive(tracks[index].title));
      setIndex((index + 1) % tracks.length);
    }
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start playing when the player scrolls into view (unless the visitor prefers less motion: then it waits for Play).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) { started.current = true; setPlaying(true); }
    }, { threshold: 0.5 });
    io.observe(root.current!.querySelector('.player')!);
    return () => io.disconnect();
  }, []);

  // Ghost of the skipped track: struck through, then drops away.
  const ghostRef = useCallback((el: HTMLLIElement | null) => {
    if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    if (prefersReducedMotion()) { gsap.to(el, { autoAlpha: 0, delay: 2.5, duration: 0.3 }); return; }
    gsap.timeline()
      .fromTo(el, { autoAlpha: 1, y: 0 }, { y: 0, duration: 0 })
      .fromTo(el.querySelector('.ghost__strike'), { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power2.out' })
      .to(el, { y: 70, rotate: 4, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, '+=0.5');
  }, []);

  const track = tracks[index];
  const upNext = [1, 2, 3].map((k) => (index + k) % tracks.length);
  const art = (i: number) => `linear-gradient(135deg, ${SPECTRUM[(i * 2) % SPECTRUM.length]}, ${SPECTRUM[(i * 2 + 5) % SPECTRUM.length]})`;
  const why = lastSkipped !== null ? tracks[lastSkipped] : null;

  return (
    <section className="try" id="try" ref={root} aria-labelledby="try-title">
      <div className="try__text">
        <Label>{t.tryIt.label}</Label>
        <h2 id="try-title" className="h2">{t.tryIt.title} <Draft /></h2>
        <p className="lede">{t.tryIt.body}</p>
        <p className="note">{t.tryIt.demoNote} <Draft kind="sample" /></p>
      </div>

      <div className={`player ${on ? 'is-on' : 'is-off'} ${flaggedNow && !on ? 'is-flagged' : ''}`}>
        <div className="player__head">
          <EqBars ref={eq} bars={9} anchor="down" className="player__mark" energy={0} />
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={t.tryIt.toggleLabel}
            className={`toggle ${on ? 'toggle--on' : ''}`}
            onClick={() => setOn((v) => !v)}
          >
            <span className="toggle__track" aria-hidden="true">
              <span className="toggle__text">{on ? t.tryIt.toggleOn : t.tryIt.toggleOff}</span>
              <span className="toggle__knob" />
            </span>
          </button>
        </div>
        <p className="player__status" aria-live="polite">{on ? t.tryIt.statusOn : t.tryIt.statusOff}</p>

        <div className="player__now">
          <span className="player__art" style={{ background: art(index) }} />
          <div className="player__meta">
            <p className="player__kicker">{t.tryIt.nowPlaying}</p>
            <p className="player__title">{track.title}</p>
            <p className="player__artist">{track.artist}</p>
          </div>
          <button type="button" className="player__play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t.tryIt.pause : t.tryIt.play}>
            {playing
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>}
          </button>
          <ul className="player__ghosts" aria-hidden="true">
            {ghosts.map((g) => (
              <li key={g.id} ref={ghostRef} className="ghost">
                <span className="ghost__label">{t.tryIt.skipped}</span>
                <span className="ghost__title">{g.title}<span className="ghost__strike" /></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="player__progress"><div ref={bar} className="player__bar" /></div>
        {flaggedNow && !on && <p className="player__warn" role="status">{t.tryIt.playingFlagged}</p>}

        <p className="player__kicker player__kicker--next">{t.tryIt.upNext}</p>
        <ol className="player__queue">
          {upNext.map((i) => (
            <li key={i} className={tracks[i].flagged ? 'is-flagged' : ''}>
              <span className="player__art player__art--s" style={{ background: art(i) }} />
              <span className="player__q-title">{tracks[i].title}</span>
              <span className="player__q-artist">{tracks[i].artist}</span>
              {tracks[i].flagged && on && <span className="player__q-skip">{t.tryIt.willSkip}</span>}
            </li>
          ))}
        </ol>

        <div className="player__foot">
          <p className="player__skips"><span className="player__skips-n">{skips}</span> {t.tryIt.skipsThisSession}</p>
          {why && 'guideline' in why && typeof why.guideline === 'number' && (
            <a className="player__why" href="#learn" onClick={() => showWordsCard(why.guideline as number)}>{t.tryIt.whyFlagged} →</a>
          )}
        </div>
        <p className="sr-only" aria-live="assertive">{live}</p>
      </div>
    </section>
  );
}
