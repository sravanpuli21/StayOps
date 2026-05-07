'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Wrench,
  Building2,
  UserCheck,
  Bell,
  Target,
  Settings,
  ClipboardList,
  Sparkles,
  Printer,
  Calendar,
  CalendarCheck,
  BookOpen,
  Clock,
  Timer,
  UserCircle,
  Bed,
  LucideIcon,
} from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  DollarSign,
  Users,
  Wrench,
  Building2,
  UserCheck,
  Bell,
  Target,
  Settings,
  ClipboardList,
  Sparkles,
  Printer,
  Calendar,
  CalendarCheck,
  BookOpen,
  Clock,
  Timer,
  UserCircle,
  Bed,
};

interface LeftNavProps {
  navItems?: readonly NavItem[];
  footerName?: string;
  footerTitle?: string;
}

export function LeftNav({
  navItems = NAV_ITEMS,
  footerName = 'Kris Patel',
  footerTitle = 'Managing Director',
}: LeftNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className="no-print w-64 h-full flex flex-col flex-shrink-0"
      style={{ background: '#ffffff', borderRight: '1px solid #dddddd' }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center flex-shrink-0 overflow-hidden"
        style={{ borderBottom: '1px solid #dddddd' }}
      >
        <img
          src="/hos-logo.png"
          alt="HOS Management"
          className="w-full h-full object-contain object-left"
        />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'text-brand'
                  : 'hover:bg-[#f7f7f7]',
              )}
              style={{
                color: isActive ? '#ff385c' : '#6a6a6a',
                background: isActive ? 'rgba(255,56,92,0.08)' : undefined,
              }}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid #dddddd' }}
      >
        <p className="text-xs font-medium" style={{ color: '#6a6a6a' }}>{footerName}</p>
        <p className="text-xs" style={{ color: '#c1c1c1' }}>{footerTitle}</p>
      </div>
    </aside>
  );
}
