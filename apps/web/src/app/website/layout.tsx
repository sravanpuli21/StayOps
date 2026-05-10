import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import { SiteNav } from './_components/SiteNav';
import { SiteFooter } from './_components/SiteFooter';
import './website.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'StayOps — Your occupancy is not your profit.',
    template: '%s — StayOps',
  },
  description:
    'StayOps shows hotel owners exactly how much Booking.com, Expedia, and Agoda are taking — in dollars. Built by operators, for operators.',
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${instrumentSerif.variable} stayops-theme min-h-screen flex flex-col`}>
      <SiteNav />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
