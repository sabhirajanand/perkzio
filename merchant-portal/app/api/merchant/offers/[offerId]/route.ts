import { NextResponse } from 'next/server';

import { proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ offerId: string }> }) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { offerId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/merchant/offers/${offerId}`,
    headers: auth,
  });

  return NextResponse.json(result.json, { status: result.status });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ offerId: string }> }) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { offerId } = await ctx.params;
  const body = (await req.json().catch(() => null)) as unknown;
  const result = await proxyToBackend({
    method: 'PATCH',
    path: `/v1/merchant/offers/${offerId}`,
    headers: auth,
    body,
  });

  return NextResponse.json(result.json, { status: result.status });
}

