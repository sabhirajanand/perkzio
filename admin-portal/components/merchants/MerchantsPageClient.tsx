'use client';

import Card from '@/components/ui/card';
import DeleteMerchantButton from '@/components/merchants/DeleteMerchantButton';
import type { MerchantsListDto, MerchantDto } from '@/lib/platform/platformServer';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface MerchantsPageClientProps {
  q: string | null;
  status: string | null;
  planCode: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  page: number;
  pageSize: number;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
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
  return s ? `/merchants?${s}` : '/merchants';
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export default function MerchantsPageClient(props: MerchantsPageClientProps) {
  const { q, status, planCode, createdFrom, createdTo, page, pageSize, canView, canEdit, canDelete } = props;

  const [result, setResult] = useState<MerchantsListDto | null>(null);
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

    fetch(`/api/platform/merchants?${queryString}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
          const msg = body && typeof body.message === 'string' ? body.message : 'Unable to fetch merchants';
          throw new Error(msg);
        }
        return (await res.json()) as MerchantsListDto;
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
      })

    return () => controller.abort();
  }, [queryString]);

  const loading = loadedQueryString !== queryString;
  const error = errorByQueryString?.queryString === queryString ? errorByQueryString.message : null;

  const merchants: MerchantDto[] = Array.isArray(result?.merchants) ? result!.merchants : [];
  const total = typeof result?.total === 'number' ? result.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;
  const from = total > 0 ? offset + 1 : 0;
  const to = total > 0 ? Math.min(offset + merchants.length, total) : 0;

  if (loading) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Loading merchants…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Couldn’t load merchants.</p>
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
                <th className="px-4 py-2">Merchant</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{m.legalName || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.primaryBusinessEmail || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.status}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={canView ? `/merchants/${m.id}` : '#'}
                        aria-disabled={!canView}
                        className={
                          canView
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        View
                      </Link>
                      <Link
                        href={canEdit ? `/merchants/${m.id}/edit` : '#'}
                        aria-disabled={!canEdit}
                        className={
                          canEdit
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        Edit
                      </Link>
                      <DeleteMerchantButton merchantId={m.id} disabled={!canDelete} />
                    </div>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-zinc-600">
                    No merchants found.
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

