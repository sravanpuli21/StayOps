/**
 * Management-company access model.
 *
 * Designed for ANY hotel management company — HOS Management is just the seeded
 * example. A company owns many hotel properties. Every person is created as a
 * USER first; their role / hotel assignment / department can change anytime.
 *
 * Two levels of users:
 *   - company-level (super admin, company admin, regional, accountant, corporate…)
 *   - hotel-level   (GM, manager, supervisors, front desk, housekeeping, etc.)
 *
 * Frontend-only model for the access-structure UI. No API/DB/billing here.
 */

// ─── Roles ───────────────────────────────────────────────────────────────────

export type AdminRole =
  // Company-level
  | 'super_admin'
  | 'company_admin'
  | 'regional_manager'
  | 'accountant'
  | 'corporate_employee'
  | 'operations'
  // Hotel-level
  | 'general_manager'
  | 'hotel_admin'
  | 'manager'
  | 'engineering_supervisor'
  | 'housekeeping_supervisor'
  | 'kitchen_supervisor'
  | 'front_desk'
  | 'maintenance'
  | 'housekeeping'
  | 'kitchen'
  | 'staff';

export type RoleLevel = 'company' | 'hotel';

export interface RoleMeta {
  label: string;
  bg: string;
  color: string;
  rank: number;
  level: RoleLevel;
  /** Default department for hotel-level roles. */
  department?: Department;
  /** A "key" hotel role the admin should be able to change easily. */
  keyHotelRole?: boolean;
  desc: string;
}

export const ROLE_META: Record<AdminRole, RoleMeta> = {
  // ── Company-level ──
  super_admin:        { label: 'Super Admin',        bg: '#fee2e2', color: '#b91c1c', rank: 0,  level: 'company', desc: 'Full management-company portfolio. Manages users, roles, and hotel admins.' },
  company_admin:      { label: 'Company Admin',      bg: '#fef3c7', color: '#92400e', rank: 1,  level: 'company', desc: 'Company-level user & role management across all hotels. No hotel create/delete or billing.' },
  regional_manager:  { label: 'Regional Manager',   bg: '#ede9fe', color: '#6d28d9', rank: 2,  level: 'company', desc: 'Oversees a set of hotels — selected properties or the full portfolio.' },
  accountant:        { label: 'Accountant',         bg: '#dcfce7', color: '#15803d', rank: 3,  level: 'company', desc: 'Financial / reporting access across selected or all hotels.' },
  corporate_employee:{ label: 'Corporate Employee', bg: '#e0f2fe', color: '#0369a1', rank: 4,  level: 'company', desc: 'Limited company-level or selected-hotel access for specific reports/modules.' },
  operations:        { label: 'Operations',         bg: '#fff7ed', color: '#9a3412', rank: 6,  level: 'company', desc: 'Operations team — multi-property visibility.' },

  // ── Hotel-level ──
  general_manager:        { label: 'General Manager',        bg: '#dbeafe', color: '#1d4ed8', rank: 10, level: 'hotel', department: 'Management',   keyHotelRole: true, desc: 'Runs the hotel. Default Hotel Admin for the property.' },
  hotel_admin:            { label: 'Hotel Admin',            bg: '#dbeafe', color: '#1d4ed8', rank: 11, level: 'hotel', department: 'Management',   desc: 'Manages users and operations for the assigned hotel.' },
  manager:                { label: 'Manager',                bg: '#ede9fe', color: '#6d28d9', rank: 12, level: 'hotel', department: 'Management',   keyHotelRole: true, desc: 'Property manager.' },
  engineering_supervisor: { label: 'Engineering Supervisor', bg: '#fef3c7', color: '#b45309', rank: 13, level: 'hotel', department: 'Engineering', keyHotelRole: true, desc: 'Leads maintenance & engineering.' },
  housekeeping_supervisor:{ label: 'Housekeeping Supervisor',bg: '#cffafe', color: '#0e7490', rank: 14, level: 'hotel', department: 'Housekeeping',keyHotelRole: true, desc: 'Leads housekeeping.' },
  kitchen_supervisor:     { label: 'Kitchen Supervisor',     bg: '#ffe4e6', color: '#9f1239', rank: 15, level: 'hotel', department: 'Kitchen',     keyHotelRole: true, desc: 'Leads kitchen / F&B.' },
  front_desk:             { label: 'Front Desk',             bg: '#f0fdf4', color: '#15803d', rank: 16, level: 'hotel', department: 'Front Office', desc: 'Front desk agent.' },
  maintenance:            { label: 'Maintenance',            bg: '#fef9c3', color: '#854d0e', rank: 17, level: 'hotel', department: 'Engineering', desc: 'Maintenance / engineering staff.' },
  housekeeping:           { label: 'Housekeeping',           bg: '#ecfeff', color: '#155e75', rank: 18, level: 'hotel', department: 'Housekeeping',desc: 'Housekeeping staff.' },
  kitchen:                { label: 'Kitchen',                bg: '#fff1f2', color: '#be123c', rank: 19, level: 'hotel', department: 'Kitchen',     desc: 'Kitchen / F&B staff.' },
  staff:                  { label: 'Staff',                  bg: '#f0f0f0', color: '#3f3f3f', rank: 20, level: 'hotel', department: 'Front Office', desc: 'General property staff.' },
};

