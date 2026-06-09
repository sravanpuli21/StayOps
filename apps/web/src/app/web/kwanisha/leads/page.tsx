'use client';

import { useMemo, useState } from 'react';
import { UserPlus, Search, Plus, Check, X, ChevronRight, Building2 } from 'lucide-react';
import {
  useSalesState, addLead, updateLead,
  PROPERTY, PRIORITIES, PRIORITY_STYLE, PULSE_CATEGORY_LABEL,
  LEAD_STATUS_LABEL, LEAD_TYPE_LABEL, fmtDate,
  type SalesLead, type LeadStatus, type LeadType, type PulseCategory,
  type Priority, type Confidence,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* Status pill styles (mirrors demand/page.tsx vocabulary). */
const STATUS_STYLE: Record<LeadStatus, { fg: string; bg: string }> = {
  new:             { fg: '#1d4ed8', bg: '#dbeafe' },
  'needs-research':{ fg: '#b45309', bg: '#fef3c7' },
  qualified:       { fg: '#7c3aed', bg: '#ece4fb' },
  converted:       { fg: '#15803d', bg: '#dcfce7' },
  'not-useful':    { fg: '#b91c1c', bg: '#fee2e2' },
  duplicate:       { fg: '#6a6a6a', bg: '#f0f0f0' },
  nurture:         { fg: '#0891b2', bg: '#cffafe' },
  lost:            { fg: '#6a6a6a', bg: '#f0f0f0' },
};

const TYPE_STYLE = { fg: '#7c3aed', bg: '#ece4fb' };

const STATUS_ORDER: LeadStatus[] = ['new', 'needs-research', 'qualified', 'converted', 'nurture', 'not-useful', 'duplicate', 'lost'];

const CONFIDENCES: Confidence[] = ['low', 'medium', 'high'];
const CONFIDENCE_LABEL: Record<Confidence, string> = { low: 'Low', medium: 'Medium', high: 'High' };

/* ── New-lead form draft ──────────────────────────────────────────────── */
interface LeadDraft {
  name: string; type: LeadType; source: string; category: PulseCategory;
  company: string; contact: string; description: string; potentialDates: string;
  guestOrigin: string; estRooms: string; estRoomNights: string; estValue: string;
  confidence: Confidence; priority: Priority; nextAction: string; followUpDate: string;
}

const emptyDraft = (): LeadDraft => ({
  name: '', type: 'company', source: 'Front Desk Pulse', category: 'unknown',
  company: '', contact: '', description: '', potentialDates: '', guestOrigin: '',
  estRooms: '', estRoomNights: '', estValue: '', confidence: 'medium', priority: 'normal',
  nextAction: '', followUpDate: '',
});

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

export default function LeadsPage() {
  const { leads } = useSalesState();
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<LeadDraft>(emptyDraft);

  const set = <K extends keyof LeadDraft>(k: K, v: LeadDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Only show status pills for statuses that exist plus a sensible order.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.name, l.company, l.contact, l.description]
        .some((f) => f?.toLowerCase().includes(q));
    });
  }, [leads, statusFilter, query]);

  const canSave = draft.name.trim().length > 0;

  function save() {
    if (!canSave) return;
    addLead({
      name: draft.name.trim(),
      type: draft.type,
      source: draft.source.trim() || 'Front Desk Pulse',
      category: draft.category,
      company: draft.company.trim() || undefined,
      contact: draft.contact.trim() || undefined,
      description: draft.description.trim() || undefined,
      potentialDates: draft.potentialDates.trim() || undefined,
      guestOrigin: draft.guestOrigin.trim() || undefined,
      estRooms: num(draft.estRooms),
      estRoomNights: num(draft.estRoomNights),
      estValue: num(draft.estValue),
      confidence: draft.confidence,
      priority: draft.priority,
      nextAction: draft.nextAction.trim() || undefined,
      status: 'new',
      followUpDate: draft.followUpDate || undefined,
    });
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
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Leads</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Early, unqualified signals that may become opportunities — captured from front-desk pulses, walk-ins,
            and tips before they&rsquo;re proven worth pursuing. {PROPERTY.name} · {PROPERTY.code}
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
          style={{ background: '#7c3aed', color: '#fff' }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'Add Lead'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-4 flex flex-col gap-4" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: '#7c3aed' }} />
            <p className="font-bold text-sm" style={{ color: '#222' }}>New lead</p>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Field label="Lead Name *">
              <input value={draft.name} onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. ABC Construction Monthly Travel" style={inputBase} />
            </Field>
            <Field label="Lead Type">
              <select value={draft.type} onChange={(e) => set('type', e.target.value as LeadType)} style={inputBase}>
                {(Object.keys(LEAD_TYPE_LABEL) as LeadType[]).map((t) => (
                  <option key={t} value={t}>{LEAD_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Source">
              <input value={draft.source} onChange={(e) => set('source', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(e) => set('category', e.target.value as PulseCategory)} style={inputBase}>
                {(Object.keys(PULSE_CATEGORY_LABEL) as PulseCategory[]).map((c) => (
                  <option key={c} value={c}>{PULSE_CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </Field>
            <Field label="Company">
              <input value={draft.company} onChange={(e) => set('company', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Contact">
              <input value={draft.contact} onChange={(e) => set('contact', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Potential Dates">
              <input value={draft.potentialDates} onChange={(e) => set('potentialDates', e.target.value)}
                placeholder="e.g. Monthly · May 2027" style={inputBase} />
            </Field>
            <Field label="Guest Origin">
              <input value={draft.guestOrigin} onChange={(e) => set('guestOrigin', e.target.value)}
                placeholder="e.g. Atlanta" style={inputBase} />
            </Field>
            <Field label="Estimated Rooms">
              <input type="number" inputMode="numeric" min={0} value={draft.estRooms}
                onChange={(e) => set('estRooms', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Estimated Room Nights">
              <input type="number" inputMode="numeric" min={0} value={draft.estRoomNights}
                onChange={(e) => set('estRoomNights', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Estimated Value ($)">
              <input type="number" inputMode="numeric" min={0} value={draft.estValue}
                onChange={(e) => set('estValue', e.target.value)} style={inputBase} />
            </Field>
            <Field label="Confidence">
              <select value={draft.confidence} onChange={(e) => set('confidence', e.target.value as Confidence)} style={inputBase}>
                {CONFIDENCES.map((c) => <option key={c} value={c}>{CONFIDENCE_LABEL[c]}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={draft.priority} onChange={(e) => set('priority', e.target.value as Priority)} style={inputBase}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </Field>
            <Field label="Follow-up Date">
              <input type="date" value={draft.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} style={inputBase} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={draft.description} onChange={(e) => set('description', e.target.value)}
              placeholder="What did the guest / front desk say?" rows={2}
              style={{ ...inputBase, height: 'auto', padding: '10px 12px', lineHeight: 1.5 }} />
          </Field>
          <Field label="Next Action">
            <input value={draft.nextAction} onChange={(e) => set('nextAction', e.target.value)}
              placeholder="e.g. Find travel decision-maker" style={inputBase} />
          </Field>

          <div className="flex items-center gap-2 justify-end">
            <button onClick={cancel}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={save} disabled={!canSave}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: canSave ? '#7c3aed' : '#cbb8ee', color: '#fff', cursor: canSave ? 'pointer' : 'not-allowed' }}>
              <Check className="w-4 h-4" /> Save lead
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
          placeholder="Search by name, company, contact, or description"
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
        {([['all', 'All'] as const, ...STATUS_ORDER.map((s) => [s, LEAD_STATUS_LABEL[s]] as const)]).map(([k, label]) => {
          const on = statusFilter === k;
          return (
            <button key={k} onClick={() => setStatusFilter(k)} className="h-9 px-3.5 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Lead list */}
      <div className="flex flex-col gap-4">
        {filtered.map((l) => (
          <LeadRow key={l.id} lead={l} />
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-10 flex flex-col items-center text-center gap-1.5"
            style={{ ...card, borderStyle: 'dashed', background: '#fafafa' }}>
            <UserPlus className="w-6 h-6 mb-1" style={{ color: '#929292' }} />
            <p className="text-sm font-semibold" style={{ color: '#222' }}>
              {leads.length === 0 ? 'No leads yet.' : 'No leads match.'}
            </p>
            <p className="text-xs" style={{ color: '#929292' }}>
              {leads.length === 0
                ? 'No leads yet. Convert a pulse signal or add a new lead.'
                : 'Try a different status filter or clear your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single lead card (table-like, stacks on mobile) ──────────────────── */
function LeadRow({ lead }: { lead: SalesLead }) {
  const ps = PRIORITY_STYLE[lead.priority];
  const ss = STATUS_STYLE[lead.status];

  return (
    <div className="p-4 flex flex-col gap-3" style={card}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: '#222' }}>{lead.name}</p>
            <Badge label={LEAD_TYPE_LABEL[lead.type]} fg={TYPE_STYLE.fg} bg={TYPE_STYLE.bg} />
            <Badge label={ss ? LEAD_STATUS_LABEL[lead.status] : lead.status} fg={ss.fg} bg={ss.bg} />
            <Badge label={ps.label} fg={ps.fg} bg={ps.bg} />
          </div>
          {lead.description && (
            <p className="text-xs mt-1" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{lead.description}</p>
          )}
        </div>
      </div>

      {/* Meta row: source, category, company/contact, created */}
      <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <span className="text-xs" style={{ color: '#6a6a6a' }}>
          Source: <span style={{ color: '#222', fontWeight: 600 }}>{lead.source}</span>
        </span>
        <span className="text-xs" style={{ color: '#6a6a6a' }}>
          {PULSE_CATEGORY_LABEL[lead.category]}
        </span>
        {(lead.company || lead.contact) && (
          <span className="text-xs" style={{ color: '#6a6a6a' }}>
            {[lead.company, lead.contact].filter(Boolean).join(' · ')}
          </span>
        )}
        <span className="text-xs" style={{ color: '#929292' }}>
          Created {fmtDate(lead.createdAt)}
        </span>
      </div>

      {lead.nextAction && (
        <div className="flex items-center gap-1.5 p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7c3aed' }} />
          <span className="text-xs" style={{ color: '#222' }}>
            <span style={{ color: '#929292' }}>Next: </span>{lead.nextAction}
          </span>
        </div>
      )}

      {/* Inline actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <ActionButton
          label="Qualify"
          icon={<Check className="w-3.5 h-3.5" />}
          active={lead.status === 'qualified'}
          onClick={() => updateLead(lead.id, { status: 'qualified' })}
        />
        <ActionButton
          label="Convert to Opportunity"
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          tone="accent"
          active={lead.status === 'converted'}
          onClick={() => updateLead(lead.id, { status: 'converted' })}
        />
        <ActionButton
          label="Nurture Later"
          active={lead.status === 'nurture'}
          onClick={() => updateLead(lead.id, { status: 'nurture' })}
        />
        <ActionButton
          label="Mark Not Useful"
          icon={<X className="w-3.5 h-3.5" />}
          tone="danger"
          active={lead.status === 'not-useful'}
          onClick={() => updateLead(lead.id, { status: 'not-useful' })}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label, icon, onClick, active, tone = 'neutral',
}: {
  label: string; icon?: React.ReactNode; onClick: () => void; active?: boolean;
  tone?: 'neutral' | 'accent' | 'danger';
}) {
  const toneStyle = active
    ? tone === 'danger'
      ? { fg: '#b91c1c', bg: '#fee2e2', bd: '#fee2e2' }
      : tone === 'accent'
        ? { fg: '#fff', bg: '#7c3aed', bd: '#7c3aed' }
        : { fg: '#15803d', bg: '#dcfce7', bd: '#dcfce7' }
    : { fg: '#6a6a6a', bg: '#fff', bd: '#dddddd' };
  return (
    <button onClick={onClick}
      className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
      style={{ background: toneStyle.bg, color: toneStyle.fg, border: `1px solid ${toneStyle.bd}` }}>
      {icon}{label}
    </button>
  );
}
