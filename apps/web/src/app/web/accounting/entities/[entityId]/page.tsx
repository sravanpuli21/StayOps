'use client';

import { use, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Landmark, CreditCard, CheckCircle2, AlertTriangle, XCircle,
  FileSpreadsheet, ListChecks, FileText, Users, FolderOpen, Activity, Settings, ArrowRight,
  Inbox, CheckCheck, CalendarCheck, ListTree, ShoppingBag, CircleDollarSign, ChevronRight,
} from 'lucide-react';
import {
  getEntity, bankAccountsForHotel, creditCardsForHotel, ACCT_VENDORS, COA_TEMPLATE, COA_TYPE_LABEL,
} from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useStore2 } from '../../_store2';
import { allSessionRows } from '../../_recon2';
import { buildPnl } from '../../reports/_reports';
import { RECON_MONTH } from '../../_domain';
import { card, money, moneyShort, Badge, SESSION_STATUS, CLOSE_STATUS, PURPLE, fmtDate, fmtMonth, EmptyState } from '../../_ui';
import { entitySetup, SETUP_STATUS_LABEL, reconStatusLabel } from '../_data';
import { reconDashRows, cashPosition, recentActivity, type ReconDashRow } from '../../dashboard/_data';
import { SummaryCard, SectionHeader, PrimaryLink, GhostLink } from '../../dashboard/_components';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'accounting-setup', label: 'Accounting Setup' },
  { key: 'accounts', label: 'Accounts & Cards' },
  { key: 'chart-of-accounts', label: 'Chart of Accounts' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'statements', label: 'Statements' },
  { key: 'reconciliation', label: 'Reconciliation' },
  { key: 'month-close', label: 'Month Close' },
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity Log' },
  { key: 'settings', label: 'Settings' },
];

