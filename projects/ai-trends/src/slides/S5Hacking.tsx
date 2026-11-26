import { useRef } from 'react';
import gsap from 'gsap';
import { defineSlide, type SlideProps } from '@/engine/types';
import { useBeats } from '@/engine/useBeats';
import { revealLines, revealWords, typeInto } from '@/lib/motion';
import { generatedUrl, GenImage } from '@/components/GenArt';
import { ClipFrame } from '@/components/ClipFrame';
import './S5Hacking.css';

/**
 * Trend 02 · Agents that hack and build hardware.
 *  beat 0  an ordinary device: a picture frame showing the maker's start screen.
 *  beat 1  an agent scans it and works out how it was built (x-ray + labelled parts, including free pins).
 *  beat 2  it writes new firmware and wires in a motion sensor. Flashed, the frame comes alive when someone walks up:
 *          a physical, interactive prototype.
 *  beat 3  where we'd use it (activations, installations, retail, prototypes) and the real examples.
 */
const DEVICE = generatedUrl('hack-device');
const XRAY = generatedUrl('hack-xray');

// Stage geometry (canvas px). The device photo is 1200×896, shown at 960×717.
const STAGE = { x: 820, y: 170, w: 960, h: 717 };
const K = STAGE.w / 1200;
const px = (x: number) => Math.round(x * K);
// Where things sit in the photo (image px → stage px).
const SCREEN = { x: px(461), y: px(224), w: px(741 - 461), h: px(697 - 224) };
const PARTS = [
  { label: 'Display driver', value: '1280 × 800', at: { x: px(600), y: px(322) }, side: 'left', ly: px(300) },
  { label: 'Processor', value: 'ARM, 4 cores', at: { x: px(594), y: px(503) }, side: 'left', ly: px(520) },
  { label: 'Firmware', value: 'v2.4.1', at: { x: px(700), y: px(492) }, side: 'right', ly: px(420) },
  { label: 'GPIO header', value: '6 pins free', at: { x: px(752), y: px(560) }, side: 'right', ly: px(600) },
] as const;
// The motion sensor, sitting on the desk in front of the frame (stage px, before the device slides right).
const GPIO = PARTS[3].at;
const SENSOR = { x: 584, y: 631, w: 132, h: 48 };
const DOME = { x: SENSOR.x + 24, y: SENSOR.y + 24 };
const WIRE = `${GPIO.x},${GPIO.y} 640,${GPIO.y} 640,${SENSOR.y}`;

const PATCH = [
  { t: 'firmware.patch', c: 'is-file' },
  { t: '+ pir = sensor("motion", pin=4)', c: 'is-add' },
  { t: '- show("vendor/slides")', c: 'is-del' },
  { t: '+ on pir: show("zulu/gallery")', c: 'is-add' },
  { t: '+ idle: dim(20%)', c: 'is-add' },
  { t: '$ flash firmware.bin', c: 'is-cmd' },
  { t: '  ok · rebooting', c: 'is-ok' },
];
const USES = ['Activations', 'Installations', 'Retail', 'Prototypes'];

function Kicker() {
  return (
    <div className="hk-kicker label">
      <b>Trend 02</b><span className="hk-kicker-sep">·</span>Next year
      <span className="hk-rank" aria-hidden>{[0, 1, 2, 3, 4].map((k) => <i key={k} className={k === 1 ? 'on' : ''} />)}</span>
    </div>
  );
}

