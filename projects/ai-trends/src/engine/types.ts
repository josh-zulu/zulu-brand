import type { ComponentType } from 'react';

/** Props every slide component receives from the deck. */
export interface SlideProps {
  /** Current beat (click) within the slide: 0 on entry, up to `steps`. */
  step: number;
  /** 1 when moving forward, -1 when moving back. Use it to skip long builds on the way back. */
  direction: 1 | -1;
  /**
   * 'live'    = the audience stage (play video, use the mic, run demos)
   * 'preview' = presenter view / overview thumbnails (no audio, no mic, no network side effects)
   */
  mode: 'live' | 'preview';
}

export type SlideTheme = 'dark' | 'paper';
export type SlideTransition = 'fade' | 'cut' | 'rise' | 'blur';

export interface SlideDef {
  /** URL slug, unique. Appears in the hash: #/s1-human/0 */
  id: string;
  /** Section number 0 (opener) to 6. Drives the footer label and agenda. */
  section: number;
  /** Short name for the presenter view and overview. */
  title: string;
  /** Number of extra beats after the entry state. 0 = a single state. */
  steps?: number;
  /** Speaker notes (plain text or light markdown-ish line breaks). */
  notes?: string;
  theme?: SlideTheme;
  /** How this slide arrives. Default 'fade'. */
  transition?: SlideTransition;
  /** Show the ZAK mark + section footer. Default true. Dividers and full-bleed moments turn it off. */
  chrome?: boolean;
  /** Which beat the overview thumbnail shows. Default: the last one. */
  overviewStep?: number;
  Component: ComponentType<SlideProps>;
}

export const defineSlide = (def: SlideDef): SlideDef => def;

export const SECTIONS: Record<number, string> = {
  0: 'AI Trends',
  1: 'The Year AI Started Working',
  2: 'What AI Can Do Now',
  3: 'Work We Made',
  4: "What's Next",
  5: 'Questions',
};

/** Design canvas. Every slide is authored in these pixels and scaled to fit. */
export const STAGE_W = 1920;
export const STAGE_H = 1080;
