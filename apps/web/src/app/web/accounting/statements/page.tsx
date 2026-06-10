'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus, Landmark, CreditCard, History, ArrowRight, FileSpreadsheet, Inbox,
} from 'lucide-react';
import { HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allSessionRows, type SessionRow } from '../_recon2';
import { hotelLabel } from '../_domain';
import {
  card, money, Badge, PageHeader, Tabs, EmptyState, STATEMENT_STATUS,
  inputStyle, PURPLE, fmtMonth,
} from '../_ui';

/** Map a session row to the statement-inbox status shown in the table. */
function statementStatus(row: SessionRow): keyof typeof STATEMENT_STATUS {
  if (row.imp.seedStatus === 'needs-mapping') return 'needs-mapping';
  if (row.imp.seedStatus === 'failed') return 'failed';
  if (row.status === 'reconciled') return 'reconciled';
  if (row.status === 'ready-to-reconcile') return 'ready-to-reconcile';
  if (row.status === 'not-started') return 'imported';
  return 'in-review';
}

const TABS = [
  { key: 'all', label: 'All Statements' },
  { key: 'needs-mapping', label: 'Needs Mapping' },
  { key: 'ready', label: 'Ready for Review' },
  { key: 'in-workbench', label: 'In Workbench' },
  { key: 'reconciled', label: 'Reconciled' },
  { key: 'failed', label: 'Failed Imports' },
];

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;

  const [tab, setTab] = useState(params.get('tab') ?? 'all');
  const [fType, setFType] = useState('');
  const [fMonth, setFMonth] = useState('');
  const [fStatus, setFStatus] = useState('');

  const rows = useMemo(() => allSessionRows(store, hotelId), [store, hotelId]);

  const filtered = rows.filter((r) => {
    const st = statementStatus(r);
    if (tab === 'needs-mapping' && st !== 'needs-mapping') return false;
    if (tab === 'ready' && !(st === 'imported' || st === 'ready-to-reconcile')) return false;
    if (tab === 'in-workbench' && !(r.status === 'needs-coding' || r.status === 'in-review' || r.status === 'ready-to-post' || r.status === 'difference-found')) return false;
    if (tab === 'reconciled' && st !== 'reconciled') return false;
    if (tab === 'failed' && st !== 'failed') return false;
    if (fType && r.imp.statementType !== fType) return false;
    if (fMonth && r.imp.month !== fMonth) return false;
    if (fStatus && st !== fStatus) return false;
    return true;
  });

  const counts = {
    'needs-mapping': rows.filter((r) => statementStatus(r) === 'needs-mapping').length,
    ready: rows.filter((r) => ['imported', 'ready-to-reconcile'].includes(statementStatus(r))).length,
    'in-workbench': rows.filter((r) => ['needs-coding', 'in-review', 'ready-to-post', 'difference-found'].includes(r.status)).length,
    reconciled: rows.filter((r) => statementStatus(r) === 'reconciled').length,
  };

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'}
        scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Statement Inbox"
        subtitle="Upload bank and credit card statements, then send them into the reconciliation workbench."
        actions={
          <>
            <Link href="/web/accounting/statements/upload" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Upload Statement</Link>
            <Link href="/web/accounting/entities" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Landmark className="w-3.5 h-3.5" /> Add Bank Account</Link>
            <Link href="/web/accounting/entities" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><CreditCard className="w-3.5 h-3.5" /> Add Credit Card</Link>
            <Link href="/web/accounting/documents" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><History className="w-3.5 h-3.5" /> Import History</Link>
          </>
        }
      />

      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))} active={tab} onChange={setTab} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={fType} onChange={(e) => setFType(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Statement Types</option>
          <option value="bank">Bank Statement</option>
          <option value="credit-card">Credit Card Statement</option>
        </select>
        <select value={fMonth} onChange={(e) => setFMonth(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Months</option>
          {['2026-05', '2026-04', '2026-03'].map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Statuses</option>
          {Object.entries(STATEMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{filtered.length} statement{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Inbox className="w-8 h-8" />} title="No statements here yet." body="Upload a bank or credit card statement to begin." />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {(hotelId
                  ? ['Month', 'Type', 'Account / Card', 'File', 'Rows', 'Need Review', 'Posted', 'Difference', 'Status', '']
                  : ['Month', 'Hotel', 'Code', 'Type', 'Account / Card', 'Rows', 'Need Review', 'Posted', 'Difference', 'Status', '']
                ).map((h, i) => (
                  <th key={h + i} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Rows', 'Need Review', 'Posted', 'Difference'].includes(h) ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const st = STATEMENT_STATUS[statementStatus(r)];
                const hl = hotelLabel(r.imp.hotelId);
                const diff = r.math.difference;
                const action = r.status === 'reconciled' ? { label: 'View Report', href: `/web/accounting/reconciliation-workbench/${r.id}` }
                  : statementStatus(r) === 'needs-mapping' ? { label: 'Continue Mapping', href: `/web/accounting/statements/upload?resume=${r.id}` }
                  : { label: 'Open Workbench', href: `/web/accounting/reconciliation-workbench/${r.id}` };
                return (
                  <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(action.href)}>
                    <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: '#222' }}>{fmtMonth(r.imp.month)}</td>
                    {!hotelId && <td className="py-2.5 px-3"><p className="text-sm font-medium truncate max-w-[200px]" style={{ color: '#222' }}>{hl.name}</p><p className="text-[11px] truncate max-w-[200px]" style={{ color: '#929292' }}>{hl.legal}</p></td>}
                    {!hotelId && <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{hl.code}</td>}
                    <td className="py-2.5 px-3">{r.imp.statementType === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                    <td className="py-2.5 px-3"><p className="text-sm" style={{ color: '#222' }}>{r.imp.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{r.imp.institution} · ••{r.imp.accountLast4}</p></td>
                    {hotelId && <td className="py-2.5 px-3 text-xs truncate max-w-[160px]" style={{ color: '#6a6a6a' }}><FileSpreadsheet className="w-3 h-3 inline mr-1" />{r.imp.fileName}</td>}
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.counts.total}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: r.counts.needsCoding ? '#b45309' : '#15803d' }}>{r.counts.needsCoding}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.counts.posted + r.counts.cleared + r.counts.reconciled}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: Math.abs(diff) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(diff))}</td>
                    <td className="py-2.5 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <Link href={action.href} className="text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1" style={{ color: PURPLE }}>{action.label} <ArrowRight className="w-3 h-3" /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StatementInboxPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
