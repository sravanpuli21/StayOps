'use client';

import { useMemo, useState } from 'react';
import { FolderOpen, FileText, Receipt, Upload, FolderPlus, Download, Landmark, CreditCard, FileCheck2, Search } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allImports, liveLines, allSessionRows } from '../_recon2';
import { getEntity } from '@hos/shared/accounting-os';
import { hotelLabel } from '../_domain';
import { card, Badge, PageHeader, EmptyState, inputStyle, PURPLE, fmtDate } from '../_ui';

type DocType = 'Bank Statement' | 'Credit Card Statement' | 'Reconciliation Report' | 'Receipt';
interface Doc { name: string; hotelId: string; type: DocType; ts: string; desc?: string }

const TYPE_META: Record<DocType, { icon: React.ReactNode; fg: string; bg: string }> = {
  'Bank Statement': { icon: <Landmark className="w-4 h-4" />, fg: '#1d4ed8', bg: '#dbeafe' },
  'Credit Card Statement': { icon: <CreditCard className="w-4 h-4" />, fg: '#b45309', bg: '#fef3c7' },
  'Reconciliation Report': { icon: <FileCheck2 className="w-4 h-4" />, fg: '#15803d', bg: '#dcfce7' },
  Receipt: { icon: <Receipt className="w-4 h-4" />, fg: '#6a4ec0', bg: '#ece4fb' },
};

export default function DocumentsPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [q, setQ] = useState('');
  const [fType, setFType] = useState<DocType | ''>('');

  const docs = useMemo<Doc[]>(() => {
    const out: Doc[] = [];
    // Statement files (every uploaded/seeded statement has a source file).
    allImports(store, hotelId).forEach((imp) => {
      out.push({ name: imp.fileName, hotelId: imp.hotelId, type: imp.statementType === 'bank' ? 'Bank Statement' : 'Credit Card Statement', ts: imp.endDate, desc: `${imp.accountName} ••${imp.accountLast4} · ${imp.month}` });
    });
    // Reconciliation reports for completed reconciliations.
    allSessionRows(store, hotelId).filter((r) => r.status === 'reconciled').forEach((r) => {
      out.push({ name: `reconciliation-${r.imp.accountName.toLowerCase().replace(/\s+/g, '-')}-${r.imp.month}.pdf`, hotelId: r.imp.hotelId, type: 'Reconciliation Report', ts: r.imp.endDate, desc: `${r.imp.accountName} · ${r.imp.month} · reconciled` });
    });
    // Receipts: attached this session + required-receipt lines on posted statements.
    store.docs.filter((d) => !hotelId || d.hotelId === hotelId).forEach((d) => out.push({ name: d.name, hotelId: d.hotelId, type: 'Receipt', ts: d.ts, desc: 'Attached in workbench' }));
    allImports(store, hotelId).forEach((imp) => liveLines(store, imp.id).forEach((l) => {
      if (l.coding?.receiptName) out.push({ name: l.coding.receiptName, hotelId: l.hotelId, type: 'Receipt', ts: l.dateIso, desc: l.rawDescription });
      else if (l.receiptRequirement === 'required' && (l.posted || l.cleared)) out.push({ name: `receipt-${l.rawDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}.pdf`, hotelId: l.hotelId, type: 'Receipt', ts: l.dateIso, desc: `${l.rawDescription} · attached` });
    }));
    const seen = new Set<string>();
    return out.filter((d) => (seen.has(d.name + d.hotelId) ? false : (seen.add(d.name + d.hotelId), true)));
  }, [store, hotelId]);

  const filtered = docs.filter((d) => {
    if (fType && d.type !== fType) return false;
    if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !(d.desc ?? '').toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (a.ts > b.ts ? -1 : 1));

  const counts = (Object.keys(TYPE_META) as DocType[]).map((t) => ({ t, n: docs.filter((d) => d.type === t).length }));

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Documents" subtitle="Statements, reconciliation reports, and receipts for this hotel's books."
        actions={
          <>
            <button className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Upload className="w-4 h-4" /> Upload Document</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FolderPlus className="w-3.5 h-3.5" /> Create Folder</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </>
        } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counts.map(({ t, n }) => (
          <button key={t} onClick={() => setFType(fType === t ? '' : t)} className="p-3.5 flex items-center gap-2.5 rounded-2xl text-left" style={{ ...card, outline: fType === t ? `2px solid ${PURPLE}` : 'none' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: TYPE_META[t].bg, color: TYPE_META[t].fg }}>{TYPE_META[t].icon}</div>
            <div><p className="text-lg font-bold" style={{ color: '#222' }}>{n}</p><p className="text-[11px]" style={{ color: '#929292' }}>{t}s</p></div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-sm" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        {fType && <button onClick={() => setFType('')} className="h-9 px-3 rounded-lg text-xs font-semibold" style={{ background: '#ece4fb', color: PURPLE }}>Clear filter: {fType}</button>}
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{filtered.length} documents</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen className="w-8 h-8" />} title="No documents match." body="Try clearing filters, or upload a document." />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {filtered.map((d, i) => {
            const m = TYPE_META[d.type];
            return (
              <div key={d.name + d.hotelId + i} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.bg, color: m.fg }}>{m.icon}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: '#222' }}>{d.name}</p><p className="text-[11px] truncate" style={{ color: '#929292' }}>{getEntity(d.hotelId)?.propertyCode} · {d.desc ?? ''} · {fmtDate(d.ts)}</p></div>
                <Badge label={d.type} fg={m.fg} bg={m.bg} />
                <button className="text-xs font-semibold" style={{ color: PURPLE }}>View</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
