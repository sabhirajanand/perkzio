import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const result = await proxyToBackend({
    method: 'GET',
    path: '/v1/platform/auth/me',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!result.ok) {
    return jsonError(result.status, 'Unable to fetch session');
  }

  return NextResponse.json({ authenticated: true, ...(result.json as object) });
}

