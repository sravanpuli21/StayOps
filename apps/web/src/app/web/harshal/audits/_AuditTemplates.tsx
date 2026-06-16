'use client';

/**
 * Audit Form Builder — Harshal (regional) scope.
 *
 * A real inspection-form builder. Start from the standard checklist model the
 * room-audit walkthrough uses (AUDIT_AREAS + AUDIT_CHECKLIST), then build a form:
 * add/remove areas & questions, give each question a response type
 * (Pass/Fail · Yes/No · Rating · Number · Text) plus Required / Photo flags, set
 * per-area frequency + a pass threshold, preview exactly what the inspector
 * fills out, then push to a target scope. Demo behavior: the assignment is
 * recorded in local state and listed — no per-room tasks fire.
 */
import { useMemo, useState } from 'react';
import {
  AUDIT_AREAS, getChecklistForArea, getRoomsForHotel,
  type AuditAreaKey,
} from '@hos/shared';
import {
  Plus, Pencil, Send, X, Check, ClipboardList, Building2, Layers,
  ChevronRight, ChevronDown, Trash2, Camera, Star, Eye, Wrench,
} from 'lucide-react';

// Only King/Queen exist in the room inventory — keep the scope picker honest.
const ROOM_TYPES = ['King', 'Queen'] as const;
const FREQ_OPTIONS = [
  { days: 30, label: 'Monthly' },
  { days: 90, label: 'Quarterly' },
  { days: 180, label: 'Semi-annual' },
  { days: 365, label: 'Annual' },
];

type ResponseType = 'pass_fail' | 'yes_no' | 'rating' | 'number' | 'text';
const RESPONSE_TYPES: { key: ResponseType; label: string }[] = [
  { key: 'pass_fail', label: 'Pass / Fail' },
  { key: 'yes_no', label: 'Yes / No' },
  { key: 'rating', label: 'Rating 1–5' },
  { key: 'number', label: 'Number' },
  { key: 'text', label: 'Short text' },
];

/* Stored template shape — each question carries its own config so it persists. */
interface TplItem { id: string; name: string; responseType: ResponseType; required: boolean; photo: boolean }
interface TplArea { id: string; label: string; frequencyDays: number; items: TplItem[] }
interface AuditTemplate { id: string; name: string; areas: TplArea[]; passThreshold: number }

type TargetKind = 'all-territory' | 'one-hotel' | 'room-type-all' | 'room-type-one-hotel';
interface Assignment {
  id: string; templateName: string; areaCount: number; itemCount: number;
  scopeLabel: string; roomCount: number; dueDate: string;
}

const stdItems = (key: AuditAreaKey): TplItem[] =>
  getChecklistForArea(key).map((i) => ({ id: i.id, name: i.name, responseType: 'pass_fail', required: true, photo: false }));
let uid = 0;
const newId = (p: string) => `${p}-${(uid += 1)}-${Math.random().toString(36).slice(2, 6)}`;

const SEED_TEMPLATES: AuditTemplate[] = [
  {
    id: 'tpl-quarterly', name: 'Quarterly Deep Audit', passThreshold: 85,
    areas: (['entry', 'bathroom', 'bedroom', 'hvac', 'fire_life_safety'] as AuditAreaKey[])
      .map((k) => ({ id: k, label: AUDIT_AREAS.find((a) => a.key === k)!.label, frequencyDays: 90, items: stdItems(k) })),
  },
  {
    id: 'tpl-safety', name: 'Monthly Safety Sweep', passThreshold: 90,
    areas: (['fire_life_safety', 'hvac'] as AuditAreaKey[])
      .map((k) => ({ id: k, label: AUDIT_AREAS.find((a) => a.key === k)!.label, frequencyDays: 30, items: stdItems(k) })),
  },
];

const freqLabel = (days: number) => FREQ_OPTIONS.find((f) => f.days === days)?.label ?? `${days}d`;
const tplItemCount = (t: AuditTemplate) => t.areas.reduce((s, a) => s + a.items.length, 0);

