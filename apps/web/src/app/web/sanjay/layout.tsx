import { LeftNav } from '@/components/shell/LeftNav';
import { TopBar } from '@/components/shell/TopBar';
import { SANJAY_NAV_ITEMS } from '@/lib/constants';
import { AccountingScopeProvider } from '@/lib/accounting-scope-context';
import { AccountingDemoProvider } from '@/lib/accounting-demo-context';
import { AccountingScopeBar } from '@/components/accounting/AccountingScopeBar';

export default function SanjayLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountingScopeProvider>
      <AccountingDemoProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
          <LeftNav
            navItems={SANJAY_NAV_ITEMS}
            footerName="Sanjay Narsee"
            footerTitle="Corporate Accounting"
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar initials="SN" firstName="Sanjay" accentColor="#6a6a6a" hideFilters />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Single entity + statement period — scopes every accounting page */}
              <AccountingScopeBar />
              {children}
            </main>
          </div>
        </div>
      </AccountingDemoProvider>
    </AccountingScopeProvider>
  );
}
