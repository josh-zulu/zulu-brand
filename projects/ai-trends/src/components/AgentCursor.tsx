import { forwardRef } from 'react';

/**
 * The agent's pointer: a crisp arrow with a signal-green name tag, like a collaborator's cursor in Figma.
 * Position it absolutely and move it with GSAP (x/y). The tip of the arrow is the element's (0,0).
 */
export const AgentCursor = forwardRef<HTMLDivElement, { label?: string; className?: string; style?: React.CSSProperties; tone?: 'signal' | 'paper' }>(
  function AgentCursor({ label = 'Agent', className = '', style, tone = 'signal' }, ref) {
    return (
      <div ref={ref} className={`agent-cursor tone-${tone} ${className}`} style={style} aria-hidden>
        <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
          <path d="M2 2 L2 31 L10 24 L15.5 37 L21 34.6 L15.6 22 L27 22 Z" fill="#f8f7f4" stroke="#161515" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
        {label && <span className="agent-cursor-tag">{label}</span>}
      </div>
    );
  },
);
