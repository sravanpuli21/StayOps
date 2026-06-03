/**
 * StayOps subscription pricing (frontend model — real billing/Stripe is a
 * backend task). Per management company:
 *   - each hotel:                $250 / month
 *   - each corporate-office user: $100 / month
 *
 * Prepay cycles trade free months for commitment:
 *   - monthly : billed every month (12 billed / yr, 0 free)
 *   - 1 year  : billed for 10 months, 2 months free
 *   - 2 years : billed for 18 months, 6 months free
 */

export const HOTEL_MONTHLY = 250;
export const CORPORATE_MONTHLY = 100;

// Optional Payroll add-on: $6 / person / month. Its annual cycle differs from
// the platform plan — 11 months billed, only 1 month free.
export const PAYROLL_PER_PERSON_MONTHLY = 6;
export const PAYROLL_ANNUAL_BILLED_MONTHS = 11;
export const PAYROLL_ANNUAL_FREE_MONTHS = 1;

export type BillingCycle = 'monthly' | 'annual' | 'biennial';

export interface CycleDef {
  key: BillingCycle;
  label: string;
  /** Total months the term covers. */
  termMonths: number;
  /** Months actually billed (rest are free). */
  billedMonths: number;
  freeMonths: number;
  blurb: string;
}

export const CYCLES: CycleDef[] = [
  { key: 'monthly',  label: 'Monthly',   termMonths: 1,  billedMonths: 1,  freeMonths: 0, blurb: 'Pay month to month.' },
  { key: 'annual',   label: '1 Year',    termMonths: 12, billedMonths: 10, freeMonths: 2, blurb: 'Pay for 12 months up front — 2 months free.' },
  { key: 'biennial', label: '2 Years',   termMonths: 24, billedMonths: 18, freeMonths: 6, blurb: 'Pay for 24 months up front — 6 months free.' },
];

export const CYCLE_BY_KEY: Record<BillingCycle, CycleDef> =
  Object.fromEntries(CYCLES.map((c) => [c.key, c])) as Record<BillingCycle, CycleDef>;

export interface PricingInput {
  hotels: number;
  corporateUsers: number;
  cycle: BillingCycle;
}

export interface PricingResult {
  cycle: CycleDef;
  monthlyRate: number;          // combined $/month at full price
  hotelsMonthly: number;
  corporateMonthly: number;
  billedMonths: number;
  freeMonths: number;
  termMonths: number;
  /** Amount charged for the whole term (billedMonths × monthlyRate). */
  termTotal: number;
  /** What the term would cost with no free months. */
  termListPrice: number;
  /** Dollars saved by the free months. */
  savings: number;
  /** Effective monthly cost over the full term. */
  effectiveMonthly: number;
}

export interface PayrollResult {
  people: number;
  monthlyRate: number;       // people × $6
  billedMonths: number;
  freeMonths: number;
  termMonths: number;
  termTotal: number;
  savings: number;
}

/**
 * Payroll add-on cost for a cycle. Monthly = 1 billed/0 free; annual = 11
 * billed / 1 free; biennial scales the annual rule (22 billed / 2 free).
 */
export function computePayroll(people: number, cycle: BillingCycle): PayrollResult {
  const monthlyRate = people * PAYROLL_PER_PERSON_MONTHLY;
  let termMonths: number, billedMonths: number;
  if (cycle === 'monthly') { termMonths = 1; billedMonths = 1; }
  else if (cycle === 'annual') { termMonths = 12; billedMonths = PAYROLL_ANNUAL_BILLED_MONTHS; }
  else { termMonths = 24; billedMonths = PAYROLL_ANNUAL_BILLED_MONTHS * 2; }
  const freeMonths = termMonths - billedMonths;
  const termTotal = monthlyRate * billedMonths;
  const savings = monthlyRate * termMonths - termTotal;
  return { people, monthlyRate, billedMonths, freeMonths, termMonths, termTotal, savings };
}

export function computePricing({ hotels, corporateUsers, cycle }: PricingInput): PricingResult {
  const def = CYCLE_BY_KEY[cycle];
  const hotelsMonthly = hotels * HOTEL_MONTHLY;
  const corporateMonthly = corporateUsers * CORPORATE_MONTHLY;
  const monthlyRate = hotelsMonthly + corporateMonthly;

  const termTotal = monthlyRate * def.billedMonths;
  const termListPrice = monthlyRate * def.termMonths;
  const savings = termListPrice - termTotal;
  const effectiveMonthly = def.termMonths > 0 ? termTotal / def.termMonths : monthlyRate;

  return {
    cycle: def,
    monthlyRate,
    hotelsMonthly,
    corporateMonthly,
    billedMonths: def.billedMonths,
    freeMonths: def.freeMonths,
    termMonths: def.termMonths,
    termTotal,
    termListPrice,
    savings,
    effectiveMonthly,
  };
}
