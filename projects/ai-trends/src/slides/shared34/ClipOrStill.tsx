import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './shared34.css';
import { media } from '@/lib/asset';

/**
 * A clip slot that never looks unfinished: shows `still` (a generated stand-in) until the clip file exists, then
 * plays the clip over it. When the clip is missing, a small "clip to add" hint shows in preview mode only
 * (presenter view / overview), never on the audience stage.
 */
export function ClipOrStill({ src, still, mode, playing = true, className = '', style, hint = true }: {
  src: string; still?: string; mode: 'live' | 'preview'; playing?: boolean; className?: string; style?: CSSProperties; hint?: boolean;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const [missing, setMissing] = useState(false);
  const url = media(src);
  useEffect(() => {
    const el = v.current;
    if (!el || missing) return;
    if (mode === 'live' && playing) el.play().catch(() => {});
    else el.pause();
  }, [mode, playing, missing]);
  return (
    <div className={`p34-cos ${className}`} style={style}>
      {still && <img src={still} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {!missing && (
        <video
          ref={v} src={url} muted loop playsInline preload={mode === 'live' ? 'auto' : 'metadata'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setMissing(true)}
        />
      )}
      {missing && hint && mode === 'preview' && <span className="p34-cliphint">clip to add: {src}</span>}
    </div>
  );
}
