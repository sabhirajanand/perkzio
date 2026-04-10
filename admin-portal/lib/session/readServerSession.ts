import { cookies } from 'next/headers';

import { proxyToBackend } from '@/app/api/_lib/backend';

export interface ServerAdminSession {
  authenticated: boolean;
  userType?: 'ADMIN' | 'SUPERADMIN';
  staff?: { id: string; roleId: string | null; permissions: string[] };
}

export async function readServerSession(): Promise<ServerAdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value;
  if (!token) return null;

  const result = await proxyToBackend({
    method: 'GET',
    path: '/v1/platform/auth/me',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!result.ok) return null;

  return { authenticated: true, ...(result.json as object) } as ServerAdminSession;
}

