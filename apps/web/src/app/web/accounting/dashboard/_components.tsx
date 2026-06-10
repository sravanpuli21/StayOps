'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, AlertCircle, Info, ArrowRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { card, money, PURPLE } from '../_ui';
import type { DashAlert, Priority, PipelineStage } from './_data';

/* ── Summary card (clickable KPI) ─────────────────────────────────────── */
export type CardTone = 'good' | 'warning' | 'critical' | 'neutral' | 'brand';
const TONE: Record<CardTone, { fg: string; bg: string; ring: string }> = {
  good: { fg: '#15803d', bg: '#dcfce7', ring: '#bbf7d0' },
  warning: { fg: '#b45309', bg: '#fef3c7', ring: '#fde68a' },
  critical: { fg: '#b91c1c', bg: '#fee2e2', ring: '#fecaca' },
  neutral: { fg: '#3f3f3f', bg: '#f0f0f0', ring: '#e5e5e5' },
  brand: { fg: PURPLE, bg: '#ece4fb', ring: '#e3d9fb' },
};

export function SummaryCard({ icon, value, label, subtext, tone = 'neutral', href, onClick }: {
  icon: ReactNode; value: string; label: string; subtext?: string; tone?: CardTone; href?: string; onClick?: () => void;
}) {
  const router = useRouter();
  const t = TONE[tone];
  const go = () => { if (onClick) onClick(); else if (href) router.push(href); };
  return (
    <button onClick={go} disabled={!href && !onClick}
      className="p-4 rounded-2xl text-left flex flex-col gap-2 transition-shadow hover:shadow-md"
      style={{ ...card, cursor: href || onClick ? 'pointer' : 'default' }}>
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: t.bg, color: t.fg }}>{icon}</div>
        {(href || onClick) && <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />}
      </div>
      <p className="text-2xl font-bold leading-none" style={{ color: tone === 'neutral' ? '#222' : t.fg }}>{value}</p>
      <div>
        <p className="text-xs font-semibold" style={{ color: '#222' }}>{label}</p>
        {subtext && <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{subtext}</p>}
      </div>
    </button>
  );
}

/* ── Section header ───────────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h2 className="text-base font-bold" style={{ color: '#222' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Alert bar ────────────────────────────────────────────────────────── */
export function AlertBar({ alert, actions }: { alert: DashAlert; actions?: ReactNode }) {
  const map = {
    critical: { bg: '#fef2f2', border: '#fecaca', fg: '#b91c1c', icon: <AlertCircle className="w-5 h-5" /> },
    warning: { bg: '#fff7ed', border: '#fed7aa', fg: '#b45309', icon: <AlertTriangle className="w-5 h-5" /> },
    info: { bg: '#eff6ff', border: '#bfdbfe', fg: '#1d4ed8', icon: <Info className="w-5 h-5" /> },
  }[alert.severity];
  return (
    <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: map.bg, border: `1px solid ${map.border}` }}>
      <div className="flex-shrink-0 mt-0.5" style={{ color: map.fg }}>{map.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: map.fg }}>{alert.title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{alert.message}</p>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

/* ── Priority badge ───────────────────────────────────────────────────── */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; fg: string; bg: string }> = {
    critical: { label: 'Critical', fg: '#b91c1c', bg: '#fee2e2' },
    high: { label: 'High', fg: '#b45309', bg: '#fef3c7' },
    medium: { label: 'Medium', fg: '#1d4ed8', bg: '#dbeafe' },
    low: { label: 'Low', fg: '#15803d', bg: '#dcfce7' },
  };
  const m = map[priority];
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ color: m.fg, background: m.bg }}>{m.label}</span>;
}

/* ── Statement-to-books pipeline ──────────────────────────────────────── */
export function Pipeline({ stages }: { stages: PipelineStage[] }) {
  const router = useRouter();
  return (
    <div className="rounded-2xl p-4" style={card}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stages.map((s, i) => {
          const prev = i > 0 ? stages[i - 1] : null;
          const conv = prev && prev.count > 0 ? Math.round((s.count / prev.count) * 100) : null;
          return (
            <button key={s.key} onClick={() => router.push(s.href)} className="relative p-3 rounded-xl text-left hover:bg-[#f7f7f7]" style={{ border: '1px solid #eee' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: i >= 4 ? '#15803d' : i <= 1 ? '#b45309' : '#222' }}>{s.count.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: '#c1c1c1' }}>lines</p>
              {conv != null && <span className="absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center text-[9px] font-bold px-1 rounded" style={{ color: '#929292' }}>{conv}%</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Generic small buttons ────────────────────────────────────────────── */
export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}>{children}</Link>;
}
export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>{children}</Link>;
}
