import type { PortfolioPattern } from '../types/ai';

export const AI_PATTERNS: PortfolioPattern[] = [
  {
    id: 'pat-001',
    icon: 'comp',
    title: 'Hilton Savannah properties consistently outperform comp set on ADR',
    narrative:
      'Hampton Gateway, Cotton Sail, Hampton Midtown and Hilton Garden Midtown all run $4–8 above market ADR with 80%+ occupancy. The brand is earning a Savannah premium we are not pricing into Fairfield Pooler ($6 above comp) or Courtyard Brunswick ($6 below comp). Consider a brand-led pricing review.',
    affectedHotelIds: ['SAVGW', 'SAVVY', 'SAVMD', 'SAVMT', 'SAVFP', 'BQKCY'],
    confidence: 'high',
    detectedAt: '2026-04-28T05:00:00Z',
  },
  {
    id: 'pat-002',
    icon: 'cluster',
    title: 'PTAC failures cluster in properties with 2020-or-earlier install dates',
    narrative:
      'Model GE AZ45E09 is 71% of the repeat-failure tickets this month. Warranty on these units lapsed between Q3 2024 and Q1 2025. Portfolio exposure: 94 units across 6 properties, ~$282K to replace. Savannah cluster (32 units) is highest-risk.',
    affectedHotelIds: ['SAVMT', 'SAVGW', 'SAVMD', 'GA989', 'BQKCY', 'BSWVE'],
    confidence: 'high',
    detectedAt: '2026-04-27T22:00:00Z',
  },
  {
    id: 'pat-003',
    icon: 'trend-down',
    title: 'Extended-stay properties losing share to local comp set',
    narrative:
      'Home2 TX, Home2 Baton Rouge, Residence Inn Midtown and Woodspring Brunswick all running 2–5 points below their comp sets on occupancy. The segment itself is up 6% in these markets. Likely B2B/contract channel weakness — not pricing.',
    affectedHotelIds: ['DFWFW', 'BTRCI', 'RISAV', 'GAA84'],
    confidence: 'medium',
    detectedAt: '2026-04-28T06:30:00Z',
  },
  {
    id: 'pat-004',
    icon: 'seasonal',
    title: 'Labour variance spikes on event weekends across all Savannah properties',
    narrative:
      'HK and Kitchen variance consistently runs +15–30 hrs above baseline during city-event weekends (St. Patrick\'s, Savannah Music Festival, SCAD graduation). Event calendar is public — staffing templates are not absorbing it. Opportunity: shared event calendar → auto-adjusted schedule template.',
    affectedHotelIds: ['SAVGW', 'SAVVY', 'GA989', 'SAVMT', 'SAVMD', 'RISAV', 'SAVFP'],
    confidence: 'high',
    detectedAt: '2026-04-27T18:00:00Z',
  },
  {
    id: 'pat-005',
    icon: 'trend-up',
    title: 'F&B revenue responds strongly to menu refresh — transferable signal',
    narrative:
      'Cotton Sail F&B is up 18% since launching the spring menu 3 weeks ago. Covers are up, walk-in traffic is up, room-guest attachment rate is unchanged. Two other full-service properties (Cambria Savannah, Hilton Garden Midtown) have held flat F&B for 90+ days.',
    affectedHotelIds: ['SAVVY', 'GA989', 'SAVMT'],
    confidence: 'medium',
    detectedAt: '2026-04-28T07:00:00Z',
  },
];
