import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { media } from '@/lib/asset';
import './shared.css';

/** Kicker for Hiep's slides: "Hiep Vu · <project>". */
export function HvKicker({ project }: { project: string }) {
  return <div className="hv-kicker label"><b>Hiep Vu</b><span className="hv-kicker-sep">·</span>{project}</div>;
}

export function HvText({ head, lede }: { head: ReactNode; lede: ReactNode }) {
  return (
    <div className="hv-text">
      <h2 className="hv-head headline">{head}</h2>
      <p className="hv-lede lede">{lede}</p>
    </div>
  );
}

/** Stage chips under the frame. `at` is the index that's lit. */
export function HvStages({ stages, at }: { stages: string[]; at: number }) {
  return (
    <div className="hv-stages">
      {stages.map((s, i) => (
        <span key={s} style={{ display: 'contents' }}>
          {i > 0 && <i className="hv-arrow" />}
          <span className={`hv-chip ${i === at ? 'on' : ''}`}>{s}</span>
        </span>
      ))}
    </div>
  );
}

/** A muted, looping clip that only plays on the live stage (never in presenter view or thumbnails). */
export function HvVideo({ src, mode, playing = true, videoRef, className, muted = true, loop = true, restartOn }: {
  src: string; mode: 'live' | 'preview'; playing?: boolean; videoRef?: RefObject<HTMLVideoElement | null>; className?: string;
  muted?: boolean; loop?: boolean; restartOn?: unknown;
}) {
  const own = useRef<HTMLVideoElement>(null);
  const v = videoRef ?? own;
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (mode === 'live' && playing) el.play().catch(() => {});
    else el.pause();
  }, [mode, playing, v]);
  useEffect(() => {
    if (restartOn !== undefined && v.current) v.current.currentTime = 0;
  }, [restartOn, v]);
  return (
    <video ref={v} className={className} src={media(src)} muted={mode === 'preview' ? true : muted} loop={loop} playsInline
      preload={mode === 'live' ? 'auto' : 'metadata'} />
  );
}
