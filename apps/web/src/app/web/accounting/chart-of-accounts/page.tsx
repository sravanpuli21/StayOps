'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Layers, Download, Settings as SettingsIcon, GitCompare, FileText,
  ArrowRight, AlertTriangle, ListTree,
} from 'lucide-react';
import {
  getEntity, COA_TEMPLATES, coaTemplateSummary,
} from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState } from '../_store';
import { card, Badge, money, fmtDate } from '../_ui';
import { portfolioCoaSummary, hotelCoaSummary, accountsForHotel, coaSetupForHotel } from '../_coa';
import { CoaTabs, SummaryCard, TypeBadge, StatusBadge } from './_shared';
import { ApplyTemplateModal } from './_ApplyTemplate';
import { AccountForm } from './_AccountForm';

const SETUP_BADGE: Record<string, { fg: string; bg: string }> = {
  Complete: { fg: '#15803d', bg: '#dcfce7' },
  'Needs Template': { fg: '#b91c1c', bg: '#fee2e2' },
  'Needs Mapping': { fg: '#b45309', bg: '#fef3c7' },
  'Needs Opening Balance': { fg: '#b45309', bg: '#fef3c7' },
  'Needs Review': { fg: '#1d4ed8', bg: '#dbeafe' },
};

export default function CoaOverviewPage() {
  const { selection, selectHotel } = useAcctOs();
  const single = selection.kind === 'hotel';
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <CoaTabs />
      {single ? <SingleHotel hotelId={selection.hotelId} /> : <AllHotels onPick={selectHotel} />}
    </div>
  );
}

