import type { ApprovalRequest } from '../../types/accounting';
import { LEDGER_TRANSACTIONS } from './transactions';
import { CHART_OF_ACCOUNTS } from './coa';

const ACCOUNT_BY_ID = new Map(CHART_OF_ACCOUNTS.map((a) => [a.id, a]));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function approverFor(amount: number): { role: ApprovalRequest['approverRole']; name: string } {
  const a = Math.abs(amount);
  if (a <= 500) return { role: 'GM', name: 'Lashwanda Pierce' };
  if (a <= 2000) return { role: 'Regional Manager', name: 'Harshal Patel' };
  return { role: 'Owner', name: 'Kris Patel' };
}

const REJECT_REASONS = [
  'Vendor not on approved list',
  'Duplicate of bill 2026-04-12',
  'Budget exhausted for category this month',
  'Need updated W-9 before payment',
  'Awaiting GM context on which room/asset',
];

const REQUESTERS = ['Lashwanda Pierce (GM)', 'Emma Johnson', 'Maintenance Lead', 'Front Office Lead', 'F&B Manager'];

const r = rng(771199);
const out: ApprovalRequest[] = [];

// Pull expense transactions ≥ $400 needing approval, sample ~75
const candidates = LEDGER_TRANSACTIONS
  .filter((t) => t.amount < -400)
  .sort(() => 0.5 - r())
  .slice(0, 80);

for (let i = 0; i < candidates.length; i++) {
  const t = candidates[i];
  const acct = ACCOUNT_BY_ID.get(t.accountId);
  const { role, name } = approverFor(t.amount);
  // Distribution: ~30% pending, 55% approved, 15% rejected
  let status: ApprovalRequest['status'] = 'pending';
  let approverName: string | undefined;
  let decidedIso: string | undefined;
  let reason: string | undefined;
  const draw = r();
  if (draw < 0.55) {
    status = 'approved';
    approverName = name;
    decidedIso = t.dateIso;
  } else if (draw < 0.70) {
    status = 'rejected';
    approverName = name;
    decidedIso = t.dateIso;
    reason = REJECT_REASONS[Math.floor(r() * REJECT_REASONS.length)];
  } else if (draw < 0.74) {
    status = 'approved-with-exception';
    approverName = name;
    decidedIso = t.dateIso;
    reason = 'Approved despite missing receipt — invoice on the way';
  } else if (draw < 0.78 && acct?.usaliDept === 'undistributed') {
    status = 'emergency-bypass';
    decidedIso = t.dateIso;
    reason = 'Emergency repair authorized by night manager';
  }

  out.push({
    id: `appr-${i}`,
    transactionId: t.id,
    hotelId: t.hotelId,
    amount: t.amount,
    category: acct?.name ?? 'Uncategorized',
    requestedBy: REQUESTERS[Math.floor(r() * REQUESTERS.length)],
    requestedIso: t.dateIso,
    status,
    approverRole: role,
    approverName,
    decidedIso,
    reason,
  });
}

export const APPROVAL_REQUESTS: ApprovalRequest[] = out;
export const approvalForTransaction = (txId: string): ApprovalRequest | undefined =>
  APPROVAL_REQUESTS.find((a) => a.transactionId === txId);
