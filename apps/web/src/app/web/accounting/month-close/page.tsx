'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Check, X, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2, closeMonth, reopenMonth } from '../_store2';
import { portfolioSummary } from '../_recon2';
import { hotelLabel, RECON_MONTH } from '../_domain';
import { card, Badge, PageHeader, CLOSE_STATUS, PURPLE, fmtMonth } from '../_ui';
// Single source of truth for close status — shared with the dashboard so the
// "ready to close" / "blocked" counts always match across the app.
import { closeForHotel } from '../dashboard/_data';

export default function MonthClosePage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  if (hotelId) return <HotelClose hotelId={hotelId} />;
  return <PortfolioClose />;
}

function PortfolioClose() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const store = useStore2();
  const data = HOTEL_ENTITIES.map((h) => ({ h, ...closeForHotel(store, h.id) }));
  const ready = data.filter((d) => d.status === 'ready-to-close').length;
  const closed = data.filter((d) => d.closed).length;
  const blocked = data.filter((d) => d.status === 'blocked').length;

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <PageHeader scope="All Hotels" title="Month Close" subtitle={`Close depends on the workbench: every statement line resolved, posted, cleared, and reconciled. ${fmtMonth(RECON_MONTH)}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Hotels" value={String(HOTEL_ENTITIES.length)} />
        <Card label="Ready to Close" value={String(ready)} accent="#b45309" />
        <Card label="Closed" value={String(closed)} accent="#15803d" />
        <Card label="Blocked" value={String(blocked)} accent="#b91c1c" />
      </div>
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            {['Hotel', 'Code', 'Checklist', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {data.map(({ h, checklist, status }, i) => {
              const cs = CLOSE_STATUS[status];
              const done = checklist.filter((c) => c.done).length;
              return (
                <tr key={h.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < data.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => { selectHotel(h.id); router.push('/web/accounting/month-close'); }}>
                  <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3"><div className="flex items-center gap-2"><div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}><div className="h-full" style={{ width: `${(done / checklist.length) * 100}%`, background: done === checklist.length ? '#15803d' : PURPLE }} /></div><span className="text-[11px]" style={{ color: '#929292' }}>{done}/{checklist.length}</span></div></td>
                  <td className="py-2.5 px-3"><Badge label={cs.label} fg={cs.fg} bg={cs.bg} /></td>
                  <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{status === 'closed' ? 'View' : status === 'blocked' ? 'View Issues' : 'Continue'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HotelClose({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const store = useStore2();
  const h = getEntity(hotelId)!;
  const { checklist, status, closed, canClose } = closeForHotel(store, hotelId);
  const cs = CLOSE_STATUS[status];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelLabel(hotelId).name} scopeFg="#1d4ed8" scopeBg="#dbeafe"
        title={`Month Close · ${fmtMonth(RECON_MONTH)}`} subtitle={`${h.legalEntity} · ${h.propertyCode}`}
        actions={<Badge label={cs.label} fg={cs.fg} bg={cs.bg} />}
      />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold" style={{ color: '#222' }}>Close Checklist</h2><p className="text-xs" style={{ color: '#929292' }}>Every item is driven automatically by the workbench.</p></div>
        {checklist.map((c, i) => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < checklist.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.done ? '#dcfce7' : '#fee2e2' }}>
              {c.done ? <Check className="w-3.5 h-3.5" style={{ color: '#15803d' }} /> : <X className="w-3.5 h-3.5" style={{ color: '#b91c1c' }} />}
            </div>
            <span className="text-sm flex-1" style={{ color: c.done ? '#222' : '#b91c1c' }}>{c.label}</span>
            {!c.done && <button onClick={() => router.push('/web/accounting/reconciliation-workbench')} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Fix in Workbench <ArrowRight className="w-3 h-3" /></button>}
          </div>
        ))}
      </div>

      {!canClose && !closed && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>Month close is blocked until every checklist item is complete. Resolve the open items in the Reconciliation Workbench.</span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {closed ? (
          <button onClick={() => reopenMonth(hotelId, RECON_MONTH)} className="h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Lock className="w-4 h-4" /> Reopen Month</button>
        ) : (
          <button onClick={canClose ? () => closeMonth(hotelId, RECON_MONTH, `${h.hotelName} · ${RECON_MONTH}`) : undefined} disabled={!canClose} className="h-10 px-5 rounded-xl text-sm font-bold inline-flex items-center gap-2" style={{ background: canClose ? '#15803d' : '#dddddd', color: '#fff', cursor: canClose ? 'pointer' : 'not-allowed' }}><CalendarCheck className="w-4 h-4" /> Close {fmtMonth(RECON_MONTH)}</button>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-xl font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}
