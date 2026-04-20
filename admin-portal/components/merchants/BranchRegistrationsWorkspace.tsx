'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BranchRegistrationActions from '@/components/merchants/BranchRegistrationActions';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BranchRequestsIndexRowDto {
  id: string;
  merchant: { id: string; legalName: string; primaryBusinessEmail: string | null; status: string } | null;
  branchName: string;
  status: string;
  adminEmail: string;
  adminName: string;
  adminPhone: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  resolvedBranchId: string | null;
}

function statusLabel(status: string) {
  if (status === 'PENDING') return 'Pending';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return status;
}

export interface BranchRegistrationsWorkspaceProps {
  canEdit: boolean;
}

const PAGE_SIZE = 10;

export default function BranchRegistrationsWorkspace({ canEdit }: BranchRegistrationsWorkspaceProps) {
  const [requests, setRequests] = useState<BranchRequestsIndexRowDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [q, setQ] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [page, setPage] = useState(1);
  const [loadFailed, setLoadFailed] = useState(false);
  const [listRevision, setListRevision] = useState(0);

  const refetchList = useCallback(() => {
    setListRevision((n) => n + 1);
  }, []);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set('status', 'PENDING');
    p.set('limit', String(PAGE_SIZE));
    p.set('offset', String((page - 1) * PAGE_SIZE));
    if (q.trim()) p.set('q', q.trim());
    if (createdFrom) p.set('createdFrom', createdFrom);
    if (createdTo) p.set('createdTo', createdTo);
    return `?${p.toString()}`;
  }, [q, createdFrom, createdTo, page]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/platform/merchant-branch-requests${queryString}`, { method: 'GET' })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as {
          requests?: unknown;
          total?: unknown;
          message?: unknown;
        } | null;
        if (!res.ok) throw new Error(typeof json?.message === 'string' ? json.message : 'Unable to fetch branch requests');
        const rows = Array.isArray(json?.requests) ? (json?.requests as BranchRequestsIndexRowDto[]) : [];
        const nextTotal = typeof json?.total === 'number' ? json.total : rows.length;
        if (!cancelled) {
          setLoadFailed(false);
          setRequests(rows);
          setTotal(nextTotal);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [listRevision, queryString]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = total > 0 ? Math.min((page - 1) * PAGE_SIZE + requests.length, total) : 0;

  return (
    <Card className="rounded-[32px] p-6">
      {loadFailed ? <p className="text-sm font-semibold text-red-700">Unable to load branch requests.</p> : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search by merchant, branch, admin email/phone"
            leadingIcon={<Search className="h-5 w-5 text-zinc-600" strokeWidth={2} aria-hidden />}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={createdFrom}
            onChange={(e) => {
              setPage(1);
              setCreatedFrom(e.target.value);
            }}
            className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            aria-label="Created from"
          />
          <input
            type="date"
            value={createdTo}
            onChange={(e) => {
              setPage(1);
              setCreatedTo(e.target.value);
            }}
            className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            aria-label="Created to"
          />
          <button
            type="button"
            onClick={() => refetchList()}
            className="h-[55px] rounded-full bg-white px-8 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2">Merchant</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">Proposed admin</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                <td className="px-4 py-3 text-zinc-700">
                  {r.merchant ? (
                    <Link className="font-semibold text-zinc-900 hover:underline" href={`/merchants/${r.merchant.id}`}>
                      {r.merchant.legalName}
                    </Link>
                  ) : (
                    '—'
                  )}
                  <div className="mt-1 text-xs text-zinc-500">{r.merchant?.primaryBusinessEmail ?? '—'}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  <Link className="hover:underline" href={`/merchants/branch-registrations/${r.id}`}>
                    {r.branchName}
                  </Link>
                  {r.resolvedBranchId ? (
                    <div className="mt-1 text-xs text-zinc-500">Branch id: {r.resolvedBranchId}</div>
                  ) : null}
                  {r.status === 'REJECTED' && r.rejectionReason ? (
                    <div className="mt-2 text-xs font-semibold text-red-700">{r.rejectionReason}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  <div className="font-semibold text-zinc-900">{r.adminName}</div>
                  <div className="text-xs text-zinc-500">{r.adminEmail}</div>
                  <div className="text-xs text-zinc-500">{r.adminPhone}</div>
                </td>
                <td className="px-4 py-3 text-zinc-700">{statusLabel(r.status)}</td>
                <td className="px-4 py-3 text-zinc-700">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link
                      href={`/merchants/branch-registrations/${r.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
                    >
                      View
                    </Link>
                    <BranchRegistrationActions
                      requestId={r.id}
                      status={r.status}
                      disabled={!canEdit}
                      onCompleted={refetchList}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!loadFailed && requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-zinc-600">
                  No branch requests found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-zinc-600">
          Showing <span className="text-zinc-900">{from}–{to}</span> of <span className="text-zinc-900">{total}</span>
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={
              page > 1
                ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
            }
          >
            Prev
          </button>
          <span className="text-sm font-semibold text-zinc-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={
              page < totalPages
                ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
            }
          >
            Next
          </button>
        </nav>
      </div>
    </Card>
  );
}

