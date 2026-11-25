import { useCallback, useEffect, useState } from 'react';
import { asset } from '@/lib/asset';

/**
 * Who presents each slide. Stored in public/presenters.json (shared, versionable), written through the dev server
 * (POST /api/presenters). Every open window (deck, presenter view) stays in sync over a BroadcastChannel.
 */
export const PRESENTERS = ['Josh', 'Kyle', 'Hiep'] as const;
export type Presenter = (typeof PRESENTERS)[number];
export type PresenterMap = Record<string, Presenter>;

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zak-presenters') : null;

export function usePresenters() {
  const [map, setMap] = useState<PresenterMap>({});
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    fetch(asset('/presenters.json'), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then(setMap).catch(() => {});
    const on = (e: MessageEvent) => { if (e.data?.type === 'presenters') setMap(e.data.map); };
    channel?.addEventListener('message', on);
    return () => channel?.removeEventListener('message', on);
  }, []);

  const assign = useCallback((id: string, who: Presenter | null) => {
    setMap((prev) => {
      const next = { ...prev };
      if (who) next[id] = who; else delete next[id];
      channel?.postMessage({ type: 'presenters', map: next });
      fetch('/api/presenters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
        .then((r) => setSaveError(!r.ok)).catch(() => setSaveError(true));
      return next;
    });
  }, []);

  return { map, assign, saveError };
}
