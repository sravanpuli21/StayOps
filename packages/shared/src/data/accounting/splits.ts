import type { LedgerTransaction, TransactionSplit } from '../../types/accounting';
import { HOTELS } from '../hotels';

// Realistic split-transaction examples Sanjay would actually see — the kind QBO can't categorize without splitting.
const SPLIT_TEMPLATES: Array<{
  vendorId: string;
  description: string;
  total: number;
  legs: Array<{ accountId: string; amount: number; department: string; area?: string; roomNumber?: string; notes: string }>;
}> = [
  {
    vendorId: 'v-walmart',
    description: 'WALMART STORE 2841 SAVANNAH GA',
    total: 452.18,
    legs: [
      { accountId: 'acc-5310', amount: 162.40, department: 'F&B',          notes: 'Breakfast supplies (eggs, bread, coffee)' },
      { accountId: 'acc-5130', amount: 124.78, department: 'Housekeeping', notes: 'Cleaning supplies (Lysol, Clorox)' },
      { accountId: 'acc-6500', amount: 84.00,  department: 'Maintenance',  area: 'Mechanical room', notes: 'Maintenance supplies (light bulbs, batteries)' },
      { accountId: 'acc-5120', amount: 81.00,  department: 'Front Office', notes: 'Guest supplies (bottled water, tissues)' },
    ],
  },
  {
    vendorId: 'v-home-depot',
    description: 'THE HOME DEPOT #0823',
    total: 96.42,
    legs: [
      { accountId: 'acc-6500', amount: 76.42, department: 'Maintenance',  area: 'Bathroom', roomNumber: '303', notes: 'Faucet replacement parts' },
      { accountId: 'acc-5130', amount: 20.00, department: 'Housekeeping', notes: 'Drain cleaner' },
    ],
  },
  {
    vendorId: 'v-amazon',
    description: 'AMAZON BUSINESS BMSP4QAR',
    total: 318.74,
    legs: [
      { accountId: 'acc-5120', amount: 158.50, department: 'Front Office',  notes: 'Guest soap pumps · case of 24' },
      { accountId: 'acc-6110', amount: 89.99,  department: 'Administration', notes: 'Office supplies · printer toner' },
      { accountId: 'acc-6500', amount: 70.25,  department: 'Maintenance',   area: 'Pool', notes: 'Pool test strips · chemicals' },
    ],
  },
  {
    vendorId: 'v-costco',
    description: 'COSTCO WHSE 0125',
    total: 612.30,
    legs: [
      { accountId: 'acc-5310', amount: 412.10, department: 'F&B',          notes: 'Bulk breakfast items' },
      { accountId: 'acc-5120', amount: 145.00, department: 'Front Office', notes: 'Coffee K-cups for guest rooms' },
      { accountId: 'acc-5130', amount: 55.20,  department: 'Housekeeping', notes: 'Trash bags · paper towels' },
    ],
  },
  {
    vendorId: 'v-lowes',
    description: 'LOWES #1894',
    total: 184.90,
    legs: [
      { accountId: 'acc-6500', amount: 124.90, department: 'Maintenance',  area: 'Lobby',     notes: 'Replacement smoke detectors' },
      { accountId: 'acc-6500', amount: 60.00,  department: 'Maintenance',  area: 'Pool',      notes: 'Pool deck repair compound' },
    ],
  },
];

// One split tx per template, distributed across the first ~5 hotels.
const TARGET_HOTELS = HOTELS.slice(0, 5);
const TODAY = '2026-04-28';

const out: { txs: LedgerTransaction[]; splits: TransactionSplit[] } = { txs: [], splits: [] };

SPLIT_TEMPLATES.forEach((tpl, i) => {
  const hotel = TARGET_HOTELS[i % TARGET_HOTELS.length];
  const dateIso = `2026-04-${String(20 + i).padStart(2, '0')}`;
  const parentId = `tx-split-${hotel.id}-${i}`;
  out.txs.push({
    id: parentId,
    hotelId: hotel.id,
    dateIso,
    accountId: 'acc-1010',                  // parent posts against Cash; legs reclassify
    vendorId: tpl.vendorId,
    amount: -tpl.total,
    memo: tpl.description,
    source: 'cc',
    sourceRowId: undefined,
    reconciledIso: null,
    aiSuggested: true,
  } as LedgerTransaction);
  tpl.legs.forEach((leg, j) => {
    out.splits.push({
      id: `split-${parentId}-${j}`,
      parentTransactionId: parentId,
      accountId: leg.accountId,
      amount: -leg.amount,
      department: leg.department,
      area: leg.area,
      roomNumber: leg.roomNumber,
      notes: leg.notes,
    });
  });
});

export const SPLIT_PARENT_TRANSACTIONS: LedgerTransaction[] = out.txs;
export const TRANSACTION_SPLITS: TransactionSplit[] = out.splits;
export const splitsForTransaction = (txId: string): TransactionSplit[] =>
  TRANSACTION_SPLITS.filter((s) => s.parentTransactionId === txId);
