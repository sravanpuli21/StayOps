'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox, ClipboardList, Send, CheckCheck, AlertTriangle, Receipt, CalendarCheck, ArrowRight,
  Building2, FileSpreadsheet, Search as SearchIcon,
} from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allSessionRows, portfolioSummary } from '../_recon2';
import { hotelLabel } from '../_domain';
import { card, money, Badge, PageHeader, Kpi, SESSION_STATUS, PURPLE, fmtMonth } from '../_ui';

export default function DashboardPage() {
  const { selection, selectHotel } = useAcctOs();
  if (selection.kind === 'all') return <Portfolio onOpenHotel={selectHotel} />;
  return <HotelView hotelId={selection.hotelId} />;
}

/* ─────────────── ALL HOTELS ─────────────── */
function Portfolio({ onOpenHotel }: { onOpenHotel: (id: string) => void }) {
  const router = useRouter();
  const store = useStore2();
  const sum = portfolioSummary(store);
  const rows = allSessionRows(store);

  const goWB = (tab: string) => router.push(`/web/accounting/reconciliation-workbench?tab=${tab}`);

  // per-hotel rollups
  const hotelRows = HOTEL_ENTITIES.map((h) => {
    const hr = rows.filter((r) => r.imp.hotelId === h.id);
    return {
      h,
      statements: hr.length,
      needsCoding: hr.reduce((s, r) => s + r.counts.needsCoding, 0),
      reconciled: hr.filter((r) => r.status === 'reconciled').length,
      difference: hr.filter((r) => r.status === 'difference-found').length,
      ready: hr.filter((r) => r.status === 'ready-to-reconcile').length,
    };
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      <PageHeader scope="All Hotels" title="Statement-to-Books Dashboard" subtitle="Where every bank and card statement stands on its way to closed books — across all 16 HOS hotels." />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Kpi icon={<Inbox className="w-4 h-4" />} label="Statements" value={String(sum.statements)} onClick={() => router.push('/web/accounting/statements')} />
        <Kpi icon={<ClipboardList className="w-4 h-4" />} label="Lines to Code" value={String(sum.linesToCode)} accent={sum.linesToCode ? '#b45309' : '#15803d'} onClick={() => goWB('needs-coding')} />
        <Kpi icon={<Send className="w-4 h-4" />} label="Ready to Post" value={String(sum.readyToPost)} accent="#1d4ed8" onClick={() => goWB('ready-to-post')} />
        <Kpi icon={<CheckCheck className="w-4 h-4" />} label="Posted & Cleared" value={String(sum.cleared)} accent="#15803d" />
        <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Differences" value={String(sum.differences)} accent={sum.differences ? '#b91c1c' : '#15803d'} onClick={() => goWB('difference')} />
        <Kpi icon={<Receipt className="w-4 h-4" />} label="Missing Receipts" value={String(sum.missingReceipts)} accent={sum.missingReceipts ? '#b91c1c' : '#15803d'} onClick={() => goWB('missing-support')} />
        <Kpi icon={<CalendarCheck className="w-4 h-4" />} label="Close Blockers" value={String(sum.blockers)} accent={sum.blockers ? '#b91c1c' : '#15803d'} onClick={() => router.push('/web/accounting/month-close')} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reconciliation by Hotel · {fmtMonth('2026-05')}</h2>
          <Link href="/web/accounting/reconciliation-workbench" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Workbench <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Code', 'Statements', 'Needs Coding', 'Difference', 'Ready', 'Reconciled', ''].map((h, i) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 2 && i <= 6 ? 'center' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {hotelRows.map(({ h, statements, needsCoding, reconciled, difference, ready }, i) => (
                <tr key={h.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < hotelRows.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => { onOpenHotel(h.id); router.push('/web/accounting/dashboard'); }}>
                  <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a6a6a' }}>{statements}</td>
                  <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: needsCoding ? '#b45309' : '#15803d' }}>{needsCoding}</td>
                  <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: difference ? '#b91c1c' : '#c1c1c1' }}>{difference || '—'}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: ready ? PURPLE : '#c1c1c1' }}>{ready || '—'}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#15803d' }}>{reconciled}/{statements}</td>
                  <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>Open</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Start Here</h2>
          <div className="grid grid-cols-1 gap-3">
            <Shortcut icon={<FileSpreadsheet className="w-5 h-5" />} title="Upload a statement" sub="Bring a bank or card CSV into the inbox" href="/web/accounting/statements/upload" />
            <Shortcut icon={<CheckCheck className="w-5 h-5" />} title="Open the workbench" sub="Code, post, clear, and reconcile lines" href="/web/accounting/reconciliation-workbench" />
            <Shortcut icon={<CalendarCheck className="w-5 h-5" />} title="Run month close" sub="See what's blocking each hotel's close" href="/web/accounting/month-close" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reports</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Profit & Loss', 'Balance Sheet', 'Trial Balance', 'Reconciliation Report'].map((r) => (
              <Link key={r} href="/web/accounting/reports" className="p-4 rounded-2xl text-sm font-medium hover:shadow-md transition-shadow" style={{ ...card, color: '#222' }}>{r}<ArrowRight className="w-3.5 h-3.5 mt-2" style={{ color: PURPLE }} /></Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────── SINGLE HOTEL ─────────────── */
