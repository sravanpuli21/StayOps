'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox, ClipboardList, Send, CheckCheck, AlertTriangle, Receipt, CalendarCheck, CalendarX2,
  ArrowRight, Building2, FileSpreadsheet, Landmark, CreditCard, Wand2, Clock, Plus, FileText,
  TrendingUp, ChevronRight, CircleDollarSign, ListChecks,
} from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { portfolioSummary, allSessionRows } from '../_recon2';
import { hotelLabel, RECON_MONTH } from '../_domain';
import { card, money, moneyShort, Badge, PageHeader, SESSION_STATUS, CLOSE_STATUS, PURPLE, fmtMonth, fmtDate, EmptyState } from '../_ui';
import { buildPnl } from '../reports/_reports';
import {
  closeForHotel, portfolioClose, pipelineCounts, dashboardTasks, dashboardExceptions,
  reconDashRows, cashPosition, recentActivity, dashboardAlert, type DashTask, type DashException, type ReconDashRow,
} from './_data';
import {
  SummaryCard, SectionHeader, AlertBar, PriorityBadge, Pipeline, PrimaryLink, GhostLink, type CardTone,
} from './_components';

export default function DashboardPage() {
  const { selection, selectHotel } = useAcctOs();
  if (selection.kind === 'all') return <Portfolio onOpenHotel={selectHotel} />;
  return <HotelView hotelId={selection.hotelId} />;
}

const WB = '/web/accounting/reconciliation-workbench';

