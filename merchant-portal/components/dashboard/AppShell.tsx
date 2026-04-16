import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import SidebarNav from '@/components/dashboard/SidebarNav';
import TopNavBar from '@/components/dashboard/TopNavBar';

export interface AppShellProps {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col space-y-2 bg-white/60 py-8 shadow-2xl shadow-rose-900/5 backdrop-blur-2xl md:flex">
        <div className="mb-10 px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <Image src="/Images/icon.png" alt="Perkzio" width={28} height={28} priority className="h-7 w-7 rounded-full" />
            <div>
              <h1 className="font-headline text-lg font-black uppercase tracking-widest text-slate-900">Perkzio</h1>
              <p className="mt-1 text-[10px] font-bold tracking-widest text-primary-brand/80">PREMIUM MERCHANT</p>
            </div>
          </Link>
        </div>
        <SidebarNav />
      </aside>

      <TopNavBar />

      <main className="ml-0 min-h-screen bg-surface pt-16 md:ml-64">
        <div className="mx-auto max-w-7xl px-10 py-12">{children}</div>
      </main>
    </div>
  );
}
