import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function GET() {
  const headers = await getMerchantAuthHeader();
  if (!headers) return jsonError(401, 'Unauthenticated');

  const result = await proxyToBackend({
    method: 'GET',
    path: '/v1/merchant/me',
    headers,
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch merchant');
  return NextResponse.json(result.json);
}

