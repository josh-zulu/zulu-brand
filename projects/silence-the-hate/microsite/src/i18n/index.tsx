import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en, { type Strings } from './en';
import fr from './fr';

export type Lang = 'en' | 'fr';
const STRINGS: Record<Lang, Strings> = { en, fr };
const KEY = 'sth-lang';

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'fr') return q;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch { /* storage blocked: fall through */ }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

type Ctx = { lang: Lang; t: Strings; setLang: (l: Lang) => void; toggle: () => void };
const I18n = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', l);
    history.replaceState(null, '', url);
  }, []);
  const toggle = useCallback(() => setLang(lang === 'en' ? 'fr' : 'en'), [lang, setLang]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = STRINGS[lang].meta.title;
  }, [lang]);
  const value = useMemo(() => ({ lang, t: STRINGS[lang], setLang, toggle }), [lang, setLang, toggle]);
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error('useI18n outside I18nProvider');
  return ctx;
}
