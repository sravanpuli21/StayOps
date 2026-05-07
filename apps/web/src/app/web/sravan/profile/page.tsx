import { Mail, Phone, Badge, Building2, Calendar, DollarSign, User } from 'lucide-react';
import { SRAVAN_EMPLOYEE, formatCurrency } from '@hos/shared';

export default function SravanProfilePage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Your employee details · contact HR to update pay rate or direct deposit
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl p-6 flex items-center gap-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
          style={{ background: '#0f766e' }}
        >
          SP
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#222222' }}>{SRAVAN_EMPLOYEE.name}</h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>{SRAVAN_EMPLOYEE.role} · {SRAVAN_EMPLOYEE.hotel}</p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>Employee ID · {SRAVAN_EMPLOYEE.employeeId}</p>
        </div>
      </div>

      {/* Contact */}
      <Section title="Contact">
        <Row icon={Mail}  label="Email" value={SRAVAN_EMPLOYEE.email} />
        <Row icon={Phone} label="Phone" value={SRAVAN_EMPLOYEE.phone} />
      </Section>

      {/* Employment */}
      <Section title="Employment">
        <Row icon={Building2} label="Property"    value={`${SRAVAN_EMPLOYEE.hotel} (${SRAVAN_EMPLOYEE.hotelCode})`} />
        <Row icon={User}      label="Supervisor"  value={SRAVAN_EMPLOYEE.supervisor} />
        <Row icon={Calendar}  label="Hired"       value={SRAVAN_EMPLOYEE.hireDate} />
        <Row icon={Badge}     label="Employee ID" value={SRAVAN_EMPLOYEE.employeeId} />
      </Section>

      {/* Pay */}
      <Section title="Pay">
        <Row icon={DollarSign} label="Pay Rate"     value={`${formatCurrency(SRAVAN_EMPLOYEE.payRate)} / hr`} />
        <Row icon={Calendar}   label="Pay Period"   value={SRAVAN_EMPLOYEE.payPeriod} />
        <Row icon={Calendar}   label="Next Pay Day" value={SRAVAN_EMPLOYEE.nextPayDate} />
      </Section>

      <p className="text-xs" style={{ color: '#929292' }}>
        To update your address, W-4, direct deposit, or emergency contact, visit the HR portal or reach out to HR at hr@hosmanagement.co.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h3>
      </div>
      <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center px-5 py-3 gap-4">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#929292' }} />
      <p className="text-xs font-medium w-28 flex-shrink-0" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-sm flex-1" style={{ color: '#222222' }}>{value}</p>
    </div>
  );
}
