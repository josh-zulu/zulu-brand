/**
 * Keeps an audience window and the presenter window it opened on the same slide.
 * Pairing is per window: each deck tab has its own key (kept in sessionStorage, so it survives reloads), and the
 * presenter it opens joins that key via ?sync=<key>. Other tabs on the same machine (test tabs, a second copy of
 * the deck) never move your deck.
 */
export interface DeckPosition { index: number; step: number }
type Msg = { type: 'goto'; pos: DeckPosition; from: string } | { type: 'hello'; from: string } | { type: 'blank'; on: boolean; from: string };

const me = Math.random().toString(36).slice(2);

/** This window's pairing key: ?sync=… when opened as a presenter, otherwise a per-tab key. */
export function deckSyncKey() {
  const fromUrl = new URLSearchParams(location.search).get('sync');
  if (fromUrl) return fromUrl;
  let k = sessionStorage.getItem('zak-deck-sync');
  if (!k) { k = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('zak-deck-sync', k); }
  return k;
}

export function createSync(onMessage: (m: Msg) => void) {
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`zak-ai-trends-deck:${deckSyncKey()}`) : null;
  bc?.addEventListener('message', (e) => { if (e.data?.from !== me) onMessage(e.data); });
  return {
    goto: (pos: DeckPosition) => bc?.postMessage({ type: 'goto', pos, from: me }),
    hello: () => bc?.postMessage({ type: 'hello', from: me }),
    blank: (on: boolean) => bc?.postMessage({ type: 'blank', on, from: me }),
    close: () => bc?.close(),
  };
}
