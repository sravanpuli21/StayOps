'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Plus, Repeat, X, Check, Bell, Search } from 'lucide-react';
import {
  useSalesState, addMarketEvent, updateMarketEvent,
  MARKET_CATEGORY_LABEL, IMPACT_LABEL, IMPACT_STYLE, MARKET_STATUS_LABEL,
  REMINDER_OPTIONS, REMINDER_LABEL, PROPERTY,
  type MarketEvent, type MarketCategory, type Impact, type MarketEventStatus, type Recurring,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

type View = 'list' | 'high-impact';
type CatFilter = MarketCategory | 'all';

const HIGH_IMPACT: Impact[] = ['high', 'very-high'];

/* Status chip styling — neutral by default, accented for confirmed/watching/completed. */
const STATUS_STYLE: Record<MarketEventStatus, { fg: string; bg: string }> = {
  observed: { fg: '#6a6a6a', bg: '#f0f0f0' },
  research: { fg: '#b45309', bg: '#fef3c7' },
  confirmed: { fg: '#15803d', bg: '#dcfce7' },
  watching: { fg: '#7c3aed', bg: '#ece4fb' },
  outreach: { fg: '#1d4ed8', bg: '#dbeafe' },
  'rate-review': { fg: '#0891b2', bg: '#cffafe' },
  active: { fg: '#15803d', bg: '#dcfce7' },
  completed: { fg: '#6a6a6a', bg: '#f0f0f0' },
  archived: { fg: '#929292', bg: '#f7f7f7' },
};

const fmtRange = (start: string, end?: string) => {
  const f = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!start) return '—';
  return end && end !== start ? `${f(start)} – ${f(end)}` : f(start);
};

const reminderChips = (reminders: string[]) =>
  reminders.map((r) => REMINDER_LABEL[r]?.replace(/ months? before/, 'mo').replace(/ weeks? before/, 'wk').replace(/ week before/, 'wk') ?? r);

const inputStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #dddddd', borderRadius: 10, color: '#222',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold" style={{ color: '#222' }}>{label}</span>
      {children}
    </label>
  );
}

const RECURRING_LABEL: Record<Recurring, string> = { yes: 'Recurring', no: 'One-time', unknown: 'Recurrence unknown' };

