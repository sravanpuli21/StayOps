'use client';

import {
  ASSETS,
  ASSET_HOTEL_SUMMARIES,
  VENDOR_SPENDS,
} from '@hos/shared';
import { useRedFlags, useAnomalies, useAiCapexPredictions } from '@/lib/ai-data';
import { AssetSummaryCards } from '@/components/assets/AssetSummaryCards';
import { AssetHealthTable } from '@/components/assets/AssetHealthTable';
import { CapExPlanningSection } from '@/components/assets/CapExPlanningSection';
import { RepeatFailuresTable } from '@/components/assets/RepeatFailuresTable';
import { VendorSpendTable } from '@/components/assets/VendorSpendTable';
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

export default function AssetsPage() {
  const { hotels, hotelIdSet, scopeSub } = useScopedData();

  const rows = hotels.map((hotel) => ({
    hotel,
    summary: ASSET_HOTEL_SUMMARIES.find((s) => s.hotelId === hotel.id)!,
  }));
  const scopedSummaries = ASSET_HOTEL_SUMMARIES.filter((s) => hotelIdSet.has(s.hotelId));
  const scopedAssets = ASSETS.filter((a) => hotelIdSet.has(a.hotelId));
  const scopedCapex = useAiCapexPredictions().filter((p) => !('hotelId' in p) || hotelIdSet.has((p as { hotelId?: string }).hotelId ?? ''));

  const maintenanceAnomalies = useAnomalies().filter(
    (a) => a.module === 'maintenance' && hotelIdSet.has(a.hotelId),
  );
  const maintenanceFlags = useRedFlags().filter(
    (f) => f.module === 'maintenance' && (!('hotelId' in f) || hotelIdSet.has((f as { hotelId?: string }).hotelId ?? '')),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Assets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Asset Health · CapEx Planning</p>
      </div>

      <AssetSummaryCards summaries={scopedSummaries} />

      <CapExPlanningSection predictions={scopedCapex} />

      <div>
        <SectionTitle>Asset Health by Property</SectionTitle>
        <AssetHealthTable rows={rows} />
      </div>

      <div>
        <SectionTitle>Repeat Failures (3+ in 12 months)</SectionTitle>
        <RepeatFailuresTable assets={scopedAssets} />
      </div>

      <div>
        <SectionTitle>Top Vendor Spend</SectionTitle>
        <VendorSpendTable vendors={VENDOR_SPENDS} />
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
