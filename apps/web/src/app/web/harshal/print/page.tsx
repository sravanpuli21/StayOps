'use client';

import { useState } from 'react';
import { Printer, FileText, Calendar, BarChart3, Check } from 'lucide-react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS,
  REGIONAL_ROSTER, GM_ROSTER,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';

const HARSHAL = REGIONAL_ROSTER.find((r) => r.id === 'harshal')!;

type PackId = 'daily' | 'paycycle' | 'deepdive';

const PACKS: Array<{
  id: PackId;
  title: string;
  subtitle: string;
  bullets: string[];
  icon: typeof FileText;
  accent: string;
  bg: string;
}> = [
  {
    id: 'daily',
    title: 'Daily Packet',
    subtitle: '8 one-page hotel scorecards',
    bullets: [
      'Occupancy, revenue, ADR, RevPAR per hotel',
      'Payroll % and labour variance',
      'Rooms out of order',
      'Headline guest complaints',
      'Red flags at a glance',
    ],
    icon: Calendar,
    accent: '#ff385c',
    bg: 'rgba(255,56,92,0.08)',
  },
  {
    id: 'paycycle',
    title: 'Pay Cycle Packet',
    subtitle: 'Bi-weekly labour deep dive',
    bullets: [
      'Scheduled vs clocked hours per hotel',
      'Overtime report by department',
      'Department productivity ranking',
      'GM commentary fields',
    ],
    icon: FileText,
    accent: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
  },
  {
    id: 'deepdive',
    title: 'Deep Dive Packet',
    subtitle: 'Property-by-property trends',
    bullets: [
      'Revenue & labour trends (4 weeks)',
      'Recurring issues and repeat rooms',
      'Open commitments with each GM',
      'Action items assigned at last review',
    ],
    icon: BarChart3,
    accent: '#2563eb',
    bg: 'rgba(37,99,235,0.08)',
  },
];

