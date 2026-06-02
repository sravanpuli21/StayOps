import type { Vendor } from '../../types/accounting';

export const VENDORS: Vendor[] = [
  // Utilities
  { id: 'v-georgia-power',      name: 'Georgia Power',                defaultAccountId: 'acc-6400', terms: 'Net 30', category: 'utility' },
  { id: 'v-atlanta-gas',        name: 'Atlanta Gas Light',            defaultAccountId: 'acc-6410', terms: 'Net 30', category: 'utility' },
  { id: 'v-savannah-water',     name: 'City of Savannah Water Dept',  defaultAccountId: 'acc-6420', terms: 'Net 30', category: 'utility' },
  { id: 'v-waste-mgmt',         name: 'Waste Management Inc.',        defaultAccountId: 'acc-6430', terms: 'Net 30', category: 'utility' },
  { id: 'v-entergy',            name: 'Entergy Louisiana',            defaultAccountId: 'acc-6400', terms: 'Net 30', category: 'utility' },

  // Food & supplies
  { id: 'v-sysco',              name: 'Sysco Foods',                  defaultAccountId: 'acc-5310', terms: 'Net 7',  category: 'food' },
  { id: 'v-us-foods',           name: 'US Foods',                     defaultAccountId: 'acc-5310', terms: 'Net 7',  category: 'food' },
  { id: 'v-restaurant-depot',   name: 'Restaurant Depot',             defaultAccountId: 'acc-5320', terms: 'Due on Receipt', category: 'food' },
  { id: 'v-ecolab',             name: 'Ecolab',                       defaultAccountId: 'acc-5130', terms: 'Net 30', category: 'supplies' },
  { id: 'v-hd-supply',          name: 'HD Supply',                    defaultAccountId: 'acc-5120', terms: 'Net 30', category: 'supplies' },
  { id: 'v-guest-supply',       name: 'Guest Supply LLC',             defaultAccountId: 'acc-5120', terms: 'Net 30', category: 'supplies' },
  { id: 'v-cintas',             name: 'Cintas Corporation',           defaultAccountId: 'acc-5110', terms: 'Net 30', category: 'supplies' },

  // Maintenance / R&M
  { id: 'v-otis',               name: 'Otis Elevator',                defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },
  { id: 'v-orkin',              name: 'Orkin Pest Control',           defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },
  { id: 'v-ge-zoneline',        name: 'GE Zoneline Service',          defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },
  { id: 'v-pentair',            name: 'Pentair Pool Service',         defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },

  // OTA
  { id: 'v-expedia',            name: 'Expedia Partner Solutions',    defaultAccountId: 'acc-5210', terms: 'Net 30', category: 'ota' },
  { id: 'v-booking',            name: 'Booking.com BV',               defaultAccountId: 'acc-5210', terms: 'Net 30', category: 'ota' },
  { id: 'v-agoda',              name: 'Agoda Services',               defaultAccountId: 'acc-5210', terms: 'Net 30', category: 'ota' },

  // Franchise / Mgmt
  { id: 'v-hilton-franchise',   name: 'Hilton Franchise LLC',         defaultAccountId: 'acc-7300', terms: 'Net 30', category: 'franchise' },
  { id: 'v-marriott-fees',      name: 'Marriott Royalty',             defaultAccountId: 'acc-7300', terms: 'Net 30', category: 'franchise' },
  { id: 'v-choice-royalty',     name: 'Choice Hotels Royalty',        defaultAccountId: 'acc-7300', terms: 'Net 30', category: 'franchise' },

  // Tech / Telecom / S&M
  { id: 'v-att-business',       name: 'AT&T Business',                defaultAccountId: 'acc-6200', terms: 'Net 30', category: 'tech' },
  { id: 'v-comcast',            name: 'Comcast Business',             defaultAccountId: 'acc-6200', terms: 'Net 30', category: 'tech' },
  { id: 'v-siteminder',         name: 'SiteMinder',                   defaultAccountId: 'acc-6300', terms: 'Net 30', category: 'tech' },
  { id: 'v-opera-cloud',        name: 'Opera Cloud Support',          defaultAccountId: 'acc-6200', terms: 'Net 30', category: 'tech' },

  // Payroll
  { id: 'v-adp',                name: 'ADP Payroll',                  defaultAccountId: 'acc-2100', terms: 'Due on Receipt', category: 'payroll' },
  { id: 'v-paychex',            name: 'Paychex',                      defaultAccountId: 'acc-2100', terms: 'Due on Receipt', category: 'payroll' },

  // Insurance & tax
  { id: 'v-state-farm',         name: 'State Farm Commercial',        defaultAccountId: 'acc-7200', terms: 'Net 30', category: 'insurance' },
  { id: 'v-chatham-tax',        name: 'Chatham County Tax Commissioner', defaultAccountId: 'acc-7100', terms: 'Net 30', category: 'tax' },

  // Bank
  { id: 'v-wells-fargo',        name: 'Wells Fargo Bank',             defaultAccountId: 'acc-6120', terms: 'Due on Receipt', category: 'bank' },

  // Retail / general — these usually need split or review (multi-purpose buys)
  { id: 'v-home-depot',         name: 'The Home Depot',               defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },
  { id: 'v-lowes',              name: "Lowe's",                       defaultAccountId: 'acc-6500', terms: 'Net 30', category: 'maintenance' },
  { id: 'v-walmart',            name: 'Walmart',                      defaultAccountId: 'acc-5120', terms: 'Due on Receipt', category: 'supplies' },
  { id: 'v-costco',             name: 'Costco Wholesale',             defaultAccountId: 'acc-5120', terms: 'Due on Receipt', category: 'supplies' },
  { id: 'v-amazon',             name: 'Amazon Business',              defaultAccountId: 'acc-5120', terms: 'Due on Receipt', category: 'supplies' },
];

export const VENDOR_BY_ID = new Map(VENDORS.map((v) => [v.id, v]));
export const getVendorById = (id: string) => VENDOR_BY_ID.get(id);
