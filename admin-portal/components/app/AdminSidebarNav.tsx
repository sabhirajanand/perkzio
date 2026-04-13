'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';

export interface AdminSidebarNavItem {
  href: string;
  label: string;
}

export interface AdminSidebarNavSection {
  label: string;
  items: AdminSidebarNavItem[];
}

export interface AdminSidebarNavProps {
  sections: AdminSidebarNavSection[];
}

export default function AdminSidebarNav({ sections }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const flat = sections.flatMap((s) => s.items);
  const activeHref =
    flat
      .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">{section.label}</p>
          <ul className="mt-2 space-y-1">
            {section.items.map((i) => {
              const isActive = activeHref === i.href;
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className={cn(
                      'block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'border border-[#F11E69] bg-white text-zinc-900 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.30)]'
                        : 'border border-transparent text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                    )}
                  >
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

