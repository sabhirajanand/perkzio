import { NextResponse } from 'next/server';

import { proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function GET(req: Request) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const url = new URL(req.url);
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/merchant/branch-requests${url.search}`,
    headers: auth,
  });

  return NextResponse.json(result.json, { status: result.status });
}

export async function POST(req: Request) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as unknown;
  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/merchant/branch-requests',
    headers: auth,
    body,
  });

  return NextResponse.json(result.json, { status: result.status });
}
