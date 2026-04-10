import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET(_req: Request, ctx: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'GET',
    path: `/v1/platform/staff/${staffId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch staff user');
  return NextResponse.json(result.json);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = await proxyToBackend({
    method: 'PATCH',
    path: `/v1/platform/staff/${staffId}`,
    headers: await getAdminAuthHeader(),
    body,
  });
  if (!result.ok) return jsonError(result.status, 'Unable to update staff user');
  return NextResponse.json(result.json);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await ctx.params;
  const result = await proxyToBackend({
    method: 'DELETE',
    path: `/v1/platform/staff/${staffId}`,
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to delete staff user');
  return NextResponse.json(result.json);
}

