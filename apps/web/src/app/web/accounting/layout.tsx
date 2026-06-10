import { AcctOsProvider } from './_context';
import { AcctTopBar } from './_TopBar';
import { AcctLeftNav } from './_LeftNav';

export default function Accounting2Layout({ children }: { children: React.ReactNode }) {
  return (
    <AcctOsProvider>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
        <AcctTopBar />
        <div className="flex flex-1 overflow-hidden">
          <AcctLeftNav />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AcctOsProvider>
  );
}
