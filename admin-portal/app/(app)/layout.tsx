import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/components/app/AppShell';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value;
  if (!token) redirect('/admin/login');
  return <AppShell>{children}</AppShell>;
}

