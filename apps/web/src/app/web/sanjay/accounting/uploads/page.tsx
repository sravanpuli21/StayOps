'use client';

import { useMemo, useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  HOTELS, ALL_BANK_ACCOUNTS, BANK_IMPORT_ROWS, CC_IMPORT_ROWS, formatCurrency,
} from '@hos/shared';
import { parseCsvFile, detectFromFilename, detectDuplicates, type ParsedCsv, type FilenameDetection, type DuplicateMatch } from '@/lib/csv-parser';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';

type AccountType = 'bank' | 'cc';

export default function UploadsPage() {
  const [hotelId, setHotelId] = useState<string>('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [periodMonth, setPeriodMonth] = useState<string>('2026-04');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [detection, setDetection] = useState<FilenameDetection | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const hotelAccounts = useMemo(
    () => ALL_BANK_ACCOUNTS.filter((b) => b.hotelId === hotelId && (accountType === 'bank' ? b.kind !== 'cc' : b.kind === 'cc')),
    [hotelId, accountType],
  );

  const existingRows = useMemo(() => {
    const a: Array<{ id: string; hotelId: string; bankAccountId: string; dateIso: string; amount: number; description: string }> = [];
    for (const r of BANK_IMPORT_ROWS) a.push({ id: r.id, hotelId: r.hotelId, bankAccountId: r.bankAccountId, dateIso: r.dateIso, amount: r.amount, description: r.description });
    for (const r of CC_IMPORT_ROWS) a.push({ id: r.id, hotelId: r.hotelId, bankAccountId: r.bankAccountId, dateIso: r.dateIso, amount: r.amount, description: r.description });
    return a;
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setConfirmed(false);
    setFilename(file.name);
    try {
      const det = detectFromFilename(file.name, HOTELS, ALL_BANK_ACCOUNTS);
      setDetection(det);
      // Auto-fill controls from filename if confident enough
      if (det.hotel && !hotelId) setHotelId(det.hotel.id);
      if (det.accountType === 'cc') setAccountType('cc');
      else if (det.accountType) setAccountType('bank');
      if (det.bankAccountId && !bankAccountId) setBankAccountId(det.bankAccountId);
      if (det.month) setPeriodMonth(det.month);

      const result = await parseCsvFile(file);
      setParsed(result);
      const targetHotel = det.hotel?.id ?? hotelId;
      const targetAcct = det.bankAccountId ?? bankAccountId;
      if (targetHotel && targetAcct) {
        setDuplicates(detectDuplicates(result, targetAcct, targetHotel, existingRows));
      } else {
        setDuplicates([]);
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
    } finally {
      setParsing(false);
    }
  };

  const reset = () => {
    setParsed(null);
    setDetection(null);
    setDuplicates([]);
    setFilename(null);
    setConfirmed(false);
  };

  const dupePill = (status: DuplicateMatch['status']) => {
    if (status === 'likely-duplicate') return { bg: '#fee2e2', color: '#b91c1c', label: 'LIKELY DUP' };
    if (status === 'possible-duplicate') return { bg: '#fef3c7', color: '#92400e', label: 'POSSIBLE DUP' };
    return { bg: '#dcfce7', color: '#15803d', label: 'NEW' };
  };

  const confidencePill = (c: FilenameDetection['confidence']) =>
    c === 'high' ? { bg: '#dcfce7', color: '#15803d', label: 'HIGH CONFIDENCE' } :
    c === 'medium' ? { bg: '#fef3c7', color: '#92400e', label: 'MEDIUM' } :
    { bg: '#fee2e2', color: '#b91c1c', label: 'LOW · CONFIRM' };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Uploads</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            One hotel · one account · one statement at a time. Filename detection auto-fills the form.
          </p>
        </div>
        <DemoDataToggle />
      </div>

      {/* Upload form */}
      <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <Field label="Hotel">
          <select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg" style={selectStyle}>
            <option value="">Select hotel…</option>
            {HOTELS.map((h) => <option key={h.id} value={h.id}>{h.shortName}</option>)}
          </select>
        </Field>
        <Field label="Account Type">
          <div className="flex gap-2">
            <ToggleBtn active={accountType === 'bank'} onClick={() => setAccountType('bank')}>Bank</ToggleBtn>
            <ToggleBtn active={accountType === 'cc'} onClick={() => setAccountType('cc')}>Credit Card</ToggleBtn>
          </div>
        </Field>
        <Field label="Account">
          <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg" style={selectStyle} disabled={!hotelId}>
            <option value="">{hotelId ? 'Select…' : 'Pick hotel first'}</option>
            {hotelAccounts.map((b) => <option key={b.id} value={b.id}>····{b.last4} · {b.name.split('·')[0].trim()}</option>)}
          </select>
        </Field>
        <Field label="Statement Period">
          <input type="month" value={periodMonth} onChange={(e) => setPeriodMonth(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg" style={selectStyle} />
        </Field>
      </div>

      {/* Drop zone */}
      {!parsed && (
        <label
          className="rounded-2xl p-12 flex flex-col items-center text-center gap-3 cursor-pointer transition-colors hover:bg-[#fafafa]"
          style={{ border: '2px dashed #dddddd', background: '#ffffff' }}
        >
          <Upload className="w-10 h-10" style={{ color: '#6a6a6a' }} />
          <p className="text-base font-bold" style={{ color: '#222222' }}>Drop a CSV statement</p>
          <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
            Filename detection picks up patterns like <code className="px-1 py-0.5 rounded text-xs" style={{ background: '#f0f0f0', color: '#222222' }}>Cambria_Savannah_Chase_Operating_Apr_2026.csv</code>
          </p>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <p className="text-xs mt-2" style={{ color: '#929292' }}>{parsing ? 'Parsing…' : 'Click to browse or drag a file'}</p>
        </label>
      )}

      {parseError && (
        <div className="rounded-2xl p-4 flex items-start gap-2" style={{ border: '1px solid #b91c1c', background: '#fee2e2' }}>
          <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} />
          <p className="text-sm" style={{ color: '#b91c1c' }}>Failed to parse: {parseError}</p>
        </div>
      )}

      {/* Detection summary */}
      {detection && parsed && (
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" style={{ color: '#6a6a6a' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#222222' }}>{filename}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{parsed.rows.length} rows · {Object.values(parsed.detectedColumns).filter(Boolean).length} columns mapped</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const p = confidencePill(detection.confidence);
                return <span className="text-[10px] font-bold tracking-wide px-2 py-1 rounded" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
              })()}
              <button onClick={reset} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>
                <X className="w-3 h-3 inline mr-1" /> Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <DetectChip label="Hotel" value={detection.hotel?.label ?? '—'} muted={!detection.hotel} />
            <DetectChip label="Bank" value={detection.bankName ?? '—'} muted={!detection.bankName} />
            <DetectChip label="Account Type" value={detection.accountType ?? '—'} muted={!detection.accountType} />
            <DetectChip label="Period" value={detection.month ?? '—'} muted={!detection.month} />
            <DetectChip label="File Type" value={detection.fileType} muted={detection.fileType === 'unknown'} />
          </div>

          {detection.notes.length > 0 && (
            <div className="rounded-lg p-3 flex flex-col gap-1" style={{ background: '#fffbeb' }}>
              {detection.notes.map((n, i) => (
                <p key={i} className="text-xs" style={{ color: '#92400e' }}>• {n}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mapped columns */}
      {parsed && (
        <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Column Mapping</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(parsed.detectedColumns).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p>
                <p className="text-sm" style={{ color: v ? '#222222' : '#b91c1c', fontWeight: v ? 600 : 400 }}>{v ?? 'not mapped'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review imports */}
      {parsed && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Review Imports · {parsed.rows.length} rows</h3>
            <p className="text-xs" style={{ color: '#929292' }}>
              {duplicates.filter((d) => d.status === 'likely-duplicate').length} likely dupes · {duplicates.filter((d) => d.status === 'possible-duplicate').length} possible · {duplicates.filter((d) => d.status === 'new').length} new
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  <th className={th}>Status</th>
                  <th className={th}>Date</th>
                  <th className={th}>Description</th>
                  <th className={th + ' text-right'}>Amount</th>
                  <th className={th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 50).map((r, idx) => {
                  const dup = duplicates[idx];
                  const pill = dup ? dupePill(dup.status) : dupePill('new');
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
                      </td>
                      <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{r.date ?? '—'}</td>
                      <td className="py-2.5 px-4 text-xs" style={{ color: '#222222' }}>{r.description || <em style={{ color: '#929292' }}>blank</em>}</td>
                      <td className="py-2.5 px-4 text-xs text-right font-semibold" style={{ color: (r.amount ?? 0) >= 0 ? '#15803d' : '#b91c1c' }}>
                        {r.amount === null ? '—' : `${r.amount >= 0 ? '+' : ''}${formatCurrency(r.amount)}`}
                      </td>
                      <td className="py-2.5 px-4 text-[10px]" style={{ color: '#929292' }}>{dup?.reasons.join(' · ') ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > 50 && (
            <p className="text-xs mt-2 text-center" style={{ color: '#929292' }}>Showing 50 of {parsed.rows.length} rows.</p>
          )}
        </div>
      )}

      {parsed && !confirmed && (
        <div className="flex justify-end gap-3">
          <button onClick={reset} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>Cancel</button>
          <button
            onClick={() => setConfirmed(true)}
            disabled={!hotelId || !bankAccountId}
            className="text-xs font-semibold px-4 py-2 rounded-full"
            style={{
              background: !hotelId || !bankAccountId ? '#f0f0f0' : '#15803d',
              color: !hotelId || !bankAccountId ? '#929292' : '#ffffff',
              cursor: !hotelId || !bankAccountId ? 'not-allowed' : 'pointer',
            }}
          >
            Confirm Import · {parsed.rows.length} rows → review queue
          </button>
        </div>
      )}

      {confirmed && (
        <div className="rounded-2xl p-5 flex items-center gap-3" style={{ border: '1px solid #15803d', background: '#f0fdf4' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
          <p className="text-sm font-bold" style={{ color: '#15803d' }}>
            {parsed?.rows.length} rows added to the Transactions queue.
          </p>
          <p className="text-xs" style={{ color: '#3f3f3f' }}>(Demo: in-memory only, not persisted.)</p>
        </div>
      )}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
const selectStyle: React.CSSProperties = { border: '1px solid #dddddd', color: '#222222', background: '#ffffff' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>
      {children}
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
      style={{
        background: active ? '#222222' : '#ffffff',
        color: active ? '#ffffff' : '#6a6a6a',
        border: '1px solid #dddddd',
      }}
    >
      {children}
    </button>
  );
}

function DetectChip({ label, value, muted }: { label: string; value: string; muted: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-sm mt-0.5 font-medium capitalize" style={{ color: muted ? '#b91c1c' : '#222222' }}>{value}</p>
    </div>
  );
}
