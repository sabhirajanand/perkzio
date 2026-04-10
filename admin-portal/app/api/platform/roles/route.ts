import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getAdminAuthHeader } from '@/app/api/platform/_lib/authHeader';

export async function GET() {
  const result = await proxyToBackend({
    method: 'GET',
    path: '/v1/platform/roles',
    headers: await getAdminAuthHeader(),
  });
  if (!result.ok) return jsonError(result.status, 'Unable to fetch roles');
  return NextResponse.json(result.json);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/platform/roles',
    headers: await getAdminAuthHeader(),
    body,
  });
  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object' && 'message' in (result.json as object)
        ? String((result.json as { message?: unknown }).message ?? 'Unable to create role')
        : 'Unable to create role';
    return jsonError(result.status, message);
  }
  return NextResponse.json(result.json, { status: result.status });
}

