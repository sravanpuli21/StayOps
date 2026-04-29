import type { Forecast } from '../types/ai';

export const AI_FORECASTS: Forecast[] = [
  {
    id: 'fc-001',
    metric: 'Portfolio Total Revenue',
    baseline: 291520,
    formattedBaseline: '$291.5k',
    horizon: 'Next 7 days',
    narrative:
      'Baseline is this week\'s rolling average. Forecast blends booking pace, comp-set signals and event calendar. Home2 TX ADR move is the biggest single lever this week.',
    scenarios: [
      { label: 'Baseline',                 delta: 'no change',           projectedValue: 291520, projectedPct: 0,    formattedValue: '$291.5k' },
      { label: 'Home2 TX ADR +$10',        delta: 'raise underpriced property',  projectedValue: 295420, projectedPct: 1.3,  formattedValue: '$295.4k' },
      { label: 'Hampton Midtown ADR +$8',  delta: 'capture event premium',       projectedValue: 298100, projectedPct: 2.3,  formattedValue: '$298.1k' },
      { label: 'Combined + CapEx freeze',  delta: 'both rate moves',             projectedValue: 302000, projectedPct: 3.6,  formattedValue: '$302.0k' },
    ],
  },
  {
    id: 'fc-002',
    metric: 'Portfolio Labour Variance',
    baseline: 274,
    formattedBaseline: '+274 hrs',
    horizon: 'Next pay period',
    narrative:
      'At current scheduling, variance projects to +240 hrs — slight improvement. Applying the 3 top recommendations (Fairfield kitchen reset, Home2 TX schedule cut, Hilton Garden event pre-load) cuts it to +145 hrs.',
    scenarios: [
      { label: 'Baseline (no action)',           delta: 'current schedule',     projectedValue: 240, projectedPct: -12, formattedValue: '+240 hrs' },
      { label: 'Apply Fairfield fix',            delta: 'rec-003',              projectedValue: 222, projectedPct: -19, formattedValue: '+222 hrs' },
      { label: 'Apply Fairfield + Home2 TX',     delta: 'rec-003 + rec-001',    projectedValue: 186, projectedPct: -32, formattedValue: '+186 hrs' },
      { label: 'Apply all 3 top recommendations',delta: 'rec-003 + rec-001 + rec-005', projectedValue: 145, projectedPct: -47, formattedValue: '+145 hrs' },
    ],
  },
  {
    id: 'fc-003',
    metric: 'Portfolio Occupancy',
    baseline: 82,
    formattedBaseline: '82.0%',
    horizon: 'Next 14 days',
    narrative:
      'Three underperformers (Woodspring Brunswick, La Quinta, Hilton Garden Midtown) are the only meaningful variance from budget. Fixing two of them moves portfolio occupancy above 84%.',
    scenarios: [
      { label: 'Baseline',                        delta: 'no action',                   projectedValue: 82.3, projectedPct: 0.3, formattedValue: '82.3%' },
      { label: 'Woodspring B2B outreach lands',   delta: 'rec-004',                     projectedValue: 83.1, projectedPct: 1.1, formattedValue: '83.1%' },
      { label: 'La Quinta weekday campaign',      delta: 'rec-007',                     projectedValue: 83.7, projectedPct: 1.7, formattedValue: '83.7%' },
      { label: 'Both + HGI event pre-load',       delta: 'rec-004 + rec-007 + rec-005', projectedValue: 84.6, projectedPct: 2.6, formattedValue: '84.6%' },
    ],
  },
];

export const getForecastById = (id: string): Forecast | undefined =>
  AI_FORECASTS.find((f) => f.id === id);
