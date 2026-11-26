import type { CSSProperties } from 'react';
import './shared34.css';

/** A link to the live work, opened in a new tab. Clicks don't navigate the deck, so it's safe on any slide. */
export function LinkChip({ href, label, className = '', style }: { href: string; label: string; className?: string; style?: CSSProperties }) {
  return (
    <a className={`p34-link ${className}`} style={style} href={href} target="_blank" rel="noreferrer">
      <i />{label}<span aria-hidden>↗</span>
    </a>
  );
}
