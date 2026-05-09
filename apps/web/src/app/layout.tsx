import type { Metadata } from 'next';
import { AnalyticsGate } from '@/components/common/AnalyticsGate';
import './globals.css';

export const metadata: Metadata = {
  title: 'HOS Management',
  description: 'Hotel operations platform for HOS Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        {children}
        <AnalyticsGate />
      </body>
    </html>
  );
}
