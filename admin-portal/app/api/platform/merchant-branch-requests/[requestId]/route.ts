import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/merchant-branch-requests/${requestId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch branch request');
  return NextResponse.json(result.json);
}

