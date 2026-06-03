'use client';

import { useState } from 'react';
import { X, Copy, Check, Mail, KeyRound, LogIn } from 'lucide-react';
import {
  HOS_PROPERTIES, ROLE_META, COMPANY_ROLES, HOTEL_ROLES, DEPARTMENTS, isCompanyRole,
  type AdminRole, type UserScope, type CompanyUser, type Department,
} from '@hos/shared';

/**
 * One Add/Edit user flow used by both the Company Users screen and the Hotel
 * Team screen. Adapts by `context`:
 *   - 'company': role list = company roles, scope = company or selected hotels
 *   - 'hotel'  : role list = hotel roles, hotel pre-filled + locked, dept + supervisor
 * Every person is a user first; role/department/scope are all editable here.
 */

export interface UserFormContext {
  kind: 'company' | 'hotel';
  /** For hotel context — the hotel this user belongs to. */
  hotelCode?: string;
  hotelName?: string;
}

interface Props {
  context: UserFormContext;
  /** Existing user to edit; omit for Add. */
  initial?: CompanyUser;
  /** Names to offer in the Supervisor dropdown (hotel context). */
  supervisorOptions?: string[];
  onClose: () => void;
  onSave: (user: CompanyUser) => void;
}

export function UserFormModal({ context, initial, supervisorOptions, onClose, onSave }: Props) {
  const editing = !!initial;
  const roleChoices = context.kind === 'company' ? COMPANY_ROLES.filter((r) => r !== 'super_admin') : HOTEL_ROLES;

  const [name, setName]   = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole]   = useState<AdminRole>(initial?.role ?? roleChoices[0]);
  const [department, setDepartment] = useState<Department>(initial?.department ?? ROLE_META[initial?.role ?? roleChoices[0]].department ?? 'Front Office');
  const [supervisor, setSupervisor] = useState(initial?.supervisor ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  // Invite confirmation shown after a NEW user is created (login + reset links).
  const [invite, setInvite] = useState<{ name: string; email: string; loginUrl: string; resetUrl: string } | null>(null);

  // Scope (company context only — hotel context is locked to its hotel).
  const initialScopeKind = initial?.scope.kind ?? (context.kind === 'company' ? 'company' : 'hotels');
  const [scopeKind, setScopeKind] = useState<'company' | 'hotels'>(initialScopeKind);
  const [hotelCodes, setHotelCodes] = useState<string[]>(
    initial?.scope.kind === 'hotels' ? initial.scope.hotelCodes
      : context.kind === 'hotel' && context.hotelCode ? [context.hotelCode] : [],
  );

  const roleForcesCompany = isCompanyRole(role) && role === 'company_admin';
  const effectiveScopeKind = context.kind === 'hotel' ? 'hotels' : (roleForcesCompany ? 'company' : scopeKind);

  const toggleHotel = (code: string) =>
    setHotelCodes((cur) => cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]);

  const onRoleChange = (r: AdminRole) => {
    setRole(r);
    const dep = ROLE_META[r].department;
    if (dep) setDepartment(dep);
  };

  const valid =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    (effectiveScopeKind === 'company' || hotelCodes.length > 0);

  const submit = () => {
    if (!valid) return;
    const id = initial?.id ?? `cu-${Date.now()}`;
    const scope: UserScope = effectiveScopeKind === 'company'
      ? { kind: 'company' }
      : { kind: 'hotels', hotelCodes };
    onSave({
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      scope,
      department: context.kind === 'hotel' || isHotelDept(role) ? department : undefined,
      supervisor: context.kind === 'hotel' ? (supervisor.trim() || undefined) : undefined,
      active,
      isDefaultHotelAdmin: initial?.isDefaultHotelAdmin,
      isHotelAdmin: initial?.isHotelAdmin,
    });
    // New user → show the invite (login + reset links). Edits close right away.
    if (editing) {
      onClose();
      return;
    }
    const token = inviteToken(id);
    setInvite({
      name: name.trim(),
      email: email.trim(),
      loginUrl: `${origin()}/login?invite=${token}`,
      resetUrl: `${origin()}/reset-password?token=${token}`,
    });
  };

  if (invite) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}>
                <Check className="w-5 h-5" style={{ color: '#15803d' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#222' }}>User created</h2>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Send {invite.name.split(' ')[0]} their access links</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
          </div>

          <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
            <p className="text-sm" style={{ color: '#3f3f3f' }}>
              Share these with <span className="font-semibold">{invite.email}</span>. The login link signs them in and prompts a password; the reset link lets them set a new one anytime.
            </p>
            <LinkRow icon={<LogIn className="w-4 h-4" />} label="Login link" url={invite.loginUrl} />
            <LinkRow icon={<KeyRound className="w-4 h-4" />} label="Reset password link" url={invite.resetUrl} />
            <p className="text-[11px] rounded-xl px-3 py-2.5" style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
              Demo links — real invites (working URLs, secure tokens, and the email send) come with backend auth.
            </p>
          </div>

          <div className="px-6 py-4 flex justify-between gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
            <a href={`mailto:${invite.email}?subject=${encodeURIComponent('Your StayOps account')}&body=${encodeURIComponent(`Hi ${invite.name.split(' ')[0]},\n\nYou've been added to StayOps. Log in here:\n${invite.loginUrl}\n\nNeed to set your password? Use:\n${invite.resetUrl}\n`)}`}
              className="h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: '#f7f7f7', color: '#222' }}>
              <Mail className="w-4 h-4" /> Email invite
            </a>
            <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#ff385c', color: '#fff' }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>{editing ? 'Edit User' : 'Add New User'}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              {context.kind === 'hotel' ? `Hotel-level · ${context.hotelName ?? context.hotelCode}` : 'Company-level user'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Jordan Lee" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={email} onChange={setEmail} placeholder="jordan@hosmgmt.com" type="email" />
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="(555) 010-0000" />
          </div>

          <div className="flex flex-col gap-1">
            <label className={lbl}>Role <span style={{ color: '#929292' }}>· changeable anytime</span></label>
            <select value={role} onChange={(e) => onRoleChange(e.target.value as AdminRole)} className={input}>
              {roleChoices.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
            </select>
            <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{ROLE_META[role].desc}</p>
          </div>

          {/* Department + supervisor — hotel-level */}
          {context.kind === 'hotel' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={lbl}>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={input}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Supervisor</label>
                {supervisorOptions && supervisorOptions.length > 0 ? (
                  <select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className={input}>
                    <option value="">— None —</option>
                    {supervisorOptions
                      .filter((n) => n !== name)
                      .map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                ) : (
                  <input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Reporting manager"
                    className={input} style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />
                )}
              </div>
            </div>
          )}

          {/* Scope */}
          {context.kind === 'hotel' ? (
            <div className="flex flex-col gap-1">
              <label className={lbl}>Hotel</label>
              <div className="h-11 px-3 rounded-xl flex items-center text-sm" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#222' }}>
                {context.hotelName ?? context.hotelCode}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className={lbl}>Access</label>
              {roleForcesCompany ? (
                <p className="text-sm rounded-xl px-3 py-2.5" style={{ background: '#f7f7f7', color: '#3f3f3f' }}>
                  Company-level role — full company access.
                </p>
              ) : (
                <div className="flex gap-2">
                  <ScopeBtn active={scopeKind === 'company'} onClick={() => setScopeKind('company')}>Full company</ScopeBtn>
                  <ScopeBtn active={scopeKind === 'hotels'} onClick={() => setScopeKind('hotels')}>Selected hotels</ScopeBtn>
                </div>
              )}
              {effectiveScopeKind === 'hotels' && (
                <>
                  <div className="rounded-xl p-3 max-h-44 overflow-y-auto grid grid-cols-1 gap-1" style={{ border: '1px solid #f0f0f0', background: '#fafafa' }}>
                    {HOS_PROPERTIES.map((h) => {
                      const on = hotelCodes.includes(h.code);
                      return (
                        <button key={h.code} type="button" onClick={() => toggleHotel(h.code)}
                          className="flex items-center justify-between rounded-lg px-3 py-1.5 text-left transition-colors"
                          style={{ background: on ? '#fff1f3' : '#fff', border: `1px solid ${on ? '#ff385c' : '#f0f0f0'}` }}>
                          <span className="text-sm" style={{ color: '#222' }}>{h.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: on ? '#ff385c' : '#c1c1c1' }}>{on ? 'selected' : h.code}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px]" style={{ color: '#929292' }}>
                    {hotelCodes.length === 0 ? 'Pick one hotel (single-property) or several (multi-property).' : `${hotelCodes.length} selected.`}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
            <span className="text-sm" style={{ color: '#222' }}>Active</span>
            <button
              type="button"
              onClick={() => setActive((a) => !a)}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: active ? '#dcfce7' : '#fee2e2', color: active ? '#15803d' : '#b91c1c' }}
            >
              {active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: '#f7f7f7', color: '#222' }}>Cancel</button>
          <button onClick={submit} disabled={!valid} className="h-9 px-4 rounded-lg text-sm font-semibold transition-opacity" style={{ background: '#ff385c', color: '#fff', opacity: valid ? 1 : 0.5 }}>
            {editing ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  );
}

function isHotelDept(role: AdminRole): boolean {
  return ROLE_META[role].level === 'hotel';
}

function origin(): string {
  return typeof window !== 'undefined' ? window.location.origin : 'https://app.stayops.com';
}

// Demo-only invite token derived from the user id (real tokens come with backend auth).
function inviteToken(id: string): string {
  return `inv_${id.replace(/[^a-z0-9]/gi, '')}`;
}

function LinkRow({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div className="flex flex-col gap-1">
      <label className={lbl} style={{ color: '#6a6a6a' }}>
        <span className="inline-flex items-center gap-1.5">{icon} {label}</span>
      </label>
      <div className="flex items-stretch gap-2">
        <input readOnly value={url} onFocus={(e) => e.target.select()}
          className="flex-1 h-11 px-3 rounded-xl text-sm font-mono outline-none" style={{ border: '1px solid #dddddd', background: '#fafafa', color: '#3f3f3f' }} />
        <button onClick={copy} className="h-11 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
          style={{ background: copied ? '#dcfce7' : '#222', color: copied ? '#15803d' : '#fff' }}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

const lbl = 'text-[11px] font-semibold uppercase tracking-wide';
const input = 'h-11 px-3 rounded-xl outline-none focus:ring-2 focus:ring-[#ff385c] text-sm';

function ScopeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors" style={{ background: active ? '#222' : '#f7f7f7', color: active ? '#fff' : '#6a6a6a' }}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={lbl} style={{ color: '#6a6a6a' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={input} style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />
    </div>
  );
}
