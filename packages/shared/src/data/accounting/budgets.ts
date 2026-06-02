import { HOTELS } from '../hotels';
import { CHART_OF_ACCOUNTS } from './coa';

export interface BudgetLine {
  id: string;
  hotelId: string;
  accountId: string;
  periodMonth: string;       // YYYY-MM
  budgetedAmount: number;    // negative for expense, positive for revenue
}

// Annual budget for major expense + revenue accounts, broken down monthly.
const BUDGET_ACCOUNTS = [
  // Revenue
  { id: 'acc-4100', monthlyPerKey: 1900 },     // Rooms revenue
  { id: 'acc-4200', monthlyPerKey: 220 },      // F&B restaurant
  // Expenses (negative)
  { id: 'acc-5100', monthlyPerKey: -460 },     // Rooms wages
  { id: 'acc-5210', monthlyPerKey: -240 },     // OTA commission
  { id: 'acc-6400', monthlyPerKey: -110 },     // Utilities electric
  { id: 'acc-6410', monthlyPerKey: -35 },      // Utilities gas
  { id: 'acc-6500', monthlyPerKey: -60 },      // R&M
  { id: 'acc-7100', monthlyPerKey: -140 },     // Property tax
  { id: 'acc-7300', monthlyPerKey: -180 },     // Mgmt & franchise fees
];

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];

const ACCOUNT_EXISTS = new Set(CHART_OF_ACCOUNTS.map((a) => a.id));

export const BUDGET_LINES: BudgetLine[] = HOTELS.flatMap((hotel) =>
  BUDGET_ACCOUNTS.flatMap((b) =>
    ACCOUNT_EXISTS.has(b.id)
      ? MONTHS.map((m) => ({
          id: `budget-${hotel.id}-${b.id}-${m}`,
          hotelId: hotel.id,
          accountId: b.id,
          periodMonth: m,
          budgetedAmount: hotel.rooms * b.monthlyPerKey,
        }))
      : [],
  ),
);
