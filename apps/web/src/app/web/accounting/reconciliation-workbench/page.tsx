'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList, Send, CheckCheck, AlertTriangle, Receipt, FileCheck2, CalendarX2, ArrowRight, Plus,
  Building2, Landmark, CreditCard, Search,
} from 'lucide-react';
import { HOTEL_ENTITIES, bankAccountsForHotel, creditCardsForHotel, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { allSessionRows, portfolioSummary, type SessionRow } from '../_recon2';
import { hotelLabel } from '../_domain';
import { card, money, Badge, PageHeader, Tabs, EmptyState, Kpi, SESSION_STATUS, PURPLE, fmtDate, inputStyle } from '../_ui';

function Inner() {
  const { selection } = useAcctOs();
  // Reconciliation is account-wise and requires a hotel. No hotel → gate.
  if (selection.kind !== 'hotel') return <HotelGate />;
  return <HotelWorkbench hotelId={selection.hotelId} />;
}

/* ── Gate: must pick a hotel first ────────────────────────────────────── */
function HotelGate() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const [q, setQ] = useState('');
  const hotels = HOTEL_ENTITIES.filter((h) => {
    const s = q.toLowerCase();
    return !s || h.hotelName.toLowerCase().includes(s) || h.propertyCode.toLowerCase().includes(s) || h.city.toLowerCase().includes(s);
  });
  const pick = (id: string) => { selectHotel(id); /* stays on reconciliation, now hotel-scoped */ };

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <PageHeader title="Reconciliation Workbench" subtitle="Reconciliation is done one hotel at a time. Select a hotel to see its bank accounts and cards." />
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ ...card }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}><Building2 className="w-5 h-5" style={{ color: PURPLE }} /></div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#222' }}>Select a hotel to reconcile</p>
            <p className="text-xs" style={{ color: '#929292' }}>Pick one below, or use the hotel dropdown in the top bar. You can also browse <Link href="/web/accounting/entities" className="font-semibold" style={{ color: PURPLE }}>Hotel Entities</Link>.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg max-w-sm" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hotel, code, city…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {hotels.map((h) => (
            <button key={h.id} onClick={() => pick(h.id)} className="p-3 rounded-xl text-left flex items-center gap-2.5 hover:shadow-md transition-shadow" style={{ border: '1px solid #eee' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}><Building2 className="w-4 h-4" style={{ color: PURPLE }} /></div>
              <div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px] truncate" style={{ color: '#929292' }}>{h.propertyCode} · {h.city}, {h.state}</p></div>
            </button>
          ))}
          {hotels.length === 0 && <p className="px-1 py-4 text-sm" style={{ color: '#929292' }}>No hotels match.</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Hotel-scoped, account-wise workbench ─────────────────────────────── */
const TABS = [
  { key: 'accounts', label: 'Accounts' },
  { key: 'active', label: 'Active Sessions' },
  { key: 'difference', label: 'Difference Found' },
  { key: 'missing-support', label: 'Missing Support' },
  { key: 'completed', label: 'Completed' },
];

function HotelWorkbench({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const store = useStore2();
  const h = getEntity(hotelId)!;

  const [tab, setTab] = useState(params.get('tab') ?? 'accounts');
  const rows = useMemo(() => allSessionRows(store, hotelId), [store, hotelId]);
  const sum = useMemo(() => portfolioSummary(store, hotelId), [store, hotelId]);

  // Account-wise: every bank account + card for this hotel, with its latest session.
  const accounts = useMemo<AcctEntry[]>(() => {
    const bankRows = bankAccountsForHotel(hotelId).map((b) => ({ id: b.id, name: b.name, last4: b.last4, institution: b.bank, kind: 'bank' as const }));
    const cardRows = creditCardsForHotel(hotelId).map((c) => ({ id: c.id, name: c.name, last4: c.last4, institution: c.issuer, kind: 'card' as const }));
    return [...bankRows, ...cardRows].map((a) => ({ ...a, session: rows.find((r) => r.imp.accountId === a.id) }));
  }, [hotelId, rows]);

  const open = (sessionId: string, classic: boolean) => router.push(`/web/accounting/reconciliation-workbench/${sessionId}${classic ? '?mode=classic' : ''}`);
  const startFor = (a: { id: string; kind: 'bank' | 'card' }) => router.push(`/web/accounting/reconciliation-workbench/start?hotel=${hotelId}&type=${a.kind === 'bank' ? 'bank' : 'credit-card'}&account=${a.id}`);

  const filteredSessions = rows.filter((r) => {
    switch (tab) {
      case 'active': return r.status !== 'reconciled' && r.status !== 'not-started';
      case 'difference': return r.status === 'difference-found';
      case 'missing-support': return r.counts.missingReceipts > 0;
      case 'completed': return r.status === 'reconciled';
      default: return true;
    }
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelLabel(hotelId).name} scopeFg="#1d4ed8" scopeBg="#dbeafe"
        title="Reconciliation Workbench"
        subtitle={`${h.legalEntity} · ${h.propertyCode} · select an account to reconcile.`}
        actions={
          <Link href={`/web/accounting/reconciliation-workbench/start?hotel=${hotelId}`} className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Start Reconciliation</Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Kpi icon={<ClipboardList className="w-4 h-4" />} label="Lines to Code" value={String(sum.linesToCode)} accent={sum.linesToCode ? '#b45309' : '#15803d'} onClick={() => setTab('active')} />
        <Kpi icon={<Send className="w-4 h-4" />} label="Ready to Post" value={String(sum.readyToPost)} accent="#1d4ed8" />
        <Kpi icon={<CheckCheck className="w-4 h-4" />} label="Posted & Cleared" value={String(sum.cleared)} accent="#15803d" />
        <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Difference Found" value={String(sum.differences)} accent={sum.differences ? '#b91c1c' : '#15803d'} onClick={() => setTab('difference')} />
        <Kpi icon={<Receipt className="w-4 h-4" />} label="Missing Receipts" value={String(sum.missingReceipts)} accent={sum.missingReceipts ? '#b91c1c' : '#15803d'} onClick={() => setTab('missing-support')} />
        <Kpi icon={<FileCheck2 className="w-4 h-4" />} label="Ready to Finish" value={String(sum.readyToReconcile)} accent={PURPLE} />
        <Kpi icon={<CalendarX2 className="w-4 h-4" />} label="Close Blockers" value={String(sum.blockers)} accent={sum.blockers ? '#b91c1c' : '#15803d'} onClick={() => router.push('/web/accounting/month-close')} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'accounts' ? (
        <section className="flex flex-col gap-4">
          <AccountGroup title="Bank Accounts" icon={<Landmark className="w-4 h-4" />} accounts={accounts.filter((a) => a.kind === 'bank')} onOpen={open} onStart={startFor} />
          <AccountGroup title="Credit Cards" icon={<CreditCard className="w-4 h-4" />} accounts={accounts.filter((a) => a.kind === 'card')} onOpen={open} onStart={startFor} />
        </section>
      ) : filteredSessions.length === 0 ? (
        <EmptyState icon={<CheckCheck className="w-8 h-8" />} title="Nothing in this view." body="Reconciliation sessions for this hotel appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Account / Card', 'Period', 'Type', 'Lines', 'Needs Coding', 'Difference', 'Status', ''].map((hd) => (
                <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Lines', 'Needs Coding', 'Difference'].includes(hd) ? 'right' : 'left' }}>{hd}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredSessions.map((r) => <SessionRowEl key={r.id} r={r} onOpen={() => open(r.id, r.imp.mode === 'classic')} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Account group: pick an account to proceed ────────────────────────── */
interface AcctEntry { id: string; name: string; last4: string; institution: string; kind: 'bank' | 'card'; session?: SessionRow }
function AccountGroup({ title, icon, accounts, onOpen, onStart }: {
  title: string; icon: React.ReactNode; accounts: AcctEntry[];
  onOpen: (sessionId: string, classic: boolean) => void; onStart: (a: { id: string; kind: 'bank' | 'card' }) => void;
}) {
  if (accounts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: '#6a6a6a' }}>{icon} {title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((a) => {
          const s = a.session;
          const status = s ? SESSION_STATUS[s.status] : SESSION_STATUS['not-started'];
          const diff = s ? Math.abs(s.math.difference) : 0;
          const action = !s ? 'Start Reconciliation' : s.status === 'reconciled' ? 'View Report' : s.status === 'difference-found' ? 'Review Difference' : s.status === 'ready-to-reconcile' ? 'Finish' : 'Continue';
          return (
            <button key={a.id}
              onClick={() => (s ? onOpen(s.id, s.imp.mode === 'classic') : onStart(a))}
              className="p-4 rounded-2xl text-left flex flex-col gap-2 hover:shadow-md transition-shadow" style={card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#222' }}>{a.name}</p>
                  <p className="text-[11px]" style={{ color: '#929292' }}>{a.institution} · ••{a.last4}</p>
                </div>
                <Badge label={status.label} fg={status.fg} bg={status.bg} />
              </div>
              {s ? (
                <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: '1px solid #f7f7f7' }}>
                  <span className="text-[11px] pt-2" style={{ color: '#929292' }}>{fmtDate(s.imp.startDate)}–{fmtDate(s.imp.endDate)}</span>
                  <span className="text-xs font-semibold pt-2" style={{ color: diff < 0.005 ? '#15803d' : '#b91c1c' }}>{money(diff)}</span>
                </div>
              ) : (
                <p className="text-[11px] pt-2 mt-auto" style={{ color: '#929292', borderTop: '1px solid #f7f7f7' }}>No reconciliation started yet.</p>
              )}
              <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>{action} <ArrowRight className="w-3 h-3" /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SessionRowEl({ r, onOpen }: { r: SessionRow; onOpen: () => void }) {
  const st = SESSION_STATUS[r.status];
  const diff = r.math.difference;
  const action = r.status === 'reconciled' ? 'View Report' : r.status === 'difference-found' ? 'Review Issues' : r.status === 'ready-to-reconcile' ? 'Finish' : 'Open';
  return (
    <tr className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={onOpen}>
      <td className="py-2.5 px-2.5"><p className="text-sm" style={{ color: '#222' }}>{r.imp.accountName}</p><p className="text-[11px]" style={{ color: '#929292' }}>••{r.imp.accountLast4}</p></td>
      <td className="py-2.5 px-2.5 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(r.imp.startDate)}–{fmtDate(r.imp.endDate)}</td>
      <td className="py-2.5 px-2.5">{r.imp.statementType === 'bank' ? <Badge label="Bank" fg="#1d4ed8" bg="#dbeafe" /> : <Badge label="Card" fg="#b45309" bg="#fef3c7" />}</td>
      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{r.counts.total}</td>
      <td className="py-2.5 px-2.5 text-xs text-right font-semibold" style={{ color: r.counts.needsCoding ? '#b45309' : '#15803d' }}>{r.counts.needsCoding}</td>
      <td className="py-2.5 px-2.5 text-xs text-right font-semibold" style={{ color: Math.abs(diff) < 0.005 ? '#15803d' : '#b91c1c' }}>{money(Math.abs(diff))}</td>
      <td className="py-2.5 px-2.5"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
      <td className="py-2.5 px-2.5 text-right"><span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>{action} <ArrowRight className="w-3 h-3" /></span></td>
    </tr>
  );
}

export default function WorkbenchListPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
