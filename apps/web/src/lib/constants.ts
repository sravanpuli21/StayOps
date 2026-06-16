export type NavItem = { label: string; href: string; icon: string; external?: boolean };

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',    href: '/web/kris/dashboard',    icon: 'LayoutDashboard' },
  { label: 'AM-PM Report', href: '/web/kris/am-pm-report', icon: 'Calendar'        },
  { label: 'Intelligence', href: '/web/kris/intelligence', icon: 'Sparkles'        },
  { label: 'Revenue',      href: '/web/kris/revenue',      icon: 'DollarSign'      },
  { label: 'Historic Data', href: '/web/kris/history',  icon: 'LineChart'         },
  { label: 'Labour',     href: '/web/kris/labour',      icon: 'Users'           },
  { label: 'Operations', href: '/web/kris/operations',  icon: 'Wrench'          },
  { label: 'Audits',     href: '/web/kris/audits',      icon: 'ClipboardList'   },
  { label: 'Valuation',  href: '/web/kris/assets',      icon: 'Building2'       },
  { label: 'Leaders',    href: '/web/kris/leaders',     icon: 'UserCheck'       },
  { label: 'Alerts',     href: '/web/kris/alerts',      icon: 'Bell'            },
  { label: 'Strategy',   href: '/web/kris/strategy',    icon: 'Target'          },
  { label: 'Settings',   href: '/web/kris/settings',    icon: 'Settings'        },
] as const;

// Rishab — General Manager (single property)
export const RISHAB_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',    href: '/web/rishab/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Intelligence', href: '/web/rishab/intelligence', icon: 'Sparkles'        },
  { label: 'Revenue',      href: '/web/rishab/revenue',      icon: 'DollarSign'      },
  { label: 'Historic Data', href: '/web/rishab/history',     icon: 'LineChart'         },
  { label: 'Scheduling',   href: '/web/rishab/scheduling',   icon: 'Calendar'        },
  { label: 'Operations',   href: '/web/rishab/operations',   icon: 'Wrench'          },
  { label: 'Audits',       href: '/web/rishab/audits',       icon: 'ClipboardList'   },
  { label: 'Assets',       href: '/web/rishab/assets',       icon: 'Building2'       },
  { label: 'SOP',          href: '/web/rishab/sop',          icon: 'BookOpen'        },
  { label: 'Alerts',       href: '/web/rishab/alerts',       icon: 'Bell'            },
  { label: 'Admin',        href: '/web/rishab/admin',        icon: 'UserCheck'       },
  { label: 'Settings',     href: '/web/rishab/settings',     icon: 'Settings'        },
] as const;

// Harshal — Regional Director of Operations
export const HARSHAL_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',    href: '/web/harshal/dashboard',    icon: 'LayoutDashboard' },
  { label: 'AM-PM Report', href: '/web/harshal/am-pm-report', icon: 'Calendar'        },
  { label: 'Intelligence', href: '/web/harshal/intelligence', icon: 'Sparkles'        },
  { label: 'Revenue',      href: '/web/harshal/revenue',      icon: 'DollarSign'      },
  { label: 'Historic Data', href: '/web/harshal/history',     icon: 'LineChart'         },
  { label: 'OTA Leakage',  href: '/web/harshal/ota-leakage',  icon: 'TrendingDown'    },
  { label: 'Labour',       href: '/web/harshal/labour',       icon: 'Users'           },
  { label: 'Operations',   href: '/web/harshal/operations',   icon: 'Wrench'          },
  { label: 'Audits',       href: '/web/harshal/audits',       icon: 'ClipboardList'   },
  { label: 'Assets',       href: '/web/harshal/assets',       icon: 'Building2'       },
  { label: 'GMs',          href: '/web/harshal/gms',          icon: 'UserCheck'       },
  { label: 'Print Center', href: '/web/harshal/print',        icon: 'Printer'         },
  { label: 'Alerts',       href: '/web/harshal/alerts',       icon: 'Bell'            },
  { label: 'Strategy',     href: '/web/harshal/strategy',     icon: 'Target'          },
  { label: 'Settings',     href: '/web/harshal/settings',     icon: 'Settings'        },
] as const;

// Emma — Housekeeping Supervisor (single property)
export const EMMA_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',    href: '/web/emma/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Assignments',  href: '/web/emma/assignments',  icon: 'ClipboardList'   },
  { label: 'Rooms',        href: '/web/emma/rooms',        icon: 'Bed'             },
  { label: 'Team',         href: '/web/emma/team',         icon: 'Users'           },
  { label: 'Tickets',      href: '/web/emma/tickets',      icon: 'Wrench'          },
  { label: 'Print Sheets', href: '/web/emma/print',        icon: 'Printer'         },
  { label: 'Staff Schedule', href: '/web/emma/scheduling', icon: 'Calendar'      },
  { label: 'SOP',          href: '/web/emma/sop',          icon: 'BookOpen'        },
  { label: 'Settings',     href: '/web/emma/settings',     icon: 'Settings'        },
] as const;

// Sydney — Maintenance & Engineering Supervisor (single property)
export const SYDNEY_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',   href: '/web/sydney/dashboard',   icon: 'LayoutDashboard' },
  { label: 'Tickets',     href: '/web/sydney/tickets',     icon: 'Wrench'          },
  { label: 'Preventive',  href: '/web/sydney/preventive',  icon: 'CalendarCheck'   },
  { label: 'Audits',      href: '/web/sydney/audits',      icon: 'ClipboardList'   },
  { label: 'Rooms',       href: '/web/sydney/rooms',       icon: 'Bed'             },
  { label: 'Assets',      href: '/web/sydney/assets',      icon: 'Building2'       },
  { label: 'Team',        href: '/web/sydney/team',        icon: 'Users'           },
  { label: 'SOP',         href: '/web/sydney/sop',         icon: 'BookOpen'        },
  { label: 'Settings',    href: '/web/sydney/settings',    icon: 'Settings'        },
] as const;

