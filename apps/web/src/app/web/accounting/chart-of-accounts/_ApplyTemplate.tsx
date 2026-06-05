'use client';

import { useState, useMemo } from 'react';
import { X, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { HOTEL_ENTITIES, COA_TEMPLATES, COA_TEMPLATE } from '@hos/shared/accounting-os';
import { applyCoaTemplate, useAcctState } from '../_store';
import { accountsForHotel, coaSetupForHotel } from '../_coa';

const APPLY_MODES = [
  { id: 'missing', label: 'Create missing accounts only', desc: 'Add template accounts this hotel does not have yet. Safest option.' },
  { id: 'replace', label: 'Replace inactive template accounts', desc: 'Reactivate and refresh inactive template accounts.' },
  { id: 'reset', label: 'Reset hotel COA to template', desc: 'Dangerous. Replaces this hotel’s account structure. Permission required.', danger: true },
] as const;

export function ApplyTemplateModal({ preHotel, onClose, onApplied }: { preHotel?: string; onClose: () => void; onApplied?: (hotelId: string) => void }) {
  const store = useAcctState();
  const [hotelId, setHotelId] = useState(preHotel ?? '');
  const [templateId, setTemplateId] = useState('hotel-standard');
  const [mode, setMode] = useState<typeof APPLY_MODES[number]['id']>('missing');
  const [opts, setOpts] = useState({ keepCustom: true, dontOverwriteNames: true, createSystem: true, mapBankCard: true });
  const [done, setDone] = useState(false);

  const setup = hotelId ? coaSetupForHotel(store, hotelId) : null;
  const alreadyApplied = setup?.templateApplied && setup.status !== 'Needs Template';

  const preview = useMemo(() => {
    if (!hotelId) return null;
    const existing = setup?.templateApplied ? accountsForHotel(store, hotelId).filter((a) => !a.custom) : [];
    const existingCodes = new Set(existing.map((a) => a.code));
    const toCreate = COA_TEMPLATE.filter((a) => !existingCodes.has(a.code)).length;
    const alreadyExist = COA_TEMPLATE.length - toCreate;
    const customKeep = accountsForHotel(store, hotelId).filter((a) => a.custom).length;
    return { toCreate, alreadyExist, customKeep, conflicts: 0 };
  }, [hotelId, store, setup]);

  const apply = () => {
    if (!hotelId || !templateId) return;
    const t = COA_TEMPLATES.find((x) => x.id === templateId);
    applyCoaTemplate(hotelId, t?.name ?? 'Hotel Standard COA');
    setDone(true);
    onApplied?.(hotelId);
  };

  if (done) {
    return (
      <Shell onClose={onClose}>
        <div className="p-8 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-6 h-6" style={{ color: '#15803d' }} /></div>
          <h2 className="text-lg font-bold" style={{ color: '#222' }}>Chart of Accounts template applied successfully.</h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{HOTEL_ENTITIES.find((h) => h.id === hotelId)?.hotelName} now uses the {COA_TEMPLATES.find((t) => t.id === templateId)?.name}.</p>
          <div className="flex gap-2 mt-2">
            <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Close</button>
            <button onClick={() => { setDone(false); setHotelId(''); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Apply to Another Hotel</button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell onClose={onClose}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center gap-2"><Layers className="w-5 h-5" style={{ color: '#6a4ec0' }} /><div><h2 className="text-base font-bold" style={{ color: '#222' }}>Apply Chart of Accounts Template</h2><p className="text-[11px]" style={{ color: '#929292' }}>Apply a standard account structure to a hotel entity.</p></div></div>
        <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
      </div>

      <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
        <Field label="Hotel Entity *">
          <select value={hotelId} onChange={(e) => setHotelId(e.target.value)} className={inp} style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}><option value="">Select hotel…</option>{HOTEL_ENTITIES.map((h) => <option key={h.id} value={h.id}>{h.hotelName} · {h.propertyCode}</option>)}</select>
        </Field>
        {alreadyApplied && <Note color="amber">This hotel already has a Chart of Accounts. Use “Create missing accounts only” to top it up without overwriting.</Note>}

        <Field label="Template *">
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inp} style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>{COA_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.accounts} accounts)</option>)}</select>
        </Field>

        <Field label="Apply Mode">
          <div className="flex flex-col gap-2">
            {APPLY_MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className="text-left p-3 rounded-xl flex items-start gap-2.5" style={{ border: `1px solid ${mode === m.id ? '#6a4ec0' : '#dddddd'}`, background: mode === m.id ? '#f7f5fd' : '#fff' }}>
                <span className="w-4 h-4 mt-0.5 rounded-full flex-shrink-0" style={{ border: `4px solid ${mode === m.id ? '#6a4ec0' : '#cfcfcf'}` }} />
                <div><p className="text-sm font-semibold" style={{ color: 'danger' in m && m.danger ? '#b91c1c' : '#222' }}>{m.label}</p><p className="text-[11px]" style={{ color: '#929292' }}>{m.desc}</p></div>
              </button>
            ))}
          </div>
        </Field>
        {mode === 'reset' && <Note color="red"><AlertTriangle className="w-3.5 h-3.5 inline mr-1" />Resetting COA can affect reports. Only authorized users can continue.</Note>}

        <div className="flex flex-col gap-2">
          {([['keepCustom', 'Keep existing custom accounts'], ['dontOverwriteNames', 'Do not overwrite account names already edited'], ['createSystem', 'Create required system accounts'], ['mapBankCard', 'Map standard bank and card accounts if possible']] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm" style={{ color: '#3f3f3f' }}>
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} />{label}
            </label>
          ))}
        </div>

        {preview && (
          <div className="rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ background: '#f7f7f7' }}>
            <Stat label="Accounts to create" value={preview.toCreate} accent="#15803d" />
            <Stat label="Already exist" value={preview.alreadyExist} />
            <Stat label="Custom kept" value={preview.customKeep} accent="#6a4ec0" />
            <Stat label="Conflicts" value={preview.conflicts} accent={preview.conflicts ? '#b91c1c' : '#222'} />
          </div>
        )}
      </div>

      <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
        <button onClick={apply} disabled={!hotelId || !templateId} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: hotelId && templateId ? 1 : 0.5 }}>Apply Template</button>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
function Stat({ label, value, accent = '#222' }: { label: string; value: number; accent?: string }) { return <div><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold" style={{ color: accent }}>{value}</p></div>; }
function Note({ children, color }: { children: React.ReactNode; color: 'amber' | 'red' }) { const c = color === 'red' ? { fg: '#b91c1c', bg: '#fee2e2' } : { fg: '#b45309', bg: '#fef3c7' }; return <div className="px-3 py-2 rounded-xl text-xs" style={{ background: c.bg, color: c.fg }}>{children}</div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
