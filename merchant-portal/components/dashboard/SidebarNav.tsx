'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, LayoutGrid, LifeBuoy, Megaphone, Store, Tag, Users } from 'lucide-react';

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
  const visibleItems = useMemo(() => NAV_ITEMS, []);

  return (
    <nav className="flex-1 space-y-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mx-4 flex items-center rounded-full px-6 py-3 transition-all duration-300',
              isActive
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 ease-out'
                : 'text-slate-600 hover:translate-x-1 hover:bg-rose-50',
            )}
          >
            <Icon className={cn('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-slate-600')} aria-hidden />
            <span className="font-headline text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

