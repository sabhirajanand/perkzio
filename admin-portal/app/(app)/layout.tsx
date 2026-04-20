import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/components/app/AppShell';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value;
  if (!token) redirect('/admin/login');

  const session = await readServerSession();
  if (!session?.authenticated) {
    redirect('/api/platform/auth/logout');
  }
  return <AppShell>{children}</AppShell>;
}

