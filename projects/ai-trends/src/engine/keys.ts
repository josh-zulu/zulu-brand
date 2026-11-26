/** Every presenting key, shown by ? (help) and in the corner while the slides panel is open. */
export const KEYS: [string, string][] = [
  ['→  Space  PageDown', 'Next beat'],
  ['←  PageUp', 'Previous beat'],
  ['Shift + → / ←', 'Skip to next / previous slide'],
  ['Number then Enter', 'Jump to slide'],
  ['O  or  Esc', 'Overview of every slide'],
  ['P', 'Open presenter view (notes, timer, next slide)'],
  ['F', 'Fullscreen'],
  ['B', 'Black screen'],
  ['M', 'Mute sound effects'],
  ['\\', 'Slides & presenters panel (rehearsal)'],
  ['?', 'This help'],
];

/** Only while the slides panel is open. */
export const PANEL_KEYS: [string, string][] = [
  ['J  K  H', 'Assign this slide to Josh, Kyle or Hiep'],
  ['Drag ⋮⋮', 'Move a slide'],
  ['Hide', 'Leave a slide out of the run'],
];
