import { NextResponse } from 'next/server';

import { proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function PATCH(req: Request, { params }: { params: Promise<{ branchId: string }> }) {
  const auth = await getMerchantAuthHeader();
  if (!auth) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { branchId } = await params;
  const body = (await req.json().catch(() => null)) as unknown;
  const result = await proxyToBackend({
    method: 'PATCH',
    path: `/v1/merchant/branches/${branchId}`,
    headers: auth,
    body,
  });

  return NextResponse.json(result.json, { status: result.status });
}

