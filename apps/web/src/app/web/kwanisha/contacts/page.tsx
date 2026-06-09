'use client';

import { useMemo, useState } from 'react';
import { Contact, Search, Plus, Phone, Mail, X, Check } from 'lucide-react';
import {
  useSalesState, addContact, updateContact,
  CONTACT_TYPE_LABEL, PROPERTY, fmtDate,
  type SalesContact, type ContactType, type ContactConsent,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* ── Consent display ──────────────────────────────────────────────────── */
const CONSENT_LABEL: Record<ContactConsent, string> = {
  yes: 'Permission ✓', no: 'No contact', unknown: 'Ask first', 'not-needed': 'No permission needed',
};
const CONSENT_STYLE: Record<ContactConsent, { fg: string; bg: string }> = {
  yes:          { fg: '#15803d', bg: '#dcfce7' },
  no:           { fg: '#b91c1c', bg: '#fee2e2' },
  unknown:      { fg: '#b45309', bg: '#fef3c7' },
  'not-needed': { fg: '#6a6a6a', bg: '#f0f0f0' },
};

const CONTACT_TYPES = Object.keys(CONTACT_TYPE_LABEL) as ContactType[];
const CONSENT_OPTIONS: ContactConsent[] = ['yes', 'no', 'unknown', 'not-needed'];
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ── Filter union: all type values + 'all' + 'archived' ──────────────────── */
type Filter = 'all' | 'archived' | ContactType;

/* ── Add-contact form state ───────────────────────────────────────────── */
interface FormState {
  name: string; account: string; title: string; phone: string; email: string;
  preferredMethod: string; type: ContactType; notes: string; source: string; consent: ContactConsent;
}
const EMPTY_FORM: FormState = {
  name: '', account: '', title: '', phone: '', email: '',
  preferredMethod: '', type: 'travel-booker', notes: '', source: '', consent: 'unknown',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #dddddd', borderRadius: 10, padding: '9px 12px', fontSize: 14, color: '#222', background: '#fff', width: '100%',
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#6a6a6a', marginBottom: 5, display: 'block' };

export default function ContactsPage() {
  const { contacts } = useSalesState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (filter === 'archived' ? c.status === 'archived' : c.status === 'active'))
      .filter((c) => (filter === 'all' || filter === 'archived' ? true : c.type === filter))
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.account?.toLowerCase().includes(q) ?? false) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.phone?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [contacts, filter, query]);

  function handleSave() {
    if (!form.name.trim()) return;
    addContact({
      name: form.name.trim(),
      account: form.account.trim() || undefined,
      title: form.title.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      preferredMethod: form.preferredMethod.trim() || undefined,
      type: form.type,
      consent: form.consent,
      source: form.source.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const logToday = (c: SalesContact) => updateContact(c.id, { lastContacted: todayISO() });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#222' }}>
            <Contact className="w-6 h-6" style={{ color: '#7c3aed' }} /> Contacts
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            People connected to accounts, groups, events, and travel decisions.
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
            {PROPERTY.name} · {PROPERTY.code}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
          style={{ background: showForm ? '#fff' : '#7c3aed', color: showForm ? '#6a6a6a' : '#fff', border: `1px solid ${showForm ? '#dddddd' : '#7c3aed'}` }}
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Contact</>}
        </button>
      </div>

      {/* Add-contact form */}
      {showForm && (
        <div className="p-4 sm:p-5 flex flex-col gap-4" style={card}>
          <p className="font-bold text-sm" style={{ color: '#222' }}>New contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Name <span style={{ color: '#7c3aed' }}>*</span></label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label style={labelStyle}>Account</label>
              <input style={inputStyle} value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} placeholder="Company / group / event" />
            </div>
            <div>
              <label style={labelStyle}>Title / Role</label>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Travel Manager" />
            </div>
            <div>
              <label style={labelStyle}>Contact Type</label>
              <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContactType })}>
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>{CONTACT_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: '#929292', fontWeight: 400 }}>(optional for guests)</span></label>
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(912) 555-0100" />
            </div>
            <div>
              <label style={labelStyle}>Email <span style={{ color: '#929292', fontWeight: 400 }}>(optional for guests)</span></label>
              <input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
            </div>
            <div>
              <label style={labelStyle}>Preferred Contact Method</label>
              <input style={inputStyle} value={form.preferredMethod} onChange={(e) => setForm({ ...form, preferredMethod: e.target.value })} placeholder="e.g. Email, Call, Text" />
            </div>
            <div>
              <label style={labelStyle}>Source</label>
              <input style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Front Desk Pulse, Research" />
            </div>
            <div className="sm:col-span-2">
              <label style={labelStyle}>Permission to Follow Up</label>
              <div className="flex gap-2 flex-wrap">
                {CONSENT_OPTIONS.map((o) => {
                  const on = form.consent === o;
                  const st = CONSENT_STYLE[o];
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setForm({ ...form, consent: o })}
                      className="h-9 px-3 rounded-full text-xs font-semibold"
                      style={{ background: on ? st.bg : '#fff', color: on ? st.fg : '#6a6a6a', border: `1px solid ${on ? st.fg : '#dddddd'}` }}
                    >
                      {CONSENT_LABEL[o]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything useful — context, history, how they help fill the house." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: form.name.trim() ? '#7c3aed' : '#e9e2f8', color: '#fff', border: 'none', cursor: form.name.trim() ? 'pointer' : 'not-allowed' }}
            >
              <Check className="w-4 h-4" /> Save contact
            </button>
            <button onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }} className="h-10 px-4 rounded-full text-sm font-semibold" style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {([['all', 'All'], ...CONTACT_TYPES.map((t) => [t, CONTACT_TYPE_LABEL[t]] as const), ['archived', 'Archived']] as const).map(([k, label]) => {
          const on = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(k as Filter)}
              className="h-9 px-3.5 rounded-full text-xs font-semibold"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, account, email, or phone…"
          style={{ ...inputStyle, paddingLeft: 38, height: 44 }}
        />
      </div>

      {/* Contact list */}
      {visible.length === 0 ? (
        <div className="p-8 text-center" style={{ ...card, border: '1px dashed #dddddd' }}>
          <Contact className="w-7 h-7 mx-auto mb-2" style={{ color: '#c9c9c9' }} />
          <p className="text-sm" style={{ color: '#929292' }}>
            {query || filter !== 'all'
              ? 'No contacts match your filters.'
              : 'No contacts yet. Add people connected to your accounts, events, and groups.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((c) => {
            const cs = CONSENT_STYLE[c.consent];
            return (
              <div key={c.id} className="p-4 flex flex-col gap-3" style={card}>
                {/* Top row: identity + type/consent badges */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                    <Contact className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: '#222' }}>{c.name}</p>
                      <Badge label={CONTACT_TYPE_LABEL[c.type]} fg="#7c3aed" bg="#ece4fb" />
                      {c.status === 'archived' && <Badge label="Archived" fg="#6a6a6a" bg="#f0f0f0" />}
                    </div>
                    {(c.account || c.title) && (
                      <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
                        {c.title && <span>{c.title}</span>}
                        {c.title && c.account && <span style={{ color: '#929292' }}> · </span>}
                        {c.account && <span style={{ color: '#222', fontWeight: 600 }}>{c.account}</span>}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: cs.bg, color: cs.fg }}>
                    {CONSENT_LABEL[c.consent]}
                  </span>
                </div>

                {/* Contact methods */}
                {(c.phone || c.email || c.preferredMethod) && (
                  <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#7c3aed' }}>
                        <Phone className="w-3.5 h-3.5" /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#7c3aed' }}>
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </a>
                    )}
                    {c.preferredMethod && (
                      <span className="text-xs" style={{ color: '#929292' }}>Prefers: {c.preferredMethod}</span>
                    )}
                  </div>
                )}

                {/* Dates row */}
                <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                  <span className="text-xs" style={{ color: '#6a6a6a' }}>
                    Last contacted: <span style={{ color: '#222' }}>{fmtDate(c.lastContacted)}</span>
                  </span>
                  <span className="text-xs" style={{ color: '#6a6a6a' }}>
                    Next follow-up: <span style={{ color: c.nextFollowUp ? '#7c3aed' : '#929292', fontWeight: c.nextFollowUp ? 600 : 400 }}>{fmtDate(c.nextFollowUp)}</span>
                  </span>
                  {c.source && <span className="text-xs" style={{ color: '#929292' }}>· {c.source}</span>}
                </div>

                {c.notes && <p className="text-xs" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{c.notes}</p>}

                {/* Row actions */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    onClick={() => logToday(c)}
                    className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                  >
                    <Phone className="w-3.5 h-3.5" /> Log Call
                  </button>
                  <button
                    onClick={() => logToday(c)}
                    className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                  >
                    <Mail className="w-3.5 h-3.5" /> Log Email
                  </button>
                  {c.status === 'archived' ? (
                    <button
                      onClick={() => updateContact(c.id, { status: 'active' })}
                      className="h-8 px-3 rounded-full text-xs font-semibold ml-auto"
                      style={{ background: '#fff', color: '#7c3aed', border: '1px solid #ece4fb' }}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => updateContact(c.id, { status: 'archived' })}
                      className="h-8 px-3 rounded-full text-xs font-semibold ml-auto"
                      style={{ background: '#fff', color: '#929292', border: '1px solid #dddddd' }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
