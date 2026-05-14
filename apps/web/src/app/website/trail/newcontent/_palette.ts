/**
 * Palette tokens for the night + daylight flavors.
 * Every section primitive in _ui.tsx accepts `palette: Palette` and reads its
 * colours from this map. Pages just resolve once via getPalette(flavor) and pass
 * the resolved palette down.
 */
export type Flavor = 'night' | 'daylight';

export interface Palette {
  flavor: Flavor;
  /* page surfaces */
  pageBg:    string;        // body bg
  sectionAlt: string;       // alternating section bg
  card:      string;        // tile / card surface
  cardAlt:   string;        // secondary tile (dark sections)
  /* text */
  text:      string;        // headlines + key numbers
  body:      string;        // body copy
  muted:     string;        // labels, eyebrows, helper
  subtle:    string;        // very faint
  /* lines */
  border:    string;
  borderSoft:string;
  /* brand */
  brand:     string;        // Rausch
  brandSoft: string;
  accent:    string;        // secondary accent (warm clay / amber)
  /* hover lift class */
  hoverLift: string;
  /* button styles */
  buttonPrimary:   { bg: string; text: string };
  buttonSecondary: { bg: string; border: string; text: string };
  /* hero overlay css gradient */
  heroOverlay: string;
  /* opacity for ghosted background photos */
  ghostPhotoOpacity: number;
}

const NIGHT: Palette = {
  flavor: 'night',
  pageBg:     '#0a0a0a',
  sectionAlt: '#fafaf7',
  card:       '#141414',
  cardAlt:    '#0f0f0f',
  text:       '#ffffff',
  body:       '#c1c1c1',
  muted:      '#a8a8a8',
  subtle:     'rgba(255,255,255,0.55)',
  border:     '#222222',
  borderSoft: 'rgba(255,255,255,0.06)',
  brand:      '#ff385c',
  brandSoft:  '#ff6b85',
  accent:     '#b64a3f',
  hoverLift:  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(255,56,92,0.35)]',
  buttonPrimary:   { bg: '#ffffff', text: '#0a0a0a' },
  buttonSecondary: { bg: 'transparent', border: 'rgba(255,255,255,0.5)', text: '#ffffff' },
  heroOverlay: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.88) 55%, rgba(0,0,0,0.98) 100%)',
  ghostPhotoOpacity: 0.25,
};

const DAYLIGHT: Palette = {
  flavor: 'daylight',
  pageBg:     '#f5f2ec',
  sectionAlt: '#faf7f0',
  card:       '#ffffff',
  cardAlt:    '#faf7f0',
  text:       '#0a0a0a',
  body:       '#3f3f3f',     // 9.7:1 on cream — AAA
  muted:      '#5a5a5a',     // 6.0:1 on cream — AA
  subtle:     '#6a6a6a',     // 5.5:1 on cream — AA  (was #7a7a7a / 4.4:1, borderline)
  border:     '#e6e1d6',
  borderSoft: '#efeae0',
  brand:      '#ff385c',
  brandSoft:  '#ff6b85',
  accent:     '#b65a1f',     // ~5:1 on cream — AA  (was #c98a4b / ~3:1, fail)
  hoverLift:  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.18)]',
  buttonPrimary:   { bg: '#0a0a0a', text: '#ffffff' },
  buttonSecondary: { bg: 'rgba(255,255,255,0.6)', border: '#0a0a0a', text: '#0a0a0a' },
  heroOverlay: 'linear-gradient(180deg, rgba(255,247,232,0.45) 0%, rgba(245,242,236,0.8) 60%, rgba(245,242,236,0.98) 100%)',
  ghostPhotoOpacity: 0.18,
};

export function getPalette(flavor: Flavor): Palette {
  return flavor === 'daylight' ? DAYLIGHT : NIGHT;
}

/**
 * For Night flavor, the `sectionAlt` background is cream — so any text /
 * card / border tokens used INSIDE that section need to flip to light-mode
 * values for legibility.  This helper returns the right palette to pass
 * down to children of an alt-mode <Section>.
 *
 * Daylight flavor has no contrast switch needed — alt sections are still
 * cream-on-cream; passes through unchanged.
 */
export function altPaletteFor(p: Palette): Palette {
  if (p.flavor !== 'night') return p;
  return {
    ...p,
    pageBg:     '#fafaf7',
    sectionAlt: '#fafaf7',
    card:       '#ffffff',
    cardAlt:    '#fafaf7',
    text:       '#0a0a0a',         // dark text on cream — 18:1 AAA
    body:       '#3f3f3f',         // 9.7:1 on cream — AAA
    muted:      '#5a5a5a',         // 6.0:1 — AA
    subtle:     '#6a6a6a',         // 5.5:1 — AA
    border:     '#dddddd',
    borderSoft: '#f0f0f0',
    accent:     '#b65a1f',         // ~5:1 on cream — AA
    hoverLift:  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.18)]',
    buttonPrimary:   { bg: '#0a0a0a', text: '#ffffff' },
    buttonSecondary: { bg: 'rgba(255,255,255,0.6)', border: '#0a0a0a', text: '#0a0a0a' },
  };
}

/**
 * Build a flavor-prefixed URL.
 * fp(flavor, '/website/contact') → /website/trail/newcontent/{flavor}/contact
 * fp(flavor, '/products')        → /website/trail/newcontent/{flavor}/products
 * Already-prefixed paths pass through unchanged.
 */
export function fp(flavor: Flavor, path: string): string {
  if (path.startsWith('/website/trail/newcontent/')) return path;
  if (path.startsWith('/website/')) {
    return `/website/trail/newcontent/${flavor}${path.slice('/website'.length)}`;
  }
  if (path.startsWith('/')) {
    return `/website/trail/newcontent/${flavor}${path}`;
  }
  return path;
}
