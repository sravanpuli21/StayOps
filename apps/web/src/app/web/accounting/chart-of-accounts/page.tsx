'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ListTree, Search, Plus, Building2, AlertTriangle, CheckCircle2, XCircle, Layers, Rows3,
  ArrowRight, ChevronRight, ChevronDown, FileText, Wand2, GitMerge, CircleDollarSign, Upload, Download,
} from 'lucide-react';
import { HOTEL_ENTITIES, getEntity, COA_TEMPLATE, COA_TYPE_LABEL, TEMPLATE_ACCOUNT_COUNT, type CoaFullType } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { hotelLabel } from '../_domain';
import { card, money, moneyShort, Badge, PageHeader, EmptyState, inputStyle, PURPLE } from '../_ui';
import { SummaryCard, SectionHeader } from '../dashboard/_components';
import {
  accountsForHotel, hotelCoaSummary, portfolioCoaRows, portfolioCoaSummary, structureOverview,
  balanceSnapshot, coaApplied, TYPE_COLORS, type LiveAccount,
} from './_data';
import { portfolioSummary } from '../_recon2';

export default function ChartOfAccountsPage() {
  const { selection } = useAcctOs();
  if (selection.kind === 'hotel') return <HotelCoa hotelId={selection.hotelId} />;
  return <PortfolioCoa />;
}

