import { NextResponse } from 'next/server';
import { GetVendorSpendResponseSchema } from '@hos/shared';
import { queryVendorSpends } from '@/lib/server/query-assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const vendors = await queryVendorSpends();
  const body = GetVendorSpendResponseSchema.parse({ vendors });
  return NextResponse.json(body);
}
