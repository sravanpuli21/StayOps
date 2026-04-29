import { AI_PATTERNS, AI_FORECASTS, AI_DECISIONS, getBriefByModule } from '@hos/shared';
import { AIBrief } from '@/components/ai/AIBrief';
import { PatternCard } from '@/components/ai/PatternCard';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { DecisionsLedger } from '@/components/ai/DecisionsLedger';

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

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Cross-portfolio patterns, forecasts, and decisions — all AI-generated
        </p>
      </div>

      {/* Executive brief */}
      <AIBrief brief={brief} />

      {/* Cross-portfolio patterns */}
      <div>
        <SectionTitle subtitle="Signals the AI surfaced by comparing across all 16 properties">
          Cross-Portfolio Patterns
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AI_PATTERNS.map((p) => <PatternCard key={p.id} pattern={p} />)}
        </div>
      </div>

      {/* Forecasts */}
      <div>
        <SectionTitle subtitle="Projected outcomes under different scenarios">
          Forecasts & Counterfactuals
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_FORECASTS.map((f) => <ForecastWidget key={f.id} forecast={f} />)}
        </div>
      </div>

      {/* Decisions ledger */}
      <div>
        <SectionTitle subtitle="Institutional memory — every approved, rejected, or overridden recommendation">
          Decisions Ledger
        </SectionTitle>
        <DecisionsLedger entries={AI_DECISIONS} />
      </div>
    </div>
  );
}
