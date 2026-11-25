import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './shared34.css';
import { media } from '@/lib/asset';

/**
 * Phone pieces for the AGO pitch slides (section 3) and the divider mosaic.
 *
 * The source GIF mockups (public/media/source/image11/12/18/21/22/23/31/32/34.mp4) have an iPhone bezel,
 * Dynamic Island and status bar baked into the pixels. PhoneScreen crops all of that away and shows only the
 * app screen, so we can put it in our own brand-neutral frame (Device): a dark slab with a pill-and-dot
 * speaker/camera, the ZAK geometry, instead of Apple's hardware.
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

/**
 * Brand-neutral phone. Width sets everything (all inner sizes are in em = width/100).
 * Pass `src` for a single screen, or `children` to stack your own PhoneScreens (crossfades).
 * `.p34-sleep` is a black-glass layer over the screen (opacity 0 by default): animate it to put the phone to sleep/wake it.
 */
export function Device({ width = 280, className = '', style, children, ...screen }: Partial<PhoneScreenProps> & {
  width?: number; className?: string; style?: CSSProperties; children?: ReactNode; mode: 'live' | 'preview';
}) {
  return (
    <div className={`p34-device ${className}`} style={{ ['--dw' as string]: `${width}px`, ...style }}>
      <div className="p34-bezel-top" aria-hidden><i className="p34-cam" /><i className="p34-spk" /></div>
      <div className="p34-glass">
        {children ?? (screen.src ? <PhoneScreen {...(screen as PhoneScreenProps)} /> : null)}
        <div className="p34-sleep" />
        <div className="p34-glare" />
      </div>
    </div>
  );
}