function Inner({ entityId }: { entityId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { selectHotel } = useAcctOs();
  const store = useStore2();
  const h = getEntity(entityId);
  const [tab, setTab] = useState(params.get('tab') ?? 'overview');

  if (!h) return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Back /><EmptyState title="Hotel not found." body="This entity is no longer available." /></div>;

  const setup = useMemo(() => entitySetup(store, entityId), [store, entityId]);
  const ss = SETUP_STATUS_LABEL[setup.status];
  const cls = CLOSE_STATUS[setup.close.status];
  const goScoped = (path: string) => { selectHotel(entityId); router.push(path); };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <Back />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}><Building2 className="w-5 h-5" style={{ color: PURPLE }} /></div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#222' }}>{h.hotelName}</h1>
            <p className="text-sm" style={{ color: '#929292' }}>{h.legalEntity} · {h.propertyCode} · {h.city}, {h.state} · {h.rooms} rooms</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge label="Active" fg="#15803d" bg="#dcfce7" />
              <Badge label={ss.label} fg={ss.fg} bg={ss.bg} />
              <Badge label={`Close: ${cls.label}`} fg={cls.fg} bg={cls.bg} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => goScoped('/web/accounting/dashboard')} className="h-9 px-3.5 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Open Dashboard</button>
          <button onClick={() => goScoped(`/web/accounting/statements/upload?hotel=${entityId}`)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Upload Statement</button>
          <button onClick={() => goScoped('/web/accounting/reconciliation-workbench')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Open Workbench</button>
          <button onClick={() => goScoped('/web/accounting/reports')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Run Reports</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: tab === t.key ? PURPLE : '#6a6a6a', borderBottom: tab === t.key ? `2px solid ${PURPLE}` : '2px solid transparent' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab entityId={entityId} setup={setup} goScoped={goScoped} />}
      {tab === 'accounting-setup' && <SetupTab setup={setup} goScoped={goScoped} />}
      {tab === 'accounts' && <AccountsTab entityId={entityId} goScoped={goScoped} />}
      {tab === 'chart-of-accounts' && <CoaTab entityId={entityId} goScoped={goScoped} />}
      {tab === 'vendors' && <VendorsTab entityId={entityId} goScoped={goScoped} />}
      {tab === 'statements' && <CrossLinkTab title="Statements" icon={<Inbox className="w-8 h-8" />} body="Bank and credit card statements for this hotel live in the Statement Inbox, scoped to this entity." actionLabel="Open Statement Inbox" onGo={() => goScoped('/web/accounting/statements')} secondaryLabel="Upload Statement" onSecondary={() => goScoped(`/web/accounting/statements/upload?hotel=${entityId}`)} />}
      {tab === 'reconciliation' && <ReconciliationTab entityId={entityId} setup={setup} goScoped={goScoped} />}
      {tab === 'month-close' && <MonthCloseTab setup={setup} goScoped={goScoped} />}
      {tab === 'reports' && <ReportsTab entityId={entityId} setup={setup} goScoped={goScoped} />}
      {tab === 'users' && <UsersTab manager={h.manager} />}
      {tab === 'documents' && <CrossLinkTab title="Documents" icon={<FolderOpen className="w-8 h-8" />} body="Receipts and supporting documents attached to this hotel's statement lines." actionLabel="Open Documents" onGo={() => goScoped('/web/accounting/documents')} />}
      {tab === 'activity' && <ActivityTab entityId={entityId} />}
      {tab === 'settings' && <SettingsTab entityId={entityId} />}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────── */
function OverviewTab({ entityId, setup, goScoped }: { entityId: string; setup: ReturnType<typeof entitySetup>; goScoped: (p: string) => void }) {
  const store = useStore2();
  const h = getEntity(entityId)!;
  const cash = cashPosition(store, entityId)[0];
  const cls = CLOSE_STATUS[setup.close.status];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} value={setup.status === 'accounting-ready' ? 'Ready' : `${setup.score}%`} label="Accounting Setup" tone={setup.status === 'accounting-ready' ? 'good' : 'warning'} />
        <SummaryCard icon={<Inbox className="w-4 h-4" />} value={String(setup.close.totalAccounts)} label="Statements" tone="neutral" onClick={() => goScoped('/web/accounting/statements')} />
        <SummaryCard icon={<ListChecks className="w-4 h-4" />} value={String(setup.close.needsCoding)} label="Lines Needing Coding" tone={setup.close.needsCoding ? 'warning' : 'good'} onClick={() => goScoped('/web/accounting/reconciliation-workbench')} />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={money(setup.close.difference)} label="Reconciliation Difference" tone={setup.close.difference > 0 ? 'critical' : 'good'} onClick={() => goScoped('/web/accounting/reconciliation-workbench')} />
        <SummaryCard icon={<FileText className="w-4 h-4" />} value={String(setup.close.missingReceipts)} label="Missing Receipts" tone={setup.close.missingReceipts ? 'critical' : 'good'} />
        <SummaryCard icon={<CalendarCheck className="w-4 h-4" />} value={cls.label} label="Month Close" tone={setup.close.status === 'ready-to-close' || setup.close.status === 'closed' ? 'good' : setup.close.status === 'blocked' ? 'critical' : 'neutral'} onClick={() => goScoped('/web/accounting/month-close')} />
        <SummaryCard icon={<CircleDollarSign className="w-4 h-4" />} value={cash ? moneyShort(cash.totalCash) : '$0'} label="Current Cash" subtext="Posted only" tone="neutral" />
        <SummaryCard icon={<CreditCard className="w-4 h-4" />} value={cash ? moneyShort(cash.cardBalance) : '$0'} label="Card Balance" tone="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="flex flex-col gap-2">
          <SectionHeader title="Entity Information" />
          <div className="rounded-2xl p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={card}>
            <Info k="Hotel Name" v={h.hotelName} /><Info k="Legal Entity" v={h.legalEntity} />
            <Info k="Property Code" v={h.propertyCode} /><Info k="Tax ID" v={h.taxId} />
            <Info k="Address" v={h.address} /><Info k="Phone" v={h.phone} />
            <Info k="Rooms" v={String(h.rooms)} /><Info k="Manager" v={h.manager} />
            <Info k="City / State" v={`${h.city}, ${h.state}`} /><Info k="Opened" v={h.openingDate} />
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <SectionHeader title="Accounting Health" />
          <div className="rounded-2xl overflow-hidden" style={card}>
            {setup.checklist.slice(0, 8).map((c, i) => (
              <div key={c.key} className="flex items-center gap-2.5 px-4 py-2.5" style={{ borderBottom: i < 7 ? '1px solid #f7f7f7' : 'none' }}>
                <StatusDot status={c.status} />
                <span className="text-sm flex-1" style={{ color: c.status === 'complete' ? '#222' : '#b45309' }}>{c.label}</span>
                {c.status !== 'complete' && c.action && <span className="text-[11px] font-semibold" style={{ color: PURPLE }}>{c.action}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Quick Actions" />
        <div className="flex flex-wrap gap-2">
          <GhostLink href={`/web/accounting/statements/upload?hotel=${entityId}`}>Upload Statement</GhostLink>
          <GhostLink href={`/web/accounting/reconciliation-workbench/start?hotel=${entityId}`}>Start Manual Reconciliation</GhostLink>
          <GhostLink href="/web/accounting/reconciliation-workbench">Open Workbench</GhostLink>
          <GhostLink href="/web/accounting/reports/profit-loss">Run P&L</GhostLink>
          <GhostLink href="/web/accounting/month-close">Open Month Close</GhostLink>
        </div>
      </section>
    </div>
  );
}

/* ── Accounting Setup ─────────────────────────────────────────────────── */
function SetupTab({ setup, goScoped }: { setup: ReturnType<typeof entitySetup>; goScoped: (p: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex items-center justify-between mb-3">
          <div><p className="text-sm font-bold" style={{ color: '#222' }}>Setup Score</p><p className="text-xs" style={{ color: '#929292' }}>Required items complete</p></div>
          <p className="text-2xl font-bold" style={{ color: setup.score === 100 ? '#15803d' : '#b45309' }}>{setup.score}%</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}><div className="h-full" style={{ width: `${setup.score}%`, background: setup.score === 100 ? '#15803d' : PURPLE }} /></div>
      </div>

      <section className="flex flex-col gap-2">
        <SectionHeader title="Setup Checklist" />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Setup Item', 'Status', 'Details', 'Required', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 text-left" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {setup.checklist.map((c, i) => (
                <tr key={c.key} style={{ borderBottom: i < setup.checklist.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{c.label}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.detail ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{c.required ? 'Required' : 'Optional'}</td>
                  <td className="py-2.5 px-3 text-right">{c.status !== 'complete' && c.action && <button onClick={() => goScoped('/web/accounting/chart-of-accounts')} className="text-xs font-semibold" style={{ color: PURPLE }}>{c.action}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ── Accounts & Cards ─────────────────────────────────────────────────── */
function AccountsTab({ entityId, goScoped }: { entityId: string; goScoped: (p: string) => void }) {
  const banks = bankAccountsForHotel(entityId);
  const cards = creditCardsForHotel(entityId);
  const reconRows = reconDashRows(useStore2(), entityId);
  const [sub, setSub] = useState<'bank' | 'card' | 'cycles' | 'mapping'>('bank');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        {([['bank', 'Bank Accounts'], ['card', 'Credit Cards'], ['cycles', 'Statement Cycles'], ['mapping', 'Account Mapping']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: sub === k ? '#ece4fb' : '#fff', color: sub === k ? PURPLE : '#6a6a6a', border: '1px solid #eee' }}>{l}</button>
        ))}
      </div>

      {sub === 'bank' && (banks.length === 0 ? <EmptyState icon={<Landmark className="w-8 h-8" />} title="No bank accounts added." body="Add operating, payroll, and reserve accounts so this hotel can upload statements and reconcile." /> : (
        <Table head={['Account Name', 'Bank', 'Type', 'Last 4', 'COA Mapping', 'Opening Balance', 'Current Balance', '']}>
          {banks.map((b) => (
            <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{b.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.bank}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.type}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{b.last4}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.type === 'Operating Checking' ? '1010 Operating Checking' : b.type === 'Payroll Checking' ? '1020 Payroll Checking' : '1030 Reserve Account'}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{money(b.openingBalance)}</td>
              <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: '#222' }}>{money(b.currentBalance)}</td>
              <td className="py-2.5 px-3 text-right"><button onClick={() => goScoped(`/web/accounting/reconciliation-workbench/start?hotel=${entityId}&type=bank&account=${b.id}`)} className="text-xs font-semibold" style={{ color: PURPLE }}>Reconcile</button></td>
            </tr>
          ))}
        </Table>
      ))}

      {sub === 'card' && (cards.length === 0 ? <EmptyState icon={<CreditCard className="w-8 h-8" />} title="No credit cards added." body="Add corporate or GM cards so card statements can be tracked and reconciled." /> : (
        <Table head={['Card Name', 'Issuer', 'Last 4', 'Card Holder', 'Credit Limit', 'COA Mapping', 'Current Balance', '']}>
          {cards.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{c.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.issuer}</td>
              <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{c.last4}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.cardHolder}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{money(c.creditLimit)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.name.includes('GM') ? '2120 GM Card Payable' : '2110 Corporate Card Payable'}</td>
              <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: '#b45309' }}>{money(c.currentBalance)}</td>
              <td className="py-2.5 px-3 text-right"><button onClick={() => goScoped(`/web/accounting/reconciliation-workbench/start?hotel=${entityId}&type=credit-card&account=${c.id}`)} className="text-xs font-semibold" style={{ color: PURPLE }}>Reconcile</button></td>
            </tr>
          ))}
        </Table>
      ))}

      {sub === 'cycles' && (
        <>
          <p className="text-xs" style={{ color: '#929292' }}>StayOps uses each account or card's statement end date. It does not force every reconciliation to end on the last day of the month.</p>
          <Table head={['Account / Card', 'Type', 'Last Reconciled Through', 'Current Statement End', 'Cycle Day', 'Frequency', '']}>
            {reconRows.map((r) => (
              <tr key={r.accountId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.accountName} <span style={{ color: '#929292' }}>••{r.last4}</span></td>
                <td className="py-2.5 px-3">{r.type === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastReconciledThrough)}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.statementEnd)}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{new Date(r.statementEnd + 'T00:00:00').getDate()}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>Monthly</td>
                <td className="py-2.5 px-3 text-right"><button onClick={() => goScoped(`/web/accounting/reconciliation-workbench/start?hotel=${entityId}&type=${r.type}&account=${r.accountId}`)} className="text-xs font-semibold" style={{ color: PURPLE }}>Start</button></td>
              </tr>
            ))}
          </Table>
        </>
      )}

      {sub === 'mapping' && (
        <>
          <p className="text-xs" style={{ color: '#929292' }}>Bank accounts must map to asset accounts. Credit cards must map to liability accounts.</p>
          <Table head={['Record', 'Type', 'Current Mapping', 'Status', '']}>
            {[...banks.map((b) => ({ name: b.name, kind: 'Bank', map: b.type === 'Operating Checking' ? '1010 Operating Checking' : b.type === 'Payroll Checking' ? '1020 Payroll Checking' : '1030 Reserve Account' })),
              ...cards.map((c) => ({ name: c.name, kind: 'Credit Card', map: c.name.includes('GM') ? '2120 GM Card Payable' : '2110 Corporate Card Payable' }))].map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.name}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.kind}</td>
                <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{r.map}</td>
                <td className="py-2.5 px-3"><Badge label="Mapped" fg="#15803d" bg="#dcfce7" /></td>
                <td className="py-2.5 px-3 text-right"><button onClick={() => goScoped('/web/accounting/chart-of-accounts')} className="text-xs font-semibold" style={{ color: PURPLE }}>Edit Mapping</button></td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </div>
  );
}

