import { notFound } from 'next/navigation';
import { HOTELS } from '@hos/shared';
import { FrontDeskShell } from './FrontDeskShell';

interface Props { params: Promise<{ hotelCode: string }>; children: React.ReactNode }

export default async function FrontDeskLayout({ params, children }: Props) {
  const { hotelCode } = await params;
  const code = hotelCode.toUpperCase();
  const hotel = HOTELS.find((h) => h.code === code);
  if (!hotel) notFound();

  return (
    <FrontDeskShell hotelCode={hotel.code} hotelName={hotel.name} hotelCity={hotel.city} hotelState={hotel.state}>
      {children}
    </FrontDeskShell>
  );
}
