'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Bell, HelpCircle, ChevronDown, CreditCard,
  Receipt, FileText, Landmark, LogOut, User, Shield, Settings as SettingsIcon,
} from 'lucide-react';
import { PORTFOLIO_STATS } from '@hos/shared/accounting-os';
import { EntityDropdown } from './_EntityDropdown';
import { SearchOverlay } from './_SearchOverlay';

export function AcctTopBar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState<null | 'upload' | 'bell' | 'profile'>(null);
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
        <div className="flex items-center gap-2 pr-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0F172A' }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-sm font-bold" style={{ color: '#222' }}>StayOps <span style={{ color: '#6a4ec0' }}>Accounting</span></p>
          </div>
        </div>

        <div className="w-px h-7" style={{ background: '#eee' }} />

        {/* Entity dropdown — company (HOS Management) lives in Settings, not here */}
        <EntityDropdown />

        {/* Search */}
        <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 h-9 px-3 rounded-xl flex-1 max-w-md" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <span className="text-xs truncate" style={{ color: '#929292' }}>Search transactions, vendors, hotels, accounts, reports…</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Upload */}
          <div className="relative">
            <button onClick={() => toggle('upload')} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>
              <Plus className="w-4 h-4" /> Upload
            </button>
            {menu === 'upload' && (
              <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <MenuItem icon={<Landmark className="w-4 h-4" style={{ color: '#1d4ed8' }} />} label="Upload Bank Statement" onClick={() => go('/web/accounting/banking/upload')} />
                <MenuItem icon={<CreditCard className="w-4 h-4" style={{ color: '#b45309' }} />} label="Upload Credit Card Statement" onClick={() => go('/web/accounting/credit-cards/upload')} />
                <MenuItem icon={<Receipt className="w-4 h-4" style={{ color: '#15803d' }} />} label="Upload Receipt" onClick={() => go('/web/accounting/documents')} />
                <MenuItem icon={<FileText className="w-4 h-4" style={{ color: '#6a6a6a' }} />} label="Upload Supporting Document" onClick={() => go('/web/accounting/documents')} />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => toggle('bell')} className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
              <Bell className="w-4 h-4" style={{ color: '#6a6a6a' }} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ background: '#ff385c', fontSize: 9 }}>4</span>
            </button>
            {menu === 'bell' && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #f0f0f0' }}><p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Notifications</p></div>
                <Notif text={`${PORTFOLIO_STATS.totalToReview} transactions need review`} onClick={() => go('/web/accounting/transactions')} />
                <Notif text={`${PORTFOLIO_STATS.missingReceipts} missing receipts`} onClick={() => go('/web/accounting/transactions?tab=missing')} />
                <Notif text="May close pending for 4 hotels" onClick={() => go('/web/accounting/month-close')} />
                <Notif text="Credit card reconciliation needed for Cambria" onClick={() => go('/web/accounting/reconciliation')} />
              </div>
            )}
          </div>

          {/* Help */}
          <button onClick={() => go('/web/accounting/settings')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
            <HelpCircle className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          </button>

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

function MenuItem({ label, icon, onClick, disabled }: { label: string; icon?: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[#f7f7f7]"
      style={{ color: disabled ? '#c1c1c1' : '#222', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {icon}<span className="flex-1">{label}</span>{disabled && <span className="text-[10px]" style={{ color: '#c1c1c1' }}>Soon</span>}
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
