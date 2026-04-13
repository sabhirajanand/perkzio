import type { ReactNode } from 'react';

import AdminSidebarNav, { type AdminSidebarNavSection } from '@/components/app/AdminSidebarNav';
import Button from '@/components/ui/button';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { readServerSession } from '@/lib/session/readServerSession';

export interface AppShellProps {
  title?: string;
  children: ReactNode;
}

type NavVisibility = { type: 'all' } | { type: 'permission'; code: string } | { type: 'superadmin' };

interface NavItem {
  href: string;
  label: string;
  visibility: NavVisibility;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', visibility: { type: 'all' } }],
  },
  {
    label: 'Staff management',
    items: [
      { href: '/roles', label: 'Roles & permissions', visibility: { type: 'permission', code: AdminPermissions.ROLES_LIST } },
      { href: '/staff', label: 'Staff', visibility: { type: 'permission', code: AdminPermissions.ADMIN_USERS_LIST } },
    ],
  },
  {
    label: 'User management',
    items: [
      { href: '/merchants', label: 'Merchants', visibility: { type: 'permission', code: AdminPermissions.MERCHANTS_LIST } },
      {
        href: '/merchants/registrations',
        label: 'Merchant registrations',
        visibility: { type: 'permission', code: AdminPermissions.MERCHANT_APPLICATIONS_LIST },
      },
      { href: '/customers', label: 'Customers', visibility: { type: 'superadmin' } },
    ],
  },
  {
    label: 'Analytics & reports',
    items: [
      { href: '/platform-analytics', label: 'Platform analytics', visibility: { type: 'superadmin' } },
      { href: '/reports', label: 'Reports', visibility: { type: 'superadmin' } },
    ],
  },
  {
    label: 'Audit & logs',
    items: [
      { href: '/history', label: 'History & audit trails', visibility: { type: 'superadmin' } },
      { href: '/logs', label: 'Logs', visibility: { type: 'superadmin' } },
    ],
  },
  {
    label: 'Support',
    items: [{ href: '/tickets', label: 'Support tickets', visibility: { type: 'superadmin' } }],
  },
  {
    label: 'Content',
    items: [{ href: '/cms', label: 'CMS', visibility: { type: 'superadmin' } }],
  },
  {
    label: 'Finance',
    items: [{ href: '/finance', label: 'Finance & billing', visibility: { type: 'superadmin' } }],
  },
  {
    label: 'Growth',
    items: [{ href: '/referrals', label: 'Referral engine', visibility: { type: 'superadmin' } }],
  },
];

export default async function AppShell({ title = 'Admin', children }: AppShellProps) {
  const session = await readServerSession();
  const visibleSections: NavSection[] = NAV_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((i) => {
      if (i.visibility.type === 'all') return Boolean(session?.authenticated);
      if (i.visibility.type === 'superadmin') return session?.userType === 'SUPERADMIN';
      return hasPermission(session, i.visibility.code);
    }),
  })).filter((s) => s.items.length > 0);

  const sidebarSections: AdminSidebarNavSection[] = visibleSections.map((s) => ({
    label: s.label,
    items: s.items.map((i) => ({ href: i.href, label: i.label })),
  }));
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/5 bg-white md:flex md:flex-col">
        <div className="shrink-0 px-6 py-6">
          <div
            className="h-[56px] w-[170px] bg-[url(/Images/logo.png)] bg-contain bg-left bg-no-repeat"
            aria-label="Brand logo"
          />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <AdminSidebarNav sections={sidebarSections} />
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="text-sm font-semibold text-zinc-900">{title}</div>
            <form action="/api/platform/auth/logout" method="post">
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </div>
    </div>
  );
}

