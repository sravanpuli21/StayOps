/**
 * Shared light-mode mock screens for /website/trail/newcontent/{night,daylight}.
 *
 * These mirror the real StayOps app exactly — same KpiCard shape, the same
 * #f7f7f7 / #ffffff / #dddddd / #ff385c tokens, the same PortfolioTable layout,
 * the same HealthBadge colours. Both website flavors render the IDENTICAL
 * mocks; only the section background changes around them.
 *
 * The "screen frame" wrapper gives each mock a window-chrome look so it reads
 * as a captured product surface.
 */
import {
  ChevronUp, ChevronsUpDown, Building2, Bed, AlertTriangle, ChevronRight,
  ChevronLeft, FileText, Wrench, Sparkles, DollarSign, Calendar, CheckCircle2,
  Clock, Image as ImageIcon, Star, Package, X, Search, TrendingUp,
} from 'lucide-react';

/* ─── Health colours (match apps/web/src/components/common/HealthBadge.tsx) ─── */
const HEALTH = {
  green: { dot: '#16a34a', bg: '#f0fdf4', text: '#15803d', label: 'Healthy' },
  amber: { dot: '#d97706', bg: '#fffbeb', text: '#b45309', label: 'Monitor' },
  red:   { dot: '#dc2626', bg: '#fef2f2', text: '#b91c1c', label: 'At Risk' },
} as const;

