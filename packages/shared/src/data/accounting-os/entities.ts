/**
 * StayOps Accounting OS — the 16 hotel entities for HOS Management.
 *
 * Core idea: every hotel is its own accounting entity (its own legal company,
 * bank accounts, books, reports, close). The management company (HOS) sees all
 * hotels together. This is the canonical entity dataset for the product.
 */

export interface AcctBankAccount {
  id: string;
  hotelId: string;
  name: string;                 // "Operating Checking"
  bank: string;                 // "Truist", "Bank of America"…
  type: 'Operating Checking' | 'Payroll Checking' | 'Reserve' | 'Savings' | 'Other';
  last4: string;
  currentBalance: number;
  openingBalance: number;
  openingBalanceDate: string;   // ISO
  lastStatementMonth: string | null;  // "2026-05"
  reconStatus: ReconStatus;
}

export interface AcctCreditCard {
  id: string;
  hotelId: string;
  name: string;                 // "Corporate Card"
  issuer: string;               // "Amex", "Chase"…
  last4: string;
  cardHolder: string;
  creditLimit: number;
  currentBalance: number;       // amount owed (positive)
  statementClosingDay: number;  // 1-28
  paymentDueDay: number;
  lastStatementMonth: string | null;
  reconStatus: ReconStatus;
}

export type ReconStatus = 'not-started' | 'in-progress' | 'difference' | 'reconciled';

export interface HotelEntity {
  id: string;                   // property code-derived id
  legalEntity: string;
  hotelName: string;
  address: string;
  phone: string;
  rooms: number;
  taxId: string;
  propertyCode: string;
  openingDate: string;          // ISO
  manager: string;
  city: string;
  state: string;
  status: 'active' | 'archived';
}

