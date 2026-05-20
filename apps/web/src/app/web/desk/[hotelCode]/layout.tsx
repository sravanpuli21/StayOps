import { notFound } from 'next/navigation';
import { db, getHosTenantId } from '@/lib/db/client';
import { DeskShell } from './DeskShell';

interface Props {
  params: Promise<{ hotelCode: string }>;
  children: React.ReactNode;
}

/**
 * Front-desk persona layout — same shape as `harshal` / `kris`: LeftNav +
 * TopBar, but the hotel is locked to the URL segment. No global hotel
 * filter, no date filter — the kiosk PC's bookmark pins the property.
 */
export default async function DeskLayout({ params, children }: Props) {
  const { hotelCode } = await params;
  const code = hotelCode.toUpperCase();

  const tenantId = await getHosTenantId();
  if (!tenantId) notFound();
  const [hotel] = await db<{ name: string; code: string; city: string; state: string; brand: string; rooms: number }[]>`
    select name, code, city, state, brand, total_rooms as rooms
      from hotels
     where tenant_id = ${tenantId} and code = ${code}
     limit 1
  `;
  if (!hotel) notFound();

  return (
    <DeskShell
      hotelCode={hotel.code}
      hotelName={hotel.name}
      hotelCity={hotel.city}
      hotelState={hotel.state}
      hotelBrand={hotel.brand}
      hotelRooms={hotel.rooms}
    >
      {children}
    </DeskShell>
  );
}
