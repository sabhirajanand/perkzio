'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, Settings, SwitchCamera, ChevronDown, LogOut } from 'lucide-react';

import Button from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type MerchantMeResponse =
  | { ok: true; user?: { email?: string | null }; merchant?: { primaryBusinessEmail?: string | null } }
  | { ok?: false; message?: string };

function TopTab({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        'relative px-2 py-1 text-sm font-semibold text-zinc-700 hover:text-zinc-900',
        isActive ? 'text-primary' : '',
      )}
    >
      {label}
      {isActive ? <span className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-primary" /> : null}
    </Link>
  );
}

export default function TopNavBar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('mp_profile_email') ?? '';
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const e = email.trim();
    if (!e) return 'MP';
    const beforeAt = e.split('@')[0] ?? '';
    const parts = beforeAt.split(/[._-]+/g).filter(Boolean);
    const a = parts[0]?.[0] ?? beforeAt[0] ?? 'M';
    const b = parts[1]?.[0] ?? beforeAt[1] ?? 'P';
    return `${a}${b}`.toUpperCase();
  }, [email]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/merchant/me', { method: 'GET' })
      .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as MerchantMeResponse | null) : null))
      .then((json) => {
        if (cancelled) return;
        const nextEmail =
          json && typeof json === 'object'
            ? (typeof (json as { user?: { email?: unknown } }).user?.email === 'string'
                ? String((json as { user?: { email?: unknown } }).user?.email ?? '')
                : String((json as { merchant?: { primaryBusinessEmail?: unknown } }).merchant?.primaryBusinessEmail ?? ''))
            : '';
        setEmail(nextEmail);
        if (typeof window !== 'undefined') {
          if (nextEmail) window.sessionStorage.setItem('mp_profile_email', nextEmail);
        }
      })
      .catch(() => {
        if (!cancelled) setEmail('');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!profileOpen) return;
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1024px] items-center gap-4 px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link href="/dashboard" className="inline-flex md:hidden">
            <Image src="/Images/logo.png" alt="Perkzio" width={132} height={32} priority className="h-8 w-auto" />
          </Link>

          <div className="hidden w-[280px] items-center gap-2 rounded-full bg-[#F3F4F6] px-4 py-2 md:flex">
            <Search className="h-4 w-4 text-zinc-500" aria-hidden />
            <input
              aria-label="Search"
              placeholder="Search analytics..."
              className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 outline-none"
            />
          </div>

          <nav className="hidden items-center gap-4 md:flex">
            <TopTab href="/analytics" label="Analytics" />
            <TopTab href="/reports" label="Reports" />
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="secondary"
            className="bg-zinc-900 !text-white hover:bg-zinc-700"
            onClick={() => null}
          >
            <SwitchCamera className="mr-2 h-4 w-4 text-white" aria-hidden />
            Switch Branch
          </Button>

          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
          >
            <Bell className="h-5 w-5" aria-hidden />
          </button>

          <Link
            href="/settings"
            aria-label="Settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
          >
            <Settings className="h-5 w-5" aria-hidden />
          </Link>

          <div className="relative" ref={containerRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="inline-flex items-center gap-3 rounded-full bg-white px-3 py-2 ring-1 ring-black/5 hover:bg-zinc-50"
            >
              <span className="hidden max-w-[220px] text-right md:block">
                <span className="block truncate text-sm font-semibold text-zinc-900">{email || 'Merchant'}</span>
                <span className="block truncate text-xs text-zinc-500">Merchant</span>
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                {initials}
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                <Link href="/settings" className="block px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
                  Settings
                </Link>
                <form action="/api/auth/logout" method="post" className="border-t border-black/5">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Logout
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