function HealthPill({ h }: { h: keyof typeof HEALTH }) {
  const c = HEALTH[h];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

/* ─── Window chrome wrapper — gives the mock a "captured screen" feel ─── */
function ScreenFrame({
  children,
  label,
  shadow = '0 30px 70px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
}: {
  children: React.ReactNode;
  label: string;
  shadow?: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid #dddddd',
        boxShadow: shadow,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-[11px] font-medium" style={{ color: '#929292' }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ─── Mini KpiCard — exactly mirrors components/common/KpiCard.tsx ─── */
function MiniKpi({
  label, value, subtext, alert = false, large = false,
}: { label: string; value: string; subtext?: string; alert?: boolean; large?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-1 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: alert ? '1px solid #d97706' : '1px solid #dddddd',
        boxShadow: alert
          ? '0 0 0 3px rgba(217,119,6,0.1)'
          : 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
        {label}
      </p>
      <p
        className={`font-bold leading-none ${large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
        style={{ color: '#222222' }}
      >
        {value}
      </p>
      {subtext && (
        <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

/* ============================================================
 *  PortfolioMock — placed after Hero. Mirrors Kris's dashboard.
 * ============================================================ */
export function PortfolioMock() {
  const rows = [
    { name: 'Home2 Suites - Baton Rouge',         meta: 'Baton Rouge, LA · Hilton',  rooms: 116, occ: '83%', rev: '$24.3K',  health: 'green' as const },
    { name: 'Hilton Garden Inn - Midtown',        meta: 'Savannah, GA · Hilton',     rooms: 132, occ: '77%', rev: '$17.6K',  health: 'amber' as const },
    { name: 'Fairfield/TPS - Pooler, GA',         meta: 'Pooler, GA · Marriott',     rooms: 158, occ: '91%', rev: '$29.4K',  health: 'green' as const },
    { name: 'Woodspring - Brunswick',             meta: 'Brunswick, GA · Choice',    rooms: 122, occ: '74%', rev: '$15.8K',  health: 'red'   as const },
    { name: 'Home2 Suites - Flower Mound TX',     meta: 'Flower Mound, TX · Hilton', rooms:  99, occ: '85%', rev: '$13.7K',  health: 'green' as const },
  ];
  const thClass = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <ScreenFrame label="StayOps · Portfolio Dashboard · Yesterday">
      {/* KPI row — large size to match dashboard */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5"
        style={{ background: '#f7f7f7' }}
      >
        <MiniKpi label="Occupancy"     value="83.4%"   subtext="1,243 of 1,490 sold" large />
        <MiniKpi label="Room Revenue"  value="$1.04M"  subtext="Rooms only, excl. F&B"  large />
        <MiniKpi label="Total Revenue" value="$1.24M"  subtext="All revenue streams"     large />
        <MiniKpi label="Rooms Not Sold" value="247"    subtext="11 rooms out of order" alert large />
      </div>

      {/* Mini PortfolioTable */}
      <div className="overflow-x-auto" style={{ background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={thClass} style={{ color: '#6a6a6a' }}>
                Property <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
              </th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>
                Rooms <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />
              </th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>
                Occ % <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />
              </th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>
                Revenue <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />
              </th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.name}
                className="transition-colors hover:bg-[#fafafa]"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#222222' }}>{r.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{r.meta}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.rooms}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.occ}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.rev}</td>
                <td className="py-3 px-4"><HealthPill h={r.health} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  RoomDrillMock — operations drill-down: hotel selected, multi-floor
 *  room grid on the left, comprehensive room detail panel on the right
 *  (room 608 selected). Mirrors /web/kris/operations PropertyView.
 * ============================================================ */
export function RoomDrillMock() {
  const TILE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
    ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
    inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting' },
    dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
    occupied:   { bg: '#f9fafb', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
    ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
    blocked:    { bg: '#fef2f2', border: '#e11d48', dot: '#e11d48', label: 'Blocked' },
  };

  type S = keyof typeof TILE;
  type Tile = { num: string; status: S; tickets?: number; selected?: boolean };

  const floor6: Tile[] = [
    { num: '601', status: 'ready' },     { num: '602', status: 'ready' },      { num: '603', status: 'ready' },
    { num: '604', status: 'ooo' },       { num: '605', status: 'ready' },      { num: '606', status: 'occupied' },
    { num: '607', status: 'ready' },     { num: '608', status: 'occupied', selected: true }, { num: '609', status: 'ready' },
  ];
  const floor5: Tile[] = [
    { num: '501', status: 'dirty' },     { num: '502', status: 'dirty' },      { num: '503', status: 'inspecting' },
    { num: '504', status: 'inspecting' },{ num: '505', status: 'inspecting' }, { num: '506', status: 'occupied' },
    { num: '507', status: 'inspecting' },{ num: '508', status: 'ooo' },        { num: '509', status: 'inspecting' },
  ];
  const floor4: Tile[] = [
    { num: '401', status: 'occupied' },  { num: '402', status: 'occupied' },   { num: '403', status: 'ready' },
    { num: '404', status: 'occupied' },  { num: '405', status: 'ready', tickets: 1 }, { num: '406', status: 'occupied' },
    { num: '407', status: 'ready' },     { num: '408', status: 'occupied' },   { num: '409', status: 'ready' },
  ];
  const floor3: Tile[] = [
    { num: '301', status: 'occupied' },  { num: '302', status: 'occupied' },   { num: '303', status: 'occupied' },
    { num: '304', status: 'blocked' },   { num: '305', status: 'occupied' },   { num: '306', status: 'dirty' },
    { num: '307', status: 'dirty' },     { num: '308', status: 'occupied' },   { num: '309', status: 'occupied' },
  ];
  const floor2: Tile[] = [
    { num: '201', status: 'occupied' },  { num: '202', status: 'occupied' },   { num: '203', status: 'occupied' },
    { num: '204', status: 'occupied' },  { num: '205', status: 'blocked' },    { num: '206', status: 'occupied' },
    { num: '207', status: 'occupied' },  { num: '208', status: 'occupied' },   { num: '209', status: 'occupied' },
  ];

  const renderFloor = (label: string, tiles: Tile[]) => (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#929292' }}>
        {label}
      </p>
      <div className="grid grid-cols-9 gap-1.5">
        {tiles.map((t) => {
          const cfg = TILE[t.status];
          return (
            <div key={t.num} className="relative rounded-lg flex flex-col items-center justify-center py-2"
              style={{
                background: cfg.bg,
                border: t.selected ? '2px solid #ff385c' : `1px solid ${cfg.border}`,
                boxShadow: t.selected
                  ? '0 0 0 2px rgba(255,56,92,0.18), 0 4px 10px -4px rgba(255,56,92,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.04), 0 2px 6px -2px rgba(0,0,0,0.05)',
              }}>
              <span className="text-[11px] font-bold leading-none" style={{ color: '#222' }}>{t.num}</span>
              <span className="mt-1 w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {t.tickets ? (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white"
                  style={{ background: '#ff385c' }}>
                  {t.tickets}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <IpadFrame>
      <div className="relative" style={{ background: '#ffffff' }}>
        {/* MAIN: hotel header + pills + floor grids — full width */}
        <div className="p-4 sm:p-5 pr-[360px]">
          <p className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: '#ff385c' }}>
            <ChevronLeft className="w-3 h-3" />Portfolio
          </p>
          <h3 className="mt-1 text-base font-bold" style={{ color: '#222' }}>
            Hampton Inn &amp; Suites — Gateway
          </h3>
          <p className="text-[11px]" style={{ color: '#929292' }}>Savannah, GA · Hilton · 92 rooms</p>

          {/* Status summary pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { c: 'ready' as S,      n: 11 },
              { c: 'inspecting' as S, n: 9 },
              { c: 'dirty' as S,      n: 16 },
              { c: 'blocked' as S,    n: 7 },
              { c: 'ooo' as S,        n: 8 },
              { c: 'occupied' as S,   n: 41 },
            ].map((p) => {
              const cfg = TILE[p.c];
              return (
                <span key={p.c}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: cfg.bg, color: '#222', border: `1px solid ${cfg.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {p.n} {cfg.label}
                </span>
              );
            })}
          </div>

          {/* Room grid label */}
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#929292' }}>
            Room Grid
          </p>

          {/* Floors — fill the space with all visible floors */}
          <div className="mt-3 flex flex-col gap-3.5">
            {renderFloor('Floor 6', floor6)}
            {renderFloor('Floor 5', floor5)}
            {renderFloor('Floor 4', floor4)}
            {renderFloor('Floor 3', floor3)}
            {renderFloor('Floor 2', floor2)}
          </div>
        </div>

        {/* SCRIM: dark dim + blur the rooms behind the open panel */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(0.5px)',
            WebkitBackdropFilter: 'blur(0.5px)',
          }} />

        {/* SLIDE PANEL: Room 608 detail — overlays the grid */}
        <div className="absolute right-0 top-0 bottom-0 w-[340px] z-20 p-4 sm:p-5 overflow-y-auto"
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #eaeaea',
            boxShadow: '-20px 0 40px -16px rgba(0,0,0,0.12)',
          }}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold" style={{ color: '#222' }}>Room 608</p>
              <p className="text-[11px]" style={{ color: '#6a6a6a' }}>King · Floor 6 · Hampton Gateway</p>
            </div>
            <X className="w-3.5 h-3.5 mt-1" style={{ color: '#929292' }} />
          </div>

          {/* Status pill */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#94a3b8' }} />
              Occupied
            </span>
          </div>

          {/* 2x2 stats card */}
          <div className="mt-3 rounded-lg p-3 grid grid-cols-2 gap-x-3 gap-y-3"
            style={{ background: '#fff', border: '1px solid #eee' }}>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Last cleaned</p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color: '#222' }}>Apr 25, 8:30 AM</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Last inspected</p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color: '#222' }}>—</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>HK status</p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color: '#222' }}>Clean</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Last guest rating</p>
              <p className="mt-0.5 text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: '#222' }}>
                <Star className="w-3 h-3" style={{ fill: '#f59e0b', color: '#f59e0b' }} />4.7
              </p>
            </div>
          </div>

          {/* Open tickets */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#929292' }}>
              Open Tickets (0)
            </p>
            <p className="mt-1 text-[11px]" style={{ color: '#6a6a6a' }}>No open tickets</p>
          </div>

          {/* Audit history */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#929292' }}>
              Audit History
            </p>
            <div className="mt-1.5 flex flex-col gap-2">
              <div className="rounded-md p-2" style={{ background: '#fff', border: '1px solid #eee' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#15803d' }}>Passed</span>
                    <span className="text-[10px] font-bold" style={{ color: '#222' }}>94/100</span>
                  </div>
                  <span className="text-[9px]" style={{ color: '#929292' }}>Mar 25, 2026</span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: '#222' }}>Quarterly Room Inspection</p>
              </div>
              <div className="rounded-md p-2" style={{ background: '#fff', border: '1px solid #eee' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#15803d' }}>Passed</span>
                    <span className="text-[10px] font-bold" style={{ color: '#222' }}>85/100</span>
                  </div>
                  <span className="text-[9px]" style={{ color: '#929292' }}>Jan 10, 2026</span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: '#222' }}>Quarterly Room Inspection</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  <li className="text-[10px]" style={{ color: '#6a6a6a' }}>• Bathroom grout needs resealing</li>
                  <li className="text-[10px]" style={{ color: '#6a6a6a' }}>• Shower head showing early scale</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] inline-flex items-center gap-1.5"
              style={{ color: '#929292' }}>
              <Package className="w-3 h-3" />Inventory (14 items)
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              <div className="rounded-md p-2"
                style={{ background: '#fff', border: '1px solid #eee' }}>
                <p className="text-[11px] font-medium" style={{ color: '#222' }}>AC/PTAC Unit</p>
                <p className="text-[10px]" style={{ color: '#b91c1c' }}>Poor &nbsp;·&nbsp; <span style={{ color: '#6a6a6a' }}>3 repairs · $490</span></p>
              </div>
              <div className="rounded-md p-2"
                style={{ background: '#fff', border: '1px solid #eee' }}>
                <p className="text-[11px] font-medium" style={{ color: '#222' }}>55&quot; Smart TV (Samsung)</p>
                <p className="text-[10px]" style={{ color: '#15803d' }}>Good</p>
              </div>
              <div className="rounded-md p-2"
                style={{ background: '#fff', border: '1px solid #eee' }}>
                <p className="text-[11px] font-medium" style={{ color: '#222' }}>King/Queen Bed Frame</p>
                <p className="text-[10px]" style={{ color: '#15803d' }}>Good</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IpadFrame>
  );
}

