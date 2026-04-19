import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/merchants/${merchantId}/branch-requests`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch branch requests');
  return NextResponse.json(result.json);
}
