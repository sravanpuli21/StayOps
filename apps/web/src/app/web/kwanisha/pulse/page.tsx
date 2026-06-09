'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Inbox, Search, Sparkles, GraduationCap, PartyPopper, Users, CloudSnow, Building2,
  Eye, TrendingUp, UserPlus, Target, CalendarPlus, Bell, ListChecks, X, Check,
} from 'lucide-react';
import {
  CATEGORY_LABEL, type DemandCategory, type DemandSignal,
} from '@hos/shared';
import { useDemandSignals } from '@/lib/demand-signals-store';
import {
  PROPERTY, useSalesState, setPulseReview, addLead, addMarketEvent, addTask, addNotification,
  PULSE_STATUS_LABEL, type PulseStatus, type PulseCategory, PULSE_CATEGORY_LABEL,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* Map the front-desk demand category → Kwanisha's richer sales vocabulary. */
function toPulseCategory(c: DemandCategory): PulseCategory {
  switch (c) {
    case 'event': return 'university';
    case 'festival': return 'festival';
    case 'sports': return 'sports';
    case 'family': return 'wedding-family';
    case 'weather': return 'weather';
    case 'corporate': return 'corporate';
    default: return 'unknown';
  }
}
const CAT_ICON: Record<DemandCategory, React.ReactNode> = {
  event: <GraduationCap className="w-4 h-4" />, festival: <PartyPopper className="w-4 h-4" />,
  sports: <Users className="w-4 h-4" />, family: <Users className="w-4 h-4" />,
  weather: <CloudSnow className="w-4 h-4" />, corporate: <Building2 className="w-4 h-4" />,
  other: <Sparkles className="w-4 h-4" />,
};
const STATUS_STYLE: Record<PulseStatus, { fg: string; bg: string }> = {
  new: { fg: '#b45309', bg: '#fef3c7' }, 'sales-relevant': { fg: '#15803d', bg: '#dcfce7' },
  'revenue-relevant': { fg: '#1d4ed8', bg: '#dbeafe' }, 'needs-review': { fg: '#7c3aed', bg: '#ece4fb' },
  converted: { fg: '#0891b2', bg: '#cffafe' }, 'not-useful': { fg: '#6a6a6a', bg: '#f0f0f0' },
  archived: { fg: '#6a6a6a', bg: '#f0f0f0' },
};

type FilterKey = 'all' | 'new' | 'sales' | 'revenue' | 'market' | 'weather' | 'corporate' | 'group' | 'review' | 'converted' | 'not-useful' | 'archived';
const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' }, { key: 'new', label: 'New' }, { key: 'sales', label: 'Sales Relevant' },
  { key: 'revenue', label: 'Revenue Relevant' }, { key: 'market', label: 'Market Event' },
  { key: 'weather', label: 'Weather / Displacement' }, { key: 'corporate', label: 'Corporate / Business' },
  { key: 'group', label: 'Group / Event' }, { key: 'review', label: 'Needs Review' },
  { key: 'converted', label: 'Converted' }, { key: 'not-useful', label: 'Not Useful' }, { key: 'archived', label: 'Archived' },
];

