import type { ClosePeriod } from '../../types/accounting';
import { HOTELS } from '../hotels';
import { ALL_BANK_ACCOUNTS } from './bank-accounts';

const out: ClosePeriod[] = [];

// For each hotel × each non-CC bank account: months Jan–Mar closed, April closed-with-exceptions for some, May open.
const PERIODS = [
  { end: '2026-01-31', month: 'Jan' },
  { end: '2026-02-28', month: 'Feb' },
  { end: '2026-03-31', month: 'Mar' },
  { end: '2026-04-30', month: 'Apr' },
  { end: '2026-05-31', month: 'May' },
];

let n = 0;
for (const hotel of HOTELS) {
  const accounts = ALL_BANK_ACCOUNTS.filter((b) => b.hotelId === hotel.id);
  for (const acct of accounts) {
    PERIODS.forEach((p, i) => {
      const id = `close-${acct.id}-${p.end}`;
      let status: ClosePeriod['status'];
      if (i < 3) status = 'closed';
      else if (i === 3) status = (hotel.id.charCodeAt(0) + n) % 5 === 0 ? 'closed-with-exceptions' : 'closed';
      else status = 'open';

      const closedIso = i < 4 ? `2026-${String(i + 2).padStart(2, '0')}-08` : undefined;
      const exceptionCount = status === 'closed-with-exceptions' ? 1 + ((n + i) % 3) : 0;

      out.push({
        id,
        hotelId: hotel.id,
        accountId: acct.id,
        periodEndIso: p.end,
        status,
        closedBy: status !== 'open' ? 'Sanjay Narsee' : undefined,
        closedIso,
        exceptionCount,
      });
      n++;
    });
  }
}

// Add one realistic reopen
out.push({
  id: 'close-reopen-savmt-2026-02',
  hotelId: 'SAVMT',
  accountId: 'bank-SAVMT-ops',
  periodEndIso: '2026-02-28',
  status: 'reopened',
  closedBy: 'Sanjay Narsee',
  closedIso: '2026-03-08',
  reopenedBy: 'Sanjay Narsee',
  reopenedIso: '2026-03-22',
  reopenReason: 'Late vendor invoice from Otis Elevator received after close',
});

export const CLOSE_PERIODS: ClosePeriod[] = out;
export const closeStatusForAccount = (accountId: string, periodEndIso: string): ClosePeriod | undefined =>
  CLOSE_PERIODS.find((c) => c.accountId === accountId && c.periodEndIso === periodEndIso);
