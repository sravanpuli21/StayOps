import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { HotelFilterProvider } from '@/lib/hotel-filter-context';
import { DateFilterProvider } from '@/lib/date-filter-context';

export default function KrisLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotelFilterProvider initial={{ kind: 'all' }}>
      <DateFilterProvider initial="yesterday">
        <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
          <LeftNav />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </DateFilterProvider>
    </HotelFilterProvider>
  );
}