/* ═══════════════════════════ ALL HOTELS ═══════════════════════════ */
function Portfolio({ onOpenHotel }: { onOpenHotel: (id: string) => void }) {
  const router = useRouter();
  const store = useStore2();
  const sum = useMemo(() => portfolioSummary(store), [store]);
  const closes = useMemo(() => portfolioClose(store), [store]);
  const pipeline = useMemo(() => pipelineCounts(store), [store]);
  const tasks = useMemo(() => dashboardTasks(store), [store]);
  const exceptions = useMemo(() => dashboardExceptions(store), [store]);
  const reconRows = useMemo(() => reconDashRows(store).filter((r) => r.status !== 'not-started' || Math.abs(r.difference) > 0).slice(0, 8), [store]);
  const cash = useMemo(() => cashPosition(store), [store]);
  const activity = useMemo(() => recentActivity(store), [store]);
  const alert = useMemo(() => dashboardAlert(store), [store]);
  const recentImports = useMemo(() => allSessionRows(store).slice(0, 6), [store]);

  const readyToClose = closes.filter((c) => c.status === 'ready-to-close').length;
  const blocked = closes.filter((c) => c.status === 'blocked').length;
  const reportsReady = closes.filter((c) => c.reconciledCount > 0).length;

  const goWB = (tab: string) => router.push(`${WB}?tab=${tab}`);
  const openHotel = (id: string) => { onOpenHotel(id); router.push('/web/accounting/dashboard'); };

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-6">
      <PageHeader
        scope="All Hotels"
        title="Accounting Dashboard"
        subtitle="Portfolio accounting status across HOS Management hotel entities."
        actions={
          <>
            <PrimaryLink href={WB}>Open Reconciliation Workbench</PrimaryLink>
            <GhostLink href="/web/accounting/statements/upload"><FileSpreadsheet className="w-3.5 h-3.5" /> Upload Statement</GhostLink>
            <GhostLink href="/web/accounting/month-close"><CalendarCheck className="w-3.5 h-3.5" /> Review Month Close</GhostLink>
            <GhostLink href="/web/accounting/reports"><FileText className="w-3.5 h-3.5" /> Run Reports</GhostLink>
          </>
        }
      />

      {alert && (
        <AlertBar alert={alert} actions={
          <>
            <button onClick={() => router.push('/web/accounting/month-close')} className="h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>View Blockers</button>
            <button onClick={() => router.push('/web/accounting/month-close')} className="h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: alert.severity === 'critical' ? '#b91c1c' : '#b45309', color: '#fff' }}>Open Month Close</button>
          </>
        } />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Inbox className="w-4 h-4" />} value={String(sum.statements)} label="Statements Uploaded" subtext="This period" tone="neutral" href="/web/accounting/statements" />
        <SummaryCard icon={<ClipboardList className="w-4 h-4" />} value={String(sum.linesToCode)} label="Lines Needing Coding" subtext="Bank & card lines waiting" tone={sum.linesToCode ? 'warning' : 'good'} onClick={() => goWB('needs-coding')} />
        <SummaryCard icon={<Send className="w-4 h-4" />} value={String(sum.readyToPost)} label="Ready to Post" subtext="Coded lines ready to post" tone="brand" onClick={() => goWB('ready-to-post')} />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={String(sum.differences)} label="Reconciliation Differences" subtext="Accounts not matching" tone={sum.differences ? 'critical' : 'good'} onClick={() => goWB('difference')} />
        <SummaryCard icon={<Receipt className="w-4 h-4" />} value={String(sum.missingReceipts)} label="Missing Receipts" subtext="Blocking posting or close" tone={sum.missingReceipts ? 'critical' : 'good'} onClick={() => goWB('missing-support')} />
        <SummaryCard icon={<CheckCheck className="w-4 h-4" />} value={String(sum.readyToReconcile)} label="Ready to Finish" subtext="Difference is $0.00" tone="brand" onClick={() => goWB('difference')} />
        <SummaryCard icon={<CalendarX2 className="w-4 h-4" />} value={`${blocked} Hotels`} label="Month Close Blockers" subtext={`${fmtMonth(RECON_MONTH)} close blocked`} tone={blocked ? 'critical' : 'good'} href="/web/accounting/month-close" />
        <SummaryCard icon={<CalendarCheck className="w-4 h-4" />} value={String(readyToClose)} label="Hotels Ready to Close" subtext="All required checks complete" tone={readyToClose ? 'good' : 'neutral'} href="/web/accounting/month-close" />
      </div>

      {/* Today's accounting work */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Today's Accounting Work" subtitle="Start with the items blocking reconciliation and month close." action={<Link href={WB} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Workbench <ArrowRight className="w-3 h-3" /></Link>} />
        {tasks.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
            <CheckCheck className="w-7 h-7 mx-auto mb-1" style={{ color: '#15803d' }} />
            <p className="text-sm font-bold" style={{ color: '#15803d' }}>Accounting work is up to date.</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>All statement lines are coded, posted, cleared, and reconciled for the period.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">{tasks.map((t, i) => <TaskCard key={i} t={t} />)}</div>
        )}
      </section>

      {/* Pipeline */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Statement-to-Books Pipeline" subtitle="How statement lines move from import to reconciled books." />
        <Pipeline stages={pipeline} />
      </section>

      {/* Hotel accounting status */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Hotel Accounting Status" subtitle="Which hotels are clean, blocked, or ready to close." action={<Link href="/web/accounting/entities" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Hotel Entities <ArrowRight className="w-3 h-3" /></Link>} />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Code', 'Statements', 'Needs Coding', 'Ready', 'Missing Rcpts', 'Difference', 'Month Close', ''].map((h) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Statements', 'Needs Coding', 'Ready', 'Missing Rcpts', 'Difference'].includes(h) ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {closes.map((c, i) => {
                const h = getEntity(c.hotelId)!;
                const cs = CLOSE_STATUS[c.status];
                return (
                  <tr key={c.hotelId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < closes.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => openHotel(c.hotelId)}>
                    <td className="py-2.5 px-3"><p className="font-medium truncate max-w-[200px]" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{c.totalAccounts}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: c.needsCoding ? '#b45309' : '#15803d' }}>{c.needsCoding}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: c.readyToPost ? '#1d4ed8' : '#929292' }}>{c.readyToPost}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: c.missingReceipts ? '#b91c1c' : '#c1c1c1' }}>{c.missingReceipts || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: c.difference > 0 ? '#b91c1c' : '#15803d' }}>{money(c.difference)}</td>
                    <td className="py-2.5 px-3"><Badge label={cs.label} fg={cs.fg} bg={cs.bg} /></td>
                    <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open <ChevronRight className="w-3 h-3" /></span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reconciliation status (account-wise) */}
      {reconRows.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Reconciliation Status" subtitle="Bank accounts and credit cards that need to be started, finished, or fixed." />
          <ReconTable rows={reconRows} onOpen={(r) => router.push(r.sessionId ? `${WB}/${r.sessionId}${r.classic ? '?mode=classic' : ''}` : `${WB}/start?hotel=${r.hotelId}&type=${r.type}&account=${r.accountId}`)} />
        </section>
      )}

      {/* Two-column: exceptions + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Exceptions & Red Flags" subtitle="Items that need review before posting or reconciliation." />
          {exceptions.length === 0 ? <EmptyState title="No exceptions." body="Nothing flagged for review right now." /> : (
            <div className="flex flex-col gap-2">{exceptions.map((e, i) => <ExceptionCard key={i} e={e} />)}</div>
          )}
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader title="Recent Accounting Activity" subtitle="Latest uploads, coding, posting, clearing, and reconciliation." />
          <ActivityTimeline activity={activity} />
        </section>
      </div>

      {/* Month close readiness */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Month Close Readiness" subtitle={`Which hotels are ready to close and which are blocked · ${fmtMonth(RECON_MONTH)}.`} action={<Link href="/web/accounting/month-close" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Month Close <ArrowRight className="w-3 h-3" /></Link>} />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Lines Resolved', 'Posted', 'Receipts', 'Reconciliations', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {closes.map((c, i) => {
                const h = getEntity(c.hotelId)!;
                const cs = CLOSE_STATUS[c.status];
                return (
                  <tr key={c.hotelId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < closes.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => openHotel(c.hotelId)}>
                    <td className="py-2.5 px-3"><p className="text-sm font-medium truncate max-w-[180px]" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px] font-mono" style={{ color: '#929292' }}>{h.propertyCode}</p></td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: c.needsCoding ? '#b45309' : '#15803d' }}>{c.needsCoding ? `${c.needsCoding} remaining` : 'Complete'}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: c.readyToPost ? '#1d4ed8' : '#15803d' }}>{c.readyToPost ? `${c.readyToPost} ready` : 'Complete'}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: c.missingReceipts ? '#b91c1c' : '#15803d' }}>{c.missingReceipts ? `${c.missingReceipts} missing` : 'Complete'}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: c.reconciledCount === c.totalAccounts && c.totalAccounts > 0 ? '#15803d' : '#b45309' }}>{c.reconciledCount}/{c.totalAccounts} done</td>
                    <td className="py-2.5 px-3"><Badge label={cs.label} fg={cs.fg} bg={cs.bg} /></td>
                    <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{c.status === 'closed' ? 'View' : c.status === 'blocked' ? 'Fix' : 'Review'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cash & card position */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Cash & Card Position" subtitle="Current book balances by hotel, from posted transactions only." />
        {sum.linesToCode > 0 && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fff7ed', color: '#b45309' }}>Balances may change because {sum.linesToCode} statement lines are not posted.</p>}
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Operating', 'Payroll', 'Reserve', 'Total Cash', 'Card Balance', 'Net Position'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {cash.slice(0, 8).map((c, i) => {
                const h = getEntity(c.hotelId)!;
                return (
                  <tr key={c.hotelId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < 7 ? '1px solid #f0f0f0' : 'none' }} onClick={() => openHotel(c.hotelId)}>
                    <td className="py-2.5 px-3 text-sm truncate max-w-[200px]" style={{ color: '#222' }}>{h.hotelName}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{moneyShort(c.operating)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{moneyShort(c.payroll)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{moneyShort(c.reserve)}</td>
                    <td className="py-2.5 px-3 text-sm text-right font-semibold" style={{ color: '#15803d' }}>{moneyShort(c.totalCash)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#b45309' }}>{moneyShort(c.cardBalance)}</td>
                    <td className="py-2.5 px-3 text-sm text-right font-bold" style={{ color: '#222' }}>{moneyShort(c.netCash)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}

/* ═══════════════════════════ SINGLE HOTEL ═══════════════════════════ */
function HotelView({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const store = useStore2();
  const h = getEntity(hotelId);
  if (!h) return <p className="text-sm" style={{ color: '#929292' }}>Hotel not found.</p>;

  const sum = useMemo(() => portfolioSummary(store, hotelId), [store, hotelId]);
  const close = useMemo(() => closeForHotel(store, hotelId), [store, hotelId]);
  const tasks = useMemo(() => dashboardTasks(store, hotelId, 4), [store, hotelId]);
  const reconRows = useMemo(() => reconDashRows(store, hotelId), [store, hotelId]);
  const cash = useMemo(() => cashPosition(store, hotelId)[0], [store, hotelId]);
  const rows = close.rows;
  const linesNeedingAction = useMemo(() => buildLinesNeedingAction(store, hotelId), [store, hotelId]);

  const cs = CLOSE_STATUS[close.status];

  // Empty state: no statements/sessions for this hotel.
  if (rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <PageHeader scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe" title={`${h.hotelName} Dashboard`} subtitle={`${h.legalEntity} · ${h.propertyCode} · accounting status for this hotel.`} />
        <EmptyState icon={<Inbox className="w-8 h-8" />} title="No statements uploaded yet" body="Upload a bank or credit card statement to start coding, posting, and reconciling this hotel’s books." />
        <div className="flex justify-center gap-2">
          <PrimaryLink href={`/web/accounting/statements/upload?hotel=${hotelId}`}><FileSpreadsheet className="w-3.5 h-3.5" /> Upload Statement</PrimaryLink>
          <GhostLink href={`${WB}/start?hotel=${hotelId}`}><ListChecks className="w-3.5 h-3.5" /> Start Manual Reconciliation</GhostLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-6">
      <PageHeader
        scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe"
        title={`${h.hotelName} Dashboard`} subtitle={`${h.legalEntity} · ${h.propertyCode} · ${h.city}, ${h.state} · ${h.rooms} rooms`}
        actions={
          <>
            <PrimaryLink href={`/web/accounting/statements/upload?hotel=${hotelId}`}>Upload Statement</PrimaryLink>
            <GhostLink href={`${WB}/start?hotel=${hotelId}`}>Start Reconciliation</GhostLink>
            <GhostLink href={WB}>Open Workbench</GhostLink>
            <GhostLink href="/web/accounting/reports">Run Reports</GhostLink>
          </>
        }
      />

      {/* Hotel summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Inbox className="w-4 h-4" />} value={String(close.totalAccounts)} label="Statements" subtext="In workbench" tone="neutral" href="/web/accounting/statements" />
        <SummaryCard icon={<ClipboardList className="w-4 h-4" />} value={String(close.needsCoding)} label="Lines Needing Coding" tone={close.needsCoding ? 'warning' : 'good'} href={WB} />
        <SummaryCard icon={<Send className="w-4 h-4" />} value={String(close.readyToPost)} label="Ready to Post" tone="brand" href={WB} />
        <SummaryCard icon={<Receipt className="w-4 h-4" />} value={String(close.missingReceipts)} label="Missing Receipts" tone={close.missingReceipts ? 'critical' : 'good'} href={WB} />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={money(close.difference)} label="Reconciliation Difference" tone={close.difference > 0 ? 'critical' : 'good'} href={WB} />
        <SummaryCard icon={<CheckCheck className="w-4 h-4" />} value={String(sum.readyToReconcile)} label="Ready to Finish" subtext="accounts" tone="brand" href={WB} />
        <SummaryCard icon={<CalendarCheck className="w-4 h-4" />} value={cs.label} label="Month Close Status" tone={close.status === 'ready-to-close' || close.status === 'closed' ? 'good' : close.status === 'blocked' ? 'critical' : 'neutral'} href="/web/accounting/month-close" />
        <SummaryCard icon={<CircleDollarSign className="w-4 h-4" />} value={cash ? moneyShort(cash.totalCash) : '$0'} label="Current Cash" subtext="Posted data only" tone="neutral" />
      </div>

      {/* Today's work for this hotel */}
      {tasks.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Today's Accounting Work" subtitle="What's blocking this hotel's reconciliation and close." />
          <div className="grid md:grid-cols-2 gap-3">{tasks.map((t, i) => <TaskCard key={i} t={t} hideHotel />)}</div>
        </section>
      )}

      {/* Active workbench */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Active Reconciliation Workbench" subtitle="Each account and card for this hotel." />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Account / Card', 'Type', 'Statement End', 'Lines', 'Needs Coding', 'Cleared', 'Difference', 'Status', ''].map((hd) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Lines', 'Needs Coding', 'Cleared', 'Difference'].includes(hd) ? 'right' : 'left' }}>{hd}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const st = SESSION_STATUS[r.status];
                const action = r.status === 'reconciled' ? 'View Report' : r.status === 'difference-found' ? 'Review' : r.status === 'ready-to-reconcile' ? 'Finish' : r.counts.missingReceipts > 0 ? 'Review' : 'Open';
                return (
                  <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => router.push(`${WB}/${r.id}${r.imp.mode === 'classic' ? '?mode=classic' : ''}`)}>
                    <td className="py-2.5 px-3"><p className="text-sm" style={{ color: '#222' }}>{r.imp.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>••{r.imp.accountLast4}</p></td>
                    <td className="py-2.5 px-3">{r.imp.statementType === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                    <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(r.imp.endDate)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.counts.total}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: r.counts.needsCoding ? '#b45309' : '#15803d' }}>{r.counts.needsCoding}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#15803d' }}>{r.counts.cleared + r.counts.reconciled}</td>
                    <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: Math.abs(r.math.difference) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(r.math.difference))}</td>
                    <td className="py-2.5 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                    <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{action}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two-column: reconciliation summary + month close checklist */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Reconciliation Summary" subtitle="Per account, with its own statement cycle." />
          <div className="flex flex-col gap-2">
            {reconRows.map((r) => {
              const st = SESSION_STATUS[r.status === 'not-started' ? 'not-started' : r.status];
              return (
                <div key={r.accountId} className="rounded-2xl p-3.5" style={card}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold" style={{ color: '#222' }}>{r.accountName} <span className="font-normal" style={{ color: '#929292' }}>••{r.last4}</span></p>
                    <Badge label={st.label} fg={st.fg} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                    <Row k="Last reconciled" v={fmtDate(r.lastReconciledThrough)} />
                    <Row k="Statement end" v={fmtDate(r.statementEnd)} />
                    <Row k="Beginning" v={money(r.beginningBalance)} />
                    <Row k={r.type === 'credit-card' ? 'Statement balance' : 'Ending balance'} v={money(r.statementEndingBalance)} />
                    <Row k="Difference" v={money(Math.abs(r.difference))} accent={Math.abs(r.difference) < 0.005 ? '#15803d' : '#b91c1c'} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="Month Close Checklist" subtitle={fmtMonth(RECON_MONTH)} action={<Link href="/web/accounting/month-close" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open <ArrowRight className="w-3 h-3" /></Link>} />
          <div className="rounded-2xl overflow-hidden" style={card}>
            {close.checklist.map((c, i) => (
              <div key={c.label} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < close.checklist.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.done ? '#dcfce7' : '#fee2e2' }}>
                  {c.done ? <CheckCheck className="w-3 h-3" style={{ color: '#15803d' }} /> : <span className="text-[10px] font-bold" style={{ color: '#b91c1c' }}>!</span>}
                </div>
                <span className="text-sm flex-1" style={{ color: c.done ? '#222' : '#b91c1c' }}>{c.label}{c.remaining ? ` · ${c.remaining} remaining` : ''}</span>
                {!c.done && c.action && <Link href={WB} className="text-[11px] font-semibold" style={{ color: PURPLE }}>{c.action}</Link>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Report snapshot */}
      <ReportSnapshot store={store} hotelId={hotelId} unposted={close.needsCoding + close.readyToPost} cash={cash} />

      <QuickActions hotelId={hotelId} />
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────────────────── */
function TaskCard({ t, hideHotel }: { t: DashTask; hideHotel?: boolean }) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(t.href)} className="p-4 rounded-2xl text-left flex flex-col gap-2 hover:shadow-md transition-shadow" style={card}>
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={t.priority} />
        <ArrowRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
      </div>
      <p className="text-sm font-bold" style={{ color: '#222' }}>{t.title}</p>
      <div className="text-[11px]" style={{ color: '#929292' }}>
        {!hideHotel && <span>{hotelLabel(t.hotelId).name} · </span>}{t.account}
      </div>
      <p className="text-xs font-semibold" style={{ color: t.priority === 'critical' ? '#b91c1c' : '#b45309' }}>{t.issue}</p>
      <p className="text-[11px]" style={{ color: '#6a6a6a' }}>{t.why}</p>
      <span className="text-xs font-semibold inline-flex items-center gap-1 mt-auto pt-1" style={{ color: PURPLE }}>{t.actionLabel} <ArrowRight className="w-3 h-3" /></span>
    </button>
  );
}

function ExceptionCard({ e }: { e: DashException }) {
  const router = useRouter();
  const crit = e.severity === 'critical';
  return (
    <button onClick={() => router.push(e.href)} className="p-3.5 rounded-2xl text-left flex items-start gap-3 hover:shadow-md transition-shadow" style={card}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: crit ? '#fee2e2' : '#fef3c7', color: crit ? '#b91c1c' : '#b45309' }}><AlertTriangle className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2"><Badge label={crit ? 'Critical' : 'Warning'} fg={crit ? '#b91c1c' : '#b45309'} bg={crit ? '#fee2e2' : '#fef3c7'} /><span className="text-sm font-semibold truncate" style={{ color: '#222' }}>{e.title}</span></div>
        <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>{e.transaction} · {hotelLabel(e.hotelId).name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{e.why}</p>
      </div>
      <span className="text-[11px] font-semibold whitespace-nowrap self-center" style={{ color: PURPLE }}>{e.actionLabel}</span>
    </button>
  );
}

function ActivityTimeline({ activity }: { activity: ReturnType<typeof recentActivity> }) {
  if (activity.length === 0) return <EmptyState title="No activity yet." body="Uploads, coding, posting, and reconciliation actions appear here." />;
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
      {activity.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: PURPLE }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: '#222' }}><span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}{a.detail ? ` — ${a.detail}` : ''}{a.hotelName ? ` for ${a.hotelName}` : ''}.</p>
            <p className="text-[11px]" style={{ color: '#929292' }}>{fmtTime(a.ts)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReconTable({ rows, onOpen }: { rows: ReconDashRow[]; onOpen: (r: ReconDashRow) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
          {['Hotel', 'Account / Card', 'Type', 'Last Recon', 'Stmt End', 'Beginning', 'Stmt Ending', 'Cleared', 'Difference', 'Status', ''].map((h) => (
            <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Beginning', 'Stmt Ending', 'Cleared', 'Difference'].includes(h) ? 'right' : 'left' }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r) => {
            const st = SESSION_STATUS[r.status === 'not-started' ? 'not-started' : r.status];
            const action = r.status === 'reconciled' ? 'View Report' : r.status === 'difference-found' ? 'Find Difference' : r.status === 'ready-to-reconcile' ? 'Finish' : r.status === 'not-started' ? 'Start' : 'Continue';
            return (
              <tr key={r.accountId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => onOpen(r)}>
                <td className="py-2.5 px-2.5 text-xs" style={{ color: '#6a6a6a' }}>{hotelLabel(r.hotelId).code}</td>
                <td className="py-2.5 px-2.5"><p className="text-sm" style={{ color: '#222' }}>{r.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>••{r.last4}</p></td>
                <td className="py-2.5 px-2.5">{r.type === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                <td className="py-2.5 px-2.5 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastReconciledThrough)}</td>
                <td className="py-2.5 px-2.5 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(r.statementEnd)}</td>
                <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{money(r.beginningBalance)}</td>
                <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#222' }}>{money(r.statementEndingBalance)}</td>
                <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#222' }}>{money(r.clearedBalance)}</td>
                <td className="py-2.5 px-2.5 text-xs text-right font-semibold" style={{ color: Math.abs(r.difference) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(r.difference))}</td>
                <td className="py-2.5 px-2.5"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                <td className="py-2.5 px-2.5 text-right"><span className="text-xs font-semibold whitespace-nowrap" style={{ color: PURPLE }}>{action}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReportSnapshot({ store, hotelId, unposted, cash }: { store: ReturnType<typeof useStore2>; hotelId: string; unposted: number; cash?: ReturnType<typeof cashPosition>[number] }) {
  const pnl = useMemo(() => buildPnl(store, hotelId), [store, hotelId]);
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Report Snapshot" subtitle="Financial reports based on posted data only." action={<Link href="/web/accounting/reports" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Reports <ArrowRight className="w-3 h-3" /></Link>} />
      {unposted > 0 && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fff7ed', color: '#b45309' }}>This snapshot excludes {unposted} unposted statement {unposted === 1 ? 'line' : 'lines'}.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Snap label="Revenue" value={moneyShort(pnl.totalRevenue)} accent="#15803d" />
        <Snap label="Expenses" value={moneyShort(pnl.totalExpense)} accent="#b91c1c" />
        <Snap label="Net Income" value={moneyShort(pnl.net)} accent={pnl.net >= 0 ? '#15803d' : '#b91c1c'} />
        <Snap label="Current Cash" value={cash ? moneyShort(cash.totalCash) : '$0'} accent="#222" />
        <Snap label="Card Balance" value={cash ? moneyShort(cash.cardBalance) : '$0'} accent="#b45309" />
        <Snap label="Net Position" value={cash ? moneyShort(cash.netCash) : '$0'} accent="#222" />
      </div>
      <div className="flex flex-wrap gap-2">
        <GhostLink href="/web/accounting/reports/profit-loss">Run P&L</GhostLink>
        <GhostLink href="/web/accounting/reports/trial-balance">View Trial Balance</GhostLink>
        <GhostLink href="/web/accounting/reports">View All Reports</GhostLink>
      </div>
    </section>
  );
}
function Snap({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>;
}

function QuickActions({ hotelId }: { hotelId?: string }) {
  const q = hotelId ? `?hotel=${hotelId}` : '';
  const actions = [
    { label: 'Upload Statement', icon: <FileSpreadsheet className="w-4 h-4" />, href: `/web/accounting/statements/upload${q}` },
    { label: 'Start Manual Reconciliation', icon: <ListChecks className="w-4 h-4" />, href: `${WB}/start${q}` },
    { label: 'Open Workbench', icon: <CheckCheck className="w-4 h-4" />, href: WB },
    { label: 'Add Vendor', icon: <Plus className="w-4 h-4" />, href: '/web/accounting/vendors' },
    { label: 'Run Profit & Loss', icon: <TrendingUp className="w-4 h-4" />, href: '/web/accounting/reports/profit-loss' },
    { label: 'View Reports', icon: <FileText className="w-4 h-4" />, href: '/web/accounting/reports' },
  ];
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Quick Actions" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((a) => (
          <Link key={a.label} href={a.href} className="p-4 rounded-2xl flex flex-col gap-2 hover:shadow-md transition-shadow" style={card}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f0eefb', color: PURPLE }}>{a.icon}</div>
            <span className="text-xs font-semibold" style={{ color: '#222' }}>{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Row({ k, v, accent = '#222' }: { k: string; v: string; accent?: string }) {
  return <div className="flex justify-between gap-2"><span style={{ color: '#929292' }}>{k}</span><span style={{ color: accent, fontWeight: 600 }}>{v}</span></div>;
}
function fmtTime(iso: string) {
  try { return new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }); } catch { return iso; }
}

/* Build the "Lines Needing Action" set (reserved for hotel deep view tabs). */
function buildLinesNeedingAction(_store: ReturnType<typeof useStore2>, _hotelId: string) { return []; }
