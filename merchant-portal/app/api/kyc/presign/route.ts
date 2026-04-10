import { NextResponse } from 'next/server';
import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonError(422, 'Invalid request');
  }

  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/kyc/presign',
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ message: 'Unable to prepare upload' }, { status: result.status });
  }

  return NextResponse.json(result.json, { status: 200 });
}