export type Department =
  | 'Management' | 'Front Office' | 'Engineering' | 'Housekeeping' | 'Kitchen'
  | 'Sales & Marketing' | 'Accounting' | 'Other';

export const DEPARTMENTS: Department[] = [
  'Management', 'Front Office', 'Engineering', 'Housekeeping', 'Kitchen',
  'Sales & Marketing', 'Accounting', 'Other',
];

export const COMPANY_ROLES: AdminRole[] = (Object.keys(ROLE_META) as AdminRole[]).filter((r) => ROLE_META[r].level === 'company');
export const HOTEL_ROLES: AdminRole[] = (Object.keys(ROLE_META) as AdminRole[]).filter((r) => ROLE_META[r].level === 'hotel');
/** Key hotel roles that admins change often (GM, Manager, the 3 supervisors). */
export const KEY_HOTEL_ROLES: AdminRole[] = HOTEL_ROLES.filter((r) => ROLE_META[r].keyHotelRole);

export const isCompanyRole = (r: AdminRole) => ROLE_META[r].level === 'company';
export const isHotelRole = (r: AdminRole) => ROLE_META[r].level === 'hotel';

// ─── Scope + entities ────────────────────────────────────────────────────────

export type UserScope =
  | { kind: 'company' }
  | { kind: 'hotels'; hotelCodes: string[] };

export interface ManagementCompany {
  id: string;
  slug: string;
  name: string;
}

export interface HotelProperty {
  code: string;
  legalName: string;
  name: string;
  address: string;
  phone: string;
  rooms: number;
  taxId: string;           // SENSITIVE — company-level users only
  openingDate: string;
  managerName: string;     // default Hotel Admin / GM
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  scope: UserScope;
  department?: Department;
  supervisor?: string;       // reporting manager name (hotel-level)
  active: boolean;
  /** True for the auto-created default hotel admin (the GM / manager). */
  isDefaultHotelAdmin?: boolean;
  /** Explicit Hotel Admin grant on top of role (a hotel can have several). */
  isHotelAdmin?: boolean;
}

// ─── Example company: HOS Management ─────────────────────────────────────────

export const HOS_COMPANY: ManagementCompany = {
  id: 'co-hos',
  slug: 'hos',
  name: 'HOS Management',
};

