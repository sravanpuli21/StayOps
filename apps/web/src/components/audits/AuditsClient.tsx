'use client';

import { useState, useMemo } from 'react';
import { HOTELS, getPortfolioAuditStats } from '@hos/shared';
import type { AuditAreaId } from '@hos/shared';
import { HotelAuditView } from './HotelAuditView';
import { RoomAuditPanel } from './RoomAuditPanel';
import { AreaHistoryPanel } from './AreaHistoryPanel';
import { AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

// ── Panel stack ────────────────────────────────────────────────────────────────

type PanelFrame =
  | { kind: 'room'; hotelId: string; roomNumber: string }
  | { kind: 'area'; hotelId: string; roomNumber: string; areaId: AuditAreaId };

// ── Portfolio KPI cards ────────────────────────────────────────────────────────

function PortfolioKPIs() {
  const stats = useMemo(() => getPortfolioAuditStats(), []);
  const kpis = [
    {
      label: 'Compliance Rate',
      value: `${stats.compliancePct}%`,
      sub: `${stats.totalCurrent} of ${stats.totalRooms} rooms current`,
      color: stats.compliancePct >= 80 ? '#22c55e' : stats.compliancePct >= 65 ? '#f59e0b' : '#ef4444',
      bg: stats.compliancePct >= 80 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
    },
    {
      label: 'Overdue Rooms',
      value: stats.totalOverdue.toString(),
      sub: `across ${stats.hotelSummaries.filter((h) => h.overdueRooms > 0).length} hotels`,
      color: stats.totalOverdue === 0 ? '#22c55e' : '#ef4444',
      bg: stats.totalOverdue === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
    },
    {
      label: 'Due Soon',
      value: stats.totalDueSoon.toString(),
      sub: 'within 14 days',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'Overdue Areas',
      value: stats.totalOverdueAreas.toString(),
      sub: 'individual audit areas',
      color: stats.totalOverdueAreas === 0 ? '#22c55e' : '#b91c1c',
      bg: stats.totalOverdueAreas === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 px-8 py-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl px-5 py-4"
          style={{ background: k.bg, border: '1px solid ' + k.color + '30' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#929292' }}>{k.label}</p>
          <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Hotel table ────────────────────────────────────────────────────────────────

function ComplianceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#ebebeb', minWidth: 60 }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-9 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

function HotelTable({ onHotelClick }: { onHotelClick: (hotelId: string) => void }) {
  const stats = useMemo(() => getPortfolioAuditStats(), []);

  const rows = stats.hotelSummaries.map((s) => ({
    ...s,
    hotel: HOTELS.find((h) => h.id === s.hotelId)!,
  })).sort((a, b) => a.compliancePct - b.compliancePct); // worst first

  return (
    <div className="px-8 pb-6">
      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
        Properties — sorted by compliance (worst first)
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Property</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Rooms</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>Overdue</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>Due Soon</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#22c55e' }}>Current</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#929292', minWidth: 140 }}>Compliance</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Overdue Areas</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.hotelId}
                className="cursor-pointer hover:bg-[#fafafa] transition-colors"
                style={{ borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : undefined }}
                onClick={() => onHotelClick(row.hotelId)}
              >
                <td className="px-5 py-3">
                  <p className="text-sm font-semibold" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{row.hotel.brand} · {row.hotel.city}, {row.hotel.state}</p>
                </td>
                <td className="px-4 py-3 text-center text-sm font-medium" style={{ color: '#6a6a6a' }}>{row.totalRooms}</td>
                <td className="px-4 py-3 text-center">
                  {row.overdueRooms > 0
                    ? <span className="text-sm font-bold" style={{ color: '#ef4444' }}>{row.overdueRooms}</span>
                    : <span className="text-sm" style={{ color: '#c1c1c1' }}>—</span>
                  }
                </td>
                <td className="px-4 py-3 text-center">
                  {row.dueSoonRooms > 0
                    ? <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{row.dueSoonRooms}</span>
                    : <span className="text-sm" style={{ color: '#c1c1c1' }}>—</span>
                  }
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>{row.currentRooms}</span>
                </td>
                <td className="px-4 py-3" style={{ minWidth: 140 }}>
                  <ComplianceBar pct={row.compliancePct} />
                </td>
                <td className="px-4 py-3 text-right">
                  {row.overdueAreas > 0
                    ? <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.10)', color: '#b91c1c' }}>{row.overdueAreas} areas</span>
                    : <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.10)', color: '#15803d' }}>All clear</span>
                  }
                </td>
                <td className="pr-4">
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#c1c1c1' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Portfolio view ─────────────────────────────────────────────────────────────

function PortfolioView({ onHotelClick }: { onHotelClick: (hotelId: string) => void }) {
  return (
    <div>
      <PortfolioKPIs />
      <div className="px-8 pt-5">
        <HotelTable onHotelClick={onHotelClick} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type ViewLevel = { level: 'portfolio' } | { level: 'hotel'; hotelId: string };

export function AuditsClient() {
  const [view, setView] = useState<ViewLevel>({ level: 'portfolio' });
  const [panelStack, setPanelStack] = useState<PanelFrame[]>([]);

  const push = (frame: PanelFrame) => setPanelStack((s) => [...s, frame]);
  const pop = () => setPanelStack((s) => s.slice(0, -1));
  const closeAll = () => setPanelStack([]);

  const activePanel = panelStack[panelStack.length - 1] ?? null;
  const prevPanel = panelStack[panelStack.length - 2] ?? null;

  const handleHotelClick = (hotelId: string) => {
    setView({ level: 'hotel', hotelId });
    closeAll();
  };

  const handleRoomClick = (roomNumber: string) => {
    if (view.level !== 'hotel') return;
    push({ kind: 'room', hotelId: view.hotelId, roomNumber });
  };

  const handleAreaClick = (areaId: AuditAreaId) => {
    if (activePanel?.kind !== 'room') return;
    push({ kind: 'area', hotelId: activePanel.hotelId, roomNumber: activePanel.roomNumber, areaId });
  };

  const backLabel = prevPanel?.kind === 'room' ? `Room ${prevPanel.roomNumber}` : undefined;
  const onBack = panelStack.length > 1 ? pop : undefined;

  return (
    <div className="relative">
      {view.level === 'portfolio'
        ? <PortfolioView onHotelClick={handleHotelClick} />
        : (
          <HotelAuditView
            hotelId={view.hotelId}
            onBack={() => { setView({ level: 'portfolio' }); closeAll(); }}
            onRoomClick={handleRoomClick}
          />
        )
      }

      <RoomAuditPanel
        hotelId={activePanel?.kind === 'room' ? activePanel.hotelId : null}
        roomNumber={activePanel?.kind === 'room' ? activePanel.roomNumber : null}
        onClose={closeAll}
        onAreaClick={handleAreaClick}
        backLabel={undefined}
        onBack={undefined}
      />

      <AreaHistoryPanel
        hotelId={activePanel?.kind === 'area' ? activePanel.hotelId : null}
        roomNumber={activePanel?.kind === 'area' ? activePanel.roomNumber : null}
        areaId={activePanel?.kind === 'area' ? activePanel.areaId : null}
        onClose={closeAll}
        backLabel={backLabel}
        onBack={onBack}
      />
    </div>
  );
}
