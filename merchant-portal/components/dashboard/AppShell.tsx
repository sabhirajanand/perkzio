import Link from 'next/link';
import type { ReactNode } from 'react';

import Button from '@/components/ui/button';

export interface AppShellProps {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title = 'Dashboard', children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-black tracking-tight text-zinc-900">
              Perkzio
            </Link>
            <span className="text-sm font-semibold text-zinc-700">{title}</span>
          </div>

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
