import { NextResponse } from 'next/server';
import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonError(422, 'Invalid request');
  }

  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/onboarding/application',
    body,
  });

  if (!result.ok) {
    const message =
      result.json && typeof result.json === 'object'
        ? ((result.json as { message?: unknown }).message ?? 'Unable to submit onboarding')
        : 'Unable to submit onboarding';
    return NextResponse.json({ message }, { status: result.status });
  }

  return NextResponse.json(result.json, { status: 200 });
}
