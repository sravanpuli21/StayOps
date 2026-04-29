import type { Room, MaintenanceTicket, RoomInventoryItem, AuditTask } from '@hos/shared';
import { HOTELS } from '@hos/shared';
import { SlidePanel } from './SlidePanel';
import { RoomStatusBadge, TicketTypeBadge, PriorityDot, ConditionBadge, AuditStatusBadge } from './OpsBadges';
import { Star, AlertTriangle, Package } from 'lucide-react';

interface Props {
  room: Room | null;
  tickets: MaintenanceTicket[];
  inventory: RoomInventoryItem[];
  auditHistory: AuditTask[];
  onClose: () => void;
  onTicketClick: (ticket: MaintenanceTicket) => void;
  onItemClick: (item: RoomInventoryItem) => void;
  backLabel?: string;
  onBack?: () => void;
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const BRAND_RATES: Record<string, number> = {
  Hilton: 189, Marriott: 179, Choice: 135, IHG: 155, Wyndham: 115,
};

export function RoomDetailPanel({
  room, tickets, inventory, auditHistory,
  onClose, onTicketClick, onItemClick,
  backLabel, onBack,
}: Props) {
  if (!room) return null;
  const hotel = HOTELS.find((h) => h.id === room.hotelId);
  const nightlyRate = BRAND_RATES[hotel?.brand ?? ''] ?? 150;
  const isBlockedOrOoo = room.status === 'ooo' || room.status === 'blocked';

  const daysOoo = isBlockedOrOoo ? 1 : 0;
  const revenueAtRisk = daysOoo * nightlyRate;

  const completedAudits = [...auditHistory]
    .sort((a, b) => (b.completedDate ?? '').localeCompare(a.completedDate ?? ''));

  return (
    <SlidePanel
      open={!!room}
      onClose={onClose}
      title={`Room ${room.number}`}
      subtitle={`${room.type} · Floor ${room.floor} · ${hotel?.shortName ?? room.hotelId}`}
      backLabel={backLabel}
      onBack={onBack}
    >
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Status row */}
        <div className="flex items-center gap-2 flex-wrap">
          <RoomStatusBadge status={room.status} />
          {room.oooReason && (
            <span className="text-xs" style={{ color: '#6a6a6a' }}>{room.oooReason}</span>
          )}
        </div>

        {/* Room status grid */}
        <div
          className="rounded-xl p-4 grid grid-cols-2 gap-3"
          style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
        >
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Last cleaned</p>
            <p className="text-sm font-semibold" style={{ color: '#222222' }}>{fmtDateTime(room.lastCleaned)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Last inspected</p>
            <p className="text-sm font-semibold" style={{ color: '#222222' }}>{fmtDateTime(room.lastInspected)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>HK status</p>
            <p className="text-sm font-semibold capitalize" style={{ color: '#222222' }}>{room.hkStatus}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Last guest rating</p>
            {room.lastGuestRating ? (
              <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#222222' }}>
                <Star className="w-3 h-3 fill-current" style={{ color: '#f59e0b' }} />
                {room.lastGuestRating.toFixed(1)}
              </p>
            ) : (
              <p className="text-sm" style={{ color: '#929292' }}>—</p>
            )}
          </div>
        </div>

        {/* Revenue at risk */}
        {isBlockedOrOoo && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: '#fff8f8', border: '1px solid #ffd6d6' }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#c0392b' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#c0392b' }}>Revenue at risk</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>
                ${nightlyRate}/night · {daysOoo} night{daysOoo !== 1 ? 's' : ''} lost =
                <span className="font-bold" style={{ color: '#c0392b' }}> ${revenueAtRisk}</span>
              </p>
            </div>
          </div>
        )}

        {/* Open tickets */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
            Open Tickets ({tickets.length})
          </p>
          {tickets.length === 0 ? (
            <p className="text-sm" style={{ color: '#929292' }}>No open tickets</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTicketClick(t)}
                  className="w-full text-left rounded-xl p-3 transition-colors hover:bg-[#f7f7f7] group"
                  style={{ border: '1px solid #ebebeb', background: '#fff' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: '#929292' }}>{t.id}</span>
                    <TicketTypeBadge type={t.type} />
                    <PriorityDot priority={t.priority} />
                    <span className="ml-auto text-xs font-semibold group-hover:underline" style={{ color: '#ff385c' }}>
                      View →
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#222222' }}>{t.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audit history */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
            Audit History
          </p>
          {completedAudits.length === 0 ? (
            <p className="text-sm" style={{ color: '#929292' }}>No completed audits</p>
          ) : (
            <div className="flex flex-col gap-2">
              {completedAudits.slice(0, 3).map((audit) => (
                <div
                  key={audit.id}
                  className="rounded-xl p-3"
                  style={{ border: '1px solid #ebebeb', background: '#fafafa' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AuditStatusBadge status={audit.status} />
                    {audit.score !== undefined && (
                      <span className="text-xs font-bold" style={{ color: '#222222' }}>{audit.score}/100</span>
                    )}
                    <span className="text-xs ml-auto" style={{ color: '#929292' }}>
                      {audit.completedDate ? fmtDate(audit.completedDate) : ''}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#222222' }}>{audit.title}</p>
                  {audit.findings && audit.findings.length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-0.5">
                      {audit.findings.map((f, i) => (
                        <li key={i} className="text-xs" style={{ color: '#6a6a6a' }}>• {f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory — clustered */}
        {inventory.length > 0 && (() => {
          const ACCESSORY_SUFFIXES = new Set(['REMOTE', 'LAMP', 'DRYER', 'IRON', 'CLOCK', 'EXHAUST', 'PHONE']);
          const suffix = (item: RoomInventoryItem) => item.id.split('-').pop() ?? '';
          const major = inventory.filter((i) => !ACCESSORY_SUFFIXES.has(suffix(i)));
          const accessories = inventory.filter((i) => ACCESSORY_SUFFIXES.has(suffix(i)));

          const CONDITION_DOT: Record<string, string> = {
            good: '#22c55e', fair: '#f59e0b', poor: '#ef4444', condemned: '#7c3aed',
          };

          return (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#929292' }}>
                <Package className="w-3.5 h-3.5" />
                Inventory ({inventory.length} items)
              </p>

              {/* Major items */}
              <div className="flex flex-col gap-2 mb-3">
                {major.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="w-full text-left rounded-xl p-3 transition-colors hover:bg-[#f7f7f7] group"
                    style={{ border: '1px solid #ebebeb', background: '#fff' }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium flex-1" style={{ color: '#222222' }}>{item.name}</p>
                      <span className="ml-auto text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#ff385c' }}>
                        View →
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ConditionBadge condition={item.condition} />
                      {item.repairCount > 0 && (
                        <span className="text-xs" style={{ color: '#6a6a6a' }}>
                          {item.repairCount} repair{item.repairCount !== 1 ? 's' : ''} · ${item.totalRepairCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Accessories chip grid */}
              {accessories.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: '#929292' }}>Accessories</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {accessories.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors hover:bg-[#f0f0f0]"
                        style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: CONDITION_DOT[item.condition] ?? '#22c55e' }}
                        />
                        <span className="truncate font-medium" style={{ color: '#333' }}>{item.name}</span>
                        {item.repairCount > 0 && (
                          <span className="ml-auto flex-shrink-0 text-xs" style={{ color: '#d97706' }}>
                            {item.repairCount}×
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </SlidePanel>
  );
}