interface ScopeHotel { id: string; shortName: string }

export function AuditTemplates({ hotels }: { hotels: ScopeHotel[] }) {
  const [templates, setTemplates] = useState<AuditTemplate[]>(SEED_TEMPLATES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editor, setEditor] = useState<AuditTemplate | 'new' | null>(null);
  const [pushFor, setPushFor] = useState<AuditTemplate | null>(null);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const saveTemplate = (t: AuditTemplate) => {
    setTemplates((prev) => prev.some((x) => x.id === t.id) ? prev.map((x) => x.id === t.id ? t : x) : [t, ...prev]);
    setEditor(null);
    flash(`Form "${t.name}" saved.`);
  };
  const pushTemplate = (a: Assignment) => {
    setAssignments((prev) => [a, ...prev]);
    setPushFor(null);
    flash(`"${a.templateName}" pushed to ${a.scopeLabel}.`);
  };

  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Audit Forms</h2>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Build the inspection form — areas, questions & answer types — then push it to your hotels.</p>
        </div>
        <button onClick={() => setEditor('new')} className="h-9 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: '#ff385c', color: '#fff' }}><Plus className="w-4 h-4" /> New Form</button>
      </div>

      {/* Template list */}
      <div className="grid md:grid-cols-2 gap-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl p-4 flex flex-col gap-2" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#fff1f3' }}><ClipboardList className="w-4 h-4" style={{ color: '#ff385c' }} /></div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#222' }}>{t.name}</p>
                <p className="text-[11px]" style={{ color: '#929292' }}>{t.areas.length} areas · {tplItemCount(t)} questions · pass ≥ {t.passThreshold}%</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {t.areas.map((a) => (
                <span key={a.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f7f7f7', color: '#3f3f3f' }}>
                  {a.label} · {a.items.length}q · {freqLabel(a.frequencyDays)}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setPushFor(t)} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#ff385c', color: '#fff' }}><Send className="w-3.5 h-3.5" /> Push</button>
              <button onClick={() => setEditor(t)} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned templates */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Assigned Forms</h3>
        {assignments.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ border: '1px dashed #dddddd', background: '#fff' }}>
            <p className="text-sm" style={{ color: '#929292' }}>No forms pushed yet. Build one above and push it to your hotels.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            {assignments.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < assignments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#dcfce7' }}><Check className="w-4 h-4" style={{ color: '#15803d' }} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#222' }}>{a.templateName}</p>
                  <p className="text-[11px]" style={{ color: '#929292' }}>{a.scopeLabel} · {a.areaCount} areas · {a.itemCount} questions · ~{a.roomCount} rooms · due {a.dueDate}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: '#dcfce7', color: '#15803d' }}>Active</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editor && <FormBuilder template={editor === 'new' ? null : editor} onCancel={() => setEditor(null)} onSave={saveTemplate} />}
      {pushFor && <PushModal template={pushFor} hotels={hotels} onCancel={() => setPushFor(null)} onPush={pushTemplate} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg" style={{ background: '#15803d', color: '#fff' }}>{toast}</div>}
    </div>
  );
}

/* ── Form builder ─────────────────────────────────────────────────────── */
interface DraftItem extends TplItem { on: boolean }
interface DraftArea { id: string; label: string; optional: boolean; custom: boolean; on: boolean; freq: number; items: DraftItem[] }

function buildDraft(template: AuditTemplate | null): DraftArea[] {
  const draft: DraftArea[] = AUDIT_AREAS.map((a) => {
    const t = template?.areas.find((x) => x.id === a.key);
    const std = stdItems(a.key);
    let items: DraftItem[];
    if (t) {
      const byId = new Map(t.items.map((i) => [i.id, i]));
      items = std.map((it) => { const m = byId.get(it.id); return m ? { ...m, on: true } : { ...it, on: false }; });
      const stdIds = new Set(std.map((i) => i.id));
      t.items.filter((i) => !stdIds.has(i.id)).forEach((i) => items.push({ ...i, on: true }));
    } else {
      items = std.map((it) => ({ ...it, on: true }));
    }
    return { id: a.key, label: a.label, optional: a.optional, custom: false, on: !!t, freq: t?.frequencyDays ?? 90, items };
  });
  if (template) {
    const stdKeys = new Set(AUDIT_AREAS.map((a) => a.key as string));
    template.areas.filter((t) => !stdKeys.has(t.id)).forEach((t) => {
      draft.push({ id: t.id, label: t.label, optional: false, custom: true, on: true, freq: t.frequencyDays, items: t.items.map((i) => ({ ...i, on: true })) });
    });
  }
  return draft;
}

