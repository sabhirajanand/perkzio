import type { ServerAdminSession } from '@/lib/session/readServerSession';

export function hasPermission(session: ServerAdminSession | null, permission: string): boolean {
  if (!session?.authenticated) return false;
  if (session.userType === 'SUPERADMIN') return true;
  return Boolean(session.staff?.permissions?.includes(permission));
}

