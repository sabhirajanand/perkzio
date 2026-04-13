'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
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

