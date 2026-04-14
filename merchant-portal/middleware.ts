import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/customers',
  '/offers',
  '/loyalty-cards',
  '/campaigns',
  '/analytics',
  '/reports',
  '/history',
  '/settings',
  '/tickets',
  '/billing',
];

const UNLOCKED_PREFIXES = ['/dashboard', '/settings'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get('mp_session')?.value);
  if (hasSession) {
    const token = req.cookies.get('mp_session')?.value ?? '';
    if (UNLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.next();
    }
    // If merchant isn't approved yet, lock everything except dashboard + settings.
    return fetch(new URL('/v1/merchant/me', process.env.API_BASE_URL ?? 'http://localhost:4000').toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const json = await r.json().catch(() => null);
        const status =
          json && typeof json === 'object' && 'merchant' in (json as object)
            ? String(((json as { merchant?: { status?: unknown } }).merchant?.status ?? ''))
            : '';
        if (status === 'ACTIVE') return NextResponse.next();
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      })
      .catch(() => NextResponse.next());
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/offers/:path*',
    '/loyalty-cards/:path*',
    '/campaigns/:path*',
    '/analytics/:path*',
    '/reports/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/tickets/:path*',
    '/billing/:path*',
  ],
};

