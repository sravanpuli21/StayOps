import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { KWANISHA_NAV_ITEMS } from '@/lib/constants';
import { HotelFilterProvider } from '@/lib/hotel-filter-context';
import { DateFilterProvider } from '@/lib/date-filter-context';

export default function KwanishaLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotelFilterProvider initial={{ kind: 'all' }}>
      <DateFilterProvider initial="ytd">
        <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
          <LeftNav
            navItems={KWANISHA_NAV_ITEMS}
            footerName="Kwanisha Brown"
            footerTitle="Director of Sales"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar initials="KB" firstName="Kwanisha" accentColor="#7c3aed" />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </DateFilterProvider>
    </HotelFilterProvider>
  );
}