export const HOS_PROPERTIES: HotelProperty[] = [
  { code: 'SAVGW',   legalName: 'Shree Hari Ohm, Inc.',                          name: 'Hampton Inn & Suites - Gateway',                            address: '591 Al Henderson Blvd., Chatham, Savannah, GA 31419',          phone: '(921) 912-1515', rooms: 92,  taxId: '20-1305511', openingDate: 'Mar 13, 2006',  managerName: 'Wendy Stevens' },
  { code: 'SAVVY',   legalName: 'River Street Hotel, LLC',                       name: 'Cotton Sail Hotel',                                          address: '126 W. Bay Street, Chatham, Savannah, GA 31401',               phone: '(912) 200-3700', rooms: 56,  taxId: '45-4918328', openingDate: 'May 02, 2014',  managerName: 'Shon Gibbens' },
  { code: 'GA989',   legalName: '321 Montgomery, LLC',                           name: 'Cambria Hotel - Savannah',                                   address: '321 Montgomery Street, Chatham, Savannah, GA 31401',           phone: '(912) 200-6784', rooms: 101, taxId: '81-1735885', openingDate: 'Dec 21, 2022',  managerName: 'Rushabh' },
  { code: 'SAVMT',   legalName: 'Shree Maha Laxmi Savannah Garden LLC',          name: 'Hilton Garden Inn - Midtown',                                address: '5711 Abercorn St., Chatham, Savannah, GA 31405',               phone: '(404) 580-7908', rooms: 132, taxId: '88-4274988', openingDate: 'Dec 30, 2022',  managerName: 'Adreene Allen' },
  { code: 'SAVMD',   legalName: 'Shree Maha Laxmi Savannah Hospitality',         name: 'Hampton Inn & Suites - Midtown',                             address: '20 Johnston St., Savannah, GA 31405',                          phone: '(912) 272-4313', rooms: 120, taxId: '88-4275023', openingDate: 'Dec 30, 2022',  managerName: 'April Mcclendon' },
  { code: 'RISAV',   legalName: 'Shree Maha Laxmi RISAV, LLC',                   name: 'Residence Inn Savannah Midtown',                             address: '5710 White Bluff Rd., Chatham, Savannah, GA 31405',            phone: '(678) 824-3403', rooms: 66,  taxId: '99-0986740', openingDate: 'Apr 24, 2024',  managerName: 'Jagdip Hajariwala' },
  { code: 'SAVFP',   legalName: 'Pooler Dual Hotel LLC',                         name: 'Fairfield/TPS - Pooler, GA',                                 address: '100 Half Moon Way, Chatham, Pooler, GA 31322',                 phone: '(912) 348-9488', rooms: 158, taxId: '84-3219914', openingDate: 'Jan 19, 2026',  managerName: 'Dee Muff' },
  { code: 'BQKCY',   legalName: 'Jai Laxmi Lodging, LLC',                        name: 'Courtyard - Brunswick',                                      address: '580 Millennium Blvd., Glynn, Brunswick, GA 31525',             phone: '(912) 265-2644', rooms: 93,  taxId: '81-2518362', openingDate: 'Jun 27, 2016',  managerName: 'Monicke Jones' },
  { code: 'BSWVE',   legalName: 'Brunswick Lodging, LLC / Brunswick Hotel, INC', name: 'Hampton Inn & Suites - Brunswick',                           address: '128 Venture Drive, Glynn, Brunswick, GA 31525',                phone: '(501) 593-8768', rooms: 97,  taxId: '58-2535517', openingDate: 'Mar 17, 2009',  managerName: 'Terri McCracken' },
  { code: 'GAA84',   legalName: 'WSS BWK Hotel, LLC',                            name: 'Woodspring - Brunswick',                                     address: '5323 New Jesup Hwy, Glynn, Brunswick, GA 31523',               phone: '(912) 689-3001', rooms: 122, taxId: '84-1955578', openingDate: 'Jan 09, 2021',  managerName: 'Brittanie Riggs' },
  { code: 'BQKFP',   legalName: 'KKAR, LLC',                                     name: 'Four Points by Marriott',                                    address: '5308 New Jesup Highway, Glynn, Brunswick, GA 31523',           phone: '(912) 689-3003', rooms: 113, taxId: '82-3672887', openingDate: 'Sept 1, 2021',  managerName: 'Frank Gilford' },
  { code: 'SGJES',   legalName: 'Krishna Hotel, LLC.',                           name: 'Holiday Inn Express - St. Augustine',                        address: '2300 State Road 16, St Johns, St. Augustine, FL 32084',        phone: '(904) 824-5151', rooms: 82,  taxId: '94-3481412', openingDate: 'May 19, 2019',  managerName: 'Jeff Borino' },
  { code: 'JAXTX',   legalName: 'Hotel Amalga, LLC',                             name: 'Hotel Amalga, St. Augustine, A Tribute Portfolio Hotel',     address: '5 Prawn Street, St Johns, St. Augustine, FL 32084',            phone: '(901) 335-8849', rooms: 58,  taxId: '99-3544214', openingDate: 'Mar 20, 2025',  managerName: 'Andres Norena' },
  { code: 'DFWFW',   legalName: 'Shree Maha Laxmi FMTX, LLC',                    name: 'Home2 Suites - Flower Mound',                                address: '4231 River Walk Dr., Denton, Flower Mound, TX 75028',          phone: '(469) 968-8700', rooms: 99,  taxId: '92-0606999', openingDate: 'Feb 9, 2023',   managerName: 'Anita Pass' },
  { code: 'BTRCI',   legalName: 'Shree Maha Laxmi Brla LLC',                     name: 'Home2 Suites - Baton Rouge',                                 address: '2552 Citiplace Court, East Baton Rouge, Baton Rouge, LA 70808', phone: '(225) 276-1016', rooms: 116, taxId: '92-0606862', openingDate: 'Oct 20, 2022',  managerName: 'Ghassan Alyatim' },
  { code: '58090LA', legalName: 'Hinesville Lodging, LLC',                       name: 'La Quinta Inn and Suites - Hinesville',                      address: '1740 E Oglethorpe Hwy, Liberty, Hinesville, GA 31313',         phone: '(866) 422-4948', rooms: 80,  taxId: '93-2133095', openingDate: 'Jul 18, 2023',  managerName: 'Toniqua Williams' },
];

