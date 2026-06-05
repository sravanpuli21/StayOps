'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, reopenReconciliation, type ReconRecord } from '../../_store';
import { reconHistory } from '../../_recon';
import { card, Badge, money, fmtDate } from '../../_ui';
import { ReconTabs } from '../_shared';

export default function HistoryPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const [hotelF, setHotelF] = useState(selection.kind === 'hotel' ? selection.hotelId : 'all');
  const [reopenRec, setReopenRec] = useState<ReconRecord | null>(null);

  const rows = reconHistory(store, hotelF === 'all' ? undefined : hotelF);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReconTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation History</h1><p className="text-sm" style={{ color: '#929292' }}>View completed and reopened reconciliations for all bank accounts and credit cards.</p></div>

      <div className="flex gap-2 flex-wrap">
        <select value={hotelF} onChange={(e) => setHotelF(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]"><option value="all">All Hotels</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName}</option>)}</select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No reconciliation history yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Completed reconciliations will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Completed', 'Hotel', 'Account/Card', 'Type', 'Period', 'Beginning', 'Ending', 'Difference', 'By', 'Status', 'Actions'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 5 && i <= 7 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.finishedIso ? fmtDate(r.finishedIso.slice(0, 10)) : '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{getEntity(r.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.accountName}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.kind === 'bank' ? 'Bank' : 'Credit Card'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.month}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(r.beginningBalance)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(r.endingBalance)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#15803d' }}>$0.00</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.finishedBy ?? '—'}</td>
                  <td className="py-2.5 px-3"><Badge label={r.status === 'reopened' ? 'Reopened' : 'Reconciled'} fg={r.status === 'reopened' ? '#6a4ec0' : '#15803d'} bg={r.status === 'reopened' ? '#ece4fb' : '#dcfce7'} /></td>
                  <td className="py-2.5 px-3"><div className="flex gap-2 whitespace-nowrap"><Link href={`/web/accounting/reconciliation/${encodeURIComponent(r.id)}/report`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View Report</Link>{r.status !== 'reopened' && <button onClick={() => setReopenRec(r)} className="text-xs font-semibold" style={{ color: '#929292' }}>Reopen</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reopenRec && <ReopenModal rec={reopenRec} onClose={() => setReopenRec(null)} />}
    </div>
  );
}

function ReopenModal({ rec, onClose }: { rec: ReconRecord; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const submit = () => { if (!reason.trim()) { setError('Reason is required to reopen reconciliation.'); return; } reopenReconciliation(rec.id, reason.trim()); onClose(); };
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Reopen Reconciliation</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-sm" style={{ color: '#3f3f3f' }}>Reopening this reconciliation will unlock cleared transactions for {rec.accountName} · {rec.month}. This action will be recorded in the activity log.</p>
          <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reason for reopening *</label><textarea value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }} rows={3} className="px-2.5 py-2 rounded-lg text-sm w-full resize-none" style={{ border: '1px solid #dddddd', color: '#222' }} /></div>
          {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}><button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button><button onClick={submit} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Reopen Reconciliation</button></div>
      </div>
    </div>
  );
}
