import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/components/dashboard/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get('mp_session')?.value;
  if (!session) redirect('/login');

  return <AppShell title="Dashboard">{children}</AppShell>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
