import Link from 'next/link';
import { PERSONAS } from '@hos/shared';

const scopeLabel: Record<string, string> = {
  portfolio: 'All 16 Hotels',
  regional: '8 Hotels',
  property: 'Single Property',
};

export default function PersonaPickerPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f7f7f7' }}>
      {/* Top bar */}
      <div className="bg-white border-b" style={{ borderColor: '#dddddd' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff385c' }} />
            <span className="font-bold text-base" style={{ color: '#222222' }}>HOS Management</span>
          </div>
          <Link href="/" className="text-xs font-medium" style={{ color: '#6a6a6a' }}>
            ← Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#222222' }}>
            Select your persona
          </h1>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            Web interface — choose a role to preview their dashboard
          </p>
        </div>

        {/* StayOps Accounting OS — standalone product */}
        <Link href="/web/accounting/dashboard"
          className="group flex items-center gap-4 mb-6 rounded-2xl p-5 transition-all hover:shadow-md"
          style={{ background: 'linear-gradient(90deg,#0F172A,#3b2f6b)', border: '1px solid #0F172A' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">StayOps Accounting OS</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Hotel-by-hotel bookkeeping for HOS Management · 16 entities · open Sanjay&apos;s books →
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#6a4ec0', color: '#fff' }}>New</span>
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PERSONAS.map((persona) => {
            const isHighlight = persona.id === 'kris';
            const isBuilt = persona.id === 'kris' || persona.id === 'harshal' || persona.id === 'rishab' || persona.id === 'sravan' || persona.id === 'emma' || persona.id === 'sydney' || persona.id === 'sanjay' || persona.id === 'kwanisha';

            return (
              <Link
                key={persona.id}
                href={persona.route}
                className="group bg-white rounded-2xl p-6 flex flex-col items-center gap-3
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
                    className="w-14 h-14 rounded-full object-cover"
                    style={{ border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: persona.avatarColor }}
                  >
                    {persona.initials}
                  </div>
                )}

                {/* Info */}
                <div className="text-center">
                  <p className="font-semibold text-sm leading-tight" style={{ color: '#222222' }}>
                    {persona.name}
                  </p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ color: '#6a6a6a' }}>
                    {persona.title}
                  </p>
                </div>

                {/* Scope badge */}
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: '#f7f7f7',
                    color: '#6a6a6a',
                    border: '1px solid #dddddd',
                  }}
                >
                  {scopeLabel[persona.scope]}
                </span>

                {/* "Live" pill for built personas */}
                {isBuilt && (
                  <span
                    className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: '#ff385c' }}
                  >
                    Live
                  </span>
                )}

                {/* Coming soon label for others */}
                {!isBuilt && (
                  <span
                    className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
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
