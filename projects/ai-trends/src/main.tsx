import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import '@fontsource/oswald/300.css';
import '@fontsource/oswald/400.css';
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './styles/global.css';
import './styles/components.css';

import { Deck } from './engine/Deck';
import { PreviewGate } from './engine/PreviewGate';
import { slides } from './deck';

gsap.registerPlugin(useGSAP, SplitText, DrawSVGPlugin, Flip, CustomEase, MotionPathPlugin);
// House eases: a confident arrival and a soft, human settle.
CustomEase.create('zak.out', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('zak.settle', 'M0,0 C0.25,0.1 0.2,1 1,1');

// Fonts must be loaded before slides measure text (SplitText lines, letter positions). Webfonts load lazily,
// so ask for each face explicitly instead of trusting document.fonts.ready. Never block longer than 3s.
const faces = ['300 100px Oswald', '400 100px Oswald', '400 100px "Schibsted Grotesk Variable"', '500 100px "Schibsted Grotesk Variable"', '400 100px "JetBrains Mono Variable"'];
Promise.race([
  Promise.all(faces.map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 3000)),
]).then(() => {
  createRoot(document.getElementById('root')!).render(<PreviewGate><Deck slides={slides} /></PreviewGate>);
});
