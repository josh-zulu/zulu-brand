import { useEffect, useMemo } from 'react';
import { media } from '@/lib/asset';

/**
 * Tiny sound-effect player for slides. Files live in public/media/sfx/<name>.mp3 (make them with
 * `npm run eleven -- sfx "…" --out public/media/sfx/<name>.mp3`). Silent in preview mode and when muted
 * with the `M` key (persisted), and it never throws if a file is missing or autoplay is blocked.
 */
const MUTE_KEY = 'zak-deck-muted';
export const isMuted = () => localStorage.getItem(MUTE_KEY) === '1';

if (typeof window !== 'undefined') {
  addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !(e.target as HTMLElement)?.closest?.('input,textarea,[contenteditable]')) {
      localStorage.setItem(MUTE_KEY, isMuted() ? '0' : '1');
    }
  });
}

export function useSfx(names: string[], enabled: boolean, volume = 0.7) {
  const bank = useMemo(() => {
    const m: Record<string, HTMLAudioElement> = {};
    if (!enabled) return m;
    for (const n of names) {
      const a = new Audio(media(`sfx/${n}.mp3`));
      a.preload = 'auto';
      a.volume = volume;
      m[n] = a;
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, names.join('|')]);

  useEffect(() => () => { Object.values(bank).forEach((a) => a.pause()); }, [bank]);

  return {
    play(name: string) {
      const a = bank[name];
      if (!a || isMuted()) return;
      try { a.currentTime = 0; a.play().catch(() => {}); } catch { /* ignore */ }
    },
    stop(name: string) { bank[name]?.pause(); },
  };
}
