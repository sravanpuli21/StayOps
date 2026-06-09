import { redirect } from 'next/navigation';

export default async function FrontDeskIndex({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  redirect(`/web/front-desk/${hotelCode}/home`);
}
