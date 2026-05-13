'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

/**
 * Phase 1 admin gate — shared secret in localStorage + cookie.
 * Replaced by Clerk role gating later.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('stayops_admin') : null;
    if (!saved) { setUnlocked(false); return; }
    fetch('/api/admin/check', { headers: { 'x-admin-secret': saved } })
      .then((r) => {
        if (r.ok) setUnlocked(true);
        else { window.localStorage.removeItem('stayops_admin'); setUnlocked(false); }
      })
      .catch(() => setUnlocked(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch('/api/admin/check', { headers: { 'x-admin-secret': input } });
    if (!r.ok) { setErr('Incorrect secret'); return; }
    window.localStorage.setItem('stayops_admin', input);
    document.cookie = `stayops_admin=${encodeURIComponent(input)}; path=/; SameSite=Strict`;
    setUnlocked(true);
  }

  if (unlocked === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f7f7' }}>
        <p className="text-sm" style={{ color: '#929292' }}>Loading…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f7f7f7' }}>
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ border: '1px solid #dddddd' }}>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4" style={{ color: '#6a6a6a' }} />
            <h1 className="text-lg font-bold" style={{ color: '#222' }}>Admin</h1>
          </div>
          <p className="text-xs mb-4" style={{ color: '#929292' }}>Enter the admin shared secret to continue.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Shared secret"
            className="w-full h-10 px-3 rounded-lg text-sm outline-none"
            style={{ background: '#fafafa', border: '1px solid #dddddd', color: '#222' }}
            autoFocus
          />
          {err && <p className="text-xs mt-2" style={{ color: '#b91c1c' }}>{err}</p>}
          <button
            type="submit"
            className="w-full mt-4 h-10 rounded-lg text-sm font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
