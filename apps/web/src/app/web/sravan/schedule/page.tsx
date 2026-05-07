'use client';

import { useState } from 'react';
import { Calendar, RefreshCw, UserPlus, Plus, Check, X, Clock, CircleDashed, CheckCircle2, CircleDot } from 'lucide-react';
import {
  SRAVAN_SCHEDULE,
  SRAVAN_OPEN_SHIFTS,
  SRAVAN_SWAP_REQUESTS,
  SRAVAN_COLLEAGUES,
  SRAVAN_EMPLOYEE,
  type ShiftBlock,
  type SwapRequest,
  type Colleague,
  type ColleagueShift,
  type OpenShift,
} from '@hos/shared';

const MANAGER_NAME = SRAVAN_EMPLOYEE.supervisor; // "Lashwanda (AGM)"

function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

type ApprovalState = 'pending' | 'accepted' | 'declined' | 'approved';

// Unified local request shape (swap + cover)
interface MyRequest {
  id: string;
  kind: 'swap' | 'cover';
  myShiftLabel: string;
  myShiftTime: string;
  teammateName: string;              // "Marcus Lee" or "Any teammate"
  teammateStatus: ApprovalState;
  targetShiftLabel?: string;
  targetShiftTime?: string;
  managerStatus: ApprovalState;
  submittedAt: string;
}

