import type { AmPmSnapshot, Hotel } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';

interface Row { hotel: Hotel; snapshot: AmPmSnapshot }

/**
 * Print-only view of the AM-PM report. Mirrors PrintableLabourBreakdown:
 *  - Overview page (only when > 1 hotel)
 *  - One page per hotel with room-type breakdown fully expanded
 * Visible only on print via the global `.print-only` class.
 */
export function PrintableAmPmReport({
  rows,
  slot,
  scopeLabel,
  reportDate,
}: {
  rows: Row[];
  slot: 'AM' | 'PM';
  scopeLabel: string;
  reportDate: string;
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const slotLabel = slot === 'AM' ? '9:00 AM snapshot' : '5:00 PM snapshot';

  // Portfolio totals
  const totalRooms = rows.reduce((s, r) => s + r.snapshot.totalRooms, 0);
  const totalSold = rows.reduce((s, r) => s + r.snapshot.roomsSold, 0);
  const totalOoo = rows.reduce((s, r) => s + r.snapshot.roomsOoo, 0);
  const totalLeftToSell = rows.reduce((s, r) => s + r.snapshot.roomsLeftToSell, 0);
  const sellable = Math.max(1, totalRooms - totalOoo);
  const portfolioOcc = (totalSold / sellable) * 100;
  const portfolioAdr = Math.round(
    rows.reduce((s, r) => s + r.snapshot.adr * r.snapshot.roomsSold, 0) / Math.max(1, totalSold),
  );
  const portfolioRevPar = Math.round(portfolioAdr * (portfolioOcc / 100));

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
              AM-PM Report · {slotLabel} · {reportDate} · {scopeLabel} · Printed {today}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#222', margin: '6px 0 2px' }}>
              Overview — {rows.length} hotel{rows.length === 1 ? '' : 's'}
            </h2>
            <p style={{ fontSize: 11, color: '#6a6a6a', margin: 0 }}>
              Portfolio totals, ranked by occupancy. Per-hotel room-type detail on following pages.
            </p>
          </div>

          {/* Portfolio totals */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <tbody>
              <tr>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Rooms sold</div>
                  <div style={statValue()}>{totalSold} <span style={statUnit()}>/ {totalRooms}</span></div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Left to sell</div>
                  <div style={{ ...statValue(), color: totalLeftToSell === 0 ? '#16a34a' : '#222' }}>
                    {totalLeftToSell}
                  </div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>OOO</div>
                  <div style={{ ...statValue(), color: totalOoo > 0 ? '#b45309' : '#222' }}>{totalOoo}</div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>Occupancy</div>
                  <div style={{ ...statValue(), color: portfolioOcc >= 85 ? '#16a34a' : portfolioOcc >= 70 ? '#222' : '#b45309' }}>
                    {formatPct(portfolioOcc, 1)}
                  </div>
                </td>
                <td style={summaryCell()}>
                  <div style={statLabel()}>ADR</div>
                  <div style={statValue()}>{formatCurrency(portfolioAdr)}</div>
                </td>
                <td style={summaryCell(true)}>
                  <div style={statLabel()}>RevPAR</div>
                  <div style={statValue()}>{formatCurrency(portfolioRevPar)}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Ranked hotel table — by occupancy desc */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 8 }}>
            Hotels — ranked by occupancy (highest first)
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                {['#', 'Hotel', 'Rooms', 'Sold', 'OOO', 'Left', 'Occ', 'ADR', 'RevPAR'].map((h, idx) => (
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
                .sort((a, b) => b.snapshot.occupancyPct - a.snapshot.occupancyPct)
                .map((row, idx) => (
                  <tr key={row.hotel.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 10px', fontSize: 11, color: '#929292', width: 32 }}>{idx + 1}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: '#222' }}>
                      <div style={{ fontWeight: 600 }}>{row.hotel.shortName}</div>
                      <div style={{ fontSize: 10, color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</div>
                    </td>
                    <td style={cellNum()}>{row.snapshot.totalRooms}</td>
                    <td style={cellNum()}>{row.snapshot.roomsSold}</td>
                    <td style={{ ...cellNum(), color: row.snapshot.roomsOoo > 0 ? '#b45309' : '#929292' }}>{row.snapshot.roomsOoo}</td>
                    <td style={{ ...cellNum(), fontWeight: 600, color: row.snapshot.roomsLeftToSell === 0 ? '#16a34a' : row.snapshot.roomsLeftToSell > row.snapshot.totalRooms * 0.25 ? '#b45309' : '#3f3f3f' }}>
                      {row.snapshot.roomsLeftToSell}
                    </td>
                    <td style={{ ...cellNum(), fontWeight: 600, color: row.snapshot.occupancyPct >= 85 ? '#16a34a' : row.snapshot.occupancyPct >= 70 ? '#3f3f3f' : '#b45309' }}>
                      {formatPct(row.snapshot.occupancyPct, 0)}
                    </td>
                    <td style={cellNum()}>{formatCurrency(row.snapshot.adr)}</td>
                    <td style={cellNum()}>{formatCurrency(row.snapshot.revPar)}</td>
                  </tr>
                ))}
              {/* Totals */}
              <tr style={{ background: '#f7f7f7', borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 10px' }}></td>
                <td style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6a6a6a' }}>Portfolio total</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalRooms}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalSold}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: totalOoo > 0 ? '#b45309' : '#222' }}>{totalOoo}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{totalLeftToSell}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: portfolioOcc >= 85 ? '#16a34a' : portfolioOcc >= 70 ? '#222' : '#b45309' }}>
                  {formatPct(portfolioOcc, 1)}
                </td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{formatCurrency(portfolioAdr)}</td>
                <td style={{ ...cellNum(), fontWeight: 700, color: '#222' }}>{formatCurrency(portfolioRevPar)}</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 10, color: '#929292', marginTop: 14 }}>
            Following pages: one per hotel with room-type breakdown expanded.
          </p>
        </div>
      )}

      {rows.map((row, i) => {
        const s = row.snapshot;
        return (
          <div
            key={row.hotel.id}
            className="print-sheet"
            style={{
              padding: 0,
              pageBreakAfter: i < rows.length - 1 ? 'always' : 'auto',
              breakInside: 'avoid',
            }}
          >
            {/* Sheet header */}
            <div style={{ borderBottom: '2px solid #222', paddingBottom: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#929292', margin: 0 }}>
                AM-PM Report · {slotLabel} · {reportDate} · {scopeLabel}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#222', margin: 0 }}>{row.hotel.name}</h2>
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

            {/* Summary stats */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                <tr>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Total rooms</div>
                    <div style={statValue()}>{s.totalRooms}</div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Sold</div>
                    <div style={statValue()}>{s.roomsSold}</div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>OOO</div>
                    <div style={{ ...statValue(), color: s.roomsOoo > 0 ? '#b45309' : '#222' }}>{s.roomsOoo}</div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Left to sell</div>
                    <div style={{ ...statValue(), color: s.roomsLeftToSell === 0 ? '#16a34a' : s.roomsLeftToSell > s.totalRooms * 0.25 ? '#b45309' : '#222' }}>
                      {s.roomsLeftToSell}
                    </div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>Occupancy</div>
                    <div style={{ ...statValue(), color: s.occupancyPct >= 85 ? '#16a34a' : s.occupancyPct >= 70 ? '#222' : '#b45309' }}>
                      {formatPct(s.occupancyPct, 0)}
                    </div>
                  </td>
                  <td style={summaryCell()}>
                    <div style={statLabel()}>ADR</div>
                    <div style={statValue()}>{formatCurrency(s.adr)}</div>
                  </td>
                  <td style={summaryCell(true)}>
                    <div style={statLabel()}>RevPAR</div>
                    <div style={statValue()}>{formatCurrency(s.revPar)}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Room type breakdown */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6a6a6a', marginBottom: 8 }}>
                Room-type breakdown
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    {['Room type', 'Code', '#', 'Sold', 'OOO', 'Left', 'ADR', 'Avg price', 'RevPAR', 'Occ'].map((h, idx) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#6a6a6a',
                          textAlign: idx === 0 ? 'left' : 'right',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.roomTypes.map((rt, idx) => (
                    <tr key={rt.type} style={{ borderBottom: idx < s.roomTypes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#222' }}>{rt.label}</td>
                      <td style={{ ...cellNum(), fontFamily: 'ui-monospace, monospace', color: '#929292' }}>{rt.type}</td>
                      <td style={cellNum()}>{rt.total}</td>
                      <td style={cellNum()}>{rt.sold}</td>
                      <td style={{ ...cellNum(), color: rt.ooo > 0 ? '#b45309' : '#929292' }}>{rt.ooo}</td>
                      <td style={{ ...cellNum(), fontWeight: 600, color: rt.leftToSell > 0 ? '#16a34a' : '#929292' }}>{rt.leftToSell}</td>
                      <td style={cellNum()}>{formatCurrency(rt.adr)}</td>
                      <td style={cellNum()}>{formatCurrency(rt.avgPrice)}</td>
                      <td style={cellNum()}>{formatCurrency(rt.revPar)}</td>
                      <td style={{ ...cellNum(), fontWeight: 600 }}>{formatPct(rt.occupancyPct, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  return { padding: 8, borderRight: last ? 'none' : '1px solid #f0f0f0', verticalAlign: 'top', width: `${100 / 7}%` };
}
function statLabel(): React.CSSProperties {
  return { fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#929292', marginBottom: 4 };
}
function statValue(): React.CSSProperties {
  return { fontSize: 15, fontWeight: 800, color: '#222' };
}
function statUnit(): React.CSSProperties {
  return { fontSize: 10, fontWeight: 600, color: '#6a6a6a' };
}
function cellNum(): React.CSSProperties {
  return { padding: '8px 10px', fontSize: 11, color: '#3f3f3f', textAlign: 'right' };
}