/* ============================================================
 *  MaintenanceSpendMock — repair spend rollup, top spenders, status
 * ============================================================ */
export function MaintenanceSpendMock() {
  const rows = [
    { asset: 'AC condenser',  loc: 'Hilton Garden Midtown · Rm 214',     ytd: '$4,580', last: '6d ago',  st: 'red'   as const },
    { asset: 'Hot water tap', loc: 'Home2 Baton Rouge · Rm 101',         ytd: '$1,890', last: '14d ago', st: 'amber' as const },
    { asset: 'Boiler',        loc: 'Fairfield Pooler · Mech room',       ytd: '$3,200', last: '30d ago', st: 'green' as const },
    { asset: 'Toilet flush',  loc: 'Woodspring Brunswick · Rm 103',      ytd: '$720',   last: '8d ago',  st: 'green' as const },
    { asset: 'Door lock',     loc: 'Hilton Midtown · Rm 410',            ytd: '$610',   last: '2d ago',  st: 'amber' as const },
  ];
  const thClass = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
  return (
    <ScreenFrame label="StayOps · Maintenance Spend · Year to Date">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5" style={{ background: '#f7f7f7' }}>
        <MiniKpi label="Repair Spend YTD" value="$84.2K" subtext="across 16 properties" />
        <MiniKpi label="Open Tickets"      value="23"     subtext="4 aging > 5 days" alert />
        <MiniKpi label="Avg Cost / Ticket" value="$612"   subtext="−8% vs last year" />
      </div>

      <div style={{ background: '#ffffff' }}>
        <div className="px-4 py-2.5 flex items-center justify-between"
          style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Top spenders · YTD
          </p>
          <span className="text-xs font-semibold" style={{ color: '#ff385c' }}>1 asset draining budget</span>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Asset</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>YTD <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} /></th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Last fix</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.asset} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="text-sm font-medium" style={{ color: '#222222' }}>{r.asset}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{r.loc}</p>
                </td>
                <td className="py-3 px-4 text-sm font-semibold" style={{ color: '#222222' }}>{r.ytd}</td>
                <td className="py-3 px-4 text-sm" style={{ color: '#3f3f3f' }}>{r.last}</td>
                <td className="py-3 px-4"><HealthPill h={r.st} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  FfeAuditMock — Asset-level lifecycle drill-down. Mirrors the
 *  /web/kris/operations asset detail panel: Cotton Sail Hotel grid
 *  on the left, AC/PTAC unit asset detail on the right (warranty +
 *  useful life bars, tabs, repair history, inspections, replacements).
 * ============================================================ */
