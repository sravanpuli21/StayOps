/**
 * StayOps Mobile — Airbnb-flavored design language.
 *
 * Crisp white canvas, Rausch (#FF385C) as the single brand accent, big friendly
 * bold titles, rounded cards with soft shadows, horizontal category pills, and
 * bold "price"-style numbers. Color stays mostly neutral; pink is for brand
 * actions, and a small set of status colors signal urgency. Mirrors the Airbnb
 * consumer app's warmth + clarity, applied to an operations tool.
 */

export const A = {
  // Canvas — pure white like Airbnb, with a faint gray for sunken areas.
  bg:        '#ffffff',
  bgSoft:    '#f7f7f7',
  surface:   '#ffffff',
  line:      '#dddddd',
  lineSoft:  '#ebebeb',

  // Text — Airbnb's near-black + warm grays.
  text:      '#222222',
  textSub:   '#717171',
  textHint:  '#b0b0b0',
  onBrand:   '#ffffff',

  // Brand — Rausch.
  brand:     '#ff385c',
  brandPress:'#e00b41',
  brandSoft: '#fff0f3',

  // Status — quiet, used only as small accents / dots / pills.
  urgent:    '#c13515',  urgentSoft: '#fdeae5',   // Airbnb's error red
  warn:      '#b35900',  warnSoft:   '#fdf0e1',
  go:        '#008a05',  goSoft:     '#e4f5e4',
  watch:     '#7048e8',  watchSoft:  '#efeafc',
  money:     '#a3360e',  moneySoft:  '#fbeae0',
} as const;

// Airbnb Cereal feel via system weights (no custom font loaded).
export const AT = {
  hero:     { fontSize: 30, lineHeight: 35, fontWeight: '800' as const, letterSpacing: -0.4 },
  title:    { fontSize: 26, lineHeight: 31, fontWeight: '800' as const, letterSpacing: -0.3 },
  section:  { fontSize: 22, lineHeight: 27, fontWeight: '700' as const, letterSpacing: -0.2 },
  cardTitle:{ fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body:     { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  bodyMed:  { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  price:    { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  sub:      { fontSize: 14, lineHeight: 19, fontWeight: '400' as const },
  label:    { fontSize: 13, lineHeight: 17, fontWeight: '600' as const },
  micro:    { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.3 },
} as const;

export const AS = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const AR = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

// Airbnb's signature soft card shadow.
export const ashadow = {
  card: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  float:{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
} as const;

export type ATone = 'urgent' | 'warn' | 'go' | 'watch' | 'money' | 'brand' | 'neutral';

export function atoneColors(name: ATone): { fg: string; bg: string } {
  switch (name) {
    case 'urgent': return { fg: A.urgent, bg: A.urgentSoft };
    case 'warn':   return { fg: A.warn,   bg: A.warnSoft };
    case 'go':     return { fg: A.go,     bg: A.goSoft };
    case 'watch':  return { fg: A.watch,  bg: A.watchSoft };
    case 'money':  return { fg: A.money,  bg: A.moneySoft };
    case 'brand':  return { fg: A.brand,  bg: A.brandSoft };
    default:       return { fg: A.textSub, bg: A.bgSoft };
  }
}

export function apriorityTone(p: 'urgent' | 'high' | 'normal'): ATone {
  return p === 'urgent' ? 'urgent' : p === 'high' ? 'warn' : 'neutral';
}
