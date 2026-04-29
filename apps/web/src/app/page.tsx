import Link from 'next/link';
import { Monitor, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EntryPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff385c' }} />
          <span className="text-white font-bold text-2xl tracking-tight">HOS Management</span>
        </div>
        <p className="text-sm font-medium" style={{ color: '#929292' }}>
          Select your platform to continue
        </p>
      </div>

      {/* Platform Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
        {/* Web */}
        <Link
          href="/web"
          className="group flex-1 rounded-2xl p-8 flex flex-col items-center gap-4
                     transition-all duration-200 hover:shadow-[0_10px_25px_rgba(255,56,92,0.15)]
                     hover:border-[#ff385c]"
          style={{
            background: '#ffffff',
            border: '1px solid #dddddd',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#f7f7f7' }}
          >
            <Monitor className="w-7 h-7" style={{ color: '#6a6a6a' }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg" style={{ color: '#222222' }}>
              Web Dashboard
            </p>
            <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>
              Full management interface
            </p>
          </div>
          <div className="mt-auto">
            <span
              className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{ background: '#ff385c' }}
            >
              Enter →
            </span>
          </div>
        </Link>

        {/* Mobile — placeholder */}
        <div
          className="flex-1 rounded-2xl p-8 flex flex-col items-center gap-4 opacity-50 cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <Smartphone className="w-7 h-7" style={{ color: '#c1c1c1' }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg text-white">Mobile App</p>
            <p className="text-sm mt-1" style={{ color: '#929292' }}>
              Expo + React Native
            </p>
          </div>
          <div className="mt-auto">
            <Badge
              variant="outline"
              className="text-xs"
              style={{ color: '#929292', borderColor: 'rgba(146,146,146,0.4)' }}
            >
              Preview Only
            </Badge>
          </div>
        </div>
      </div>

      <p className="mt-10 text-xs" style={{ color: 'rgba(146,146,146,0.5)' }}>
        HOS Management • 16 Properties • Confidential
      </p>
    </div>
  );
}
