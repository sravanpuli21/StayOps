/**
 * StayOps Mobile — v2 design language ("Field"), Apple iOS HIG-aligned.
 *
 * Goal: minimal cognitive load. One large title per screen, grouped inset lists,
 * generous whitespace, neutral by default. Color is rare and only signals real
 * urgency — most of the screen is black text on white/gray, like Reminders,
 * Settings, Health. Restraint over decoration.
 *
 * Separate from the legacy theme (src/theme) so old + new coexist during migration.
 */

export const tone = {
  // Web app palette (Airbnb design system) on the iOS grouped structure.
  bg:        '#f7f7f7',   // web canvas
  surface:   '#ffffff',   // grouped cell / card
  surfaceAlt:'#fbfbfb',
  line:      '#dddddd',   // web border
  separator: '#e6e6e6',   // hairline between rows

  // Text — web values.
  text:      '#222222',   // web body text
  textSub:   'rgba(60,60,67,0.6)', // soft secondary (kept for iOS-feel subtitles)
  textSub2:  '#6a6a6a',   // web secondary (solid, for small caps + labels)
  textHint:  '#929292',   // web tertiary
  onAccent:  '#ffffff',

  // Accent — web brand Rausch. Used for actions/links.
  accent:    '#ff385c',
  accentSoft:'#fff1f3',

  // Status — web values. Color appears only for real signals.
  urgent:    '#b91c1c',   urgentSoft: '#fee2e2',
  warn:      '#b45309',   warnSoft:   '#fef3c7',
  go:        '#15803d',   goSoft:     '#dcfce7',
  watch:     '#1d4ed8',   watchSoft:  '#e0e7ff',

  // Money-at-risk — web uses a deep red/brown for revenue; kept distinct from urgent.
  money:     '#9a3412',
  moneySoft: '#fff1ea',
} as const;

// iOS type scale (San Francisco metrics). System font — no custom font needed.
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.37 },
  title:      { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title2:     { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  headline:   { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body:       { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
  callout:    { fontSize: 16, lineHeight: 21, fontWeight: '400' as const },
  subhead:    { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  footnote:   { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption:    { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40,
} as const;

export const radius = {
  sm: 8, md: 10, lg: 14, xl: 20, pill: 999,
} as const;

export type ToneName = 'urgent' | 'warn' | 'go' | 'watch' | 'money' | 'accent' | 'neutral';

export function toneColors(name: ToneName): { fg: string; bg: string } {
  switch (name) {
    case 'urgent': return { fg: tone.urgent, bg: tone.urgentSoft };
    case 'warn':   return { fg: tone.warn,   bg: tone.warnSoft };
    case 'go':     return { fg: tone.go,     bg: tone.goSoft };
    case 'watch':  return { fg: tone.watch,  bg: tone.watchSoft };
    case 'money':  return { fg: tone.money,  bg: tone.moneySoft };
    case 'accent': return { fg: tone.accent, bg: tone.accentSoft };
    default:       return { fg: tone.textSub2, bg: tone.line };
  }
}

/** Priority → tone. Normal stays neutral (no color) to keep the screen calm. */
export function priorityTone(p: 'urgent' | 'high' | 'normal'): ToneName {
  return p === 'urgent' ? 'urgent' : p === 'high' ? 'warn' : 'neutral';
}

// Secondary label as a real rgba (iOS secondaryLabel ≈ 60% black).
export const secondaryLabel = 'rgba(60,60,67,0.6)';
export const tertiaryLabel  = 'rgba(60,60,67,0.3)';
