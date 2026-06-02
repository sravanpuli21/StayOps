import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { SANJAY_NAV_ITEMS } from '@/lib/constants';
import { HotelFilterProvider } from '@/lib/hotel-filter-context';
import { DateFilterProvider } from '@/lib/date-filter-context';
import { AccountingDemoProvider } from '@/lib/accounting-demo-context';

export default function SanjayLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotelFilterProvider initial={{ kind: 'all' }}>
      <DateFilterProvider initial="ytd">
        <AccountingDemoProvider>
          <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
            <LeftNav
              navItems={SANJAY_NAV_ITEMS}
              footerName="Sanjay Narsee"
              footerTitle="Corporate Accounting"
            />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar initials="SN" firstName="Sanjay" accentColor="#6a6a6a" />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </AccountingDemoProvider>
      </DateFilterProvider>
    </HotelFilterProvider>
  );
}
