'use client';

import { useMemo, useState } from 'react';
import {
  Search, Check, X, Plus, AlertTriangle, Lock, Sparkles, Copy, FileSearch, Receipt, Layers,
} from 'lucide-react';
import type { StatementImport } from '../../_domain';
import { payrollGuidance, daysBetween, suggestTransactions, type Dept, type TxnType, type TxnSuggestion, DEPARTMENTS, TXN_TYPES, ACCOUNTANT, CODE } from '../../_domain';
import type { LiveLine } from '../../_recon2';
import { manualMetrics, manualBlockers, findDifference, type ManualMetrics, type DiffSuggestion } from '../../_recon2';
import { groupedCoa, findAccount } from '../../_coa2';
import { buildJournal, journalTotals } from '../../_journal';
import {
  toggleCleared, saveCoding, postLine, excludeLine, addMissingTransaction, attachReceipt,
  type AddedLine,
} from '../../_store2';
import { card, money, fmtDate, Badge, LINE_STATUS, PURPLE, inputStyle, type LineStatus } from '../../_ui';

/* The classic reconciliation checklist: select the transactions on the statement. */
export function ClassicMode({ imp, lines, sessionId, finished }: { imp: StatementImport; lines: LiveLine[]; sessionId: string; finished: boolean }) {
  const isCard = imp.statementType === 'credit-card';
  const m = useMemo(() => manualMetrics(imp, lines), [imp, lines]);
  const blockers = manualBlockers(imp, lines);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'selected' | 'unselected' | 'uncategorized' | 'outside'>('all');
  const [catFor, setCatFor] = useState<LiveLine | null>(null);
  const [dupFor, setDupFor] = useState<LiveLine | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [toast, setToast] = useState('');
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2200); };

  const filtered = lines.filter((l) => {
    if (q) { const s = q.toLowerCase(); if (!l.rawDescription.toLowerCase().includes(s) && !(l.coding?.vendor ?? l.suggestedVendor ?? '').toLowerCase().includes(s) && !String(Math.abs(l.amount)).includes(s)) return false; }
    if (filter === 'selected') return l.cleared;
    if (filter === 'unselected') return !l.cleared && l.status !== 'excluded';
    if (filter === 'uncategorized') return l.cleared && !(l.coding?.categoryCode ?? l.suggestedCategoryCode);
    if (filter === 'outside') return l.dateIso > imp.endDate;
    return true;
  });

  return (
    <div className="grid gap-4 h-full min-h-0" style={{ gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr) minmax(280px, 320px)' }}>
      {/* LEFT: statement details + difference */}
      <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5">
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Statement</p>
          <Line k="Period" v={`${fmtDate(imp.startDate)} – ${fmtDate(imp.endDate)}`} />
          <Line k="Last reconciled" v={imp.lastReconciledThrough ? fmtDate(imp.lastReconciledThrough) : '—'} />
          <Line k="Beginning balance" v={money(imp.beginningBalance)} />
          <Line k={isCard ? 'Statement balance' : 'Ending balance'} v={money(imp.endingBalance)} bold />
          {imp.pdfName && <Line k="Attached" v={imp.pdfName} />}
          {imp.source && <div className="mt-2"><Badge label={imp.source === 'manual' ? 'Manual Entry' : imp.source === 'pdf-printed' ? 'PDF / Printed' : 'Existing Transactions'} fg={PURPLE} bg="#ece4fb" /></div>}
        </div>
        <div className="p-4 rounded-2xl" style={{ background: m.balanced ? '#dcfce7' : '#fee2e2', border: `1px solid ${m.balanced ? '#bbf7d0' : '#fecaca'}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: m.balanced ? '#15803d' : '#b91c1c' }}>Difference</p>
          <p className="text-3xl font-bold mt-0.5" style={{ color: m.balanced ? '#15803d' : '#b91c1c' }}>{money(Math.abs(m.difference))}</p>
          {!m.balanced && <button onClick={() => setFindOpen(true)} className="mt-2 h-8 px-3 rounded-lg text-xs font-semibold w-full inline-flex items-center justify-center gap-1.5" style={{ background: '#b91c1c', color: '#fff' }}><FileSearch className="w-3.5 h-3.5" /> Find Difference</button>}
          {m.balanced && <p className="text-[11px] mt-0.5" style={{ color: '#15803d' }}>Selected transactions match the statement.</p>}
        </div>
      </div>

      {/* MAIN: transaction checklist */}
      <div className="flex flex-col rounded-2xl overflow-hidden min-h-0" style={card}>
        <div className="px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Book Transactions · select the ones on the statement</p>
            {!finished && <button onClick={() => setAddOpen(true)} className="h-7 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: '#ece4fb', color: PURPLE }}><Plus className="w-3.5 h-3.5" /> Add Missing Transaction</button>}
          </div>
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg mb-2" style={{ background: '#f7f7f7' }}>
            <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description, vendor, amount…" className="flex-1 bg-transparent text-xs outline-none" style={{ color: '#222' }} />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {([['all', 'All'], ['selected', 'Selected'], ['unselected', 'Outstanding'], ['uncategorized', 'Needs Category'], ['outside', 'Outside Period']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} className="px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap" style={{ background: filter === k ? '#ece4fb' : 'transparent', color: filter === k ? PURPLE : '#6a6a6a' }}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0 }}>
              {['', 'Date', 'Description', 'Category', isCard ? 'Charge' : 'Money Out', isCard ? 'Credit' : 'Money In', 'Status', ''].map((h, i) => (
                <th key={h + i} className="text-[10px] font-semibold uppercase tracking-wide py-2 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 || i === 5 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((l) => {
                const ls = LINE_STATUS[l.status as LineStatus];
                const outAmt = l.amount < 0 ? Math.abs(l.amount) : 0;
                const inAmt = l.amount > 0 ? l.amount : 0;
                const cat = l.coding?.categoryName ?? l.suggestedCategoryName;
                const uncategorized = !(l.coding?.categoryCode ?? l.suggestedCategoryCode);
                const outside = l.dateIso > imp.endDate;
                const afterDays = outside ? daysBetween(imp.endDate, l.dateIso) : 0;
                const isDup = l.suggestedResolution === 'duplicate' && !l.coding;
                return (
                  <tr key={l.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f7f7f7', background: l.cleared ? '#f6fbf7' : undefined }}>
                    <td className="py-2 px-2.5">
                      {finished ? <Lock className="w-3.5 h-3.5" style={{ color: '#929292' }} /> : <input type="checkbox" checked={l.cleared} onChange={() => toggleCleared(sessionId, l.id)} disabled={l.status === 'excluded'} />}
                    </td>
                    <td className="py-2 px-2.5 text-xs whitespace-nowrap" style={{ color: '#6a6a6a' }}>{fmtDate(l.dateIso)}</td>
                    <td className="py-2 px-2.5">
                      <p className="text-sm" style={{ color: '#222' }}>{l.rawDescription}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {outside && <Badge label={afterDays <= 2 ? 'Possible timing difference' : 'Outside statement period'} fg="#b45309" bg="#fef3c7" />}
                        {isDup && <Badge label="Possible Duplicate" fg="#b91c1c" bg="#fee2e2" />}
                        {l.coding?.vendor || l.suggestedVendor ? <span className="text-[11px]" style={{ color: '#929292' }}>{l.coding?.vendor ?? l.suggestedVendor}</span> : null}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-xs" style={{ color: uncategorized ? '#b45309' : '#6a6a6a' }}>{cat ?? 'Needs category'}</td>
                    <td className="py-2 px-2.5 text-xs text-right" style={{ color: '#b91c1c' }}>{outAmt ? money(outAmt) : '—'}</td>
                    <td className="py-2 px-2.5 text-xs text-right" style={{ color: '#15803d' }}>{inAmt ? money(inAmt) : '—'}</td>
                    <td className="py-2 px-2.5">
                      <Badge label={l.cleared && uncategorized ? 'Selected, Needs Category' : l.cleared && !l.posted ? 'Selected, Unposted' : ls.label} fg={ls.fg} bg={ls.bg} />
                    </td>
                    <td className="py-2 px-2.5" onClick={(e) => e.stopPropagation()}>
                      {!finished && (
                        <div className="flex items-center gap-1.5 justify-end">
                          {isDup && <button onClick={() => setDupFor(l)} title="Resolve duplicate"><Copy className="w-3.5 h-3.5" style={{ color: '#b91c1c' }} /></button>}
                          <button onClick={() => setCatFor(l)} className="text-[11px] font-semibold" style={{ color: PURPLE }}>{uncategorized || !l.posted ? 'Code' : 'Edit'}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-sm" style={{ color: '#929292' }}>No transactions in this view.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: select totals + blockers */}
      <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5">
        <Panel title="Reconciliation Summary">
          <Line k={isCard ? 'Statement Balance' : 'Beginning Balance'} v={money(isCard ? m.statementBalance : m.beginningBalance)} />
          {!isCard && <Line k="Statement Ending Balance" v={money(m.statementBalance)} />}
          <Line k={isCard ? 'Selected Charges' : 'Selected Money In'} v={money(isCard ? m.selectedOut : m.selectedIn)} />
          <Line k={isCard ? 'Selected Credits' : 'Selected Money Out'} v={money(isCard ? m.selectedIn : m.selectedOut)} />
          <Line k="Cleared Balance" v={money(m.clearedBalance)} bold />
          <div className="pt-1.5 mt-1" style={{ borderTop: '1px solid #f0f0f0' }}><Line k="Difference" v={money(Math.abs(m.difference))} accent={m.balanced ? '#15803d' : '#b91c1c'} bold /></div>
        </Panel>
        <Panel title="Selection">
          <Line k="Selected transactions" v={String(m.selectedCount)} />
          <Line k="Uncategorized selected" v={String(m.uncategorizedSelected)} accent={m.uncategorizedSelected ? '#b45309' : '#222'} />
          <Line k="Unposted selected" v={String(m.unpostedSelected)} accent={m.unpostedSelected ? '#b45309' : '#222'} />
          <Line k="Missing receipts" v={String(m.missingReceiptSelected)} accent={m.missingReceiptSelected ? '#b91c1c' : '#222'} />
          <Line k="Possible duplicates" v={String(m.duplicates)} accent={m.duplicates ? '#b91c1c' : '#222'} />
          <Line k="Outstanding items" v={String(m.outstanding)} />
          <Line k="Timing differences" v={String(m.timingItems)} accent={m.timingItems ? '#b45309' : '#222'} />
        </Panel>
        {m.balanced && blockers.length === 0
          ? <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: '#dcfce7' }}><span className="text-xs font-bold" style={{ color: '#15803d' }}>Ready to Finish</span></div>
          : blockers.length > 0 && (
            <div className="rounded-2xl p-3.5" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2 inline-flex items-center gap-1" style={{ color: '#b45309' }}><AlertTriangle className="w-3.5 h-3.5" /> Before finishing</p>
              <ul className="flex flex-col gap-1.5">{blockers.map((b, i) => <li key={i} className="text-xs" style={{ color: b.severity === 'high' ? '#b91c1c' : '#b45309' }}>• {b.message}</li>)}</ul>
            </div>
          )}
      </div>

      {/* Modals / drawers */}
      {catFor && <CategorizeDrawer line={catFor} imp={imp} sessionId={sessionId} onClose={() => setCatFor(null)} onDone={flash} />}
      {dupFor && <DuplicateDrawer line={dupFor} lines={lines} imp={imp} sessionId={sessionId} onClose={() => setDupFor(null)} onDone={flash} />}
      {addOpen && <AddMissingModal imp={imp} lines={lines} sessionId={sessionId} onClose={() => setAddOpen(false)} onDone={flash} />}
      {findOpen && <FindDifferenceDrawer imp={imp} lines={lines} sessionId={sessionId} onClose={() => setFindOpen(false)} onSelect={(id) => { toggleCleared(sessionId, id); }} onCode={(l) => { setFindOpen(false); setCatFor(l); }} onAddMissing={() => { setFindOpen(false); setAddOpen(true); }} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg" style={{ background: '#15803d', color: '#fff' }}>{toast}</div>}
    </div>
  );
}

/* ── Inline categorize drawer (categorize → journal preview → post & clear) ── */
function CategorizeDrawer({ line, imp, sessionId, onClose, onDone }: { line: LiveLine; imp: StatementImport; sessionId: string; onClose: () => void; onDone: (t: string) => void }) {
  const pg = payrollGuidance(line.rawDescription, line.amount);
  const [txnType, setTxnType] = useState<TxnType>(line.coding?.txnType ?? line.suggestedTxnType ?? 'Expense');
  const [vendor, setVendor] = useState(line.coding?.vendor ?? line.suggestedVendor ?? '');
  const [categoryCode, setCategoryCode] = useState(line.coding?.categoryCode ?? (pg.isPayrollRelated ? pg.suggestionCode : line.suggestedCategoryCode) ?? '');
  const [department, setDepartment] = useState<Dept | ''>((line.coding?.department ?? line.suggestedDepartment ?? '') as Dept | '');
  const [memo, setMemo] = useState(line.coding?.memo ?? '');

  const cat = findAccount(categoryCode);
  const built = buildJournal({
    resolution: 'create-transaction', amount: Math.abs(line.amount), direction: line.amount < 0 ? 'out' : 'in',
    statementType: imp.statementType, sourceAccountName: imp.accountName, sourceAccountCode: imp.sourceAccountCode,
    categoryName: cat?.name, categoryCode: cat?.code,
  });
  const totals = journalTotals(built.lines);
  const valid = categoryCode && department && totals.balanced;

  const decision = () => ({ lineId: line.id, resolution: 'create-transaction' as const, txnType, vendor: vendor || undefined, categoryCode, categoryName: cat?.name, department: department || undefined, memo: memo || undefined, receipt: line.receipt, ready: true });
  const postClear = () => { postLine(decision(), { hotelId: imp.hotelId, dateIso: line.dateIso, sourceType: imp.statementType, lines: built.lines, memo }, true, sessionId); onDone('Posted and cleared.'); onClose(); };
  const saveOnly = () => { saveCoding(decision(), 'Categorized transaction'); onDone('Category saved.'); onClose(); };

  const groups = groupedCoa(imp.hotelId, 'create-transaction', txnType);

  return (
    <Drawer title="Categorize Transaction" sub={`${line.rawDescription} · ${money(line.amount, { sign: true })}`} onClose={onClose}>
      {pg.isPayrollRelated && pg.warning && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs mb-3" style={{ background: '#fff7ed', color: '#b45309', border: '1px solid #fed7aa' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{pg.warning}</span>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <FieldRow label="Transaction Type"><select value={txnType} onChange={(e) => setTxnType(e.target.value as TxnType)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>{TXN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
        <FieldRow label="Vendor / Payee"><input value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} placeholder="Vendor…" /></FieldRow>
        <FieldRow label="Category (Chart of Accounts)">
          <select value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>
            <option value="">Select account…</option>
            {groups.map((g) => <optgroup key={g.section} label={g.section}>{g.options.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.name}</option>)}</optgroup>)}
          </select>
        </FieldRow>
        <FieldRow label="Department"><select value={department} onChange={(e) => setDepartment(e.target.value as Dept)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}><option value="">Select…</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></FieldRow>
        <FieldRow label="Memo"><input value={memo} onChange={(e) => setMemo(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} placeholder="Optional…" /></FieldRow>

        {/* Journal preview */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#f7f7f7' }}><span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Journal Preview</span>{totals.balanced ? <Badge label="Balanced" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Balanced" fg="#b91c1c" bg="#fee2e2" />}</div>
          {built.lines.map((l, i) => <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs" style={{ borderBottom: '1px solid #f7f7f7' }}><span style={{ color: '#222' }}>{l.account}</span><span style={{ color: '#6a6a6a' }}>{l.debit ? `Dr ${money(l.debit)}` : `Cr ${money(l.credit)}`}</span></div>)}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={saveOnly} className="h-9 px-3 rounded-xl text-xs font-semibold flex-1" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Save Category</button>
        <button onClick={valid ? postClear : undefined} disabled={!valid} className="h-9 px-3 rounded-xl text-xs font-semibold flex-1" style={{ background: valid ? PURPLE : '#dddddd', color: '#fff', cursor: valid ? 'pointer' : 'not-allowed' }}>Post &amp; Clear</button>
      </div>
    </Drawer>
  );
}

/* ── Duplicate comparison drawer ──────────────────────────────────────── */
function DuplicateDrawer({ line, lines, imp, sessionId, onClose, onDone }: { line: LiveLine; lines: LiveLine[]; imp: StatementImport; sessionId: string; onClose: () => void; onDone: (t: string) => void }) {
  // Find the "other" transaction with the same amount + description.
  const other = lines.find((l) => l.id !== line.id && Math.abs(l.amount - line.amount) < 0.005 && l.rawDescription === line.rawDescription) ?? lines.find((l) => l.id !== line.id && Math.abs(l.amount - line.amount) < 0.005);
  const exclude = (keep: LiveLine, drop: LiveLine) => {
    excludeLine({ lineId: drop.id, resolution: 'duplicate', excludeReason: 'Duplicate', memo: `Duplicate of ${keep.rawDescription}` }, sessionId, imp.hotelId);
    onDone('Duplicate handled successfully.'); onClose();
  };
  return (
    <Drawer title="Resolve Duplicate" sub="Two transactions look like the same item. Keep one, exclude the other." onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {[line, other].filter(Boolean).map((l, i) => (
          <div key={l!.id} className="rounded-xl p-3 flex flex-col gap-1" style={{ border: '1px solid #eee' }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Transaction {i === 0 ? 'A' : 'B'}</p>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>{l!.rawDescription}</p>
            <DupRow k="Date" v={fmtDate(l!.dateIso)} />
            <DupRow k="Amount" v={money(l!.amount, { sign: true })} />
            <DupRow k="Vendor" v={l!.coding?.vendor ?? l!.suggestedVendor ?? '—'} />
            <DupRow k="Posted" v={l!.posted ? 'Yes' : 'No'} />
            <DupRow k="Reconciled" v={l!.status === 'reconciled' ? 'Yes' : 'No'} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {other && <button onClick={() => exclude(line, other)} className="h-9 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Keep A, Exclude B</button>}
        {other && <button onClick={() => exclude(other, line)} className="h-9 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Keep B, Exclude A</button>}
        <button onClick={() => { excludeLine({ lineId: line.id, resolution: 'duplicate', excludeReason: 'Duplicate' }, sessionId, imp.hotelId); onDone('Duplicate excluded.'); onClose(); }} className="h-9 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Exclude This Line</button>
      </div>
      <p className="text-[11px] mt-3" style={{ color: '#929292' }}>Reconciled and closed-month transactions are never silently deleted — the audit trail is always preserved.</p>
    </Drawer>
  );
}
function DupRow({ k, v }: { k: string; v: string }) { return <div className="flex justify-between text-[11px]"><span style={{ color: '#929292' }}>{k}</span><span style={{ color: '#222' }}>{v}</span></div>; }

/* ── Add Missing Transaction modal ────────────────────────────────────── */
function AddMissingModal({ imp, lines, sessionId, onClose, onDone }: { imp: StatementImport; lines: LiveLine[]; sessionId: string; onClose: () => void; onDone: (t: string) => void }) {
  const isCard = imp.statementType === 'credit-card';
  const [date, setDate] = useState(imp.endDate);
  const [desc, setDesc] = useState('');
  const [dir, setDir] = useState<'out' | 'in'>('out');
  const [amount, setAmount] = useState('');
  const [txnType, setTxnType] = useState<TxnType>('Expense');
  const [vendor, setVendor] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [department, setDepartment] = useState<Dept | ''>('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  // Smart description combobox.
  const [showSug, setShowSug] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const recent = useMemo(() => lines.map((l) => ({
    description: l.rawDescription, vendor: l.coding?.vendor ?? l.suggestedVendor, amount: l.amount, dateIso: l.dateIso,
    categoryCode: l.coding?.categoryCode ?? l.suggestedCategoryCode, categoryName: l.coding?.categoryName ?? l.suggestedCategoryName,
    department: l.coding?.department ?? l.suggestedDepartment, txnType: l.coding?.txnType ?? l.suggestedTxnType,
  })), [lines]);
  const suggestions = useMemo(() => suggestTransactions(desc, recent, date), [desc, recent, date]);

  const applySuggestion = (s: TxnSuggestion) => {
    setDesc(s.description);
    setVendor(s.vendor ?? '');
    setTxnType(s.txnType);
    setDir(s.direction);
    if (!amountTouched) setAmount(String(Math.abs(s.amount)));  // relevant amount, still editable
    if (s.categoryCode) setCategoryCode(s.categoryCode);
    if (s.department) setDepartment(s.department);
    setShowSug(false);
  };

  const amt = (dir === 'out' ? -1 : 1) * Math.abs(Number(amount) || 0);
  const cat = findAccount(categoryCode);
  const built = buildJournal({ resolution: 'create-transaction', amount: Math.abs(amt), direction: dir, statementType: imp.statementType, sourceAccountName: imp.accountName, sourceAccountCode: imp.sourceAccountCode, categoryName: cat?.name, categoryCode: cat?.code });
  const totals = journalTotals(built.lines);
  const groups = groupedCoa(imp.hotelId, 'create-transaction', txnType);

  const buildLine = (): AddedLine => ({
    id: `${sessionId}-add-${Math.random().toString(36).slice(2, 7)}`, importId: sessionId, hotelId: imp.hotelId, statementType: imp.statementType, accountId: imp.accountId,
    dateIso: date, postedDateIso: date, rawDescription: desc || 'Missing transaction', normalizedDescription: desc || 'Missing transaction',
    amount: amt, direction: dir, suggestedResolution: 'create-transaction', suggestedTxnType: txnType, suggestedVendor: vendor || undefined,
    suggestedCategoryCode: categoryCode || undefined, suggestedCategoryName: cat?.name, suggestedDepartment: department || undefined,
    receiptRequirement: 'not-required', confidence: 1, seedStatus: 'needs-coding', seedPosted: false, seedCleared: false,
  });

  const saveDraft = () => { if (!date) return setError('Date is required.'); if (!amount) return setError('Amount is required.'); addMissingTransaction(buildLine(), {}); onDone('Missing transaction saved as draft.'); onClose(); };
  const postClear = () => {
    if (!date) return setError('Date is required.');
    if (!amount) return setError('Amount is required.');
    if (!categoryCode) return setError('Category is required before posting.');
    if (!totals.balanced) return setError('Journal entry must balance.');
    addMissingTransaction(buildLine(), { post: true, clear: true, je: { lines: built.lines, memo } });
    onDone('Missing transaction posted and cleared.'); onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Add Missing Transaction</h2><p className="text-xs" style={{ color: '#929292' }}>Create a transaction that appears on the statement but is missing in StayOps.</p></div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} /></FieldRow>
            <FieldRow label={isCard ? 'Charge or Credit' : 'Money In or Out'}><select value={dir} onChange={(e) => setDir(e.target.value as 'in' | 'out')} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}><option value="out">{isCard ? 'Charge' : 'Money Out'}</option><option value="in">{isCard ? 'Credit' : 'Money In'}</option></select></FieldRow>
          </div>
          <FieldRow label="Description">
            <div className="relative">
              <input
                value={desc}
                onChange={(e) => { setDesc(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} placeholder="Start typing — we’ll match what you’ve seen before…" autoComplete="off"
              />
              {showSug && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-10 z-[70] rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                      className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f7f7f7' }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate" style={{ color: '#222' }}>{s.description}</span>
                          <Badge label={s.source === 'recent' ? 'Recent' : 'Vendor'} fg={s.source === 'recent' ? '#1d4ed8' : PURPLE} bg={s.source === 'recent' ? '#dbeafe' : '#ece4fb'} />
                        </div>
                        <p className="text-[11px] truncate" style={{ color: '#929292' }}>{s.categoryName ?? '—'} · {s.hint}</p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: s.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(s.amount, { sign: true })}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Amount"><input value={amount} onChange={(e) => { setAmount(e.target.value); setAmountTouched(true); }} className="h-9 px-2.5 rounded-lg text-sm w-full text-right" style={inputStyle} placeholder="0.00" /></FieldRow>
            <FieldRow label="Transaction Type"><select value={txnType} onChange={(e) => setTxnType(e.target.value as TxnType)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>{TXN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></FieldRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Vendor"><input value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} placeholder="Vendor…" /></FieldRow>
            <FieldRow label="Department"><select value={department} onChange={(e) => setDepartment(e.target.value as Dept)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}><option value="">Select…</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></FieldRow>
          </div>
          <FieldRow label="Category">
            <select value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} className="h-9 px-2 rounded-lg text-sm w-full" style={inputStyle}>
              <option value="">Select account…</option>
              {groups.map((g) => <optgroup key={g.section} label={g.section}>{g.options.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.name}</option>)}</optgroup>)}
            </select>
          </FieldRow>
          <FieldRow label="Memo"><input value={memo} onChange={(e) => setMemo(e.target.value)} className="h-9 px-2.5 rounded-lg text-sm w-full" style={inputStyle} placeholder="Optional…" /></FieldRow>
          {Number(amount) > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#f7f7f7' }}><span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Journal Preview</span>{totals.balanced ? <Badge label="Balanced" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Balanced" fg="#b91c1c" bg="#fee2e2" />}</div>
              {built.lines.map((l, i) => <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs" style={{ borderBottom: '1px solid #f7f7f7' }}><span style={{ color: '#222' }}>{l.account}</span><span style={{ color: '#6a6a6a' }}>{l.debit ? `Dr ${money(l.debit)}` : `Cr ${money(l.credit)}`}</span></div>)}
            </div>
          )}
          {error && <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#fee2e2', color: '#b91c1c' }}><AlertTriangle className="w-4 h-4" /> {error}</div>}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={saveDraft} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #ddd', color: '#6a6a6a' }}>Save as Draft</button>
          <button onClick={postClear} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: PURPLE, color: '#fff' }}>Post and Clear</button>
        </div>
      </div>
    </div>
  );
}

/* ── Find Difference drawer ───────────────────────────────────────────── */
function FindDifferenceDrawer({ imp, lines, sessionId, onClose, onSelect, onCode, onAddMissing }: { imp: StatementImport; lines: LiveLine[]; sessionId: string; onClose: () => void; onSelect: (id: string) => void; onCode: (l: LiveLine) => void; onAddMissing: () => void }) {
  const m = manualMetrics(imp, lines);
  const suggestions = findDifference(imp, lines);
  const act = (s: DiffSuggestion) => {
    if (s.kind === 'select' && s.lineId) { onSelect(s.lineId); onClose(); }
    else if ((s.kind === 'categorize' || s.kind === 'post' || s.kind === 'duplicate' || s.kind === 'timing') && s.lineId) { const l = lines.find((x) => x.id === s.lineId); if (l) onCode(l); }
    else if (s.kind === 'add-missing') onAddMissing();
    else onClose();
  };
  return (
    <Drawer title="Why is there a difference?" sub={`Statement ${money(m.statementBalance)} − Cleared ${money(m.clearedBalance)} = ${money(Math.abs(m.difference))}`} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <div key={i} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ border: '1px solid #eee' }}>
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: '#222' }}>{s.issue}</p>
              <p className="text-[11px]" style={{ color: '#929292' }}>{s.description ? `${s.description} · ` : ''}{s.amount != null ? money(Math.abs(s.amount)) : ''}</p>
            </div>
            <button onClick={() => act(s)} className="h-8 px-3 rounded-lg text-[11px] font-semibold whitespace-nowrap" style={{ background: PURPLE, color: '#fff' }}>{s.action}</button>
          </div>
        ))}
        {suggestions.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#15803d' }}>No difference — you're balanced.</p>}
      </div>
    </Drawer>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────── */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl p-3.5" style={card}><h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>{title}</h3><div className="flex flex-col gap-0.5">{children}</div></div>;
}
function Line({ k, v, bold, accent = '#222' }: { k: string; v: string; bold?: boolean; accent?: string }) {
  return <div className="flex justify-between gap-3 py-0.5"><span className="text-xs" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-xs" style={{ color: accent, fontWeight: bold ? 700 : 500 }}>{v}</span></div>;
}
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Drawer({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[55] flex justify-end" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2>{sub && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{sub}</p>}</div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}
