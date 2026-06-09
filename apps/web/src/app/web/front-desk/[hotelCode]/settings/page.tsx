import { HOTELS } from '@hos/shared';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  const code = hotelCode.toUpperCase();
  const hotel = HOTELS.find((h) => h.code === code);
  return <SettingsClient hotelCode={code} hotelName={hotel?.name ?? code} />;
}