// ─── Seeded company-level users ──────────────────────────────────────────────

export const HOS_COMPANY_USERS: CompanyUser[] = [
  { id: 'cu-super',     name: 'Kris Patel',     email: 'kris@hosmgmt.com',     role: 'super_admin',        scope: { kind: 'company' }, active: true },
  { id: 'cu-coadmin',   name: 'Priya Shah',     email: 'priya@hosmgmt.com',    role: 'company_admin',      scope: { kind: 'company' }, active: true },
  { id: 'cu-reg-1',     name: 'Harshal Patel',  email: 'harshal@hosmgmt.com',  role: 'regional_manager',   scope: { kind: 'hotels', hotelCodes: ['SAVGW', 'SAVVY', 'GA989', 'SAVMT', 'SAVMD', 'RISAV'] }, active: true },
  { id: 'cu-reg-2',     name: 'Gautham Shetty', email: 'gautham@hosmgmt.com',  role: 'regional_manager',   scope: { kind: 'hotels', hotelCodes: ['BQKCY', 'BSWVE', 'GAA84', 'BQKFP'] }, active: true },
  { id: 'cu-acct',      name: 'Sanjay Mehta',   email: 'sanjay@hosmgmt.com',   role: 'accountant',         scope: { kind: 'company' }, active: true },
  { id: 'cu-corp',      name: 'Nina Rao',       email: 'nina@hosmgmt.com',     role: 'corporate_employee', scope: { kind: 'hotels', hotelCodes: ['SGJES', 'JAXTX'] }, active: true },
];

