'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Globe, Building2 } from 'lucide-react';
import { HOTEL_COA, DEPARTMENTS, HOTEL_ENTITIES, getEntity, type AcctTransaction, type Department } from '@hos/shared/accounting-os';
import { editTx, saveRule, type SplitLine } from '../_store';
import { money } from '../_ui';

const EXPENSE_CATS = HOTEL_COA.filter((a) => a.type === 'Expense' || a.type === 'COGS').map((a) => a.name);

/* ── Split modal ──────────────────────────────────────────────────────── */
export function SplitModal({ tx, onClose }: { tx: AcctTransaction; onClose: () => void }) {
  const total = Math.abs(tx.amount);
  const [lines, setLines] = useState<SplitLine[]>([
    { id: 's1', category: tx.category ?? '', department: tx.department ?? 'General', amount: Math.round(total / 2 * 100) / 100 },
    { id: 's2', category: '', department: 'General', amount: Math.round((total - Math.round(total / 2 * 100) / 100) * 100) / 100 },
  ]);
  const sum = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const matches = Math.abs(sum - total) < 0.005;

  const set = (id: string, patch: Partial<SplitLine>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const save = () => {
    if (!matches) return;
    editTx(tx.id, { splits: lines, status: tx.status === 'needs-review' || tx.status === 'uncategorized' ? 'categorized' : tx.status }, tx.hotelId, 'Split transaction');
    onClose();
  };

  return (
    <Shell title="Split Transaction" sub={`Original amount: ${money(total)}`} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {lines.map((l) => (
          <div key={l.id} className="flex items-center gap-2">
            <select value={l.category} onChange={(e) => set(l.id, { category: e.target.value })} className={inp} style={{ ...inpS, flex: 2 }}>
              <option value="">Category…</option>{EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={l.department} onChange={(e) => set(l.id, { department: e.target.value as Department })} className={inp} style={{ ...inpS, flex: 1 }}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="number" value={l.amount} onChange={(e) => set(l.id, { amount: Number(e.target.value) })} className={inp} style={{ ...inpS, width: 90 }} />
            <button onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} disabled={lines.length <= 1}><Trash2 className="w-4 h-4" style={{ color: lines.length <= 1 ? '#ddd' : '#b91c1c' }} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setLines((ls) => [...ls, { id: `s${Date.now()}`, category: '', department: 'General', amount: 0 }])} className="inline-flex items-center gap-1 text-xs font-semibold self-start" style={{ color: '#6a4ec0' }}><Plus className="w-3.5 h-3.5" /> Add Line</button>
      <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm" style={{ background: matches ? '#f0fdf4' : '#fff7ed' }}>
        <span style={{ color: '#6a6a6a' }}>Split total</span>
        <span className="font-bold" style={{ color: matches ? '#15803d' : '#b45309' }}>{money(sum)} / {money(total)}</span>
      </div>
      {!matches && <p className="text-xs" style={{ color: '#b45309' }}>Split total must equal the transaction amount before saving.</p>}
      <Footer><Ghost onClick={onClose}>Cancel</Ghost><Primary disabled={!matches} onClick={save}>Save Split</Primary></Footer>
    </Shell>
  );
}

/* ── Rule modal ───────────────────────────────────────────────────────── */
/**
 * Two kinds of rules:
 *  • Global rule        → applies the same way across ALL 16 hotels.
 *  • Hotel-specific rule → applies to ONE chosen hotel only.
 * `defaultHotelId` preselects the hotel when a rule is started from a hotel's
 * transaction or while a single hotel is in context.
 */
export function RuleModal({ tx, onClose, defaultHotelId }: { tx: AcctTransaction | null; onClose: () => void; defaultHotelId?: string }) {
  const seedVendor = tx?.vendor ?? '';
  const firstWord = tx ? tx.description.split(' ')[0] : '';
  const [scope, setScope] = useState<'all' | 'one'>(tx?.hotelId || defaultHotelId ? 'one' : 'all');
  const [hotelId, setHotelId] = useState<string>(tx?.hotelId ?? defaultHotelId ?? HOTEL_ENTITIES[0].id);
  const [name, setName] = useState(tx ? `${firstWord} → auto-categorize` : '');
  const [source, setSource] = useState<'bank' | 'credit-card' | 'both'>('both');
  const [contains, setContains] = useState(firstWord);
  const [vendor, setVendor] = useState(seedVendor);
  const [category, setCategory] = useState(tx?.category ?? '');
  const [department, setDepartment] = useState<Department>(tx?.department ?? 'General');
  const [requireReceipt, setRequireReceipt] = useState(false);

  const valid = contains.trim().length > 0 && (category || vendor);
  // Smart default name if the accountant didn't type one.
  const finalName = name.trim() || `${(vendor || contains || 'Rule').trim()}${scope === 'one' ? ` · ${getEntity(hotelId)?.propertyCode}` : ''}`;

  const save = () => {
    if (!valid) return;
    saveRule({
      name: finalName, appliesTo: scope, hotelId: scope === 'one' ? hotelId : undefined,
      source, contains: contains.trim(), setVendor: vendor || undefined, setCategory: category || undefined,
      setDepartment: department, requireReceipt,
    });
    onClose();
  };

  return (
    <Shell title="Create Rule" sub="Automatically categorize repeated transactions." onClose={onClose}>
      {/* Scope picker — the heart of the change */}
      <Field label="Where should this rule apply?">
        <div className="grid grid-cols-2 gap-2">
          <ScopeBtn active={scope === 'all'} onClick={() => setScope('all')} icon={<Globe className="w-4 h-4" />} title="Global rule" desc="All 16 hotels" />
          <ScopeBtn active={scope === 'one'} onClick={() => setScope('one')} icon={<Building2 className="w-4 h-4" />} title="Hotel-specific" desc="One hotel only" />
        </div>
      </Field>
      {scope === 'one' && (
        <Field label="Which hotel?">
          <select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp} style={inpS}>
            {HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}
          </select>
        </Field>
      )}

      <Field label="Rule name (optional)"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} style={inpS} placeholder={finalName} /></Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="When it comes from"><select value={source} onChange={(e) => setSource(e.target.value as any)} className={inp} style={inpS}><option value="both">Bank &amp; Credit Card</option><option value="bank">Bank only</option><option value="credit-card">Credit Card only</option></select></Field>
        <Field label="And the description contains"><input value={contains} onChange={(e) => setContains(e.target.value)} className={inp} style={inpS} placeholder="e.g. HOME DEPOT" /></Field>
      </div>

      <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#f0eefb', color: '#6a4ec0' }}>
        Then set it to:
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vendor"><input value={vendor} onChange={(e) => setVendor(e.target.value)} className={inp} style={inpS} placeholder="e.g. Home Depot" /></Field>
        <Field label="Department"><select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={inp} style={inpS}>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
      </div>
      <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inp} style={inpS}><option value="">Select…</option>{EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
      <label className="text-xs flex items-center gap-2" style={{ color: '#6a6a6a' }}><input type="checkbox" checked={requireReceipt} onChange={(e) => setRequireReceipt(e.target.checked)} /> Require a receipt when this rule matches</label>

      <Footer><Ghost onClick={onClose}>Cancel</Ghost><Primary disabled={!valid} onClick={save}>Save Rule</Primary></Footer>
    </Shell>
  );
}

function ScopeBtn({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="flex items-start gap-2 p-3 rounded-xl text-left" style={{ border: `1.5px solid ${active ? '#6a4ec0' : '#dddddd'}`, background: active ? '#f0eefb' : '#fff' }}>
      <span style={{ color: active ? '#6a4ec0' : '#929292' }}>{icon}</span>
      <span><span className="block text-sm font-bold" style={{ color: active ? '#6a4ec0' : '#222' }}>{title}</span><span className="block text-[11px]" style={{ color: '#929292' }}>{desc}</span></span>
    </button>
  );
}

/* ── shells ───────────────────────────────────────────────────────────── */
function Shell({ title, sub, onClose, children }: { title: string; sub: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2><p className="text-[11px]" style={{ color: '#929292' }}>{sub}</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Footer({ children }: { children: React.ReactNode }) { return <div className="flex justify-end gap-2 pt-1">{children}</div>; }
function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}
function Ghost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{children}</button>;
}
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6a4ec0] w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
