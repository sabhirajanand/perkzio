import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreVertical, Search } from 'lucide-react';

import Input from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';
import { customerInitials } from '@/lib/utils/customerInitials';
import { getPaginationItems } from '@/lib/utils/pagination';

import CustomersMetricsStrip from './CustomersMetricsStrip';
import RedemptionInsightsStrip from './RedemptionInsightsStrip';
import type { CustomerRow, CustomersListDto } from './types';
import InviteCustomersButton from './InviteCustomersButton';

export type { CustomerListItemDto, CustomersListDto, CustomerRow } from './types';

interface CustomersWorkspaceProps {
  data: CustomersListDto | null;
  q: string | null;
  page: number;
  pageSize: number;
  /** Sample data from Figma (no real customers yet). */
  isPreview?: boolean;
  /** API request failed while a search query was active. */
  loadFailed?: boolean;
}

function formatName(c: CustomerRow) {
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ');
  return full || 'Customer';
}

function statusVisual(status: string) {
  const s = status.toUpperCase();
  if (s === 'ACTIVE') {
    return { dot: 'bg-emerald-500', label: 'Active', text: 'text-[#333235]' };
  }
  if (s === 'INACTIVE' || s === 'BLOCKED') {
    return { dot: 'bg-zinc-400', label: status, text: 'text-[#333235]' };
  }
  return { dot: 'bg-amber-500', label: status, text: 'text-[#333235]' };
}

function buildListUrl(q: string | null, pageNum: number) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (pageNum > 1) p.set('page', String(pageNum));
  const s = p.toString();
  return s ? `/customers?${s}` : '/customers';
}

function RolePill({ row }: { row: CustomerRow }) {
  const label = row.roleLabel?.trim();
  if (!label) {
    return <span className="text-sm text-[#605E61]">—</span>;
  }
  const accent = row.roleTone !== 'neutral';
  return (
    <span
      className={cn(
        'inline-flex max-w-[11rem] truncate rounded px-3 py-1 text-xs leading-4',
        accent
          ? 'bg-[#FFD5E4] font-normal text-[#F11E69]'
          : 'bg-[#F0EDEF] font-bold text-[#525155]',
      )}
    >
      {label}
    </span>
  );
}

function lastActiveText(row: CustomerRow) {
  if (row.lastActiveLabel) return row.lastActiveLabel;
  return formatRelativeTime(row.lastStampAt);
}

export default function CustomersWorkspace({
  data,
  q,
  page,
  pageSize,
  isPreview = false,
  loadFailed = false,
}: CustomersWorkspaceProps) {
  const figmaSubtitle = 'Managing 248 architectural professionals across 12 global offices.';

  const subtitle =
    isPreview && data && data.total > 0
      ? figmaSubtitle
      : data && data.total > 0
        ? `Managing ${data.total.toLocaleString()} customer${data.total === 1 ? '' : 's'} across your business.`
        : 'Search, filter and grow relationships with your customer base.';

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const from = data && data.total > 0 ? data.offset + 1 : 0;
  const to = data ? Math.min(data.offset + data.customers.length, data.total) : 0;
  const pageItems = getPaginationItems(page, totalPages);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Customers
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">{subtitle}</p>
        </div>
        <InviteCustomersButton />
      </div>

      <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <form method="get" action="/customers" className="flex flex-col gap-4 md:flex-row md:items-center">
          <input type="hidden" name="page" value="1" />
          <div className="min-w-0 flex-1">
            <Input
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by phone, email, or name"
              leadingIcon={<Search className="h-5 w-5 text-[#605E61]" strokeWidth={2} aria-hidden />}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="h-[55px] shrink-0 rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-10 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {!data ? (
          <div className="p-10 text-center text-sm text-[#605E61]">
            {loadFailed
              ? 'Unable to load customers. Check your connection and try again.'
              : 'Unable to load customers.'}
          </div>
        ) : data.customers.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#605E61]">No customers match your search.</div>
        ) : (
          <>
            {isPreview ? (
              <div className="border-b border-[#B3B1B4]/10 bg-[#FFFBF0] px-8 py-3 text-center text-xs font-semibold text-amber-900/90">
                Preview: sample data for layout &amp; UX — replace with live data once customers enroll.
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-[#B3B1B4]/10 bg-[#F6F3F4]/50">
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Name &amp; Email
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Role
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Status
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Last active
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((c, idx) => {
                    const vis = statusVisual(c.status);
                    return (
                      <tr key={c.id} className={idx > 0 ? 'border-t border-[#B3B1B4]/10' : ''}>
                        <td className="px-8 py-6 align-middle">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1DDFA] text-sm font-bold text-[#434E66]"
                              aria-hidden
                            >
                              {customerInitials(c)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-base font-bold text-[#333235]">{formatName(c)}</p>
                              <p className="truncate text-sm text-[#605E61]">{c.email ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <RolePill row={c} />
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${vis.dot}`} aria-hidden />
                            <span className={`text-sm font-medium ${vis.text}`}>{vis.label}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-middle text-sm text-[#333235]">{lastActiveText(c)}</td>
                        <td className="px-8 py-6 align-middle text-right">
                          <Link
                            href={`/customers/${c.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#605E61] transition hover:bg-black/[0.04] hover:text-[#333235]"
                            aria-label={`Open ${formatName(c)}`}
                          >
                            <MoreVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#B3B1B4]/10 bg-[#FAFAFA]/80 px-6 py-5 sm:px-8">
              <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-center text-sm font-medium text-[#605E61] lg:text-left">
                  Showing{' '}
                  <span className="text-[#333235]">
                    {from}–{to}
                  </span>{' '}
                  of{' '}
                  <span className="text-[#333235]">{data.total.toLocaleString()}</span>
                </p>

                <nav
                  className="flex flex-wrap items-center justify-center gap-2 lg:justify-end"
                  aria-label="Pagination"
                >
                  {page > 1 ? (
                    <Link
                      href={buildListUrl(q, page - 1)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B3B1B4]/25 bg-white text-[#333235] shadow-sm transition hover:bg-[#F6F3F4]"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-zinc-300">
                      <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {pageItems.map((item, i) =>
                      item === 'gap' ? (
                        <span
                          key={`gap-${i}`}
                          className="inline-flex min-w-[2.25rem] items-center justify-center px-1 text-sm font-medium text-[#9CA3AF]"
                          aria-hidden
                        >
                          …
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={buildListUrl(q, item)}
                          className={cn(
                            'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition',
                            item === page
                              ? 'bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] text-white shadow-[0_6px_20px_-6px_rgba(241,30,105,0.45)]'
                              : 'border border-transparent text-[#333235] hover:bg-white hover:shadow-sm',
                          )}
                          aria-current={item === page ? 'page' : undefined}
                        >
                          {item}
                        </Link>
                      ),
                    )}
                  </div>

                  {page < totalPages ? (
                    <Link
                      href={buildListUrl(q, page + 1)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B3B1B4]/25 bg-white text-[#333235] shadow-sm transition hover:bg-[#F6F3F4]"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" strokeWidth={2} />
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-zinc-300">
                      <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                  )}
                </nav>
              </div>
            </div>

            <RedemptionInsightsStrip />
          </>
        )}
      </div>

      <CustomersMetricsStrip />
    </div>
  );
}