// ─── Seeded hotel teams ──────────────────────────────────────────────────────
// Each hotel's manager → General Manager + default Hotel Admin. Plus a small
// representative team per hotel (supervisors + a couple of staff).

function slugEmail(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')}@hosmgmt.com`;
}

const HOTEL_TEAM_TEMPLATE: Array<{ suffix: string; name: (code: string) => string; role: AdminRole }> = [
  { suffix: 'eng-sup', name: () => 'Sydney Rivera',  role: 'engineering_supervisor' },
  { suffix: 'hk-sup',  name: () => 'Emma Johnson',   role: 'housekeeping_supervisor' },
  { suffix: 'fd-1',    name: () => 'Sravan Puli',    role: 'front_desk' },
  { suffix: 'maint-1', name: () => 'Amir Lopez',     role: 'maintenance' },
];

export const HOS_HOTEL_USERS: CompanyUser[] = HOS_PROPERTIES.flatMap((p) => {
  // GM = the listed manager, default hotel admin.
  const gm: CompanyUser = {
    id: `hu-${p.code}-gm`,
    name: p.managerName,
    email: slugEmail(p.managerName),
    role: 'general_manager',
    scope: { kind: 'hotels', hotelCodes: [p.code] },
    department: 'Management',
    active: true,
    isDefaultHotelAdmin: true,
    isHotelAdmin: true,
  };
  const team: CompanyUser[] = HOTEL_TEAM_TEMPLATE.map((t) => ({
    id: `hu-${p.code}-${t.suffix}`,
    name: t.name(p.code),
    email: `${t.suffix}.${p.code.toLowerCase()}@hosmgmt.com`,
    role: t.role,
    scope: { kind: 'hotels', hotelCodes: [p.code] },
    department: ROLE_META[t.role].department,
    supervisor: p.managerName,
    active: true,
  }));
  return [gm, ...team];
});

/** All seeded users (company + hotel). */
export const HOS_USERS: CompanyUser[] = [...HOS_COMPANY_USERS, ...HOS_HOTEL_USERS];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function companyUsers(users: CompanyUser[] = HOS_USERS): CompanyUser[] {
  return users.filter((u) => isCompanyRole(u.role));
}

export function hotelTeam(code: string, users: CompanyUser[] = HOS_USERS): CompanyUser[] {
  return users.filter((u) => u.scope.kind === 'hotels' && u.scope.hotelCodes.includes(code) && isHotelRole(u.role));
}

export function hotelAdminsForCode(code: string, users: CompanyUser[] = HOS_USERS): CompanyUser[] {
  return users.filter(
    (u) => u.scope.kind === 'hotels' && u.scope.hotelCodes.includes(code)
      && (u.role === 'hotel_admin' || u.role === 'general_manager' || u.isHotelAdmin || u.isDefaultHotelAdmin),
  );
}

export function scopeLabel(scope: UserScope, properties: HotelProperty[] = HOS_PROPERTIES): string {
  if (scope.kind === 'company') return 'Whole company';
  if (scope.hotelCodes.length === 1) {
    const p = properties.find((x) => x.code === scope.hotelCodes[0]);
    return p ? p.name : scope.hotelCodes[0];
  }
  return `${scope.hotelCodes.length} hotels`;
}

/** Can the acting role view sensitive fields (Tax ID)? Company-level mgmt only. */
export function canViewSensitive(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'company_admin' || role === 'accountant';
}

/** Can the acting role manage users (create / edit / change role)? */
export function canManageUsers(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'company_admin' || role === 'general_manager' || role === 'hotel_admin';
}

/** Hotels the acting user can see/manage. */
export function visibleHotels(
  role: AdminRole,
  scope: UserScope,
  properties: HotelProperty[] = HOS_PROPERTIES,
): HotelProperty[] {
  if (scope.kind === 'company') return properties;
  // Company roles with explicit hotel scope, or hotel roles, see their hotels.
  return properties.filter((p) => scope.hotelCodes.includes(p.code));
}
