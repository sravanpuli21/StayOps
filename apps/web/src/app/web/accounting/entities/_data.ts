/**
 * StayOps Accounting OS (v2) — Hotel Entities data layer.
 *
 * Each hotel is its own accounting entity with its own setup readiness. This
 * module derives, per hotel:
 *   - accounting setup checklist + score (COA, bank/card mapping, opening
 *     balances, users, statement cycles, reconciliation settings)
 *   - a single "setup status" badge
 *   - bank/card/vendor counts
 *   - reconciliation + month-close status (reused from the dashboard engine)
 *
 * Setup readiness is seeded deterministically to match the product spec's
 * per-property statuses (Needs COA, Needs Opening Balances, Reconciliation
 * Blocked, Needs Credit Card Setup, Needs Bank Mapping…), then can be advanced
 * by store actions (e.g. applying a COA template) in a later iteration.
 */
import {
  HOTEL_ENTITIES, getEntity, bankAccountsForHotel, creditCardsForHotel, ACCT_VENDORS,
} from '@hos/shared/accounting-os';
import type { Store2 } from '../_store2';
import { closeForHotel, type HotelClose } from '../dashboard/_data';

export type SetupStatus =
  | 'accounting-ready' | 'needs-coa' | 'needs-opening-balances' | 'needs-bank-mapping'
  | 'needs-credit-card-setup' | 'reconciliation-blocked' | 'setup-incomplete' | 'archived';

export const SETUP_STATUS_LABEL: Record<SetupStatus, { label: string; fg: string; bg: string }> = {
  'accounting-ready':       { label: 'Accounting Ready', fg: '#15803d', bg: '#dcfce7' },
  'needs-coa':              { label: 'Needs COA', fg: '#b91c1c', bg: '#fee2e2' },
  'needs-opening-balances': { label: 'Needs Opening Balances', fg: '#b45309', bg: '#fef3c7' },
  'needs-bank-mapping':     { label: 'Needs Bank Mapping', fg: '#b45309', bg: '#fef3c7' },
  'needs-credit-card-setup':{ label: 'Needs Credit Card Setup', fg: '#b45309', bg: '#fef3c7' },
  'reconciliation-blocked': { label: 'Reconciliation Blocked', fg: '#b91c1c', bg: '#fee2e2' },
  'setup-incomplete':       { label: 'Setup Incomplete', fg: '#6a6a6a', bg: '#f0f0f0' },
  archived:                 { label: 'Archived', fg: '#6a6a6a', bg: '#f0f0f0' },
};

/* Per-property seeded setup status (from the spec). Anything not listed is ready. */
const SEED_STATUS: Record<string, SetupStatus> = {
  SAVMT: 'needs-opening-balances',     // Hilton Garden Inn - Midtown
  SAVMD: 'needs-credit-card-setup',    // Hampton Inn & Suites - Midtown
  'SAVFP/SAVTP': 'needs-coa',          // Fairfield/TPS - Pooler
  GAA84: 'needs-bank-mapping',         // Woodspring - Brunswick
  JAXTX: 'needs-opening-balances',     // Hotel Amalga
  BTRCI: 'reconciliation-blocked',     // Home2 Suites Baton Rouge
  '58090LA': 'needs-credit-card-setup',// La Quinta
};

export interface SetupChecklistItem { key: string; label: string; status: 'complete' | 'warning' | 'missing'; required: boolean; detail?: string; action?: string }

export interface EntitySetup {
  hotelId: string;
  status: SetupStatus;
  score: number;                 // 0–100
  checklist: SetupChecklistItem[];
  coaApplied: boolean;
  bankCount: number;
  cardCount: number;
  vendorCount: number;
  openingBalances: 'complete' | 'needs-review' | 'missing';
  usersAssigned: number;
  close: HotelClose;
}

