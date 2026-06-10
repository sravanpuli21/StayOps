'use client';

/**
 * StayOps Accounting OS (v2) — shared UI primitives, formatters, and the status
 * colour systems for the Statement-to-Books flow.
 */
import type { ReactNode, CSSProperties } from 'react';

/* ── Formatters ───────────────────────────────────────────────────────── */
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

/* ── Tokens ───────────────────────────────────────────────────────────── */
export const card: CSSProperties = { background: '#fff', border: '1px solid #dddddd', borderRadius: 16 };
export const PURPLE = '#6a4ec0';
export const PURPLE_SOFT = '#f0eefb';
export const INK = '#222222';
export const MUTE = '#929292';

/* ── Badge ────────────────────────────────────────────────────────────── */
export function Badge({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ color: fg, background: bg }}>{label}</span>
  );
}

/* Colour swatches */
const G = { fg: '#15803d', bg: '#dcfce7' };  // green / done
const A = { fg: '#b45309', bg: '#fef3c7' };  // amber / attention
const R = { fg: '#b91c1c', bg: '#fee2e2' };  // red / blocking
const B = { fg: '#1d4ed8', bg: '#dbeafe' };  // blue / in-progress
const N = { fg: '#6a6a6a', bg: '#f0f0f0' };  // neutral
const P = { fg: '#6a4ec0', bg: '#ece4fb' };  // purple / system

/* ── Statement line lifecycle ─────────────────────────────────────────── */
export type LineStatus =
  | 'imported' | 'suggested' | 'needs-coding' | 'coded' | 'ready-to-post'
  | 'posted' | 'cleared' | 'reconciled'
  | 'needs-support' | 'duplicate' | 'excluded' | 'timing-difference' | 'needs-investigation';

export const LINE_STATUS: Record<LineStatus, { label: string; fg: string; bg: string }> = {
  imported:             { label: 'Imported', ...N },
  suggested:            { label: 'Suggested', ...P },
  'needs-coding':       { label: 'Needs Coding', ...A },
  coded:                { label: 'Coded', ...B },
  'ready-to-post':      { label: 'Ready to Post', ...B },
  posted:               { label: 'Posted', fg: '#0e7490', bg: '#cffafe' },
  cleared:              { label: 'Cleared', ...G },
  reconciled:           { label: 'Reconciled', ...G },
  'needs-support':      { label: 'Needs Support', ...R },
  duplicate:            { label: 'Possible Duplicate', ...R },
  excluded:             { label: 'Excluded', ...N },
  'timing-difference':  { label: 'Timing Difference', ...A },
  'needs-investigation':{ label: 'Needs Investigation', ...R },
};

/* ── Receipt status ───────────────────────────────────────────────────── */
export type ReceiptStatus2 = 'not-required' | 'required' | 'missing' | 'requested' | 'attached' | 'approved' | 'rejected';
export const RECEIPT_STATUS: Record<ReceiptStatus2, { label: string; fg: string; bg: string }> = {
  'not-required': { label: 'Not Required', ...N },
  required:       { label: 'Required', ...A },
  missing:        { label: 'Missing', ...R },
  requested:      { label: 'Requested', ...B },
  attached:       { label: 'Attached', ...B },
  approved:       { label: 'Approved', ...G },
  rejected:       { label: 'Rejected', ...R },
};

/* ── Statement (import) status ────────────────────────────────────────── */
export type StatementStatus =
  | 'uploaded' | 'needs-mapping' | 'preview-ready' | 'imported' | 'in-review'
  | 'ready-to-reconcile' | 'reconciled' | 'failed' | 'reversed';
export const STATEMENT_STATUS: Record<StatementStatus, { label: string; fg: string; bg: string }> = {
  uploaded:            { label: 'Uploaded', ...N },
  'needs-mapping':     { label: 'Needs Mapping', ...A },
  'preview-ready':     { label: 'Preview Ready', ...B },
  imported:            { label: 'Imported', fg: '#0e7490', bg: '#cffafe' },
  'in-review':         { label: 'In Review', ...B },
  'ready-to-reconcile':{ label: 'Ready to Reconcile', ...P },
  reconciled:          { label: 'Reconciled', ...G },
  failed:              { label: 'Failed', ...R },
  reversed:            { label: 'Reversed', ...N },
};

/* ── Workbench session status ─────────────────────────────────────────── */
export type SessionStatus =
  | 'not-started' | 'needs-coding' | 'in-review' | 'ready-to-post'
  | 'difference-found' | 'ready-to-reconcile' | 'reconciled' | 'blocked';
export const SESSION_STATUS: Record<SessionStatus, { label: string; fg: string; bg: string }> = {
  'not-started':       { label: 'Not Started', ...N },
  'needs-coding':      { label: 'Needs Coding', ...A },
  'in-review':         { label: 'In Review', ...B },
  'ready-to-post':     { label: 'Ready to Post', ...B },
  'difference-found':  { label: 'Difference Found', ...R },
  'ready-to-reconcile':{ label: 'Ready to Reconcile', ...P },
  reconciled:          { label: 'Reconciled', ...G },
  blocked:             { label: 'Blocked', ...R },
};

/* ── Month close status ───────────────────────────────────────────────── */
export type CloseStatus = 'not-started' | 'in-progress' | 'blocked' | 'ready-to-close' | 'closed' | 'reopened';
export const CLOSE_STATUS: Record<CloseStatus, { label: string; fg: string; bg: string }> = {
  'not-started':    { label: 'Not Started', ...N },
  'in-progress':    { label: 'In Progress', ...B },
  blocked:          { label: 'Blocked', ...R },
  'ready-to-close': { label: 'Ready to Close', ...A },
  closed:           { label: 'Closed', ...G },
  reopened:         { label: 'Reopened', ...P },
};

/* ── Small reusable layout bits ───────────────────────────────────────── */
export function PageHeader({ scope, scopeFg, scopeBg, title, subtitle, actions }: {
  scope?: string; scopeFg?: string; scopeBg?: string; title: string; subtitle?: string; actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-2.5">
        {scope && <span className="mt-0.5"><Badge label={scope} fg={scopeFg ?? PURPLE} bg={scopeBg ?? '#ece4fb'} /></span>}
        <div>
          <h1 className="text-xl font-bold" style={{ color: INK }}>{title}</h1>
          {subtitle && <p className="text-sm mt-0.5" style={{ color: MUTE }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Kpi({ icon, label, value, accent = INK, onClick }: {
  icon?: ReactNode; label: string; value: string; accent?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className="p-3.5 flex flex-col gap-1.5 text-left"
      style={{ ...card, cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}<span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTE }}>{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
    </button>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className="px-3 py-2 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5"
          style={{ color: active === t.key ? PURPLE : '#6a6a6a', borderBottom: active === t.key ? `2px solid ${PURPLE}` : '2px solid transparent' }}>
          {t.label}
          {t.count != null && t.count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
              style={{ background: active === t.key ? PURPLE : '#f0f0f0', color: active === t.key ? '#fff' : '#6a6a6a' }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-2" style={{ ...card, borderStyle: 'dashed' }}>
      {icon && <div className="mb-1" style={{ color: MUTE }}>{icon}</div>}
      <p className="text-base font-semibold" style={{ color: INK }}>{title}</p>
      {body && <p className="text-sm" style={{ color: '#6a6a6a' }}>{body}</p>}
    </div>
  );
}

export const inputCls = 'h-9 px-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6a4ec0] w-full';
export const inputStyle: CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
