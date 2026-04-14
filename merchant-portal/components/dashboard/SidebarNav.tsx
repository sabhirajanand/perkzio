'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, Users, CreditCard, Megaphone, Tag, Store, LifeBuoy } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Loyalty cards', href: '/loyalty-cards', icon: CreditCard },
  { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { label: 'Offers', href: '/offers', icon: Tag },
  { label: 'Branches', href: '/branches', icon: Store },
  { label: 'Support', href: '/support', icon: LifeBuoy },
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
    return NAV_ITEMS.filter((i) => i.href === '/dashboard');
  }, [merchantStatus]);

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#FDF2F8] text-primary'
                : 'text-zinc-900 hover:bg-zinc-50',
            )}
          >
            {isActive ? <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" /> : null}
            <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-zinc-900')} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

