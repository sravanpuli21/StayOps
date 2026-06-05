'use client';

import type { TxStatus, ReceiptStatus, ReconStatus, CloseStatus } from '@hos/shared/accounting-os';

export const money = (n: number, opts: { sign?: boolean } = {}) => {
  const v = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (opts.sign) return `${n < 0 ? '-' : ''}$${v}`;
  return `$${v}`;
};
export const moneyShort = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
};
export const fmtDate = (iso: string) =>
  iso ? new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
export const fmtMonth = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const card: React.CSSProperties = { background: '#fff', border: '1px solid #dddddd', borderRadius: 16 };
export const PURPLE = '#6a4ec0';

export function Badge({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ color: fg, background: bg }}>{label}</span>
  );
}

const G = { fg: '#15803d', bg: '#dcfce7' };
const A = { fg: '#b45309', bg: '#fef3c7' };
const R = { fg: '#b91c1c', bg: '#fee2e2' };
const B = { fg: '#1d4ed8', bg: '#dbeafe' };
const N = { fg: '#6a6a6a', bg: '#f0f0f0' };
const P = { fg: '#6a4ec0', bg: '#ece4fb' };

export const TX_STATUS: Record<TxStatus, { label: string; fg: string; bg: string }> = {
  'needs-review': { label: 'Needs Review', ...A },
  uncategorized:  { label: 'Uncategorized', ...N },
  categorized:    { label: 'Categorized', ...B },
  approved:       { label: 'Approved', ...P },
  posted:         { label: 'Posted', ...G },
  duplicate:      { label: 'Possible Duplicate', ...R },
  excluded:       { label: 'Excluded', ...N },
};

export const RECEIPT_STATUS: Record<ReceiptStatus, { label: string; fg: string; bg: string }> = {
  'not-required': { label: 'Not Required', ...N },
  required:       { label: 'Required', ...A },
  missing:        { label: 'Missing', ...R },
  attached:       { label: 'Attached', ...B },
  approved:       { label: 'Approved', ...G },
};

export const RECON_STATUS: Record<ReconStatus, { label: string; fg: string; bg: string }> = {
  'not-started': { label: 'Not Started', ...N },
  'in-progress': { label: 'In Progress', ...B },
  difference:    { label: 'Difference Found', ...R },
  reconciled:    { label: 'Reconciled', ...G },
};

export const CLOSE_STATUS: Record<CloseStatus, { label: string; fg: string; bg: string }> = {
  'not-started':    { label: 'Not Started', ...N },
  'in-progress':    { label: 'In Progress', ...B },
  blocked:          { label: 'Blocked', ...R },
  'ready-to-close': { label: 'Ready to Close', ...A },
  closed:           { label: 'Closed', ...G },
  reopened:         { label: 'Reopened', ...P },
};
