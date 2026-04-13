import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function POST(_req: Request, ctx: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'POST',
    path: `/v1/platform/merchant-applications/${applicationId}/reject`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to reject application')
        : 'Unable to reject application';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}