export default function PulseInboxPage() {
  const router = useRouter();
  const signals = useDemandSignals();
  const { pulseReviews } = useSalesState();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [q, setQ] = useState('');
  const [notifyFor, setNotifyFor] = useState<DemandSignal | null>(null);

  const reviewOf = (s: DemandSignal): PulseStatus => pulseReviews[s.id]?.status ?? 'new';

  const rows = useMemo(() => signals.filter((s) => {
    const st = reviewOf(s);
    const passFilter = (() => {
      switch (filter) {
        case 'all': return st !== 'archived';
        case 'new': return st === 'new';
        case 'sales': return pulseReviews[s.id]?.salesRelevant || st === 'sales-relevant';
        case 'revenue': return pulseReviews[s.id]?.revenueRelevant || st === 'revenue-relevant';
        case 'market': return ['event', 'festival', 'sports'].includes(s.category);
        case 'weather': return s.category === 'weather';
        case 'corporate': return s.category === 'corporate';
        case 'group': return ['family', 'event', 'festival', 'sports'].includes(s.category);
        case 'review': return st === 'needs-review';
        case 'converted': return st === 'converted';
        case 'not-useful': return st === 'not-useful';
        case 'archived': return st === 'archived';
      }
    })();
    if (!passFilter) return false;
    if (q) {
      const hay = `${s.title} ${s.note} ${s.loggedBy} ${CATEGORY_LABEL[s.category]} ${s.contactName ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [signals, pulseReviews, filter, q]);

  const newCount = signals.filter((s) => reviewOf(s) === 'new').length;

  /* Actions */
  const convertToLead = (s: DemandSignal) => {
    addLead({
      name: s.title, type: s.recurrence === 'annual' ? 'annual-demand' : s.category === 'corporate' ? 'company' : 'event',
      source: 'Front Desk Pulse', category: toPulseCategory(s.category),
      description: s.note, guestOrigin: undefined, confidence: 'medium', priority: 'normal',
      status: 'new', sourcePulseId: s.id, contact: s.contactName,
    });
    setPulseReview(s.id, { status: 'converted' });
    addNotification({ kind: 'pulse-converted', title: `Pulse converted to lead: ${s.title}`, href: '/web/kwanisha/leads' });
    router.push('/web/kwanisha/leads');
  };
  const convertToOpportunity = (s: DemandSignal) => {
    setPulseReview(s.id, { status: 'converted' });
    router.push('/web/kwanisha/opportunities');
  };
  const addToCalendar = (s: DemandSignal) => {
    const cat = s.category === 'event' ? 'university' : s.category === 'weather' ? 'weather' : s.category === 'corporate' ? 'corporate' : s.category === 'family' ? 'wedding-family' : s.category === 'sports' ? 'sports' : 'festival';
    addMarketEvent({
      name: s.title, category: cat, startDate: s.date,
      recurring: s.recurrence === 'annual' || s.recurrence === 'seasonal' ? 'yes' : s.recurrence === 'one-time' ? 'no' : 'unknown',
      impact: s.occupancyLift >= 60 ? 'very-high' : s.occupancyLift >= 35 ? 'high' : s.occupancyLift >= 15 ? 'medium' : 'low',
      pastImpact: s.note, reminders: ['11mo', '6mo', '3mo', '1mo'], status: 'observed', sourcePulseId: s.id,
    });
    setPulseReview(s.id, { status: 'sales-relevant' });
    addNotification({ kind: 'event-added', title: `Added to market calendar: ${s.title}`, href: '/web/kwanisha/market-calendar' });
    router.push('/web/kwanisha/market-calendar');
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold inline-flex items-center gap-2" style={{ color: '#222' }}>
          <Inbox className="w-6 h-6" style={{ color: '#7c3aed' }} /> Pulse Inbox
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Front-desk signals about why guests are here — turn them into sales and revenue opportunities.
          {newCount > 0 && <span style={{ color: '#7c3aed', fontWeight: 600 }}> {newCount} new to review.</span>}
          {' '}{PROPERTY.name} · {PROPERTY.code}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#c1c1c1' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pulse notes, event, company, source, guest reason…"
          className="w-full h-10 pl-9 pr-3 rounded-xl text-sm outline-none" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => {
          const on = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)} className="h-8 px-3 rounded-full text-xs font-semibold"
              style={{ background: on ? '#7c3aed' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#7c3aed' : '#dddddd'}` }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Pulse list */}
      <div className="flex flex-col gap-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
            <Inbox className="w-8 h-8 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
            <p className="text-sm font-semibold" style={{ color: '#222' }}>No pulse signals need review right now.</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>Front-desk pulse entries for {PROPERTY.code} will appear here.</p>
          </div>
        ) : rows.map((s) => {
          const r = pulseReviews[s.id];
          const st = r?.status ?? 'new';
          const ss = STATUS_STYLE[st];
          return (
            <div key={s.id} className="p-4 flex flex-col gap-3" style={card}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                  {CAT_ICON[s.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: '#222' }}>{s.title}</p>
                    <Badge label={PULSE_CATEGORY_LABEL[toPulseCategory(s.category)]} fg="#6a6a6a" bg="#f0f0f0" />
                    <Badge label={PULSE_STATUS_LABEL[st]} fg={ss.fg} bg={ss.bg} />
                    {r?.salesRelevant && <Badge label="Sales ✓" fg="#15803d" bg="#dcfce7" />}
                    {r?.revenueRelevant && <Badge label="Revenue ✓" fg="#1d4ed8" bg="#dbeafe" />}
                  </div>
                  {/* Original front-desk note — preserved verbatim for audit. */}
                  <p className="text-xs mt-1.5 p-2 rounded-lg" style={{ color: '#6a6a6a', background: '#fafafa', lineHeight: 1.5 }}>
                    <span className="font-semibold" style={{ color: '#929292' }}>Front desk: </span>{s.note}
                  </p>
                  {r?.salesInterpretation && (
                    <p className="text-xs mt-1.5 p-2 rounded-lg" style={{ color: '#3f3f3f', background: '#faf7ff', lineHeight: 1.5 }}>
                      <span className="font-semibold" style={{ color: '#7c3aed' }}>Sales read: </span>{r.salesInterpretation}
                    </p>
                  )}
                  <p className="text-[11px] mt-1.5" style={{ color: '#929292' }}>
                    Source: Front Desk · logged by {s.loggedBy} · ~{s.occupancyLift}% of house
                    {s.contactName && <> · contact {s.contactName}</>}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                <Act icon={<TrendingUp className="w-3.5 h-3.5" />} label="Sales Relevant" on={r?.salesRelevant} onClick={() => setPulseReview(s.id, { salesRelevant: !r?.salesRelevant, status: 'sales-relevant' })} />
                <Act icon={<Eye className="w-3.5 h-3.5" />} label="Revenue Relevant" on={r?.revenueRelevant} onClick={() => setPulseReview(s.id, { revenueRelevant: !r?.revenueRelevant, status: 'revenue-relevant' })} />
                <Act icon={<UserPlus className="w-3.5 h-3.5" />} label="Convert to Lead" onClick={() => convertToLead(s)} />
                <Act icon={<Target className="w-3.5 h-3.5" />} label="Convert to Opportunity" onClick={() => convertToOpportunity(s)} />
                <Act icon={<CalendarPlus className="w-3.5 h-3.5" />} label="Add to Market Calendar" onClick={() => addToCalendar(s)} />
                <Act icon={<ListChecks className="w-3.5 h-3.5" />} label="Create Task" onClick={() => { addTask({ title: `Review pulse: ${s.title}`, type: 'pulse-review', priority: 'normal', status: 'open', dueDate: new Date().toISOString().slice(0, 10) }); router.push('/web/kwanisha/tasks'); }} />
                <Act icon={<Bell className="w-3.5 h-3.5" />} label="Notify Revenue Manager" onClick={() => setNotifyFor(s)} />
                <Act label="Not Useful" muted onClick={() => setPulseReview(s.id, { status: 'not-useful' })} />
                <Act label="Archive" muted onClick={() => setPulseReview(s.id, { status: 'archived' })} />
              </div>
            </div>
          );
        })}
      </div>

      {notifyFor && <NotifyRevenueManagerModal signal={notifyFor} onClose={() => setNotifyFor(null)} />}
    </div>
  );
}

