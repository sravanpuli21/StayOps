'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarClock, Lock, AlertTriangle, Unlock, ArrowLeftRight } from 'lucide-react';
import { HOTELS, periodsForHotel, type ClosePeriod } from '@hos/shared';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAccountingScope } from '@/lib/accounting-scope-context';

const STATUS_META: Record<ClosePeriod['status'], { label: string; fg: string; bg: string; icon: React.ReactNode }> = {
  open:                    { label: 'Open',       fg: '#1d4ed8', bg: '#dbeafe', icon: <Unlock className="w-3 h-3" /> },
  'ready-to-close':        { label: 'Ready',      fg: '#b45309', bg: '#fef3c7', icon: <CalendarClock className="w-3 h-3" /> },
  closed:                  { label: 'Closed',     fg: '#15803d', bg: '#dcfce7', icon: <Lock className="w-3 h-3" /> },
  reopened:                { label: 'Reopened',   fg: '#b45309', bg: '#fef3c7', icon: <Unlock className="w-3 h-3" /> },
  'closed-with-exceptions':{ label: 'Exceptions', fg: '#b91c1c', bg: '#fee2e2', icon: <AlertTriangle className="w-3 h-3" /> },
};

/**
 * The accounting scope bar — sits at the top of every accounting page.
 * Pick ONE hotel (entity) and ONE statement period (by closing date). Everything
 * below is that hotel's books for that period only.
 */
export function AccountingScopeBar() {
  const pathname = usePathname();
  const { hotelId, periodEndIso, setPeriod } = useAccountingScope();
  const hotel = HOTELS.find((h) => h.id === hotelId);

  // The entity picker IS the hotel chooser — no scope bar there.
  if (pathname?.endsWith('/accounting/entities')) return null;
  const periods = periodsForHotel(hotelId);
  const current = periods.find((p) => p.periodEndIso === periodEndIso) ?? periods[0];
  const status = current ? STATUS_META[current.status] : null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      {/* Hotel (entity) — fixed label, not a switcher */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        <span className="text-sm font-semibold" style={{ color: '#222' }}>{hotel?.shortName ?? 'Hotel'}</span>
      </div>

      <div className="w-px h-6" style={{ background: '#eee' }} />

      {/* Statement period (closing date) */}
      <div className="flex items-center gap-2">
        <CalendarClock className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        <Select value={periodEndIso} onValueChange={(v) => v && setPeriod(v)}>
          <SelectTrigger className="w-44 h-9 text-sm" style={{ borderColor: '#dddddd' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.periodEndIso} value={p.periodEndIso}>
                {p.label} · close {p.periodEndIso.slice(5)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period status pill */}
      {status && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" style={{ color: status.fg, background: status.bg }}>
          {status.icon} {status.label}
        </span>
      )}

      <Link href="/web/sanjay/accounting/entities"
        className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold transition-colors"
        style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>
        <ArrowLeftRight className="w-3.5 h-3.5" /> Switch hotel
      </Link>
    </div>
  );
}
