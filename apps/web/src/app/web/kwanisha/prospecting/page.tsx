'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, MapPin, Phone, Mail, X, ChevronRight, UserPlus } from 'lucide-react';
import {
  PROPERTY, OWNER, useSalesState, addProspect, updateProspect, addLead, fmtDate,
  PROSPECT_CATEGORY_LABEL, PROSPECT_STATUS_LABEL, PRIORITIES, PRIORITY_STYLE,
  type Prospect, type ProspectCategory, type ProspectStatus, type Priority,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* Status pill colors — reuse the platform palette. */
const STATUS_STYLE: Record<ProspectStatus, { fg: string; bg: string }> = {
  'to-research':       { fg: '#b45309', bg: '#fef3c7' },
  researching:         { fg: '#7c3aed', bg: '#ece4fb' },
  ready:               { fg: '#15803d', bg: '#dcfce7' },
  contacted:           { fg: '#1d4ed8', bg: '#dbeafe' },
  interested:          { fg: '#0891b2', bg: '#cffafe' },
  'converted-lead':    { fg: '#15803d', bg: '#dcfce7' },
  'converted-account': { fg: '#15803d', bg: '#dcfce7' },
  'not-useful':        { fg: '#6a6a6a', bg: '#f0f0f0' },
  nurture:             { fg: '#6a6a6a', bg: '#f0f0f0' },
};

/* Quick "move status forward" flow for the active research pipeline. */
const NEXT_STATUS: Partial<Record<ProspectStatus, ProspectStatus>> = {
  'to-research': 'researching',
  researching: 'ready',
  ready: 'contacted',
};

const CATEGORY_OPTIONS = Object.entries(PROSPECT_CATEGORY_LABEL) as [ProspectCategory, string][];

const inputStyle: React.CSSProperties = { border: '1px solid #dddddd', color: '#222' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#6a6a6a' }}>
      {label}
      {children}
    </label>
  );
}

type FormState = {
  name: string; category: ProspectCategory; address: string; city: string; state: string;
  website: string; phone: string; email: string; contactPerson: string;
  whyMatters: string; businessType: string; priority: Priority; nextAction: string; notes: string;
};

const emptyForm: FormState = {
  name: '', category: 'business', address: '', city: PROPERTY.city, state: PROPERTY.state,
  website: '', phone: '', email: '', contactPerson: '',
  whyMatters: '', businessType: '', priority: 'normal', nextAction: '', notes: '',
};

