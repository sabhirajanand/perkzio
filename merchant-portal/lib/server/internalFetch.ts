import { headers } from 'next/headers';

/**
 * Server Components must call internal `/api/*` routes with the incoming Cookie header;
 * otherwise the Route Handler sees no session and returns 401.
 */
export async function fetchInternalApi(pathAndQuery: string): Promise<Response | null> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return null;

  const forwardedProto = h.get('x-forwarded-proto');
  const proto =
    forwardedProto ?? (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');

  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  const url = `${proto}://${host}${path}`;
  const cookie = h.get('cookie');

  return fetch(url, {
    cache: 'no-store',
    headers: cookie ? { Cookie: cookie } : {},
  }).catch(() => null);
}