export default function HarshalPrintCenter() {
  const [selectedPack, setSelectedPack] = useState<PackId>('daily');
  const [selectedHotels, setSelectedHotels] = useState<string[]>(HARSHAL.hotelIds as unknown as string[]);
  const [printedRecently, setPrintedRecently] = useState<PackId | null>(null);

  const hotels = HOTELS.filter((h) => HARSHAL.hotelIds.includes(h.id));
  const includedHotels = hotels.filter((h) => selectedHotels.includes(h.id));

  const toggleHotel = (id: string) => {
    setSelectedHotels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    setPrintedRecently(selectedPack);
    window.print();
    setTimeout(() => setPrintedRecently(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="no-print">
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Print Center</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          One-click executive packets · paper-first for GM calls and reviews
        </p>
      </div>

      {/* Pack picker */}
      <div className="no-print grid grid-cols-3 gap-4">
        {PACKS.map((pack) => {
          const isActive = selectedPack === pack.id;
          return (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className="bg-white rounded-2xl p-5 text-left transition-all"
              style={{
                border: isActive ? `2px solid ${pack.accent}` : '1px solid #dddddd',
                boxShadow: isActive ? `0 4px 14px ${pack.bg}` : 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: pack.bg }}
              >
                <pack.icon className="w-5 h-5" style={{ color: pack.accent }} />
              </div>
              <p className="font-semibold text-base" style={{ color: '#222' }}>{pack.title}</p>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{pack.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Pack details + action */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
            What's included
          </h2>
          <ul className="flex flex-col gap-2 mb-6">
            {PACKS.find((p) => p.id === selectedPack)!.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#3f3f3f' }}>
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                {b}
              </li>
            ))}
          </ul>

          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
            Hotels ({selectedHotels.length} / {hotels.length})
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {hotels.map((h) => {
              const on = selectedHotels.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHotel(h.id)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors"
                  style={{
                    background: on ? 'rgba(255,56,92,0.06)' : '#f7f7f7',
                    border: on ? '1px solid #ff385c' : '1px solid transparent',
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#222' }}>{h.shortName}</p>
                    <p className="text-xs" style={{ color: '#929292' }}>{h.city}, {h.state}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded border flex items-center justify-center"
                    style={{
                      borderColor: on ? '#ff385c' : '#c1c1c1',
                      background: on ? '#ff385c' : 'transparent',
                    }}
                  >
                    {on && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-6 flex flex-col gap-4"
          style={{ border: '1px solid #dddddd' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
              Ready to print
            </p>
            <p className="text-2xl font-bold" style={{ color: '#222' }}>
              {includedHotels.length}
              <span className="text-sm font-medium" style={{ color: '#6a6a6a' }}> hotel{includedHotels.length === 1 ? '' : 's'}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              {PACKS.find((p) => p.id === selectedPack)!.title}
            </p>
          </div>

          <button
            onClick={handlePrint}
            disabled={includedHotels.length === 0}
            className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-colors"
            style={{
              background: includedHotels.length === 0 ? '#dddddd' : '#ff385c',
              color: '#ffffff',
              cursor: includedHotels.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Printer className="w-4 h-4" />
            Print now
          </button>

          {printedRecently && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
              style={{ background: '#f0fdf4', color: '#15803d' }}
            >
              <Check className="w-4 h-4" />
              Sent to printer · {PACKS.find((p) => p.id === printedRecently)!.title}
            </div>
          )}

          <div className="pt-2" style={{ borderTop: '1px solid #ebebeb' }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>
              Shortcuts
            </p>
            <div className="flex flex-col gap-1 text-xs" style={{ color: '#6a6a6a' }}>
              <span>• Use System Print dialog to save as PDF</span>
              <span>• Print headers auto-filter to Harshal's territory</span>
              <span>• GM summary on the final page for annotation</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────── */}
      {/* PRINT PREVIEW — rendered always, but only visible via @media print */}
      {/* ────────────────────────────────────────── */}
      <div className="print-only">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase" style={{ color: '#929292' }}>
            {PACKS.find((p) => p.id === selectedPack)!.title}
          </p>
          <h1 className="text-2xl font-bold mt-1" style={{ color: '#222' }}>
            Harshal Patel — {HARSHAL.hotelIds.length}-Hotel Regional Review
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>
            Generated {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Scorecard grid — one row per hotel */}
        <table className="w-full text-xs border-collapse mb-4">
          <thead>
            <tr style={{ borderBottom: '2px solid #222' }}>
              <th style={{ padding: 6, textAlign: 'left' }}>Hotel / GM</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Occ %</th>
              <th style={{ padding: 6, textAlign: 'right' }}>ADR</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Revenue</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Payroll %</th>
              <th style={{ padding: 6, textAlign: 'right' }}>Hrs Var</th>
              <th style={{ padding: 6, textAlign: 'right' }}>OT</th>
              <th style={{ padding: 6, textAlign: 'right' }}>OOO</th>
              <th style={{ padding: 6, textAlign: 'left' }}>Flag</th>
            </tr>
          </thead>
          <tbody>
            {includedHotels.map((hotel) => {
              const rev = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
              const lab = LABOUR_DATA.find((l) => l.hotelId === hotel.id)!;
              const dm = DAILY_METRICS.find((d) => d.hotelId === hotel.id)!;
              const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
              const payrollPct = (lab.payrollCost / rev.totalRevenue) * 100;
              const flag =
                dm.roomsOoo > 1 ? 'OOO cluster' :
                payrollPct > 28 ? 'Payroll high' :
                lab.variance > 25 ? 'Labour var' :
                rev.occupancyPct < 76 ? 'Low occ' : '—';
              return (
                <tr key={hotel.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: 6 }}>
                    <div style={{ fontWeight: 600 }}>{hotel.shortName}</div>
                    <div style={{ color: '#6a6a6a', fontSize: 10 }}>{gm?.name ?? '—'}</div>
                  </td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{formatPct(rev.occupancyPct, 0)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{formatCurrency(rev.adr)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{formatCurrency(rev.totalRevenue, true)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{formatPct(payrollPct, 1)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{formatVariance(lab.variance)}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{lab.overtimeHours}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{dm.roomsOoo}</td>
                  <td style={{ padding: 6, color: flag === '—' ? '#16a34a' : '#b91c1c', fontWeight: flag === '—' ? 400 : 600 }}>{flag}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p style={{ fontSize: 10, color: '#929292', marginTop: 24 }}>
          Notes / annotations:
        </p>
        <div style={{ height: 80, borderBottom: '1px dashed #c1c1c1' }} />
        <div style={{ height: 32, borderBottom: '1px dashed #c1c1c1' }} />
        <div style={{ height: 32, borderBottom: '1px dashed #c1c1c1' }} />
      </div>

      {/* Print-only style */}
      <style>{`
        @media screen {
          .print-only { display: none; }
        }
        @media print {
          .print-only { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
