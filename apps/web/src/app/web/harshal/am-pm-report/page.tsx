'use client';

import { AmPmReportClient } from '@/components/am-pm-report/AmPmReportClient';
import { useScopedData } from '@/lib/use-scoped-data';

export default function AmPmReportPage() {
  const { hotels, scopeLabel, scopeSub } = useScopedData();
  return (
    <div className="flex flex-col gap-6">
      <div className="no-print">
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>AM-PM Report</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Room stats snapshot</p>
      </div>

      <AmPmReportClient territoryIds={hotels.map((h) => h.id)} scopeLabel={scopeLabel} />
    </div>
  );
}
