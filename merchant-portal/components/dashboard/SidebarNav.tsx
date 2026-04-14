'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/customers' },
  { label: 'Offers', href: '/offers' },
  { label: 'Loyalty cards', href: '/loyalty-cards' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Reports', href: '/reports' },
  { label: 'History & logs', href: '/history' },
  { label: 'Profile & settings', href: '/settings' },
  { label: 'Tickets', href: '/tickets' },
  { label: 'Subscription & billing', href: '/billing' },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [merchantStatus, setMerchantStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/merchant/me', { method: 'GET' })
      .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as unknown) : null))
      .then((json) => {
        if (cancelled) return;
        const status =
          json && typeof json === 'object'
            ? String((json as { merchant?: { status?: unknown } }).merchant?.status ?? '')
            : '';
        setMerchantStatus(status || null);
      })
      .catch(() => {
        if (!cancelled) setMerchantStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (merchantStatus === 'ACTIVE' || merchantStatus === null) return NAV_ITEMS;
    return NAV_ITEMS.filter((i) => i.href === '/dashboard' || i.href === '/settings');
  }, [merchantStatus]);

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
              isActive
                ? 'border border-[#F11E69] bg-white text-zinc-900 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.30)]'
                : 'border border-transparent text-[#4B5563] hover:bg-zinc-50 hover:text-zinc-900',
            )}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

