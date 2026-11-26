import type { ReactNode } from 'react';
import { useI18n } from '../i18n';

/** Visible marker on any copy pflag canada hasn't approved yet. */
export function Draft({ kind = 'draft' }: { kind?: 'draft' | 'sample' | 'placeholder' | 'illustrative' }) {
  const { t } = useI18n();
  const text = { draft: t.common.draft, sample: t.common.sample, placeholder: t.common.placeholder, illustrative: t.common.illustrative }[kind];
  const title = kind === 'sample' ? t.common.sampleTitle : t.common.draftTitle;
  return <span className={`draft draft--${kind}`} title={title}>{text}</span>;
}

/** Section label: mono caps with a tiny live equalizer dot. */
export function Label({ children, draft }: { children: ReactNode; draft?: boolean }) {
  return (
    <p className="label">
      <span className="label__dot" aria-hidden="true"><i /><i /><i /></span>
      {children}
      {draft && <Draft />}
    </p>
  );
}

/**
 * pflag canada lock-up. The ring mark is the original artwork; the grey wordmark is re-coloured white for the
 * black ground with a CSS mask (same file, no edited logo). Swap for pflag's official reversed lock-up when we get it.
 */
export function PflagLogo({ className = '' }: { className?: string }) {
  const src = `${import.meta.env.BASE_URL}pflag-canada-logo.png`;
  return (
    <span className={`pflag ${className}`} role="img" aria-label="pflag canada">
      <img className="pflag__rings" src={src} alt="" width={576} height={173} />
      <span className="pflag__word" style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }} />
    </span>
  );
}

/** Iridescent glass prism, after the pitch's prism texture (source/frames/04-look-prisms.jpg). Pure CSS. */
export function Prism({ className = '', hue = 0 }: { className?: string; hue?: number }) {
  return (
    <div className={`prism ${className}`} aria-hidden="true" style={{ ['--hue' as string]: `${hue}deg` }}>
      <div className="prism__body" />
      <div className="prism__face" />
      <div className="prism__edge" />
    </div>
  );
}

export function Arrow() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppleMark() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
    </svg>
  );
}
