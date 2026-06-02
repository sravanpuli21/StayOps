import type { Receipt } from '../../types/accounting';
import { LEDGER_TRANSACTIONS } from './transactions';
import { VENDORS } from './vendors';

const VENDOR_BY_ID = new Map(VENDORS.map((v) => [v.id, v]));

const ACTORS = ['Sanjay Narsee', 'GM Auto-upload', 'Regional Manager'];

// Hotel-flavored line-item samples per vendor category for realistic OCR.
const LINE_ITEM_TEMPLATES: Record<string, Array<{ description: string; qty: number; unitPrice: number }>> = {
  'utility': [
    { description: 'Electricity service · 4,210 kWh', qty: 1, unitPrice: 0.114 },
    { description: 'Demand charge',                    qty: 1, unitPrice: 92 },
    { description: 'Service fee',                      qty: 1, unitPrice: 18 },
  ],
  'food': [
    { description: 'Cage-free eggs · 5 doz',           qty: 5, unitPrice: 4.20 },
    { description: 'Bacon strips · 5 lb',              qty: 5, unitPrice: 7.40 },
    { description: 'Bread loaf · 24 ct',               qty: 24, unitPrice: 2.10 },
    { description: 'Coffee beans · 12 lb',             qty: 12, unitPrice: 9.80 },
  ],
  'supplies': [
    { description: 'Bath towels',                      qty: 24, unitPrice: 6.80 },
    { description: 'Toilet paper case',                qty: 4, unitPrice: 18.50 },
    { description: 'Hand soap pump',                   qty: 12, unitPrice: 2.90 },
  ],
  'maintenance': [
    { description: 'Service call',                     qty: 1, unitPrice: 165 },
    { description: 'Capacitor (1.5 ton)',              qty: 1, unitPrice: 42 },
    { description: 'Labor 1.5 hrs',                    qty: 1.5, unitPrice: 110 },
  ],
  'tech': [
    { description: 'Business internet (1 mo)',         qty: 1, unitPrice: 749 },
    { description: 'Equipment rental',                 qty: 1, unitPrice: 24 },
  ],
  'insurance': [
    { description: 'Commercial property premium (mo)', qty: 1, unitPrice: 1850 },
    { description: 'Liability rider',                  qty: 1, unitPrice: 145 },
  ],
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function lineItemsFor(category: string, total: number): Array<{ description: string; qty: number; unitPrice: number; amount: number }> {
  const tpl = LINE_ITEM_TEMPLATES[category] ?? LINE_ITEM_TEMPLATES['supplies'];
  // Scale unit prices so subtotal ≈ total
  const subtotal = tpl.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const scale = subtotal > 0 ? total / subtotal : 1;
  return tpl.map((l) => {
    const unitPrice = Math.round(l.unitPrice * scale * 100) / 100;
    return { description: l.description, qty: l.qty, unitPrice, amount: Math.round(l.qty * unitPrice * 100) / 100 };
  });
}

const STATUSES_FOR_PICK: Array<Receipt['status']> = ['attached', 'attached', 'attached', 'needs-review', 'attached'];
const EMOJIS = ['🧾', '📄', '🏷️', '📋'];

// Pick ~30% of expense transactions, generate a receipt for each.
export const RECEIPTS: Receipt[] = (() => {
  const r = rng(99117);
  const out: Receipt[] = [];

  const expenseTxs = LEDGER_TRANSACTIONS.filter(
    (t) => t.amount < 0 && t.vendorId && t.source !== 'payroll' && t.source !== 'ota',
  );

  for (let i = 0; i < expenseTxs.length; i++) {
    if (r() > 0.32) continue; // ~32% sample
    const tx = expenseTxs[i];
    const vendor = tx.vendorId ? VENDOR_BY_ID.get(tx.vendorId) : null;
    if (!vendor) continue;
    const total = Math.abs(tx.amount);
    const tax = Math.round(total * 0.07 * 100) / 100;
    const status = STATUSES_FOR_PICK[Math.floor(r() * STATUSES_FOR_PICK.length)];
    out.push({
      id: `rec-${tx.id}`,
      transactionId: tx.id,
      hotelId: tx.hotelId,
      filename: `${vendor.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${tx.dateIso}.pdf`,
      uploadedIso: `${tx.dateIso}T${10 + Math.floor(r() * 8)}:${String(Math.floor(r() * 60)).padStart(2, '0')}:00Z`,
      uploadedBy: ACTORS[Math.floor(r() * ACTORS.length)],
      ocrVendor: vendor.name,
      ocrDateIso: tx.dateIso,
      ocrTotal: total,
      ocrTax: tax,
      ocrInvoiceNumber: `INV-${1000 + (i % 9999)}`,
      ocrConfidence: 0.7 + r() * 0.28,
      lineItems: lineItemsFor(vendor.category, total),
      status,
      thumbnailEmoji: EMOJIS[i % EMOJIS.length],
    });
  }
  return out;
})();

export const RECEIPT_BY_TX = new Map(RECEIPTS.map((r) => [r.transactionId, r]));
export const getReceiptForTransaction = (txId: string): Receipt | undefined => RECEIPT_BY_TX.get(txId);
