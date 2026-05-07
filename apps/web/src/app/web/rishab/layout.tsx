import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { RISHAB_NAV_ITEMS } from '@/lib/constants';
import { DateFilterProvider } from '@/lib/date-filter-context';

export default function RishabLayout({ children }: { children: React.ReactNode }) {
  return (
    <DateFilterProvider initial="yesterday">
      <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
        <LeftNav
          navItems={RISHAB_NAV_ITEMS}
          footerName="Rishab Patel"
          footerTitle="GM · Home2 Baton Rouge"
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar initials="RP" firstName="Rishab" accentColor="#1e40af" />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DateFilterProvider>
  );
}