function Act({ icon, label, onClick, on, muted }: { icon?: React.ReactNode; label: string; onClick: () => void; on?: boolean; muted?: boolean }) {
  return (
    <button onClick={onClick} className="h-8 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
      style={{
        background: on ? '#7c3aed' : muted ? '#fff' : '#f7f7f7',
        color: on ? '#fff' : muted ? '#929292' : '#3f3f3f',
        border: `1px solid ${on ? '#7c3aed' : '#dddddd'}`,
      }}>
      {icon}{label}
    </button>
  );
}

function NotifyRevenueManagerModal({ signal, onClose }: { signal: DemandSignal; onClose: () => void }) {
  const [msg, setMsg] = useState(`${signal.title} appears to drive strong demand. Please review pricing strategy for the next expected dates.`);
  const [priority, setPriority] = useState('normal');
  const [due, setDue] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    setPulseReview(signal.id, { revenueRelevant: true, status: 'revenue-relevant' });
    addNotification({ kind: 'revenue-notify', title: `Revenue Manager notified: ${signal.title}`, body: msg, href: '/web/kwanisha/rate-requests' });
    setSent(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold inline-flex items-center gap-2" style={{ color: '#222' }}><Bell className="w-4 h-4" style={{ color: '#7c3aed' }} /> Notify Revenue Manager</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#929292' }} /></button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Check className="w-6 h-6" style={{ color: '#15803d' }} /></div>
            <p className="text-sm font-bold" style={{ color: '#222' }}>Revenue Manager notified</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-3">
            <Lbl t="Related item"><div className="text-sm font-semibold p-2 rounded-lg" style={{ background: '#f7f7f7', color: '#222' }}>{signal.title}</div></Lbl>
            <Lbl t="Suggested message"><textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="px-3 py-2 rounded-xl text-sm outline-none w-full resize-none" style={{ border: '1px solid #dddddd', color: '#222' }} /></Lbl>
            <div className="grid grid-cols-2 gap-3">
              <Lbl t="Priority"><select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 px-2.5 rounded-xl text-sm w-full" style={{ border: '1px solid #dddddd', color: '#222' }}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></Lbl>
              <Lbl t="Due date"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-10 px-2.5 rounded-xl text-sm w-full" style={{ border: '1px solid #dddddd', color: '#222' }} /></Lbl>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={send} className="flex-1 h-10 rounded-xl text-sm font-bold" style={{ background: '#7c3aed', color: '#fff' }}>Send</button>
              <button onClick={onClose} className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function Lbl({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold" style={{ color: '#222' }}>{t}</label>{children}</div>;
}
