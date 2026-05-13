'use client';

import {
  ASSETS, ASSET_HOTEL_SUMMARIES, VENDOR_SPENDS,
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
  const summaries = ASSET_HOTEL_SUMMARIES.filter((s) => hotelIdSet.has(s.hotelId));
  const assets = ASSETS.filter((a) => hotelIdSet.has(a.hotelId));
  const capexPredictions = useAiCapexPredictions().filter(
    (p) => p.affectedHotelIds.some((id: string) => hotelIdSet.has(id)),
  );
  const vendors = VENDOR_SPENDS
    .map((v) => ({ ...v, hotelIds: v.hotelIds.filter((id) => hotelIdSet.has(id)) }))
    .filter((v) => v.hotelIds.length > 0);
  const maintenanceAnomalies = useAnomalies().filter(
    (a) => a.module === 'maintenance' && hotelIdSet.has(a.hotelId),
  );
  const maintenanceFlags = useRedFlags().filter(
    (f) => f.module === 'maintenance' && hotelIdSet.has(f.hotelId),
  );

  const rows = hotels.map((hotel) => ({
    hotel,
    summary: summaries.find((s) => s.hotelId === hotel.id)!,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Assets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Asset Health · CapEx Planning</p>
      </div>

      <AssetSummaryCards summaries={summaries} />

      {capexPredictions.length > 0 && <CapExPlanningSection predictions={capexPredictions} />}

      <div>
        <SectionTitle>Asset Health by Property</SectionTitle>
        <AssetHealthTable rows={rows} hrefPrefix="/web/harshal/hotel" />
      </div>

      <div>
        <SectionTitle>Repeat Failures (3+ in 12 months)</SectionTitle>
        <RepeatFailuresTable assets={assets} />
      </div>

      <div>
        <SectionTitle>Top Vendor Spend</SectionTitle>
        <VendorSpendTable vendors={vendors} />
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
