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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col bg-white shadow-[0_25px_50px_-25px_rgba(0,0,0,0.35)] md:flex">
          <div className="border-b border-[#E7E7E7] px-5 py-5">
            <Link href="/dashboard" className="inline-flex w-full items-center justify-center">
              <Image src="/Images/logo.png" alt="Perkzio" width={170} height={48} priority className="h-auto w-[170px]" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <SidebarNav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavBar />

          <main className="mx-auto w-full max-w-[1024px] px-8 pb-12 pt-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
