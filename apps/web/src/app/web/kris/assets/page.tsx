'use client';

import { PROPERTY_VALUATIONS } from '@hos/shared';
import { useRedFlags, useAnomalies } from '@/lib/ai-data';
import { ValuationSummaryCards } from '@/components/valuation/ValuationSummaryCards';
import { ValuationByPropertyTable } from '@/components/valuation/ValuationByPropertyTable';
import { AppreciationRefinanceTable } from '@/components/valuation/AppreciationRefinanceTable';
import { ValueDragTable } from '@/components/valuation/ValueDragTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';
import { useScopedData } from '@/lib/use-scoped-data';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function ValuationPage() {
  const { hotels, hotelIdSet, scopeSub } = useScopedData();

  const valuations = PROPERTY_VALUATIONS.filter((v) => hotelIdSet.has(v.hotelId));
  const rows = hotels
    .map((hotel) => {
      const valuation = valuations.find((v) => v.hotelId === hotel.id);
      return valuation ? { hotel, valuation } : null;
    })
    .filter((r): r is { hotel: typeof hotels[number]; valuation: typeof valuations[number] } => r !== null);

  const maintenanceAnomalies = useAnomalies().filter(
    (a) => a.module === 'maintenance' && hotelIdSet.has(a.hotelId),
  );
  const maintenanceFlags = useRedFlags().filter(
    (f) => f.module === 'maintenance' && hotelIdSet.has(f.hotelId),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Valuation</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Portfolio Value · Appreciation · Refi Signals</p>
      </div>

      <ValuationSummaryCards valuations={valuations} />

      <div>
        <SectionTitle>Valuation by Property</SectionTitle>
        <ValuationByPropertyTable rows={rows} />
      </div>

      <div>
        <SectionTitle>Appreciation & Refinance Signals</SectionTitle>
        <AppreciationRefinanceTable rows={rows} />
      </div>

      <div>
        <SectionTitle>What's Dragging Value Down</SectionTitle>
        <p className="text-xs mb-3" style={{ color: '#929292' }}>
          Deferred maintenance and aging equipment translated into dollar drag and basis-point cost on cap rate.
        </p>
        <ValueDragTable rows={rows} />
      </div>

      {maintenanceAnomalies.length > 0 && (
        <AIFlagsPanel findings={maintenanceAnomalies} title="Maintenance AI Findings" />
      )}

      {maintenanceFlags.length > 0 && (
        <RedFlagsPanel flags={maintenanceFlags} title="Maintenance Red Flags" />
      )}
    </div>
  );
}
