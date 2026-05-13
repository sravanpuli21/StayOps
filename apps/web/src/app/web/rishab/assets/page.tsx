'use client';

import {
  HOTELS, ASSETS, ASSET_HOTEL_SUMMARIES, VENDOR_SPENDS,
} from '@hos/shared';
import { useRedFlags, useAnomalies, useAiCapexPredictions } from '@/lib/ai-data';
import { AssetSummaryCards } from '@/components/assets/AssetSummaryCards';
import { AssetHealthTable } from '@/components/assets/AssetHealthTable';
import { CapExPlanningSection } from '@/components/assets/CapExPlanningSection';
import { RepeatFailuresTable } from '@/components/assets/RepeatFailuresTable';
import { VendorSpendTable } from '@/components/assets/VendorSpendTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';

const HOTEL_ID = 'BTRCI';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function AssetsPage() {
  const hotel = HOTELS.find((h) => h.id === HOTEL_ID)!;
  const summary = ASSET_HOTEL_SUMMARIES.find((s) => s.hotelId === HOTEL_ID);
  const summaries = summary ? [summary] : [];
  const assets = ASSETS.filter((a) => a.hotelId === HOTEL_ID);
  const capexPredictions = useAiCapexPredictions().filter((p) => p.affectedHotelIds.includes(HOTEL_ID));
  const vendors = VENDOR_SPENDS
    .map((v) => ({ ...v, hotelIds: v.hotelIds.filter((id) => id === HOTEL_ID) }))
    .filter((v) => v.hotelIds.length > 0);
  const maintenanceAnomalies = useAnomalies().filter(
    (a) => a.module === 'maintenance' && a.hotelId === HOTEL_ID
  );
  const maintenanceFlags = useRedFlags().filter(
    (f) => f.module === 'maintenance' && f.hotelId === HOTEL_ID
  );

  const rows = [{ hotel, summary: summary! }];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Assets</h1>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>Home2 Baton Rouge</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Property assets · CapEx · repeat failures
        </p>
      </div>

      {summaries.length > 0 && <AssetSummaryCards summaries={summaries} />}

      {capexPredictions.length > 0 && <CapExPlanningSection predictions={capexPredictions} />}

      <div>
        <SectionTitle>Asset Inventory</SectionTitle>
        <AssetHealthTable rows={rows} />
      </div>

      <div>
        <SectionTitle>Repeat Failures (3+ in 12 months)</SectionTitle>
        <RepeatFailuresTable assets={assets} />
      </div>

      <div>
        <SectionTitle>Vendor Spend</SectionTitle>
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
