import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './shared34.css';
import { media } from '@/lib/asset';

/**
 * Phone pieces for the AGO pitch slides (section 3) and the divider mosaic.
 *
 * Our GIF mockups (public/media/ago/*.mp4) have an iPhone bezel, Dynamic Island and status bar baked into the
 * pixels. MockPhone shows them whole; on its own, PhoneScreen crops to the app screen (the divider mosaic tiles).
 *
 * Crop, measured on the 590×1248 masters (the 346×734 ones are the same template scaled):
 *   screen x 28…564, y 86…1226  →  536×1140 (status bar and island cut off the top).
 */
export const SCREEN_ASPECT = 536 / 1140;

const url = (src: string) => media(src);

export interface PhoneScreenProps {
  /** relative to /media/, e.g. "source/image22.mp4" */
  src: string;
  mode: 'live' | 'preview';
  /** live mode: play while true (restarts from the top each time it turns on); paused otherwise */
  on?: boolean;
  /** preview mode shows this frame (seconds) instead of playing */
  still?: number;
  rate?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Our own GIF mockups (public/media/ago/*.mp4) shown whole, iPhone bezel and status bar included.
 * The GIFs have a near-black ground outside the bezel, so the stack is clipped to the phone's outline.
 */
export function MockPhone({ width = 350, className = '', style, children, ...screen }: Partial<PhoneScreenProps> & {
  width?: number; className?: string; style?: CSSProperties; children?: ReactNode; mode: 'live' | 'preview';
}) {
  return (
    <div className={`p34-mock ${className}`} style={{ width, ...style }}>
      {children ?? (screen.src ? <PhoneScreen {...(screen as PhoneScreenProps)} /> : null)}
      <div className="p34-sleep" />
    </div>
  );
}

export function PhoneScreen({ src, mode, on = true, still = 2, rate = 1, className = '', style }: PhoneScreenProps) {
  const v = useRef<HTMLVideoElement>(null);
  const live = mode === 'live';
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (live && on) {
      try { el.currentTime = 0; } catch { /* not loaded yet */ }
      el.playbackRate = rate;
      el.play().catch(() => { /* autoplay blocked until first interaction */ });
    } else el.pause();
  }, [live, on, rate]);
  return (
    <div className={`p34-screen ${className}`} style={style}>
      <video
        ref={v}
        src={live ? url(src) : `${url(src)}#t=${still}`}
        muted
        loop
        playsInline
        preload={live ? 'auto' : 'metadata'}
      />
    </div>
  );
}
