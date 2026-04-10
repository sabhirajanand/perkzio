import { NextResponse } from 'next/server';
import { merchantLoginSchema } from '@/lib/schemas/auth';
import { jsonError, proxyToBackend } from '@/app/api/_lib/backend';

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = merchantLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid request', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const result = await proxyToBackend({
    method: 'POST',
    path: '/v1/auth/merchant/login',
    body: { role: parsed.data.role, email: parsed.data.email, password: parsed.data.password },
  });

  if (!result.ok) {
    return jsonError(result.status, 'Invalid credentials');
  }

  const token =
    result.json && typeof result.json === 'object'
      ? (result.json as { token?: unknown; session?: unknown; sessionToken?: unknown }).token ??
        (result.json as { token?: unknown; session?: unknown; sessionToken?: unknown }).sessionToken ??
        (result.json as { token?: unknown; session?: unknown; sessionToken?: unknown }).session
      : null;

  if (typeof token !== 'string' || !token) {
    return jsonError(502, 'Auth service did not return a session token');
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'mp_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });
  res.cookies.set({
    name: 'mp_role',
    value: parsed.data.role,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });
  return res;
}
