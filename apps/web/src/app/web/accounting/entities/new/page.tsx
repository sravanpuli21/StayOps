'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Building2, Plus } from 'lucide-react';
import { createEntity, type EntityFields, type NewBankAccount, type NewCreditCard } from '../../_store';
import { useAcctOs } from '../../_context';
import { card } from '../../_ui';

const STEPS = ['Basic Info', 'Property Info', 'Accounting', 'Bank Accounts', 'Credit Cards', 'Review'];

interface BankRow { on: boolean; name: string; bank: string; last4: string; opening: string; coa: string }
interface CardRow { on: boolean; name: string; issuer: string; last4: string; holder: string; limit: string }

export default function AddEntityWizard() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<EntityFields | null>(null);

  // Step 1
  const [legalEntity, setLegal] = useState(''); const [hotelName, setHotelName] = useState(''); const [code, setCode] = useState('');
  const [taxId, setTaxId] = useState(''); const [status, setStatus] = useState<EntityFields['status']>('active');
  // Step 2
  const [address, setAddress] = useState(''); const [city, setCity] = useState(''); const [county, setCounty] = useState(''); const [stateV, setStateV] = useState('GA');
  const [zip, setZip] = useState(''); const [phone, setPhone] = useState(''); const [rooms, setRooms] = useState(''); const [openingDate, setOpeningDate] = useState(''); const [manager, setManager] = useState('');
  // Step 3
  const [method, setMethod] = useState('Accrual'); const [fy, setFy] = useState('January'); const [currency, setCurrency] = useState('USD'); const [template, setTemplate] = useState('Hotel Standard COA'); const [applyCoa, setApplyCoa] = useState(true);
  // Step 4
  const [banks, setBanks] = useState<BankRow[]>([
    { on: true, name: 'Operating Checking', bank: '', last4: '', opening: '', coa: '1010 Operating Checking' },
    { on: true, name: 'Payroll Checking', bank: '', last4: '', opening: '', coa: '1020 Payroll Checking' },
    { on: false, name: 'Reserve Account', bank: '', last4: '', opening: '', coa: '1030 Reserve Account' },
  ]);
  // Step 5
  const [cards, setCards] = useState<CardRow[]>([
    { on: true, name: 'Corporate Card', issuer: 'American Express', last4: '', holder: 'Sanjay', limit: '' },
    { on: false, name: 'GM Card', issuer: 'Chase', last4: '', holder: '', limit: '' },
  ]);

  const step1Valid = legalEntity.trim() && hotelName.trim() && code.trim();
  const step2Valid = address.trim() && city.trim() && stateV && rooms && manager.trim();

  const finish = () => {
    const e: EntityFields = {
      legalEntity, hotelName, propertyCode: code, taxId, status,
      address, city, county, state: stateV, zip, phone, rooms: Number(rooms) || 0, openingDate, manager,
    };
    const bankRows: NewBankAccount[] = banks.filter((b) => b.on && b.name).map((b, i) => ({ id: `nb-${Date.now()}-${i}`, hotelId: code, name: b.name, bank: b.bank || 'Bank', type: b.name, last4: b.last4 || '0000', openingBalance: Number(b.opening) || 0, openingDate: '2026-01-01', coa: b.coa, active: true }));
    const cardRows: NewCreditCard[] = cards.filter((c) => c.on && c.name).map((c, i) => ({ id: `nc-${Date.now()}-${i}`, hotelId: code, name: c.name, issuer: c.issuer, last4: c.last4 || '0000', cardHolder: c.holder || 'Sanjay', creditLimit: Number(c.limit) || 0, openingBalance: 0, openingDate: '2026-01-01', coa: '2100 Credit Cards Payable', active: true }));
    createEntity(e, { bank: bankRows, cards: cardRows, users: [{ id: `u-${Date.now()}`, hotelId: code, name: 'Sanjay Narsee', email: 'sanjay@hosmgmt.com', role: 'Corporate Accountant', accessLevel: 'Full Access' }], applyCoa });
    setCreated(e);
  };

  if (created) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="p-8 flex flex-col items-center text-center gap-3" style={card}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <h1 className="text-lg font-bold" style={{ color: '#222' }}>Hotel Entity Created</h1>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{created.hotelName} has been created as a separate accounting entity under HOS Management.</p>
          <div className="w-full mt-2 rounded-xl p-4 text-left flex flex-col gap-1.5" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
            {['Entity profile created', applyCoa ? 'Chart of accounts applied' : 'Chart of accounts pending', `${banks.filter((b) => b.on).length} bank account(s) added`, `${cards.filter((c) => c.on).length} credit card(s) added`, 'Sanjay assigned full access'].map((t) => (
              <p key={t} className="text-xs flex items-center gap-1.5" style={{ color: '#15803d' }}><Check className="w-3.5 h-3.5" /> {t}</p>
            ))}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <button onClick={() => router.push(`/web/accounting/entities/${created.propertyCode}`)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Open Entity</button>
            <button onClick={() => { selectHotel(created.propertyCode); router.push('/web/accounting/dashboard'); }} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Open Books</button>
            <button onClick={() => router.push(`/web/accounting/banking/upload?hotel=${created.propertyCode}`)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Upload First Statement</button>
            <button onClick={() => router.push('/web/accounting/entities')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <button onClick={() => router.push('/web/accounting/entities')} className="text-sm inline-flex items-center gap-1 self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Hotel Entities</button>
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: step > i ? '#15803d' : step === i ? '#6a4ec0' : '#f0f0f0', color: step >= i ? '#fff' : '#929292' }}>{step > i ? '✓' : i + 1}</div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: step === i ? '#222' : '#929292' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px" style={{ background: '#dddddd' }} />}
          </div>
        ))}
      </div>

      <div className="p-6 flex flex-col gap-4" style={card}>
        {step === 0 && (<>
          <H title="Add Hotel Entity" sub="Create separate accounting books for a hotel under HOS Management." />
          <L label="Management Company"><In value="HOS Management" onChange={() => {}} disabled /></L>
          <L label="Legal Entity Name *"><In value={legalEntity} onChange={setLegal} placeholder="321 Montgomery, LLC" /></L>
          <L label="Hotel / Business Name *"><In value={hotelName} onChange={setHotelName} placeholder="Cambria Hotel - Savannah" /></L>
          <div className="grid grid-cols-2 gap-3"><L label="Property Code *"><In value={code} onChange={setCode} placeholder="GA989" /></L><L label="Tax ID"><In value={taxId} onChange={setTaxId} placeholder="81-1735885" /></L></div>
          <L label="Entity Status"><Se value={status} onChange={(v) => setStatus(v as any)} options={['active', 'setup-pending', 'inactive']} /></L>
        </>)}

        {step === 1 && (<>
          <H title="Property Info" sub="Where is this hotel located?" />
          <L label="Street Address *"><In value={address} onChange={setAddress} /></L>
          <div className="grid grid-cols-2 gap-3"><L label="City *"><In value={city} onChange={setCity} /></L><L label="County"><In value={county} onChange={setCounty} /></L></div>
          <div className="grid grid-cols-3 gap-3"><L label="State *"><Se value={stateV} onChange={setStateV} options={['GA', 'FL', 'TX', 'LA']} /></L><L label="Zip"><In value={zip} onChange={setZip} /></L><L label="Rooms *"><In value={rooms} onChange={setRooms} /></L></div>
          <div className="grid grid-cols-2 gap-3"><L label="Phone"><In value={phone} onChange={setPhone} /></L><L label="Opening Date"><In value={openingDate} onChange={setOpeningDate} type="date" /></L></div>
          <L label="Manager Name *"><In value={manager} onChange={setManager} /></L>
        </>)}

        {step === 2 && (<>
          <H title="Accounting Setup" sub="Set the accounting method and chart of accounts." />
          <div className="grid grid-cols-2 gap-3"><L label="Accounting Method"><Se value={method} onChange={setMethod} options={['Accrual', 'Cash']} /></L><L label="Fiscal Year Start"><Se value={fy} onChange={setFy} options={['January', 'July', 'October']} /></L></div>
          <div className="grid grid-cols-2 gap-3"><L label="Default Currency"><Se value={currency} onChange={setCurrency} options={['USD']} /></L><L label="COA Template"><Se value={template} onChange={setTemplate} options={['Hotel Standard COA', 'Limited Service Hotel COA', 'Full Service Hotel COA', 'Extended Stay Hotel COA']} /></L></div>
          <label className="text-xs flex items-center gap-2" style={{ color: '#6a6a6a' }}><input type="checkbox" checked={applyCoa} onChange={(e) => setApplyCoa(e.target.checked)} /> Apply chart of accounts template after creating entity</label>
        </>)}

        {step === 3 && (<>
          <H title="Add Bank Accounts" sub="Most hotels have operating, payroll, and reserve accounts. You can add them now or later." />
          {banks.map((b, i) => (
            <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: b.on ? '#faf7ff' : '#fafafa', border: '1px solid #f0f0f0' }}>
              <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#222' }}><input type="checkbox" checked={b.on} onChange={(e) => setBanks((p) => p.map((x, j) => j === i ? { ...x, on: e.target.checked } : x))} /> {b.name}</label>
              {b.on && <div className="grid grid-cols-3 gap-2"><In value={b.bank} onChange={(v) => setBanks((p) => p.map((x, j) => j === i ? { ...x, bank: v } : x))} placeholder="Bank name" /><In value={b.last4} onChange={(v) => setBanks((p) => p.map((x, j) => j === i ? { ...x, last4: v } : x))} placeholder="Last 4" /><In value={b.opening} onChange={(v) => setBanks((p) => p.map((x, j) => j === i ? { ...x, opening: v } : x))} placeholder="Opening $" /></div>}
            </div>
          ))}
        </>)}

        {step === 4 && (<>
          <H title="Add Credit Cards" sub="Add corporate or manager credit cards used for this hotel's expenses." />
          {cards.map((c, i) => (
            <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: c.on ? '#faf7ff' : '#fafafa', border: '1px solid #f0f0f0' }}>
              <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#222' }}><input type="checkbox" checked={c.on} onChange={(e) => setCards((p) => p.map((x, j) => j === i ? { ...x, on: e.target.checked } : x))} /> {c.name}</label>
              {c.on && <div className="grid grid-cols-4 gap-2"><Se value={c.issuer} onChange={(v) => setCards((p) => p.map((x, j) => j === i ? { ...x, issuer: v } : x))} options={['American Express', 'Chase', 'Bank of America', 'Capital One', 'Wells Fargo']} /><In value={c.last4} onChange={(v) => setCards((p) => p.map((x, j) => j === i ? { ...x, last4: v } : x))} placeholder="Last 4" /><In value={c.holder} onChange={(v) => setCards((p) => p.map((x, j) => j === i ? { ...x, holder: v } : x))} placeholder="Holder" /><In value={c.limit} onChange={(v) => setCards((p) => p.map((x, j) => j === i ? { ...x, limit: v } : x))} placeholder="Limit" /></div>}
            </div>
          ))}
        </>)}

        {step === 5 && (<>
          <H title="Review and Create Entity" sub="Confirm the details before creating this hotel's books." />
          <div className="grid grid-cols-2 gap-3">
            <RV label="Legal Entity" value={legalEntity} /><RV label="Hotel Name" value={hotelName} />
            <RV label="Property Code" value={code} /><RV label="Rooms" value={rooms} />
            <RV label="Address" value={`${address}, ${city}, ${stateV}`} /><RV label="Manager" value={manager} />
            <RV label="Accounting Method" value={method} /><RV label="COA Template" value={template} />
            <RV label="Bank Accounts" value={`${banks.filter((b) => b.on).length} to create`} /><RV label="Credit Cards" value={`${cards.filter((c) => c.on).length} to create`} />
          </div>
          <div className="p-3 rounded-xl text-xs" style={{ background: '#f0eefb', color: '#6a4ec0' }}>Sanjay will automatically have full access. You can assign a GM, Regional Manager, or CPA later.</div>
        </>)}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          {step > 0 ? <button onClick={() => setStep((s) => s - 1)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Back</button> : <button onClick={() => router.push('/web/accounting/entities')} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>}
          <div className="flex gap-2">
            {(step === 3 || step === 4) && <button onClick={() => setStep((s) => s + 1)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Skip for Now</button>}
            {step < 5
              ? <button onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff', opacity: ((step === 0 && !step1Valid) || (step === 1 && !step2Valid)) ? 0.5 : 1 }}>Continue <ArrowRight className="w-4 h-4" /></button>
              : <button onClick={finish} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#15803d', color: '#fff' }}>Create Hotel Entity</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function H({ title, sub }: { title: string; sub: string }) { return <div><h2 className="text-lg font-bold" style={{ color: '#222' }}>{title}</h2><p className="text-sm mt-0.5" style={{ color: '#929292' }}>{sub}</p></div>; }
function L({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function In({ value, onChange, placeholder, type = 'text', disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) { return <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full" style={{ border: '1px solid #dddddd', background: disabled ? '#f7f7f7' : '#fff', color: disabled ? '#929292' : '#222' }} />; }
function Se({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm outline-none w-full capitalize" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>; }
function RV({ label, value }: { label: string; value: string }) { return <div className="p-2.5 rounded-lg" style={{ background: '#fafafa' }}><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{value || '—'}</p></div>; }
