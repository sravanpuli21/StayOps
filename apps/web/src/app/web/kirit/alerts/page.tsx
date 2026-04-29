import Link from 'next/link';
import { Construction } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
           style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
        <Construction className="w-8 h-8" style={{ color: '#c1c1c1' }} />
      </div>
      <h1 className="text-xl font-bold mb-1" style={{ color: '#222222' }}>ualerts</h1>
      <p className="text-sm mb-6" style={{ color: '#6a6a6a' }}>This module is coming in the next phase.</p>
      <Link href="/web/kirit/dashboard" className="text-sm font-semibold underline" style={{ color: '#ff385c' }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}
