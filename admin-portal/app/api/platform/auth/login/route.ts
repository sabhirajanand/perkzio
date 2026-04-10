import { NextResponse } from 'next/server';

import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';
import { adminLoginSchema } from '@/lib/schemas/adminAuth';

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/platform/auth/login',
    body: { email: parsed.data.email, password: parsed.data.password },
  });

  if (!result.ok) {
    return jsonError(result.status, 'Invalid credentials');
  }

  const token =
    result.json && typeof result.json === 'object'
      ? (result.json as { token?: unknown }).token
      : null;

  if (typeof token !== 'string' || !token) {
    return jsonError(502, 'Auth service did not return a session token');
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'ap_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8,
  });
  return res;
}

