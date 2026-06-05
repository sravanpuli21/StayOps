'use client';

import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useAcctState } from '../_store';
import { card, Badge, fmtDate } from '../_ui';

const TABS = ['Users', 'Roles', 'Permissions', 'Hotel Access', 'Audit Log'] as const;
const ROLES = ['Owner', 'Corporate Accountant', 'Bookkeeper', 'Hotel GM', 'Regional Manager', 'CPA', 'Super Admin'];
const PERMS = ['View Dashboard', 'Upload Statements', 'Review Transactions', 'Approve Transactions', 'Post Transactions', 'Manage Chart of Accounts', 'Reconcile Accounts', 'Close Month', 'View Reports', 'Export Reports', 'Manage Users', 'Manage Settings'];

const USERS = [
  { name: 'Sanjay Narsee', email: 'sanjay@hosmgmt.com', role: 'Corporate Accountant', access: 'All Hotels', status: 'Active', last: '2026-06-04' },
  { name: 'Owner', email: 'owner@hosmgmt.com', role: 'Owner', access: 'All Hotels', status: 'Active', last: '2026-06-02' },
  { name: 'Wendy Stevens', email: 'wendy@hosmgmt.com', role: 'Hotel GM', access: 'Hampton Inn & Suites - Gateway', status: 'Active', last: '2026-06-03' },
  { name: 'Rushabh', email: 'rushabh@hosmgmt.com', role: 'Hotel GM', access: 'Cambria Hotel - Savannah', status: 'Active', last: '2026-06-01' },
  { name: 'Ghassan Alyatim', email: 'ghassan@hosmgmt.com', role: 'Hotel GM', access: 'Home2 Suites - Baton Rouge', status: 'Active', last: '2026-05-30' },
  { name: 'CPA User', email: 'cpa@reevescpa.com', role: 'CPA', access: 'All Hotels (read-only)', status: 'Active', last: '2026-05-28' },
];

export default function AdminPage() {
  const state = useAcctState();
  const [tab, setTab] = useState<typeof TABS[number]>('Users');
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Admin</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Manage company users, roles, permissions, and hotel access.</p></div>
        {tab === 'Users' && <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add User</button>}
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Users' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Name', 'Email', 'Role', 'Hotel Access', 'Status', 'Last Login', ''].map((h) => <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>{USERS.map((u, i) => (
              <tr key={u.email} style={{ borderBottom: i < USERS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{u.name}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{u.email}</td>
                <td className="py-2.5 px-3"><Badge label={u.role} fg="#6a4ec0" bg="#ece4fb" /></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{u.access}</td>
                <td className="py-2.5 px-3"><Badge label={u.status} fg="#15803d" bg="#dcfce7" /></td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(u.last)}</td>
                <td className="py-2.5 px-3"><button className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'Roles' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLES.map((r) => <div key={r} className="p-4" style={card}><p className="text-sm font-bold" style={{ color: '#222' }}>{r}</p><p className="text-xs mt-1" style={{ color: '#929292' }}>{USERS.filter((u) => u.role === r).length} user(s)</p></div>)}
        </div>
      )}

      {tab === 'Permissions' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}><th className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>Permission</th>{['Accountant', 'GM', 'CPA'].map((r) => <th key={r} className="text-center text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{r}</th>)}</tr></thead>
            <tbody>{PERMS.map((p, i) => (
              <tr key={p} style={{ borderBottom: i < PERMS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{p}</td>
                <td className="py-2 px-3 text-center"><Check className="w-4 h-4 inline" style={{ color: '#15803d' }} /></td>
                <td className="py-2 px-3 text-center">{['View Dashboard', 'Review Transactions', 'Upload Statements', 'View Reports'].includes(p) ? <Check className="w-4 h-4 inline" style={{ color: '#15803d' }} /> : <span style={{ color: '#c1c1c1' }}>—</span>}</td>
                <td className="py-2 px-3 text-center">{['View Dashboard', 'View Reports', 'Export Reports'].includes(p) ? <Check className="w-4 h-4 inline" style={{ color: '#15803d' }} /> : <span style={{ color: '#c1c1c1' }}>—</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'Hotel Access' && (
        <div className="rounded-2xl p-6 text-sm" style={card}>
          <p style={{ color: '#3f3f3f' }}>Corporate Accountant (Sanjay) and Owner have access to <b>all 16 entities</b>. Each Hotel GM is restricted to their own hotel&rsquo;s books. The external CPA has <b>read-only</b> access across all entities for tax prep.</p>
        </div>
      )}

      {tab === 'Audit Log' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {state.activity.length === 0 ? <p className="px-4 py-8 text-center text-sm" style={{ color: '#929292' }}>No activity yet this session. Upload, categorize, post, reconcile, or close to populate.</p> :
            state.activity.slice(0, 40).map((a, i, arr) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} />
                <span className="text-sm" style={{ color: '#222' }}>{a.action}</span>
                {a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}
                <span className="ml-auto text-[11px]" style={{ color: '#c1c1c1' }}>{a.actor}</span>
              </div>
            ))}
        </div>
      )}

      {addOpen && <AddUserModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [role, setRole] = useState(ROLES[1]); const [access, setAccess] = useState('all');
  const valid = name.trim() && /\S+@\S+/.test(email);
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Add User</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <L label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} style={inpS} /></L>
          <L label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inp} style={inpS} type="email" /></L>
          <L label="Role"><select value={role} onChange={(e) => setRole(e.target.value)} className={inp} style={inpS}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></L>
          <L label="Hotel Access"><select value={access} onChange={(e) => setAccess(e.target.value)} className={inp} style={inpS}><option value="all">All Hotels</option><option value="selected">Selected Hotels</option><option value="one">One Hotel</option></select></L>
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
          <button onClick={onClose} disabled={!valid} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff', opacity: valid ? 1 : 0.5 }}>Send Invite</button>
        </div>
      </div>
    </div>
  );
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>;
}
const inp = 'h-9 px-2.5 rounded-lg text-sm outline-none w-full';
const inpS: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };
