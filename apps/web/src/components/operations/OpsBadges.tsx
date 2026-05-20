import type { TicketType, TicketStatus, TicketPriority, RoomStatus, AuditStatus, ItemCondition } from '@hos/shared';

const TICKET_TYPE_STYLES: Record<TicketType, { bg: string; color: string; label: string }> = {
  reactive:   { bg: '#fff1f1', color: '#c0392b', label: 'Reactive' },
  preventive: { bg: '#eff6ff', color: '#1d6fa4', label: 'Preventive' },
  audit:      { bg: '#f5f0ff', color: '#6d28d9', label: 'Audit' },
  escalation: { bg: '#fff3e0', color: '#b45309', label: 'Escalation' },
};

const PRIORITY_STYLES: Record<TicketPriority, { color: string; label: string }> = {
  urgent: { color: '#c0392b', label: 'Urgent' },
  high:   { color: '#d97706', label: 'High' },
  normal: { color: '#6a6a6a', label: 'Normal' },
  low:    { color: '#94a3b8', label: 'Low' },
};

const STATUS_STYLES: Record<TicketStatus, { bg: string; color: string; label: string }> = {
  open:             { bg: '#fff1f1', color: '#c0392b', label: 'Open' },
  assigned:         { bg: '#eff6ff', color: '#1d6fa4', label: 'Assigned' },
  in_progress:      { bg: '#eff6ff', color: '#1d6fa4', label: 'In Progress' },
  completed:        { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
  callback_pending: { bg: '#fff7ed', color: '#9a3412', label: 'Callback Pending' },
  closed:           { bg: '#f3f4f6', color: '#6a6a6a', label: 'Closed' },
  reopened:         { bg: '#fff1f1', color: '#c0392b', label: 'Reopened' },
  pending_part:     { bg: '#fffbeb', color: '#b45309', label: 'Pending Part' },
  resolved:         { bg: '#f0fdf4', color: '#16a34a', label: 'Resolved' },
  escalated:        { bg: '#fff3e0', color: '#b45309', label: 'Escalated' },
  scheduled:        { bg: '#f3f4f6', color: '#6a6a6a', label: 'Scheduled' },
};

const ROOM_STATUS_STYLES: Record<RoomStatus, { bg: string; border: string; color: string; label: string }> = {
  ready:      { bg: '#dcfce7', border: '#86efac', color: '#15803d', label: 'Ready' },
  dirty:      { bg: '#fef9c3', border: '#fde047', color: '#854d0e', label: 'Dirty' },
  inspecting: { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af', label: 'Inspecting' },
  occupied:   { bg: '#f3f4f6', border: '#d1d5db', color: '#374151', label: 'Occupied' },
  ooo:        { bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c', label: 'OOO' },
  blocked:    { bg: '#fce7f3', border: '#f9a8d4', color: '#9d174d', label: 'Blocked' },
};

const CONDITION_STYLES: Record<ItemCondition, { color: string; label: string }> = {
  good:      { color: '#15803d', label: 'Good' },
  fair:      { color: '#d97706', label: 'Fair' },
  poor:      { color: '#c0392b', label: 'Poor' },
  condemned: { color: '#7c3aed', label: 'Condemned' },
};

const AUDIT_STATUS_STYLES: Record<AuditStatus, { bg: string; color: string; label: string }> = {
  scheduled:   { bg: '#f3f4f6', color: '#6a6a6a', label: 'Scheduled' },
  in_progress: { bg: '#eff6ff', color: '#1d6fa4', label: 'In Progress' },
  passed:      { bg: '#f0fdf4', color: '#16a34a', label: 'Passed' },
  failed:      { bg: '#fff1f1', color: '#c0392b', label: 'Failed' },
  overdue:     { bg: '#fff3e0', color: '#b45309', label: 'Overdue' },
};

export function TicketTypeBadge({ type }: { type: TicketType }) {
  const s = TICKET_TYPE_STYLES[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: TicketPriority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const s = ROOM_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: ItemCondition }) {
  const s = CONDITION_STYLES[condition];
  return (
    <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
  );
}

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const s = AUDIT_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export { ROOM_STATUS_STYLES };
