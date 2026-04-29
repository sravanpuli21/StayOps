import type { CapexPrediction } from '../types/ai';

export const AI_CAPEX_PREDICTIONS: CapexPrediction[] = [
  {
    id: 'cx-001',
    assetCategory: 'HVAC/PTAC',
    dueQuarter: 'Q2 2026',
    unitCount: 32,
    estimatedCost: 96000,
    affectedHotelIds: ['SAVMT', 'SAVGW', 'SAVMD', 'GA989'],
    rationale:
      'Model GE AZ45E09 units installed 2019–2020, warranty lapsed. 7 failures in past 7 days, all this model. Accelerating from Q3 to Q2 avoids ~$9K repair spend and 70% of expected OOO days.',
    confidence: 'high',
  },
  {
    id: 'cx-002',
    assetCategory: 'Kitchen',
    dueQuarter: 'Q3 2026',
    unitCount: 8,
    estimatedCost: 142000,
    affectedHotelIds: ['SAVMT', 'GA989', 'SAVFP'],
    rationale:
      'Commercial ovens at 9+ years service life. Two units out of warranty. F&B revenue at Cotton Sail is showing what a refresh can unlock — replacement enables menu expansion at these three sites.',
    confidence: 'medium',
  },
  {
    id: 'cx-003',
    assetCategory: 'Roof',
    dueQuarter: 'Q4 2026',
    unitCount: 2,
    estimatedCost: 185000,
    affectedHotelIds: ['SAVVY', 'BQKCY'],
    rationale:
      'Cotton Sail roof is 18 years old (20-year expected life). Courtyard Brunswick roof has 3 recurring leak tickets in past 6 months. Combining both into a single Q4 project saves ~$14K vs separate contracts.',
    confidence: 'high',
  },
  {
    id: 'cx-004',
    assetCategory: 'POS/PMS',
    dueQuarter: 'Q1 2027',
    unitCount: 16,
    estimatedCost: 64000,
    affectedHotelIds: ['SAVGW', 'SAVVY', 'GA989', 'SAVMT', 'SAVMD', 'RISAV', 'SAVFP', 'BQKCY', 'BSWVE', 'GAA84', 'BQKFP', 'SGJES', 'JAXTX', 'DFWFW', 'BTRCI', '58090LA'],
    rationale:
      'Current PMS contract expires March 2027. Industry shift to cloud-first platforms — our on-prem install is end-of-life. Portfolio-wide migration opportunity; batch pricing available through Q1.',
    confidence: 'medium',
  },
  {
    id: 'cx-005',
    assetCategory: 'Laundry',
    dueQuarter: 'Q3 2026',
    unitCount: 6,
    estimatedCost: 48000,
    affectedHotelIds: ['SAVFP', 'BQKFP', 'DFWFW'],
    rationale:
      'Washers at Fairfield Pooler and Four Points at year 7 (10-year life) with rising repair frequency. Home2 TX laundry is undersized for current occupancy — upgrading reduces HK variance by freeing up staff.',
    confidence: 'medium',
  },
];
