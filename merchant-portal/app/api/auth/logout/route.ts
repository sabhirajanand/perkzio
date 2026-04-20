import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/backend';

export async function GET(req: Request) {
  // Best-effort backend signout.
  await proxyToBackend({ method: 'POST', path: '/v1/auth/logout' }).catch(() => null);

  const res = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  res.cookies.set({
    name: 'mp_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.cookies.set({
    name: 'mp_role',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export async function POST(req: Request) {
  // Best-effort backend signout.
  await proxyToBackend({ method: 'POST', path: '/v1/auth/logout' }).catch(() => null);

  const res = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  res.cookies.set({
    name: 'mp_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.cookies.set({
    name: 'mp_role',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
