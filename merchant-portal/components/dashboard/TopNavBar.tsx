'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react';

type MerchantMeResponse =
  | { ok: true; user?: { email?: string | null }; merchant?: { primaryBusinessEmail?: string | null } }
  | { ok?: false; message?: string };

function segmentLabel(segment: string): string {
  if (!segment) return '';
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    customers: 'Customers',
    'loyalty-cards': 'Loyalty cards',
    campaigns: 'Campaigns',
    offers: 'Offers',
    branches: 'Branches',
    support: 'Support',
    settings: 'Profile & settings',
  };
  if (segment in map) return map[segment]!;
  return segment.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TopNavBar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('mp_profile_email') ?? '';
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const breadcrumbs = useMemo(() => {
    const clean = (pathname || '/').split('?')[0]!.split('#')[0]!;
    const parts = clean.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; href: string }> = [];
    let acc = '';
    for (const p of parts) {
      acc += `/${p}`;
      crumbs.push({ label: segmentLabel(p), href: acc });
    }
    return crumbs.length ? crumbs : [{ label: 'Dashboard', href: '/dashboard' }];
  }, [pathname]);

  const title = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Dashboard';

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-white/80 px-8 shadow-sm shadow-rose-900/5 backdrop-blur-xl md:left-64">
      <div className="flex items-center space-x-2">
        <span className="font-headline text-sm font-semibold text-on-surface">{title}</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="h-6 w-px bg-outline/10" />

        <button
          type="button"
          aria-label="Notifications"
          className="relative text-on-surface/70 transition-colors hover:text-primary-brand"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-primary-brand" />
        </button>

        <div className="relative" ref={containerRef}>
          <button type="button" onClick={() => setProfileOpen((v) => !v)} className="relative">
            <span className="sr-only">Open profile menu</span>
            <Image
              alt="Business Owner Avatar"
              className="h-8 w-8 rounded-full ring-2 ring-primary-brand/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHCmNAO9iFds2nRip1KfpfRZnK9z1B8X2y1sefR30fAfPgfg8ZUBLkmJd51rINcMhJZAQNYklonhTtu-BMHNGEwfI9fDmDg7QLirIQUAjOapO8hij8fdImSyFLp4YvFeh9YVTcLW6DnkDQOeUTlnCEO5foqZz3YDBfiAwblqgtYzK8xykGt8iaSXNa5DOVLOYyRvDiXTrojrJ7JkIwq9gfGIxBc_B5-4zJuB1r8IAI-9E6nPm10YXOVAB4LsCAtRwNKN22LZkbdgLh"
              width={32}
              height={32}
              unoptimized
              priority
            />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              <div className="px-4 py-3">
                <p suppressHydrationWarning className="truncate text-sm font-semibold text-zinc-900">
                  {email || 'Merchant'}
                </p>
                <p className="truncate text-xs text-zinc-500">Merchant</p>
              </div>
              <div className="border-t border-black/5">
                <Link
                  href="/settings"
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  <Settings className="h-4 w-4 shrink-0" aria-hidden />
                  Settings
                </Link>
              </div>
              <form action="/api/auth/logout" method="post" className="border-t border-black/5">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Logout
                </button>
              </form>
              <div className="border-t border-black/5 px-4 py-2">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
                >
                  <span className="sr-only">Close menu</span>
                  <ChevronDown className="h-4 w-4 rotate-180" aria-hidden />
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

