'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, Download } from 'lucide-react';

interface Batch {
  id: string;
  uploaded_at: string;
  source: string;
  source_filename: string | null;
  source_email_from?: string | null;
  source_email_subject?: string | null;
  report_date: string | null;
  report_type: string | null;
  parser_id: string | null;
  status: string;
  row_count: number;
  errors: Array<{ message: string }> | null;
  warnings: Array<{ message: string }> | null;
  completed_at: string | null;
}

const ALL_HOTELS = ['BTRCI', 'SAVGW', 'SAVVY', 'GA989', 'SAVMT', 'SAVMD', 'RISAV', 'SAVFP', 'BQKCY', 'BSWVE', 'GAA84', 'BQKFP', 'SGJES', 'JAXTX', 'DFWFW', '58090LA'];

export default function UploadsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hotelCode, setHotelCode] = useState('BTRCI');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [uploadMsg, setUploadMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadErr, setLoadErr] = useState<string | null>(null);

  const loadBatches = async () => {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    setLoading(true);
    setLoadErr(null);
    try {
      const r = await fetch('/api/uploads', { headers: { 'x-admin-secret': secret } });
      const text = await r.text();
      const j = text ? JSON.parse(text) : {};
      setBatches(j.batches ?? []);
      if (j.error) setLoadErr(j.hint ?? j.error);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBatches(); }, []);

  async function handleFile(file: File) {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('hotelCode', hotelCode);
    fd.append('reportDate', reportDate);
    setUploading(true);
    setUploadMsg(null);
    try {
      const r = await fetch('/api/uploads', { method: 'POST', body: fd, headers: { 'x-admin-secret': secret } });
      const j = await r.json();
      if (!r.ok) {
        setUploadMsg({ kind: 'err', text: j.error ?? 'upload failed' });
      } else if (j.status === 'failed') {
        setUploadMsg({ kind: 'err', text: `parsed but failed: ${(j.errors ?? []).join(', ')}` });
      } else {
        const a = j.applied ?? {};
        setUploadMsg({
          kind: 'ok',
          text: `Parsed: ${a.revenueRowsUpserted ?? 0} revenue, ${a.occupancyRowsUpserted ?? 0} occupancy, ${a.snapshotsUpserted ?? 0} AM/PM snapshots.`,
        });
      }
    } catch (e) {
      setUploadMsg({ kind: 'err', text: e instanceof Error ? e.message : 'network error' });
    } finally {
      setUploading(false);
      loadBatches();
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Upload PMS Report</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Drop an Excel/CSV from any PMS. stayops auto-detects the format and updates the dashboards.
          </p>
        </div>

        {/* Drop zone */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hotel</label>
              <select
                value={hotelCode}
                onChange={(e) => setHotelCode(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              >
                {ALL_HOTELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Report Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="mt-1 w-full h-10 px-3 text-sm rounded-lg outline-none"
                style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
              />
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) void handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
            style={{
              borderColor: dragging ? '#ff385c' : '#dddddd',
              background: dragging ? '#fef2f4' : '#fafafa',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <Upload className="w-8 h-8 mx-auto" style={{ color: '#929292' }} />
            <p className="text-sm font-semibold mt-3" style={{ color: '#222' }}>
              {uploading ? 'Uploading…' : 'Drop Excel/CSV here or click to browse'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>
              Supported: Hilton OnQ Final Audit (more parsers shipping weekly)
            </p>
          </div>

          {uploadMsg && (
            <div
              className="mt-4 p-3 rounded-lg text-sm flex items-start gap-2"
              style={{
                background: uploadMsg.kind === 'ok' ? '#ecfdf5' : '#fef2f2',
                color: uploadMsg.kind === 'ok' ? '#065f46' : '#991b1b',
              }}
            >
              {uploadMsg.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{uploadMsg.text}</span>
            </div>
          )}
        </div>

        {/* Recent batches */}
        <div className="bg-white rounded-2xl" style={{ border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Recent Uploads</h2>
            <button onClick={loadBatches} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Refresh</button>
          </div>
          {loading ? (
            <p className="p-6 text-sm" style={{ color: '#929292' }}>Loading…</p>
          ) : loadErr ? (
            <div className="p-6 text-sm" style={{ color: '#ca8a04' }}>
              <p className="font-semibold" style={{ color: '#92400e' }}>Database not ready</p>
              <p className="mt-1" style={{ color: '#929292' }}>{loadErr}</p>
            </div>
          ) : batches.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: '#929292' }}>No uploads yet. Drop a file above to get started.</p>
          ) : (
            <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
              {batches.map((b) => (
                <BatchRow key={b.id} b={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BatchRow({ b }: { b: Batch }) {
  const icon =
    b.status === 'parsed' ? <CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} /> :
    b.status === 'failed' ? <AlertCircle className="w-4 h-4" style={{ color: '#b91c1c' }} /> :
    <Clock className="w-4 h-4" style={{ color: '#ca8a04' }} />;

  return (
    <div className="px-6 py-4 flex items-start gap-3">
      <FileSpreadsheet className="w-4 h-4 mt-0.5" style={{ color: '#6a6a6a' }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>
            {b.source_filename ?? b.source_email_subject ?? 'unnamed'}
          </p>
          {b.source === 'email' && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#1d4ed8' }}>email</span>}
          {b.source === 'upload' && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6a6a6a' }}>upload</span>}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-xs" style={{ color: '#929292' }}>
            {new Date(b.uploaded_at).toLocaleString()} · {b.parser_id ?? 'no parser'} · {b.row_count} rows
          </p>
        </div>
        {b.errors && b.errors.length > 0 && (
          <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>
            {b.errors.map((e) => e.message).join(' · ')}
          </p>
        )}
        {b.warnings && b.warnings.length > 0 && (
          <p className="text-xs mt-1" style={{ color: '#ca8a04' }}>
            {b.warnings.map((e) => e.message).join(' · ')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase" style={{
          color: b.status === 'parsed' ? '#15803d' : b.status === 'failed' ? '#b91c1c' : '#ca8a04',
        }}>
          {b.status}
        </span>
      </div>
    </div>
  );
}
