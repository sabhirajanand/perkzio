'use client';

import Card from '@/components/ui/card';
import type { BranchDto, BranchesListDto } from '@/lib/platform/platformServer';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface BranchesPageClientProps {
  q: string | null;
  status: string | null;
  planCode: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  page: number;
  pageSize: number;
}

function buildUrl(params: {
  q: string | null;
  status: string | null;
  planCode: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  page: number;
}) {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.status) p.set('status', params.status);
  if (params.planCode) p.set('planCode', params.planCode);
  if (params.createdFrom) p.set('createdFrom', params.createdFrom);
  if (params.createdTo) p.set('createdTo', params.createdTo);
  if (params.page > 1) p.set('page', String(params.page));
  const s = p.toString();
  return s ? `/branches?${s}` : '/branches';
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export default function BranchesPageClient(props: BranchesPageClientProps) {
  const { q, status, planCode, createdFrom, createdTo, page, pageSize } = props;

  const [result, setResult] = useState<BranchesListDto | null>(null);
  const [loadedQueryString, setLoadedQueryString] = useState<string | null>(null);
  const [errorByQueryString, setErrorByQueryString] = useState<{ queryString: string; message: string } | null>(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status) p.set('status', status);
    if (planCode) p.set('planCode', planCode);
    if (createdFrom) p.set('createdFrom', createdFrom);
    if (createdTo) p.set('createdTo', createdTo);
    p.set('limit', String(pageSize));
    p.set('offset', String((page - 1) * pageSize));
    return p.toString();
  }, [q, status, planCode, createdFrom, createdTo, page, pageSize]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/platform/branches?${queryString}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
          const msg = body && typeof body.message === 'string' ? body.message : 'Unable to fetch branches';
          throw new Error(msg);
        }
        return (await res.json()) as BranchesListDto;
      })
      .then((json) => {
        setResult(json);
        setErrorByQueryString(null);
        setLoadedQueryString(queryString);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setResult(null);
        setErrorByQueryString({ queryString, message: getErrorMessage(e) });
        setLoadedQueryString(queryString);
      });

    return () => controller.abort();
  }, [queryString]);

  const loading = loadedQueryString !== queryString;
  const error = errorByQueryString?.queryString === queryString ? errorByQueryString.message : null;

  const branches: BranchDto[] = Array.isArray(result?.branches) ? result!.branches : [];
  const total = typeof result?.total === 'number' ? result.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;
  const from = total > 0 ? offset + 1 : 0;
  const to = total > 0 ? Math.min(offset + branches.length, total) : 0;

  if (loading) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Loading branches…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Couldn’t load branches.</p>
        <p className="mt-2 text-sm text-zinc-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Merchant</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                  <td className="px-3 py-3 font-semibold text-zinc-900">
                    {b.name || '—'}
                    {b.isHeadBranch ? (
                      <div className="mt-1 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                        Head branch
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-zinc-700">
                    {b.merchant?.id ? (
                      <Link className="font-semibold text-zinc-900 hover:underline" href={`/merchants/${b.merchant.id}`}>
                        {b.merchant.legalName || '—'}
                      </Link>
                    ) : (
                      <span className="font-semibold text-zinc-900">—</span>
                    )}
                    <div className="mt-1 text-xs text-zinc-500">{b.merchant?.primaryBusinessEmail ?? '—'}</div>
                  </td>
                  <td className="px-3 py-3 text-zinc-700">{b.status || '—'}</td>
                  <td className="px-3 py-3 text-zinc-700">{b.plan?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-zinc-700">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/branches/${b.id}`}
                        aria-disabled={!b.id}
                        className={
                          b.id
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        View
                      </Link>
                      <Link
                        href={b.merchant?.id ? `/merchants/${b.merchant.id}/edit` : '#'}
                        aria-disabled={!b.merchant?.id}
                        className={
                          b.merchant?.id
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-sm text-zinc-600">
                    No branches found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-zinc-600">
            Showing <span className="text-zinc-900">{from}–{to}</span> of <span className="text-zinc-900">{total}</span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end" aria-label="Pagination">
            <Link
              href={page > 1 ? buildUrl({ q, status, planCode, createdFrom, createdTo, page: page - 1 }) : '#'}
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
              href={page < totalPages ? buildUrl({ q, status, planCode, createdFrom, createdTo, page: page + 1 }) : '#'}
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
      </Card>
    </div>
  );
}

