import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { defineSlide, type SlideProps } from '@/engine/types';
import { SectionDivider } from '@/components/SectionDivider';
import { generatedSet, generatedUrl, GenTile } from '@/components/GenArt';
import { rng } from '@/lib/motion';
import './S5Divider.css';

/**
 * Forward-looking background for section 5: we travel through a corridor of moments.
 * Frames from the coming section (and a few "next" stills) drift out of the dark at the vanishing point,
 * grow as they approach and slip past the camera. Slow, continuous, no beats: it just keeps moving forward.
 */
const COUNT = 16;
const LOOP = 34; // seconds for one frame to travel from the horizon past the camera
const Z_FAR = -6200;
const Z_NEAR = 900;

function Corridor({ mode }: { mode: SlideProps['mode'] }) {
  const root = useRef<HTMLDivElement>(null);
  const images = useMemo(() => {
    const picks = [
      ...generatedSet('next-'),
      generatedUrl('fourd-moment'),
      generatedUrl('realtime-world'),
      generatedUrl('hack-device'),
      ...generatedSet('campaign-').slice(4, 7),
    ];
    return picks.filter((u): u is string => !!u);
  }, []);

  const frames = useMemo(() => {
    const r = rng(505);
    return Array.from({ length: COUNT }, (_, i) => {
      // spread around the camera like a tunnel, leaving the centre (the vanishing point) clear
      const a = (i / COUNT) * Math.PI * 2 + r() * 0.5;
      const rad = 620 + r() * 380;
      return {
        x: Math.cos(a) * rad * 1.35,
        y: Math.sin(a) * rad * 0.62,
        w: 380 + Math.round(r() * 200),
        phase: (i * 7 % COUNT) / COUNT,
        img: i % Math.max(1, images.length),
        seed: 40 + i,
      };
    });
  }, [images.length]);

  useGSAP(() => {
    const els = gsap.utils.toArray<HTMLElement>('.s5d-frame', root.current);
    const place = (t: number) => {
      els.forEach((el, i) => {
        const f = frames[i];
        const p = (t + f.phase) % 1;
        const z = Z_FAR + (Z_NEAR - Z_FAR) * p;
        // fade in out of the dark, fade out just before passing the lens
        const fadeIn = gsap.utils.clamp(0, 1, (z - Z_FAR) / 2400);
        const fadeOut = gsap.utils.clamp(0, 1, (Z_NEAR - z) / 700);
        gsap.set(el, { xPercent: -50, yPercent: -50, x: f.x, y: f.y, z, opacity: 0.92 * fadeIn * fadeOut });
      });
    };
    if (mode === 'preview') { place(0.12); return; }
    const clock = { t: 0 };
    place(0);
    gsap.to(clock, { t: 1, duration: LOOP, ease: 'none', repeat: -1, onUpdate: () => place(clock.t) });
  }, { scope: root, dependencies: [frames, mode] });

  return (
    <div ref={root} className="s5d-world fill" aria-hidden>
      <div className="s5d-glow" />
      <div className="s5d-space">
        {frames.map((f, i) => (
          <div key={i} className="s5d-frame" style={{ width: f.w, height: Math.round(f.w * 9 / 16) }}>
            {images.length ? <img src={images[f.img]} alt="" draggable={false} /> : <GenTile seed={f.seed} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's5-divider',
  section: 5,
  title: "Divider: What's next",
  chrome: false,
  notes:
    "Section 5: what's next.\n" +
    'The background is a corridor of moments drifting toward us, a few of them from the slides ahead. Let it run while you set up the section.',
  Component: (p) => <SectionDivider {...p} number={5} title={'What’s next'} background={<Corridor mode={p.mode} />} />,
});
