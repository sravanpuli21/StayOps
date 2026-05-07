import { LeftNav } from '@/components/shell/LeftNav';
import { StaffTopBar } from '@/components/shell/StaffTopBar';
import { SRAVAN_NAV_ITEMS } from '@/lib/constants';

export default function SravanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      <LeftNav
        navItems={SRAVAN_NAV_ITEMS}
        footerName="Sravan Puli"
        footerTitle="Front Desk · Home2 Baton Rouge"
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <StaffTopBar firstName="Sravan" initials="SP" title="Front Desk Agent" accentColor="#0f766e" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
