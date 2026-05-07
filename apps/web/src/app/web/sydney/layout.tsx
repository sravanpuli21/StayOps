import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { SYDNEY_NAV_ITEMS } from '@/lib/constants';

export default function SydneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      <LeftNav
        navItems={SYDNEY_NAV_ITEMS}
        footerName="Sydney Rivera"
        footerTitle="Maint Supervisor · Home2 Baton Rouge"
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar initials="SR" firstName="Sydney" accentColor="#7c3aed" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
