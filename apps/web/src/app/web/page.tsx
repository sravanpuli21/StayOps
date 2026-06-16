import Link from 'next/link';
import { Monitor } from 'lucide-react';
import { PERSONAS } from '@hos/shared';

export default function PersonaPickerPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#f7f7f7' }}>
      {/* Top bar */}
      <div className="bg-white border-b flex-shrink-0" style={{ borderColor: '#dddddd' }}>
        <div className="max-w-7xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff385c' }} />
            <span className="font-bold text-base" style={{ color: '#222222' }}>HOS Management</span>
          </div>
          <Link href="/" className="text-xs font-medium" style={{ color: '#6a6a6a' }}>
            ← Back
          </Link>
        </div>
      </div>

      {/* Content — fills remaining height, no scroll */}
      <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
            Select your persona
          </h1>
          <p className="text-xs" style={{ color: '#6a6a6a' }}>
            Web interface — choose a role to preview their dashboard
          </p>
        </div>

        {/* Feature access — two standalone entries, side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
          <Link href="/web/accounting/dashboard"
            className="group flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
            style={{ background: 'linear-gradient(90deg,#0F172A,#3b2f6b)', border: '1px solid #0F172A' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">StayOps Accounting OS</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Hotel-by-hotel bookkeeping · 16 entities →
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#6a4ec0', color: '#fff' }}>New</span>
          </Link>

          <Link href="/web/front-desk/BTRCI/home"
            className="group flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md bg-white"
            style={{ border: '1px solid #dddddd' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff0f3' }}>
              <Monitor className="w-5 h-5" style={{ color: '#ff385c' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: '#222222' }}>Front Desk Access</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#6a6a6a' }}>
                Shared lobby computer · work orders, punch →
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: '#ff385c' }}>Live</span>
          </Link>
        </div>

        {/* Persona grid — rows stretch to fill remaining height so all cards fit */}
        <div className="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 auto-rows-fr">
          {PERSONAS.map((persona) => {
            const isHighlight = persona.id === 'kris';
            const isBuilt = persona.id === 'kris' || persona.id === 'harshal' || persona.id === 'rishab' || persona.id === 'sravan' || persona.id === 'emma' || persona.id === 'sydney' || persona.id === 'sanjay' || persona.id === 'kwanisha';

            return (
              <Link
                key={persona.id}
                href={persona.route}
                className="group bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2
                           transition-all duration-200 relative overflow-hidden"
                style={{
                  border: isHighlight ? '2px solid #ff385c' : '1px solid #dddddd',
                  boxShadow: isHighlight ? '0 4px 16px rgba(255,56,92,0.12)' : 'none',
                  opacity: isBuilt ? 1 : 0.6,
                  pointerEvents: isBuilt ? 'auto' : 'none',
                }}
              >
                {/* Avatar */}
                {persona.avatarUrl ? (
                  <img
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base"
                    style={{ background: persona.avatarColor }}
                  >
                    {persona.initials}
                  </div>
                )}

                {/* Info */}
                <div className="text-center">
                  <p className="font-bold text-base leading-tight" style={{ color: '#222222' }}>
                    {persona.name}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#6a6a6a' }}>
                    {persona.title}
                  </p>
                </div>

                {/* "Live" / "Soon" pill */}
                {isBuilt ? (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#ff385c' }}
                  >
                    Live
                  </span>
                ) : (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: '#f7f7f7', color: '#929292', border: '1px solid #dddddd' }}
                  >
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
