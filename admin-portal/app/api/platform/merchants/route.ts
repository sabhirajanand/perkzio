import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.search ? url.search : '';
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/merchants${qs}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch merchants');
  return NextResponse.json(result.json);
}

