import type { Hotel, LabourMetrics } from '@hos/shared';
import { formatCurrency, formatPct, formatVariance } from '@hos/shared';
import { DepartmentDrilldown } from './DepartmentDrilldown';

interface Row {
  hotel: Hotel;
  labour: LabourMetrics;
  revenueTotalForPayrollPct: number;
}

/**
 * Rendered only when printing. One page per hotel, department breakdown
 * expanded inline. Screen-hidden via `.print-only` class (see globals.css).
 * Scope (how many hotels) is determined by the caller — whatever `rows` it
 * receives from the scoped hook, all of them print.
 */
export function PrintableLabourBreakdown({
  rows,
  periodLabel,
  scopeLabel,
}: {
  rows: Row[];
  periodLabel: string;
  scopeLabel: string;
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Portfolio-level totals for the overview page
  const totalSched = rows.reduce((s, r) => s + r.labour.scheduledHours, 0);
  const totalClocked = rows.reduce((s, r) => s + r.labour.clockedHours, 0);
  const totalVar = totalClocked - totalSched;
  const totalOt = rows.reduce((s, r) => s + r.labour.overtimeHours, 0);
  const totalPayroll = rows.reduce((s, r) => s + r.labour.payrollCost, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenueTotalForPayrollPct, 0);
  const portfolioPayrollPct = totalRevenue > 0 ? (totalPayroll / totalRevenue) * 100 : 0;

  return (
    <div className="print-only">
      {/* Overview page — only shown when > 1 hotel */}
      {rows.length > 1 && (
        <div
          className="print-sheet"
          style={{ padding: 0, pageBreakAfter: 'always', breakInside: 'avoid' }}
        >
          <div style={{ borderBottom: '2px solid #222', paddingBottom: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#929292', margin: 0 }}>
              Labour Breakdown · {periodLabel} · {scopeLabel} · {today}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#222', margin: '6px 0 2px' }}>
              Overview — {rows.length} hotel{rows.length === 1 ? '' : 's'}
            </h2>
            <p style={{ fontSize: 11, color: '#6a6a6a', margin: 0 }}>
              Portfolio totals, ranked by variance. Detail pages follow.
            </p>
          </div>

          {/* Portfolio totals row */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <tbody>
              <tr>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Scheduled</div>
                  <div style={statValue()}>{totalSched.toLocaleString()} <span style={statUnit()}>hrs</span></div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Clocked</div>
                  <div style={statValue()}>{totalClocked.toLocaleString()} <span style={statUnit()}>hrs</span></div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Variance</div>
                  <div style={{ ...statValue(), color: totalVar > 0 ? '#dc2626' : '#16a34a' }}>
                    {formatVariance(totalVar)} <span style={statUnit()}>hrs</span>
                  </div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Overtime</div>
                  <div style={{ ...statValue(), color: totalOt > rows.length * 15 ? '#dc2626' : '#222' }}>
                    {totalOt} <span style={statUnit()}>hrs</span>
                  </div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Total payroll</div>
                  <div style={statValue()}>{formatCurrency(totalPayroll, true)}</div>
                </td>
                <td style={summaryCell(true)}>
                  <div style={statLabel()}>Payroll % of rev</div>
                  <div style={{ ...statValue(), color: portfolioPayrollPct > 28 ? '#dc2626' : portfolioPayrollPct > 24 ? '#b45309' : '#15803d' }}>
                    {formatPct(portfolioPayrollPct, 1)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Per-hotel ranked table (worst variance first) */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 8 }}>
            Hotels — ranked by variance (worst first)
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                {['#', 'Hotel', 'Sched', 'Clocked', 'Variance', 'OT', 'Payroll', 'Payroll %'].map((h, idx) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#6a6a6a',
                      textAlign: idx <= 1 ? 'left' : 'right',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...rows]
                .sort((a, b) => b.labour.variance - a.labour.variance)
                .map((row, idx) => {
                  const payrollPct = row.revenueTotalForPayrollPct > 0
                    ? (row.labour.payrollCost / row.revenueTotalForPayrollPct) * 100
                    : 0;
                  const varColor = row.labour.variance > 0 ? '#dc2626' : '#16a34a';
                  return (
                    <tr key={row.hotel.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#929292', width: 32 }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontSize: 12, color: '#222' }}>
                        <div style={{ fontWeight: 600 }}>{row.hotel.shortName}</div>
                        <div style={{ fontSize: 10, color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</div>
                      </td>
                      <td style={cellNum()}>{row.labour.scheduledHours.toLocaleString()}</td>
                      <td style={cellNum()}>{row.labour.clockedHours.toLocaleString()}</td>
                      <td style={{ ...cellNum(), color: varColor, fontWeight: 600 }}>{formatVariance(row.labour.variance)}</td>
                      <td style={{ ...cellNum(), color: row.labour.overtimeHours > 15 ? '#dc2626' : '#3f3f3f' }}>{row.labour.overtimeHours}</td>
                      <td style={cellNum()}>{formatCurrency(row.labour.payrollCost, true)}</td>
                      <td style={{ ...cellNum(), color: payrollPct > 28 ? '#dc2626' : payrollPct > 24 ? '#b45309' : '#15803d' }}>
                        {formatPct(payrollPct, 1)}
                      </td>
                    </tr>
                  );
                })}
              {/* Totals row */}
              <tr style={{ background: '#f7f7f7', borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6a6a6a' }}>Portfolio total</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalSched.toLocaleString()}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalClocked.toLocaleString()}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: totalVar > 0 ? '#dc2626' : '#16a34a' }}>{formatVariance(totalVar)}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalOt}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{formatCurrency(totalPayroll, true)}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: portfolioPayrollPct > 28 ? '#dc2626' : portfolioPayrollPct > 24 ? '#b45309' : '#15803d' }}>
                  {formatPct(portfolioPayrollPct, 1)}
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 10, color: '#929292', marginTop: 14 }}>
            Following pages: one per hotel with department breakdown expanded.
          </p>
        </div>
      )}

      {rows.map((row, i) => {
        const payrollPct = row.revenueTotalForPayrollPct > 0
          ? (row.labour.payrollCost / row.revenueTotalForPayrollPct) * 100
          : 0;
        const varColor = row.labour.variance > 0 ? '#dc2626' : '#16a34a';

        return (
          <div
            key={row.hotel.id}
            className="print-sheet"
            style={{
              padding: '0',
              pageBreakAfter: i < rows.length - 1 ? 'always' : 'auto',
              breakInside: 'avoid',
            }}
          >
            {/* Sheet header */}
            <div style={{ borderBottom: '2px solid #222', paddingBottom: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#929292', margin: 0 }}>
                Labour Breakdown · {periodLabel} · {scopeLabel} · {today}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#222', margin: 0 }}>
                    {row.hotel.name}
                  </h2>
                  <p style={{ fontSize: 11, color: '#6a6a6a', margin: '2px 0 0' }}>
                    {row.hotel.brand} · {row.hotel.city}, {row.hotel.state} · {row.hotel.rooms} rooms
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#929292', margin: 0, textTransform: 'uppercase' }}>
                    Hotel {i + 1} of {rows.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary stats row */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                <tr>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Scheduled</div>
                    <div style={statValue()}>{row.labour.scheduledHours.toLocaleString()} <span style={statUnit()}>hrs</span></div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Clocked</div>
                    <div style={statValue()}>{row.labour.clockedHours.toLocaleString()} <span style={statUnit()}>hrs</span></div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Variance</div>
                    <div style={{ ...statValue(), color: varColor }}>
                      {formatVariance(row.labour.variance)} <span style={statUnit()}>hrs</span>
                    </div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Overtime</div>
                    <div style={{ ...statValue(), color: row.labour.overtimeHours > 15 ? '#dc2626' : '#222' }}>
                      {row.labour.overtimeHours} <span style={statUnit()}>hrs</span>
                    </div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Payroll</div>
                    <div style={statValue()}>{formatCurrency(row.labour.payrollCost, true)}</div>
                  </td>
                  <td style={summaryCell(true)}>
                    <div style={statLabel()}>Payroll % of rev</div>
                    <div style={{ ...statValue(), color: payrollPct > 28 ? '#dc2626' : payrollPct > 24 ? '#b45309' : '#15803d' }}>
                      {formatPct(payrollPct, 1)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Department breakdown — always expanded */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 8 }}>
                Department breakdown
              </p>
              <DepartmentDrilldown departments={row.labour.departments} />
            </div>

            {/* Signature block */}
            <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #dddddd', display: 'flex', gap: 40 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#929292', margin: 0, textTransform: 'uppercase' }}>GM signature</p>
                <div style={{ marginTop: 28, borderBottom: '1px solid #222', width: '80%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#929292', margin: 0, textTransform: 'uppercase' }}>Regional signature</p>
                <div style={{ marginTop: 28, borderBottom: '1px solid #222', width: '80%' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function summaryCell(last = false): React.CSSProperties {
  return {
    padding: 8,
    borderRight: last ? 'none' : '1px solid #f0f0f0',
    verticalAlign: 'top',
    width: `${100 / 6}%`,
  };
}
function statLabel(): React.CSSProperties {
  return {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#929292', marginBottom: 4,
  };
}
function statValue(): React.CSSProperties {
  return { fontSize: 16, fontWeight: 800, color: '#222' };
}
function statUnit(): React.CSSProperties {
  return { fontSize: 11, fontWeight: 600, color: '#6a6a6a' };
}
function cellNum(): React.CSSProperties {
  return { padding: '8px 10px', fontSize: 11, color: '#3f3f3f', textAlign: 'right' };
}