function HotelView({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const store = useStore2();
  const h = getEntity(hotelId);
  if (!h) return <p className="text-sm" style={{ color: '#929292' }}>Hotel not found.</p>;
  const sum = portfolioSummary(store, hotelId);
  const rows = allSessionRows(store, hotelId);
  const bank = rows.filter((r) => r.imp.statementType === 'bank').length;
  const card_ = rows.filter((r) => r.imp.statementType === 'credit-card').length;
  const reconciled = rows.filter((r) => r.status === 'reconciled').length;
  const closeStatus = reconciled === rows.length && rows.length > 0 ? 'Ready to Close' : sum.blockers ? 'Blocked' : 'In Progress';

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <PageHeader scope={hotelLabel(hotelId).name} scopeFg="#1d4ed8" scopeBg="#dbeafe" title={`${h.hotelName} · Accounting`} subtitle={`${h.legalEntity} · ${h.propertyCode} · ${h.rooms} rooms`} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Kpi icon={<Inbox className="w-4 h-4" />} label="Bank Stmts" value={String(bank)} />
        <Kpi icon={<Inbox className="w-4 h-4" />} label="Card Stmts" value={String(card_)} />
        <Kpi icon={<ClipboardList className="w-4 h-4" />} label="To Code" value={String(sum.linesToCode)} accent={sum.linesToCode ? '#b45309' : '#15803d'} onClick={() => router.push('/web/accounting/reconciliation-workbench?tab=needs-coding')} />
        <Kpi icon={<Send className="w-4 h-4" />} label="Ready" value={String(sum.readyToPost)} accent="#1d4ed8" />
        <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Difference" value={String(sum.differences)} accent={sum.differences ? '#b91c1c' : '#15803d'} />
        <Kpi icon={<Receipt className="w-4 h-4" />} label="Missing Rcpts" value={String(sum.missingReceipts)} accent={sum.missingReceipts ? '#b91c1c' : '#15803d'} />
        <Kpi icon={<CheckCheck className="w-4 h-4" />} label="Reconciled" value={`${reconciled}/${rows.length}`} accent="#15803d" />
        <Kpi icon={<CalendarCheck className="w-4 h-4" />} label="Close" value={closeStatus} accent={closeStatus === 'Ready to Close' ? '#15803d' : closeStatus === 'Blocked' ? '#b91c1c' : '#1d4ed8'} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Statements &amp; Workbench Sessions</h2>
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Account / Card', 'Type', 'Month', 'Lines', 'Needs Coding', 'Difference', 'Status', ''].map((x, i) => (
                <th key={x} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: ['Lines', 'Needs Coding', 'Difference'].includes(x) ? 'right' : 'left' }}>{x}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const st = SESSION_STATUS[r.status];
                return (
                  <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => router.push(`/web/accounting/reconciliation-workbench/${r.id}`)}>
                    <td className="py-2.5 px-3"><p className="text-sm" style={{ color: '#222' }}>{r.imp.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>••{r.imp.accountLast4}</p></td>
                    <td className="py-2.5 px-3">{r.imp.statementType === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtMonth(r.imp.month)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.counts.total}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: r.counts.needsCoding ? '#b45309' : '#15803d' }}>{r.counts.needsCoding}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: Math.abs(r.math.difference) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(r.math.difference))}</td>
                    <td className="py-2.5 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                    <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>Open</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Shortcut({ icon, title, sub, href }: { icon: React.ReactNode; title: string; sub: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 rounded-2xl hover:shadow-md transition-shadow" style={card}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb', color: PURPLE }}>{icon}</div>
      <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#222' }}>{title}</p><p className="text-xs" style={{ color: '#929292' }}>{sub}</p></div>
      <ArrowRight className="w-4 h-4" style={{ color: PURPLE }} />
    </Link>
  );
}
