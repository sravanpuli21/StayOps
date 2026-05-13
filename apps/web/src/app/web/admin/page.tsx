import Link from 'next/link';
import { Upload, Inbox } from 'lucide-react';

export default function AdminHome() {
  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>StayOps Admin</h1>
        <p className="text-sm mb-8" style={{ color: '#929292' }}>
          Operator tools for the StayOps demo tenant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/web/admin/uploads"
            className="rounded-2xl p-5 bg-white hover:bg-[#fafafa] transition-colors"
            style={{ border: '1px solid #dddddd' }}
          >
            <Upload className="w-5 h-5 mb-3" style={{ color: '#ff385c' }} />
            <p className="text-base font-semibold" style={{ color: '#222' }}>Uploads</p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              Drag-drop a CSV (daily-revenue or labour) to push numbers into the dashboards.
            </p>
          </Link>

          <Link
            href="/web/admin/ingestion"
            className="rounded-2xl p-5 bg-white hover:bg-[#fafafa] transition-colors"
            style={{ border: '1px solid #dddddd' }}
          >
            <Inbox className="w-5 h-5 mb-3" style={{ color: '#ff385c' }} />
            <p className="text-base font-semibold" style={{ color: '#222' }}>Email ingestion</p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              Poll the Gmail inbox now, or watch the daily cron run on its own.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
