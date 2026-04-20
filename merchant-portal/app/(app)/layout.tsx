import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/components/dashboard/AppShell';
import { fetchInternalApi } from '@/lib/server/internalFetch';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('mp_session')?.value;
  if (!session) redirect('/login');

  const meRes = await fetchInternalApi('/api/merchant/me');
  if (!meRes || meRes.status === 401 || meRes.status === 403) {
    redirect('/api/auth/logout');
  }

  return <AppShell>{children}</AppShell>;
}

