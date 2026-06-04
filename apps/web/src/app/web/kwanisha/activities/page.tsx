'use client';

import { useState } from 'react';
import { Phone, Mail, Users, MapPin, CheckSquare, Check } from 'lucide-react';
import { CRM_ACTIVITIES, type ActivityKind } from '@hos/shared';
import { card } from '../_ui';

const ICON: Record<ActivityKind, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  'site-visit': <MapPin className="w-4 h-4" />,
  task: <CheckSquare className="w-4 h-4" />,
};

export default function ActivitiesPage() {
  const [done, setDone] = useState<Set<string>>(new Set(CRM_ACTIVITIES.filter((a) => a.done).map((a) => a.id)));
  const toggle = (id: string) => setDone((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sorted = [...CRM_ACTIVITIES].sort((a, b) => +new Date(a.when) - +new Date(b.when));
  const open = sorted.filter((a) => !done.has(a.id));
  const complete = sorted.filter((a) => done.has(a.id));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Activities</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{open.length} open · {complete.length} done</p>
      </div>

      <Group title="To do" items={open} done={done} toggle={toggle} />
      {complete.length > 0 && <Group title="Completed" items={complete} done={done} toggle={toggle} />}
    </div>
  );
}

function Group({ title, items, done, toggle }: { title: string; items: typeof CRM_ACTIVITIES; done: Set<string>; toggle: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>
      <div style={card}>
        {items.map((a, i) => {
          const isDone = done.has(a.id);
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <button onClick={() => toggle(a.id)} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `1.5px solid ${isDone ? '#15803d' : '#dddddd'}`, background: isDone ? '#15803d' : '#fff' }}>
                {isDone && <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
              </button>
              <span className="flex-shrink-0" style={{ color: '#7c3aed' }}>{ICON[a.kind]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: isDone ? '#929292' : '#222', textDecoration: isDone ? 'line-through' : 'none' }}>{a.summary}</p>
                <p className="text-xs" style={{ color: '#929292' }}>{a.accountName}</p>
              </div>
              <p className="text-[11px] flex-shrink-0" style={{ color: '#929292' }}>
                {new Date(a.when).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
