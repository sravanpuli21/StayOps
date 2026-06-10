'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertTriangle, Building2, Landmark, CreditCard, Users } from 'lucide-react';
import { card, money, Badge, PageHeader, inputCls, inputStyle, PURPLE } from '../../_ui';

const STEPS = ['Legal Entity', 'Property', 'Accounting', 'Bank Accounts', 'Credit Cards', 'Users', 'Review'];
const ENTITY_TYPES = ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Other'];
const BRANDS = ['Hampton Inn', 'Cambria', 'Hilton Garden Inn', 'Residence Inn', 'Courtyard', 'Home2 Suites', 'La Quinta', 'Tribute Portfolio', 'Woodspring', 'Four Points', 'Other'];
const COA_TEMPLATES = ['Hotel Standard COA', 'Limited Service Hotel COA', 'Full Service Hotel COA', 'Extended Stay Hotel COA', 'Skip for now'];
const ROLES = ['Hotel GM', 'Corporate Accountant', 'Bookkeeper', 'Regional Manager', 'CPA', 'Owner', 'Super Admin'];
const ACCESS = ['Full Accounting Access', 'Prepare Only', 'Read Only', 'Receipts Only', 'Reports Only'];

interface BankRow { id: string; name: string; bank: string; type: string; last4: string; coa: string; opening: string }
interface CardRow { id: string; name: string; issuer: string; last4: string; holder: string; coa: string }
interface UserRow { id: string; name: string; role: string; access: string }

