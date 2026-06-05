import { bankAccountsForHotel, creditCardsForHotel, closeForHotel, getEntity } from '@hos/shared/accounting-os';

/**
 * Per-hotel setup status — computed from seed data + the in-session store.
 * Drives the entity list badge, the setup-status view, and the detail checklist.
 */
export type SetupStep = 'basic' | 'coa' | 'bank' | 'cards' | 'opening' | 'users' | 'firstUpload' | 'firstRecon' | 'closeStarted';

export interface SetupState {
  steps: Record<SetupStep, boolean>;
  pct: number;
  label: string;          // overall status label
  needs: string | null;   // first missing thing, e.g. "Needs Opening Balance"
}

interface StoreLike {
  addedBank: Array<{ hotelId: string }>;
  addedCards: Array<{ hotelId: string }>;
  coaApplied: string[];
  openingBalances: Record<string, { entered: boolean }>;
  entityUsers: Array<{ hotelId: string }>;
  batches: Array<{ hotelId: string }>;
  recon: Record<string, { finished: boolean }>;
}

export function setupForHotel(hotelId: string, store: StoreLike): SetupState {
  const banks = bankAccountsForHotel(hotelId).length + store.addedBank.filter((b) => b.hotelId === hotelId).length;
  const cards = creditCardsForHotel(hotelId).length + store.addedCards.filter((c) => c.hotelId === hotelId).length;
  const close = closeForHotel(hotelId);
  const entity = getEntity(hotelId);

  // Seed assumption: existing 16 hotels are mostly set up; demo store adds layer on top.
  const steps: Record<SetupStep, boolean> = {
    basic: !!entity,
    coa: true || store.coaApplied.includes(hotelId),                 // template applied to all by default
    bank: banks > 0,
    cards: cards > 0,
    opening: store.openingBalances[hotelId]?.entered ?? true,        // seeded as entered
    users: true,                                                     // Sanjay always has access
    firstUpload: (close?.bankUploaded ?? false) || store.batches.some((b) => b.hotelId === hotelId),
    firstRecon: close?.reconciled ?? false,
    closeStarted: close ? close.status !== 'not-started' : false,
  };

  const done = Object.values(steps).filter(Boolean).length;
  const pct = Math.round((done / Object.keys(steps).length) * 100);

  let needs: string | null = null;
  if (!steps.basic) needs = 'Not Started';
  else if (!steps.coa) needs = 'Needs Chart of Accounts';
  else if (!steps.bank) needs = 'Needs Bank Account';
  else if (!steps.cards) needs = 'Needs Credit Card';
  else if (!steps.opening) needs = 'Needs Opening Balance';
  else if (!steps.firstUpload) needs = 'Needs First Upload';

  const label = needs ?? 'Complete';
  return { steps, pct, label, needs };
}

export const SETUP_STEP_LABEL: Record<SetupStep, string> = {
  basic: 'Basic entity info complete',
  coa: 'Chart of accounts applied',
  bank: 'Bank accounts added',
  cards: 'Credit cards added',
  opening: 'Opening balances entered',
  users: 'User access assigned',
  firstUpload: 'First statement uploaded',
  firstRecon: 'First reconciliation completed',
  closeStarted: 'Month close process started',
};
