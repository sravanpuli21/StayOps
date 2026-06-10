'use client';

import { useState } from 'react';
import {
  Search, Check, X, AlertTriangle, Lock, ChevronRight, Sparkles, Receipt,
} from 'lucide-react';
import type { StatementImport } from '../../_domain';
import type { LiveLine, ReconMath, SessionCounts, Blocker } from '../../_recon2';
import {
  card, money, fmtDate, Badge, LINE_STATUS, RECEIPT_STATUS, PURPLE, type LineStatus,
} from '../../_ui';

/* ── LEFT PANEL: statement lines ──────────────────────────────────────── */
const LINE_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Lines' },
  { key: 'needs-coding', label: 'Needs Coding' },
  { key: 'suggested', label: 'Suggested' },
  { key: 'ready-to-post', label: 'Ready to Post' },
  { key: 'posted', label: 'Posted' },
  { key: 'cleared', label: 'Cleared' },
  { key: 'exceptions', label: 'Exceptions' },
];

export function LinesPanel({ lines, imp, selectedId, onSelect }: {
  lines: LiveLine[]; imp: StatementImport; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const isCard = imp.statementType === 'credit-card';

  const filtered = lines.filter((l) => {
    if (q) {
      const s = q.toLowerCase();
      if (!l.rawDescription.toLowerCase().includes(s) && !(l.coding?.vendor ?? l.suggestedVendor ?? '').toLowerCase().includes(s) && !String(Math.abs(l.amount)).includes(s)) return false;
    }
    switch (tab) {
      case 'needs-coding': return ['imported', 'suggested', 'needs-coding'].includes(l.status);
      case 'suggested': return l.status === 'suggested';
      case 'ready-to-post': return l.status === 'ready-to-post';
      case 'posted': return l.posted && !l.cleared;
      case 'cleared': return l.cleared;
      case 'exceptions': return ['needs-support', 'duplicate', 'timing-difference', 'needs-investigation', 'excluded'].includes(l.status);
      default: return true;
    }
  });

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden h-full" style={card}>
      <div className="px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Statement Lines</p>
          <span className="text-[11px]" style={{ color: '#929292' }}>{lines.length}</span>
        </div>
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg mb-2" style={{ background: '#f7f7f7' }}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description, amount, vendor…" className="flex-1 bg-transparent text-xs outline-none" style={{ color: '#222' }} />
        </div>
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-0.5">
          {LINE_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap" style={{ background: tab === t.key ? '#ece4fb' : 'transparent', color: tab === t.key ? PURPLE : '#6a6a6a' }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && <p className="px-3 py-8 text-center text-xs" style={{ color: '#929292' }}>No lines in this view.</p>}
        {filtered.map((l) => {
          const ls = LINE_STATUS[l.status as LineStatus];
          const active = selectedId === l.id;
          const inDir = isCard ? (l.amount > 0 ? 'Credit' : 'Charge') : (l.amount > 0 ? 'Money In' : 'Money Out');
          return (
            <button key={l.id} onClick={() => onSelect(l.id)} className="w-full text-left px-3 py-2.5 flex flex-col gap-1" style={{ borderBottom: '1px solid #f7f7f7', background: active ? '#f6f4fd' : 'transparent', borderLeft: active ? `3px solid ${PURPLE}` : '3px solid transparent' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px]" style={{ color: '#929292' }}>{fmtDate(l.dateIso)}</span>
                <span className="text-sm font-semibold" style={{ color: l.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(l.amount, { sign: true })}</span>
              </div>
              <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{l.rawDescription}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] truncate" style={{ color: '#6a6a6a' }}>{l.coding?.vendor ?? l.suggestedVendor ?? inDir}</span>
                <Badge label={ls.label} fg={ls.fg} bg={ls.bg} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── RIGHT PANEL: reconciliation summary ──────────────────────────────── */
export function SummaryPanel({ imp, math, counts, blockers, finished, onFinish, onReopen }: {
  imp: StatementImport; math: ReconMath; counts: SessionCounts; blockers: Blocker[];
  finished: boolean; onFinish: () => void; onReopen: () => void;
}) {
  const isCard = imp.statementType === 'credit-card';
  const canFinish = blockers.filter((b) => b.severity === 'high').length === 0 && math.balanced;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
      {/* Difference hero */}
      <div className="p-4 rounded-2xl" style={{ background: math.balanced ? '#dcfce7' : '#fee2e2', border: `1px solid ${math.balanced ? '#bbf7d0' : '#fecaca'}` }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: math.balanced ? '#15803d' : '#b91c1c' }}>Difference</p>
        <p className="text-3xl font-bold mt-0.5" style={{ color: math.balanced ? '#15803d' : '#b91c1c' }}>{money(Math.abs(math.difference))}</p>
        <p className="text-[11px] mt-0.5" style={{ color: math.balanced ? '#15803d' : '#b91c1c' }}>{math.balanced ? 'Cleared balance matches the statement.' : `${isCard ? 'Statement' : 'Statement ending'} balance vs cleared balance.`}</p>
      </div>

      <Panel title="Reconciliation Summary">
        <Line k={isCard ? 'Statement Balance' : 'Beginning Balance'} v={money(isCard ? math.statementBalance : math.beginningBalance)} />
        {!isCard && <Line k="Statement Ending Balance" v={money(math.statementBalance)} />}
        <Line k={isCard ? 'Cleared Charges' : 'Cleared Money In'} v={money(isCard ? math.clearedOut : math.clearedIn)} />
        <Line k={isCard ? 'Cleared Credits' : 'Cleared Money Out'} v={money(isCard ? math.clearedIn : math.clearedOut)} />
        <Line k="Cleared Balance" v={money(math.clearedBalance)} bold />
        <div className="pt-1.5 mt-1" style={{ borderTop: '1px solid #f0f0f0' }}>
          <Line k="Difference" v={money(Math.abs(math.difference))} accent={math.balanced ? '#15803d' : '#b91c1c'} bold />
        </div>
        {isCard && imp.paymentDueDate && <Line k="Payment Due" v={fmtDate(imp.paymentDueDate)} />}
      </Panel>

      <Panel title="Progress">
        <Line k="Lines imported" v={String(counts.total)} />
        <Line k="Lines coded" v={String(counts.total - counts.needsCoding)} />
        <Line k="Lines posted" v={String(counts.posted + counts.cleared + counts.reconciled)} />
        <Line k="Lines cleared" v={String(counts.cleared + counts.reconciled)} />
        {counts.investigation > 0 && <Line k="Needs investigation" v={String(counts.investigation)} accent="#b91c1c" />}
        {counts.missingReceipts > 0 && <Line k="Missing receipts" v={String(counts.missingReceipts)} accent="#b91c1c" />}
        {counts.timingDiffs > 0 && <Line k="Timing differences" v={String(counts.timingDiffs)} accent="#b45309" />}
        {counts.excluded > 0 && <Line k="Excluded" v={String(counts.excluded)} />}
      </Panel>

      {blockers.length > 0 && !finished && (
        <div className="rounded-2xl p-3.5" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2 inline-flex items-center gap-1" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> What's blocking finish</p>
          <ul className="flex flex-col gap-1.5">
            {blockers.map((b, i) => <li key={i} className="text-xs" style={{ color: b.severity === 'high' ? '#b91c1c' : '#b45309' }}>• {b.message}</li>)}
          </ul>
        </div>
      )}

      {finished ? (
        <div className="rounded-2xl p-4 text-center" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
          <Check className="w-6 h-6 mx-auto" style={{ color: '#15803d' }} />
          <p className="text-sm font-bold mt-1" style={{ color: '#15803d' }}>Reconciled</p>
          <button onClick={onReopen} className="text-[11px] font-semibold mt-2" style={{ color: '#6a6a6a' }}>Reopen reconciliation</button>
        </div>
      ) : (
        <button onClick={canFinish ? onFinish : undefined} disabled={!canFinish}
          title={canFinish ? '' : blockers[0]?.message ?? 'Resolve all lines first.'}
          className="h-11 rounded-xl text-sm font-bold w-full" style={{ background: canFinish ? '#15803d' : '#dddddd', color: '#fff', cursor: canFinish ? 'pointer' : 'not-allowed' }}>
          Finish Reconciliation
        </button>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl p-3.5" style={card}><h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>{title}</h3><div className="flex flex-col gap-0.5">{children}</div></div>;
}
export function Line({ k, v, bold, accent = '#222' }: { k: string; v: string; bold?: boolean; accent?: string }) {
  return <div className="flex justify-between gap-3 py-0.5"><span className="text-xs" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-xs" style={{ color: accent, fontWeight: bold ? 700 : 500 }}>{v}</span></div>;
}

/* ── Finish modal ─────────────────────────────────────────────────────── */
export function FinishModal({ imp, math, counts, onClose, onConfirm }: {
  imp: StatementImport; math: ReconMath; counts: SessionCounts; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Finish Reconciliation</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-sm" style={{ color: '#3f3f3f' }}>You are about to finish reconciliation for <b>{imp.accountName}</b> · {imp.month}.</p>
          <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: '#f7f7f7' }}>
            <Line k={imp.statementType === 'credit-card' ? 'Statement Balance' : 'Statement Ending Balance'} v={money(math.statementBalance)} />
            <Line k="Cleared Balance" v={money(math.clearedBalance)} />
            <Line k="Difference" v="$0.00" accent="#15803d" bold />
            <Line k="Lines cleared" v={String(counts.cleared + counts.reconciled)} />
          </div>
          <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>Cleared lines will be locked for this period. Reopening requires permission and is recorded in the audit log.</p>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={onConfirm} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#15803d', color: '#fff' }}>Finish Reconciliation</button>
        </div>
      </div>
    </div>
  );
}
