'use client';

import { useMemo, useState } from 'react';
import { Filter, AlertTriangle } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { formatCurrency, getEntityByHotel, getReceiptForTransaction, splitsForTransaction, auditForTransaction, approvalForTransaction } from '@hos/shared';
import type { LedgerTransaction } from '@hos/shared';

type SourceFilter = 'all' | 'bank' | 'cc' | 'ota' | 'payroll' | 'manual';
type ReceiptFilter = 'all' | 'missing' | 'attached';
type ReconFilter = 'all' | 'reconciled' | 'unreconciled';

export default function TransactionsPage() {
  const data = useAccountingData();
  const [source, setSource] = useState<SourceFilter>('all');
  const [receiptStatus, setReceiptStatus] = useState<ReceiptFilter>('all');
  const [reconStatus, setReconStatus] = useState<ReconFilter>('all');
  const [vendorQuery, setVendorQuery] = useState('');
  const [openTx, setOpenTx] = useState<LedgerTransaction | null>(null);

  const accountById = useMemo(() => new Map(data.coa.map((a) => [a.id, a])), [data.coa]);
  const vendorById = useMemo(() => new Map(data.vendors.map((v) => [v.id, v])), [data.vendors]);
  const hotelById = useMemo(() => new Map(data.hotels.map((h) => [h.id, h])), [data.hotels]);

  const filtered = useMemo(() => {
    let rows = data.transactions;
    if (source !== 'all') rows = rows.filter((t) => t.source === source);
    if (receiptStatus === 'missing') rows = rows.filter((t) => !!t.vendorId === false || t.amount > 0);
    if (reconStatus === 'reconciled') rows = rows.filter((t) => !!t.reconciledIso);
    else if (reconStatus === 'unreconciled') rows = rows.filter((t) => !t.reconciledIso);
    if (vendorQuery.trim()) {
      const q = vendorQuery.toLowerCase();
      rows = rows.filter((t) => {
        const v = t.vendorId ? vendorById.get(t.vendorId) : null;
        const a = accountById.get(t.accountId);
        return (
          v?.name.toLowerCase().includes(q) ||
          a?.name.toLowerCase().includes(q) ||
          t.memo.toLowerCase().includes(q)
        );
      });
    }
    return rows;
  }, [data.transactions, source, receiptStatus, reconStatus, vendorQuery, vendorById, accountById]);

  const flagsForTx = (t: LedgerTransaction) => {
    const flags: Array<{ label: string; bg: string; color: string }> = [];
    const receipt = getReceiptForTransaction(t.id);
    const splits = splitsForTransaction(t.id);
    if (!t.reconciledIso) flags.push({ label: 'UNRECONCILED', bg: '#fef3c7', color: '#92400e' });
    if (!t.vendorId && t.source !== 'ota' && t.source !== 'payroll') flags.push({ label: 'NO VENDOR', bg: '#fee2e2', color: '#b91c1c' });
    if (t.aiSuggested) flags.push({ label: 'AI SUGGESTED', bg: '#ede9fe', color: '#6d28d9' });
    if (splits.length > 0) flags.push({ label: 'SPLIT', bg: '#dbeafe', color: '#1d4ed8' });
    if (receipt) flags.push({ label: 'RECEIPT', bg: '#dcfce7', color: '#15803d' });
    else if (t.amount < 0 && t.source !== 'payroll' && t.source !== 'ota') flags.push({ label: 'NO RECEIPT', bg: '#fee2e2', color: '#b91c1c' });
    return flags;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {data.scopeSub} · {filtered.length} of {data.transactions.length} rows
          </p>
        </div>
        <DemoDataToggle />
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-3" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <Filter className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        <FilterChips
          label="Source"
          value={source}
          options={[
            { value: 'all', label: 'All' },
            { value: 'bank', label: 'Bank' },
            { value: 'cc', label: 'CC' },
            { value: 'ota', label: 'OTA' },
            { value: 'payroll', label: 'Payroll' },
            { value: 'manual', label: 'Manual' },
          ]}
          onChange={(v) => setSource(v as SourceFilter)}
        />
        <FilterChips
          label="Receipt"
          value={receiptStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'missing', label: 'Missing' },
            { value: 'attached', label: 'Attached' },
          ]}
          onChange={(v) => setReceiptStatus(v as ReceiptFilter)}
        />
        <FilterChips
          label="Reconciled"
          value={reconStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'reconciled', label: 'Reconciled' },
            { value: 'unreconciled', label: 'Unreconciled' },
          ]}
          onChange={(v) => setReconStatus(v as ReconFilter)}
        />
        <input
          type="text"
          placeholder="Search vendor / account / memo"
          value={vendorQuery}
          onChange={(e) => setVendorQuery(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-full ml-auto"
          style={{ border: '1px solid #dddddd', minWidth: 240 }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Date</th>
              <th className={th}>Hotel</th>
              <th className={th}>Account</th>
              <th className={th}>Vendor</th>
              <th className={th}>Memo</th>
              <th className={th + ' text-right'}>Amount</th>
              <th className={th}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((t, i) => {
              const a = accountById.get(t.accountId);
              const v = t.vendorId ? vendorById.get(t.vendorId) : null;
              const h = hotelById.get(t.hotelId);
              const flags = flagsForTx(t);
              return (
                <tr
                  key={t.id}
                  onClick={() => setOpenTx(t)}
                  className="cursor-pointer hover:bg-[#fafafa]"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                >
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{t.dateIso}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h?.shortName ?? t.hotelId}</td>
                  <td className="py-2.5 px-4">
                    <p className="text-sm" style={{ color: '#222222' }}>{a?.name ?? t.accountId}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{a?.number}</p>
                  </td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{v?.name ?? <em style={{ color: '#929292' }}>—</em>}</td>
                  <td className="py-2.5 px-4 text-xs truncate max-w-[260px]" style={{ color: '#6a6a6a' }}>{t.memo}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-semibold" style={{ color: t.amount >= 0 ? '#15803d' : '#b91c1c' }}>
                    {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <span key={f.label} className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: f.bg, color: f.color }}>
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>
                  No transactions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 200 && <p className="text-xs text-center" style={{ color: '#929292' }}>Showing 200 of {filtered.length}.</p>}

      {/* Detail panel */}
      {openTx && (
        <DetailDrawer
          tx={openTx}
          onClose={() => setOpenTx(null)}
          accountName={accountById.get(openTx.accountId)?.name ?? openTx.accountId}
          vendorName={openTx.vendorId ? vendorById.get(openTx.vendorId)?.name ?? null : null}
          hotelName={hotelById.get(openTx.hotelId)?.shortName ?? openTx.hotelId}
          entityName={getEntityByHotel(openTx.hotelId)?.name ?? '—'}
        />
      )}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

function FilterChips<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors"
            style={{
              background: value === o.value ? '#222222' : '#ffffff',
              color: value === o.value ? '#ffffff' : '#6a6a6a',
              border: '1px solid #dddddd',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailDrawer({
  tx, onClose, accountName, vendorName, hotelName, entityName,
}: {
  tx: LedgerTransaction;
  onClose: () => void;
  accountName: string;
  vendorName: string | null;
  hotelName: string;
  entityName: string;
}) {
  const receipt = getReceiptForTransaction(tx.id);
  const splits = splitsForTransaction(tx.id);
  const audit = auditForTransaction(tx.id);
  const approval = approvalForTransaction(tx.id);
  const isMaintenance = accountName.toLowerCase().includes('maintenance') || accountName.toLowerCase().includes('r&m');

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <aside className="bg-white h-full w-full max-w-xl flex flex-col" style={{ borderLeft: '1px solid #dddddd' }}>
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid #dddddd' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Transaction</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: '#222222' }}>{vendorName ?? accountName}</h3>
            <p className={'text-xl font-bold mt-1'} style={{ color: tx.amount >= 0 ? '#15803d' : '#b91c1c' }}>
              {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
            </p>
          </div>
          <button onClick={onClose} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <Section title="Source">
            <Field2 label="Source">{tx.source.toUpperCase()}</Field2>
            <Field2 label="Date">{tx.dateIso}</Field2>
            <Field2 label="Hotel">{hotelName}</Field2>
            <Field2 label="Entity">{entityName}</Field2>
            <Field2 label="Memo" wide>{tx.memo}</Field2>
          </Section>

          <Section title="Categorization">
            <Field2 label="Account">{accountName}</Field2>
            <Field2 label="Vendor">{vendorName ?? '—'}</Field2>
            <Field2 label="Confidence">{tx.aiSuggested ? 'AI · medium' : tx.ruleId ? 'Rule · high' : 'Manual'}</Field2>
          </Section>

          {splits.length > 0 && (
            <Section title={`Split into ${splits.length} legs`}>
              <div className="col-span-2 rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                {splits.map((s, i) => (
                  <div key={s.id} className="px-3 py-2 flex items-start justify-between" style={{ borderBottom: i < splits.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div className="min-w-0">
                      <p className="text-xs font-medium" style={{ color: '#222222' }}>{s.notes}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>
                        {s.department}{s.area ? ` · ${s.area}` : ''}{s.roomNumber ? ` · Room ${s.roomNumber}` : ''}
                      </p>
                    </div>
                    <p className="text-xs font-semibold tabular-nums whitespace-nowrap ml-3" style={{ color: '#b91c1c' }}>
                      {formatCurrency(s.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {isMaintenance && splits.length === 0 && (
            <Section title="Repair / Maintenance Context">
              <p className="text-xs col-span-2" style={{ color: '#929292' }}>
                StayOps connects R&M expenses to physical context. Click "Edit" to fill area/room/asset.
              </p>
              <Field2 label="Area">Not yet captured</Field2>
              <Field2 label="Room #">—</Field2>
              <Field2 label="Asset">—</Field2>
            </Section>
          )}

          <Section title="Receipt & Invoice">
            {receipt ? (
              <div className="col-span-2 rounded-xl p-4" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{receipt.thumbnailEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#222222' }}>{receipt.filename}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>
                      Uploaded {receipt.uploadedIso.slice(0, 10)} by {receipt.uploadedBy} · OCR confidence {Math.round(receipt.ocrConfidence * 100)}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <ReceiptField label="Vendor (OCR)" value={receipt.ocrVendor} />
                  <ReceiptField label="Date (OCR)" value={receipt.ocrDateIso} />
                  <ReceiptField label="Total (OCR)" value={formatCurrency(receipt.ocrTotal)} />
                  <ReceiptField label="Tax" value={receipt.ocrTax ? formatCurrency(receipt.ocrTax) : '—'} />
                  <ReceiptField label="Invoice #" value={receipt.ocrInvoiceNumber ?? '—'} wide />
                </div>
                {receipt.lineItems.length > 0 && (
                  <div className="mt-3 rounded-lg overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                    {receipt.lineItems.map((l, i) => (
                      <div key={i} className="px-3 py-1.5 flex items-center justify-between" style={{ borderBottom: i < receipt.lineItems.length - 1 ? '1px solid #f0f0f0' : 'none', background: '#fafafa' }}>
                        <div className="min-w-0">
                          <p className="text-xs" style={{ color: '#222222' }}>{l.description}</p>
                          <p className="text-[10px]" style={{ color: '#929292' }}>{l.qty} × {formatCurrency(l.unitPrice)}</p>
                        </div>
                        <p className="text-xs font-semibold tabular-nums" style={{ color: '#3f3f3f' }}>{formatCurrency(l.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-2 rounded-lg p-4 flex items-start gap-2" style={{ background: '#fffbeb' }}>
                <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#92400e' }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: '#92400e' }}>Missing receipt</p>
                  <p className="text-xs mt-0.5" style={{ color: '#3f3f3f' }}>Upload a receipt or invoice to clear this flag. OCR auto-extracts vendor / amount / line items.</p>
                </div>
              </div>
            )}
          </Section>

          <Section title="Approval & Reconciliation">
            <Field2 label="Approval Status">
              {approval ? `${approval.status.replace(/-/g, ' ')} · ${approval.approverName ?? approval.approverRole}` :
                tx.amount < -2000 ? 'Owner approval required' : 'Not required'}
            </Field2>
            <Field2 label="Reconciliation">{tx.reconciledIso ? `Reconciled ${tx.reconciledIso}` : 'Not reconciled'}</Field2>
            {approval?.reason && <Field2 label="Reason" wide>{approval.reason}</Field2>}
          </Section>

          <Section title="Audit Trail">
            {audit.length === 0 ? (
              <p className="col-span-2 text-xs" style={{ color: '#6a6a6a' }}>
                Imported from {tx.source.toUpperCase()} statement · auto-categorized via {tx.ruleId ? 'learned rule' : 'AI'}.
              </p>
            ) : (
              <div className="col-span-2 flex flex-col gap-2">
                {audit.map((e) => (
                  <div key={e.id} className="rounded-lg px-3 py-2 flex items-start gap-2" style={{ background: '#f7f7f7' }}>
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#222222', color: '#ffffff' }}>
                      {e.action.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: '#222222' }}>
                        {e.actorName} · <span style={{ color: '#929292' }}>{e.timestampIso.slice(0, 16).replace('T', ' ')}</span>
                      </p>
                      {e.fieldChanged && (
                        <p className="text-[10px] mt-0.5" style={{ color: '#6a6a6a' }}>
                          {e.fieldChanged}: <s>{e.oldValue}</s> → <strong>{e.newValue}</strong>
                        </p>
                      )}
                      {e.notes && <p className="text-[10px] mt-0.5" style={{ color: '#6a6a6a' }}>{e.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </aside>
    </div>
  );
}

function ReceiptField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: '#222222' }}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>{title}</h4>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
function Field2({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-sm mt-0.5" style={{ color: '#222222' }}>{children}</p>
    </div>
  );
}
