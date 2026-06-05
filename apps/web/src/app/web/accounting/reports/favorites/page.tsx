'use client';

import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { useAcctState, toggleFavoriteReport } from '../../_store';
import { card, Badge } from '../../_ui';
import { REPORT_CATALOG } from '../_reports';
import { ReportTabs } from '../_shell';

export default function FavoriteReportsPage() {
  const store = useAcctState();
  const favs = REPORT_CATALOG.filter((r) => store.favoriteReports.includes(r.id));

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Favorite Reports</h1><p className="text-sm" style={{ color: '#929292' }}>Quick access to the reports you use most.</p></div>

      {favs.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <Star className="w-8 h-8 mx-auto" style={{ color: '#cfcfcf' }} />
          <p className="text-base font-semibold mt-2" style={{ color: '#222' }}>No favorite reports yet.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Mark frequently used reports as favorites for quick access.</p>
          <Link href="/web/accounting/reports" className="inline-block mt-3 h-9 leading-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Browse Reports</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favs.map((r) => (
            <div key={r.id} className="p-5 flex flex-col gap-2" style={card}>
              <div className="flex items-start justify-between"><p className="font-bold text-sm" style={{ color: '#222' }}>{r.name}</p><button onClick={() => toggleFavoriteReport(r.id)}><Star className="w-4 h-4" style={{ color: '#f59e0b', fill: '#f59e0b' }} /></button></div>
              <p className="text-xs flex-1" style={{ color: '#6a6a6a' }}>{r.description}</p>
              <Badge label={r.category} fg="#6a4ec0" bg="#ece4fb" />
              <Link href={r.href} className="mt-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}>Open Report <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
