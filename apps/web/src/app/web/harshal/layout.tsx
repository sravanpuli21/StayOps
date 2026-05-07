import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { HARSHAL_NAV_ITEMS } from '@/lib/constants';
import { HotelFilterProvider } from '@/lib/hotel-filter-context';
import { DateFilterProvider } from '@/lib/date-filter-context';

export default function HarshalLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotelFilterProvider initial={{ kind: 'my-territory' }} viewerRegionalId="harshal">
      <DateFilterProvider initial="yesterday">
        <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
          <LeftNav
            navItems={HARSHAL_NAV_ITEMS}
            footerName="Harshal Patel"
            footerTitle="Regional Director of Operations"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar initials="HP" firstName="Harshal" accentColor="#222222" avatarUrl="/avatars/harshal.jpeg" />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </DateFilterProvider>
    </HotelFilterProvider>
  );
}
