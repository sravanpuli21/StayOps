import type { MaintenanceTicket } from '@hos/shared';
import { HOTELS } from '@hos/shared';
import { SlidePanel } from './SlidePanel';
import { TicketTypeBadge, PriorityDot, TicketStatusBadge } from './OpsBadges';
import { Clock, User, Wrench, DollarSign, AlertTriangle } from 'lucide-react';

interface Props {
  ticket: MaintenanceTicket | null;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${m}m ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const ACTIVITY_ICON: Record<string, string> = {
  'Ticket created': '📋',
  'Acknowledged': '👀',
  'On the way': '🚶',
  'In room': '🔧',
  'In progress': '🔧',
  'Resolved': '✅',
  'Escalated': '🔺',
  'Escalated to Urgent': '🚨',
  'Escalated to MD': '🚨',
  'Updated': '📝',
  'Assigned': '👤',
  'Assigned to Amir': '👤',
  'Diagnosed': '🔍',
  'Pending part': '📦',
  'Day 2 update': '📝',
  'Audit started': '📋',
  'Inspection scheduled': '📋',
  'Task scheduled': '📋',
  'Task generated': '📋',
  'Task due': '📅',
  'Completed': '✅',
};

export function TicketDetailPanel({ ticket, onClose, backLabel, onBack }: Props) {
  if (!ticket) return null;
  const hotel = HOTELS.find((h) => h.id === ticket.hotelId);
  const location = ticket.roomNumber
    ? `Room ${ticket.roomNumber}`
    : ticket.area ?? 'Common Area';

  return (
    <SlidePanel
      open={!!ticket}
      onClose={onClose}
      title={`${ticket.id} — ${ticket.title}`}
      subtitle={`${hotel?.shortName ?? ticket.hotelId} · ${location}`}
      backLabel={backLabel}
      onBack={onBack}
    >
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Type / Priority / Status row */}
        <div className="flex items-center gap-2 flex-wrap">
          <TicketTypeBadge type={ticket.type} />
          <PriorityDot priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
          <span className="text-xs ml-auto" style={{ color: '#929292' }}>
            {timeAgo(ticket.createdAt)}
          </span>
        </div>

        {/* Description */}
        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: '#f7f7f7', color: '#444' }}
        >
          {ticket.description}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#929292' }} />
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Reported by</p>
              <p className="text-sm font-medium" style={{ color: '#222222' }}>{ticket.reportedBy}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wrench className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#929292' }} />
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Assigned to</p>
              <p className="text-sm font-medium" style={{ color: '#222222' }}>{ticket.assignedTo ?? 'Unassigned'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#929292' }} />
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Opened</p>
              <p className="text-sm font-medium" style={{ color: '#222222' }}>{fmtDateTime(ticket.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#929292' }} />
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Last update</p>
              <p className="text-sm font-medium" style={{ color: '#222222' }}>{fmtTime(ticket.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Cost / Revenue impact */}
        {(ticket.estimatedCost || ticket.revenueLost) && (
          <div
            className="rounded-xl p-4 flex gap-6"
            style={{ background: '#fff8f8', border: '1px solid #ffd6d6' }}
          >
            {ticket.estimatedCost && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: '#c0392b' }} />
                <div>
                  <p className="text-xs" style={{ color: '#929292' }}>Est. repair cost</p>
                  <p className="text-sm font-bold" style={{ color: '#222222' }}>${ticket.estimatedCost.toLocaleString()}</p>
                </div>
              </div>
            )}
            {ticket.revenueLost !== undefined && ticket.revenueLost > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#c0392b' }} />
                <div>
                  <p className="text-xs" style={{ color: '#929292' }}>Revenue lost / night</p>
                  <p className="text-sm font-bold" style={{ color: '#c0392b' }}>${ticket.revenueLost.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity log */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>
            Activity
          </p>
          <div className="flex flex-col gap-0">
            {[...ticket.activity].reverse().map((act, i) => (
              <div key={i} className="flex gap-3 pb-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <span className="text-base leading-none">{ACTIVITY_ICON[act.action] ?? '•'}</span>
                  {i < ticket.activity.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: '#ebebeb', minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#222222' }}>{act.actor}</span>
                    <span className="text-xs" style={{ color: '#929292' }}>{fmtTime(act.timestamp)}</span>
                  </div>
                  <p className="text-sm" style={{ color: '#444' }}>{act.action}</p>
                  {act.note && (
                    <p className="text-xs mt-0.5 italic" style={{ color: '#6a6a6a' }}>"{act.note}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}
