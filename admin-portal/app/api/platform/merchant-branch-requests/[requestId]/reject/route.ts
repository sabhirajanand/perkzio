import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function POST(req: Request, ctx: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await proxyToBackend({
    method: 'POST',
    path: `/v1/platform/merchant-branch-requests/${requestId}/reject`,
    headers: await getAdminAuthHeader(),
    body,
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to reject branch request')
        : 'Unable to reject branch request';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}
