'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, LayoutGrid, LifeBuoy, Lock, Megaphone, Store, Tag, Users } from 'lucide-react';

import type { MerchantRole } from '@/lib/schemas/auth';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When true, show read-only lock until merchant.status is ACTIVE. */
  requiresActiveMerchant: boolean;
  /** If set, only these roles see the item (e.g. head-merchant-only Branches). */
  visibleForRoles?: MerchantRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, requiresActiveMerchant: false },
  { label: 'Customers', href: '/customers', icon: Users, requiresActiveMerchant: true },
  { label: 'Loyalty cards', href: '/loyalty-cards', icon: CreditCard, requiresActiveMerchant: true },
  { label: 'Campaigns', href: '/campaigns', icon: Megaphone, requiresActiveMerchant: true },
  { label: 'Offers', href: '/offers', icon: Tag, requiresActiveMerchant: true },
  {
    label: 'Branches',
    href: '/branches',
    icon: Store,
    requiresActiveMerchant: true,
    visibleForRoles: ['MERCHANT_ADMIN'],
  },
  { label: 'Support', href: '/support', icon: LifeBuoy, requiresActiveMerchant: true },
];

function parseViewerRole(json: unknown): MerchantRole | null {
  if (!json || typeof json !== 'object') return null;
  const role = (json as { user?: { role?: unknown } }).user?.role;
  return role === 'MERCHANT_ADMIN' || role === 'BRANCH_ADMIN' ? role : null;
}

export default function SidebarNav() {
  const pathname = usePathname();
  const [merchantStatus, setMerchantStatus] = useState<string | null | undefined>(undefined);
  const [viewerRole, setViewerRole] = useState<MerchantRole | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/merchant/me')
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json().catch(() => null)) as unknown;
      })
      .then((json) => {
        if (cancelled) return;
        const s =
          json && typeof json === 'object'
            ? (json as { merchant?: { status?: unknown } }).merchant?.status
            : undefined;
        setMerchantStatus(typeof s === 'string' ? s : null);
        setViewerRole(parseViewerRole(json));
      })
      .catch(() => {
        if (!cancelled) {
          setMerchantStatus(null);
          setViewerRole(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.visibleForRoles?.length) return true;
      if (viewerRole === undefined) return false;
      if (viewerRole === null) return false;
      return item.visibleForRoles.includes(viewerRole);
    });
  }, [viewerRole]);

  return (
    <nav className="flex-1 space-y-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const readOnlyBadge =
          item.requiresActiveMerchant &&
          merchantStatus !== undefined &&
          merchantStatus !== null &&
          merchantStatus !== 'ACTIVE';

        return (
          <Link
            key={item.href}
            href={item.href}
            title={readOnlyBadge ? 'Read-only until your business is approved' : undefined}
            className={cn(
              'relative mx-4 flex items-center rounded-full px-6 py-3 transition-all duration-300',
              isActive
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 ease-out'
                : 'text-slate-600 hover:translate-x-1 hover:bg-rose-50',
              readOnlyBadge && 'opacity-[0.88]',
            )}
          >
            {readOnlyBadge ? (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-white/35 ring-1 ring-black/[0.06]"
                aria-hidden
              />
            ) : null}
            <Icon
              className={cn(
                'relative z-[1] mr-3 h-5 w-5 shrink-0',
                isActive ? 'text-white' : 'text-slate-600',
              )}
              aria-hidden
            />
            <span className="relative z-[1] min-w-0 flex-1 font-headline text-sm font-medium">{item.label}</span>
            {readOnlyBadge ? (
              <Lock
                className={cn(
                  'relative z-[1] ml-2 h-4 w-4 shrink-0',
                  isActive ? 'text-white/90' : 'text-slate-500',
                )}
                strokeWidth={2}
                aria-hidden
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