function Hacking({ step, mode }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useBeats(root, step, (tl) => {
    const q = gsap.utils.selector(root);

    // ── beat 0: an ordinary device ────────────────────────────
    tl.from(q('.hk-kicker'), { opacity: 0, y: 10, duration: 0.8 }, 0);
    revealLines(tl, q('.hk-head')[0], {}, 0);
    revealWords(tl, q('.hk-lede')[0], { stagger: 0.015 }, 0.4);
    tl.from(q('.hk-stage'), { opacity: 0, scale: 1.04, duration: 1.4, ease: 'power2.out' }, 0.2);
    tl.addLabel('b1');

    // ── beat 1: it works out how it was built ─────────────────
    tl.set(q('.hk-scan'), { opacity: 1 }, 'b1');
    tl.fromTo(q('.hk-xray'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power2.inOut' }, 'b1');
    tl.fromTo(q('.hk-scan'), { x: 0 }, { x: STAGE.w, duration: 1.5, ease: 'power2.inOut' }, 'b1');
    tl.set(q('.hk-scan'), { opacity: 0 }, 'b1+=1.5');
    q('.hk-part').forEach((p, i) => {
      const at = `b1+=${1.2 + i * 0.16}`;
      // first appearances: let fromTo render its hidden state at build time
      tl.fromTo(p.querySelector('.hk-part-dot'), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, at);
      tl.fromTo(p.querySelector('.hk-part-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.55, ease: 'power3.out' }, at);
      tl.fromTo(p.querySelector('.hk-part-tag'), { opacity: 0, x: (PARTS[i].side === 'left' ? -16 : 16) }, { opacity: 1, x: 0, duration: 0.5 }, `b1+=${1.5 + i * 0.16}`);
    });
    tl.fromTo(q('.hk-log'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 'b1+=0.2');
    typeInto(tl, q('.hk-log-t')[0], 'reading firmware · 2,318 functions mapped · 6 pins free', { cps: 52 }, 'b1+=0.3');
    tl.addLabel('b2');

    // ── beat 2: new firmware, a sensor wired in ───────────────
    tl.to(q('.hk-parts'), { opacity: 0, duration: 0.4 }, 'b2');
    tl.to(q('.hk-log'), { opacity: 0, duration: 0.3 }, 'b2');
    tl.to(q('.hk-device'), { x: 210, duration: 1, ease: 'power3.inOut' }, 'b2');
    tl.to(q('.hk-dim'), { opacity: 1, duration: 1, ease: 'power3.inOut' }, 'b2');
    tl.fromTo(q('.hk-code'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, immediateRender: false }, 'b2+=0.4');
    const lines = q('.hk-code-l');
    let t = 0.8;
    lines.forEach((l, i) => {
      typeInto(tl, l, PATCH[i].t, { cps: 60 }, `b2+=${t}`);
      t += PATCH[i].t.length / 60 + (i === 5 ? 0.35 : 0.06);
      // the sensor line is written: the sensor arrives on the desk and the agent wires it to a free pin
      if (i === 1) {
        tl.fromTo(q('.hk-sensor'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)', immediateRender: false }, `b2+=${t - 0.1}`);
        tl.fromTo(q('.hk-wire'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' }, `b2+=${t + 0.2}`);
      }
    });
    // flash: the x-ray fades back to the photo, the screen blinks, someone walks up and our build shows
    tl.to(q('.hk-xray'), { opacity: 0, duration: 0.6 }, `b2+=${t - 0.4}`);
    q('.hk-ripple').forEach((r, i) => {
      tl.fromTo(r, { attr: { r: 16 }, opacity: 0.9 }, { attr: { r: 110 }, opacity: 0, duration: 1.2, ease: 'power2.out', immediateRender: false }, `b2+=${t - 0.1 + i * 0.22}`);
    });
    tl.fromTo(q('.hk-screen'), { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, `b2+=${t}`);
    tl.fromTo(q('.hk-screen-white'), { opacity: 1 }, { opacity: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, `b2+=${t + 0.1}`);
    tl.fromTo(q('.hk-screen-img'), { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'expo.out', immediateRender: false }, `b2+=${t + 0.1}`);
    tl.fromTo(q('.hk-live'), { opacity: 0, x: 8 }, { opacity: 1, x: 0, duration: 0.5, immediateRender: false }, `b2+=${t + 0.3}`);
    tl.addLabel('b3');

    // ── beat 3: where we'd use it, and the real thing ─────────
    tl.to(q('.hk-lede'), { opacity: 0, y: 20, duration: 0.5, ease: 'power2.in' }, 'b3');
    tl.to(q('.hk-stage, .hk-code'), { opacity: 0, y: 30, duration: 0.6, ease: 'power2.in' }, 'b3');
    tl.to(q('.hk-head'), { scale: 0.8, duration: 0.9, ease: 'power3.inOut' }, 'b3+=0.1');
    tl.fromTo(q('.hk-uses'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 'b3+=0.4');
    tl.fromTo(q('.hk-uses > .label, .hk-use'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, immediateRender: false }, 'b3+=0.4');
    tl.fromTo(q('.hk-clip'), { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, immediateRender: false }, 'b3+=0.55');
  });

  return (
    <div ref={root} className="hk">
      <Kicker />
      <div className="hk-text">
        <h2 className="hk-head headline">Agents can hack and build hardware.</h2>
        <p className="hk-lede lede">Point one at a device and it works out how it was built. Then it writes new firmware and wires in sensors, so the thing does what we want.</p>
      </div>

      <div className="hk-stage" style={{ left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h }}>
        <div className="hk-device fill">
          {DEVICE ? <img className="hk-photo" src={DEVICE} alt="" draggable={false} /> : <GenImage id="hack-device" seed={21} palette={3} className="hk-photo" />}
          <div className="hk-xray fill">{XRAY && <img src={XRAY} alt="" draggable={false} />}</div>
          <div className="hk-screen" style={{ left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h }}>
            <GenImage id="campaign-3" seed={8} className="hk-screen-img" />
            <i className="hk-screen-white" />
          </div>
          <div className="hk-parts">
            {PARTS.map((p) => {
              const lx = p.side === 'left' ? 40 : STAGE.w - 40;
              return (
                <div key={p.label} className={`hk-part is-${p.side}`}>
                  <i className="hk-part-dot" style={{ left: p.at.x, top: p.at.y }} />
                  <svg className="hk-part-svg" width={STAGE.w} height={STAGE.h}>
                    <polyline className="hk-part-line" points={`${p.at.x},${p.at.y} ${p.side === 'left' ? p.at.x - 60 : p.at.x + 60},${p.ly} ${p.side === 'left' ? 250 : STAGE.w - 250},${p.ly}`} />
                  </svg>
                  <div className="hk-part-tag" style={p.side === 'left' ? { left: lx, top: p.ly - 26 } : { right: STAGE.w - lx, top: p.ly - 26 }}>
                    <span className="label">{p.label}</span>
                    <b>{p.value}</b>
                  </div>
                </div>
              );
            })}
          </div>
          <svg className="hk-wire-svg" width={STAGE.w} height={STAGE.h} aria-hidden>
            <polyline className="hk-wire" points={WIRE} />
            {[0, 1, 2].map((k) => <circle key={k} className="hk-ripple" cx={DOME.x} cy={DOME.y} r={16} />)}
          </svg>
          <div className="hk-sensor" style={{ left: SENSOR.x, top: SENSOR.y }}>
            <i className="hk-dome" />
            <span className="label"><b>Motion</b>GPIO 4</span>
          </div>
          <div className="hk-live label" style={{ right: STAGE.w - (SENSOR.x - 20), top: DOME.y - 10 }}><i />Motion · showing our work</div>
        </div>
        <i className="hk-dim" />
        <i className="hk-scan" />
        <div className="hk-log label"><span className="hk-chev">›</span> <span className="hk-log-t" /></div>
      </div>

      <div className="hk-code">
        {PATCH.map((l, i) => <div key={i} className={`hk-code-l ${l.c}`} />)}
      </div>

      <div className="hk-uses">
        <span className="label">Where we’d use it</span>
        <div className="hk-uses-row">{USES.map((u) => <span key={u} className="hk-use pill-slot">{u}</span>)}</div>
      </div>

      <div className="hk-clips">
        <ClipFrame className="hk-clip" src="clips/hardware-hacks.mp4" variant="window" title="Hardware hacks · smart TV, camera, picture frame" duration="clip to add" mode={mode} playing={step >= 3} />
        <ClipFrame className="hk-clip" src="clips/rea-app-teardown.mp4" variant="window" title="REA · working out how an app was built" duration="clip to add" mode={mode} playing={step >= 3} />
      </div>
    </div>
  );
}

export default defineSlide({
  id: 's5-hacking',
  section: 4,
  title: 'Agents that build hardware',
  steps: 3,
  notes:
    'Trend two, within the next year: agents that hack and build hardware.\n' +
    'On arrival: an ordinary picture frame, running what the maker shipped.\n' +
    'Click 1: point an agent at it. It reads the firmware and works out how the thing was built, down to which pins are free.\n' +
    'Click 2: then it writes new firmware and wires in a motion sensor. Flash it, and the frame now shows our work when someone walks up. That is a working interactive prototype, and the agent did the fiddly part.\n' +
    'Click 3: where this matters for us: activations, installations, retail, fast prototypes. The real examples: hardware hacks (a smart TV, camera firmware, picture frames) and REA working out how an app was built.',
  Component: Hacking,
});
