import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export default function MobilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: '#f7f7f7' }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
             style={{ background: '#dddddd' }}>
          <Smartphone className="w-8 h-8" style={{ color: '#6a6a6a' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#222222' }}>Mobile App</h1>
        <p className="mb-6" style={{ color: '#6a6a6a' }}>
          The Expo + React Native mobile app is in development. Check back soon.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-semibold underline"
          style={{ color: '#ff385c' }}
        >
          ← Back to entry
        </Link>
      </div>
    </div>
  );
}