// Seed a couple of historical entries matching SRAVAN_SWAP_REQUESTS
const SEED_REQUESTS: MyRequest[] = SRAVAN_SWAP_REQUESTS.map<MyRequest>((r) => ({
  id: r.id,
  kind: r.kind,
  myShiftLabel: r.myShiftLabel,
  myShiftTime: r.myShiftTime,
  teammateName: r.targetColleague,
  teammateStatus: r.status === 'accepted' || r.status === 'approved' ? 'accepted' : r.status,
  targetShiftLabel: r.targetShiftDate ? new Date(r.targetShiftDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : undefined,
  targetShiftTime: r.targetShiftTime,
  managerStatus: r.status === 'approved' ? 'approved' : r.status === 'accepted' ? 'pending' : 'pending',
  submittedAt: r.submittedAt,
}));

interface PickUpStatus {
  shift: OpenShift;
  submittedAt: string;
  managerStatus: ApprovalState;
}

type ShiftAction =
  | { kind: 'swap'; myShift: ShiftBlock }
  | { kind: 'cover'; myShift: ShiftBlock }
  | null;

export default function SravanSchedulePage() {
  const [action, setAction] = useState<ShiftAction>(null);
  const [sentSwap, setSentSwap] = useState<Set<string>>(new Set());
  const [sentCover, setSentCover] = useState<Set<string>>(new Set());
  const [myRequests, setMyRequests] = useState<MyRequest[]>(SEED_REQUESTS);
  const [pickUps, setPickUps] = useState<PickUpStatus[]>([]);

  const submitRequest = (
    kind: 'swap' | 'cover',
    myShift: ShiftBlock,
    teammateName: string,
    targetShift: ColleagueShift | null,
  ) => {
    const newReq: MyRequest = {
      id: `my-${Date.now()}`,
      kind,
      myShiftLabel: myShift.label,
      myShiftTime: `${fmtTime(myShift.start)} – ${fmtTime(myShift.end)}`,
      teammateName,
      teammateStatus: 'pending',
      targetShiftLabel: targetShift?.label,
      targetShiftTime: targetShift ? `${fmtTime(targetShift.start)} – ${fmtTime(targetShift.end)}` : undefined,
      managerStatus: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setMyRequests((cur) => [newReq, ...cur]);
    if (kind === 'swap') setSentSwap((s) => new Set(s).add(myShift.date));
    else setSentCover((s) => new Set(s).add(myShift.date));
  };

  const pickUpShift = (shift: OpenShift) => {
    setPickUps((cur) => [
      { shift, submittedAt: new Date().toISOString(), managerStatus: 'pending' },
      ...cur,
    ]);
  };

  const pickedShiftIds = new Set(pickUps.map((p) => p.shift.id));
  const availableOpenShifts = SRAVAN_OPEN_SHIFTS.filter((s) => !pickedShiftIds.has(s.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>My Schedule</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Apr 27 – May 3, 2026 · Home2 Baton Rouge · All changes require {MANAGER_NAME} approval
        </p>
      </div>

      {/* My upcoming shifts */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: '#0f766e' }} />
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>My Upcoming Shifts</h2>
          </div>
          <span className="text-xs" style={{ color: '#929292' }}>{SRAVAN_SCHEDULE.length} shifts</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
          {SRAVAN_SCHEDULE.map((s) => (
            <MyShiftRow
              key={s.date}
              shift={s}
              onRequestSwap={() => setAction({ kind: 'swap', myShift: s })}
              onAskCover={() => setAction({ kind: 'cover', myShift: s })}
              requestedSwap={sentSwap.has(s.date)}
              requestedCover={sentCover.has(s.date)}
            />
          ))}
        </div>
      </div>

      {/* Open shifts */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: '#ff385c' }} />
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Open Shifts · Pick Up</h2>
          </div>
          <span className="text-xs" style={{ color: '#929292' }}>{availableOpenShifts.length} available</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
          {availableOpenShifts.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold" style={{ color: '#222222' }}>
                    {s.label} · {fmtTime(s.start)} – {fmtTime(s.end)}
                  </p>
                  {s.payBoost && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#b45309' }}>
                      {s.payBoost}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                  {s.role} · {s.reason} · posted by {s.postedBy}
                </p>
              </div>
              <button
                onClick={() => pickUpShift(s)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold flex-shrink-0"
                style={{ background: '#ff385c', color: '#ffffff' }}
              >
                Pick Up
              </button>
            </div>
          ))}
          {availableOpenShifts.length === 0 && (
            <p className="px-5 py-6 text-sm italic text-center" style={{ color: '#929292' }}>
              No open shifts right now.
            </p>
          )}
        </div>
      </div>

      {/* Pick-ups awaiting approval */}
      {pickUps.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>My Pick-Up Requests</h2>
            <span className="text-xs" style={{ color: '#929292' }}>{pickUps.length} pending</span>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {pickUps.map((p, idx) => (
              <div key={idx} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: '#fce7f3', color: '#9d174d' }}>
                        Pick Up
                      </span>
                      <p className="text-sm font-semibold" style={{ color: '#222222' }}>
                        {p.shift.label} · {fmtTime(p.shift.start)} – {fmtTime(p.shift.end)}
                      </p>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{p.shift.role}</p>
                  </div>
                  <StatusChip status={p.managerStatus} scope="manager" />
                </div>
                <ApprovalChain
                  steps={[
                    { label: `${MANAGER_NAME} approval`, status: p.managerStatus },
                  ]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swap & cover requests */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" style={{ color: '#6a6a6a' }} />
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>My Swap & Cover Requests</h2>
          </div>
          <span className="text-xs" style={{ color: '#929292' }}>{myRequests.length} recent</span>
        </div>
        <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
          {myRequests.map((r) => {
            const overallStatus: ApprovalState =
              r.teammateStatus === 'declined' ? 'declined'
              : r.managerStatus === 'approved' ? 'approved'
              : r.managerStatus === 'declined' ? 'declined'
              : r.teammateStatus === 'accepted' ? 'accepted'
              : 'pending';

            const teammateLabel = r.kind === 'swap'
              ? `${r.teammateName} accepts swap`
              : r.teammateName === 'Any teammate'
                ? 'Teammate picks it up'
                : `${r.teammateName} accepts cover`;

            return (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: r.kind === 'swap' ? '#e0e7ff' : '#fce7f3', color: r.kind === 'swap' ? '#3730a3' : '#9d174d' }}>
                        {r.kind === 'swap' ? 'Swap' : 'Cover'}
                      </span>
                      <p className="text-sm font-semibold" style={{ color: '#222222' }}>
                        {r.myShiftLabel} · {r.myShiftTime}
                      </p>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                      {r.kind === 'swap' && r.targetShiftLabel
                        ? `Swap for ${r.teammateName}'s shift — ${r.targetShiftLabel} ${r.targetShiftTime}`
                        : r.teammateName === 'Any teammate'
                          ? 'Posted to all teammates'
                          : `Asking ${r.teammateName}`}
                      {' · submitted '}
                      {new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <StatusChip status={overallStatus} scope="overall" />
                </div>
                <ApprovalChain
                  steps={[
                    { label: teammateLabel, status: r.teammateStatus },
                    { label: `${MANAGER_NAME} approval`, status: r.teammateStatus === 'accepted' ? r.managerStatus : 'pending' },
                  ]}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {action && (
        <ShiftActionModal
          action={action}
          onClose={() => setAction(null)}
          onSubmit={(teammateName, targetShift) => {
            submitRequest(action.kind, action.myShift, teammateName, targetShift);
            setAction(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Row ────────────────────────────────────────────────────────────────────

function MyShiftRow({
  shift, onRequestSwap, onAskCover, requestedSwap, requestedCover,
}: {
  shift: ShiftBlock;
  onRequestSwap: () => void;
  onAskCover: () => void;
  requestedSwap: boolean;
  requestedCover: boolean;
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#929292' }} />
          <p className="text-sm font-semibold" style={{ color: '#222222' }}>
            {shift.label} · {fmtTime(shift.start)} – {fmtTime(shift.end)}
          </p>
        </div>
        <p className="text-xs mt-0.5 ml-5" style={{ color: '#929292' }}>
          {shift.role}{shift.note ? ` · ${shift.note}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onRequestSwap}
          disabled={requestedSwap}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-xl text-xs font-semibold"
          style={{ background: requestedSwap ? '#fef3c7' : '#f7f7f7', color: requestedSwap ? '#b45309' : '#6a6a6a', border: '1px solid #dddddd', cursor: requestedSwap ? 'default' : 'pointer' }}
        >
          {requestedSwap ? <><CircleDashed className="w-3 h-3" /> Pending</> : <><RefreshCw className="w-3 h-3" /> Swap</>}
        </button>
        <button
          onClick={onAskCover}
          disabled={requestedCover}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-xl text-xs font-semibold"
          style={{ background: requestedCover ? '#fef3c7' : '#f7f7f7', color: requestedCover ? '#b45309' : '#6a6a6a', border: '1px solid #dddddd', cursor: requestedCover ? 'default' : 'pointer' }}
        >
          {requestedCover ? <><CircleDashed className="w-3 h-3" /> Pending</> : <><UserPlus className="w-3 h-3" /> Cover</>}
        </button>
      </div>
    </div>
  );
}

// ─── Approval chain ─────────────────────────────────────────────────────────

function ApprovalChain({ steps }: { steps: { label: string; status: ApprovalState }[] }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {steps.map((step, idx) => {
        const iconFor = (s: ApprovalState) => {
          if (s === 'accepted' || s === 'approved') return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />;
          if (s === 'declined') return <X className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />;
          if (s === 'pending') return <CircleDashed className="w-3.5 h-3.5" style={{ color: '#b45309' }} />;
          return <CircleDot className="w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />;
        };
        const textFor = (s: ApprovalState) => {
          if (s === 'accepted') return 'accepted';
          if (s === 'approved') return 'approved';
          if (s === 'declined') return 'declined';
          return 'pending';
        };
        return (
          <div key={idx} className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5">
              {iconFor(step.status)}
              <span className="text-[11px] font-medium" style={{ color: '#3f3f3f' }}>
                {step.label}
              </span>
              <span className="text-[10px] italic" style={{ color: '#929292' }}>· {textFor(step.status)}</span>
            </div>
            {idx < steps.length - 1 && <span className="text-xs" style={{ color: '#c1c1c1' }}>→</span>}
          </div>
        );
      })}
    </div>
  );
}

function StatusChip({ status, scope }: { status: ApprovalState; scope: 'manager' | 'overall' }) {
  const color =
    status === 'approved' ? { bg: '#d1fae5', fg: '#047857', label: 'Approved' }
    : status === 'declined' ? { bg: '#fee2e2', fg: '#b91c1c', label: 'Declined' }
    : status === 'accepted' ? { bg: '#e0e7ff', fg: '#3730a3', label: 'Teammate accepted' }
    : { bg: '#fef3c7', fg: '#b45309', label: scope === 'manager' ? 'Awaiting manager' : 'Pending' };
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: color.bg, color: color.fg }}>
      {color.label}
    </span>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function ShiftActionModal({
  action, onClose, onSubmit,
}: {
  action: NonNullable<ShiftAction>;
  onClose: () => void;
  onSubmit: (teammateName: string, targetShift: ColleagueShift | null) => void;
}) {
  const [colleagueId, setColleagueId] = useState<string | null>(null);
  const [targetShiftId, setTargetShiftId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const colleague: Colleague | null = colleagueId
    ? SRAVAN_COLLEAGUES.find((c) => c.id === colleagueId) ?? null
    : null;

  const targetShift: ColleagueShift | null = colleague && targetShiftId
    ? colleague.shiftsThisWeek.find((s) => s.shiftId === targetShiftId) ?? null
    : null;

  const canSubmit =
    action.kind === 'cover'
      ? true
      : colleague !== null && targetShiftId !== null;

  const handleSubmit = () => {
    const teammate = colleague ? colleague.name : 'Any teammate';
    onSubmit(teammate, targetShift);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#222222' }}>
              {action.kind === 'swap' ? 'Request Shift Swap' : 'Ask for Cover'}
            </h2>
            <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
              {action.kind === 'swap'
                ? 'Trade your shift for one of a teammate’s this week.'
                : 'Give away your shift. A teammate takes it off your schedule.'}
              {' · '}
              <span className="font-semibold" style={{ color: '#b45309' }}>
                {MANAGER_NAME} must approve.
              </span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f7f7f7]">
            <X className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="rounded-xl p-4" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#6a6a6a' }}>
              Your shift
            </p>
            <p className="text-sm font-semibold" style={{ color: '#222222' }}>
              {action.myShift.label} · {fmtTime(action.myShift.start)} – {fmtTime(action.myShift.end)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{action.myShift.role}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>
              {action.kind === 'swap' ? 'Choose a teammate to swap with' : 'Ask a specific teammate (or skip to ask everyone)'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SRAVAN_COLLEAGUES.map((c) => {
                const active = colleagueId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setColleagueId(c.id); setTargetShiftId(null); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors"
                    style={{
                      background: active ? 'rgba(15,118,110,0.08)' : '#ffffff',
                      border: active ? '1px solid #0f766e' : '1px solid #dddddd',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                      style={{ background: c.avatarColor }}
                    >
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#222222' }}>{c.name}</p>
                      <p className="text-[11px]" style={{ color: '#929292' }}>{c.role}</p>
                    </div>
                    {active && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#0f766e' }} />}
                  </button>
                );
              })}
            </div>
            {action.kind === 'cover' && (
              <button
                onClick={() => { setColleagueId(null); setTargetShiftId(null); }}
                className="mt-2 text-xs font-semibold"
                style={{ color: colleagueId ? '#ff385c' : '#929292' }}
              >
                {colleagueId ? '← Clear · ask any teammate' : 'Will ask any teammate'}
              </button>
            )}
          </div>

          {action.kind === 'swap' && colleague && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>
                Which of {colleague.name.split(' ')[0]}&apos;s shifts do you want?
              </p>
              {colleague.shiftsThisWeek.length === 0 ? (
                <p className="text-sm" style={{ color: '#929292' }}>No shifts this week.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {colleague.shiftsThisWeek.map((cs: ColleagueShift) => {
                    const active = targetShiftId === cs.shiftId;
                    return (
                      <button
                        key={cs.shiftId}
                        onClick={() => setTargetShiftId(cs.shiftId)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
                        style={{
                          background: active ? 'rgba(15,118,110,0.08)' : '#ffffff',
                          border: active ? '1px solid #0f766e' : '1px solid #dddddd',
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#222222' }}>
                            {cs.label} · {fmtTime(cs.start)} – {fmtTime(cs.end)}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{cs.role}</p>
                        </div>
                        {active && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#0f766e' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>
              Message (optional)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={action.kind === 'swap' ? 'e.g. I have a family event that night…' : 'e.g. Appreciate it! Happy to return the favor.'}
              className="w-full text-sm rounded-xl p-3 outline-none resize-none"
              style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#222222', minHeight: 70 }}
            />
          </div>

          {/* Approval preview */}
          <div className="rounded-xl p-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#92400e' }}>
              Approval steps
            </p>
            <ApprovalChain
              steps={[
                {
                  label: action.kind === 'swap'
                    ? `${colleague?.name.split(' ')[0] ?? 'Teammate'} accepts`
                    : colleague
                      ? `${colleague.name.split(' ')[0]} accepts`
                      : 'Teammate picks up',
                  status: 'pending',
                },
                { label: `${MANAGER_NAME} approves`, status: 'pending' },
              ]}
            />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-9 px-5 rounded-xl text-sm font-semibold"
            style={{
              background: canSubmit ? '#ff385c' : '#f0f0f0',
              color: canSubmit ? '#ffffff' : '#929292',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {action.kind === 'swap' ? 'Send Swap Request' : 'Send Cover Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
