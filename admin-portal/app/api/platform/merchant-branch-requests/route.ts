import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const suffix = url.search ? url.search : '';

  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/merchant-branch-requests${suffix}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) {
    const msg =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message)
        : 'Unable to fetch branch requests';
    return jsonError(result.status, msg);
  }
  return NextResponse.json(result.json);
}

