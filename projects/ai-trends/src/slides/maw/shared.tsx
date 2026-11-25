import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { media } from '@/lib/asset';
import { StepStrip, stripIn } from '../shared34/StepStrip';
import './maw.css';

/**
 * Make-A-Wish step slides (section 4). The motion is ported from the Remotion scenes in maw-video/src/scenes:
 * each scene is authored in its original 1920×1080 coordinates inside .mws-scene, which scales it into the
 * slide's safe area (Remotion content spans x 100–1820, y 170–905 → slide x 140–1780, y 224–924).
 * Remotion frames are 30fps, so a frame value f becomes f / 30 seconds on the beat timeline.
 */
export const f = (frames: number) => frames / 30;
export const mawMedia = (file: string) => media(`maw/${file}`);

export const MAW_STEPS = ['The inputs', 'Clip library', 'Figma', 'Animatic', 'The site'];

export function MawStep({ index, title, className = '', children, after }: {
  index: number; title: string; className?: string; children: ReactNode; after?: ReactNode;
}) {
  return (
    <div className={`mws ${className}`}>
      <div className="mws-kicker p34-kicker label"><i /><b>Make-A-Wish</b> · {String(index + 1).padStart(2, '0')} {title}</div>
      <div className="mws-scene"><div className="mws-push">{children}</div></div>
      {after}
      <StepStrip steps={MAW_STEPS} active={index} />
    </div>
  );
}

/** Beat-0 entry shared by every step: kicker in, the strip's active segment fills. */
export function stepIntro(tl: gsap.core.Timeline, root: HTMLElement) {
  tl.from(gsap.utils.selector(root)('.mws-kicker'), { opacity: 0, x: -16, duration: 0.7 }, 0);
  stripIn(tl, root);
}

/** Remotion's <Push>: a slow scale over the scene. Ambient, so it lives outside the beat timeline. */
export function usePush(root: React.RefObject<HTMLElement | null>, to = 1.035, duration = 8) {
  useEffect(() => {
    const el = root.current?.querySelector('.mws-push');
    if (!el) return;
    const t = gsap.fromTo(el, { scale: 1 }, { scale: to, duration, ease: 'sine.inOut' });
    return () => { t.kill(); };
  }, [root, to, duration]);
}

export function Chip({ children, size = 22, upper = true, className = '', style }: {
  children: ReactNode; size?: number; upper?: boolean; className?: string; style?: CSSProperties;
}) {
  return (
    <span className={`mws-chip ${upper ? '' : 'is-lower'} ${className}`} style={{ fontSize: size, padding: `${size * 0.5}px ${size * 0.7}px`, ...style }}>
      {children}
    </span>
  );
}

export function Terminal({ className = '', style, size = 21, children }: {
  className?: string; style?: CSSProperties; size?: number; children: ReactNode;
}) {
  return (
    <div className={`mws-term ${className}`} style={{ ...style, ['--ts' as string]: `${size}px` }}>
      <div className="mws-term-bar"><i /><i /><i /><span>claude · wishes-are-medicine</span></div>
      <div className="mws-term-body">{children}</div>
    </div>
  );
}

export function BrowserWindow({ url, className = '', style, children }: {
  url: ReactNode; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  return (
    <div className={`mws-win ${className}`} style={style}>
      <div className="mws-win-bar"><i /><i /><i /><span className="mws-win-url">{url}</span></div>
      <div className="mws-win-body">{children}</div>
    </div>
  );
}

/** A screen recording that plays only in live mode, from the top each time `on` turns true. */
export function Recording({ src, mode, on = true, still = 1, className = '' }: {
  src: string; mode: 'live' | 'preview'; on?: boolean; still?: number; className?: string;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const live = mode === 'live';
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    if (live && on) {
      try { el.currentTime = 0; } catch { /* not loaded yet */ }
      el.play().catch(() => {});
    } else el.pause();
  }, [live, on]);
  return (
    <video
      ref={v}
      className={`mws-rec ${className}`}
      src={live ? mawMedia(src) : `${mawMedia(src)}#t=${still}`}
      muted loop playsInline preload={live ? 'auto' : 'metadata'}
    />
  );
}
