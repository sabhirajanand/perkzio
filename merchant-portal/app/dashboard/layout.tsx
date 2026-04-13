import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/components/dashboard/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('mp_session')?.value;
  if (!session) redirect('/login');

  return <AppShell title="Dashboard">{children}</AppShell>;
}
