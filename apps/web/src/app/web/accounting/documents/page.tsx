'use client';

import { FolderOpen, FileText, Receipt, Upload, FolderPlus, Download } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allImports, liveLines } from '../_recon2';
import { getEntity } from '@hos/shared/accounting-os';
import { hotelLabel } from '../_domain';
import { card, Badge, PageHeader, EmptyState, PURPLE } from '../_ui';

export default function DocumentsPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;

  // Receipts attached to lines (from store), plus uploaded docs.
  const docs: { name: string; hotelId: string; type: string; ts: string; desc?: string }[] = [];
  store.docs.filter((d) => !hotelId || d.hotelId === hotelId).forEach((d) => docs.push({ name: d.name, hotelId: d.hotelId, type: 'Receipt', ts: d.ts, desc: 'Attached in workbench' }));
  allImports(store, hotelId).forEach((imp) => liveLines(store, imp.id).forEach((l) => { if (l.coding?.receiptName) docs.push({ name: l.coding.receiptName, hotelId: l.hotelId, type: 'Receipt', ts: l.dateIso, desc: l.rawDescription }); }));
  const seen = new Set<string>();
  const unique = docs.filter((d) => (seen.has(d.name) ? false : (seen.add(d.name), true)));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Documents" subtitle="Receipts and supporting documents attached to statement lines."
        actions={
          <>
            <button className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Upload className="w-4 h-4" /> Upload Document</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FolderPlus className="w-3.5 h-3.5" /> Create Folder</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </>
        } />
      {unique.length === 0 ? (
        <EmptyState icon={<FolderOpen className="w-8 h-8" />} title="No documents yet." body="Attach receipts to statement lines in the workbench and they appear here." />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {unique.map((d, i) => (
            <div key={d.name + i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #f7f7f7' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f0eefb' }}><Receipt className="w-4 h-4" style={{ color: PURPLE }} /></div>
              <div className="flex-1"><p className="text-sm font-medium" style={{ color: '#222' }}>{d.name}</p><p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(d.hotelId)?.propertyCode} · {d.desc ?? ''}</p></div>
              <Badge label={d.type} fg="#1d4ed8" bg="#dbeafe" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