export default function MarketCalendarPage() {
  const { events } = useSalesState();
  const [view, setView] = useState<View>('list');
  const [cat, setCat] = useState<CatFilter>('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Show archived only when the user explicitly filters status-style via category 'archived'?
  // Per spec: filter out archived unless category/status shows them. We expose archived in the
  // category bar so it can be revealed deliberately.
  const visible = useMemo(() => {
    return events
      .filter((e) => cat === 'all' ? e.status !== 'archived' : true)
      .filter((e) => cat === 'all' || e.category === cat)
      .filter((e) => view === 'list' || HIGH_IMPACT.includes(e.impact))
      .filter((e) => {
        if (!q.trim()) return true;
        const hay = `${e.name} ${MARKET_CATEGORY_LABEL[e.category]} ${e.pastImpact ?? ''} ${e.salesAction ?? ''} ${e.revenueAction ?? ''} ${e.notes ?? ''}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, cat, view, q]);

  const highImpactCount = useMemo(
    () => events.filter((e) => e.status !== 'archived' && HIGH_IMPACT.includes(e.impact)).length,
    [events],
  );

  const catOptions: Array<{ key: CatFilter; label: string }> = [
    { key: 'all', label: 'All' },
    ...(Object.keys(MARKET_CATEGORY_LABEL) as MarketCategory[]).map((k) => ({ key: k, label: MARKET_CATEGORY_LABEL[k] })),
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Market Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Events, demand patterns, recurring opportunities, and future revenue moments for {PROPERTY.name}.
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-semibold flex-shrink-0"
          style={{ background: showForm ? '#fff' : '#7c3aed', color: showForm ? '#6a6a6a' : '#fff', border: `1px solid ${showForm ? '#dddddd' : '#7c3aed'}` }}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'Add Event'}
        </button>
      </div>

      {showForm && <CreateForm onClose={() => setShowForm(false)} />}

      {/* View + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {([['list', 'List'], ['high-impact', `High Impact${highImpactCount ? ` (${highImpactCount})` : ''}`]] as const).map(([k, label]) => {
            const on = view === k;
            return (
              <button key={k} onClick={() => setView(k)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold"
                style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
                <CalendarDays className="w-3.5 h-3.5" /> {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[180px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events"
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {catOptions.map((c) => {
          const on = c.key === cat;
          return (
            <button key={c.key} onClick={() => setCat(c.key)} className="h-8 px-3 rounded-full text-[11px] font-semibold"
              style={{ background: on ? '#ece4fb' : '#fff', color: on ? '#7c3aed' : '#6a6a6a', border: `1px solid ${on ? '#7c3aed' : '#dddddd'}` }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-4">
        {visible.map((e) => <EventCard key={e.id} e={e} />)}

        {visible.length === 0 && events.filter((x) => x.status !== 'archived').length === 0 && (
          <div className="p-8 text-center flex flex-col items-center gap-3"
            style={{ ...card, border: '1px dashed #dddddd', background: '#fafafa' }}>
            <CalendarDays className="w-8 h-8" style={{ color: '#c0c0c0' }} />
            <p className="text-sm" style={{ color: '#929292', maxWidth: 420, lineHeight: 1.5 }}>
              No market events added yet. Add events like SCAD commencement, festivals, weather displacement periods, or annual groups.
            </p>
          </div>
        )}

        {visible.length === 0 && events.filter((x) => x.status !== 'archived').length > 0 && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: '#929292' }}>No events match this view.</p>
        )}
      </div>
    </div>
  );
}

/* ── Event card ───────────────────────────────────────────────────────── */
function EventCard({ e }: { e: MarketEvent }) {
  const impact = IMPACT_STYLE[e.impact];
  const status = STATUS_STYLE[e.status];
  const chips = reminderChips(e.reminders);

  return (
    <div className="p-4 flex flex-col gap-3" style={card}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
          <CalendarDays className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: '#222' }}>{e.name}</p>
            <Badge label={MARKET_CATEGORY_LABEL[e.category]} fg="#6a6a6a" bg="#f0f0f0" />
            {e.recurring === 'yes' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{ color: '#7c3aed', background: '#ece4fb' }}>
                <Repeat className="w-3 h-3" /> Recurring
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{fmtRange(e.startDate, e.endDate)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Badge label={IMPACT_LABEL[e.impact]} fg={impact.fg} bg={impact.bg} />
          <Badge label={MARKET_STATUS_LABEL[e.status]} fg={status.fg} bg={status.bg} />
        </div>
      </div>

      {/* Recurrence + next-expected */}
      <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
          <Repeat className="w-3.5 h-3.5" /> {RECURRING_LABEL[e.recurring]}
        </span>
        {e.nextExpected && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#7c3aed' }}>
            <CalendarDays className="w-3.5 h-3.5" /> Next ~{fmtRange(e.nextExpected)}
          </span>
        )}
        {e.pastImpact && <span className="text-xs" style={{ color: '#929292' }}>· {e.pastImpact}</span>}
      </div>

      {/* Sales / revenue action notes */}
      {(e.salesAction || e.revenueAction) && (
        <div className="flex flex-col gap-2">
          {e.salesAction && (
            <div className="p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#7c3aed' }}>Sales opportunity</p>
              <p className="text-xs mt-0.5" style={{ color: '#222', lineHeight: 1.5 }}>{e.salesAction}</p>
            </div>
          )}
          {e.revenueAction && (
            <div className="p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#0891b2' }}>Revenue opportunity</p>
              <p className="text-xs mt-0.5" style={{ color: '#222', lineHeight: 1.5 }}>{e.revenueAction}</p>
            </div>
          )}
        </div>
      )}

      {/* Reminder chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Bell className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          {chips.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: '#6a6a6a', background: '#f0f0f0' }}>{c} before</span>
          ))}
        </div>
      )}

      {/* Row actions */}
      <div className="flex items-center gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <ActionButton label="Mark Confirmed" icon onClick={() => updateMarketEvent(e.id, { status: 'confirmed' })} active={e.status === 'confirmed'} />
        <ActionButton label="Mark Watching" onClick={() => updateMarketEvent(e.id, { status: 'watching' })} active={e.status === 'watching'} />
        <ActionButton label="Mark Completed" onClick={() => updateMarketEvent(e.id, { status: 'completed' })} active={e.status === 'completed'} />
        <ActionButton label="Archive" onClick={() => updateMarketEvent(e.id, { status: 'archived' })} active={e.status === 'archived'} danger />
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, active, danger, icon }:
  { label: string; onClick: () => void; active?: boolean; danger?: boolean; icon?: boolean }) {
  const fg = danger ? '#b91c1c' : '#6a6a6a';
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-[11px] font-semibold"
      style={{
        background: active ? '#f0f0f0' : '#fff',
        color: active ? '#222' : fg,
        border: `1px solid ${active ? '#dddddd' : '#dddddd'}`,
      }}>
      {icon && active && <Check className="w-3 h-3" />}
      {label}
    </button>
  );
}

/* ── Create form ──────────────────────────────────────────────────────── */
function CreateForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MarketCategory>('local');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurring, setRecurring] = useState<Recurring>('unknown');
  const [nextExpected, setNextExpected] = useState('');
  const [impact, setImpact] = useState<Impact>('unknown');
  const [pastImpact, setPastImpact] = useState('');
  const [salesAction, setSalesAction] = useState('');
  const [revenueAction, setRevenueAction] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MarketEventStatus>('observed');

  const toggleReminder = (r: string) =>
    setReminders((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const canSave = name.trim().length > 0 && startDate.length > 0;

  const save = () => {
    if (!canSave) return;
    addMarketEvent({
      name: name.trim(),
      category,
      startDate,
      endDate: endDate || undefined,
      recurring,
      nextExpected: nextExpected || undefined,
      impact,
      pastImpact: pastImpact.trim() || undefined,
      salesAction: salesAction.trim() || undefined,
      revenueAction: revenueAction.trim() || undefined,
      reminders: REMINDER_OPTIONS.filter((r) => reminders.includes(r)),
      status,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="p-5 flex flex-col gap-4" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm" style={{ color: '#222' }}>Add Market Event</p>
        <button onClick={onClose} style={{ color: '#929292' }}><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Event Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SCAD Commencement"
              className="h-10 px-3 text-sm outline-none" style={inputStyle} />
          </Field>
        </div>

        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value as MarketCategory)}
            className="h-10 px-2.5 text-sm outline-none" style={inputStyle}>
            {(Object.keys(MARKET_CATEGORY_LABEL) as MarketCategory[]).map((k) => (
              <option key={k} value={k}>{MARKET_CATEGORY_LABEL[k]}</option>
            ))}
          </select>
        </Field>

        <Field label="Expected Impact">
          <select value={impact} onChange={(e) => setImpact(e.target.value as Impact)}
            className="h-10 px-2.5 text-sm outline-none" style={inputStyle}>
            {(Object.keys(IMPACT_LABEL) as Impact[]).map((k) => (
              <option key={k} value={k}>{IMPACT_LABEL[k]}</option>
            ))}
          </select>
        </Field>

        <Field label="Start Date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="h-10 px-3 text-sm outline-none" style={inputStyle} />
        </Field>

        <Field label="End Date">
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="h-10 px-3 text-sm outline-none" style={inputStyle} />
        </Field>

        <Field label="Is Recurring?">
          <select value={recurring} onChange={(e) => setRecurring(e.target.value as Recurring)}
            className="h-10 px-2.5 text-sm outline-none" style={inputStyle}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </Field>

        <Field label="Expected Next Date">
          <input type="date" value={nextExpected} onChange={(e) => setNextExpected(e.target.value)}
            className="h-10 px-3 text-sm outline-none" style={inputStyle} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Past Impact Notes">
            <textarea value={pastImpact} onChange={(e) => setPastImpact(e.target.value)} rows={2}
              placeholder="What happened last time — compression, sellout, walk-ins, etc."
              className="px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Sales Opportunity Notes">
            <textarea value={salesAction} onChange={(e) => setSalesAction(e.target.value)} rows={2}
              placeholder="Group blocks, B2B outreach, organizer relationships, repeat travel."
              className="px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Revenue Opportunity Notes">
            <textarea value={revenueAction} onChange={(e) => setRevenueAction(e.target.value)} rows={2}
              placeholder="Rate review, minimum stays, compression watch."
              className="px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <span className="text-xs font-semibold" style={{ color: '#222' }}>Reminder Schedule</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {REMINDER_OPTIONS.map((r) => {
              const on = reminders.includes(r);
              return (
                <button key={r} type="button" onClick={() => toggleReminder(r)}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-[11px] font-semibold"
                  style={{ background: on ? '#ece4fb' : '#fff', color: on ? '#7c3aed' : '#6a6a6a', border: `1px solid ${on ? '#7c3aed' : '#dddddd'}` }}>
                  {on && <Check className="w-3 h-3" />} {REMINDER_LABEL[r]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Anything else worth remembering."
              className="px-3 py-2 text-sm outline-none resize-y" style={inputStyle} />
          </Field>
        </div>

        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as MarketEventStatus)}
            className="h-10 px-2.5 text-sm outline-none" style={inputStyle}>
            {(Object.keys(MARKET_STATUS_LABEL) as MarketEventStatus[]).map((k) => (
              <option key={k} value={k}>{MARKET_STATUS_LABEL[k]}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button onClick={onClose} className="h-9 px-4 rounded-full text-sm font-semibold"
          style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>Cancel</button>
        <button onClick={save} disabled={!canSave}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold"
          style={{ background: canSave ? '#7c3aed' : '#e6dcf7', color: '#fff', border: 'none', cursor: canSave ? 'pointer' : 'not-allowed' }}>
          <Check className="w-4 h-4" /> Save Event
        </button>
      </div>
    </div>
  );
}
