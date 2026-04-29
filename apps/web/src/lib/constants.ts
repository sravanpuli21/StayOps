export const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/web/kirit/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Intelligence', href: '/web/kirit/intelligence', icon: 'Sparkles'        },
  { label: 'Revenue',      href: '/web/kirit/revenue',      icon: 'DollarSign'      },
  { label: 'Labour',     href: '/web/kirit/labour',      icon: 'Users'           },
  { label: 'Operations', href: '/web/kirit/operations',  icon: 'Wrench'          },
  { label: 'Audits',     href: '/web/kirit/audits',      icon: 'ClipboardList'   },
  { label: 'Assets',     href: '/web/kirit/assets',      icon: 'Building2'       },
  { label: 'Leaders',    href: '/web/kirit/leaders',     icon: 'UserCheck'       },
  { label: 'Alerts',     href: '/web/kirit/alerts',      icon: 'Bell'            },
  { label: 'Strategy',   href: '/web/kirit/strategy',    icon: 'Target'          },
  { label: 'Settings',   href: '/web/kirit/settings',    icon: 'Settings'        },
] as const;

export const DATE_RANGE_OPTIONS = [
  { label: 'Today',           value: 'today'      },
  { label: 'Yesterday',       value: 'yesterday'  },
  { label: 'This Week',       value: 'week'       },
  { label: 'This Month',      value: 'month'      },
  { label: 'Pay Period',      value: 'pay-period' },
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
