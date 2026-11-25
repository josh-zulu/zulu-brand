import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { media } from '@/lib/asset';

/**
 * A slot for a screen recording or demo clip. Files live in public/media/<src> (clips are gitignored; share them via OneDrive).
 * - live mode: autoplays muted, loops by default. Press the speaker button (or set `sound`) for audio.
 * - preview mode (presenter/overview): shows the first frame, never plays sound.
 * - missing file: a designed placeholder that names the file and duration, so the deck always runs.
 *
 * `header` lets a slide wrap the clip in tool chrome (a Blender viewport bar, a Figma toolbar…).
 * `variant="window"` gives a generic app window with traffic lights and a title.
 */
export interface ClipFrameProps {
  src: string;               // relative to /media/, e.g. "clips/blender-connector.mp4"
  label?: string;            // shown in placeholder; defaults to the filename
  duration?: string;         // "45s"
  mode: 'live' | 'preview';
  playing?: boolean;         // default true in live mode
  loop?: boolean;
  sound?: boolean;
  fit?: 'cover' | 'contain';
  variant?: 'plain' | 'window';
  title?: string;            // window title
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
  onEnded?: () => void;
}

export const ClipFrame = forwardRef<HTMLDivElement, ClipFrameProps>(function ClipFrame(
  { src, label, duration, mode, playing = true, loop = true, sound = false, fit = 'cover', variant = 'plain', title, header, footer, className = '', style, poster, onEnded },
  ref,
) {
  const video = useRef<HTMLVideoElement>(null);
  const [missing, setMissing] = useState(false);
  const [muted, setMuted] = useState(!sound);
  const url = media(src);

  useEffect(() => {
    const v = video.current;
    if (!v || missing) return;
    if (mode === 'live' && playing) v.play().catch(() => { /* autoplay blocked until first interaction */ });
    else v.pause();
  }, [mode, playing, missing]);

  const name = label ?? src.split('/').pop();
  return (
    <div ref={ref} className={`clip-frame variant-${variant} ${className}`} style={style}>
      {variant === 'window' && (
        <div className="clip-window-bar">
          <span className="dots"><i /><i /><i /></span>
          <span className="clip-window-title">{title ?? name}</span>
        </div>
      )}
      {header}
      <div className="clip-body">
        {missing ? (
          <div className="clip-placeholder">
            <div className="clip-ph-scan" />
            <div className="clip-ph-inner">
              <span className="label">Clip</span>
              <span className="clip-ph-name">{name}</span>
              {duration && <span className="label clip-ph-dur">{duration}</span>}
              <span className="clip-ph-hint">Drop the file into public/media/{src.includes('/') ? src.slice(0, src.lastIndexOf('/') + 1) : ''}</span>
            </div>
          </div>
        ) : (
          <video
            ref={video}
            src={url}
            poster={poster}
            muted={mode === 'preview' ? true : muted}
            loop={loop}
            playsInline
            preload={mode === 'live' ? 'auto' : 'metadata'}
            style={{ objectFit: fit }}
            onError={() => setMissing(true)}
            onEnded={onEnded}
          />
        )}
        {!missing && mode === 'live' && (
          <button className="clip-sound" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        )}
      </div>
      {footer}
    </div>
  );
});
