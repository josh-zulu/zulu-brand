import { useState, type FormEvent, type ReactNode } from 'react';
import { ZakMark } from '@/components/ZakMark';

/**
 * Password screen for the shared preview (GitHub Pages). Only active when the build sets
 * VITE_PREVIEW_PASSWORD_SHA256 (a SHA-256 hash; the password itself never appears in the code or repo).
 * Honest limit: this is a curtain, not security. The repo is public, so the content is too.
 * Its job is to keep the link from being casually passed around. Once entered, the browser remembers it.
 */
const HASH = (import.meta.env.VITE_PREVIEW_PASSWORD_SHA256 as string | undefined)?.trim().toLowerCase();
const KEY = 'zak-preview-unlocked';

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function PreviewGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(() => !HASH || localStorage.getItem(KEY) === HASH);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  if (open) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if ((await sha256(value)) === HASH) {
      try { localStorage.setItem(KEY, HASH!); } catch { /* private mode: ask again next time */ }
      setOpen(true);
    } else {
      setWrong(true);
      setValue('');
    }
  };

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <ZakMark className="gate-mark" />
        <div className="gate-title">AI Trends</div>
        <div className="label gate-sub">Zulu AI Working Group · Preview</div>
        <label className="label gate-label" htmlFor="gate-pw">Password</label>
        <input id="gate-pw" className="gate-input" type="password" autoFocus autoComplete="current-password"
          value={value} onChange={(e) => { setValue(e.target.value); setWrong(false); }} />
        <button className="gate-go" type="submit">Open the deck</button>
        <div className="gate-msg" aria-live="polite">{wrong ? 'That password didn’t work. Try again.' : ''}</div>
      </form>
    </div>
  );
}