/* ─────────────────────────── ALL HOTELS ─────────────────────────── */
function AllHotels({ onPick }: { onPick: (id: string) => void }) {
  const router = useRouter();
  const store = useAcctState();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyHotel, setApplyHotel] = useState<string | undefined>();
  const p = portfolioCoaSummary(store);
  const t = coaTemplateSummary();

  const openCoa = (id: string) => { onPick(id); router.push('/web/accounting/chart-of-accounts/accounts'); };

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Chart of Accounts</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Manage accounting account structure across HOS hotel entities.</p>
          <p className="text-xs mt-0.5 max-w-2xl" style={{ color: '#b0b0b0' }}>Each hotel has its own Chart of Accounts. Hotels can use the same template, but their books and balances remain separate.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/web/accounting/chart-of-accounts/template" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileText className="w-3.5 h-3.5" /> View Template</Link>
          <Link href="/web/accounting/chart-of-accounts/setup-status" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><GitCompare className="w-3.5 h-3.5" /> Compare Hotel Setup</Link>
          <Link href="/web/accounting/chart-of-accounts/export" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export COA Setup</Link>
          <button onClick={() => { setApplyHotel(undefined); setApplyOpen(true); }} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Layers className="w-4 h-4" /> Apply Template to Hotel</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Hotel Entities" value={p.entities} />
        <SummaryCard label="Hotels With COA Applied" value={p.applied} accent="#15803d" />
        <SummaryCard label="Hotels Missing COA" value={p.missing} accent={p.missing ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Custom Accounts" value={p.custom} accent="#6a4ec0" />
        <SummaryCard label="Inactive Accounts" value={p.inactive} />
        <SummaryCard label="Setup Issues" value={p.issues} accent={p.issues ? '#b45309' : '#15803d'} />
      </div>

      {/* A. COA Setup by Hotel */}
      <Section title="COA Setup by Hotel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Hotel', 'Legal Entity', 'Code', 'Template', 'Accounts', 'Custom', 'Missing Req.', 'Bank Map', 'Card Map', 'Opening Bal.', 'Status', 'Actions'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {p.setups.map((s) => {
                const h = getEntity(s.hotelId)!;
                return (
                  <tr key={s.hotelId} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{h.hotelName}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{h.legalEntity}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                    <td className="py-2.5 px-3">{s.templateApplied ? <Badge label="Applied" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Applied" fg="#b91c1c" bg="#fee2e2" />}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{s.totalAccounts || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a4ec0' }}>{s.customAccounts || '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: s.missingRequired ? '#b91c1c' : '#3f3f3f' }}>{s.missingRequired || '—'}</td>
                    <td className="py-2.5 px-3">{s.bankMapped ? <Badge label="OK" fg="#15803d" bg="#dcfce7" /> : <Badge label="Needs" fg="#b45309" bg="#fef3c7" />}</td>
                    <td className="py-2.5 px-3">{s.cardMapped ? <Badge label="OK" fg="#15803d" bg="#dcfce7" /> : <Badge label="Needs" fg="#b45309" bg="#fef3c7" />}</td>
                    <td className="py-2.5 px-3 text-xs capitalize" style={{ color: s.openingStatus === 'entered' ? '#15803d' : '#b45309' }}>{s.openingStatus}</td>
                    <td className="py-2.5 px-3"><Badge label={s.status} {...(SETUP_BADGE[s.status] ?? SETUP_BADGE.Complete)} /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {s.status === 'Needs Template'
                        ? <button onClick={() => { setApplyHotel(s.hotelId); setApplyOpen(true); }} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Apply Template</button>
                        : <button onClick={() => openCoa(s.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View COA</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* B + C grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Standard Template">
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2"><ListTree className="w-5 h-5" style={{ color: '#6a4ec0' }} /><div><p className="font-bold" style={{ color: '#222' }}>Hotel Standard Chart of Accounts</p><p className="text-xs" style={{ color: '#929292' }}>Default account structure for HOS hotel entities.</p></div></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Total', t.total], ['Revenue', t.revenue], ['Expenses', t.expenses], ['Assets', t.assets], ['Liabilities', t.liabilities], ['Equity', t.equity]].map(([l, v]) => (
                <div key={l as string} className="py-2 rounded-lg" style={{ background: '#f7f7f7' }}><p className="text-base font-bold" style={{ color: '#222' }}>{v}</p><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>{l}</p></div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: '#929292' }}><span>Last updated {fmtDate('2026-04-18')}</span><span>Applied to {COA_TEMPLATES[0].appliedHotels} hotels</span></div>
            <div className="flex gap-2"><Link href="/web/accounting/chart-of-accounts/template" className="flex-1 text-center h-9 leading-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Template</Link><button onClick={() => { setApplyHotel(undefined); setApplyOpen(true); }} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Apply to Hotel</button></div>
          </div>
        </Section>

        <Section title="Setup Issues">
          <div className="p-4 flex flex-col gap-2">
            {[
              { sev: 'High', msg: `${p.missing} hotels do not have Chart of Accounts applied.`, action: 'Apply Template', onClick: () => { setApplyHotel(undefined); setApplyOpen(true); } },
              { sev: 'Medium', msg: '3 bank accounts are not mapped to asset accounts.', action: 'Review Mapping', href: '/web/accounting/chart-of-accounts/mapping' },
              { sev: 'Medium', msg: '2 credit cards are not mapped to liability accounts.', action: 'Review Mapping', href: '/web/accounting/chart-of-accounts/mapping' },
              { sev: 'Low', msg: '5 accounts are missing report grouping.', action: 'Review Accounts', href: '/web/accounting/chart-of-accounts/setup-status' },
              { sev: 'Low', msg: '4 accounts were manually created and need review.', action: 'Review Accounts', href: '/web/accounting/chart-of-accounts/setup-status' },
            ].map((i, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
                <Badge label={i.sev} fg={i.sev === 'High' ? '#b91c1c' : i.sev === 'Medium' ? '#b45309' : '#6a6a6a'} bg={i.sev === 'High' ? '#fee2e2' : i.sev === 'Medium' ? '#fef3c7' : '#f0f0f0'} />
                <span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{i.msg}</span>
                {i.href ? <Link href={i.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{i.action}</Link> : <button onClick={i.onClick} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{i.action}</button>}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {applyOpen && <ApplyTemplateModal preHotel={applyHotel} onClose={() => setApplyOpen(false)} />}
    </>
  );
}

/* ─────────────────────────── SINGLE HOTEL ─────────────────────────── */
function SingleHotel({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const store = useAcctState();
  const [addOpen, setAddOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const h = getEntity(hotelId);
  const s = hotelCoaSummary(store, hotelId);
  const setup = coaSetupForHotel(store, hotelId);
  const accts = accountsForHotel(store, hotelId).filter((a) => !a.isHeader);

  if (!setup.templateApplied) {
    return (
      <>
        <Header h={h} />
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <ListTree className="w-10 h-10 mx-auto" style={{ color: '#cfcfcf' }} />
          <p className="text-base font-semibold mt-3" style={{ color: '#222' }}>No Chart of Accounts yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Apply the Hotel Standard Chart of Accounts template to create this hotel’s accounting structure.</p>
          <button onClick={() => setApplyOpen(true)} className="mt-4 h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Apply Template</button>
        </div>
        {applyOpen && <ApplyTemplateModal preHotel={hotelId} onClose={() => setApplyOpen(false)} />}
      </>
    );
  }

  const byType = (t: string) => accts.filter((a) => a.type === t);
  const typeRows: Array<[string, string]> = [['Asset', 'Assets'], ['Liability', 'Liabilities'], ['Equity', 'Equity'], ['Revenue', 'Revenue'], ['COGS', 'Cost of Goods Sold'], ['Expense', 'Expenses'], ['Other Income', 'Other Income'], ['Other Expense', 'Other Expenses']];
  const attention = accts.filter((a) => a.status === 'inactive' || (a.custom && a.txCount === 0));

  return (
    <>
      <Header h={h} onAdd={() => setAddOpen(true)} onApply={() => setApplyOpen(true)} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total Accounts" value={s.total} />
        <SummaryCard label="Active Accounts" value={s.active} accent="#15803d" />
        <SummaryCard label="Inactive Accounts" value={s.inactive} />
        <SummaryCard label="Custom Accounts" value={s.custom} accent="#6a4ec0" />
        <SummaryCard label="Accounts With Balance" value={s.withBalance} accent="#1d4ed8" />
        <SummaryCard label="Mapping Issues" value={s.mappingIssues} accent={s.mappingIssues ? '#b45309' : '#15803d'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* A. Account list (top accounts) */}
        <div className="lg:col-span-2">
          <Section title="Account List" action={<Link href="/web/accounting/chart-of-accounts/accounts" className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View All Accounts</Link>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Code', 'Account Name', 'Type', 'Balance', 'Status'].map((x, i) => <th key={x} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i === 3 ? 'right' : 'left' }}>{x}</th>)}</tr></thead>
                <tbody>
                  {accts.slice(0, 12).map((a, i) => (
                    <tr key={a.code} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < 11 ? '1px solid #f0f0f0' : 'none' }} onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}`)}>
                      <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{a.code}</td>
                      <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{a.name}</td>
                      <td className="py-2.5 px-3"><TypeBadge type={a.type} /></td>
                      <td className="py-2.5 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{a.balance ? money(a.balance) : '—'}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* B. Account type summary */}
        <div className="flex flex-col gap-5">
          <Section title="Account Type Summary">
            <div className="p-4 flex flex-col gap-1.5">
              {typeRows.map(([key, label]) => { const list = byType(key); if (!list.length) return null; return (
                <div key={key} className="flex items-center justify-between text-sm"><span style={{ color: '#3f3f3f' }}>{label}</span><span className="font-semibold" style={{ color: '#222' }}>{list.length}</span></div>
              ); })}
            </div>
          </Section>
          <Section title="Accounts Needing Attention">
            <div className="p-4 flex flex-col gap-2">
              {attention.length === 0 ? <p className="text-xs" style={{ color: '#929292' }}>Nothing needs attention.</p> : attention.slice(0, 5).map((a) => (
                <div key={a.code} className="flex items-center justify-between text-sm"><span style={{ color: '#3f3f3f' }}>{a.code} {a.name}</span><Badge label={a.status === 'inactive' ? 'Inactive' : 'Review'} fg="#b45309" bg="#fef3c7" /></div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* D. Recent activity */}
      <Section title="Recent Account Activity">
        <div className="flex flex-col">
          {store.entityActivity.filter((a) => a.recordType === 'Account' && a.hotelId === hotelId).slice(0, 6).map((a, i, arr) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}<span className="ml-auto text-[11px]" style={{ color: '#b0b0b0' }}>{fmtDate(a.ts.slice(0, 10))}</span></div>
          ))}
          {store.entityActivity.filter((a) => a.recordType === 'Account' && a.hotelId === hotelId).length === 0 && <p className="px-4 py-4 text-xs" style={{ color: '#929292' }}>No account changes yet for this hotel.</p>}
        </div>
      </Section>

      {addOpen && <AccountForm preHotel={hotelId} onClose={() => setAddOpen(false)} onSaved={(c) => router.push(`/web/accounting/chart-of-accounts/accounts/${c}`)} />}
      {applyOpen && <ApplyTemplateModal preHotel={hotelId} onClose={() => setApplyOpen(false)} />}
    </>
  );
}

function Header({ h, onAdd, onApply }: { h?: ReturnType<typeof getEntity>; onAdd?: () => void; onApply?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" />
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Chart of Accounts for {h?.hotelName}</h1><p className="text-sm" style={{ color: '#929292' }}>{h?.legalEntity} · {h?.propertyCode} · Manage this hotel’s accounting accounts.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>These accounts belong only to this hotel entity.</p></div>
      </div>
      {onAdd && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onApply} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Layers className="w-3.5 h-3.5" /> Apply Template</button>
          <Link href="/web/accounting/chart-of-accounts/opening-balances" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FileText className="w-3.5 h-3.5" /> Opening Balances</Link>
          <Link href="/web/accounting/chart-of-accounts/mapping" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><ArrowRight className="w-3.5 h-3.5" /> Account Mapping</Link>
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add Account</button>
        </div>
      )}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>{action}</div>
      {children}
    </div>
  );
}
