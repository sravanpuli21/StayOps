import { AI_PATTERNS, AI_FORECASTS, AI_DECISIONS, AI_ANOMALIES, getBriefByModule } from '@hos/shared';
import { AIBrief } from '@/components/ai/AIBrief';
import { PatternCard } from '@/components/ai/PatternCard';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { DecisionsLedger } from '@/components/ai/DecisionsLedger';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';

const HOTEL_ID = 'BTRCI';

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
  const brief = getBriefByModule('intelligence')!;

  const patterns = AI_PATTERNS.filter((p) => p.affectedHotelIds.includes(HOTEL_ID));
  const forecasts = AI_FORECASTS.filter((f) => !f.hotelId || f.hotelId === HOTEL_ID);
  const decisions = AI_DECISIONS.filter((d) => d.hotelId === HOTEL_ID);
  const anomalies = AI_ANOMALIES.filter((a) => a.hotelId === HOTEL_ID);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Intelligence</h1>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>Home2 Baton Rouge</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          AI-surfaced patterns, forecasts, and decisions for your property
        </p>
      </div>

      <AIBrief brief={brief} />

      {anomalies.length > 0 && (
        <div>
          <SectionTitle subtitle="Live patterns AI has surfaced for this property">
            Active Findings
          </SectionTitle>
          <AIFlagsPanel findings={anomalies} title="" />
        </div>
      )}

      {patterns.length > 0 && (
        <div>
          <SectionTitle subtitle="Cross-portfolio patterns that touch this property">
            Patterns You're Part Of
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((p) => <PatternCard key={p.id} pattern={p} />)}
          </div>
        </div>
      )}

      <div>
        <SectionTitle subtitle="Projected outcomes under different scenarios">
          Forecasts &amp; Counterfactuals
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts.map((f) => <ForecastWidget key={f.id} forecast={f} />)}
        </div>
      </div>

      <div>
        <SectionTitle subtitle="Historical AI recommendations and your responses">
          Decisions Ledger
        </SectionTitle>
        {decisions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #dddddd' }}>
            <p className="text-sm" style={{ color: '#929292' }}>No recent AI decisions logged for this property.</p>
          </div>
        ) : (
          <DecisionsLedger entries={decisions} />
        )}
      </div>
    </div>
  );
}
