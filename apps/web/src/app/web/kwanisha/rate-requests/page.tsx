'use client';

import { useMemo, useState } from 'react';
import { Percent, Plus, Send, X, Check, Search, Building2 } from 'lucide-react';
import {
  useSalesState, addRateRequest, updateRateRequest,
  PROPERTY, PRIORITIES, PRIORITY_STYLE,
  RATE_REQUEST_TYPE_LABEL, RATE_REQUEST_STATUS_LABEL, RATE_REQUEST_STATUS_STYLE,
  SEND_TO_LABEL, fmtDate, fmtMoney,
  type RateRequest, type RateRequestType, type RateRequestStatus,
  type SendTo, type Priority,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

const TYPE_STYLE = { fg: '#7c3aed', bg: '#ece4fb' };

/* Status order for the filter pills (matches the request lifecycle). */
const STATUS_ORDER: RateRequestStatus[] = [
  'draft', 'submitted', 'under-review', 'needs-info', 'approved', 'rejected', 'cancelled',
];

/* Statuses where the ball is in the Revenue Manager's court. */
const AWAITING: RateRequestStatus[] = ['submitted', 'under-review', 'needs-info'];

const num = (v: string): number | undefined => {
  const n = Number(v);
  return v.trim() === '' || Number.isNaN(n) ? undefined : n;
};

/* Shared field chrome for the create form. */
const inputBase: React.CSSProperties = {
  height: 40, borderRadius: 12, border: '1px solid #dddddd', padding: '0 12px',
  fontSize: 14, color: '#222', background: '#fff', width: '100%',
};
const labelCls = 'text-xs font-semibold';
const labelStyle: React.CSSProperties = { color: '#6a6a6a' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls} style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

/* ── New rate-request form draft ──────────────────────────────────────── */
interface RequestDraft {
  title: string; type: RateRequestType;
  relatedAccount: string; relatedOpportunity: string; relatedEvent: string;
  dates: string; estRooms: string; estRoomNights: string; requestedRate: string;
  reason: string; expectedValue: string; competitorNotes: string;
  urgency: Priority; sendTo: SendTo;
}

const emptyDraft = (): RequestDraft => ({
  title: '', type: 'corporate',
  relatedAccount: '', relatedOpportunity: '', relatedEvent: '',
  dates: '', estRooms: '', estRoomNights: '', requestedRate: '',
  reason: '', expectedValue: '', competitorNotes: '',
  urgency: 'normal', sendTo: 'revenue-manager',
});

export default function RateRequestsPage() {
  const { rateRequests } = useSalesState();
  const [statusFilter, setStatusFilter] = useState<'all' | RateRequestStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | RateRequestType>('all');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<RequestDraft>(emptyDraft);

  const set = <K extends keyof RequestDraft>(k: K, v: RequestDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rateRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (!q) return true;
      return [r.title, r.relatedAccount, r.reason]
        .some((f) => f?.toLowerCase().includes(q));
    });
  }, [rateRequests, statusFilter, typeFilter, query]);

  const canSave = draft.title.trim().length > 0;

  // Build the shared payload from the draft. Kwanisha only ever creates/submits;
  // the status is decided by which button she presses (draft vs submitted).
  function buildPayload(status: RateRequestStatus): Omit<
    RateRequest, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt'
  > {
    return {
      title: draft.title.trim(),
      type: draft.type,
      relatedAccount: draft.relatedAccount.trim() || undefined,
      relatedOpportunity: draft.relatedOpportunity.trim() || undefined,
      relatedEvent: draft.relatedEvent.trim() || undefined,
      dates: draft.dates.trim() || undefined,
      estRooms: num(draft.estRooms),
      estRoomNights: num(draft.estRoomNights),
      requestedRate: num(draft.requestedRate),
      reason: draft.reason.trim() || undefined,
      expectedValue: num(draft.expectedValue),
      competitorNotes: draft.competitorNotes.trim() || undefined,
      urgency: draft.urgency,
      sendTo: draft.sendTo,
      status,
    };
  }

  function saveDraft() {
    if (!canSave) return;
    addRateRequest(buildPayload('draft'));
    setDraft(emptyDraft());
    setShowForm(false);
  }

  function submitRequest() {
    if (!canSave) return;
    addRateRequest(buildPayload('submitted'));
    setDraft(emptyDraft());
    setShowForm(false);
  }

  function cancel() {
    setDraft(emptyDraft());
    setShowForm(false);
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Heading */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Rate Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Request a rate review from the Revenue Manager — you recommend, they decide. {PROPERTY.name}.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
          style={{ background: '#7c3aed', color: '#fff' }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'New Rate Request'}
        </button>
      </div>

      {/* How it works strip — reinforces the read-only / request-only rule */}
      <div className="p-4 flex items-start gap-3" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
        <Percent className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
        <p className="text-sm" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>
          You can&rsquo;t change rates here — you
          <span style={{ color: '#222', fontWeight: 600 }}> request a review</span> and notify the Revenue Manager
          (or Regional Operations). They review and decide:
          <span style={{ color: '#222', fontWeight: 600 }}> approved</span>, rejected, or needs more info. Use this to
          recommend a corporate or group rate, or to flag a high-demand date worth a price review.
        </p>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-4 flex flex-col gap-4" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5" style={{ color: '#7c3aed' }} />
            <p className="font-bold text-sm" style={{ color: '#222' }}>New rate request</p>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Field label="Request Title *">
              <input value={draft.title} onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. ABC Construction monthly corporate rate" style={inputBase} />
            </Field>
            <Field label="Request Type">
              <select value={draft.type} onChange={(e) => set('type', e.target.value as RateRequestType)} style={inputBase}>
                {(Object.keys(RATE_REQUEST_TYPE_LABEL) as RateRequestType[]).map((t) => (
                  <option key={t} value={t}>{RATE_REQUEST_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Related Account">
              <input value={draft.relatedAccount} onChange={(e) => set('relatedAccount', e.target.value)}
                placeholder="e.g. ABC Construction" style={inputBase} />
            </Field>
            <Field label="Related Opportunity">
              <input value={draft.relatedOpportunity} onChange={(e) => set('relatedOpportunity', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Related Market Event">
              <input value={draft.relatedEvent} onChange={(e) => set('relatedEvent', e.target.value)}
                placeholder="e.g. SCAD Commencement" style={inputBase} />
            </Field>
            <Field label="Requested Dates">
              <input value={draft.dates} onChange={(e) => set('dates', e.target.value)}
                placeholder="e.g. Monthly · May 2027" style={inputBase} />
            </Field>
            <Field label="Estimated Rooms">
              <input type="number" inputMode="numeric" min={0} value={draft.estRooms}
                onChange={(e) => set('estRooms', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Estimated Room Nights">
              <input type="number" inputMode="numeric" min={0} value={draft.estRoomNights}
                onChange={(e) => set('estRoomNights', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Requested Rate (if known, $)">
              <input type="number" inputMode="numeric" min={0} value={draft.requestedRate}
                onChange={(e) => set('requestedRate', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Expected Value ($)">
              <input type="number" inputMode="numeric" min={0} value={draft.expectedValue}
                onChange={(e) => set('expectedValue', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Urgency">
              <select value={draft.urgency} onChange={(e) => set('urgency', e.target.value as Priority)} style={inputBase}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </Field>
            <Field label="Send To">
              <select value={draft.sendTo} onChange={(e) => set('sendTo', e.target.value as SendTo)} style={inputBase}>
                {(Object.keys(SEND_TO_LABEL) as SendTo[]).map((s) => (
                  <option key={s} value={s}>{SEND_TO_LABEL[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Reason for Request">
            <textarea value={draft.reason} onChange={(e) => set('reason', e.target.value)}
              placeholder="Why does this rate need a review? What's the opportunity?" rows={2}
              style={{ ...inputBase, height: 'auto', padding: '10px 12px', lineHeight: 1.5 }} />
          </Field>
          <Field label="Competitor Notes">
            <textarea value={draft.competitorNotes} onChange={(e) => set('competitorNotes', e.target.value)}
              placeholder="What are nearby hotels charging? Any compression or overflow?" rows={2}
              style={{ ...inputBase, height: 'auto', padding: '10px 12px', lineHeight: 1.5 }} />
          </Field>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            <button onClick={cancel}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={saveDraft} disabled={!canSave}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#fff', color: canSave ? '#7c3aed' : '#cbb8ee', border: `1px solid ${canSave ? '#7c3aed' : '#e0d4f7'}`, cursor: canSave ? 'pointer' : 'not-allowed' }}>
              <Check className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={submitRequest} disabled={!canSave}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: canSave ? '#7c3aed' : '#cbb8ee', color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed' }}>
              <Send className="w-4 h-4" /> Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-full" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, account, or reason"
          className="flex-1 min-w-0 text-sm bg-transparent outline-none"
          style={{ color: '#222' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="flex-shrink-0" aria-label="Clear search">
            <X className="w-4 h-4" style={{ color: '#929292' }} />
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {([['all', 'All'] as const, ...STATUS_ORDER.map((s) => [s, RATE_REQUEST_STATUS_LABEL[s]] as const)]).map(([k, label]) => {
          const on = statusFilter === k;
          return (
            <button key={k} onClick={() => setStatusFilter(k)} className="h-9 px-3.5 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {([['all', 'All types'] as const, ...(Object.keys(RATE_REQUEST_TYPE_LABEL) as RateRequestType[]).map((t) => [t, RATE_REQUEST_TYPE_LABEL[t]] as const)]).map(([k, label]) => {
          const on = typeFilter === k;
          return (
            <button key={k} onClick={() => setTypeFilter(k)} className="h-8 px-3 rounded-full text-xs font-semibold"
              style={{ background: on ? '#ece4fb' : '#fff', color: on ? '#7c3aed' : '#929292', border: `1px solid ${on ? '#e0d4f7' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Request list */}
      <div className="flex flex-col gap-4">
        {filtered.map((r) => (
          <RequestRow key={r.id} request={r} />
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-10 flex flex-col items-center text-center gap-1.5"
            style={{ ...card, borderStyle: 'dashed', background: '#fafafa' }}>
            <Percent className="w-6 h-6 mb-1" style={{ color: '#929292' }} />
            <p className="text-sm font-semibold" style={{ color: '#222' }}>
              {rateRequests.length === 0 ? 'No rate requests yet.' : 'No requests match.'}
            </p>
            <p className="text-xs" style={{ color: '#929292' }}>
              {rateRequests.length === 0
                ? 'No rate requests yet. Flag a high-demand date or request a corporate/group rate review.'
                : 'Try a different status or type filter, or clear your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single rate-request card (stacks on mobile) ──────────────────────── */
function RequestRow({ request: r }: { request: RateRequest }) {
  const ps = PRIORITY_STYLE[r.urgency];
  const ss = RATE_REQUEST_STATUS_STYLE[r.status];
  const awaiting = AWAITING.includes(r.status);

  // Related context line: account / opportunity / event, whichever exist.
  const related = [r.relatedAccount, r.relatedOpportunity, r.relatedEvent].filter(Boolean).join(' · ');

  return (
    <div className="p-4 flex flex-col gap-3" style={card}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
          <Percent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: '#222' }}>{r.title}</p>
            <Badge label={RATE_REQUEST_TYPE_LABEL[r.type]} fg={TYPE_STYLE.fg} bg={TYPE_STYLE.bg} />
            <Badge label={RATE_REQUEST_STATUS_LABEL[r.status]} fg={ss.fg} bg={ss.bg} />
            <Badge label={ps.label} fg={ps.fg} bg={ps.bg} />
          </div>
          {related && (
            <p className="text-xs mt-1 inline-flex items-center gap-1.5" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" /> {related}
            </p>
          )}
          {r.reason && (
            <p className="text-xs mt-1" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{r.reason}</p>
          )}
        </div>
      </div>

      {/* Meta row: send-to, dates, rooms, value, created */}
      <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
          <Send className="w-3.5 h-3.5" /> {SEND_TO_LABEL[r.sendTo]}
        </span>
        {r.dates && (
          <span className="text-xs" style={{ color: '#6a6a6a' }}>
            Dates: <span style={{ color: '#222', fontWeight: 600 }}>{r.dates}</span>
          </span>
        )}
        {(r.estRooms != null || r.estRoomNights != null) && (
          <span className="text-xs" style={{ color: '#6a6a6a' }}>
            {[r.estRooms != null ? `${r.estRooms} rooms` : null, r.estRoomNights != null ? `${r.estRoomNights} room nights` : null].filter(Boolean).join(' · ')}
          </span>
        )}
        {r.requestedRate != null && (
          <span className="text-xs" style={{ color: '#6a6a6a' }}>
            Requested rate: <span style={{ color: '#222', fontWeight: 600 }}>{fmtMoney(r.requestedRate)}</span>
          </span>
        )}
        {r.expectedValue != null && (
          <span className="text-xs" style={{ color: '#6a6a6a' }}>
            Value: <span style={{ color: '#222', fontWeight: 600 }}>{fmtMoney(r.expectedValue)}</span>
          </span>
        )}
        <span className="text-xs" style={{ color: '#929292' }}>
          Created {fmtDate(r.createdAt)}
        </span>
      </div>

      {r.competitorNotes && (
        <div className="flex items-start gap-1.5 p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
          <span className="text-xs" style={{ color: '#222', lineHeight: 1.5 }}>
            <span style={{ color: '#929292' }}>Competitors: </span>{r.competitorNotes}
          </span>
        </div>
      )}

      {/* Decision from the Revenue Manager, if one has been recorded. */}
      {r.decision && (
        <div className="flex items-start gap-1.5 p-2.5 rounded-xl" style={{ background: ss.bg }}>
          <span className="text-xs" style={{ color: ss.fg, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>Decision: </span>{r.decision}
          </span>
        </div>
      )}

      {/* Awaiting note — she can't approve her own; the RM owns the decision. */}
      {awaiting && (
        <p className="text-xs" style={{ color: '#929292' }}>
          Awaiting Revenue Manager — you recommend, they decide.
        </p>
      )}

      {/* Actions — create/submit/cancel only. No approve/reject for Kwanisha. */}
      {r.status !== 'cancelled' && (
        <div className="flex items-center gap-2 flex-wrap">
          {r.status === 'draft' && (
            <button onClick={() => updateRateRequest(r.id, { status: 'submitted' })}
              className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#7c3aed', color: '#fff', border: '1px solid #7c3aed' }}>
              <Send className="w-3.5 h-3.5" /> Submit Request
            </button>
          )}
          <button onClick={() => updateRateRequest(r.id, { status: 'cancelled' })}
            className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
            style={{ background: '#fff', color: '#b91c1c', border: '1px solid #dddddd' }}>
            <X className="w-3.5 h-3.5" /> Cancel Request
          </button>
        </div>
      )}
    </div>
  );
}
