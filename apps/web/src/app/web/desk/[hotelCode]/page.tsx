import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ hotelCode: string }>;
}

/** /web/desk/<code> → /web/desk/<code>/home (tools open, no login). */
export default async function DeskRootRedirect({ params }: Props) {
  const { hotelCode } = await params;
  redirect(`/web/desk/${hotelCode.toUpperCase()}/home`);
}
