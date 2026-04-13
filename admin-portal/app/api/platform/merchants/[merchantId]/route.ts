import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/merchants/${merchantId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch merchant');
  return NextResponse.json(result.json);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = await proxyToBackend({
    method: 'PATCH',
    path: `/v1/platform/merchants/${merchantId}`,
    headers: await getAdminAuthHeader(),
    body,
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to update merchant')
        : 'Unable to update merchant';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'DELETE',
    path: `/v1/platform/merchants/${merchantId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to delete merchant')
        : 'Unable to delete merchant';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}

