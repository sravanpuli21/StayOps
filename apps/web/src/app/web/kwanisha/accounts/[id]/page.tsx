'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Repeat, CalendarClock } from 'lucide-react';
import {
  CRM_ACCOUNTS, CRM_OPPORTUNITIES, CRM_ACTIVITIES,
  ACCOUNT_TYPE_LABEL, CADENCE_LABEL,
} from '@hos/shared';
import { fmtMoneyFull, Badge, KIND_STYLE, STATUS_STYLE, card } from '../../_ui';

const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AccountDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = CRM_ACCOUNTS.find((x) => x.id === id);

  if (!a) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/web/kwanisha/accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Accounts
        </Link>
        <p className="mt-6 text-sm" style={{ color: '#929292' }}>Account not found.</p>
      </div>
    );
  }

  const st = STATUS_STYLE[a.status];
  const opps = CRM_OPPORTUNITIES.filter((o) => o.accountId === a.id);
  const acts = CRM_ACTIVITIES.filter((x) => x.accountId === a.id);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/web/kwanisha/accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
        <ArrowLeft className="w-4 h-4" /> Accounts
      </Link>

      {/* Header */}
      <div className="p-5 flex flex-col gap-3" style={card}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: '#222' }}>{a.name}</h1>
              <Badge label={st.label} fg={st.fg} bg={st.bg} />
            </div>
            <p className="text-sm mt-1" style={{ color: '#929292' }}>{ACCOUNT_TYPE_LABEL[a.type]} · {a.source}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#ece4fb', color: '#7c3aed' }}>
            <Repeat className="w-3.5 h-3.5" /> {CADENCE_LABEL[a.cadence]}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
          <span className="text-sm" style={{ color: '#222' }}>{a.contactName} · <span style={{ color: '#929292' }}>{a.contactTitle}</span></span>
          <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 text-sm" style={{ color: '#7c3aed' }}><Mail className="w-3.5 h-3.5" />{a.email}</a>
          <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1.5 text-sm" style={{ color: '#7c3aed' }}><Phone className="w-3.5 h-3.5" />{a.phone}</a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="YTD revenue" value={fmtMoneyFull(a.ytdRevenue)} />
        <Stat label="YTD room-nights" value={a.ytdRoomNights.toLocaleString()} />
        <Stat label="Typical block" value={`${a.typicalRooms} rooms`} />
        <Stat label="Negotiated rate" value={a.negotiatedRate ? `$${a.negotiatedRate}/nt` : 'TBD'} />
      </div>

      {/* Recurring pattern */}
      <div className="p-4 flex items-center gap-3" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
        <CalendarClock className="w-5 h-5 flex-shrink-0" style={{ color: '#7c3aed' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: '#222' }}>Booking pattern</p>
          <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
            Last stay {fmtDate(a.lastStay)}{a.nextExpected ? ` · next expected ${fmtDate(a.nextExpected)}` : ' · no recurring pattern'}
          </p>
        </div>
      </div>

      {/* Opportunities */}
      {opps.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Opportunities</h2>
          <div style={card}>
            {opps.map((o, i) => {
              const k = KIND_STYLE[o.kind];
              return (
                <div key={o.id} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: i < opps.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <Badge label={k.label} fg={k.fg} bg={k.bg} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#222' }}>{o.title}</p>
                    <p className="text-xs" style={{ color: '#929292' }}>{o.signal}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0" style={{ color: '#222' }}>{fmtMoneyFull(o.estValue)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Notes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Notes</h2>
        <div className="p-4" style={card}>
          <p className="text-sm" style={{ color: '#222', lineHeight: 1.55 }}>{a.notes}</p>
        </div>
      </section>

      {/* Activity */}
      {acts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Activity</h2>
          <div style={card}>
            {acts.map((act, i) => (
              <div key={act.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < acts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: act.done ? '#15803d' : '#7c3aed' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: '#222' }}>{act.summary}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{act.kind} · {new Date(act.when).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {act.done && <span className="text-[11px] font-semibold" style={{ color: '#15803d' }}>Done</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4" style={card}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-lg font-bold mt-1" style={{ color: '#222' }}>{value}</p>
    </div>
  );
}
