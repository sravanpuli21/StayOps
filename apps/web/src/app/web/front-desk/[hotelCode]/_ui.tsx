'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Front Desk Access shared bits — large, simple, high-contrast for a kiosk. */

export const fdCard: React.CSSProperties = { background: '#fff', border: '1px solid #dddddd', borderRadius: 16 };
export const ACCENT = '#ff385c';

export function Badge({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: fg, background: bg }}>{label}</span>;
}

export function BackTo({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> {label}</Link>;
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>{title}</h1>{subtitle && <p className="text-sm mt-1" style={{ color: '#929292' }}>{subtitle}</p>}</div>;
}

/** Big tap target used across the WO/SR step flows. */
export function BigChoice({ label, sub, onClick, href, accent = ACCENT }: { label: string; sub?: string; onClick?: () => void; href?: string; accent?: string }) {
  const body = (
    <>
      <span className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: accent }} />
      <span className="flex-1 text-left"><span className="block text-base font-bold" style={{ color: '#222' }}>{label}</span>{sub && <span className="block text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{sub}</span>}</span>
    </>
  );
  const cls = 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5';
  if (href) return <Link href={href} className={cls} style={fdCard}>{body}</Link>;
  return <button onClick={onClick} className={cls} style={fdCard}>{body}</button>;
}

/** Quantity stepper with big +/- buttons. */
export function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
      <button onClick={() => onChange(Math.max(1, value - 1))} className="w-10 h-10 text-lg font-bold flex items-center justify-center" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>−</button>
      <span className="w-12 text-center text-base font-bold" style={{ color: '#222' }}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 text-lg font-bold flex items-center justify-center" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>+</button>
    </div>
  );
}

export const fdInput = 'h-11 px-3 rounded-xl text-base outline-none w-full';
export const fdInputStyle: React.CSSProperties = { border: '1px solid #dddddd', background: '#fff', color: '#222' };

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold" style={{ color: '#222' }}>{label}{required && <span style={{ color: ACCENT }}> *</span>}</label>{children}</div>;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
