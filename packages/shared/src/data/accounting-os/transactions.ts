/**
 * StayOps Accounting OS — imported transactions (from bank + credit card
 * statement uploads), vendors, and per-hotel month-close status. Mock data sized
 * for a believable May 2026 working set across 16 entities.
 */
import { HOTEL_ENTITIES, ACCT_BANK_ACCOUNTS, ACCT_CREDIT_CARDS } from './entities';
import { VENDOR_SUGGESTIONS, VENDOR_NAMES, type Department } from './coa';

export type TxStatus = 'needs-review' | 'uncategorized' | 'categorized' | 'approved' | 'posted' | 'duplicate' | 'excluded';
export type ReceiptStatus = 'not-required' | 'required' | 'missing' | 'attached' | 'approved';
export type TxSource = 'bank' | 'credit-card';

export interface AcctTransaction {
  id: string;
  hotelId: string;
  accountId: string;            // bank account or credit card id
  source: TxSource;
  dateIso: string;
  description: string;          // raw statement description
  amount: number;               // signed: + money in, - money out
  vendor?: string;
  category?: string;            // COA account name
  department?: Department;
  status: TxStatus;
  receipt: ReceiptStatus;
  duplicate?: boolean;
  importBatchId: string;
  memo?: string;
}

const EXPENSE_VENDORS = VENDOR_NAMES.filter((v) => !['STRIPE PAYOUT', 'PMS DEPOSIT'].includes(v));
const INFLOW_VENDORS = ['STRIPE PAYOUT', 'PMS DEPOSIT'];

