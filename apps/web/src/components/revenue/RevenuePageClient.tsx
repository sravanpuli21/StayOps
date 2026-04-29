'use client';

import { useState } from 'react';
import type { Hotel, RevenueSummary, LabourMetrics, DailyMetrics, AnomalyFinding, Forecast, ModuleBrief } from '@hos/shared';
import { UnderlineTabs } from '@/components/common/UnderlineTabs';
import { FilterPillRow } from '@/components/common/FilterPillRow';
import { KpiCard } from '@/components/common/KpiCard';
import { ComparisonBars } from '@/components/common/ComparisonBars';
import { DonutPair } from '@/components/common/DonutPair';
import { AIBrief } from '@/components/ai/AIBrief';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { HotelRevenueTable } from '@/components/revenue/HotelRevenueTable';
import { RevenueMixTable } from '@/components/revenue/RevenueMixTable';
import { OpportunityLeakageTable } from '@/components/revenue/OpportunityLeakageTable';
import { RevLabourEfficiencyTable } from '@/components/revenue/RevLabourEfficiencyTable';
import { PricingPowerTable } from '@/components/revenue/PricingPowerTable';
import type { RingCompare } from '@hos/shared';

interface Props {
  revenueRows: Array<{ hotel: Hotel; revenue: RevenueSummary }>;
  efficiencyRows: Array<{ hotel: Hotel; revenue: RevenueSummary; labour: LabourMetrics }>;
  leakageRows: Array<{ hotel: Hotel; revenue: RevenueSummary; daily: DailyMetrics }>;
  anomalies: AnomalyFinding[];
  forecast: Forecast;
  brief: ModuleBrief;
  stly: {
    totalRevenue: { formattedStly: string; changePct: number };
    roomRevenue:  { formattedStly: string; changePct: number };
    nonRoom:      { formattedStly: string; changePct: number };
    occupancy:    { formattedStly: string; changePct: number };
    adr:          { formattedStly: string; changePct: number };
    revPar:       { formattedStly: string; changePct: number };
  };
  history: {
    totalRevenue: number[];
    roomRevenue: number[];
    occupancy: number[];
    adr: number[];
    revPar: number[];
    nonRoom: number[];
  };
  currentValues: {
    totalRevenue: string;
    roomRevenue: string;
    nonRoom: string;
    occupancy: string;
    adr: string;
    revPar: string;
  };
  occupancyRings: RingCompare[];
}

const TABS = [
  { label: 'Overview',    value: 'overview' },
  { label: 'Rate',        value: 'rate' },
  { label: 'Mix',         value: 'mix' },
  { label: 'Opportunity', value: 'opportunity' },
  { label: 'Pricing',     value: 'pricing' },
  { label: 'Efficiency',  value: 'efficiency' },
];

export function RevenuePageClient({
  revenueRows,
  efficiencyRows,
  leakageRows,
  anomalies,
  forecast,
  brief,
  stly,
  history,
  currentValues,
  occupancyRings,
}: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState([
    { label: 'Period',     value: 'Yesterday' },
    { label: 'Properties', value: 'All 16' },
    { label: 'Comparison', value: 'vs prev week' },
  ]);

  const removeFilter = (label: string) => {
    setFilters((f) => f.filter((x) => x.label !== label));
  };

  // Revenue OTB vs LY (portfolio)
  const totalRevCurrent = 291520;
  const totalRevLY = 278150;
  const monthForecastCurrent = 312000;
  const monthForecastLY = 298500;

  return (
    <div className="flex flex-col gap-6">
      <AIBrief brief={brief} />

      <FilterPillRow
        filters={filters.map((f) => ({ ...f, onRemove: () => removeFilter(f.label) }))}
      />

      <UnderlineTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-6 gap-3">
            <KpiCard
              label="Total Revenue"
              value={currentValues.totalRevenue}
              change={{ pct: stly.totalRevenue.changePct, direction: stly.totalRevenue.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.totalRevenue.formattedStly}
              sparkline={history.totalRevenue}
            />
            <KpiCard
              label="Room Revenue"
              value={currentValues.roomRevenue}
              change={{ pct: stly.roomRevenue.changePct, direction: stly.roomRevenue.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.roomRevenue.formattedStly}
              sparkline={history.roomRevenue}
            />
            <KpiCard
              label="Non-Room"
              value={currentValues.nonRoom}
              change={{ pct: stly.nonRoom.changePct, direction: stly.nonRoom.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.nonRoom.formattedStly}
              sparkline={history.nonRoom}
            />
            <KpiCard
              label="Occupancy"
              value={currentValues.occupancy}
              change={{ pct: stly.occupancy.changePct, direction: stly.occupancy.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.occupancy.formattedStly}
              sparkline={history.occupancy}
            />
            <KpiCard
              label="ADR"
              value={currentValues.adr}
              change={{ pct: stly.adr.changePct, direction: stly.adr.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.adr.formattedStly}
              sparkline={history.adr}
            />
            <KpiCard
              label="RevPAR"
              value={currentValues.revPar}
              change={{ pct: stly.revPar.changePct, direction: stly.revPar.changePct >= 0 ? 'up' : 'down' }}
              stly={stly.revPar.formattedStly}
              sparkline={history.revPar}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="bg-white p-6"
              style={{ borderRadius: 14, border: '1px solid #dddddd' }}
            >
              <p className="text-base font-semibold mb-4" style={{ color: '#222' }}>
                Revenue — OTB vs Month Forecast
              </p>
              <div className="flex flex-col gap-4">
                <ComparisonBars
                  label="OTB vs LY"
                  current={{ value: totalRevCurrent, formatted: '$291,520' }}
                  previous={{ value: totalRevLY, formatted: '$278,150' }}
                  changePct={stly.totalRevenue.changePct}
                  accent="primary"
                />
                <ComparisonBars
                  label="Month forecast vs LY"
                  current={{ value: monthForecastCurrent, formatted: '$312,000' }}
                  previous={{ value: monthForecastLY, formatted: '$298,500' }}
                  changePct={4.5}
                  accent="secondary"
                />
              </div>
            </div>

            <div
              className="bg-white p-6"
              style={{ borderRadius: 14, border: '1px solid #dddddd' }}
            >
              <p className="text-base font-semibold mb-4" style={{ color: '#222' }}>
                Occupancy
              </p>
              <DonutPair rings={occupancyRings} size={130} />
            </div>
          </div>

          <ForecastWidget forecast={forecast} />
        </>
      )}

      {activeTab === 'rate' && <HotelRevenueTable rows={revenueRows} />}
      {activeTab === 'mix' && <RevenueMixTable rows={revenueRows} />}
      {activeTab === 'opportunity' && <OpportunityLeakageTable rows={leakageRows} />}
      {activeTab === 'pricing' && <PricingPowerTable rows={revenueRows} />}
      {activeTab === 'efficiency' && <RevLabourEfficiencyTable rows={efficiencyRows} />}

      <AIFlagsPanel findings={anomalies} title="Revenue AI Findings" />
    </div>
  );
}
