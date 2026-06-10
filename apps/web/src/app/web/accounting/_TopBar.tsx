'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Bell, ChevronDown,
  LogOut, User, Shield, Settings as SettingsIcon, UploadCloud,
} from 'lucide-react';
import { EntityDropdown } from './_EntityDropdown';
import { SearchOverlay } from './_SearchOverlay';

export function AcctTopBar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<null | 'bell' | 'profile'>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (barRef.current && !barRef.current.contains(e.target as Node)) setMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (m: typeof menu) => setMenu((cur) => (cur === m ? null : m));
  const go = (p: string) => { router.push(p); setMenu(null); };

  return (
    <>
      <header ref={barRef} className="h-14 flex items-center gap-3 px-4 flex-shrink-0 relative z-40" style={{ background: '#fff', borderBottom: '1px solid #dddddd' }}>
        {/* Logo + product */}
        <button onClick={() => go('/web/accounting/dashboard')} className="flex items-center gap-2 pr-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0F172A' }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="hidden lg:block leading-tight text-left">
            <p className="text-sm font-bold" style={{ color: '#222' }}>Stay<span style={{ color: '#6a4ec0' }}>Ops</span> <span className="font-medium" style={{ color: '#929292' }}>Accounting</span></p>
          </div>
        </button>

        <div className="w-px h-7" style={{ background: '#eee' }} />

        {/* Hotel / entity dropdown */}
        <EntityDropdown />

        {/* Global search */}
        <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 h-9 px-3 rounded-xl flex-1 max-w-md" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <span className="text-xs truncate" style={{ color: '#929292' }}>Search statements, transactions, vendors, accounts, reports…</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Upload */}
          <button onClick={() => go('/web/accounting/statements/upload')} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>
            <Plus className="w-4 h-4" /> Upload
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => toggle('bell')} className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
              <Bell className="w-4 h-4" style={{ color: '#6a6a6a' }} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ background: '#ff385c', fontSize: 9 }}>5</span>
            </button>
            {menu === 'bell' && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #f0f0f0' }}><p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Notifications</p></div>
                <Notif text="2 statements need column mapping" onClick={() => go('/web/accounting/statements?tab=needs-mapping')} />
                <Notif text="38 statement lines need coding" onClick={() => go('/web/accounting/reconciliation-workbench?tab=needs-coding')} />
                <Notif text="Cambria Operating Checking has a $187.42 difference" onClick={() => go('/web/accounting/reconciliation-workbench?tab=difference')} />
                <Notif text="6 receipts missing on GM Card charges" onClick={() => go('/web/accounting/reconciliation-workbench?tab=missing-support')} />
                <Notif text="May close blocked for 4 hotels" onClick={() => go('/web/accounting/month-close')} />
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => toggle('profile')} className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-xl" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#6a4ec0' }}>SN</div>
              <span className="text-xs font-medium hidden md:block" style={{ color: '#222' }}>Sanjay</span>
              <ChevronDown className="w-3 h-3" style={{ color: '#929292' }} />
            </button>
            {menu === 'profile' && (
              <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="px-3 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <p className="text-sm font-bold" style={{ color: '#222' }}>Sanjay Narsee</p>
                  <p className="text-[11px]" style={{ color: '#929292' }}>Corporate Accountant · All Hotels</p>
                </div>
                <MenuItem icon={<UploadCloud className="w-4 h-4" style={{ color: '#6a6a6a' }} />} label="Statement Inbox" onClick={() => go('/web/accounting/statements')} />
                <MenuItem icon={<User className="w-4 h-4" style={{ color: '#6a6a6a' }} />} label="My Profile" onClick={() => go('/web/accounting/settings')} />
                <MenuItem icon={<Shield className="w-4 h-4" style={{ color: '#6a6a6a' }} />} label="User Permissions" onClick={() => go('/web/accounting/admin')} />
                <MenuItem icon={<SettingsIcon className="w-4 h-4" style={{ color: '#6a6a6a' }} />} label="Settings" onClick={() => go('/web/accounting/settings')} />
                <MenuItem icon={<LogOut className="w-4 h-4" style={{ color: '#b91c1c' }} />} label="Logout" onClick={() => go('/web')} />
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function MenuItem({ label, icon, onClick }: { label: string; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[#f7f7f7]" style={{ color: '#222' }}>
      {icon}<span className="flex-1">{label}</span>
    </button>
  );
}
function Notif({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: '1px solid #f7f7f7' }}>
      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#6a4ec0' }} />
      <span className="text-xs" style={{ color: '#222' }}>{text}</span>
    </button>
  );
}
