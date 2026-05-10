'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Mail } from 'lucide-react';

const ROLES = [
  'Owner',
  'General Manager',
  'Regional Manager',
  'Housekeeping Leader',
  'Maintenance Leader',
  'Front Desk Leader',
  'Other',
] as const;
type Role = typeof ROLES[number];

const CHALLENGES = [
  'Out-of-order rooms',
  'Maintenance delays',
  'Missed audits',
  'Inventory loss',
  'Labour visibility',
  'Poor handovers',
  'Owner reporting',
  'Everything is scattered',
  'Other',
] as const;
type Challenge = typeof CHALLENGES[number];

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: Role;
  properties: string;
  brands: string;
  challenge: Challenge;
  preferredTime: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  role: 'Owner',
  properties: '',
  brands: '',
  challenge: 'Everything is scattered',
  preferredTime: '',
};

export default function BookDemoPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const canSubmit =
    form.name.trim() && form.email.trim() && form.company.trim();

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-10 sm:pb-14 text-center">
        <span className="stayops-pill">Book a demo</span>
        <h1
          className="display mx-auto mt-6"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
            maxWidth: '20ch',
            lineHeight: 1.02,
          }}
        >
          See StayOps in action.
        </h1>
        <p
          className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
          style={{ color: 'var(--so-ink-muted)', maxWidth: '56ch', lineHeight: 1.55 }}
        >
          Book a demo to see how StayOps helps hotel ownership groups manage rooms,
          maintenance, audits, labour, inventory, and operational visibility in one control
          room.
        </p>
      </section>

      {/* Form + aside */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            {submitted ? (
              <ThankYouPanel name={form.name} />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl p-6 sm:p-8 space-y-5"
                style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Name" required>
                    <Input
                      type="text" autoComplete="name" required
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                    />
                  </Field>
                  <Field label="Work email" required>
                    <Input
                      type="email" autoComplete="email" required
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Phone number">
                    <Input
                      type="tel" autoComplete="tel"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                    />
                  </Field>
                  <Field label="Company / ownership group" required>
                    <Input
                      type="text" autoComplete="organization" required
                      value={form.company}
                      onChange={(v) => setForm({ ...form, company: v })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Role">
                    <Select
                      value={form.role}
                      options={[...ROLES]}
                      onChange={(v) => setForm({ ...form, role: v as Role })}
                    />
                  </Field>
                  <Field label="Number of properties">
                    <Input
                      type="text" placeholder="e.g. 1, 4, 16, 30+"
                      value={form.properties}
                      onChange={(v) => setForm({ ...form, properties: v })}
                    />
                  </Field>
                </div>

                <Field label="Hotel brands / property types">
                  <Input
                    type="text" placeholder="Hilton, Marriott, independent, etc."
                    value={form.brands}
                    onChange={(v) => setForm({ ...form, brands: v })}
                  />
                </Field>

                <Field label="Current biggest operational challenge">
                  <Select
                    value={form.challenge}
                    options={[...CHALLENGES]}
                    onChange={(v) => setForm({ ...form, challenge: v as Challenge })}
                  />
                </Field>

                <Field label="Preferred demo time (optional)">
                  <Input
                    type="text" placeholder="Weekday mornings PT, next Tuesday afternoon, etc."
                    value={form.preferredTime}
                    onChange={(v) => setForm({ ...form, preferredTime: v })}
                  />
                </Field>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-xs" style={{ color: 'var(--so-ink-dim)' }}>
                    We&apos;ll reach out within 1 business day.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="stayops-cta"
                    style={{ opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                  >
                    Book My Demo
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Aside */}
          <aside className="lg:col-span-5 space-y-4">
            <div
              className="rounded-3xl p-6 sm:p-7"
              style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                 style={{ color: 'var(--so-ink-dim)' }}>
                In the demo, we will walk through:
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  'How rooms move from dirty to ready',
                  'How maintenance issues are reported and resolved',
                  'How audits are scheduled and recorded',
                  'How inventory and assets are tracked',
                  'How owners see property-level visibility',
                  'How operational memory builds over time',
                  'How StayOps can fit with your current workflow',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm sm:text-base"
                      style={{ color: 'var(--so-ink-2)', lineHeight: 1.55 }}>
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--so-ink)' }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-3xl p-6 flex items-center gap-4"
              style={{ background: 'var(--so-ink)', color: '#fff' }}
            >
              <span
                className="inline-flex w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Prefer email?
                </p>
                <a href="mailto:hello@stayops.com" className="mt-1 block text-base font-semibold hover:underline">
                  hello@stayops.com
                </a>
              </div>
            </div>

            <p className="text-sm px-2" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
              No pressure. No complicated setup conversation. Just a practical walkthrough
              of how StayOps can help your hotel operations become clearer.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
        style={{ color: 'var(--so-ink-dim)' }}
      >
        {label}{required && <span style={{ color: 'var(--so-ink)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function Input(props: {
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const { onChange, ...rest } = props;
  return (
    <input
      {...rest}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
      style={{
        border: '1px solid var(--so-border)',
        background: 'var(--so-canvas)',
        color: 'var(--so-ink)',
      }}
    />
  );
}

function Select({
  value, options, onChange,
}: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
      style={{
        border: '1px solid var(--so-border)',
        background: 'var(--so-canvas)',
        color: 'var(--so-ink)',
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ThankYouPanel({ name }: { name: string }) {
  return (
    <div
      className="rounded-3xl p-8 sm:p-10 text-center"
      style={{ background: 'var(--so-ink)', color: '#fff' }}
    >
      <span
        className="inline-flex w-14 h-14 rounded-full items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <Check className="w-7 h-7" />
      </span>
      <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ letterSpacing: '-0.02em' }}>
        Thanks{name ? `, ${name.split(' ')[0]}` : ''}. We&apos;ll be in touch.
      </h3>
      <p className="mt-3 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
        We&apos;ll reach out within 1 business day to schedule your demo. Watch
        <span style={{ color: '#fff' }}> hello@stayops.com </span>
        for our reply.
      </p>
      <div className="mt-6">
        <Link href="/website" className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: 'rgba(255,255,255,0.85)' }}>
          Back to home <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
