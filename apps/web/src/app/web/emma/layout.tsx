import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { EMMA_NAV_ITEMS } from '@/lib/constants';

export default function EmmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      <LeftNav
        navItems={EMMA_NAV_ITEMS}
        footerName="Emma Johnson"
        footerTitle="HK Supervisor · Home2 Baton Rouge"
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar initials="EJ" firstName="Emma" accentColor="#428bff" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
