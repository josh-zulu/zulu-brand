import { useEffect, useRef } from 'react';
import { defineSlide, type SlideProps } from '@/engine/types';
import { SectionDivider } from '@/components/SectionDivider';
import './S4Divider.css';
import { media } from '@/lib/asset';

/**
 * Divider 4. Background: our own work, the Make-A-Wish film loop (maw/film-loop.mp4), at 70% speed, desaturated, with a
 * very slow push-in. Live mode plays it; thumbnails show a still.
 */
function Film({ mode }: Pick<SlideProps, 'mode'>) {
  const v = useRef<HTMLVideoElement>(null);
  const live = mode === 'live';
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    el.playbackRate = 0.7;
    if (live) el.play().catch(() => {}); else el.pause();
  }, [live]);
  return (
    <video
      ref={v}
      className="s4d-film"
      src={live ? media('maw/film-loop.mp4') : media('maw/film-loop.mp4') + '#t=2'}
      muted loop playsInline preload={live ? 'auto' : 'metadata'}
      aria-hidden
    />
  );
}

export default defineSlide({
  id: 's4-divider',
  section: 4,
  title: 'Divider: Work we made',
  chrome: false,
  notes: 'Section 4: work we made.',
  Component: (p) => <SectionDivider {...p} number={4} title="Work we made" background={<Film mode={p.mode} />} />,
});