/* ── The 16 entities (exact data) ─────────────────────────────────────── */
export const HOTEL_ENTITIES: HotelEntity[] = [
  { id: 'SAVGW', legalEntity: 'Shree Hari Ohm, Inc.', hotelName: 'Hampton Inn & Suites - Gateway', address: '591 Al Henderson Blvd, Chatham, Savannah, GA 31419', phone: '(921) 912-1515', rooms: 92, taxId: '20-1305511', propertyCode: 'SAVGW', openingDate: '2006-03-13', manager: 'Wendy Stevens', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'SAVVY', legalEntity: 'River Street Hotel, LLC', hotelName: 'Cotton Sail Hotel', address: '126 W. Bay Street, Chatham, Savannah, GA 31401', phone: '(912) 200-3700', rooms: 56, taxId: '45-4918328', propertyCode: 'SAVVY', openingDate: '2014-05-02', manager: 'Shon Gibbens', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'GA989', legalEntity: '321 Montgomery, LLC', hotelName: 'Cambria Hotel - Savannah', address: '321 Montgomery Street, Chatham, Savannah, GA 31401', phone: '(912) 200-6784', rooms: 101, taxId: '81-1735885', propertyCode: 'GA989', openingDate: '2022-12-21', manager: 'Rushabh', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'SAVMT', legalEntity: 'Shree Maha Laxmi Savannah Garden LLC', hotelName: 'Hilton Garden Inn - Midtown', address: '5711 Abercorn St, Chatham, Savannah, GA 31405', phone: '(404) 580-7908', rooms: 132, taxId: '88-4274988', propertyCode: 'SAVMT', openingDate: '2022-12-30', manager: 'Adreene Allen', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'SAVMD', legalEntity: 'Shree Maha Laxmi Savannah Hospitality', hotelName: 'Hampton Inn & Suites - Midtown', address: '20 Johnston St, Savannah, GA 31405', phone: '(912) 272-4313', rooms: 120, taxId: '88-4275023', propertyCode: 'SAVMD', openingDate: '2022-12-30', manager: 'April Mcclendon', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'RISAV', legalEntity: 'Shree Maha Laxmi RISAV, LLC', hotelName: 'Residence Inn Savannah Midtown', address: '5710 White Bluff Rd, Chatham, Savannah, GA 31405', phone: '(678) 824-3403', rooms: 66, taxId: '99-0986740', propertyCode: 'RISAV', openingDate: '2024-04-24', manager: 'Jagdip Hajariwala', city: 'Savannah', state: 'GA', status: 'active' },
  { id: 'SAVFP', legalEntity: 'Pooler Dual Hotel LLC', hotelName: 'Fairfield/TPS - Pooler, GA', address: '100 Half Moon Way, Chatham, Pooler, GA 31322', phone: '(912) 348-9488', rooms: 158, taxId: '84-3219914', propertyCode: 'SAVFP/SAVTP', openingDate: '2026-01-19', manager: 'Dee Muff', city: 'Pooler', state: 'GA', status: 'active' },
  { id: 'BQKCY', legalEntity: 'Jai Laxmi Lodging, LLC', hotelName: 'Courtyard - Brunswick', address: '580 Millennium Blvd., Glynn, Brunswick, GA 31525', phone: '(912) 265-2644', rooms: 93, taxId: '81-2518362', propertyCode: 'BQKCY', openingDate: '2016-06-27', manager: 'Monicke Jones', city: 'Brunswick', state: 'GA', status: 'active' },
  { id: 'BSWVE', legalEntity: 'Brunswick Lodging, LLC / Brunswick Hotel, INC', hotelName: 'Hampton Inn & Suites - Brunswick', address: '128 Venture Drive, Glynn, Brunswick, GA 31525', phone: '(501) 593-8768', rooms: 97, taxId: '58-2535517', propertyCode: 'BSWVE', openingDate: '2009-03-17', manager: 'Terri McCracken', city: 'Brunswick', state: 'GA', status: 'active' },
  { id: 'GAA84', legalEntity: 'WSS BWK Hotel, LLC', hotelName: 'Woodspring - Brunswick', address: '5323 New Jesup Hwy, Glynn, Brunswick, GA 31523', phone: '(912) 689-3001', rooms: 122, taxId: '84-1955578', propertyCode: 'GAA84', openingDate: '2021-01-09', manager: 'Brittanie Riggs', city: 'Brunswick', state: 'GA', status: 'active' },
  { id: 'BQKFP', legalEntity: 'KKAR, LLC', hotelName: 'Four Points by Marriott', address: '5308 New Jesup Highway, Glynn, Brunswick, GA 31523', phone: '(912) 689-3003', rooms: 113, taxId: '82-3672887', propertyCode: 'BQKFP', openingDate: '2021-09-01', manager: 'Frank Gil', city: 'Brunswick', state: 'GA', status: 'active' },
  { id: 'SGJES', legalEntity: 'Krishna Hotel, LLC.', hotelName: 'Holiday Inn Express - St. Augustine', address: '2300 State Road 16, St Johns, St. Augustine, FL 32084', phone: '(904) 824-5151', rooms: 82, taxId: '94-3481412', propertyCode: 'SGJES', openingDate: '2019-05-19', manager: 'Jeff Borino', city: 'St. Augustine', state: 'FL', status: 'active' },
  { id: 'JAXTX', legalEntity: 'Hotel Amalga, LLC', hotelName: 'Hotel Amalga - A Tribute Portfolio Hotel', address: '5 Prawn Street, St Johns, St. Augustine, FL 32084', phone: '(901) 335-8849', rooms: 58, taxId: '99-3544214', propertyCode: 'JAXTX', openingDate: '2025-03-20', manager: 'Andres Norena', city: 'St. Augustine', state: 'FL', status: 'active' },
  { id: 'DFWFW', legalEntity: 'Shree Maha Laxmi FMTX, LLC', hotelName: 'Home2 Suites - Flower Mound', address: '4231 River Walk Dr, Denton, Flower Mound, TX 75028', phone: '(469) 968-8700', rooms: 99, taxId: '92-0606999', propertyCode: 'DFWFW', openingDate: '2023-02-09', manager: 'Anita Pass', city: 'Flower Mound', state: 'TX', status: 'active' },
  { id: 'BTRCI', legalEntity: 'Shree Maha Laxmi Brla LLC', hotelName: 'Home2 Suites - Baton Rouge', address: '2552 Citiplace Court, East Baton Rouge, Baton Rouge, LA 70808', phone: '(225) 276-1016', rooms: 116, taxId: '92-0606862', propertyCode: 'BTRCI', openingDate: '2022-10-20', manager: 'Ghassan Alyatim', city: 'Baton Rouge', state: 'LA', status: 'active' },
  { id: '58090LA', legalEntity: 'Hinesville Lodging, LLC', hotelName: 'La Quinta Inn and Suites', address: '1740 E Oglethorpe Hwy, Liberty, Hinesville, GA 31313', phone: '(866) 422-4948', rooms: 80, taxId: '93-2133095', propertyCode: '58090LA', openingDate: '2023-07-18', manager: 'Toniqua Williams', city: 'Hinesville', state: 'GA', status: 'active' },
];

