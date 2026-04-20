import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/branches/${branchId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch branch');
  return NextResponse.json(result.json);
}

