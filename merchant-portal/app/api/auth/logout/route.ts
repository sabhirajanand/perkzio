import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/backend';

export async function POST() {
  // Best-effort backend signout.
  await proxyToBackend({ method: 'POST', path: '/v1/auth/logout' }).catch(() => null);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'mp_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
