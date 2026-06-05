'use client';

import { use, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Landmark, CreditCard, Upload, Pencil, MoreHorizontal,
  BedDouble, ClipboardList, Receipt, CalendarCheck, Check, AlertTriangle, Copy,
  Eye, MapPin, Phone, Plus, FileText, Shield,
} from 'lucide-react';
import { closeForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import {
  useAcctState, addBankAccount, addCreditCard, assignEntityUser, applyCoaTemplate, saveOpeningBalances,
  type NewBankAccount, type NewCreditCard,
} from '../../_store';
import { oneEntity, banksFor, cardsFor, maskTaxId } from '../../_entities';
import { setupForHotel, SETUP_STEP_LABEL, type SetupStep } from '../../_setup';
import { card, money, Badge, fmtDate, fmtMonth, RECON_STATUS, CLOSE_STATUS } from '../../_ui';
import { EditEntityDrawer } from '../_EditDrawer';

const TABS = ['Overview', 'Accounting Setup', 'Bank Accounts', 'Credit Cards', 'Users', 'Documents', 'Activity', 'Settings'] as const;
type Tab = typeof TABS[number];

function EntityDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { selectHotel } = useAcctOs();
  const store = useAcctState();
  const h = oneEntity(store, id);
  const initialTab = (params.get('tab') as Tab) || 'Overview';
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : 'Overview');
  const [edit, setEdit] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [revealTax, setRevealTax] = useState(false);

  if (!h) {
    return <div className="max-w-4xl mx-auto"><Link href="/web/accounting/entities" className="text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4 inline" /> Hotel Entities</Link><p className="mt-6 text-sm" style={{ color: '#929292' }}>Entity not found.</p></div>;
  }

  const banks = banksFor(store, h.id);
  const cards = cardsFor(store, h.id);
  const close = closeForHotel(h.id);
  const setup = setupForHotel(h.id, store);
  const openBooks = () => { selectHotel(h.id); router.push('/web/accounting/dashboard'); };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/entities" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f0eefb' }}><Building2 className="w-6 h-6" style={{ color: '#6a4ec0' }} /></div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold" style={{ color: '#222' }}>{h.hotelName}</h1><Badge label={h.status === 'archived' ? 'Archived' : 'Active'} fg="#15803d" bg="#dcfce7" /></div>
            <p className="text-sm" style={{ color: '#929292' }}>{h.legalEntity} · {h.propertyCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openBooks} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Open Books</button>
          <Link href={`/web/accounting/banking/upload?hotel=${h.id}`} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Upload</Link>
          <button onClick={() => setEdit(true)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SC icon={<BedDouble className="w-4 h-4" />} label="Rooms" value={String(h.rooms)} />
        <SC icon={<Landmark className="w-4 h-4" />} label="Bank Accounts" value={String(banks.length)} />
        <SC icon={<CreditCard className="w-4 h-4" />} label="Credit Cards" value={String(cards.length)} />
        <SC icon={<ClipboardList className="w-4 h-4" />} label="To Review" value={String(close?.toReview ?? 0)} accent={close?.toReview ? '#b45309' : '#15803d'} />
        <SC icon={<Receipt className="w-4 h-4" />} label="Missing Receipts" value={String(close?.missingReceipts ?? 0)} accent={close?.missingReceipts ? '#b91c1c' : '#15803d'} />
        <SC icon={<CalendarCheck className="w-4 h-4" />} label="May 2026 Close" value={close ? CLOSE_STATUS[close.status].label : '—'} accent={close ? CLOSE_STATUS[close.status].fg : '#222'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="flex flex-col gap-5">
          <Sect title="Entity Information">
            <Info label="Hotel / Business Name" value={h.hotelName} />
            <Info label="Legal Entity" value={h.legalEntity} />
            <Info label="Management Company" value="HOS Management" />
            <Info label="Property Code" value={h.propertyCode} />
            <Info label="Tax ID" value={revealTax ? h.taxId : maskTaxId(h.taxId)} action={<button onClick={() => { if (!revealTax && !confirm('You are about to reveal sensitive tax information. Continue?')) return; setRevealTax((v) => !v); }} className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#6a4ec0' }}><Eye className="w-3 h-3" />{revealTax ? 'Hide' : 'Reveal'}</button>} />
            <Info label="Status" value={h.status === 'archived' ? 'Archived' : 'Active'} />
          </Sect>
          <Sect title="Property Information">
            <Info label="Address" value={h.address} action={<button onClick={() => { navigator.clipboard?.writeText(h.address); }} className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#6a4ec0' }}><Copy className="w-3 h-3" /> Copy</button>} />
            <Info label="Phone" value={h.phone} />
            <Info label="City / State" value={`${h.city}, ${h.state}`} />
            <Info label="Rooms" value={String(h.rooms)} />
            <Info label="Opening Date" value={fmtDate(h.openingDate)} />
            <Info label="Manager" value={h.manager} />
          </Sect>
          <Sect title="Accounting Summary">
            <Info label="Accounting Method" value="Accrual" />
            <Info label="Fiscal Year Start" value="January" />
            <Info label="Chart of Accounts" value="Hotel Standard COA" />
            <Info label="Opening Balance" value={store.openingBalances[h.id]?.entered ?? true ? 'Complete' : 'Not entered'} />
            <Info label="Current Open Month" value="May 2026" />
            <Info label="Reconciliation" value={close?.reconciled ? 'Complete' : 'Pending'} />
          </Sect>
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {[
              ['Open Books', openBooks],
              ['Upload Bank Statement', () => router.push(`/web/accounting/banking/upload?hotel=${h.id}`)],
              ['Upload Card Statement', () => router.push(`/web/accounting/credit-cards/upload?hotel=${h.id}`)],
              ['Review Transactions', () => { selectHotel(h.id); router.push('/web/accounting/transactions'); }],
              ['Start Reconciliation', () => router.push('/web/accounting/reconciliation')],
              ['Run P&L', () => { selectHotel(h.id); router.push('/web/accounting/reports'); }],
              ['Continue Month Close', () => { selectHotel(h.id); router.push('/web/accounting/month-close'); }],
            ].map(([label, fn]) => (
              <button key={label as string} onClick={fn as () => void} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>{label as string}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'Accounting Setup' && (
        <div className="flex flex-col gap-5">
          <div className="p-5" style={card}>
            <div className="flex items-center justify-between mb-3"><p className="text-sm font-bold" style={{ color: '#222' }}>Setup Progress</p><p className="text-lg font-bold" style={{ color: '#6a4ec0' }}>{setup.pct}% Complete</p></div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}><div className="h-2 rounded-full" style={{ width: `${setup.pct}%`, background: '#6a4ec0' }} /></div>
            <div className="mt-4 flex flex-col gap-2">
              {(Object.keys(SETUP_STEP_LABEL) as SetupStep[]).map((k) => {
                const ok = setup.steps[k];
                return (
                  <div key={k} className="flex items-center gap-3 py-1.5" style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ok ? '#dcfce7' : '#fef3c7' }}>{ok ? <Check className="w-3.5 h-3.5" style={{ color: '#15803d' }} /> : <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#b45309' }} />}</div>
                    <span className="flex-1 text-sm" style={{ color: '#222' }}>{SETUP_STEP_LABEL[k]}</span>
                    {!ok && <button onClick={() => { if (k === 'bank') setBankModal(true); else if (k === 'cards') setCardModal(true); else if (k === 'opening') saveOpeningBalances(h.id, '2026-01-01'); else if (k === 'coa') applyCoaTemplate(h.id, 'Hotel Standard COA'); }} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{k === 'bank' ? 'Add Bank Account' : k === 'cards' ? 'Add Credit Card' : k === 'opening' ? 'Enter Opening Balance' : k === 'coa' ? 'Apply Template' : 'Fix'}</button>}
                  </div>
                );
              })}
            </div>
          </div>
          <Sect title="Chart of Accounts">
            <Info label="Template" value="Hotel Standard COA" />
            <Info label="Accounts Created" value="68" />
            <Info label="Custom Accounts" value="0" />
            <Info label="Status" value={store.coaApplied.includes(h.id) ? 'Applied' : 'Template default'} />
          </Sect>
        </div>
      )}

      {tab === 'Bank Accounts' && (
        <AccountsTab kind="bank" rows={banks} onAdd={() => setBankModal(true)} hotelId={h.id} />
      )}
      {tab === 'Credit Cards' && (
        <AccountsTab kind="card" rows={cards} onAdd={() => setCardModal(true)} hotelId={h.id} />
      )}

      {tab === 'Users' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end"><button onClick={() => setUserModal(true)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Assign User</button></div>
          <div className="rounded-2xl overflow-hidden" style={card}>
            {[{ n: 'Sanjay Narsee', r: 'Corporate Accountant', a: 'Full Access' }, { n: h.manager, r: 'Hotel GM', a: `${h.propertyCode} only` }, { n: 'Owner', r: 'Owner', a: 'View All' }, ...store.entityUsers.filter((u) => u.hotelId === h.id).map((u) => ({ n: u.name, r: u.role, a: u.accessLevel }))].map((u, i, arr) => (
              <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#6a4ec0' }}>{u.n.split(' ').map((x) => x[0]).slice(0, 2).join('')}</div><div><p className="text-sm font-medium" style={{ color: '#222' }}>{u.n}</p><p className="text-[11px]" style={{ color: '#929292' }}>{u.r} · {u.a}</p></div></div>
                <Badge label="Active" fg="#15803d" bg="#dcfce7" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Documents' && <Empty text="No documents yet for this hotel. Upload tax documents, statements, and receipts to populate." />}

      {tab === 'Activity' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {store.entityActivity.filter((a) => a.hotelId === h.id).length === 0
            ? <Empty text="No activity yet. Setup changes, account changes, uploads, and access changes appear here." />
            : store.entityActivity.filter((a) => a.hotelId === h.id).slice(0, 40).map((a, i, arr) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} />
                <span className="text-sm font-medium" style={{ color: '#222' }}>{a.action}</span>
                {a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}
                <span className="ml-auto text-[11px]" style={{ color: '#c1c1c1' }}>{a.actor}</span>
              </div>
            ))}
        </div>
      )}

      {tab === 'Settings' && (
        <div className="flex flex-col gap-5">
          <Sect title="Basic Settings"><Info label="Entity Status" value="Active" /><Info label="Display Name" value={h.hotelName} /><Info label="Property Code" value={h.propertyCode} /><Info label="Default Manager" value={h.manager} /></Sect>
          <Sect title="Accounting Settings"><Info label="Accounting Method" value="Accrual" /><Info label="Fiscal Year Start" value="January" /><Info label="Lock Closed Months" value="On" /><Info label="Require Review Before Posting" value="On" /></Sect>
          <div className="p-5 rounded-2xl" style={{ ...card, borderColor: '#fca5a5' }}>
            <p className="text-sm font-bold" style={{ color: '#b91c1c' }}>Danger Zone</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: '#929292' }}>Archiving hides this entity from active workflows. Historical records remain. Disabled while the hotel has posted transactions.</p>
            <div className="flex gap-2">
              <button disabled className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fef2f2', color: '#fca5a5', cursor: 'not-allowed' }} title="This entity has active accounting records and cannot be archived.">Deactivate Entity</button>
              <button disabled className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fef2f2', color: '#fca5a5', cursor: 'not-allowed' }} title="This entity has active accounting records and cannot be archived.">Archive Entity</button>
            </div>
          </div>
        </div>
      )}

      {edit && <EditEntityDrawer hotelId={h.id} onClose={() => setEdit(false)} />}
      {bankModal && <BankModal hotelId={h.id} onClose={() => setBankModal(false)} />}
      {cardModal && <CardModal hotelId={h.id} onClose={() => setCardModal(false)} />}
      {userModal && <AssignUserModal hotelId={h.id} onClose={() => setUserModal(false)} />}
    </div>
  );
}

/* ── Account tab (bank or card) ───────────────────────────────────────── */
function AccountsTab({ kind, rows, onAdd, hotelId }: { kind: 'bank' | 'card'; rows: any[]; onAdd: () => void; hotelId: string }) {
  const router = useRouter();
  const word = kind === 'bank' ? 'Bank Account' : 'Credit Card';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#929292' }}>{kind === 'bank' ? 'Bank accounts used for statement uploads, cash reporting, and reconciliation.' : 'Credit cards used for expenses and monthly statement reconciliation.'}</p>
        <div className="flex gap-2">
          <button onClick={onAdd} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add {word}</button>
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty text={kind === 'bank' ? "No bank accounts added yet. Add this hotel's operating checking, payroll checking, or reserve account." : 'No credit cards added yet. Add a corporate card or GM card for this hotel.'} />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {(kind === 'bank' ? ['Account', 'Bank', 'Type', 'Last 4', 'Balance', 'Last Statement', 'Reconciliation', ''] : ['Card', 'Issuer', 'Holder', 'Last 4', 'Balance', 'Limit', 'Reconciliation', '']).map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 || i === 5 ? 'right' : 'left' }}>{x}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((a, i) => {
                const rs = RECON_STATUS[a.reconStatus as keyof typeof RECON_STATUS];
                return (
                  <tr key={a.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{a.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{kind === 'bank' ? a.bank : a.issuer}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{kind === 'bank' ? a.type : a.cardHolder}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{a.last4}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold text-right" style={{ color: '#222' }}>{money(a.currentBalance)}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#6a6a6a' }}>{kind === 'bank' ? (a.lastStatementMonth ? fmtMonth(a.lastStatementMonth) : '—') : money(a.creditLimit)}</td>
                    <td className="py-2.5 px-3"><Badge label={rs.label} fg={rs.fg} bg={rs.bg} /></td>
                    <td className="py-2.5 px-3"><Link href={kind === 'bank' ? `/web/accounting/banking/upload?hotel=${hotelId}&account=${a.id}` : `/web/accounting/credit-cards/upload?hotel=${hotelId}&account=${a.id}`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Upload</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Modals ───────────────────────────────────────────────────────────── */
function BankModal({ hotelId, onClose }: { hotelId: string; onClose: () => void }) {
  const [name, setName] = useState(''); const [bank, setBank] = useState(''); const [type, setType] = useState('Operating Checking');
  const [last4, setLast4] = useState(''); const [open, setOpen] = useState(''); const [coa, setCoa] = useState('1010 Operating Checking');
  const valid = name.trim() && bank.trim() && /^\d{4}$/.test(last4) && coa;
  const save = (thenUpload?: boolean) => {
    if (!valid) return;
    const a: NewBankAccount = { id: `nb-${Date.now()}`, hotelId, name, bank, type, last4, openingBalance: Number(open) || 0, openingDate: '2026-01-01', coa, active: true };
    addBankAccount(a); onClose();
  };
  return (
    <ModalShell title="Add Bank Account" onClose={onClose}>
      <L label="Account Name"><In value={name} onChange={setName} placeholder="Operating Checking" /></L>
      <L label="Bank Name"><In value={bank} onChange={setBank} placeholder="Bank of America" /></L>
      <div className="grid grid-cols-2 gap-3">
        <L label="Account Type"><Se value={type} onChange={setType} options={['Operating Checking', 'Payroll Checking', 'Reserve', 'Savings', 'Money Market', 'Other']} /></L>
        <L label="Last 4 Digits"><In value={last4} onChange={setLast4} placeholder="4421" /></L>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <L label="Opening Balance"><In value={open} onChange={setOpen} placeholder="$0.00" /></L>
        <L label="COA Mapping"><Se value={coa} onChange={setCoa} options={['1010 Operating Checking', '1020 Payroll Checking', '1030 Reserve Account']} /></L>
      </div>
      <Foot onClose={onClose} valid={!!valid} onSave={() => save()} extraLabel="Save and Upload Statement" onExtra={() => save(true)} saveLabel="Save Bank Account" />
    </ModalShell>
  );
}
function CardModal({ hotelId, onClose }: { hotelId: string; onClose: () => void }) {
  const [name, setName] = useState('Corporate Card'); const [issuer, setIssuer] = useState('American Express'); const [last4, setLast4] = useState('');
  const [holder, setHolder] = useState(''); const [limit, setLimit] = useState(''); const [open, setOpen] = useState('');
  const valid = name.trim() && issuer && /^\d{4}$/.test(last4) && holder.trim();
  const save = () => { if (!valid) return; const c: NewCreditCard = { id: `nc-${Date.now()}`, hotelId, name, issuer, last4, cardHolder: holder, creditLimit: Number(limit) || 0, openingBalance: Number(open) || 0, openingDate: '2026-01-01', coa: '2100 Credit Cards Payable', active: true }; addCreditCard(c); onClose(); };
  return (
    <ModalShell title="Add Credit Card" onClose={onClose}>
      <L label="Card Name"><In value={name} onChange={setName} /></L>
      <div className="grid grid-cols-2 gap-3">
        <L label="Issuer"><Se value={issuer} onChange={setIssuer} options={['American Express', 'Chase', 'Bank of America', 'Capital One', 'Wells Fargo', 'Citi', 'Discover', 'Other']} /></L>
        <L label="Last 4 Digits"><In value={last4} onChange={setLast4} placeholder="3302" /></L>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <L label="Card Holder"><In value={holder} onChange={setHolder} placeholder="Sanjay" /></L>
        <L label="Credit Limit"><In value={limit} onChange={setLimit} placeholder="$50,000" /></L>
      </div>
      <L label="Opening Balance"><In value={open} onChange={setOpen} placeholder="$0.00" /></L>
      <Foot onClose={onClose} valid={!!valid} onSave={save} extraLabel="Save and Upload Statement" onExtra={save} saveLabel="Save Credit Card" />
    </ModalShell>
  );
}
function AssignUserModal({ hotelId, onClose }: { hotelId: string; onClose: () => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [role, setRole] = useState('Hotel GM'); const [level, setLevel] = useState('Review Only');
  const valid = name.trim() && /\S+@\S+/.test(email);
  const save = () => { if (!valid) return; assignEntityUser({ id: `u-${Date.now()}`, hotelId, name, email, role, accessLevel: level }); onClose(); };
  return (
    <ModalShell title="Assign User" onClose={onClose}>
      <L label="Name"><In value={name} onChange={setName} /></L>
      <L label="Email"><In value={email} onChange={setEmail} /></L>
      <div className="grid grid-cols-2 gap-3">
        <L label="Role"><Se value={role} onChange={setRole} options={['Corporate Accountant', 'Bookkeeper', 'Hotel GM', 'Regional Manager', 'CPA', 'Owner']} /></L>
        <L label="Access Level"><Se value={level} onChange={setLevel} options={['Full Access', 'Accounting Access', 'Review Only', 'Report Only', 'Receipt Upload Only']} /></L>
      </div>
      <Foot onClose={onClose} valid={!!valid} onSave={save} saveLabel="Assign User" />
    </ModalShell>
  );
}

/* ── small components ─────────────────────────────────────────────────── */
function SC({ icon, label, value, accent = '#222' }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return <div className="p-3 flex flex-col gap-1" style={card}><div className="flex items-center gap-1.5" style={{ color: accent }}>{icon}<span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</span></div><p className="text-lg font-bold" style={{ color: accent }}>{value}</p></div>;
}
function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2></div><div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div></div>;
}
function Info({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: '#222' }}>{value}{action}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}><div className="w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}><div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2><button onClick={onClose}><span style={{ color: '#6a6a6a', fontSize: 18 }}>×</span></button></div><div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">{children}</div></div></div>;
}
function Foot({ onClose, valid, onSave, saveLabel, extraLabel, onExtra }: { onClose: () => void; valid: boolean; onSave: () => void; saveLabel: string; extraLabel?: string; onExtra?: () => void }) {
  return <div className="flex justify-end gap-2 pt-1">
    <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
    {extraLabel && <button onClick={onExtra} disabled={!valid} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0', opacity: valid ? 1 : 0.5 }}>{extraLabel}</button>}
    <button onClick={onSave} disabled={!valid} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: valid ? 1 : 0.5 }}>{saveLabel}</button>
  </div>;
}
function L({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function In({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) { return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />; }
function Se({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>; }

export default function EntityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}><EntityDetailInner id={id} /></Suspense>;
}
