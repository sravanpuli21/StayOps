'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Search, FileText, ExternalLink, Plus, Download } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allImports, liveLines } from '../_recon2';
import { resolutionLabel, hotelLabel } from '../_domain';
import { card, money, fmtDate, Badge, PageHeader, EmptyState, inputStyle, PURPLE } from '../_ui';

interface LedgerRow {
  id: string; number: string; dateIso: string; hotelId: string; description: string;
  vendor?: string; resolution: string; category?: string; debit: number; credit: number;
  sessionId: string; lineId: string;
}

export default function TransactionsPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [q, setQ] = useState('');
  const [fType, setFType] = useState('');

  const rows = useMemo<LedgerRow[]>(() => {
    // Posted journal entries from the store, joined back to their statement line.
    const out: LedgerRow[] = [];
    const imps = allImports(store, hotelId);
    imps.forEach((imp) => {
      const lines = liveLines(store, imp.id);
      lines.forEach((l) => {
        if (!l.posted || l.status === 'excluded') return;
        const je = store.journals.find((j) => j.lineId === l.id);
        const debit = je ? je.lines.reduce((s, x) => s + x.debit, 0) : Math.abs(l.amount);
        const credit = je ? je.lines.reduce((s, x) => s + x.credit, 0) : Math.abs(l.amount);
        out.push({
          id: l.id, number: je?.number ?? `JE-${imp.id.slice(-4)}`, dateIso: l.dateIso, hotelId: l.hotelId,
          description: l.rawDescription, vendor: l.coding?.vendor ?? l.suggestedVendor,
          resolution: resolutionLabel(l.coding?.resolution ?? l.suggestedResolution),
          category: l.coding?.categoryName ?? l.suggestedCategoryName,
          debit, credit, sessionId: imp.id, lineId: l.id,
        });
      });
    });
    return out.sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
  }, [store, hotelId]);

  const filtered = rows.filter((r) => {
    if (q) { const s = q.toLowerCase(); if (!r.description.toLowerCase().includes(s) && !(r.vendor ?? '').toLowerCase().includes(s) && !(r.category ?? '').toLowerCase().includes(s) && !r.number.toLowerCase().includes(s)) return false; }
    if (fType && r.resolution !== fType) return false;
    return true;
  });

  const types = [...new Set(rows.map((r) => r.resolution))];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Transactions"
        subtitle="A searchable ledger of accounting transactions after they are posted from the workbench."
        actions={
          <>
            <Link href="/web/accounting/reconciliation-workbench" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Add Transaction</Link>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-sm" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description, vendor, account, JE #…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        <select value={fType} onChange={(e) => setFType(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Resolution Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{filtered.length} posted transaction{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ArrowLeftRight className="w-8 h-8" />} title="No posted transactions yet." body="Post statement lines from the Reconciliation Workbench and they appear here as accounting transactions." />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['JE #', 'Date', ...(hotelId ? [] : ['Hotel']), 'Description', 'Vendor', 'Type', 'Account', 'Debit', 'Credit', ''].map((h) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Debit', 'Credit'].includes(h) ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: PURPLE }}>{r.number}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.dateIso)}</td>
                  {!hotelId && <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(r.hotelId)?.propertyCode}</td>}
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.description}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.vendor ?? '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={r.resolution} fg="#1d4ed8" bg="#dbeafe" /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.category ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-medium" style={{ color: '#222' }}>{money(r.debit)}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-medium" style={{ color: '#222' }}>{money(r.credit)}</td>
                  <td className="py-2.5 px-3"><Link href={`/web/accounting/reconciliation-workbench/${r.sessionId}`} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Source <ExternalLink className="w-3 h-3" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