// Sanjay — Corporate Accounting (portfolio scope, accounting-only nav)
// Full V1 spec navigation (15 items) — see docs/stayops-accounting-spec.md
export const SANJAY_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',        href: '/web/sanjay/accounting/dashboard',         icon: 'LayoutDashboard' },
  { label: 'Uploads',          href: '/web/sanjay/accounting/uploads',           icon: 'Printer'         },
  { label: 'Transactions',     href: '/web/sanjay/accounting/transactions',      icon: 'ClipboardList'   },
  { label: 'Banking',          href: '/web/sanjay/accounting/banking',           icon: 'DollarSign'      },
  { label: 'Credit Cards',     href: '/web/sanjay/accounting/credit-cards',      icon: 'DollarSign'      },
  { label: 'Vendors',          href: '/web/sanjay/accounting/vendors',           icon: 'Users'           },
  { label: 'Bills',            href: '/web/sanjay/accounting/bills',             icon: 'ClipboardList'   },
  { label: 'Recurring Bills',  href: '/web/sanjay/accounting/recurring-bills',   icon: 'CalendarCheck'   },
  { label: 'Reconciliation',   href: '/web/sanjay/accounting/reconciliation',    icon: 'Sparkles'        },
  { label: 'Reports',          href: '/web/sanjay/accounting/reports',           icon: 'BookOpen'        },
  { label: 'Chart of Accounts',href: '/web/sanjay/accounting/chart-of-accounts', icon: 'Building2'       },
  { label: 'Budgets',          href: '/web/sanjay/accounting/budgets',           icon: 'Target'          },
  { label: 'Approvals',        href: '/web/sanjay/accounting/approvals',         icon: 'UserCheck'       },
  { label: 'CPA Export',       href: '/web/sanjay/accounting/cpa-export',        icon: 'TrendingDown'    },
  { label: 'Settings',         href: '/web/sanjay/accounting/settings',          icon: 'Settings'        },
] as const;

// Sravan — Front Desk Staff (self-service)
export const SRAVAN_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home',         href: '/web/sravan/home',         icon: 'LayoutDashboard' },
  { label: 'Clock In/Out', href: '/web/sravan/clock',        icon: 'Clock'           },
  { label: 'Schedule',     href: '/web/sravan/schedule',     icon: 'Calendar'        },
  { label: 'Availability', href: '/web/sravan/availability', icon: 'CalendarCheck'   },
  { label: 'Earnings',     href: '/web/sravan/earnings',     icon: 'DollarSign'      },
  { label: 'Hours',        href: '/web/sravan/hours',        icon: 'Timer'           },
  { label: 'Bonuses',      href: '/web/sravan/bonus',        icon: 'Sparkles'        },
  { label: 'SOPs',         href: '/web/sravan/sop',          icon: 'BookOpen'        },
  { label: 'Profile',      href: '/web/sravan/profile',      icon: 'UserCircle'      },
] as const;

// Kwanisha — Director of Sales (group / recurring business CRM)
export const KWANISHA_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard',             href: '/web/kwanisha/dashboard',        icon: 'LayoutDashboard' },
  { label: 'Pulse Inbox',           href: '/web/kwanisha/pulse',            icon: 'Inbox'           },
  { label: 'Opportunities',         href: '/web/kwanisha/opportunities',    icon: 'Target'          },
  { label: 'Leads',                 href: '/web/kwanisha/leads',            icon: 'UserPlus'        },
  { label: 'Accounts',              href: '/web/kwanisha/accounts',         icon: 'Building2'       },
  { label: 'Contacts',              href: '/web/kwanisha/contacts',         icon: 'Contact'         },
  { label: 'Market Calendar',       href: '/web/kwanisha/market-calendar',  icon: 'CalendarDays'    },
  { label: 'Prospecting',           href: '/web/kwanisha/prospecting',      icon: 'Search'          },
  { label: 'Tasks',                 href: '/web/kwanisha/tasks',            icon: 'CheckSquare'     },
  { label: 'Rate Requests',         href: '/web/kwanisha/rate-requests',    icon: 'Percent'         },
  { label: 'Proposals & Contracts', href: '/web/kwanisha/proposals',        icon: 'FileText'        },
  { label: 'Reports',               href: '/web/kwanisha/reports',          icon: 'TrendingDown'    },
  { label: 'Settings',              href: '/web/kwanisha/settings',         icon: 'Settings'        },
] as const;

export const DATE_RANGE_OPTIONS = [
  { label: 'Today',           value: 'today'      },
  { label: 'Yesterday',       value: 'yesterday'  },
  { label: 'This Week',       value: 'week'       },
  { label: 'Pay Period',      value: 'pay-period' },
  { label: 'MTD',             value: 'month'      },
  { label: 'YTD',             value: 'ytd'        },
  { label: 'Custom',          value: 'custom'     },
] as const;

export const COMPARISON_OPTIONS = [
  { label: 'vs Prev Period', value: 'prev-period' },
  { label: 'vs Last Year',   value: 'last-year'  },
  { label: 'vs Budget',      value: 'budget'     },
  { label: 'vs Forecast',    value: 'forecast'   },
] as const;

export const PAY_PERIOD_OPTIONS = [
  { label: 'Apr 7 – Apr 20 (Current)',   value: 'current'  },
  { label: 'Mar 24 – Apr 6',             value: 'prev-1'   },
  { label: 'Mar 10 – Mar 23',            value: 'prev-2'   },
] as const;
