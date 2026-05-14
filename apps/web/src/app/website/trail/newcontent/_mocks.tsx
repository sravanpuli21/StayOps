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
  FileText, Wrench, Sparkles, DollarSign, Calendar, CheckCircle2,
  Clock,
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
    <ScreenFrame label="StayOps · Reports · Daily Owner Summary">
      <div style={{ background: '#ffffff' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ff385c' }}>
            <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            Daily Owner Summary
          </p>
          <p className="mt-1.5 text-base font-semibold" style={{ color: '#222' }}>April 25, 2026 · 16 properties</p>
          <p className="text-xs" style={{ color: '#929292' }}>Generated 6:14 AM · ready for owner inbox</p>
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

/* ─── iPad landscape chrome wrapper — frames the MD dashboard ──────────────── */
function IpadFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 1040 }}>
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
    { name: 'Home2 Suites - Baton Rouge',     meta: 'Baton Rouge, LA · Hilton',  rooms: 116, occ: '83%', rev: '$24.3K', health: 'green' as const },
    { name: 'Hilton Garden Inn - Midtown',    meta: 'Savannah, GA · Hilton',     rooms: 132, occ: '77%', rev: '$17.6K', health: 'amber' as const },
    { name: 'Fairfield/TPS - Pooler, GA',     meta: 'Pooler, GA · Marriott',     rooms: 158, occ: '91%', rev: '$29.4K', health: 'green' as const },
    { name: 'Woodspring - Brunswick',         meta: 'Brunswick, GA · Choice',    rooms: 122, occ: '74%', rev: '$15.8K', health: 'red'   as const },
    { name: 'Home2 Suites - Flower Mound TX', meta: 'Flower Mound, TX · Hilton', rooms:  99, occ: '85%', rev: '$13.7K', health: 'green' as const },
  ];
  const thClass = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

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
              <th className={thClass} style={{ color: '#6a6a6a' }}>Rooms <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" /></th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Occ % <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" /></th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Revenue <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" /></th>
              <th className={thClass} style={{ color: '#6a6a6a' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
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
    </IpadFrame>
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
