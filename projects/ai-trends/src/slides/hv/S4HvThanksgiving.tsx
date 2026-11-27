import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords } from '@/lib/motion';
import { HvKicker, HvStages, HvText, HvVideo } from './shared';

/**
 * Hiep 01 · Thanksgiving gone wrong. One idea: the wipe. The Blender blockout plays; on the click a seam sweeps
 * across and the Seedance film replaces it, shot for shot (the two clips are the same 15 seconds, kept in sync).
 *  beat 0  text, the blockout playing, "Blender blockout" lit
 *  beat 1  the seam wipes left to right: the film takes over, "Seedance" lights
 */
function Thanksgiving({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLVideoElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Keep the film locked to the blockout so the wipe shows the same moment on both sides.
  useEffect(() => {
    if (mode !== 'live') return;
    const id = setInterval(() => {
      const a = block.current, b = film.current;
      if (a && b && Math.abs(a.currentTime - b.currentTime) > 0.12) b.currentTime = a.currentTime;
    }, 500);
    return () => clearInterval(id);
  }, [mode]);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);
    tl.from(q('.hv-kicker'), { opacity: 0, y: 10, duration: 0.6 }, 0);
    revealLines(tl, q('.hv-head')[0], {}, 0.05);
    revealWords(tl, q('.hv-lede')[0], {}, 0.45);
    tl.from(q('.hv-frame'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.2);
    tl.from(q('.hv-stages'), { opacity: 0, y: 12, duration: 0.8 }, 0.8);
    gsap.set(q('.tg-film'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(q('.tg-seam'), { left: '0%', opacity: 0 });
    tl.addLabel('b1');
    tl.set(q('.tg-seam'), { opacity: 1 }, 'b1');
    tl.to(q('.tg-film'), { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut' }, 'b1');
    tl.to(q('.tg-seam'), { left: '100%', duration: 1.6, ease: 'power3.inOut' }, 'b1');
    tl.to(q('.tg-seam'), { opacity: 0, duration: 0.3 }, 'b1+=1.5');
    tl.to(q('.tg-tag-block'), { opacity: 0, duration: 0.3 }, 'b1+=0.2');
    tl.fromTo(q('.tg-tag-film'), { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, 'b1+=1.2');
  });

  return (
    <div ref={root} className="hv">
      <HvKicker project="Thanksgiving gone wrong" />
      <HvText
        head="Blocked out in Blender, shot by AI."
        lede="Hiep staged the chaos with simple shapes: who moves, where the camera goes. Seedance turned the blockout into the film."
      />
      <div className="hv-frame">
        <HvVideo src="hv/thanksgiving-blockout.mp4" mode={mode} videoRef={block} />
        <HvVideo src="hv/thanksgiving-film.mp4" mode={mode} videoRef={film} className="tg-film" muted={muted} />
        <i className="tg-seam" />
        <span className="hv-tag tg-tag-block" style={{ left: 16, top: 16 }}>Blender blockout</span>
        <span className="hv-tag is-ai tg-tag-film" style={{ left: 16, top: 16, opacity: 0 }}>Seedance</span>
        {mode === 'live' && step >= 1 && (
          <button className={`hv-sound ${muted ? '' : 'on'}`} onClick={() => setMuted((m) => !m)}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
        )}
      </div>
      <HvStages stages={['Blender blockout', 'Seedance']} at={step >= 1 ? 1 : 0} />
    </div>
  );
}

export default defineSlide({
  id: 's4-hv-thanksgiving',
  section: 3,
  title: 'Hiep · Thanksgiving gone wrong',
  steps: 1,
  notes:
    'Thanksgiving gone wrong. I blocked the whole scene out in Blender first: grey room, simple shapes, the camera moves. That is where the decisions get made.\n' +
    'Click: the wipe. Seedance takes the blockout and renders the film, shot for shot. Same timing, same camera, finished look.\n' +
    'Hover the clip for sound.',
  Component: Thanksgiving,
});
