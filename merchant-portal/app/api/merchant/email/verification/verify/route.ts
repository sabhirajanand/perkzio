import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function POST(req: Request) {
  const headers = await getMerchantAuthHeader();
  if (!headers) return jsonError(401, 'Unauthenticated');

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError(422, 'Invalid request');

  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/merchant/email/verification/verify',
    headers,
    body,
  });

  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object'
        ? ((result.json as { message?: unknown }).message ?? 'Unable to verify email')
        : 'Unable to verify email';
    return NextResponse.json({ message }, { status: result.status });
  }

  return NextResponse.json(result.json, { status: 200 });
}

