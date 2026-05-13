'use client';

import { AIBrief } from '@/components/ai/AIBrief';
import { PatternCard } from '@/components/ai/PatternCard';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { DecisionsLedger } from '@/components/ai/DecisionsLedger';
import { useScopedData } from '@/lib/use-scoped-data';
import { useAiPatterns, useAiForecasts, useAiDecisions, useBriefByModule } from '@/lib/ai-data';

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
        {children}
      </h2>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{subtitle}</p>}
    </div>
  );
}

export default function IntelligencePage() {
  const { hotels, hotelIdSet, scopeSub } = useScopedData();
  const brief = useBriefByModule('intelligence');

  const patterns = useAiPatterns().filter((p) => p.affectedHotelIds.some((id: string) => hotelIdSet.has(id)));
  const forecasts = useAiForecasts().filter((f) => !f.hotelId || hotelIdSet.has(f.hotelId));
  const decisions = useAiDecisions().filter((d) => hotelIdSet.has(d.hotelId));

  if (!brief) return <div className="p-6 text-sm text-[#6a6a6a]">Loading…</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · AI patterns, forecasts, and decisions</p>
      </div>

      <AIBrief brief={brief} />

      <div>
        <SectionTitle subtitle={`Signals the AI surfaced across ${hotels.length} propert${hotels.length === 1 ? 'y' : 'ies'}`}>
          Patterns
        </SectionTitle>
        {patterns.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #dddddd' }}>
            <p className="text-sm" style={{ color: '#929292' }}>No patterns detected at this scope.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((p) => <PatternCard key={p.id} pattern={p} />)}
          </div>
        )}
      </div>

      <div>
        <SectionTitle subtitle="Projected outcomes under different scenarios">
          Forecasts & Counterfactuals
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts.map((f) => <ForecastWidget key={f.id} forecast={f} />)}
        </div>
      </div>

      <div>
        <SectionTitle subtitle="Every approved, rejected, or overridden recommendation at this scope">
          Decisions Ledger
        </SectionTitle>
        {decisions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #dddddd' }}>
            <p className="text-sm" style={{ color: '#929292' }}>No recent decisions logged.</p>
          </div>
        ) : (
          <DecisionsLedger entries={decisions} />
        )}
      </div>
    </div>
  );
}
