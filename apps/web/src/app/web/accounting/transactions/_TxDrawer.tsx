'use client';

import { useState } from 'react';
import { X, Sparkles, Split, Wand2, Copy, Paperclip, Check } from 'lucide-react';
import { HOTEL_COA, DEPARTMENTS, VENDOR_SUGGESTIONS, getEntity, type AcctTransaction, type Department } from '@hos/shared/accounting-os';
import { editTx, postTransaction, type SplitLine } from '../_store';
import { buildJournal, journalBalanced } from '../_journal';
import { money, Badge, TX_STATUS, RECEIPT_STATUS } from '../_ui';

const EXPENSE_CATS = HOTEL_COA.filter((a) => a.type === 'Expense' || a.type === 'COGS').map((a) => a.name);
const REVENUE_CATS = HOTEL_COA.filter((a) => a.type === 'Revenue').map((a) => a.name);

export function TxDrawer({ tx, onClose, onSplit, onRule }: {
  tx: AcctTransaction; onClose: () => void; onSplit: (tx: AcctTransaction) => void; onRule: (tx: AcctTransaction) => void;
}) {
  const h = getEntity(tx.hotelId);
  const suggestion = tx.vendor ? VENDOR_SUGGESTIONS[tx.vendor] : (() => { const k = Object.keys(VENDOR_SUGGESTIONS).find((v) => tx.description.startsWith(v)); return k ? VENDOR_SUGGESTIONS[k] : undefined; })();
  const sugVendor = tx.vendor ?? Object.keys(VENDOR_SUGGESTIONS).find((v) => tx.description.startsWith(v)) ?? '';

  const [vendor, setVendor] = useState(tx.vendor ?? '');
  const [category, setCategory] = useState(tx.category ?? '');
  const [department, setDepartment] = useState<Department | ''>(tx.department ?? '');
  const [memo, setMemo] = useState(tx.memo ?? '');
  const [receiptReq, setReceiptReq] = useState(tx.receipt === 'required' || tx.receipt === 'missing');
  const [receiptName, setReceiptName] = useState('');
  const [flags, setFlags] = useState({ owner: false, asset: false, transfer: false });
  const [posted, setPosted] = useState(tx.status === 'posted');
  const [err, setErr] = useState('');

  const cats = tx.amount > 0 ? REVENUE_CATS : EXPENSE_CATS;

  const persist = (status?: AcctTransaction['status'], note?: string) => {
    editTx(tx.id, {
      vendor: vendor || undefined, category: category || undefined, department: (department || undefined) as Department | undefined,
      memo: memo || undefined, status, receipt: receiptName ? 'attached' : receiptReq ? 'required' : tx.receipt,
      receiptName: receiptName || undefined,
    }, tx.hotelId, note);
  };

  const save = () => { persist(undefined, 'Saved transaction'); onClose(); };
  const approve = () => {
    if (!category) return setErr('This transaction must be categorized before posting.');
    if (receiptReq && !receiptName && tx.receipt !== 'attached') return setErr('A receipt is required before approval.');
    persist('approved', 'Approved transaction'); onClose();
  };
  const post = () => {
    if (!category) return setErr('This transaction must be categorized before posting.');
    const lines = buildJournal({ ...tx, category, vendor }, {});
    if (!journalBalanced(lines)) return setErr('Journal entry is not balanced.');
    persist('posted');
    postTransaction({ ...tx, category, vendor }, lines);
    setPosted(true); setErr('');
  };

  const s = TX_STATUS[posted ? 'posted' : tx.status];
  const je = posted ? buildJournal({ ...tx, category, vendor }, {}) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>Review Transaction</h2>
            <p className="text-[11px]" style={{ color: '#929292' }}>{h?.hotelName} · {tx.source === 'bank' ? 'Bank' : 'Credit Card'}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 flex-1">
          {/* Summary */}
          <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
            <div className="min-w-0"><p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{tx.description}</p><p className="text-[11px]" style={{ color: '#929292' }}>{tx.dateIso}</p></div>
            <p className="text-lg font-bold flex-shrink-0" style={{ color: tx.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(tx.amount, { sign: true })}</p>
          </div>
          <div className="flex gap-2"><Badge label={s.label} fg={s.fg} bg={s.bg} /><Badge label={RECEIPT_STATUS[receiptName ? 'attached' : tx.receipt].label} fg={RECEIPT_STATUS[receiptName ? 'attached' : tx.receipt].fg} bg={RECEIPT_STATUS[receiptName ? 'attached' : tx.receipt].bg} /></div>

          {/* Suggestion */}
          {suggestion && !posted && (
            <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: '#f0eefb' }}>
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6a4ec0' }} />
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Suggested · 92% confident</p>
                <p className="text-xs mt-0.5" style={{ color: '#3f3f3f' }}>{sugVendor} → {suggestion.category} · {suggestion.department}</p>
                <button onClick={() => { setVendor(sugVendor); setCategory(suggestion.category); setDepartment(suggestion.department); }} className="text-xs font-semibold mt-1.5" style={{ color: '#6a4ec0' }}>Apply suggestion</button>
              </div>
            </div>
          )}

          {!posted ? (
            <>
              <Field label="Vendor"><input value={vendor} onChange={(e) => setVendor(e.target.value)} list="vendors" className={inp} style={inpS} placeholder="e.g. Home Depot" /><datalist id="vendors">{Object.keys(VENDOR_SUGGESTIONS).map((v) => <option key={v} value={v} />)}</datalist></Field>
              <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inp} style={inpS}><option value="">Select category…</option>{cats.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
              <Field label="Department"><select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={inp} style={inpS}><option value="">Select department…</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
              <Field label="Memo"><input value={memo} onChange={(e) => setMemo(e.target.value)} className={inp} style={inpS} placeholder="Optional note" /></Field>

              {/* Receipt */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-2" style={{ color: '#3f3f3f' }}>
                  <input type="checkbox" checked={receiptReq} onChange={(e) => setReceiptReq(e.target.checked)} /> Receipt required
                </label>
                <label className="text-xs font-semibold cursor-pointer" style={{ color: '#6a4ec0' }}>
                  <Paperclip className="w-3.5 h-3.5 inline mr-1" />{receiptName || 'Attach receipt'}
                  <input type="file" className="hidden" onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? 'receipt.pdf')} />
                </label>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-3">
                {([['owner', 'Owner expense'], ['asset', 'Asset purchase'], ['transfer', 'Transfer']] as const).map(([k, lbl]) => (
                  <label key={k} className="text-xs flex items-center gap-1.5" style={{ color: '#6a6a6a' }}>
                    <input type="checkbox" checked={flags[k]} onChange={(e) => setFlags((f) => ({ ...f, [k]: e.target.checked }))} /> {lbl}
                  </label>
                ))}
              </div>

              {err && <div className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}>{err}</div>}

              {/* secondary actions */}
              <div className="flex gap-2 flex-wrap">
                <Secondary icon={<Split className="w-3.5 h-3.5" />} onClick={() => onSplit({ ...tx, category, vendor: vendor || undefined } as AcctTransaction)}>Split</Secondary>
                <Secondary icon={<Wand2 className="w-3.5 h-3.5" />} onClick={() => onRule({ ...tx, vendor: vendor || undefined } as AcctTransaction)}>Create Rule</Secondary>
                <Secondary icon={<Copy className="w-3.5 h-3.5" />} onClick={() => { editTx(tx.id, { status: 'duplicate' }, tx.hotelId, 'Marked duplicate'); onClose(); }}>Mark Duplicate</Secondary>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
              <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#15803d' }}><Check className="w-4 h-4" /> Posted to the books</p>
              <p className="text-[11px] mt-1" style={{ color: '#6a6a6a' }}>Journal entry created — debits equal credits.</p>
              <div className="mt-2 rounded-lg overflow-hidden" style={{ border: '1px solid #dcfce7' }}>
                {je!.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 text-xs" style={{ background: '#fff', borderBottom: i < je!.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span style={{ color: '#222' }}>{l.account}</span>
                    <span style={{ color: '#6a6a6a' }}>{l.debit ? `Dr ${money(l.debit)}` : `Cr ${money(l.credit)}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!posted && (
          <div className="px-5 py-4 flex flex-col gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
            <button onClick={post} className="h-10 rounded-xl text-sm font-bold" style={{ background: '#15803d', color: '#fff' }}>Approve &amp; Post to Books</button>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Save</button>
              <button onClick={approve} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}>Save &amp; Approve</button>
            </div>
          </div>
        )}
        {posted && <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}><button onClick={onClose} className="w-full h-10 rounded-xl text-sm font-bold" style={{ background: '#6a4ec0', color: '#fff' }}>Done</button></div>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Secondary({ icon, children, onClick }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>{icon}{children}</button>;
}
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6a4ec0] w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