function FormBuilder({ template, onCancel, onSave }: { template: AuditTemplate | null; onCancel: () => void; onSave: (t: AuditTemplate) => void }) {
  const [name, setName] = useState(template?.name ?? '');
  const [threshold, setThreshold] = useState(template?.passThreshold ?? 85);
  const [areas, setAreas] = useState<DraftArea[]>(() => buildDraft(template));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [newAreaName, setNewAreaName] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'build' | 'preview'>('build'); // mobile toggle; desktop shows both

  const patch = (id: string, fn: (a: DraftArea) => DraftArea) => setAreas((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));
  const patchItem = (areaId: string, itemId: string, fn: (i: DraftItem) => DraftItem) =>
    patch(areaId, (a) => ({ ...a, items: a.items.map((i) => (i.id === itemId ? fn(i) : i)) }));

  const toggleArea = (id: string) => patch(id, (a) => ({ ...a, on: !a.on }));
  const setFreq = (id: string, days: number) => patch(id, (a) => ({ ...a, freq: days }));
  const toggleItem = (areaId: string, itemId: string) => patchItem(areaId, itemId, (i) => ({ ...i, on: !i.on }));
  const setAllItems = (areaId: string, on: boolean) => patch(areaId, (a) => ({ ...a, items: a.items.map((i) => ({ ...i, on })) }));
  const removeItem = (areaId: string, itemId: string) => patch(areaId, (a) => ({ ...a, items: a.items.filter((i) => i.id !== itemId) }));
  const setType = (areaId: string, itemId: string, rt: ResponseType) => patchItem(areaId, itemId, (i) => ({ ...i, responseType: rt }));
  const setReq = (areaId: string, itemId: string, v: boolean) => patchItem(areaId, itemId, (i) => ({ ...i, required: v }));
  const setPhoto = (areaId: string, itemId: string, v: boolean) => patchItem(areaId, itemId, (i) => ({ ...i, photo: v }));
  const renameItem = (areaId: string, itemId: string, name: string) => patchItem(areaId, itemId, (i) => ({ ...i, name }));
  const renameArea = (areaId: string, label: string) => patch(areaId, (a) => ({ ...a, label }));

  const addItem = (areaId: string) => {
    const txt = (newItemText[areaId] ?? '').trim();
    if (!txt) return;
    patch(areaId, (a) => ({ ...a, on: true, items: [...a.items, { id: newId('q'), name: txt, responseType: 'pass_fail', required: true, photo: false, on: true }] }));
    setNewItemText((m) => ({ ...m, [areaId]: '' }));
  };
  const addArea = () => {
    const label = newAreaName.trim();
    if (!label) return;
    const id = newId('area');
    setAreas((prev) => [...prev, { id, label, optional: false, custom: true, on: true, freq: 90, items: [] }]);
    setExpanded((m) => ({ ...m, [id]: true }));
    setNewAreaName('');
  };
  const removeArea = (id: string) => setAreas((prev) => prev.filter((a) => a.id !== id));

  const save = () => {
    if (!name.trim()) return setError('Form name is required.');
    const onAreas = areas.filter((a) => a.on);
    if (onAreas.length === 0) return setError('Turn on at least one area.');
    const out: TplArea[] = [];
    for (const a of onAreas) {
      const items = a.items.filter((i) => i.on);
      if (items.length === 0) return setError(`"${a.label}" has no questions — add or check at least one, or turn the area off.`);
      out.push({ id: a.id, label: a.label, frequencyDays: a.freq, items: items.map(({ on: _on, ...rest }) => rest) });
    }
    onSave({ id: template?.id ?? newId('tpl'), name: name.trim(), passThreshold: threshold, areas: out });
  };

  const previewAreas = useMemo(
    () => areas.filter((a) => a.on).map((a) => ({ ...a, items: a.items.filter((i) => i.on) })),
    [areas],
  );
  const totalAreas = previewAreas.length;
  const totalItems = previewAreas.reduce((s, a) => s + a.items.length, 0);

  return (
    <Modal title={template ? 'Edit Audit Form' : 'New Audit Form'} onClose={onCancel} size="xl">
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2"><Field label="Form Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quarterly Deep Audit" className={INPUT} /></Field></div>
          <Field label="Pass Threshold (%)"><input type="number" min={50} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className={INPUT} /></Field>
        </div>

        {/* Mobile build/preview toggle */}
        <div className="flex lg:hidden gap-1 p-1 rounded-xl self-start" style={{ background: '#f0f0f0' }}>
          {(['build', 'preview'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className="px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: view === v ? '#fff' : 'transparent', color: view === v ? '#222' : '#6a6a6a' }}>
              {v === 'build' ? <Wrench className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}{v === 'build' ? 'Build' : 'Preview'}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-5">
          {/* ── BUILD column ── */}
          <div className={`${view === 'build' ? 'block' : 'hidden'} lg:block`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: '#6a6a6a' }}><Wrench className="w-3.5 h-3.5" /> Build</p>
              <p className="text-[11px] font-semibold" style={{ color: '#929292' }}>{totalAreas} areas · {totalItems} questions</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {areas.map((a) => {
                const inc = a.items.filter((i) => i.on).length;
                const open = expanded[a.id];
                return (
                  <div key={a.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${a.on ? '#ff385c' : '#eee'}`, background: a.on ? '#fff' : '#fafafa' }}>
                    <div className="flex items-center gap-2.5 px-3 py-2">
                      <button onClick={() => toggleArea(a.id)} className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: a.on ? '#ff385c' : '#fff', border: `1px solid ${a.on ? '#ff385c' : '#ccc'}` }}>
                        {a.on && <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <EditableLabel value={a.label} onChange={(v) => renameArea(a.id, v)} bold={a.on}
                          suffix={<>
                            {a.custom && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#fff1f3', color: '#ff385c' }}>custom</span>}
                            {a.optional && <span className="ml-1.5 text-[10px] font-semibold" style={{ color: '#b58900' }}>optional</span>}
                          </>}
                        />
                        <p className="text-[11px]" style={{ color: '#929292' }}>{a.on ? `${inc} of ${a.items.length} questions` : `${a.items.length} questions`}</p>
                      </div>
                      <select value={a.freq} onChange={(e) => setFreq(a.id, Number(e.target.value))} disabled={!a.on} className="h-8 px-2 rounded-lg text-xs" style={{ border: '1px solid #ddd', background: a.on ? '#fff' : '#f7f7f7', color: a.on ? '#222' : '#bbb' }}>
                        {FREQ_OPTIONS.map((f) => <option key={f.days} value={f.days}>{f.label}</option>)}
                      </select>
                      {a.custom && <button onClick={() => removeArea(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: '#b91c1c' }} title="Delete area"><Trash2 className="w-3.5 h-3.5" /></button>}
                      <button onClick={() => setExpanded((m) => ({ ...m, [a.id]: !m[a.id] }))} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: '#6a6a6a' }} title="Show questions">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                    {open && (
                      <div className="px-3 pb-3 pt-1" style={{ borderTop: '1px solid #f0f0f0', background: '#fbfbfb' }}>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{a.items.length} questions</span>
                          {a.on && a.items.length > 0 && (
                            <div className="flex gap-2">
                              <button onClick={() => setAllItems(a.id, true)} className="text-[11px] font-semibold" style={{ color: '#ff385c' }}>Select all</button>
                              <span style={{ color: '#ddd' }}>·</span>
                              <button onClick={() => setAllItems(a.id, false)} className="text-[11px] font-semibold" style={{ color: '#6a6a6a' }}>Clear</button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {a.items.map((it) => (
                            <QuestionRow
                              key={it.id} item={it} areaOn={a.on}
                              onToggle={() => toggleItem(a.id, it.id)}
                              onRemove={() => removeItem(a.id, it.id)}
                              onRename={(v) => renameItem(a.id, it.id, v)}
                              onType={(rt) => setType(a.id, it.id, rt)}
                              onReq={(v) => setReq(a.id, it.id, v)}
                              onPhoto={(v) => setPhoto(a.id, it.id, v)}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input value={newItemText[a.id] ?? ''} onChange={(e) => setNewItemText((m) => ({ ...m, [a.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(a.id); } }} placeholder="Add a question…" className="h-8 px-2.5 rounded-lg text-xs flex-1 border border-[#dddddd] bg-white text-[#222] outline-none focus:ring-2 focus:ring-[#ff385c]" />
                          <button onClick={() => addItem(a.id)} className="h-8 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: '#222', color: '#fff' }}><Plus className="w-3.5 h-3.5" /> Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2 p-2 rounded-xl" style={{ border: '1px dashed #ddd', background: '#fafafa' }}>
              <input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }} placeholder="New area — e.g. Pool & Spa, Corridor, Lobby…" className="h-9 px-2.5 rounded-lg text-sm flex-1 border border-[#dddddd] bg-white text-[#222] outline-none focus:ring-2 focus:ring-[#ff385c]" />
              <button onClick={addArea} className="h-9 px-3.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: '#ff385c', color: '#fff' }}><Plus className="w-4 h-4" /> Add Area</button>
            </div>
          </div>

          {/* ── PREVIEW column ── */}
          <div className={`${view === 'preview' ? 'block' : 'hidden'} lg:block`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2 inline-flex items-center gap-1.5" style={{ color: '#6a6a6a' }}><Eye className="w-3.5 h-3.5" /> Preview — what the inspector sees</p>
            <FormPreview name={name || 'Untitled Form'} threshold={threshold} areas={previewAreas} />
          </div>
        </div>

        {error && <p className="text-xs font-medium" style={{ color: '#b91c1c' }}>{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={save} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#ff385c', color: '#fff' }}>Save Form</button>
        </div>
      </div>
    </Modal>
  );
}

/* Inline-editable question row. */
function QuestionRow({ item, areaOn, onToggle, onRemove, onRename, onType, onReq, onPhoto }: {
  item: DraftItem; areaOn: boolean;
  onToggle: () => void; onRemove: () => void; onRename: (v: string) => void;
  onType: (rt: ResponseType) => void; onReq: (v: boolean) => void; onPhoto: (v: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const on = areaOn && item.on;

  const commit = () => { const v = draft.trim(); if (v) onRename(v); else setDraft(item.name); setEditing(false); };
  const start = () => { setDraft(item.name); setEditing(true); };

  return (
    <div className="rounded-lg px-2 py-1.5 group" style={{ background: on ? '#fff' : 'transparent', border: `1px solid ${on ? '#eee' : 'transparent'}` }}>
      <div className="flex items-center gap-2">
        <button onClick={() => areaOn && onToggle()} disabled={!areaOn} className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: on ? '#ff385c' : '#fff', border: `1px solid ${on ? '#ff385c' : '#ccc'}`, cursor: areaOn ? 'pointer' : 'default' }}>
          {on && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
        </button>
        {editing ? (
          <input
            autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { setDraft(item.name); setEditing(false); } }}
            className="text-xs leading-snug flex-1 min-w-0 h-6 px-1.5 rounded border border-[#ff385c] outline-none" style={{ color: '#222' }}
          />
        ) : (
          <button onClick={start} className="text-xs leading-snug flex-1 min-w-0 truncate text-left" style={{ color: on ? '#222' : '#929292' }} title="Click to edit">{item.name}</button>
        )}
        {!editing && (
          <button onClick={start} className="opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: '#6a6a6a' }} title="Edit question"><Pencil className="w-3 h-3" /></button>
        )}
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: '#b91c1c' }} title="Remove question"><X className="w-3.5 h-3.5" /></button>
      </div>
      {on && (
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5 pl-6">
          <select value={item.responseType} onChange={(e) => onType(e.target.value as ResponseType)} className="h-6 px-1.5 rounded text-[11px]" style={{ border: '1px solid #ddd', background: '#fff', color: '#222' }}>
            {RESPONSE_TYPES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <FlagChip active={item.required} onClick={() => onReq(!item.required)}>Required</FlagChip>
          <FlagChip active={item.photo} onClick={() => onPhoto(!item.photo)}><Camera className="w-3 h-3" /> Photo</FlagChip>
        </div>
      )}
    </div>
  );
}

/* Inline-editable label (area name). Click to edit, Enter/blur to commit. */
function EditableLabel({ value, onChange, bold, suffix }: { value: string; onChange: (v: string) => void; bold?: boolean; suffix?: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { const v = draft.trim(); if (v) onChange(v); else setDraft(value); setEditing(false); };
  if (editing) {
    return (
      <input
        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className="text-sm h-7 px-1.5 rounded border border-[#ff385c] outline-none w-full" style={{ color: '#222', fontWeight: bold ? 600 : 400 }}
      />
    );
  }
  return (
    <p className="text-sm truncate group/lbl" style={{ color: '#222', fontWeight: bold ? 600 : 400 }}>
      <button onClick={() => { setDraft(value); setEditing(true); }} className="text-left" title="Click to rename">{value}</button>
      <Pencil className="inline w-3 h-3 ml-1.5 opacity-0 group-hover/lbl:opacity-100 align-baseline" style={{ color: '#6a6a6a' }} />
      {suffix}
    </p>
  );
}

function FlagChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="h-6 px-2 rounded-full text-[11px] font-semibold inline-flex items-center gap-1" style={{ background: active ? '#fff1f3' : '#fff', border: `1px solid ${active ? '#ff385c' : '#ddd'}`, color: active ? '#ff385c' : '#929292' }}>
      {active && <Check className="w-3 h-3" />}{children}
    </button>
  );
}

/* ── Live preview of the fillable form ────────────────────────────────── */
function FormPreview({ name, threshold, areas }: { name: string; threshold: number; areas: DraftArea[] }) {
  if (areas.length === 0) {
    return <div className="rounded-2xl p-8 text-center" style={{ border: '1px dashed #ddd', background: '#fafafa' }}><p className="text-sm" style={{ color: '#929292' }}>Turn on an area to preview the form.</p></div>;
  }
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd', background: '#fff' }}>
      <div className="px-4 py-3" style={{ background: '#222', color: '#fff' }}>
        <p className="text-sm font-bold">{name}</p>
        <p className="text-[11px]" style={{ color: '#bbb' }}>Room ___ · pass ≥ {threshold}% · {areas.reduce((s, a) => s + a.items.length, 0)} questions</p>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {areas.map((a) => (
          <div key={a.id}>
            <div className="px-4 py-2 sticky top-0" style={{ background: '#f7f7f7', borderBottom: '1px solid #eee' }}>
              <p className="text-xs font-bold" style={{ color: '#222' }}>{a.label} <span className="font-normal" style={{ color: '#929292' }}>· {freqLabel(a.freq)}</span></p>
            </div>
            {a.items.map((it) => <PreviewQuestion key={it.id} item={it} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewQuestion({ item }: { item: DraftItem }) {
  const [val, setVal] = useState<string | number | null>(null);
  return (
    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #f4f4f4' }}>
      <p className="text-xs font-medium mb-1.5" style={{ color: '#222' }}>{item.name}{item.required && <span className="ml-1" style={{ color: '#b91c1c' }}>*</span>}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {item.responseType === 'pass_fail' && ['Pass', 'Fail', 'N/A'].map((o) => <Choice key={o} label={o} active={val === o} tone={o === 'Pass' ? 'green' : o === 'Fail' ? 'red' : 'gray'} onClick={() => setVal(o)} />)}
        {item.responseType === 'yes_no' && ['Yes', 'No'].map((o) => <Choice key={o} label={o} active={val === o} tone={o === 'Yes' ? 'green' : 'red'} onClick={() => setVal(o)} />)}
        {item.responseType === 'rating' && [1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setVal(n)}><Star className="w-5 h-5" style={{ color: typeof val === 'number' && n <= val ? '#f59e0b' : '#ddd', fill: typeof val === 'number' && n <= val ? '#f59e0b' : 'none' }} /></button>
        ))}
        {item.responseType === 'number' && <input type="number" placeholder="0" className="h-8 w-24 px-2 rounded-lg text-xs border border-[#ddd] outline-none" />}
        {item.responseType === 'text' && <input placeholder="Type a note…" className="h-8 flex-1 min-w-[140px] px-2 rounded-lg text-xs border border-[#ddd] outline-none" />}
        {item.photo && <span className="h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1" style={{ border: '1px dashed #ccc', color: '#6a6a6a' }}><Camera className="w-3.5 h-3.5" /> Add photo</span>}
      </div>
    </div>
  );
}

function Choice({ label, active, tone, onClick }: { label: string; active: boolean; tone: 'green' | 'red' | 'gray'; onClick: () => void }) {
  const c = tone === 'green' ? '#15803d' : tone === 'red' ? '#b91c1c' : '#6a6a6a';
  const bg = tone === 'green' ? '#dcfce7' : tone === 'red' ? '#fee2e2' : '#f0f0f0';
  return (
    <button onClick={onClick} className="h-7 px-3 rounded-full text-[11px] font-semibold" style={{ background: active ? bg : '#fff', border: `1px solid ${active ? c : '#ddd'}`, color: active ? c : '#929292' }}>{label}</button>
  );
}

/* ── Push template to scope ───────────────────────────────────────────── */
function PushModal({ template, hotels, onCancel, onPush }: { template: AuditTemplate; hotels: ScopeHotel[]; onCancel: () => void; onPush: (a: Assignment) => void }) {
  // Scope follows the global hotel selector. One hotel selected up top → the
  // push targets collapse to that hotel (entire hotel / a room type in it).
  const isSingle = hotels.length === 1;
  const scopedIds = useMemo(() => hotels.map((h) => h.id), [hotels]);

  const [kind, setKind] = useState<TargetKind>(isSingle ? 'one-hotel' : 'all-territory');
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? '');
  const [roomType, setRoomType] = useState<(typeof ROOM_TYPES)[number]>('King');
  const [due, setDue] = useState('2026-05-31');

  const roomsFor = (hids: string[], rt?: string) =>
    hids.reduce((s, hid) => s + getRoomsForHotel(hid).filter((r) => !rt || r.type === rt).length, 0);

  const { scopeLabel, roomCount } = useMemo(() => {
    if (kind === 'all-territory') return { scopeLabel: `All selected hotels (${hotels.length})`, roomCount: roomsFor(scopedIds) };
    if (kind === 'one-hotel') { const h = hotels.find((x) => x.id === hotelId); return { scopeLabel: h?.shortName ?? '—', roomCount: roomsFor([hotelId]) }; }
    if (kind === 'room-type-all') return { scopeLabel: `${roomType} rooms · all selected hotels`, roomCount: roomsFor(scopedIds, roomType) };
    const h = hotels.find((x) => x.id === hotelId);
    return { scopeLabel: `${roomType} rooms · ${h?.shortName ?? '—'}`, roomCount: roomsFor([hotelId], roomType) };
  }, [kind, hotelId, roomType, hotels, scopedIds]);

  const itemCount = tplItemCount(template);

  // Single-hotel selection hides the multi-hotel options entirely.
  const OPTIONS: { kind: TargetKind; label: string; icon: React.ReactNode; desc: string }[] = isSingle
    ? [
        { kind: 'one-hotel', label: 'Entire hotel', icon: <Building2 className="w-4 h-4" />, desc: `All rooms in ${hotels[0]?.shortName ?? 'this hotel'}` },
        { kind: 'room-type-one-hotel', label: 'A room type', icon: <Layers className="w-4 h-4" />, desc: `e.g. all King rooms in ${hotels[0]?.shortName ?? 'this hotel'}` },
      ]
    : [
        { kind: 'all-territory', label: 'All my hotels', icon: <Building2 className="w-4 h-4" />, desc: `Every selected hotel (${hotels.length})` },
        { kind: 'one-hotel', label: 'One hotel', icon: <Building2 className="w-4 h-4" />, desc: 'A single hotel you manage' },
        { kind: 'room-type-all', label: 'A room type — all hotels', icon: <Layers className="w-4 h-4" />, desc: 'e.g. all King rooms across your hotels' },
        { kind: 'room-type-one-hotel', label: 'A room type — one hotel', icon: <Layers className="w-4 h-4" />, desc: 'e.g. all Queens in one hotel' },
      ];

  // When only one hotel is in scope, no hotel dropdown is needed — it's implied.
  const needsHotelPicker = !isSingle && (kind === 'one-hotel' || kind === 'room-type-one-hotel');

  return (
    <Modal title={`Push "${template.name}"`} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Where should this audit apply?</p>
          {isSingle && (
            <p className="text-[11px] mb-2 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5" style={{ background: '#fff1f3', color: '#ff385c' }}>
              <Building2 className="w-3.5 h-3.5" /> Scoped to {hotels[0]?.shortName} (current hotel selection)
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {OPTIONS.map((o) => (
              <button key={o.kind} onClick={() => setKind(o.kind)} className="p-3 rounded-xl text-left flex flex-col gap-1" style={{ border: `1px solid ${kind === o.kind ? '#ff385c' : '#eee'}`, background: kind === o.kind ? '#fff1f3' : '#fff' }}>
                <span style={{ color: kind === o.kind ? '#ff385c' : '#6a6a6a' }}>{o.icon}</span>
                <span className="text-sm font-semibold" style={{ color: '#222' }}>{o.label}</span>
                <span className="text-[11px]" style={{ color: '#929292' }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {needsHotelPicker && (
            <Field label="Hotel"><select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={INPUT}>{hotels.map((h) => <option key={h.id} value={h.id}>{h.shortName}</option>)}</select></Field>
          )}
          {(kind === 'room-type-all' || kind === 'room-type-one-hotel') && (
            <Field label="Room Type"><select value={roomType} onChange={(e) => setRoomType(e.target.value as (typeof ROOM_TYPES)[number])} className={INPUT}>{ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          )}
          <Field label="Due Date"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={INPUT} /></Field>
        </div>

        <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: '#f7f7f7' }}>
          <Row k="Form" v={`${template.name} · ${template.areas.length} areas · ${itemCount} questions`} />
          <Row k="Scope" v={scopeLabel} />
          <Row k="Rooms affected" v={`~${roomCount}`} />
          <Row k="Due" v={due} />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={() => onPush({ id: newId('as'), templateName: template.name, areaCount: template.areas.length, itemCount, scopeLabel, roomCount, dueDate: due })} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#ff385c', color: '#fff' }}><Send className="w-3.5 h-3.5" /> Push Form</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────── */
const INPUT = 'h-9 px-2.5 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222] outline-none focus:ring-2 focus:ring-[#ff385c]';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><span className="text-xs" style={{ color: '#929292' }}>{k}</span><span className="text-xs font-medium text-right" style={{ color: '#222' }}>{v}</span></div>; }
function Modal({ title, onClose, children, size = 'lg' }: { title: string; onClose: () => void; children: React.ReactNode; size?: 'lg' | 'xl' }) {
  const w = size === 'xl' ? 'max-w-5xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className={`w-full ${w} rounded-2xl flex flex-col max-h-[90vh]`} style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
