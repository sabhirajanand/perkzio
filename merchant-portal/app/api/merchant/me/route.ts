import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function GET() {
  const headers = await getMerchantAuthHeader();
  if (!headers) return jsonError(401, 'Unauthenticated');

  const result = await proxyToBackend({
    method: 'GET',
    path: '/v1/merchant/me',
    headers,
  });
  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      const res = jsonError(result.status, 'Unauthenticated');
      res.cookies.set({ name: 'mp_session', value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set({ name: 'mp_role', value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
      return res;
    }
    return jsonError(result.status, 'Unable to fetch merchant');
  }
  return NextResponse.json(result.json);
}

