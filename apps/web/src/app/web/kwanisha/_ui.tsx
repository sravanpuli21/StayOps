'use client';

import type { OppKind, OppStage, AccountStatus, Cadence } from '@hos/shared';

export const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
export const fmtMoneyFull = (n: number) => `$${n.toLocaleString('en-US')}`;

export function Badge({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ color: fg, background: bg }}>
      {label}
    </span>
  );
}

export const KIND_STYLE: Record<OppKind, { fg: string; bg: string; label: string }> = {
  'rebook-due': { fg: '#15803d', bg: '#dcfce7', label: 'Rebook due' },
  'win-back':   { fg: '#b45309', bg: '#fef3c7', label: 'Win back' },
  grow:         { fg: '#1d4ed8', bg: '#dbeafe', label: 'Grow' },
  'new-lead':   { fg: '#7c3aed', bg: '#ece4fb', label: 'New lead' },
  rfp:          { fg: '#0891b2', bg: '#cffafe', label: 'RFP' },
};

export const STATUS_STYLE: Record<AccountStatus, { fg: string; bg: string; label: string }> = {
  active:    { fg: '#15803d', bg: '#dcfce7', label: 'Active' },
  'at-risk': { fg: '#b45309', bg: '#fef3c7', label: 'At risk' },
  lapsed:    { fg: '#b91c1c', bg: '#fee2e2', label: 'Lapsed' },
  prospect:  { fg: '#7c3aed', bg: '#ece4fb', label: 'Prospect' },
};

export const STAGE_STYLE: Record<OppStage, { fg: string; bg: string }> = {
  spotted:     { fg: '#6a6a6a', bg: '#f0f0f0' },
  contacted:   { fg: '#1d4ed8', bg: '#dbeafe' },
  proposal:    { fg: '#7c3aed', bg: '#ece4fb' },
  negotiation: { fg: '#b45309', bg: '#fef3c7' },
  won:         { fg: '#15803d', bg: '#dcfce7' },
  lost:        { fg: '#b91c1c', bg: '#fee2e2' },
};

export const CADENCE_FG: Record<Cadence, string> = {
  weekly: '#15803d', monthly: '#15803d', quarterly: '#1d4ed8', seasonal: '#b45309', annual: '#7c3aed', 'one-time': '#929292',
};

/* Shared card chrome */
export const card: React.CSSProperties = { background: '#fff', border: '1px solid #dddddd', borderRadius: 16 };
