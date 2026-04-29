import { LeadersClient } from '@/components/leaders/LeadersClient';

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Leadership</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>GM & Regional performance · current pay cycle</p>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <LeadersClient />
      </div>
    </div>
  );
}
