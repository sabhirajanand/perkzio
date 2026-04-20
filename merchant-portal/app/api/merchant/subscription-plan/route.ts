import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function PATCH(req: Request) {
  const headers = await getMerchantAuthHeader();
  if (!headers) return jsonError(401, 'Unauthenticated');

  const raw = await req.json().catch(() => null);
  const result = await proxyToBackend({
    method: 'PATCH',
    path: '/v1/merchant/subscription-plan',
    body: raw ?? {},
    headers,
  });
  if (!result.ok) return jsonError(result.status, 'Unable to update subscription plan');
  return NextResponse.json(result.json);
}