export function FfeAuditMock() {
  const TILE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
    ready:    { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
    dirty:    { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
    occupied: { bg: '#f9fafb', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
    ooo:      { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
  };

  type S = keyof typeof TILE;
  type Tile = { num: string; status: S; tickets?: number; selected?: boolean };

  // Cotton Sail Hotel — 5 floors visible (same size as Room Drill).
  // Selected: Room 312 (hidden behind the slide panel, which shows the
  // AC/PTAC Unit drilled-into from that room).
  const floor5: Tile[] = [
    { num: '501', status: 'occupied' }, { num: '502', status: 'occupied' }, { num: '503', status: 'occupied' },
    { num: '504', status: 'ready' },    { num: '505', status: 'occupied' }, { num: '506', status: 'occupied' },
    { num: '507', status: 'occupied' }, { num: '508', status: 'occupied' }, { num: '509', status: 'ooo' },
  ];
  const floor4: Tile[] = [
    { num: '401', status: 'occupied' }, { num: '402', status: 'occupied' }, { num: '403', status: 'occupied' },
    { num: '404', status: 'occupied' }, { num: '405', status: 'occupied' }, { num: '406', status: 'occupied' },
    { num: '407', status: 'occupied' }, { num: '408', status: 'occupied' }, { num: '409', status: 'occupied' },
  ];
  const floor3: Tile[] = [
    { num: '301', status: 'dirty' }, { num: '302', status: 'dirty' }, { num: '303', status: 'dirty' },
    { num: '304', status: 'dirty' }, { num: '305', status: 'dirty' }, { num: '306', status: 'dirty' },
    { num: '307', status: 'dirty' }, { num: '308', status: 'dirty' }, { num: '309', status: 'dirty' },
  ];
  const floor2: Tile[] = [
    { num: '201', status: 'ready' }, { num: '202', status: 'ready' }, { num: '203', status: 'ooo' },
    { num: '204', status: 'ooo' },   { num: '205', status: 'ooo' },   { num: '206', status: 'ooo' },
    { num: '207', status: 'ooo' },   { num: '208', status: 'ooo' },   { num: '209', status: 'ooo' },
  ];
  const floor1: Tile[] = [
    { num: '101', status: 'occupied' }, { num: '102', status: 'occupied' }, { num: '103', status: 'occupied' },
    { num: '104', status: 'occupied', tickets: 1 }, { num: '105', status: 'occupied' }, { num: '106', status: 'occupied' },
    { num: '107', status: 'occupied' }, { num: '108', status: 'occupied' }, { num: '109', status: 'occupied' },
  ];

  const renderFloor = (label: string, tiles: Tile[]) => (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#929292' }}>
        {label}
      </p>
      <div className="grid grid-cols-9 gap-1.5">
        {tiles.map((t) => {
          const cfg = TILE[t.status];
          return (
            <div key={t.num} className="relative rounded-lg flex flex-col items-center justify-center py-2"
              style={{
                background: cfg.bg,
                border: t.selected ? '2px solid #ff385c' : `1px solid ${cfg.border}`,
                boxShadow: t.selected
                  ? '0 0 0 2px rgba(255,56,92,0.18), 0 4px 10px -4px rgba(255,56,92,0.25)'
                  : '0 1px 2px rgba(0,0,0,0.04), 0 2px 6px -2px rgba(0,0,0,0.05)',
              }}>
              <span className="text-[11px] font-bold leading-none" style={{ color: '#222' }}>{t.num}</span>
              <span className="mt-1 w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {t.tickets ? (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white"
                  style={{ background: '#ff385c' }}>
                  {t.tickets}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <IpadFrame>
      <div className="relative" style={{ background: '#ffffff' }}>
        {/* MAIN: hotel header + status pills + floor grids */}
        <div className="p-4 sm:p-5 pr-[360px]">
          <p className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: '#ff385c' }}>
            <ChevronLeft className="w-3 h-3" />Portfolio
          </p>
          <h3 className="mt-1 text-base font-bold" style={{ color: '#222' }}>
            Cotton Sail Hotel
          </h3>
          <p className="text-[11px]" style={{ color: '#929292' }}>Savannah, GA · Hilton · 56 rooms</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { c: 'ready' as S,    n: 9 },
              { c: 'dirty' as S,    n: 16 },
              { c: 'ooo' as S,      n: 7 },
              { c: 'occupied' as S, n: 24 },
            ].map((p) => {
              const cfg = TILE[p.c];
              return (
                <span key={p.c}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: cfg.bg, color: '#222', border: `1px solid ${cfg.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {p.n} {cfg.label}
                </span>
              );
            })}
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#929292' }}>
            Room Grid
          </p>

          <div className="mt-3 flex flex-col gap-3.5">
            {renderFloor('Floor 5', floor5)}
            {renderFloor('Floor 4', floor4)}
            {renderFloor('Floor 3', floor3)}
            {renderFloor('Floor 2', floor2)}
            {renderFloor('Floor 1', floor1)}
          </div>
        </div>

        {/* SCRIM */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(0.5px)',
            WebkitBackdropFilter: 'blur(0.5px)',
          }} />

        {/* SLIDE PANEL: AC/PTAC asset detail */}
        <div className="absolute right-0 top-0 bottom-0 w-[340px] z-20 p-4 sm:p-5 overflow-y-auto"
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #eaeaea',
            boxShadow: '-20px 0 40px -16px rgba(0,0,0,0.12)',
          }}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: '#ff385c' }}>
                <ChevronLeft className="w-3 h-3" />Room 312
              </p>
              <p className="mt-1.5 text-base font-bold" style={{ color: '#222' }}>AC/PTAC Unit</p>
              <p className="text-[11px]" style={{ color: '#6a6a6a' }}>Room 312 · Cotton Sail</p>
            </div>
            <X className="w-3.5 h-3.5 mt-1" style={{ color: '#929292' }} />
          </div>

          {/* Lifecycle bars */}
          <div className="mt-3 rounded-lg p-3" style={{ background: '#f7f7f7', border: '1px solid #eee' }}>
            <div>
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: '#6a6a6a' }}>Warranty coverage</span>
                <span className="font-bold" style={{ color: '#222' }}>100%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#fee2e2' }}>
                <div className="h-full" style={{ width: '100%', background: '#dc2626' }} />
              </div>
              <p className="text-[9px] mt-0.5" style={{ color: '#929292' }}>Warranty ended May 8, 2022</p>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: '#6a6a6a' }}>Useful life</span>
                <span className="font-bold" style={{ color: '#222' }}>90%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#fee2e2' }}>
                <div className="h-full" style={{ width: '90%', background: '#dc2626' }} />
              </div>
              <p className="text-[9px] mt-0.5" style={{ color: '#929292' }}>First use May 31, 2017 · end of life May 31, 2027</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="mt-4 rounded-lg p-3 grid grid-cols-3 gap-2 text-center"
            style={{ background: '#f7f7f7', border: '1px solid #eee' }}>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: '#222' }}>2</p>
              <p className="text-[9px] mt-1" style={{ color: '#6a6a6a' }}>Repairs</p>
            </div>
            <div style={{ borderLeft: '1px solid #e5e5e5', borderRight: '1px solid #e5e5e5' }}>
              <p className="text-base font-bold leading-none" style={{ color: '#dc2626' }}>$260</p>
              <p className="text-[9px] mt-1" style={{ color: '#6a6a6a' }}>Total repair spend</p>
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: '#222' }}>$2,800</p>
              <p className="text-[9px] mt-1" style={{ color: '#6a6a6a' }}>Replace cost</p>
            </div>
          </div>

          {/* Upcoming */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#929292' }}>
              Upcoming
            </p>
            <div className="mt-1.5 rounded-md p-2.5 flex items-start gap-2"
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#1d4ed8' }} />
              <div>
                <p className="text-[11px] font-semibold" style={{ color: '#1e3a8a' }}>Preventive inspection</p>
                <p className="text-[10px]" style={{ color: '#3b82f6' }}>Due Mar 2, 2026</p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] inline-flex items-center gap-1.5"
              style={{ color: '#929292' }}>
              <TrendingUp className="w-3 h-3" />History · 4
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {[
                {
                  type: 'Repair', tone: '#dc2626', icon: 'wrench',
                  date: 'Jan 16, 2026',
                  title: 'Capacitor replaced – unit failing to start',
                  by: 'By Maintenance Tech', cost: '$110',
                },
                {
                  type: 'Repair', tone: '#dc2626', icon: 'wrench',
                  date: 'Jun 25, 2025',
                  title: 'Refrigerant recharge – low coolant level',
                  by: 'By HVAC Vendor', cost: '$150',
                },
                {
                  type: 'Inspection', tone: '#3b82f6', icon: 'search',
                  date: 'Sep 3, 2025',
                  title: 'Annual HVAC check – operational, age-related wear',
                  by: 'By Sydney Rivera',
                },
                {
                  type: 'Replacement', tone: '#0a0a0a', icon: 'package',
                  date: 'May 31, 2017',
                  title: 'Unit installed – original installation',
                  by: 'By HVACo Inc.', cost: '$2,800',
                },
              ].map((h, i) => {
                const Icon = h.icon === 'wrench' ? Wrench : h.icon === 'search' ? Search : Package;
                return (
                  <div key={i} className="rounded-md p-2.5 flex items-start gap-2"
                    style={{ background: '#fff', border: '1px solid #eee' }}>
                    <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#929292' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold" style={{ color: h.tone }}>{h.type}</span>
                        <span className="text-[9px]" style={{ color: '#929292' }}>{h.date}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium leading-tight" style={{ color: '#222' }}>{h.title}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[9px]" style={{ color: '#6a6a6a' }}>{h.by}</span>
                        {h.cost && <span className="text-[10px] font-semibold" style={{ color: '#dc2626' }}>{h.cost}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </IpadFrame>
  );
}

/* ============================================================
 *  OwnerKpiMock — used inside OwnerLens. The four big KPIs an
 *  owner sees on their portfolio dashboard.
 * ============================================================ */
export function OwnerKpiMock() {
  return (
    <ScreenFrame label="Kris (MD) · Portfolio · Today" shadow="0 18px 50px -18px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)">
      <div
        className="grid grid-cols-2 gap-3 p-4 sm:p-5"
        style={{ background: '#f7f7f7' }}
      >
        <MiniKpi label="Portfolio Revenue" value="$1.24M" subtext="this month · +8.4%" />
        <MiniKpi label="Avg Occupancy"     value="83.4%" subtext="11 of 16 above target" />
        <MiniKpi label="Labour Cost"       value="28.6%" subtext="of revenue · −0.8pp" />
        <MiniKpi label="Rooms OOO"         value="11"    subtext="$1.4K/day impact" alert />
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  RegionalMock — used inside RegionalLens. "Today's attention list"
 *  list view with HealthBadge + alert tags per property.
 * ============================================================ */
export function RegionalMock() {
  const items = [
    { name: 'Woodspring · Brunswick',     gm: 'Marcus Lee',    h: 'red'   as const, tags: ['Occ 74%', '4 aging tickets'] },
    { name: 'Hilton Garden · Midtown',    gm: 'Priya Shah',    h: 'amber' as const, tags: ['3 OOO rooms', 'Audit due'] },
    { name: 'Home2 · Baton Rouge',        gm: 'James Patel',   h: 'green' as const, tags: ['On track'] },
    { name: 'Four Points · Brunswick',    gm: 'Sara Mendoza',  h: 'amber' as const, tags: ['OT trending up'] },
    { name: 'Hampton · Brunswick',        gm: 'David Kim',     h: 'green' as const, tags: ['On track'] },
  ];
  return (
    <ScreenFrame label="Harshal (Regional) · Today's Attention List">
      <div style={{ background: '#ffffff' }}>
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Properties · 5 in scope
          </p>
          <span className="text-xs font-semibold" style={{ color: '#ff385c' }}>2 need help</span>
        </div>
        {items.map((it, i) => (
          <div
            key={it.name}
            className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#fafafa] cursor-default"
            style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{it.name}</p>
              <p className="text-xs truncate" style={{ color: '#929292' }}>GM · {it.gm}</p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end max-w-[55%]">
              {it.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    background: HEALTH[it.h].bg,
                    color:      HEALTH[it.h].text,
                    border:     `1px solid ${HEALTH[it.h].dot}40`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <HealthPill h={it.h} />
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#cfcfcf' }} />
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  ReportMock — used inside Reports section. A "Daily Owner Summary"
 *  preview, document-style.
 * ============================================================ */
export function ReportMock() {
  return (
    <ScreenFrame label="StayOps · Reports · AI-built">
      <div style={{ background: '#ffffff' }}>
        {/* AI prompt input */}
        <div className="px-4 py-3" style={{ background: '#fafaf7', borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: '#ffffff', border: '1px solid #ddd' }}>
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ff385c' }} />
            <p className="text-xs flex-1" style={{ color: '#222' }}>
              Yesterday&apos;s revenue + labour by property, owner-ready
            </p>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: '#0a0a0a', color: '#fff' }}>
              Generate
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Templates</span>
            {['Daily summary', 'Labour by property', 'Audit compliance', 'Repair spend YTD'].map((t) => (
              <span key={t}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: '#fff', border: '1px solid #ddd', color: '#3f3f3f' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ff385c' }}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            AI summary · Daily Owner Report
          </p>
          <p className="mt-1.5 text-base font-semibold" style={{ color: '#222' }}>April 25, 2026 · 16 properties</p>
          <p className="text-xs" style={{ color: '#929292' }}>Built in 4.2s · ready for owner inbox</p>
        </div>

        <div className="grid grid-cols-3" style={{ borderBottom: '1px solid #f0f0f0', background: '#f7f7f7' }}>
          {[
            { label: 'Revenue',  value: '$285K',   sub: '+4.1% vs last week' },
            { label: 'Occ',      value: '83.4%',   sub: '+2.1pp' },
            { label: 'OOO Cost', value: '$1.4K/d', sub: '11 rooms' },
          ].map((t, i) => (
            <div
              key={t.label}
              className="p-4"
              style={{ borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{t.label}</p>
              <p className="mt-1 text-base font-bold" style={{ color: '#222' }}>{t.value}</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>{t.sub}</p>
            </div>
          ))}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ff385c' }}>
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Needs attention today
          </p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {[
              { name: 'Woodspring Brunswick', detail: 'Occupancy 74% — second week running below 80%', h: 'red'   as const },
              { name: 'Hilton Garden Midtown', detail: '3 rooms OOO — ~$540/day revenue impact',         h: 'amber' as const },
              { name: 'Home2 Flower Mound',    detail: 'Labour OT trending up vs last 3 weeks',          h: 'amber' as const },
            ].map((line) => (
              <li
                key={line.name}
                className="flex items-start gap-2.5 py-1.5"
              >
                <Bed className="w-3.5 h-3.5 mt-1 flex-shrink-0" style={{ color: HEALTH[line.h].dot }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#222' }}>{line.name}</p>
                  <p className="text-xs" style={{ color: '#6a6a6a' }}>{line.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: '#f7f7f7', borderTop: '1px solid #f0f0f0' }}
        >
          <p className="text-xs" style={{ color: '#929292' }}>1-click PDF · auto-emailed daily</p>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            Export
          </span>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ─── Phone frame wrapper (for the mobile mocks below) ─────────────────── */
function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      className="mx-auto rounded-[2.5rem] overflow-hidden"
      style={{
        width: 280,
        background: '#0a0a0a',
        padding: 8,
        border: '1px solid #2a2a2a',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="rounded-[2rem] overflow-hidden"
        style={{ background: '#ffffff', minHeight: 540 }}
      >
        <div className="px-4 pt-3 pb-2 flex items-center justify-between text-[10px] font-semibold"
          style={{ color: '#222' }}>
          <span>9:41</span>
          <span style={{ color: '#929292' }}>{label}</span>
          <span>●●●</span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 *  MaintenanceAppMock — placeholder for the maintenance team mobile app.
 *  Used on Mobile Team App and Maintenance Teams pages.
 * ============================================================ */
export function MaintenanceAppMock() {
  const tickets = [
    { id: 'T-238', room: '214', priority: 'urgent',  age: '3h',  title: 'AC not cooling — guest moved' },
    { id: 'T-235', room: '312', priority: 'high',    age: '7h',  title: 'Toilet running — leak risk' },
    { id: 'T-231', room: '108', priority: 'normal',  age: '1d',  title: 'TV remote not pairing' },
    { id: 'T-227', room: '—',   priority: 'normal',  age: '2d',  title: 'Lobby door closer slow' },
  ];
  const colour = (p: string) => p === 'urgent' ? '#dc2626' : p === 'high' ? '#d97706' : '#6a6a6a';
  return (
    <PhoneFrame label="StayOps · Maintenance">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          Today · Home2 Baton Rouge
        </p>
        <p className="text-base font-bold mt-0.5" style={{ color: '#222' }}>4 open tickets</p>
        <p className="text-xs" style={{ color: '#dc2626' }}>1 urgent · revenue impact</p>
      </div>
      {tickets.map((t, i) => (
        <div key={t.id} className="px-4 py-3 flex items-start gap-2.5"
          style={{ borderBottom: i < tickets.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
          <Wrench className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colour(t.priority) }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold" style={{ color: '#222' }}>
              {t.id} · Room {t.room}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#3f3f3f', lineHeight: 1.4 }}>{t.title}</p>
            <p className="text-[10px] mt-1" style={{ color: '#929292' }}>{t.age} ago</p>
          </div>
        </div>
      ))}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: '#f7f7f7', borderTop: '1px solid #f0f0f0' }}>
        <span className="text-[11px] font-semibold" style={{ color: '#222' }}>+ Add note · upload photo</span>
        <ChevronRight className="w-4 h-4" style={{ color: '#929292' }} />
      </div>
    </PhoneFrame>
  );
}

/* ============================================================
 *  HousekeepingAppMock — placeholder for the housekeeping mobile view.
 *  Used on Mobile Team App and Housekeeping Teams pages.
 * ============================================================ */
export function HousekeepingAppMock() {
  const rooms = [
    { num: '214', status: 'dirty',     time: 'In  10:14',  flag: 'Stay-over' },
    { num: '215', status: 'inspecting',time: 'Done 10:42', flag: 'Check-out' },
    { num: '216', status: 'ready',     time: 'Ready 11:08', flag: '' },
    { num: '217', status: 'dirty',     time: '—',          flag: 'Check-out' },
    { num: '218', status: 'ready',     time: 'Ready 11:30', flag: 'VIP' },
  ];
  const dot = (s: string) => s === 'ready' ? '#22c55e' : s === 'inspecting' ? '#3b82f6' : s === 'dirty' ? '#f59e0b' : '#ef4444';

  return (
    <PhoneFrame label="StayOps · Housekeeping">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          Maria's Floor 2 · 14 rooms
        </p>
        <p className="text-base font-bold mt-0.5" style={{ color: '#222' }}>6 ready · 5 dirty · 3 in</p>
      </div>
      {rooms.map((r, i) => (
        <div key={r.num} className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: i < rooms.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot(r.status) }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#222' }}>Room {r.num}</p>
            <p className="text-[11px]" style={{ color: '#929292' }}>{r.time} {r.flag && `· ${r.flag}`}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide font-semibold"
            style={{ color: dot(r.status) }}>{r.status}</span>
        </div>
      ))}
    </PhoneFrame>
  );
}

/* ============================================================
 *  EmployeeAppMock — placeholder for employee earnings/schedule view.
 *  Used on Mobile Team App and Employees pages.
 * ============================================================ */
export function EmployeeAppMock() {
  return (
    <PhoneFrame label="StayOps · My Work">
      <div className="px-5 py-4" style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
        color: '#fff',
      }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Next shift</p>
        <p className="text-base font-bold mt-0.5">Tue · 3:00 PM – 11:00 PM</p>
        <p className="text-[11px] opacity-80 mt-0.5">Front Desk · PM</p>
      </div>
      <div className="grid grid-cols-2 gap-px" style={{ background: '#f0f0f0' }}>
        <div className="px-4 py-3" style={{ background: '#fff' }}>
          <p className="text-[10px] font-semibold uppercase" style={{ color: '#929292' }}>This period</p>
          <p className="mt-1 text-base font-bold" style={{ color: '#222' }}>$1,247</p>
          <p className="text-[10px]" style={{ color: '#15803d' }}>Pending payout Fri</p>
        </div>
        <div className="px-4 py-3" style={{ background: '#fff' }}>
          <p className="text-[10px] font-semibold uppercase" style={{ color: '#929292' }}>Hours</p>
          <p className="mt-1 text-base font-bold" style={{ color: '#222' }}>72.5</p>
          <p className="text-[10px]" style={{ color: '#222' }}>2.5 OT</p>
        </div>
      </div>
      <div className="px-5 py-4" style={{ borderTop: '1px solid #f0f0f0' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Active bonus</p>
        <div className="mt-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#b45309' }} />
          <p className="text-sm font-semibold" style={{ color: '#222' }}>$2 per upsell</p>
          <span className="ml-auto text-[11px] font-semibold" style={{ color: '#b45309' }}>$48 earned</span>
        </div>
      </div>
      <div className="px-5 py-3" style={{ borderTop: '1px solid #f0f0f0' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>This week</p>
        {[
          { d: 'Mon', t: '3 PM – 11 PM', i: Calendar  },
          { d: 'Tue', t: '3 PM – 11 PM', i: Calendar  },
          { d: 'Wed', t: 'Off',           i: CheckCircle2 },
          { d: 'Thu', t: '7 AM – 3 PM',   i: Clock     },
        ].map((row) => (
          <div key={row.d} className="flex items-center gap-3 py-1.5"
            style={{ borderBottom: '1px solid #f7f7f7' }}>
            <row.i className="w-3.5 h-3.5" style={{ color: '#929292' }} />
            <span className="text-xs font-semibold w-10" style={{ color: '#222' }}>{row.d}</span>
            <span className="text-xs" style={{ color: '#3f3f3f' }}>{row.t}</span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

/* ─── iPad landscape chrome wrapper — frames any product surface ───
 * Exported so the homepage can reuse it for room drill, FF&E audit, and the
 * MD dashboard mocks. */
export function IpadFrame({
  children, label, maxWidth = 1040,
}: { children: React.ReactNode; label?: string; maxWidth?: number }) {
  return (
    <div className="mx-auto" style={{ maxWidth }}>
      <div
        className="relative rounded-[36px] p-3 sm:p-4"
        style={{
          background: 'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)',
          boxShadow:
            '0 40px 80px -28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Camera dot */}
        <span
          className="absolute left-1/2 -translate-x-1/2 top-[10px] sm:top-[14px] w-1.5 h-1.5 rounded-full"
          style={{ background: '#0a0a0a', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
        />
        <div
          className="rounded-[22px] overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          {label && (
            <div
              className="px-4 py-2 text-[11px] font-medium"
              style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd', color: '#929292' }}
            >
              {label}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  MdDashboardIpadMock — the MD home dashboard inside an iPad frame.
 *  Mirrors the real /web/kris/dashboard layout: 4 KPIs + portfolio table.
 * ============================================================ */
export function MdDashboardIpadMock() {
  const rows = [
    { name: 'Home2 Suites - Baton Rouge',     meta: 'Baton Rouge, LA · Hilton',  rooms: 116, occ: '83%', rev: '$24.3K', oprCost: '$8.5K', costPerRoom: '$73',  health: 'green' as const },
    { name: 'Hilton Garden Inn - Midtown',    meta: 'Savannah, GA · Hilton',     rooms: 132, occ: '77%', rev: '$17.6K', oprCost: '$6.8K', costPerRoom: '$52',  health: 'amber' as const },
    { name: 'Fairfield/TPS - Pooler, GA',     meta: 'Pooler, GA · Marriott',     rooms: 158, occ: '91%', rev: '$29.4K', oprCost: '$9.8K', costPerRoom: '$62',  health: 'green' as const },
    { name: 'Woodspring - Brunswick',         meta: 'Brunswick, GA · Choice',    rooms: 122, occ: '74%', rev: '$15.8K', oprCost: '$7.2K', costPerRoom: '$59',  health: 'red'   as const },
    { name: 'Home2 Suites - Flower Mound TX', meta: 'Flower Mound, TX · Hilton', rooms:  99, occ: '85%', rev: '$13.7K', oprCost: '$5.0K', costPerRoom: '$51',  health: 'green' as const },
  ];
  const thClass = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-3 whitespace-nowrap';

  return (
    <IpadFrame label="StayOps · MD Home Dashboard · Today">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5" style={{ background: '#ffffff' }}>
        <h3 className="text-base sm:text-lg font-bold" style={{ color: '#222222' }}>Portfolio Dashboard</h3>
        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>16 properties · 5 brands · this month</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5" style={{ background: '#f7f7f7' }}>
        <MiniKpi label="Occupancy"      value="83.4%"  subtext="1,243 of 1,490 sold"   large />
        <MiniKpi label="Room Revenue"   value="$1.04M" subtext="Rooms only, excl. F&B" large />
        <MiniKpi label="Total Revenue"  value="$1.24M" subtext="All revenue streams"   large />
        <MiniKpi label="Rooms Not Sold" value="247"    subtext="11 rooms out of order" alert large />
      </div>
      <div className="overflow-x-auto" style={{ background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Property <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} /></th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Rooms</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Occ %</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Revenue</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Opr Cost</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Cost / Rm</th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-3">
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#222222' }}>{r.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{r.meta}</p>
                  </div>
                </td>
                <td className="py-3 px-3 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.rooms}</td>
                <td className="py-3 px-3 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.occ}</td>
                <td className="py-3 px-3 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.rev}</td>
                <td className="py-3 px-3 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.oprCost}</td>
                <td className="py-3 px-3 text-sm font-medium" style={{ color: '#3f3f3f' }}>{r.costPerRoom}</td>
                <td className="py-3 px-3"><HealthPill h={r.health} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IpadFrame>
  );
}

/* ============================================================
 *  LabourMiniMock — 4 KPIs for the Labour Control product glimpse
 * ============================================================ */
export function LabourMiniMock() {
  return (
    <ScreenFrame label="Labour Control · This Month">
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5" style={{ background: '#f7f7f7' }}>
        <MiniKpi label="Labour Cost" value="28.6%" subtext="of revenue · −0.8pp" />
        <MiniKpi label="OT Hours"    value="142"   subtext="+12 vs target" alert />
        <MiniKpi label="Scheduled"   value="1,840" subtext="hrs across 16 hotels" />
        <MiniKpi label="Clocked"     value="1,956" subtext="+116 hrs variance" />
      </div>
      <div className="px-4 sm:px-5 py-3" style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <p className="text-xs font-semibold" style={{ color: '#222' }}>Variance by department</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {[
            { dept: 'Housekeeping', v: '+62', pct: 60, tone: '#d97706' },
            { dept: 'Front desk',   v: '+38', pct: 40, tone: '#f59e0b' },
            { dept: 'F&B',          v: '+16', pct: 18, tone: '#16a34a' },
          ].map((d) => (
            <div key={d.dept} className="flex items-center gap-2 text-[11px]" style={{ color: '#3f3f3f' }}>
              <span className="w-24 flex-shrink-0">{d.dept}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.tone }} />
              </div>
              <span className="w-10 text-right font-semibold" style={{ color: d.tone }}>{d.v}</span>
            </div>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  TicketsMiniMock — open tickets list for Maintenance & Tickets glimpse
 * ============================================================ */
export function TicketsMiniMock() {
  const tickets = [
    { title: 'AC condenser failure',    room: 'Hilton Garden · Rm 214',  age: '6d', tone: '#dc2626', label: 'Aging · High' },
    { title: 'Faucet leak',              room: 'Cotton Sail · Rm 312',     age: '3d', tone: '#d97706', label: 'Open' },
    { title: 'TV remote replacement',    room: 'Home2 Baton Rouge · 105',  age: '2d', tone: '#d97706', label: 'Open' },
    { title: 'Door lock',                room: 'Hilton Midtown · Rm 410',  age: '1d', tone: '#16a34a', label: 'In progress' },
  ];
  return (
    <ScreenFrame label="Maintenance · Open Tickets · 23">
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#f7f7f7', borderBottom: '1px solid #ddd' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
          23 open · 4 aging &gt; 5 days
        </p>
        <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>1 urgent</span>
      </div>
      <div style={{ background: '#fff' }}>
        {tickets.map((t, i) => (
          <div key={t.title} className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: i < tickets.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.tone }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium" style={{ color: '#222' }}>{t.title}</p>
              <p className="text-xs" style={{ color: '#929292' }}>{t.room}</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: t.tone }}>{t.age}</span>
            <ChevronRight className="w-4 h-4" style={{ color: '#cfcfcf' }} />
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5" style={{ background: '#f7f7f7', borderTop: '1px solid #ddd' }}>
        <p className="text-xs" style={{ color: '#6a6a6a' }}>
          <span className="font-semibold" style={{ color: '#16a34a' }}>18 resolved</span> this week · avg 1.8 days to close
        </p>
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  AssetMiniMock — single asset card for Assets & Room History glimpse
 * ============================================================ */
export function AssetMiniMock() {
  return (
    <ScreenFrame label="Assets · Room 312 · AC/PTAC Unit">
      <div className="p-4 sm:p-5" style={{ background: '#fff' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold" style={{ color: '#222' }}>AC/PTAC Unit</p>
            <p className="text-xs" style={{ color: '#929292' }}>Cotton Sail · Room 312 · since May 2017</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#dc2626' }} />
            Poor
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: '#6a6a6a' }}>Useful life</span>
            <span className="font-bold" style={{ color: '#222' }}>90%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#fee2e2' }}>
            <div className="h-full" style={{ width: '90%', background: '#dc2626' }} />
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>End of life: May 2027</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { v: '2',     label: 'Repairs' },
            { v: '$260',  label: 'YTD spend', tone: '#dc2626' },
            { v: '$2,800',label: 'Replace cost' },
          ].map((s, i) => (
            <div key={s.label} className="p-2 rounded-lg"
              style={{ background: '#f7f7f7', border: '1px solid #eee', borderRight: i < 2 ? undefined : undefined }}>
              <p className="text-base font-bold leading-none" style={{ color: s.tone || '#222' }}>{s.v}</p>
              <p className="text-[10px] mt-1" style={{ color: '#6a6a6a' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Recent</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {[
              { dot: '#dc2626', text: 'Jan 16, 2026 · Capacitor replaced · $110' },
              { dot: '#3b82f6', text: 'Sep 3, 2025 · Annual HVAC check · age-related wear' },
              { dot: '#929292', text: 'May 31, 2017 · Original installation · $2,800' },
            ].map((a) => (
              <li key={a.text} className="text-[11px] flex items-start gap-1.5" style={{ color: '#3f3f3f' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.dot }} />
                {a.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ============================================================
 *  MobileAppTriptych — three phones side-by-side for the Mobile Team App page.
 * ============================================================ */
export function MobileAppTriptych() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      <div className="flex flex-col items-center gap-4">
        <MaintenanceAppMock />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          Maintenance · ticket flow
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <HousekeepingAppMock />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          Housekeeping · floor view
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <EmployeeAppMock />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          Employees · shifts + earnings
        </p>
      </div>
    </div>
  );
}
