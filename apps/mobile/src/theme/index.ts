export const C = {
  // HOS brand — kept for brand moments only (logo, single accent FAB, persona pip)
  brand:   '#ff385c',
  brandBg: 'rgba(255,56,92,0.08)',

  // Ink — primary action surfaces (buttons, active tab tint, active filter chip).
  // Mirrors web `.stayops-cta` background. Replaces previous overuse of brand red.
  ink:     '#0a0a0a',
  inkSoft: '#1f2937',

  // Cambria hotel
  gold:       '#cf8a00',
  goldBg:     'rgba(207,138,0,0.10)',
  hotelSlate: '#5b6670',

  // Surfaces
  bg:     '#f7f7f7',           // web: #f7f7f7 (Airbnb soft canvas)
  card:   '#ffffff',
  border: '#dddddd',           // web: #dddddd
  borderSoft: '#e8e8e8',
  input:  '#f0f0f0',

  // Text — aligned with web Airbnb hierarchy
  text:   '#222222',           // web: #222222
  sub:    '#6a6a6a',           // web: #6a6a6a
  hint:   '#929292',           // web: #929292 (kpi labels)
  faint:  '#c1c1c1',

  // Alerts — web-matched amber strip
  alertAmberBg:     '#fffbeb',
  alertAmberBorder: '#fcd34d',
  alertAmberText:   '#b45309',

  // Status
  red:      '#dc2626',
  redBg:    'rgba(220,38,38,0.08)',
  amber:    '#d97706',
  amberBg:  'rgba(217,119,6,0.08)',
  green:    '#16a34a',
  greenBg:  'rgba(22,163,74,0.08)',
  blue:     '#2563eb',
  blueBg:   'rgba(37,99,235,0.08)',
  purple:   '#7c3aed',
  purpleBg: 'rgba(124,58,237,0.08)',

  // Room status
  roomReady:     '#dcfce7',
  roomDirty:     '#fef9c3',
  roomOccupied:  '#dbeafe',
  roomInspect:   '#e0e7ff',
  roomOoo:       '#fee2e2',
  roomBlocked:   '#fce7f3',
} as const;

export const F = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 24,
  h:   28,
} as const;

export const R = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  full: 999,
} as const;

export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
