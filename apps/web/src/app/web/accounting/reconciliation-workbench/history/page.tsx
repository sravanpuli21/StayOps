'use client';

import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useAcctOs } from '../../_context';
import { useStore2 } from '../../_store2';
import { allSessionRows } from '../../_recon2';
import { hotelLabel } from '../../_domain';
import { card, money, Badge, PageHeader, EmptyState, fmtDate, fmtMonth, PURPLE } from '../../_ui';

export default function WorkbenchHistoryPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const rows = allSessionRows(store, hotelId).filter((r) => r.status === 'reconciled');

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/reconciliation-workbench" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Reconciliation Workbench</Link>
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Workbench History" subtitle="Completed reconciliations and their reports." />
      {rows.length === 0 ? (
        <EmptyState title="No completed reconciliations yet." body="Finished reconciliation reports will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Account / Card', 'Type', 'Statement Period', 'Ending Balance', 'Difference', 'Completed By', ''].map((h) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Ending Balance', 'Difference'].includes(h) ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{hotelLabel(r.imp.hotelId).code}</td>
                  <td className="py-2.5 px-3"><p className="text-sm" style={{ color: '#222' }}>{r.imp.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>••{r.imp.accountLast4}</p></td>
                  <td className="py-2.5 px-3">{r.imp.statementType === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.imp.startDate)}–{fmtDate(r.imp.endDate)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{money(r.imp.endingBalance)}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: '#15803d' }}>$0.00</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>Sanjay Narsee</td>
                  <td className="py-2.5 px-3 text-right"><Link href={`/web/accounting/reconciliation-workbench/${r.id}`} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>View Report <ExternalLink className="w-3 h-3" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