/* ── Chart of Accounts ────────────────────────────────────────────────── */
function CoaTab({ entityId, goScoped }: { entityId: string; goScoped: (p: string) => void }) {
  const accounts = COA_TEMPLATE.filter((a) => !a.isHeader);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#929292' }}>Chart of Accounts for <b style={{ color: '#222' }}>{getEntity(entityId)?.hotelName}</b> — its own copy of the standard hotel template.</p>
        <button onClick={() => goScoped('/web/accounting/chart-of-accounts')} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Full COA <ArrowRight className="w-3 h-3" /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Accounts" value={String(accounts.length)} />
        <Stat label="Active" value={String(accounts.length)} />
        <Stat label="Custom" value="0" />
        <Stat label="Mapping Issues" value="0" accent="#15803d" />
      </div>
      <Table head={['Code', 'Account Name', 'Type', 'Detail Type', '']}>
        {accounts.slice(0, 25).map((a) => (
          <tr key={a.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td className="py-2 px-3 text-xs font-mono" style={{ color: '#929292' }}>{a.code}</td>
            <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
            <td className="py-2 px-3"><Badge label={COA_TYPE_LABEL[a.type]} fg="#6a6a6a" bg="#f0f0f0" /></td>
            <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.detailType}</td>
            <td className="py-2 px-3 text-right"><button onClick={() => goScoped('/web/accounting/chart-of-accounts')} className="text-xs font-semibold" style={{ color: PURPLE }}>View</button></td>
          </tr>
        ))}
      </Table>
      <p className="text-xs text-center" style={{ color: '#929292' }}>Showing 25 of {accounts.length} accounts. Open the full Chart of Accounts to see all.</p>
    </div>
  );
}

