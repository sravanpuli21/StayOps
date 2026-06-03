'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, Building2, Briefcase, Check, Lock, Users } from 'lucide-react';
import {
  HOS_COMPANY, HOS_PROPERTIES, companyUsers,
  CYCLES, computePricing, computePayroll, HOTEL_MONTHLY, CORPORATE_MONTHLY,
  PAYROLL_PER_PERSON_MONTHLY,
  type BillingCycle,
} from '@hos/shared';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminAccess } from '@/lib/admin-access-context';

function money(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function PaymentsPage() {
  const { acting } = useAdminAccess();
  const canManage = acting.role === 'super_admin' || acting.role === 'company_admin';

  // Defaults from the live portfolio.
  const defaultHotels = HOS_PROPERTIES.length;
  const defaultCorp = useMemo(
    () => companyUsers().filter((u) => u.role !== 'super_admin').length,
    [],
  );

  const [hotels, setHotels] = useState(defaultHotels);
  const [corp, setCorp] = useState(defaultCorp);
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [payrollPeople, setPayrollPeople] = useState(0);

  const result = useMemo(() => computePricing({ hotels, corporateUsers: corp, cycle }), [hotels, corp, cycle]);
  const payroll = useMemo(() => computePayroll(payrollPeople, cycle), [payrollPeople, cycle]);

  if (!canManage) {
    return (
      <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <AdminHeader title="Payments" subtitle={`${HOS_COMPANY.name} · subscription & billing`} />
          <div className="rounded-2xl p-8 flex items-start gap-3" style={{ background: '#fff', border: '1px solid #fca5a5' }}>
            <Lock className="w-5 h-5 mt-0.5" style={{ color: '#b91c1c' }} />
            <p className="text-sm" style={{ color: '#3f3f3f' }}>
              Billing is managed by Super Admin / Company Admin only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <AdminHeader title="Payments" subtitle={`${HOS_COMPANY.name} · subscription & billing estimate`} />

        {/* Rate cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RateCard icon={Building2} label="Per hotel" rate={HOTEL_MONTHLY} />
          <RateCard icon={Briefcase} label="Per corporate-office user" rate={CORPORATE_MONTHLY} />
        </div>

        {/* Counters */}
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Counter
            label="Hotels"
            sublabel={`${money(HOTEL_MONTHLY)}/mo each`}
            value={hotels}
            onChange={setHotels}
            min={0}
          />
          <Counter
            label="Corporate-office users"
            sublabel={`${money(CORPORATE_MONTHLY)}/mo each`}
            value={corp}
            onChange={setCorp}
            min={0}
          />
        </div>

        {/* Cycle selector */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Billing cycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CYCLES.map((c) => {
              const sel = cycle === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCycle(c.key)}
                  className="rounded-2xl p-4 text-left transition-all"
                  style={{ background: '#fff', border: `1.5px solid ${sel ? '#ff385c' : '#dddddd'}`, boxShadow: sel ? '0 0 0 3px rgba(255,56,92,0.12)' : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold" style={{ color: '#222' }}>{c.label}</p>
                    {sel && <Check className="w-4 h-4" style={{ color: '#ff385c' }} />}
                  </div>
                  {c.freeMonths > 0 ? (
                    <p className="text-xs font-semibold mt-1" style={{ color: '#15803d' }}>{c.freeMonths} months free</p>
                  ) : (
                    <p className="text-xs mt-1" style={{ color: '#929292' }}>No free months</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: '#929292' }}>{c.blurb}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Estimate · {result.cycle.label}</h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            <Row k={`${hotels} hotel${hotels === 1 ? '' : 's'} × ${money(HOTEL_MONTHLY)}/mo`} v={`${money(result.hotelsMonthly)}/mo`} />
            <Row k={`${corp} corporate user${corp === 1 ? '' : 's'} × ${money(CORPORATE_MONTHLY)}/mo`} v={`${money(result.corporateMonthly)}/mo`} />
            <div style={{ borderTop: '1px solid #f0f0f0' }} />
            <Row k="Monthly rate (full price)" v={`${money(result.monthlyRate)}/mo`} bold />
            <Row k="Term" v={`${result.termMonths} month${result.termMonths === 1 ? '' : 's'}`} />
            <Row k="Months billed" v={`${result.billedMonths}`} />
            {result.freeMonths > 0 && (
              <Row k="Free months" v={`${result.freeMonths}`} green />
            )}
            {result.savings > 0 && (
              <Row k="You save" v={money(result.savings)} green />
            )}
            <div style={{ borderTop: '1px solid #f0f0f0' }} />
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: '#222' }}>
                  {result.cycle.key === 'monthly' ? 'Billed monthly' : `Total due now (${result.cycle.label})`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                  Effective {money(result.effectiveMonthly)}/mo over the term
                </p>
              </div>
              <p className="text-3xl font-black" style={{ color: '#222' }}>
                {money(result.cycle.key === 'monthly' ? result.monthlyRate : result.termTotal)}
                {result.cycle.key === 'monthly' && <span className="text-base font-semibold" style={{ color: '#929292' }}>/mo</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Payroll add-on — coming soon */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px dashed #dddddd' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: '#6a6a6a' }} />
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Payroll add-on</h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0', color: '#929292' }}>
              <Lock className="w-3 h-3" /> Coming soon
            </span>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-sm" style={{ color: '#3f3f3f' }}>
              Run payroll through StayOps for <strong>{money(PAYROLL_PER_PERSON_MONTHLY)}/person/month</strong>.
              On the yearly cycle: <strong>11 months billed, 1 month free</strong>.
            </p>
            <Counter
              label="People on payroll"
              sublabel={`${money(PAYROLL_PER_PERSON_MONTHLY)}/person/mo`}
              value={payrollPeople}
              onChange={setPayrollPeople}
              min={0}
            />
            {payrollPeople > 0 && (
              <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <Row k={`${payrollPeople} people × ${money(PAYROLL_PER_PERSON_MONTHLY)}/mo`} v={`${money(payroll.monthlyRate)}/mo`} />
                <Row k={`Months billed (${result.cycle.label})`} v={`${payroll.billedMonths} of ${payroll.termMonths}`} />
                {payroll.freeMonths > 0 && <Row k="Free months" v={`${payroll.freeMonths}`} green />}
                {payroll.savings > 0 && <Row k="You save" v={money(payroll.savings)} green />}
                <div style={{ borderTop: '1px solid #f0f0f0' }} />
                <Row
                  k={cycle === 'monthly' ? 'Payroll billed monthly' : `Payroll total (${result.cycle.label})`}
                  v={cycle === 'monthly' ? `${money(payroll.monthlyRate)}/mo` : money(payroll.termTotal)}
                  bold
                />
              </div>
            )}
            <p className="text-[11px]" style={{ color: '#929292' }}>
              Payroll isn’t active yet — this is a preview of the add-on cost. It is shown separately from the subscription total above.
            </p>
          </div>
        </div>

        <p className="text-xs" style={{ color: '#929292' }}>
          Estimate only — collecting payment, invoices, and plan changes are handled by the billing system (not yet wired). Add or remove hotels/users above to model the cost.
        </p>
      </div>
    </div>
  );
}

function RateCard({ icon: Icon, label, rate }: { icon: typeof Building2; label: string; rate: number }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff1f3' }}>
        <Icon className="w-5 h-5" style={{ color: '#ff385c' }} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#929292' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: '#222' }}>{money(rate)}<span className="text-sm font-semibold" style={{ color: '#929292' }}>/mo</span></p>
      </div>
    </div>
  );
}

function Counter({ label, sublabel, value, onChange, min = 0 }: { label: string; sublabel: string; value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold" style={{ color: '#222' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{sublabel}</p>
      </div>
      <div className="inline-flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <Minus className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-16 h-9 text-center text-lg font-bold rounded-lg outline-none"
          style={{ border: '1px solid #dddddd', color: '#222' }}
        />
        <button onClick={() => onChange(value + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}>
          <Plus className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        </button>
      </div>
    </div>
  );
}

function Row({ k, v, bold, green }: { k: string; v: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <p className="text-sm" style={{ color: green ? '#15803d' : '#6a6a6a', fontWeight: bold ? 700 : 400 }}>{k}</p>
      <p className="text-sm tabular-nums" style={{ color: green ? '#15803d' : '#222', fontWeight: bold || green ? 700 : 500 }}>{v}</p>
    </div>
  );
}
