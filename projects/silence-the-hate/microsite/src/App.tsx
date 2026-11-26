import { useEffect } from 'react';
import { useI18n } from './i18n';
import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Why } from './sections/Why';
import { TryIt } from './sections/TryIt';
import { How } from './sections/How';
import { Learn } from './sections/Learn';
import { Privacy } from './sections/Privacy';
import { Impact } from './sections/Impact';
import { Close, Faq, Footer } from './sections/Close';
import { ScrollTrigger } from './lib/motion';

export function App() {
  const { t, lang } = useI18n();
  // Text length changes between languages move every trigger; measure again once the new words are in.
  useEffect(() => { requestAnimationFrame(() => ScrollTrigger.refresh()); }, [lang]);
  useEffect(() => {
    // Fonts arriving late change line heights; re-measure pins.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">{t.common.skipToContent}</a>
      <details className="wip"><summary>{t.common.wip}</summary><p>{t.common.banner}</p></details>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Why />
        <TryIt />
        <How />
        <Learn />
        <Privacy />
        <Impact />
        <Close />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
