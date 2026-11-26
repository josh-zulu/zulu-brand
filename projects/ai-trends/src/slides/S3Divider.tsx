import { defineSlide, type SlideProps } from '@/engine/types';
import { SectionDivider } from '@/components/SectionDivider';
import { PhoneScreen } from './shared34/Device';
import './S3Divider.css';

/**
 * Divider 3. Background: a slow, tilted wall of the section's own work (the AGO pitch mockups), columns drifting in
 * opposite directions, darkened so the title owns the frame. Videos play in live mode only; thumbnails show stills.
 */
const SRC = ['idropper-intro', 'dd-search', 'idropper-sample', 'dd-gallery', 'idropper-match', 'dd-checkout', 'idropper-claimed', 'dd-ticket', 'idropper-dm'];
const COLS = 7, PER = 3;

function Wall({ mode }: Pick<SlideProps, 'mode'>) {
  return (
    <>
      <div className="s3d-wall" aria-hidden>
        {Array.from({ length: COLS }, (_, c) => (
          <div key={c} className={`s3d-col ${c % 2 ? 'is-down' : ''}`} style={{ animationDelay: `${-c * 7}s` }}>
            {Array.from({ length: PER }, (_, r) => {
              const id = SRC[(c * 4 + r * 2) % SRC.length];
              return <PhoneScreen key={r} className="s3d-tile" src={`ago/${id}.mp4`} mode={mode} still={2 + ((c + r) % 4)} rate={0.85} />;
            })}
          </div>
        ))}
      </div>
      <div className="s3d-vignette" />
    </>
  );
}

export default defineSlide({
  id: 's3-divider',
  section: 3,
  title: 'Divider: New ways to make things',
  chrome: false,
  notes: 'Section 3: new ways to make things. Kyle and Hiep take it from here.',
  Component: (p) => <SectionDivider {...p} number={3} title="New ways to make things" background={<Wall mode={p.mode} />} />,
});
