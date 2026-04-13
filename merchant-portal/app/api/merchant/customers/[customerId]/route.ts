import { NextResponse } from 'next/server';

import { proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ customerId: string }> }) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { customerId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/merchant/customers/${customerId}`,
    headers: auth,
  });

  return NextResponse.json(result.json, { status: result.status });
}

