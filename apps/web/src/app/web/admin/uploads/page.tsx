'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ApplySummary {
  revenueRowsUpserted: number;
  occupancyRowsUpserted: number;
  labourPeriodsUpserted: number;
  labourDeptRowsUpserted: number;
  warnings: string[];
  errors: string[];
}
interface UploadResponse {
  ok: boolean;
  parser?: string;
  batchId?: string;
  summary?: ApplySummary;
  error?: string;
  errors?: string[];
  warnings?: string[];
}

export default function UploadsPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setResult(null);
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
        body: fd,
      });
      const json = (await r.json()) as UploadResponse;
      setResult(json);
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : 'upload failed' });
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Upload CSV</h1>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          Drop a <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>daily-revenue.csv</code>
          {' '}or <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>labour.csv</code>.
          Numbers update on the dashboards immediately.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl p-12 text-center cursor-pointer transition-colors"
          style={{
            background: dragging ? '#fef0f3' : '#ffffff',
            border: `2px dashed ${dragging ? '#ff385c' : '#dddddd'}`,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#929292' }} />
          <p className="text-base font-semibold" style={{ color: '#222' }}>
            {uploading ? 'Uploading…' : 'Drop file or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>
            CSV, ≤ 5 MB. Filename should match <em>daily-revenue.csv</em> or <em>labour.csv</em>.
          </p>
        </div>

        {result && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: '#ffffff',
              border: `1px solid ${result.ok ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.ok
                ? <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
                : <AlertCircle className="w-5 h-5" style={{ color: '#b91c1c' }} />}
              <p className="text-base font-semibold" style={{ color: '#222' }}>
                {result.ok ? 'Upload applied' : 'Upload failed'}
              </p>
            </div>
            {result.parser && (
              <p className="text-xs mb-3" style={{ color: '#6a6a6a' }}>
                <FileSpreadsheet className="inline w-3 h-3 mr-1" />
                Parser: <code className="px-1 py-0.5 rounded" style={{ background: '#f7f7f7' }}>{result.parser}</code>
              </p>
            )}
            {result.summary && (
              <ul className="text-sm flex flex-col gap-1" style={{ color: '#3f3f3f' }}>
                <li>· {result.summary.revenueRowsUpserted} daily_revenue rows</li>
                <li>· {result.summary.occupancyRowsUpserted} daily_occupancy rows</li>
                <li>· {result.summary.labourPeriodsUpserted} labour_periods rows</li>
                <li>· {result.summary.labourDeptRowsUpserted} labour_departments rows</li>
              </ul>
            )}
            {result.error && <p className="text-sm" style={{ color: '#b91c1c' }}>{result.error}</p>}
            {(result.errors?.length ?? 0) > 0 && (
              <ul className="text-sm mt-2" style={{ color: '#b91c1c' }}>
                {result.errors!.map((e, i) => <li key={i}>· {e}</li>)}
              </ul>
            )}
            {(result.warnings?.length ?? 0) > 0 && (
              <details className="text-xs mt-3" style={{ color: '#929292' }}>
                <summary className="cursor-pointer">{result.warnings!.length} warning(s)</summary>
                <ul className="mt-1 ml-3">
                  {result.warnings!.map((w, i) => <li key={i}>· {w}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#222' }}>CSV format reference</p>
          <pre className="text-xs overflow-x-auto" style={{ color: '#3f3f3f' }}>
{`daily-revenue.csv columns:
  hotel_code, date, occupancy_pct, adr, revpar,
  room_revenue, fb_revenue, retail_revenue, events_revenue, other_revenue,
  total_revenue, rooms_sold, rooms_ooo, market_adr, avg_customer_rating

labour.csv columns:
  hotel_code, period_end, period_start, department,
  scheduled_hours, clocked_hours, overtime_hours, payroll_cost

  · period_end is the Sunday closing the bi-weekly period
  · period_start defaults to (period_end - 13 days) if blank
  · use department=__TOTAL__ for the per-period roll-up row`}
          </pre>
        </div>
      </div>
    </div>
  );
}
