'use client';

import { useMemo, useState } from 'react';
import { CheckSquare, Square, Plus, Calendar, Clock, X, Check } from 'lucide-react';
import {
  useSalesState, addTask, updateTask,
  TASK_TYPE_LABEL, TASK_STATUS_LABEL, PRIORITIES, PRIORITY_STYLE,
  PROPERTY, OWNER, fmtDate,
  type SalesTask, type TaskType, type TaskStatus, type Priority,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* Views are DERIVED filters over tasks — none of them is a stored status. */
type View = 'today' | 'overdue' | 'week' | 'upcoming' | 'completed' | 'all';
const VIEW_LABEL: Record<View, string> = {
  today: 'Today', overdue: 'Overdue', week: 'This Week', upcoming: 'Upcoming', completed: 'Completed', all: 'All',
};
const VIEW_ORDER: View[] = ['today', 'overdue', 'week', 'upcoming', 'completed', 'all'];

/* "open-ish" = not finished. Overdue/Today/Week/Upcoming only count live work. */
const OPEN_ISH: TaskStatus[] = ['open', 'in-progress', 'waiting'];
const isOpenIsh = (s: TaskStatus) => OPEN_ISH.includes(s);

/* Statuses Kwanisha can pick from the inline dropdown (not "completed" — that's
   the Complete button; not a fake "overdue"). */
const STATUS_CHOICES: TaskStatus[] = ['open', 'in-progress', 'waiting', 'cancelled'];

const STATUS_STYLE: Record<TaskStatus, { fg: string; bg: string }> = {
  open:          { fg: '#1d4ed8', bg: '#dbeafe' },
  'in-progress': { fg: '#7c3aed', bg: '#ece4fb' },
  waiting:       { fg: '#b45309', bg: '#fef3c7' },
  completed:     { fg: '#15803d', bg: '#dcfce7' },
  cancelled:     { fg: '#6a6a6a', bg: '#f0f0f0' },
};

const TASK_TYPES = Object.keys(TASK_TYPE_LABEL) as TaskType[];

const today = () => new Date().toISOString().slice(0, 10);
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Pull the first related item set on a task, with a human label. */
function relatedOf(t: SalesTask): string | undefined {
  return t.relatedAccount ?? t.relatedContact ?? t.relatedLead ?? t.relatedOpportunity ?? t.relatedEvent;
}

interface FormState {
  title: string;
  type: TaskType;
  dueDate: string;
  priority: Priority;
  related: string;
  notes: string;
}
const emptyForm: FormState = { title: '', type: 'follow-up', dueDate: '', priority: 'normal', related: '', notes: '' };

export default function TasksPage() {
  const { tasks } = useSalesState();
  const [view, setView] = useState<View>('today');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const t0 = today();

  /* Counts for the Today / Overdue pills. */
  const counts = useMemo(() => {
    let today = 0, overdue = 0;
    for (const t of tasks) {
      if (!isOpenIsh(t.status) || !t.dueDate) continue;
      if (t.dueDate === t0) today += 1;
      else if (t.dueDate < t0) overdue += 1;
    }
    return { today, overdue };
  }, [tasks, t0]);

  const visible = useMemo(() => {
    const weekEnd = addDays(t0, 7);
    const matches = (t: SalesTask): boolean => {
      switch (view) {
        case 'completed': return t.status === 'completed';
        case 'all': return true;
        case 'today': return isOpenIsh(t.status) && t.dueDate === t0;
        case 'overdue': return isOpenIsh(t.status) && !!t.dueDate && t.dueDate < t0;
        case 'week': return isOpenIsh(t.status) && !!t.dueDate && t.dueDate >= t0 && t.dueDate <= weekEnd;
        case 'upcoming': return isOpenIsh(t.status) && !!t.dueDate && t.dueDate > t0;
        default: return true;
      }
    };
    return tasks.filter(matches).sort((a, b) => {
      // Soonest due first; undated last.
      const ad = a.dueDate ?? '9999-99-99';
      const bd = b.dueDate ?? '9999-99-99';
      return ad < bd ? -1 : ad > bd ? 1 : 0;
    });
  }, [tasks, view, t0]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function save(addAnother: boolean) {
    if (!form.title.trim()) return;
    addTask({
      title: form.title.trim(),
      type: form.type,
      priority: form.priority,
      status: 'open',
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      ...(form.related.trim() ? { relatedAccount: form.related.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    });
    setForm(emptyForm);
    if (!addAnother) setShowForm(false);
  }

  const inputCls = 'h-10 px-3 rounded-xl text-sm w-full';
  const inputStyle: React.CSSProperties = { border: '1px solid #dddddd', color: '#222', background: '#fff' };
  const labelCls = 'text-xs font-semibold mb-1.5 block';

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Your follow-up system — calls, emails, research, and reminders for {PROPERTY.name}.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); if (showForm) setForm(emptyForm); }}
          className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
          style={{ background: showForm ? '#fff' : '#7c3aed', color: showForm ? '#6a6a6a' : '#fff', border: `1px solid ${showForm ? '#dddddd' : '#7c3aed'}` }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close' : 'Create Task'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="p-4 flex flex-col gap-3" style={{ ...card, background: '#faf7ff', borderColor: '#e0d4f7' }}>
          <p className="text-sm font-bold" style={{ color: '#222' }}>New follow-up</p>

          <div>
            <label className={labelCls} style={{ color: '#6a6a6a' }}>Task title</label>
            <input
              className={inputCls} style={inputStyle} value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Call ABC Construction travel manager"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls} style={{ color: '#6a6a6a' }}>Type</label>
              <select className={inputCls} style={inputStyle} value={form.type} onChange={(e) => set('type', e.target.value as TaskType)}>
                {TASK_TYPES.map((tt) => <option key={tt} value={tt}>{TASK_TYPE_LABEL[tt]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: '#6a6a6a' }}>Due date</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls} style={{ color: '#6a6a6a' }}>Priority</label>
              <select className={inputCls} style={inputStyle} value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: '#6a6a6a' }}>Related item</label>
            <input
              className={inputCls} style={inputStyle} value={form.related}
              onChange={(e) => set('related', e.target.value)}
              placeholder="Account, contact, lead or event this relates to (optional)"
            />
          </div>

          <div>
            <label className={labelCls} style={{ color: '#6a6a6a' }}>Notes</label>
            <textarea
              className="px-3 py-2 rounded-xl text-sm w-full" style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Any detail you want to remember (optional)"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => save(false)} disabled={!form.title.trim()}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
              style={{ background: form.title.trim() ? '#7c3aed' : '#e0d4f7', color: '#fff', cursor: form.title.trim() ? 'pointer' : 'not-allowed' }}
            >
              <Check className="w-4 h-4" /> Save Task
            </button>
            <button
              onClick={() => save(true)} disabled={!form.title.trim()}
              className="h-10 px-4 rounded-full text-sm font-semibold"
              style={{ background: '#fff', color: form.title.trim() ? '#7c3aed' : '#bbb', border: `1px solid ${form.title.trim() ? '#7c3aed' : '#dddddd'}`, cursor: form.title.trim() ? 'pointer' : 'not-allowed' }}
            >
              Save &amp; Add Another
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="h-10 px-4 rounded-full text-sm font-semibold"
              style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View pills */}
      <div className="flex gap-2 flex-wrap">
        {VIEW_ORDER.map((v) => {
          const on = view === v;
          const count = v === 'today' ? counts.today : v === 'overdue' ? counts.overdue : null;
          return (
            <button
              key={v} onClick={() => setView(v)}
              className="h-9 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
              style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}
            >
              {VIEW_LABEL[v]}
              {count != null && count > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: on ? 'rgba(255,255,255,0.22)' : (v === 'overdue' ? '#fee2e2' : '#ece4fb'),
                    color: on ? '#fff' : (v === 'overdue' ? '#b91c1c' : '#7c3aed'),
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {visible.map((t) => {
          const ps = PRIORITY_STYLE[t.priority];
          const ss = STATUS_STYLE[t.status];
          const done = t.status === 'completed';
          const overdue = isOpenIsh(t.status) && !!t.dueDate && t.dueDate < t0;
          const related = relatedOf(t);
          return (
            <div key={t.id} className="p-4 flex flex-col gap-3" style={card}>
              <div className="flex items-start gap-3">
                {/* Complete toggle */}
                <button
                  onClick={() => updateTask(t.id, { status: done ? 'open' : 'completed' })}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: done ? '#15803d' : '#929292' }}
                  aria-label={done ? 'Mark as open' : 'Mark complete'}
                  title={done ? 'Mark as open' : 'Mark complete'}
                >
                  {done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-bold text-sm"
                      style={{ color: done ? '#929292' : '#222', textDecoration: done ? 'line-through' : 'none' }}
                    >
                      {t.title}
                    </p>
                    <Badge label={TASK_TYPE_LABEL[t.type]} fg="#6a6a6a" bg="#f0f0f0" />
                    <Badge label={ps.label} fg={ps.fg} bg={ps.bg} />
                    <Badge label={TASK_STATUS_LABEL[t.status]} fg={ss.fg} bg={ss.bg} />
                  </div>

                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5">
                    {t.dueDate ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: overdue ? '#b91c1c' : '#6a6a6a' }}
                      >
                        {overdue ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                        {overdue ? 'Overdue · ' : 'Due '}{fmtDate(t.dueDate)}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#929292' }}>No due date</span>
                    )}
                    {related && (
                      <span className="text-xs" style={{ color: '#929292' }}>
                        Re: <span style={{ color: '#222', fontWeight: 600 }}>{related}</span>
                      </span>
                    )}
                  </div>

                  {t.notes && (
                    <p className="text-xs mt-1.5" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{t.notes}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                {!done && (
                  <button
                    onClick={() => updateTask(t.id, { status: 'completed' })}
                    className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    style={{ background: '#7c3aed', color: '#fff' }}
                  >
                    <Check className="w-3.5 h-3.5" /> Complete
                  </button>
                )}
                <button
                  onClick={() => updateTask(t.id, { dueDate: addDays(t.dueDate ?? t0, 7) })}
                  className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                >
                  <Calendar className="w-3.5 h-3.5" /> Reschedule +7d
                </button>
                <select
                  value={STATUS_CHOICES.includes(t.status) ? t.status : 'open'}
                  onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                  className="h-8 px-2.5 rounded-full text-xs font-semibold"
                  style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                  aria-label="Set status"
                >
                  {STATUS_CHOICES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div
            className="px-4 py-10 text-center text-sm"
            style={{ border: '1px dashed #dddddd', borderRadius: 16, color: '#929292', background: '#fff' }}
          >
            No follow-ups due right now.
          </div>
        )}
      </div>

      <p className="text-[11px] text-center" style={{ color: '#bbb' }}>{OWNER} · {PROPERTY.code}</p>
    </div>
  );
}
