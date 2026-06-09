import { NewRequestClient } from '@/app/web/desk/[hotelCode]/requests/new/NewRequestClient';

/**
 * Front Desk Access → New Work Order. Reuses the polished desk request flow
 * (location-type cards → visual room grid → clean dropdown form, posting to the
 * shared maintenance ticket API), but rendered INSIDE the Front Desk Access
 * shell with its back/success links pointing back to the front desk home.
 */
export default async function NewWorkOrderPage({ params }: { params: Promise<{ hotelCode: string }> }) {
  const { hotelCode } = await params;
  const code = hotelCode.toUpperCase();
  return (
    <NewRequestClient
      hotelCode={code}
      initialType="work-order"
      initialRoom=""
      initialArea=""
      homeHref={`/web/front-desk/${code}/home`}
      homeLabel="Front Desk"
    />
  );
}
