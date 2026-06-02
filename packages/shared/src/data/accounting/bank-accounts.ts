import type { BankAccount } from '../../types/accounting';
import { HOTELS } from '../hotels';

// Deterministic per-hotel pseudo-random so balances look real but stay stable across renders.
function hotelSeed(hotelId: string): number {
  let h = 0;
  for (let i = 0; i < hotelId.length; i++) h = (h * 31 + hotelId.charCodeAt(i)) >>> 0;
  return h;
}

export const BANK_ACCOUNTS: BankAccount[] = HOTELS.flatMap((hotel) => {
  const seed = hotelSeed(hotel.id);
  const opsBalance = 40000 + ((seed % 90) * 1000);
  const ccBalance = -(8000 + ((seed % 60) * 250));   // CC liability: shown as negative book
  const opsDiff = ((seed % 7) - 3) * 250;            // small unreconciled drift +/-

  return [
    {
      id: `bank-${hotel.id}-ops`,
      hotelId: hotel.id,
      name: `Wells Fargo Operating · ${hotel.shortName}`,
      kind: 'operating' as const,
      last4: String(1000 + (seed % 9000)).slice(-4),
      bookBalance: opsBalance,
      statementBalance: opsBalance + opsDiff,
      lastReconciledIso: '2026-04-30',
    },
    {
      id: `bank-${hotel.id}-cc`,
      hotelId: hotel.id,
      name: `Amex Business · ${hotel.shortName}`,
      kind: 'cc' as const,
      last4: String(2000 + (seed % 8000)).slice(-4),
      bookBalance: ccBalance,
      statementBalance: ccBalance - 180,
      lastReconciledIso: '2026-04-30',
    },
  ];
});

export const CONSOLIDATED_BANK_ACCOUNT: BankAccount = {
  id: 'bank-CONSOLIDATED',
  hotelId: 'CONSOLIDATED',
  name: 'Portfolio Cash – All Hotels',
  kind: 'operating',
  last4: '----',
  bookBalance: BANK_ACCOUNTS.filter((b) => b.kind === 'operating').reduce((s, b) => s + b.bookBalance, 0),
  statementBalance: BANK_ACCOUNTS.filter((b) => b.kind === 'operating').reduce((s, b) => s + b.statementBalance, 0),
  lastReconciledIso: '2026-04-30',
};

export const ALL_BANK_ACCOUNTS: BankAccount[] = [CONSOLIDATED_BANK_ACCOUNT, ...BANK_ACCOUNTS];
