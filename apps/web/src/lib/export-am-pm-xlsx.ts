import * as XLSX from 'xlsx';
import type { AmPmReport, AmPmSnapshot, Hotel } from '@hos/shared';

const SUMMARY_HEADERS = [
  'Property',
  'City',
  'State',
  '# Rooms',
  'Sold',
  'OOO',
  'Left to Sell',
  'ADR',
  'Avg Price',
  'RevPAR',
  'Occupancy %',
];

const SUMMARY_WIDTHS = [26, 16, 6, 10, 8, 6, 13, 10, 12, 10, 13];

const BREAKDOWN_HEADERS = [
  'Room Type',
  'Code',
  '# Rooms',
  'Sold',
  'OOO',
  'Left to Sell',
  'ADR',
  'Avg Price',
  'RevPAR',
  'Occupancy %',
];

const BREAKDOWN_WIDTHS = [22, 8, 10, 8, 6, 13, 10, 12, 10, 13];

function summaryRow(hotel: Hotel, snap: AmPmSnapshot): (string | number)[] {
  return [
    hotel.shortName,
    hotel.city,
    hotel.state,
    snap.totalRooms,
    snap.roomsSold,
    snap.roomsOoo,
    snap.roomsLeftToSell,
    snap.adr,
    snap.avgPrice,
    snap.revPar,
    Number(snap.occupancyPct.toFixed(1)),
  ];
}

function sanitizeSheetName(name: string, fallback: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, '').trim();
  const truncated = cleaned.slice(0, 31);
  return truncated.length > 0 ? truncated : fallback.slice(0, 31);
}

function mmDdYyyy(iso: string): string {
  const [yyyy, mm, dd] = iso.slice(0, 10).split('-');
  return `${mm}-${dd}-${yyyy}`;
}

export function exportAmPmReportXlsx(report: AmPmReport, hotels: Hotel[], scopeLabel = 'All Hotels'): void {
  const wb = XLSX.utils.book_new();

  const summaryAoa: (string | number)[][] = [
    [`AM-PM Report · ${scopeLabel} · ${report.label}`],
    [`Generated: ${report.generatedAt}`],
    [],
    SUMMARY_HEADERS,
  ];
  for (const hotel of hotels) {
    const snap = report.rows.find((r) => r.hotelId === hotel.id);
    if (!snap) continue;
    summaryAoa.push(summaryRow(hotel, snap));
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryAoa);
  summarySheet['!cols'] = SUMMARY_WIDTHS.map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  const usedNames = new Set<string>(['Summary']);

  for (const hotel of hotels) {
    const snap = report.rows.find((r) => r.hotelId === hotel.id);
    if (!snap) continue;

    const aoa: (string | number)[][] = [
      [hotel.name],
      [`Code: ${hotel.code}`, `${hotel.city}, ${hotel.state}`, `${report.label} · ${report.generatedAt}`],
      [],
      SUMMARY_HEADERS,
      summaryRow(hotel, snap),
      [],
      ['Room Type Breakdown'],
      BREAKDOWN_HEADERS,
    ];
    for (const rt of snap.roomTypes) {
      aoa.push([
        rt.label,
        rt.type,
        rt.total,
        rt.sold,
        rt.ooo,
        rt.leftToSell,
        rt.adr,
        rt.avgPrice,
        rt.revPar,
        Number(rt.occupancyPct.toFixed(1)),
      ]);
    }

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const summaryColCount = SUMMARY_WIDTHS.length;
    const breakdownColCount = BREAKDOWN_WIDTHS.length;
    const cols = Array.from({ length: Math.max(summaryColCount, breakdownColCount) }, (_, i) => ({
      wch: BREAKDOWN_WIDTHS[i] ?? SUMMARY_WIDTHS[i] ?? 12,
    }));
    sheet['!cols'] = cols;

    let name = sanitizeSheetName(hotel.shortName, hotel.code);
    if (usedNames.has(name)) {
      const fallback = sanitizeSheetName(hotel.code, hotel.id);
      name = usedNames.has(fallback) ? `${fallback}-${hotel.id}`.slice(0, 31) : fallback;
    }
    usedNames.add(name);
    XLSX.utils.book_append_sheet(wb, sheet, name);
  }

  const filename = `${mmDdYyyy(report.generatedAt)}_HOS_${scopeLabel}_${report.slot} Report.xlsx`;
  XLSX.writeFile(wb, filename);
}
