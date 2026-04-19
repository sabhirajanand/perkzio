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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get('mp_session')?.value);
  if (hasSession) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers',
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
