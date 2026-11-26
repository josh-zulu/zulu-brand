import type { CSSProperties } from 'react';
import './shared34.css';

/** A link icon to the live work, opened in a new tab. Clicks don't navigate the deck, so it's safe on any slide. */
export function LinkChip({ href, label, className = '', style }: { href: string; label: string; className?: string; style?: CSSProperties }) {
  return (
    <a className={`p34-link ${className}`} style={style} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M10 14 21 3M15 3h6v6M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
    </a>
  );
}
