import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function PATCH(req: Request, ctx: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = await proxyToBackend({
    method: 'PATCH',
    path: `/v1/platform/merchant-applications/${applicationId}`,
    headers: await getAdminAuthHeader(),
    body,
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to update application')
        : 'Unable to update application';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}

