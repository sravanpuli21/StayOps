import { mutate } from 'swr';
import { apiKeys } from '@/lib/swr-keys';
import type { ServiceRequest } from './_store';

/**
 * Bridge a front-desk Service Request into the shared ticket store
 * (Neon DB via /api/ops/tickets) routed to Housekeeping — so it shows up in the
 * Housekeeping supervisor's queue (Emma web: tickets, dashboard, rooms). Service
 * requests always route to Housekeeping with source=front-desk.
 *
 * Best-effort: a network/API failure never breaks the local front-desk flow.
 * Multiple line items ride along as `items` ({ category, item, quantity }).
 */
export async function pushServiceRequestToHousekeeping(sr: ServiceRequest): Promise<string | null> {
  const priority = sr.priority.toLowerCase() as 'low' | 'normal' | 'high' | 'urgent';
  const first = sr.items[0];
  const more = sr.items.length > 1 ? ` +${sr.items.length - 1} more` : '';
  const title = first ? `${first.qty}× ${first.name}${more}` : 'Guest service request';

  try {
    const res = await fetch('/api/ops/tickets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hotelCode: sr.hotelCode,
        roomNumber: sr.roomNumber || undefined,
        area: sr.roomNumber ? undefined : (sr.exactLocation || sr.locationType || undefined),
        type: 'reactive',
        priority,
        title,
        description: sr.overallDetails || sr.items.map((i) => `${i.qty}× ${i.name}`).join(', ') || undefined,
        reportedBy: `Front Desk${sr.requestedBy && sr.requestedBy !== 'Front desk' ? ` (for ${sr.requestedBy})` : ''}`,
        department: 'Housekeeping',
        requestType: 'Service Request',
        callbackRequired: false,
        items: sr.items.map((i) => ({ category: 'Guest Request', item: i.name, quantity: i.qty })),
      }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.ok) return null;

    // Refresh the housekeeping supervisor's lists so it appears without a reload.
    mutate(apiKeys.opsTicketsAll(sr.hotelCode)[0]);
    mutate(apiKeys.opsTickets(sr.hotelCode)[0]);
    return (j.ticket?.id as string) ?? null;
  } catch {
    return null;
  }
}