export default function ProspectingPage() {
  const { prospects } = useSalesState();
  const [catFilter, setCatFilter] = useState<'all' | ProspectCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProspectStatus>('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return prospects.filter((p) => {
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (term) {
        const hay = `${p.name} ${p.city ?? ''} ${p.contactPerson ?? ''} ${p.whyMatters ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [prospects, catFilter, statusFilter, q]);

  function save() {
    if (!form.name.trim()) return;
    addProspect({
      name: form.name.trim(),
      category: form.category,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      website: form.website.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      whyMatters: form.whyMatters.trim() || undefined,
      businessType: form.businessType.trim() || undefined,
      priority: form.priority,
      status: 'to-research',
      nextAction: form.nextAction.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setForm(emptyForm);
    setShowForm(false);
  }

  function convertToLead(p: Prospect) {
    addLead({
      name: p.name,
      type: 'company',
      source: 'Prospecting',
      category: 'unknown',
      company: p.name,
      status: 'new',
      confidence: 'low',
      priority: p.priority,
      description: p.whyMatters,
    });
    updateProspect(p.id, { status: 'converted-lead' });
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Prospecting</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Find future business before it walks in — research and work prospect lists for {PROPERTY.name}.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
          style={{ background: '#7c3aed', color: '#fff' }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'Add Prospect'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-4 flex flex-col gap-4" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
          <p className="font-bold text-sm" style={{ color: '#222' }}>New prospect</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Prospect Name *">
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Coastal Medical Staffing"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => set('category', e.target.value as ProspectCategory)}
                className="h-10 px-2.5 rounded-xl text-sm w-full" style={inputStyle}>
                {CATEGORY_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </Field>
            <Field label="Address">
              <input value={form.address} onChange={(e) => set('address', e.target.value)}
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input value={form.city} onChange={(e) => set('city', e.target.value)}
                  className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
              </Field>
              <Field label="State">
                <input value={form.state} onChange={(e) => set('state', e.target.value)}
                  className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
              </Field>
            </div>
            <Field label="Website">
              <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="example.com"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Contact Person">
              <input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)}
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(912) 555-0100"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => set('email', e.target.value)} type="email"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Potential business type">
              <input value={form.businessType} onChange={(e) => set('businessType', e.target.value)} placeholder="e.g. Long-Stay / Corporate"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}
                className="h-10 px-2.5 rounded-xl text-sm w-full" style={inputStyle}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </Field>
            <Field label="Next Action">
              <input value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} placeholder="e.g. Find events contact"
                className="h-10 px-3 rounded-xl text-sm outline-none w-full" style={inputStyle} />
            </Field>
          </div>
          <Field label="Why this matters">
            <textarea value={form.whyMatters} onChange={(e) => set('whyMatters', e.target.value)} rows={2}
              placeholder="What future business could this bring in?"
              className="px-3 py-2 rounded-xl text-sm outline-none w-full resize-none" style={inputStyle} />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
              className="px-3 py-2 rounded-xl text-sm outline-none w-full resize-none" style={inputStyle} />
          </Field>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!form.name.trim()}
              className="h-10 px-4 rounded-full text-sm font-semibold"
              style={{ background: form.name.trim() ? '#7c3aed' : '#dddddd', color: '#fff' }}>
              Save prospect
            </button>
            <button onClick={() => { setForm(emptyForm); setShowForm(false); }}
              className="h-10 px-4 rounded-full text-sm font-semibold"
              style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
              Cancel
            </button>
            <span className="text-xs ml-auto" style={{ color: '#929292' }}>Saved as “To Research”.</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 h-11 px-3.5 rounded-xl" style={card}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, city, contact, why it matters…"
          className="text-sm outline-none w-full bg-transparent" style={{ color: '#222' }} />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...CATEGORY_OPTIONS.map(([v]) => v)] as ('all' | ProspectCategory)[]).map((k) => {
          const on = catFilter === k;
          const label = k === 'all' ? 'All categories' : PROSPECT_CATEGORY_LABEL[k];
          return (
            <button key={k} onClick={() => setCatFilter(k)} className="h-8 px-3 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...Object.keys(PROSPECT_STATUS_LABEL) as ProspectStatus[]] as ('all' | ProspectStatus)[]).map((k) => {
          const on = statusFilter === k;
          const label = k === 'all' ? 'All statuses' : PROSPECT_STATUS_LABEL[k];
          const sc = k === 'all' ? null : STATUS_STYLE[k];
          return (
            <button key={k} onClick={() => setStatusFilter(k)} className="h-8 px-3 rounded-full text-xs font-semibold"
              style={{
                background: on ? (sc?.bg ?? '#222') : '#fff',
                color: on ? (sc?.fg ?? '#fff') : '#6a6a6a',
                border: `1px solid ${on ? (sc?.fg ?? '#222') : '#dddddd'}`,
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Prospect list */}
      {filtered.length === 0 ? (
        <div className="px-4 py-10 text-center rounded-2xl" style={{ border: '2px dashed #dddddd' }}>
          <p className="text-sm" style={{ color: '#929292', lineHeight: 1.5 }}>
            No prospects yet. Add nearby businesses, corporate offices, event venues, universities, or other future demand sources.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((p) => {
            const sc = STATUS_STYLE[p.status];
            const pr = PRIORITY_STYLE[p.priority];
            const next = NEXT_STATUS[p.status];
            const isClosed = p.status === 'not-useful' || p.status === 'nurture'
              || p.status === 'converted-lead' || p.status === 'converted-account';
            const location = [p.city, p.state].filter(Boolean).join(', ');
            return (
              <div key={p.id} className="p-4 flex flex-col gap-3" style={card}>
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: '#222' }}>{p.name}</p>
                      <Badge label={PROSPECT_CATEGORY_LABEL[p.category]} fg="#6a6a6a" bg="#f0f0f0" />
                    </div>
                    {p.businessType && (
                      <p className="text-xs mt-1" style={{ color: '#7c3aed', fontWeight: 600 }}>{p.businessType}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge label={pr.label} fg={pr.fg} bg={pr.bg} />
                    <Badge label={PROSPECT_STATUS_LABEL[p.status]} fg={sc.fg} bg={sc.bg} />
                  </div>
                </div>

                {/* Contact + location row */}
                {(p.contactPerson || p.phone || p.email || location) && (
                  <div className="flex items-center gap-x-5 gap-y-1.5 flex-wrap">
                    {p.contactPerson && (
                      <span className="text-xs font-semibold" style={{ color: '#222' }}>{p.contactPerson}</span>
                    )}
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#7c3aed' }}>
                        <Phone className="w-3.5 h-3.5" /> {p.phone}
                      </a>
                    )}
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#7c3aed' }}>
                        <Mail className="w-3.5 h-3.5" /> {p.email}
                      </a>
                    )}
                    {location && (
                      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                        <MapPin className="w-3.5 h-3.5" /> {location}
                      </span>
                    )}
                  </div>
                )}

                {/* Why it matters */}
                {p.whyMatters && (
                  <p className="text-xs" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{p.whyMatters}</p>
                )}

                {/* Next action */}
                {p.nextAction && (
                  <div className="flex items-center gap-1.5 text-xs p-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7c3aed' }} />
                    <span style={{ color: '#222', fontWeight: 600 }}>Next:</span>
                    <span style={{ color: '#6a6a6a' }}>{p.nextAction}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                  {next && (
                    <button onClick={() => updateProspect(p.id, { status: next })}
                      className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                      style={{ background: '#7c3aed', color: '#fff' }}>
                      Move to {PROSPECT_STATUS_LABEL[next]} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isClosed && (
                    <button onClick={() => convertToLead(p)}
                      className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                      style={{ background: '#fff', color: '#7c3aed', border: '1px solid #d9c7f7' }}>
                      <UserPlus className="w-3.5 h-3.5" /> Convert to Lead
                    </button>
                  )}
                  {p.status !== 'nurture' && !isClosed && (
                    <button onClick={() => updateProspect(p.id, { status: 'nurture' })}
                      className="h-8 px-3 rounded-full text-xs font-semibold"
                      style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
                      Nurture Later
                    </button>
                  )}
                  {p.status !== 'not-useful' && !isClosed && (
                    <button onClick={() => updateProspect(p.id, { status: 'not-useful' })}
                      className="h-8 px-3 rounded-full text-xs font-semibold"
                      style={{ background: '#fff', color: '#b91c1c', border: '1px solid #f3c7c7' }}>
                      Mark Not Useful
                    </button>
                  )}
                  <span className="text-[11px] ml-auto" style={{ color: '#929292' }}>
                    {p.owner === OWNER ? 'You' : p.owner} · updated {fmtDate(p.updatedAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