function seeded(seed: number) {
  let s = (seed >>> 0) || 7;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
function dayIso(day: number) {
  return `2026-05-${String(Math.max(1, Math.min(28, day))).padStart(2, '0')}`;
}

export const ACCT_TRANSACTIONS: AcctTransaction[] = HOTEL_ENTITIES.flatMap((h) => {
  const r = seeded(h.propertyCode.charCodeAt(0) * 13 + h.rooms);
  const out: AcctTransaction[] = [];
  const bankAccts = ACCT_BANK_ACCOUNTS.filter((a) => a.hotelId === h.id);
  const cards = ACCT_CREDIT_CARDS.filter((c) => c.hotelId === h.id);
  const opChecking = bankAccts.find((a) => a.type === 'Operating Checking') ?? bankAccts[0];

  const N = 14 + Math.floor(r() * 12); // 14–26 tx per hotel
  for (let i = 0; i < N; i++) {
    const onCard = cards.length > 0 && r() > 0.55;
    const inflow = !onCard && r() > 0.72;
    const vendor = inflow
      ? INFLOW_VENDORS[Math.floor(r() * INFLOW_VENDORS.length)]
      : EXPENSE_VENDORS[Math.floor(r() * EXPENSE_VENDORS.length)];
    const sug = VENDOR_SUGGESTIONS[vendor];
    const amount = inflow
      ? Math.round((2_000 + r() * 9_000) * 100) / 100
      : -Math.round((40 + r() * 2_400) * 100) / 100;

    // Status mix: some need review, some categorized, some posted.
    const roll = r();
    let status: TxStatus = 'needs-review';
    if (roll > 0.82) status = 'posted';
    else if (roll > 0.62) status = 'categorized';
    else if (roll > 0.5) status = 'uncategorized';
    const isDup = r() > 0.94;
    if (isDup) status = 'duplicate';

    const acct = onCard ? cards[Math.floor(r() * cards.length)] : opChecking;
    const bigExpense = !inflow && Math.abs(amount) > 250;
    const receipt: ReceiptStatus = inflow ? 'not-required'
      : bigExpense ? (r() > 0.5 ? 'attached' : 'missing')
      : (r() > 0.7 ? 'attached' : 'not-required');

    out.push({
      id: `tx-${h.id}-${i}`,
      hotelId: h.id,
      accountId: acct.id,
      source: onCard ? 'credit-card' : 'bank',
      dateIso: dayIso(1 + Math.floor(r() * 27)),
      description: `${vendor}${onCard ? '' : inflow ? '' : ` #${1000 + Math.floor(r() * 8999)}`}`,
      amount,
      vendor: status === 'uncategorized' || status === 'needs-review' ? (r() > 0.5 ? vendor : undefined) : vendor,
      category: status === 'categorized' || status === 'posted' ? sug?.category : undefined,
      department: status === 'categorized' || status === 'posted' ? sug?.department : undefined,
      status,
      receipt,
      duplicate: isDup,
      importBatchId: `imp-${h.id}-2026-05`,
    });
  }
  return out.sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
});

export const txForHotel = (hotelId: string) => ACCT_TRANSACTIONS.filter((t) => t.hotelId === hotelId);
export const txNeedingReview = (hotelId?: string) =>
  ACCT_TRANSACTIONS.filter((t) => (hotelId ? t.hotelId === hotelId : true) && (t.status === 'needs-review' || t.status === 'uncategorized'));

/* ── Vendors (aggregated from transactions) ───────────────────────────── */
export interface AcctVendor {
  name: string;
  defaultCategory: string;
  defaultDepartment: Department;
  hotelsUsedIn: string[];
  spendMonth: number;
  spendYtd: number;
  txCount: number;
  missingReceipts: number;
}

export const ACCT_VENDORS: AcctVendor[] = VENDOR_NAMES.map((name) => {
  const sug = VENDOR_SUGGESTIONS[name];
  const txs = ACCT_TRANSACTIONS.filter((t) => t.vendor === name || t.description.startsWith(name));
  const spendMonth = txs.reduce((s, t) => s + (t.amount < 0 ? -t.amount : 0), 0);
  return {
    name,
    defaultCategory: sug.category,
    defaultDepartment: sug.department,
    hotelsUsedIn: [...new Set(txs.map((t) => t.hotelId))],
    spendMonth: Math.round(spendMonth),
    spendYtd: Math.round(spendMonth * (3 + (name.charCodeAt(0) % 4))),
    txCount: txs.length,
    missingReceipts: txs.filter((t) => t.receipt === 'missing').length,
  };
}).sort((a, b) => b.spendMonth - a.spendMonth);

/* ── Month close status per hotel (May 2026) ──────────────────────────── */
export type CloseStatus = 'not-started' | 'in-progress' | 'blocked' | 'ready-to-close' | 'closed' | 'reopened';

export interface HotelCloseStatus {
  hotelId: string;
  month: string;                // "2026-05"
  bankUploaded: boolean;
  ccUploaded: boolean;
  txReviewed: boolean;
  receiptsComplete: boolean;
  reconciled: boolean;
  status: CloseStatus;
  toReview: number;
  missingReceipts: number;
}

export const HOTEL_CLOSE_STATUS: HotelCloseStatus[] = HOTEL_ENTITIES.map((h, i) => {
  const txs = txForHotel(h.id);
  const toReview = txs.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length;
  const missingReceipts = txs.filter((t) => t.receipt === 'missing').length;
  const bankUploaded = true;
  const ccUploaded = i % 5 !== 0;        // a few haven't uploaded CC yet
  const txReviewed = toReview === 0;
  const receiptsComplete = missingReceipts === 0;
  const reconciled = ACCT_BANK_ACCOUNTS.filter((a) => a.hotelId === h.id).every((a) => a.reconStatus === 'reconciled');

  let status: CloseStatus;
  if (i % 7 === 0) status = 'closed';
  else if (!ccUploaded || !bankUploaded) status = 'blocked';
  else if (txReviewed && receiptsComplete && reconciled) status = 'ready-to-close';
  else if (toReview > 0 || missingReceipts > 0) status = 'in-progress';
  else status = 'not-started';

  return { hotelId: h.id, month: '2026-05', bankUploaded, ccUploaded, txReviewed, receiptsComplete, reconciled, status, toReview, missingReceipts };
});

export const closeForHotel = (hotelId: string) => HOTEL_CLOSE_STATUS.find((c) => c.hotelId === hotelId);

/* Portfolio rollups for the dashboard */
export const PORTFOLIO_STATS = {
  totalToReview: ACCT_TRANSACTIONS.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length,
  missingReceipts: ACCT_TRANSACTIONS.filter((t) => t.receipt === 'missing').length,
  reconPending: ACCT_BANK_ACCOUNTS.filter((a) => a.reconStatus !== 'reconciled').length
    + ACCT_CREDIT_CARDS.filter((c) => c.reconStatus !== 'reconciled').length,
  readyToClose: HOTEL_CLOSE_STATUS.filter((c) => c.status === 'ready-to-close').length,
};