/* ── Vendors ──────────────────────────────────────────────────────────── */
function VendorsTab({ entityId, goScoped }: { entityId: string; goScoped: (p: string) => void }) {
  const vendors = ACCT_VENDORS.filter((v) => v.hotelsUsedIn.includes(entityId));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#929292' }}>Vendors for <b style={{ color: '#222' }}>{getEntity(entityId)?.hotelName}</b> — vendors are hotel-specific in V1.</p>
        <button onClick={() => goScoped('/web/accounting/vendors')} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Vendors <ArrowRight className="w-3 h-3" /></button>
      </div>
      {vendors.length === 0 ? <EmptyState icon={<ShoppingBag className="w-8 h-8" />} title="No vendors for this hotel." body="Vendors appear when transactions are coded, or add them manually." /> : (
        <Table head={['Vendor', 'Default Category', 'Department', 'Spend (May)', 'Transactions', 'Missing Receipts', '']}>
          {vendors.map((v) => (
            <tr key={v.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{v.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.defaultCategory}</td>
              <td className="py-2.5 px-3"><Badge label={v.defaultDepartment} fg="#6a6a6a" bg="#f0f0f0" /></td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{money(v.spendMonth)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{v.txCount}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: v.missingReceipts ? '#b91c1c' : '#c1c1c1' }}>{v.missingReceipts || '—'}</td>
              <td className="py-2.5 px-3 text-right"><button onClick={() => goScoped('/web/accounting/vendors')} className="text-xs font-semibold" style={{ color: PURPLE }}>View</button></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

/* ── Reconciliation ───────────────────────────────────────────────────── */
function ReconciliationTab({ entityId, setup, goScoped }: { entityId: string; setup: ReturnType<typeof entitySetup>; goScoped: (p: string) => void }) {
  const store = useStore2();
  const rows = reconDashRows(store, entityId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Accounts" value={String(rows.length)} />
        <Stat label="Reconciled" value={String(setup.close.reconciledCount)} accent="#15803d" />
        <Stat label="Difference" value={money(setup.close.difference)} accent={setup.close.difference > 0 ? '#b91c1c' : '#15803d'} />
        <Stat label="Needs Coding" value={String(setup.close.needsCoding)} accent={setup.close.needsCoding ? '#b45309' : '#15803d'} />
      </div>
      <Table head={['Account / Card', 'Type', 'Last Recon', 'Stmt End', 'Beginning', 'Ending', 'Cleared', 'Difference', 'Status', '']}>
        {rows.map((r) => {
          const st = SESSION_STATUS[r.status === 'not-started' ? 'not-started' : r.status];
          const action = r.status === 'reconciled' ? 'View Report' : r.status === 'difference-found' ? 'Find Difference' : r.status === 'ready-to-reconcile' ? 'Finish' : r.status === 'not-started' ? 'Start' : 'Continue';
          return (
            <tr key={r.accountId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => goScoped(r.sessionId ? `/web/accounting/reconciliation-workbench/${r.sessionId}${r.classic ? '?mode=classic' : ''}` : `/web/accounting/reconciliation-workbench/start?hotel=${entityId}&type=${r.type}&account=${r.accountId}`)}>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.accountName} <span style={{ color: '#929292' }}>••{r.last4}</span></td>
              <td className="py-2.5 px-3">{r.type === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastReconciledThrough)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.statementEnd)}</td>
              <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{money(r.beginningBalance)}</td>
              <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{money(r.statementEndingBalance)}</td>
              <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{money(r.clearedBalance)}</td>
              <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: Math.abs(r.difference) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(r.difference))}</td>
              <td className="py-2.5 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
              <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{action}</span></td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

/* ── Month Close ──────────────────────────────────────────────────────── */
function MonthCloseTab({ setup, goScoped }: { setup: ReturnType<typeof entitySetup>; goScoped: (p: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#929292' }}>Month close checklist for {fmtMonth(RECON_MONTH)}.</p>
        <button onClick={() => goScoped('/web/accounting/month-close')} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open Month Close <ArrowRight className="w-3 h-3" /></button>
      </div>
      <div className="rounded-2xl overflow-hidden" style={card}>
        {setup.close.checklist.map((c, i) => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < setup.close.checklist.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.done ? '#dcfce7' : '#fee2e2' }}>{c.done ? <CheckCheck className="w-3 h-3" style={{ color: '#15803d' }} /> : <span className="text-[10px] font-bold" style={{ color: '#b91c1c' }}>!</span>}</div>
            <span className="text-sm flex-1" style={{ color: c.done ? '#222' : '#b91c1c' }}>{c.label}{c.remaining ? ` · ${c.remaining} remaining` : ''}</span>
            {!c.done && c.action && <button onClick={() => goScoped('/web/accounting/reconciliation-workbench')} className="text-[11px] font-semibold" style={{ color: PURPLE }}>{c.action}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reports ──────────────────────────────────────────────────────────── */
function ReportsTab({ entityId, setup, goScoped }: { entityId: string; setup: ReturnType<typeof entitySetup>; goScoped: (p: string) => void }) {
  const store = useStore2();
  const pnl = buildPnl(store, entityId);
  const cash = cashPosition(store, entityId)[0];
  const unposted = setup.close.needsCoding + setup.close.readyToPost;
  return (
    <div className="flex flex-col gap-4">
      {unposted > 0 && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fff7ed', color: '#b45309' }}>Reports use posted transactions only. This excludes {unposted} unposted statement {unposted === 1 ? 'line' : 'lines'}.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Revenue" value={moneyShort(pnl.totalRevenue)} accent="#15803d" />
        <Stat label="Expenses" value={moneyShort(pnl.totalExpense)} accent="#b91c1c" />
        <Stat label="Net Income" value={moneyShort(pnl.net)} accent={pnl.net >= 0 ? '#15803d' : '#b91c1c'} />
        <Stat label="Cash" value={cash ? moneyShort(cash.totalCash) : '$0'} />
        <Stat label="Card Balance" value={cash ? moneyShort(cash.cardBalance) : '$0'} accent="#b45309" />
        <Stat label="Net Position" value={cash ? moneyShort(cash.netCash) : '$0'} />
      </div>
      <div className="flex flex-wrap gap-2">
        {['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'Trial Balance', 'General Ledger', 'CPA Package'].map((r) => (
          <button key={r} onClick={() => goScoped('/web/accounting/reports')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>{r}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Users ────────────────────────────────────────────────────────────── */
function UsersTab({ manager }: { manager: string }) {
  const users = [
    { name: 'Sanjay Narsee', role: 'Corporate Accountant', access: 'Full Accounting Access', status: 'Active' },
    { name: manager, role: 'Hotel GM', access: 'Receipts Only', status: 'Active' },
    { name: 'Patel & Co.', role: 'CPA', access: 'Read Only', status: 'Active' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between"><p className="text-sm" style={{ color: '#929292' }}>Who has access to this hotel's accounting records.</p><button className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Add User</button></div>
      <Table head={['User', 'Role', 'Access Level', 'Status', '']}>
        {users.map((u, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{u.name}</td>
            <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{u.role}</td>
            <td className="py-2.5 px-3"><Badge label={u.access} fg="#1d4ed8" bg="#dbeafe" /></td>
            <td className="py-2.5 px-3"><Badge label={u.status} fg="#15803d" bg="#dcfce7" /></td>
            <td className="py-2.5 px-3 text-right"><button className="text-xs font-semibold" style={{ color: PURPLE }}>Manage</button></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ── Activity ─────────────────────────────────────────────────────────── */
function ActivityTab({ entityId }: { entityId: string }) {
  const activity = recentActivity(useStore2(), entityId, 30);
  if (activity.length === 0) return <EmptyState icon={<Activity className="w-8 h-8" />} title="No activity yet." body="Setup and accounting actions for this hotel appear here." />;
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
      {activity.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: PURPLE }} />
          <div className="flex-1 min-w-0"><p className="text-sm" style={{ color: '#222' }}><span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}{a.detail ? ` — ${a.detail}` : ''}.</p><p className="text-[11px]" style={{ color: '#929292' }}>{a.ts}</p></div>
        </div>
      ))}
    </div>
  );
}

/* ── Settings ─────────────────────────────────────────────────────────── */
function SettingsTab({ entityId }: { entityId: string }) {
  const h = getEntity(entityId)!;
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Section title="Entity Settings">
        <Field k="Hotel Display Name" v={h.hotelName} /><Field k="Legal Entity Name" v={h.legalEntity} />
        <Field k="Property Code" v={h.propertyCode} /><Field k="Room Count" v={String(h.rooms)} />
        <Field k="Manager" v={h.manager} /><Field k="Status" v="Active" />
      </Section>
      <Section title="Reconciliation Settings">
        <Field k="Require bank reconciliation before close" v="On" />
        <Field k="Require credit card reconciliation before close" v="On" />
        <Field k="Use account-specific statement dates" v="On" />
        <Field k="T+ timing tolerance" v="2 days" />
      </Section>
      <Section title="Month Close Settings">
        <Field k="Require all statement lines resolved" v="On" />
        <Field k="Require all transactions posted" v="On" />
        <Field k="Require receipts for required items" v="On" />
        <Field k="Require reports reviewed" v="On" />
      </Section>
    </div>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────── */
function Back() { return <Link href="/web/accounting/entities" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</Link>; }
function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm" style={{ color: '#222' }}>{v}</p></div>; }
function Field({ k, v }: { k: string; v: string }) { return <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f7f7f7' }}><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-medium" style={{ color: '#222' }}>{v}</span></div>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-4 py-2.5" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</p></div>{children}</div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{head.map((h, i) => <th key={h + i} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Opening Balance', 'Current Balance', 'Credit Limit', 'Beginning', 'Ending', 'Cleared', 'Difference', 'Spend (May)', 'Transactions', 'Missing Receipts'].includes(h) ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function CrossLinkTab({ title, icon, body, actionLabel, onGo, secondaryLabel, onSecondary }: { title: string; icon: React.ReactNode; body: string; actionLabel: string; onGo: () => void; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-2" style={{ ...card, borderStyle: 'dashed' }}>
      <div style={{ color: '#c1c1c1' }}>{icon}</div>
      <p className="text-base font-semibold" style={{ color: '#222' }}>{title}</p>
      <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>{body}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={onGo} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>{actionLabel}</button>
        {secondaryLabel && onSecondary && <button onClick={onSecondary} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>{secondaryLabel}</button>}
      </div>
    </div>
  );
}
function StatusDot({ status }: { status: 'complete' | 'warning' | 'missing' }) {
  const m = { complete: { bg: '#dcfce7', fg: '#15803d', icon: <CheckCircle2 className="w-3 h-3" /> }, warning: { bg: '#fef3c7', fg: '#b45309', icon: <AlertTriangle className="w-3 h-3" /> }, missing: { bg: '#fee2e2', fg: '#b91c1c', icon: <XCircle className="w-3 h-3" /> } }[status];
  return <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: m.bg, color: m.fg }}>{m.icon}</div>;
}
function StatusBadge({ status }: { status: 'complete' | 'warning' | 'missing' }) {
  const m = { complete: { label: 'Complete', fg: '#15803d', bg: '#dcfce7' }, warning: { label: 'Needs Review', fg: '#b45309', bg: '#fef3c7' }, missing: { label: 'Missing', fg: '#b91c1c', bg: '#fee2e2' } }[status];
  return <Badge label={m.label} fg={m.fg} bg={m.bg} />;
}

export default function EntityDetailPage({ params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = use(params);
  return <Suspense fallback={null}><Inner entityId={decodeURIComponent(entityId)} /></Suspense>;
}