export function entitySetup(store: Store2, hotelId: string): EntitySetup {
  const h = getEntity(hotelId);
  const code = h?.propertyCode ?? hotelId;
  const seeded = SEED_STATUS[code];
  const banks = bankAccountsForHotel(hotelId);
  const cards = creditCardsForHotel(hotelId);
  const vendorCount = ACCT_VENDORS.filter((v) => v.hotelsUsedIn.includes(hotelId)).length;
  const close = closeForHotel(store, hotelId);

  // Derive checklist booleans from the seeded status.
  const coaApplied = seeded !== 'needs-coa';
  const bankMapped = seeded !== 'needs-bank-mapping';
  const cardComplete = seeded !== 'needs-credit-card-setup' && cards.length > 0;
  const openingBalances: EntitySetup['openingBalances'] = seeded === 'needs-opening-balances' ? 'missing' : (code === 'GA989' ? 'needs-review' : 'complete');
  const usersAssigned = 2; // Sanjay + GM, seeded

  const item = (key: string, label: string, ok: boolean, required: boolean, detail?: string, action?: string): SetupChecklistItem =>
    ({ key, label, status: ok ? 'complete' : 'missing', required, detail, action });

  const checklist: SetupChecklistItem[] = [
    item('legal', 'Legal entity information', true, true, h?.legalEntity),
    item('property', 'Property details', true, true, `${h?.city}, ${h?.state} · ${h?.rooms} rooms`),
    item('coa', 'Chart of Accounts applied', coaApplied, true, coaApplied ? 'Hotel Standard COA' : 'Not applied', 'Apply COA'),
    item('required-accounts', 'Required accounts exist', coaApplied, true),
    item('bank', 'Bank accounts created', banks.length > 0, true, `${banks.length} account${banks.length === 1 ? '' : 's'}`, 'Add Account'),
    { key: 'bank-map', label: 'Bank accounts mapped to COA', status: bankMapped ? 'complete' : 'missing', required: true, detail: bankMapped ? 'Mapped' : 'Mapping missing', action: 'Fix Mapping' },
    item('card', 'Credit cards created', cards.length > 0, false, `${cards.length} card${cards.length === 1 ? '' : 's'}`, 'Add Card'),
    { key: 'card-map', label: 'Credit cards mapped to COA', status: cardComplete ? 'complete' : cards.length === 0 ? 'warning' : 'missing', required: false, detail: cardComplete ? 'Mapped' : 'Needs setup', action: 'Add Card' },
    { key: 'opening', label: 'Opening balances entered', status: openingBalances === 'complete' ? 'complete' : openingBalances === 'needs-review' ? 'warning' : 'missing', required: true, detail: openingBalances, action: 'Enter Opening Balances' },
    item('cycles', 'Statement cycles configured', true, true, 'Account-specific dates'),
    item('users', 'Users assigned', usersAssigned > 0, false, `${usersAssigned} users`, 'Assign User'),
    item('recon-settings', 'Reconciliation settings configured', true, true),
    item('reports', 'Reports enabled', coaApplied, false),
  ];

  const required = checklist.filter((c) => c.required);
  const done = required.filter((c) => c.status === 'complete').length;
  const score = Math.round((done / required.length) * 100);

  let status: SetupStatus;
  if (seeded) status = seeded;
  else if (score === 100) status = 'accounting-ready';
  else status = 'setup-incomplete';

  return { hotelId, status, score, checklist, coaApplied, bankCount: banks.length, cardCount: cards.length, vendorCount, openingBalances, usersAssigned, close };
}

export function allEntitySetups(store: Store2): EntitySetup[] {
  return HOTEL_ENTITIES.map((h) => entitySetup(store, h.id));
}

/* ── Summary card rollups for the list page ───────────────────────────── */
export function entitySummary(store: Store2) {
  const setups = allEntitySetups(store);
  return {
    total: setups.length,
    accountingReady: setups.filter((s) => s.status === 'accounting-ready').length,
    setupIncomplete: setups.filter((s) => s.status !== 'accounting-ready' && s.status !== 'archived').length,
    missingBank: setups.filter((s) => s.status === 'needs-bank-mapping' || s.bankCount === 0).length,
    missingCards: setups.filter((s) => s.status === 'needs-credit-card-setup' || s.cardCount === 0).length,
    reconBlocked: setups.filter((s) => s.close.status === 'blocked' || s.status === 'reconciliation-blocked').length,
    closeBlocked: setups.filter((s) => s.close.status === 'blocked').length,
    reportsReady: setups.filter((s) => s.coaApplied && s.close.reconciledCount > 0).length,
  };
}

/* ── Reconciliation status badge label per hotel (for the table) ──────── */
export function reconStatusLabel(setup: EntitySetup): { label: string; fg: string; bg: string } {
  const c = setup.close;
  if (c.difference > 0) return { label: 'Difference Found', fg: '#b91c1c', bg: '#fee2e2' };
  if (c.totalAccounts === 0) return { label: 'Not Started', fg: '#6a6a6a', bg: '#f0f0f0' };
  if (c.reconciledCount === c.totalAccounts) return { label: 'Reconciled', fg: '#15803d', bg: '#dcfce7' };
  if (c.needsCoding > 0) return { label: 'In Progress', fg: '#1d4ed8', bg: '#dbeafe' };
  return { label: 'In Progress', fg: '#1d4ed8', bg: '#dbeafe' };
}