/* ═══════════════════════════ ALL HOTELS ═══════════════════════════ */
function PortfolioCoa() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const store = useStore2();
  const rows = useMemo(() => portfolioCoaRows(store), [store]);
  const sum = useMemo(() => portfolioCoaSummary(store), [store]);
  const structure = useMemo(() => structureOverview(), []);

  const STATUS_LABEL: Record<string, { label: string; fg: string; bg: string }> = {
    'accounting-ready': { label: 'Accounting Ready', fg: '#15803d', bg: '#dcfce7' },
    'needs-coa': { label: 'Needs COA', fg: '#b91c1c', bg: '#fee2e2' },
    'needs-mapping': { label: 'Needs Mapping', fg: '#b45309', bg: '#fef3c7' },
    'needs-opening': { label: 'Needs Opening Balances', fg: '#b45309', bg: '#fef3c7' },
    'needs-review': { label: 'Needs Review', fg: '#6a6a6a', bg: '#f0f0f0' },
  };

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope="All Hotels"
        title="Chart of Accounts"
        subtitle="Manage hotel-level account structures and standard templates across HOS Management."
        actions={
          <>
            <Link href="/web/accounting/chart-of-accounts/templates" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Apply Template</Link>
            <Link href="/web/accounting/chart-of-accounts/mapping" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><GitMerge className="w-3.5 h-3.5" /> Account Mapping</Link>
            <Link href="/web/accounting/chart-of-accounts/opening-balances" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><CircleDollarSign className="w-3.5 h-3.5" /> Opening Balances</Link>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Import COA</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          </>
        }
      />
      <p className="text-xs -mt-3" style={{ color: '#929292' }}>Each hotel has its own Chart of Accounts. HOS can use one standard template, but every hotel's accounts and balances stay separate.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Building2 className="w-4 h-4" />} value={String(sum.entities)} label="Hotel Entities" subtext="Under HOS Management" tone="neutral" />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} value={String(sum.applied)} label="COA Applied" subtext="Account structure in place" tone="good" />
        <SummaryCard icon={<XCircle className="w-4 h-4" />} value={String(sum.missing)} label="Missing COA" subtext="No account structure" tone={sum.missing ? 'critical' : 'good'} />
        <SummaryCard icon={<GitMerge className="w-4 h-4" />} value={String(sum.mappingIssues)} label="Mapping Issues" subtext="Bank or card mappings missing" tone={sum.mappingIssues ? 'warning' : 'good'} onClick={() => router.push('/web/accounting/chart-of-accounts/mapping')} />
        <SummaryCard icon={<Plus className="w-4 h-4" />} value={String(sum.custom)} label="Custom Accounts" subtext="Hotel-specific accounts" tone="neutral" />
        <SummaryCard icon={<Layers className="w-4 h-4" />} value={String(sum.inactive)} label="Inactive Accounts" subtext="Hidden from new coding" tone="neutral" />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={String(sum.workbenchBlocking)} label="Workbench Blocking" subtext="Blocking posting or recon" tone={sum.workbenchBlocking ? 'critical' : 'good'} />
        <SummaryCard icon={<FileText className="w-4 h-4" />} value={String(sum.reportsReady)} label="Reports Ready" subtext="Valid report mappings" tone={sum.reportsReady ? 'good' : 'neutral'} />
      </div>

      {/* Setup status by hotel */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Chart of Accounts Setup by Hotel" subtitle="Which hotels are ready for transaction coding, posting, reconciliation, and reports." />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Code', 'Accounts', 'Required', 'Bank Map', 'Card Map', 'Opening', 'Workbench', 'Status', ''].map((h) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Accounts' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r) => {
                const h = getEntity(r.hotelId)!;
                const st = STATUS_LABEL[r.status];
                return (
                  <tr key={r.hotelId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => { selectHotel(r.hotelId); router.push('/web/accounting/chart-of-accounts'); }}>
                    <td className="py-2.5 px-2.5"><p className="font-medium truncate max-w-[180px]" style={{ color: '#222' }}>{h.hotelName}</p></td>
                    <td className="py-2.5 px-2.5 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                    <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.totalAccounts || '—'}</td>
                    <td className="py-2.5 px-2.5"><Tick ok={r.requiredComplete} /></td>
                    <td className="py-2.5 px-2.5"><Tick ok={r.bankMapped} /></td>
                    <td className="py-2.5 px-2.5"><Tick ok={r.cardMapped} /></td>
                    <td className="py-2.5 px-2.5"><Tick ok={r.openingComplete} /></td>
                    <td className="py-2.5 px-2.5"><Tick ok={r.workbenchReady} /></td>
                    <td className="py-2.5 px-2.5"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                    <td className="py-2.5 px-2.5 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>{r.applied ? 'Open COA' : 'Apply Template'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Standard template card */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Hotel Standard Chart of Accounts" subtitle="The reusable template applied to each hotel." />
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-bold" style={{ color: '#222' }}>Hotel Standard COA</p><p className="text-xs" style={{ color: '#929292' }}>{TEMPLATE_ACCOUNT_COUNT} accounts · applied to {sum.applied} hotels</p></div>
              <Link href="/web/accounting/chart-of-accounts/templates" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>View Template <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {structure.map((s) => (
                <div key={s.type} className="p-2.5 rounded-xl" style={{ border: '1px solid #eee' }}>
                  <Badge label={s.label} fg={TYPE_COLORS[s.type].fg} bg={TYPE_COLORS[s.type].bg} />
                  <p className="text-lg font-bold mt-1" style={{ color: '#222' }}>{s.count}</p>
                  <p className="text-[10px]" style={{ color: '#929292' }}>{s.required} required · {s.systemLocked} locked</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Setup issues */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Setup Issues" subtitle="Resolve these before transaction coding." />
          <div className="flex flex-col gap-2">
            {sum.missing > 0 && <IssueCard severity="critical" title={`${sum.missing} hotels are missing Chart of Accounts`} why="Transactions cannot be coded or posted without active accounts." action="Apply Template" href="/web/accounting/chart-of-accounts/templates" />}
            {sum.mappingIssues > 0 && <IssueCard severity="high" title={`${sum.mappingIssues} bank accounts are not mapped`} why="Bank transactions cannot create balanced journal entries without asset account mapping." action="Fix Bank Mapping" href="/web/accounting/chart-of-accounts/mapping" />}
            <IssueCard severity="medium" title="Some accounts missing report mapping" why="Reports may not classify these accounts correctly." action="Review Report Mapping" href="/web/accounting/chart-of-accounts/mapping" />
            {sum.missing === 0 && sum.mappingIssues === 0 && <EmptyState title="No setup issues." body="All hotels have COA applied and accounts mapped." />}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ═══════════════════════════ SINGLE HOTEL ═══════════════════════════ */
function HotelCoa({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const store = useStore2();
  const h = getEntity(hotelId)!;
  const applied = coaApplied(hotelId);
  const accounts = useMemo(() => accountsForHotel(store, hotelId), [store, hotelId]);
  const summary = useMemo(() => hotelCoaSummary(store, hotelId), [store, hotelId]);
  const snapshot = useMemo(() => balanceSnapshot(store, hotelId), [store, hotelId]);
  const unposted = useMemo(() => portfolioSummary(store, hotelId).linesToCode, [store, hotelId]);
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [q, setQ] = useState('');
  const [type, setType] = useState<CoaFullType | ''>('');

  if (!applied) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <PageHeader scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe" title={`Chart of Accounts for ${h.hotelName}`} subtitle={`${h.legalEntity} · ${h.propertyCode}`} />
        <EmptyState icon={<ListTree className="w-8 h-8" />} title="No Chart of Accounts yet." body="Apply the Hotel Standard Chart of Accounts template so this hotel can code transactions, post journal entries, reconcile accounts, and generate reports." />
        <div className="flex justify-center"><Link href="/web/accounting/chart-of-accounts/templates" className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Apply Template</Link></div>
      </div>
    );
  }

  const filtered = accounts.filter((a) => {
    if (type && a.type !== type) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase()) && !a.code.includes(q)) return false;
    return true;
  });
  const sections = [...new Set(filtered.map((a) => a.reportSection))];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={h.propertyCode} scopeFg="#1d4ed8" scopeBg="#dbeafe"
        title={`Chart of Accounts`} subtitle={`${h.hotelName} · ${h.legalEntity} · accounts used for coding, posting, reports, and reconciliation.`}
        actions={
          <>
            <Link href={`/web/accounting/chart-of-accounts/accounts/new`} className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Add Account</Link>
            <Link href="/web/accounting/chart-of-accounts/mapping" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><GitMerge className="w-3.5 h-3.5" /> Mapping</Link>
            <Link href="/web/accounting/chart-of-accounts/opening-balances" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><CircleDollarSign className="w-3.5 h-3.5" /> Opening Balances</Link>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export COA</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<ListTree className="w-4 h-4" />} value={String(summary.total)} label="Total Accounts" tone="neutral" />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} value={String(summary.active)} label="Active Accounts" tone="good" />
        <SummaryCard icon={<Layers className="w-4 h-4" />} value={String(summary.systemLocked)} label="System Locked" tone="neutral" />
        <SummaryCard icon={<Plus className="w-4 h-4" />} value={String(summary.custom)} label="Custom Accounts" tone="neutral" />
        <SummaryCard icon={<CircleDollarSign className="w-4 h-4" />} value={String(summary.withBalance)} label="Accounts With Balance" tone="neutral" />
        <SummaryCard icon={<GitMerge className="w-4 h-4" />} value={String(summary.mappingIssues)} label="Mapping Issues" tone={summary.mappingIssues ? 'warning' : 'good'} />
        <SummaryCard icon={<Wand2 className="w-4 h-4" />} value={String(summary.usedInWorkbench)} label="Used in Workbench" tone="brand" />
        <SummaryCard icon={<FileText className="w-4 h-4" />} value="Complete" label="Report Mapping" tone="good" />
      </div>

      {/* Balance snapshot */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Account Balance Snapshot" subtitle="Current balances based on posted journal entries only." />
        {unposted > 0 && <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: '#fff7ed', color: '#b45309' }}>Balances may change because {unposted} statement lines are not posted.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Snap label="Total Assets" value={moneyShort(snapshot.assets)} />
          <Snap label="Total Liabilities" value={moneyShort(snapshot.liabilities)} />
          <Snap label="Total Equity" value={moneyShort(snapshot.equity)} />
          <Snap label="Revenue" value={moneyShort(snapshot.revenue)} accent="#15803d" />
          <Snap label="Expenses" value={moneyShort(snapshot.expenses)} accent="#b91c1c" />
          <Snap label="Net Income" value={moneyShort(snapshot.net)} accent={snapshot.net >= 0 ? '#15803d' : '#b91c1c'} />
        </div>
      </section>

      {/* Accounts list / tree */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <SectionHeader title="Accounts" subtitle="Available for coding transactions, posting journal entries, and generating reports." />
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
            <button onClick={() => setView('list')} className="h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: view === 'list' ? PURPLE : '#fff', color: view === 'list' ? '#fff' : '#6a6a6a' }}><Rows3 className="w-3.5 h-3.5" /> List</button>
            <button onClick={() => setView('tree')} className="h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: view === 'tree' ? PURPLE : '#fff', color: view === 'tree' ? '#fff' : '#6a6a6a' }}><ListTree className="w-3.5 h-3.5" /> Tree</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-xs" style={inputStyle}>
            <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or name…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value as CoaFullType | '')} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
            <option value="">All Types</option>
            {Object.entries(COA_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{filtered.filter((a) => !a.isHeader).length} accounts</span>
        </div>

        {view === 'list' ? (
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['Code', 'Account Name', 'Type', 'Report Section', 'Balance', 'Used In', 'Status', ''].map((h) => (
                  <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Balance' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.filter((a) => !a.isHeader).map((a) => (
                  <tr key={a.code} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}`)}>
                    <td className="py-2 px-3 text-xs font-mono" style={{ color: '#929292' }}>{a.code}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
                    <td className="py-2 px-3"><Badge label={COA_TYPE_LABEL[a.type]} fg={TYPE_COLORS[a.type].fg} bg={TYPE_COLORS[a.type].bg} /></td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.reportSection}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: a.balance ? '#222' : '#c1c1c1' }}>{a.balance ? money(a.balance) : '—'}</td>
                    <td className="py-2 px-3 text-[11px]" style={{ color: '#929292' }}>{a.usedIn.slice(0, 2).join(', ') || '—'}</td>
                    <td className="py-2 px-3">{a.systemLocked ? <Badge label="System Locked" fg="#6a6a6a" bg="#f0f0f0" /> : <Badge label="Active" fg="#15803d" bg="#dcfce7" />}</td>
                    <td className="py-2 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>View</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TreeView accounts={filtered} onOpen={(code) => router.push(`/web/accounting/chart-of-accounts/accounts/${code}`)} />
        )}
      </section>
    </div>
  );
}

function TreeView({ accounts, onOpen }: { accounts: LiveAccount[]; onOpen: (code: string) => void }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (code: string) => setCollapsed((p) => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  const headers = accounts.filter((a) => a.isHeader);
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      {headers.map((hdr) => {
        const children = accounts.filter((a) => a.parent === hdr.code);
        const isCollapsed = collapsed.has(hdr.code);
        return (
          <div key={hdr.code}>
            <button onClick={() => toggle(hdr.code)} className="w-full flex items-center gap-2 px-4 py-2.5 text-left" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#929292' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#929292' }} />}
              <span className="text-xs font-mono" style={{ color: '#929292' }}>{hdr.code}</span>
              <span className="text-sm font-bold flex-1" style={{ color: '#222' }}>{hdr.name}</span>
              <Badge label={COA_TYPE_LABEL[hdr.type]} fg={TYPE_COLORS[hdr.type].fg} bg={TYPE_COLORS[hdr.type].bg} />
            </button>
            {!isCollapsed && children.map((c) => (
              <button key={c.code} onClick={() => onOpen(c.code)} className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f7f7f7', paddingLeft: 40 }}>
                <span className="text-xs font-mono w-12" style={{ color: '#929292' }}>{c.code}</span>
                <span className="text-sm flex-1" style={{ color: '#222' }}>{c.name}</span>
                {c.balance > 0 && <span className="text-xs" style={{ color: '#6a6a6a' }}>{money(c.balance)}</span>}
                {c.systemLocked && <Badge label="Locked" fg="#6a6a6a" bg="#f0f0f0" />}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Tick({ ok }: { ok: boolean }) { return ok ? <CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} /> : <XCircle className="w-4 h-4" style={{ color: '#dddddd' }} />; }
function Snap({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
function IssueCard({ severity, title, why, action, href }: { severity: 'critical' | 'high' | 'medium'; title: string; why: string; action: string; href: string }) {
  const map = { critical: { fg: '#b91c1c', bg: '#fee2e2' }, high: { fg: '#b45309', bg: '#fef3c7' }, medium: { fg: '#1d4ed8', bg: '#dbeafe' } }[severity];
  return (
    <Link href={href} className="p-3.5 rounded-2xl flex items-start gap-3 hover:shadow-md transition-shadow" style={card}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: map.bg, color: map.fg }}><AlertTriangle className="w-4 h-4" /></div>
      <div className="flex-1"><div className="flex items-center gap-2"><Badge label={severity} fg={map.fg} bg={map.bg} /><span className="text-sm font-semibold" style={{ color: '#222' }}>{title}</span></div><p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{why}</p></div>
      <span className="text-[11px] font-semibold whitespace-nowrap self-center" style={{ color: PURPLE }}>{action}</span>
    </Link>
  );
}
