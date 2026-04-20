import Link from 'next/link';
import { MapPin, Pencil, Plus, Store } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import Input from '@/components/ui/input';
import type { BranchesListDto } from './types';

export type { BranchesListDto, BranchRow } from './types';

interface BranchesWorkspaceProps {
  data: BranchesListDto | null;
  loadFailed: boolean;
  viewerRoleFallback: string | null;
  q: string | null;
  status: string | null;
  page: number;
  pageSize: number;
}

function formatAddress(addr: Record<string, unknown> | null): string {
  if (!addr || typeof addr !== 'object') return '—';
  const city = typeof addr.city === 'string' ? addr.city : '';
  const state = typeof addr.state === 'string' ? addr.state : '';
  const line1 = typeof addr.line1 === 'string' ? addr.line1 : '';
  const parts = [line1, [city, state].filter(Boolean).join(', ')].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

function buildUrl(q: string | null, status: string | null, page: number) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (status) p.set('status', status);
  if (page > 1) p.set('page', String(page));
  const s = p.toString();
  return s ? `/branches?${s}` : '/branches';
}

function adminNameFromEmail(email: string | null): string {
  if (!email) return '—';
  const left = email.split('@')[0] ?? '';
  const tokens = left.split(/[._-]+/g).filter(Boolean);
  if (!tokens.length) return '—';
  return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(' ');
}

export default function BranchesWorkspace({
  data,
  loadFailed,
  viewerRoleFallback,
  q,
  status,
  page,
  pageSize,
}: BranchesWorkspaceProps) {
  const viewerRole = data?.viewerRole ?? viewerRoleFallback ?? '';
  const canEdit = viewerRole === 'MERCHANT_ADMIN';
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const from = data && data.total > 0 ? data.offset + 1 : 0;
  const to = data ? Math.min(data.offset + data.branches.length, data.total) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Branches
          </h1>
        </div>
        {viewerRole === 'MERCHANT_ADMIN' ? (
          <Link
            href="/branches/request"
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-8 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
          >
            <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
            Add New Branch
          </Link>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] md:p-8">
        <form method="get" action="/branches" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input type="hidden" name="page" value="1" />
          <div className="min-w-0 flex-1">
            <Input name="q" defaultValue={q ?? ''} placeholder="Search by branch, admin, or location" autoComplete="off" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              name="status"
              defaultValue={status ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-[#333235] outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <button
              type="submit"
              className="h-[55px] rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-10 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {!data ? (
          <div className="p-10 text-center text-sm text-[#605E61]">
            {loadFailed
              ? 'Unable to load branches. Check your connection and try again.'
              : 'Unable to load branches.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-[#B3B1B4]/10 bg-[#F6F3F4]/50">
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Branch
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Location
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Admin
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Status
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.branches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-sm text-[#605E61]">
                        No branches found.
                      </td>
                    </tr>
                  ) : (
                    data.branches.map((b, idx) => (
                      <tr key={b.id} className={idx > 0 ? 'border-t border-[#B3B1B4]/10' : ''}>
                        <td className="px-8 py-6 align-middle">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1DDFA] text-[#434E66]"
                              aria-hidden
                            >
                              <Store className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-base font-bold text-[#333235]">{b.name}</p>
                              {b.isHeadBranch ? (
                                <span className="mt-1 inline-flex rounded-full bg-[#F0EDEF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#525155]">
                                  Head Branch
                                </span>
                              ) : null}
                              <p className="truncate text-xs text-[#605E61]">
                                Added {new Date(b.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] px-8 py-6 align-middle">
                          <div className="flex items-start gap-2 text-sm text-[#333235]">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#605E61]" strokeWidth={2} aria-hidden />
                            <span className="line-clamp-2">{formatAddress(b.address)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <div className="text-sm text-[#333235]">
                            <p className="font-semibold text-[#333235]">{adminNameFromEmail(b.branchAdminEmail)}</p>
                            <p className="mt-1 text-xs text-[#605E61]">{b.branchAdminEmail ?? '—'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                              b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-700',
                            )}
                          >
                            {b.status === 'ACTIVE' ? 'APPROVED' : b.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 align-middle text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              href={`/branches/${b.id}`}
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
                            >
                              View
                            </Link>
                            <Link
                              href={canEdit ? `/branches/${b.id}/edit` : '#'}
                              aria-disabled={!canEdit}
                              className={
                                canEdit
                                  ? 'inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                                  : 'pointer-events-none inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
                              }
                            >
                              <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:px-8">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#605E61]">
            Showing <span className="text-[#333235]">{from}–{to}</span> of <span className="text-[#333235]">{data?.total ?? 0}</span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end" aria-label="Pagination">
            <Link
              href={page > 1 ? buildUrl(q, status, page - 1) : '#'}
              aria-disabled={page <= 1}
              className={
                page > 1
                  ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                  : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
              }
            >
              Prev
            </Link>
            <span className="text-sm font-semibold text-zinc-700">
              Page {page} of {totalPages}
            </span>
            <Link
              href={page < totalPages ? buildUrl(q, status, page + 1) : '#'}
              aria-disabled={page >= totalPages}
              className={
                page < totalPages
                  ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                  : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
              }
            >
              Next
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
