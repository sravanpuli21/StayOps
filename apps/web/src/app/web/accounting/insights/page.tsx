'use client';

import { Lightbulb, TrendingUp, AlertTriangle, Clock, Receipt } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { portfolioSummary, allSessionRows } from '../_recon2';
import { hotelLabel } from '../_domain';
import { card, PageHeader, Kpi, PURPLE } from '../_ui';

export default function InsightsPage() {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const sum = portfolioSummary(store, hotelId);
  const rows = allSessionRows(store, hotelId);
  const pctReconciled = rows.length ? Math.round((sum.reconciled / rows.length) * 100) : 0;

  const insights = [
    sum.linesToCode > 0 && { icon: <Clock className="w-4 h-4" />, color: '#b45309', title: `${sum.linesToCode} statement lines still need coding`, body: 'Code them in the workbench so they can be posted, cleared, and reconciled before close.' },
    sum.differences > 0 && { icon: <AlertTriangle className="w-4 h-4" />, color: '#b91c1c', title: `${sum.differences} account${sum.differences === 1 ? '' : 's'} show a difference`, body: 'Open the difference drawer to see exactly which line is unposted or duplicated.' },
    sum.missingReceipts > 0 && { icon: <Receipt className="w-4 h-4" />, color: '#b91c1c', title: `${sum.missingReceipts} receipts missing on posted/required lines`, body: 'Request receipts from GMs to unblock posting and month close.' },
    { icon: <TrendingUp className="w-4 h-4" />, color: '#15803d', title: `${pctReconciled}% of statements reconciled`, body: `${sum.reconciled} of ${rows.length} workbench sessions are complete.` },
  ].filter(Boolean) as { icon: React.ReactNode; color: string; title: string; body: string }[];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'} title="Insights" subtitle="What needs attention to close the month." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Statements" value={String(sum.statements)} />
        <Kpi label="Reconciled" value={`${pctReconciled}%`} accent="#15803d" />
        <Kpi label="Differences" value={String(sum.differences)} accent={sum.differences ? '#b91c1c' : '#15803d'} />
        <Kpi label="Close Blockers" value={String(sum.blockers)} accent={sum.blockers ? '#b91c1c' : '#15803d'} />
      </div>
      <div className="flex flex-col gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={card}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f7f7f7', color: ins.color }}>{ins.icon}</div>
            <div><p className="text-sm font-bold" style={{ color: '#222' }}>{ins.title}</p><p className="text-xs mt-0.5" style={{ color: '#929292' }}>{ins.body}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