export const TOTAL_ROOMS = HOTEL_ENTITIES.reduce((s, h) => s + h.rooms, 0);
export const getEntity = (id: string): HotelEntity | undefined => HOTEL_ENTITIES.find((h) => h.id === id);

/* ── Bank accounts (2–3 per hotel) + credit cards (1–2 per hotel) ─────── */
const BANKS = ['Truist', 'Bank of America', 'Wells Fargo', 'Regions', 'Synovus'];
const ISSUERS = ['Amex', 'Chase', 'Capital One'];

function seeded(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

export const ACCT_BANK_ACCOUNTS: AcctBankAccount[] = HOTEL_ENTITIES.flatMap((h) => {
  const r = seeded(h.propertyCode.charCodeAt(0) * 7 + h.rooms);
  const bank = BANKS[Math.floor(r() * BANKS.length)];
  const three = r() > 0.4; // most hotels get a reserve too
  const mk = (name: AcctBankAccount['type'], bal: number, recon: ReconStatus): AcctBankAccount => ({
    id: `ba-${h.id}-${name.split(' ')[0].toLowerCase()}`,
    hotelId: h.id, name, bank, type: name,
    last4: String(1000 + Math.floor(r() * 8999)).slice(-4),
    currentBalance: Math.round(bal),
    openingBalance: Math.round(bal * 0.8),
    openingBalanceDate: '2026-01-01',
    lastStatementMonth: r() > 0.15 ? '2026-05' : '2026-04',
    reconStatus: recon,
  });
  const accts = [
    mk('Operating Checking', 40_000 + r() * 180_000, r() > 0.5 ? 'reconciled' : 'in-progress'),
    mk('Payroll Checking', 8_000 + r() * 40_000, r() > 0.6 ? 'reconciled' : 'not-started'),
  ];
  if (three) accts.push(mk('Reserve', 60_000 + r() * 220_000, r() > 0.7 ? 'reconciled' : 'not-started'));
  return accts;
});

export const ACCT_CREDIT_CARDS: AcctCreditCard[] = HOTEL_ENTITIES.flatMap((h) => {
  const r = seeded(h.propertyCode.charCodeAt(1) * 11 + h.rooms);
  const issuer = ISSUERS[Math.floor(r() * ISSUERS.length)];
  const two = r() > 0.45;
  const mk = (name: string, holder: string, recon: ReconStatus): AcctCreditCard => ({
    id: `cc-${h.id}-${name.split(' ')[0].toLowerCase()}`,
    hotelId: h.id, name, issuer,
    last4: String(2000 + Math.floor(r() * 7999)).slice(-4),
    cardHolder: holder,
    creditLimit: [15_000, 25_000, 50_000][Math.floor(r() * 3)],
    currentBalance: Math.round(1_500 + r() * 18_000),
    statementClosingDay: 1 + Math.floor(r() * 27),
    paymentDueDay: 1 + Math.floor(r() * 27),
    lastStatementMonth: r() > 0.2 ? '2026-05' : '2026-04',
    reconStatus: recon,
  });
  const cards = [mk('Corporate Card', 'HOS Management', r() > 0.5 ? 'reconciled' : 'difference')];
  if (two) cards.push(mk('GM Card', h.manager, r() > 0.6 ? 'reconciled' : 'not-started'));
  return cards;
});

export const bankAccountsForHotel = (hotelId: string) => ACCT_BANK_ACCOUNTS.filter((a) => a.hotelId === hotelId);
export const creditCardsForHotel = (hotelId: string) => ACCT_CREDIT_CARDS.filter((c) => c.hotelId === hotelId);

export const TOTAL_BANK_ACCOUNTS = ACCT_BANK_ACCOUNTS.length;
export const TOTAL_CREDIT_CARDS = ACCT_CREDIT_CARDS.length;

/* Company */
export const ACCT_COMPANY = {
  name: 'HOS Management',
  address: 'Savannah, GA',
  currency: 'USD',
  fiscalYearStart: 'January',
  timeZone: 'America/New_York',
};
