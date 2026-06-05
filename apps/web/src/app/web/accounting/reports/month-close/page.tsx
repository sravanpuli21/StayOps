'use client';

import { HOTEL_ENTITIES, getEntity, closeForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, isClosed } from '../../_store';
import { card, Badge } from '../../_ui';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

const MONTH = '2026-05';

export default function MonthCloseReportsPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const store = useAcctState();
  const ids = single ? [selection.hotelId] : HOTEL_ENTITIES.map((h) => h.id);

  const rows = ids.map((id) => {
    const c = closeForHotel(id);
    const closed = isClosed(store, id, MONTH);
    const status = closed ? 'Closed' : c?.status === 'ready-to-close' ? 'Ready to Close' : (c && (c.toReview > 0 || c.missingReceipts > 0 || !c.reconciled)) ? 'Blocked' : 'In Progress';
    return { id, c, status };
  });

  const cmp = (ok: boolean, label: string) => <span className="text-xs" style={{ color: ok ? '#15803d' : '#b45309' }}>{label}</span>;

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="close-reports" title="Month Close Status" subtitle="Close readiness across hotels: transactions, receipts, reconciliation, reports." scopeLabel={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Month Close Status</h2><ReportMeta company={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} period="May 2026" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Transactions Reviewed', 'Receipts Complete', 'Reconciliation', 'Reports Reviewed', 'Close Status'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(({ id, c, status }) => (
                <tr key={id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{getEntity(id)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(id)?.propertyCode}</td>
                  <td className="py-2.5 px-3">{cmp(!!c?.txReviewed, c?.txReviewed ? 'Complete' : `${c?.toReview ?? 0} Pending`)}</td>
                  <td className="py-2.5 px-3">{cmp(!!c?.receiptsComplete, c?.receiptsComplete ? 'Complete' : `${c?.missingReceipts ?? 0} Missing`)}</td>
                  <td className="py-2.5 px-3">{cmp(!!c?.reconciled, c?.reconciled ? 'Complete' : 'In Progress')}</td>
                  <td className="py-2.5 px-3">{cmp(status === 'Closed' || status === 'Ready to Close', status === 'Closed' || status === 'Ready to Close' ? 'Complete' : 'Not Started')}</td>
                  <td className="py-2.5 px-3"><Badge label={status} fg={status === 'Closed' || status === 'Ready to Close' ? '#15803d' : status === 'Blocked' ? '#b91c1c' : '#b45309'} bg={status === 'Closed' || status === 'Ready to Close' ? '#dcfce7' : status === 'Blocked' ? '#fee2e2' : '#fef3c7'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
