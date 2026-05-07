import { RED_FLAGS, AI_ANOMALIES } from '@hos/shared';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';

const HOTEL_ID = 'BTRCI';

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
        {children}
      </h2>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{subtitle}</p>}
    </div>
  );
}

export default function AlertsPage() {
  const flags = RED_FLAGS.filter((f) => f.hotelId === HOTEL_ID);
  const anomalies = AI_ANOMALIES.filter((a) => a.hotelId === HOTEL_ID);

  const critical = flags.filter((f) => f.severity === 'critical').length;
  const warning = flags.filter((f) => f.severity === 'warning').length;
  const info = flags.filter((f) => f.severity === 'info').length;

  const byModule = flags.reduce((acc, f) => {
    (acc[f.module] ??= []).push(f);
    return acc;
  }, {} as Record<string, typeof flags>);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Alerts</h1>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>Home2 Baton Rouge</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Red flags and AI findings for your property
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', value: critical, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Warning', value: warning, color: '#d97706', bg: '#fffbeb' },
          { label: 'Info', value: info, color: '#2563eb', bg: '#eff6ff' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: s.bg, border: '1px solid ' + s.color + '40' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
            <span className="text-3xl" style={{ color: s.color }}>
              {s.label === 'Critical' ? '●' : s.label === 'Warning' ? '▲' : 'ⓘ'}
            </span>
          </div>
        ))}
      </div>

      {anomalies.length > 0 && (
        <div>
          <SectionTitle subtitle="Live patterns surfaced by AI for this property">
            AI Findings
          </SectionTitle>
          <AIFlagsPanel findings={anomalies} title={`${anomalies.length} finding${anomalies.length === 1 ? '' : 's'}`} />
        </div>
      )}

      {Object.entries(byModule).map(([module, mflags]) => (
        <div key={module}>
          <SectionTitle subtitle={`${mflags.length} flag${mflags.length === 1 ? '' : 's'}`}>
            {module.charAt(0).toUpperCase() + module.slice(1)}
          </SectionTitle>
          <RedFlagsPanel flags={mflags} title="" />
        </div>
      ))}

      {flags.length === 0 && anomalies.length === 0 && (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ border: '1px solid #dddddd' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: '#15803d' }}>All clear</p>
          <p className="text-sm" style={{ color: '#929292' }}>
            No active red flags for your property right now.
          </p>
        </div>
      )}
    </div>
  );
}
