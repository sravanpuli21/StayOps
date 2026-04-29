import {
  HOTELS,
  ASSETS,
  ASSET_HOTEL_SUMMARIES,
  VENDOR_SPENDS,
  AI_CAPEX_PREDICTIONS,
  RED_FLAGS,
  AI_ANOMALIES,
  getBriefByModule,
} from '@hos/shared';
import { AIBrief } from '@/components/ai/AIBrief';
import { AssetSummaryCards } from '@/components/assets/AssetSummaryCards';
import { AssetHealthTable } from '@/components/assets/AssetHealthTable';
import { CapExPlanningSection } from '@/components/assets/CapExPlanningSection';
import { RepeatFailuresTable } from '@/components/assets/RepeatFailuresTable';
import { VendorSpendTable } from '@/components/assets/VendorSpendTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function AssetsPage() {
  const brief = getBriefByModule('assets')!;

  const rows = HOTELS.map((hotel) => ({
    hotel,
    summary: ASSET_HOTEL_SUMMARIES.find((s) => s.hotelId === hotel.id)!,
  }));

  const maintenanceAnomalies = AI_ANOMALIES.filter((a) => a.module === 'maintenance');
  const maintenanceFlags = RED_FLAGS.filter((f) => f.module === 'maintenance');

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Assets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Portfolio Asset Health · CapEx Planning</p>
      </div>

      {/* AI Brief */}
      <AIBrief brief={brief} />

      {/* Summary cards */}
      <AssetSummaryCards summaries={ASSET_HOTEL_SUMMARIES} />

      {/* CapEx Planning — AI #16 */}
      <CapExPlanningSection predictions={AI_CAPEX_PREDICTIONS} />

      {/* Asset health by property */}
      <div>
        <SectionTitle>Asset Health by Property</SectionTitle>
        <AssetHealthTable rows={rows} />
      </div>

      {/* Repeat failures */}
      <div>
        <SectionTitle>Repeat Failures (3+ in 12 months)</SectionTitle>
        <RepeatFailuresTable assets={ASSETS} />
      </div>

      {/* Vendor spend */}
      <div>
        <SectionTitle>Top Vendor Spend</SectionTitle>
        <VendorSpendTable vendors={VENDOR_SPENDS} />
      </div>

      {/* AI-detected findings (maintenance module) */}
      {maintenanceAnomalies.length > 0 && (
        <AIFlagsPanel findings={maintenanceAnomalies} title="Maintenance AI Findings" />
      )}

      {/* Legacy static red flags (keep for module completeness) */}
      {maintenanceFlags.length > 0 && (
        <RedFlagsPanel flags={maintenanceFlags} title="Maintenance Red Flags" />
      )}
    </div>
  );
}