export default function NewEntityPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Step 1
  const [legalName, setLegalName] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [entityType, setEntityType] = useState('LLC');
  // Step 2
  const [code, setCode] = useState('');
  const [brand, setBrand] = useState('Hampton Inn');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [rooms, setRooms] = useState('');
  const [manager, setManager] = useState('');
  // Step 3
  const [startDate, setStartDate] = useState('2026-01-01');
  const [fyStart, setFyStart] = useState('January');
  const [basis, setBasis] = useState('Accrual');
  const [coaTemplate, setCoaTemplate] = useState('Hotel Standard COA');
  const [openingReq, setOpeningReq] = useState('Yes');
  // Step 4 / 5 / 6
  const [banks, setBanks] = useState<BankRow[]>([
    { id: 'b1', name: 'Operating Checking', bank: '', type: 'Operating Checking', last4: '', coa: '1010 Operating Checking', opening: '' },
    { id: 'b2', name: 'Payroll Checking', bank: '', type: 'Payroll Checking', last4: '', coa: '1020 Payroll Checking', opening: '' },
    { id: 'b3', name: 'Reserve Account', bank: '', type: 'Reserve Account', last4: '', coa: '1030 Reserve Account', opening: '' },
  ]);
  const [cards, setCards] = useState<CardRow[]>([
    { id: 'c1', name: 'Corporate Card', issuer: '', last4: '', holder: 'HOS Management', coa: '2110 Corporate Card Payable' },
  ]);
  const [users, setUsers] = useState<UserRow[]>([
    { id: 'u1', name: 'Sanjay Narsee', role: 'Corporate Accountant', access: 'Full Accounting Access' },
  ]);

  const next = () => {
    setError('');
    if (step === 1 && (!legalName || !hotelName)) return setError('Legal entity name and hotel display name are required.');
    if (step === 2 && (!code || !address || !city || !state || !rooms)) return setError('Property code, address, city, state, and room count are required.');
    if (step === 2 && Number(rooms) <= 0) return setError('Room count must be greater than zero.');
    setStep((s) => Math.min(7, s + 1));
  };
  const back = () => { setError(''); setStep((s) => Math.max(1, s - 1)); };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <button onClick={() => router.push('/web/accounting/entities')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</button>
        <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={card}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <h1 className="text-lg font-bold" style={{ color: '#222' }}>Hotel entity created successfully.</h1>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{hotelName} ({code}) is set up with {coaTemplate}, {banks.length} bank accounts, {cards.length} cards, and {users.length} users.</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => router.push('/web/accounting/entities')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Go to Entities</button>
            <button onClick={() => router.push('/web/accounting/statements/upload')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Upload First Statement</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/entities')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</button>
      <PageHeader title="Add Hotel Entity" subtitle="Set up a new hotel entity with its own books, accounts, and users." />

      {/* Step rail */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STEPS.map((l, i) => {
          const n = i + 1; const isDone = step > n; const active = step === n;
          return (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: isDone ? '#15803d' : active ? PURPLE : '#f0f0f0', color: isDone || active ? '#fff' : '#929292' }}>{isDone ? '✓' : n}</div>
              <span className="text-[11px] font-medium hidden md:block" style={{ color: active ? '#222' : '#929292' }}>{l}</span>
              {i < STEPS.length - 1 && <div className="w-4 h-px" style={{ background: '#dddddd' }} />}
            </div>
          );
        })}
      </div>

      <div className="p-6 flex flex-col gap-4" style={card}>
        {step === 1 && (
          <Panel title="Legal Entity" sub="Enter the legal entity information for this hotel.">
            <Grid>
              <Field label="Legal Entity Name *"><input value={legalName} onChange={(e) => setLegalName(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. 321 Montgomery, LLC" /></Field>
              <Field label="Hotel Display Name *"><input value={hotelName} onChange={(e) => setHotelName(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Cambria Hotel - Savannah" /></Field>
              <Field label="Tax ID"><input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputCls} style={inputStyle} placeholder="00-0000000" /></Field>
              <Field label="Entity Type"><select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={inputCls} style={inputStyle}>{ENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Management Company"><input value="HOS Management" disabled className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} /></Field>
            </Grid>
          </Panel>
        )}

        {step === 2 && (
          <Panel title="Property Details" sub="Where is this hotel and how big is it?">
            <Grid>
              <Field label="Property Code *"><input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. GA989" /></Field>
              <Field label="Brand"><select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls} style={inputStyle}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></Field>
              <Field label="Address *"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} style={inputStyle} /></Field>
              <Field label="City *"><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={inputStyle} /></Field>
              <Field label="State *"><input value={state} onChange={(e) => setState(e.target.value)} className={inputCls} style={inputStyle} placeholder="GA" /></Field>
              <Field label="Room Count *"><input value={rooms} onChange={(e) => setRooms(e.target.value)} type="number" className={inputCls} style={inputStyle} /></Field>
              <Field label="General Manager"><input value={manager} onChange={(e) => setManager(e.target.value)} className={inputCls} style={inputStyle} /></Field>
            </Grid>
          </Panel>
        )}

        {step === 3 && (
          <Panel title="Accounting Setup" sub="How should this hotel's books be configured?">
            <Grid>
              <Field label="Accounting Start Date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={inputStyle} /></Field>
              <Field label="Fiscal Year Start"><select value={fyStart} onChange={(e) => setFyStart(e.target.value)} className={inputCls} style={inputStyle}>{['January', 'April', 'July', 'October'].map((m) => <option key={m}>{m}</option>)}</select></Field>
              <Field label="Accounting Basis"><select value={basis} onChange={(e) => setBasis(e.target.value)} className={inputCls} style={inputStyle}><option>Accrual</option><option>Cash</option></select></Field>
              <Field label="Chart of Accounts Template"><select value={coaTemplate} onChange={(e) => setCoaTemplate(e.target.value)} className={inputCls} style={inputStyle}>{COA_TEMPLATES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Opening Balance Required"><select value={openingReq} onChange={(e) => setOpeningReq(e.target.value)} className={inputCls} style={inputStyle}><option>Yes</option><option>No</option><option>Later</option></select></Field>
            </Grid>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#f6f4fd', color: PURPLE, border: '1px solid #e3d9fb' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>Bank accounts and credit cards may have different statement end dates. StayOps uses account-specific statement dates — it does not force all accounts to month-end.</span>
            </div>
          </Panel>
        )}

        {step === 4 && (
          <Panel title="Bank Accounts" sub="Add operating, payroll, and reserve accounts. Bank accounts map to asset accounts.">
            {banks.map((b) => (
              <div key={b.id} className="grid md:grid-cols-5 gap-2 items-end p-3 rounded-xl" style={{ border: '1px solid #eee' }}>
                <Field label="Account Name"><input value={b.name} onChange={(e) => setBanks((p) => p.map((x) => x.id === b.id ? { ...x, name: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <Field label="Bank"><input value={b.bank} onChange={(e) => setBanks((p) => p.map((x) => x.id === b.id ? { ...x, bank: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} placeholder="Bank name" /></Field>
                <Field label="Last 4"><input value={b.last4} onChange={(e) => setBanks((p) => p.map((x) => x.id === b.id ? { ...x, last4: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <Field label="COA Mapping"><input value={b.coa} disabled className="h-9 px-2 rounded-lg text-xs w-full" style={{ ...inputStyle, opacity: 0.6 }} /></Field>
                <div className="flex items-center gap-2"><Field label="Opening Balance"><input value={b.opening} onChange={(e) => setBanks((p) => p.map((x) => x.id === b.id ? { ...x, opening: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} placeholder="$0.00" /></Field>{banks.length > 1 && <button onClick={() => setBanks((p) => p.filter((x) => x.id !== b.id))} className="mb-1"><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>}</div>
              </div>
            ))}
            <button onClick={() => setBanks((p) => [...p, { id: `b${Date.now()}`, name: '', bank: '', type: 'Other', last4: '', coa: 'Add New Account', opening: '' }])} className="h-8 px-3 rounded-lg text-xs font-semibold self-start inline-flex items-center gap-1.5" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add Bank Account</button>
          </Panel>
        )}

        {step === 5 && (
          <Panel title="Credit Cards" sub="Add corporate or GM cards. Credit cards map to liability accounts.">
            {cards.map((c) => (
              <div key={c.id} className="grid md:grid-cols-5 gap-2 items-end p-3 rounded-xl" style={{ border: '1px solid #eee' }}>
                <Field label="Card Name"><input value={c.name} onChange={(e) => setCards((p) => p.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <Field label="Issuer"><input value={c.issuer} onChange={(e) => setCards((p) => p.map((x) => x.id === c.id ? { ...x, issuer: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} placeholder="Amex, Chase…" /></Field>
                <Field label="Last 4"><input value={c.last4} onChange={(e) => setCards((p) => p.map((x) => x.id === c.id ? { ...x, last4: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <Field label="Card Holder"><input value={c.holder} onChange={(e) => setCards((p) => p.map((x) => x.id === c.id ? { ...x, holder: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <div className="flex items-center gap-2"><Field label="COA Mapping"><input value={c.coa} disabled className="h-9 px-2 rounded-lg text-xs w-full" style={{ ...inputStyle, opacity: 0.6 }} /></Field><button onClick={() => setCards((p) => p.filter((x) => x.id !== c.id))} className="mb-1"><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button></div>
              </div>
            ))}
            <button onClick={() => setCards((p) => [...p, { id: `c${Date.now()}`, name: 'GM Card', issuer: '', last4: '', holder: manager || 'GM', coa: '2120 GM Card Payable' }])} className="h-8 px-3 rounded-lg text-xs font-semibold self-start inline-flex items-center gap-1.5" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add Credit Card</button>
          </Panel>
        )}

        {step === 6 && (
          <Panel title="Users" sub="Assign accounting users and hotel managers to this hotel.">
            {users.map((u) => (
              <div key={u.id} className="grid md:grid-cols-4 gap-2 items-end p-3 rounded-xl" style={{ border: '1px solid #eee' }}>
                <Field label="User"><input value={u.name} onChange={(e) => setUsers((p) => p.map((x) => x.id === u.id ? { ...x, name: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle} /></Field>
                <Field label="Role"><select value={u.role} onChange={(e) => setUsers((p) => p.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
                <Field label="Access Level"><select value={u.access} onChange={(e) => setUsers((p) => p.map((x) => x.id === u.id ? { ...x, access: e.target.value } : x))} className="h-9 px-2 rounded-lg text-xs w-full" style={inputStyle}>{ACCESS.map((a) => <option key={a}>{a}</option>)}</select></Field>
                <div className="flex items-center">{users.length > 1 && <button onClick={() => setUsers((p) => p.filter((x) => x.id !== u.id))}><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>}</div>
              </div>
            ))}
            <button onClick={() => setUsers((p) => [...p, { id: `u${Date.now()}`, name: manager || '', role: 'Hotel GM', access: 'Receipts Only' }])} className="h-8 px-3 rounded-lg text-xs font-semibold self-start inline-flex items-center gap-1.5" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add User</button>
          </Panel>
        )}

        {step === 7 && (
          <Panel title="Review & Create" sub="Confirm the setup before creating this hotel entity.">
            <ReviewBlock icon={<Building2 className="w-4 h-4" />} title="Legal Entity & Property" items={[`${hotelName} (${code})`, legalName, `${entityType} · ${brand}`, `${city}, ${state} · ${rooms} rooms`, manager ? `GM: ${manager}` : '']} />
            <ReviewBlock icon={<Check className="w-4 h-4" />} title="Accounting" items={[`Basis: ${basis}`, `Template: ${coaTemplate}`, `FY start: ${fyStart}`, `Opening balances: ${openingReq}`]} />
            <ReviewBlock icon={<Landmark className="w-4 h-4" />} title={`Bank Accounts (${banks.length})`} items={banks.map((b) => `${b.name} → ${b.coa}`)} />
            <ReviewBlock icon={<CreditCard className="w-4 h-4" />} title={`Credit Cards (${cards.length})`} items={cards.map((c) => `${c.name} → ${c.coa}`)} />
            <ReviewBlock icon={<Users className="w-4 h-4" />} title={`Users (${users.length})`} items={users.map((u) => `${u.name} · ${u.role} · ${u.access}`)} />
            {coaTemplate === 'Skip for now' && <Warn>Chart of Accounts not applied — this hotel won't be ready for statement uploads until a template is applied.</Warn>}
            {openingReq === 'Yes' && <Warn>Opening balances are required but not entered yet — enter them before the first reconciliation.</Warn>}
          </Panel>
        )}

        {error && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {error}</div>}

        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          {step > 1 ? <button onClick={back} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back</button> : <button onClick={() => router.push('/web/accounting/entities')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>}
          {step < 7
            ? <button onClick={next} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}>Continue <ArrowRight className="w-4 h-4" /></button>
            : <button onClick={() => setDone(true)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#15803d', color: '#fff' }}><Check className="w-4 h-4" /> Create Entity</button>}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-4"><div><h2 className="text-lg font-bold" style={{ color: '#222' }}>{title}</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>{sub}</p></div>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid md:grid-cols-2 gap-4">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1.5 w-full"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Warn({ children }: { children: React.ReactNode }) { return <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{children}</span></div>; }
function ReviewBlock({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl p-3.5" style={{ border: '1px solid #eee' }}>
      <p className="text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 mb-1.5" style={{ color: '#6a6a6a' }}>{icon} {title}</p>
      <ul className="flex flex-col gap-0.5">{items.filter(Boolean).map((it, i) => <li key={i} className="text-sm" style={{ color: '#222' }}>{it}</li>)}</ul>
    </div>
  );
}
