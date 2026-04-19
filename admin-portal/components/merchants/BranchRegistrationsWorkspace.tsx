'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import BranchRegistrationActions from '@/components/merchants/BranchRegistrationActions';
import Card from '@/components/ui/card';

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

export default function BranchRegistrationsWorkspace({ canEdit }: BranchRegistrationsWorkspaceProps) {
  const [requests, setRequests] = useState<BranchRequestsIndexRowDto[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [listRevision, setListRevision] = useState(0);

  const refetchList = useCallback(() => {
    setListRevision((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    fetch('/api/platform/merchant-branch-requests', { method: 'GET' })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as { requests?: unknown; message?: unknown } | null;
        if (!res.ok) throw new Error(typeof json?.message === 'string' ? json.message : 'Unable to fetch branch requests');
        const rows = Array.isArray(json?.requests) ? (json?.requests as BranchRequestsIndexRowDto[]) : [];
        if (!cancelled) setRequests(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [listRevision]);

  return (
    <Card className="rounded-[32px] p-6">
      {loadFailed ? <p className="text-sm font-semibold text-red-700">Unable to load branch requests.</p> : null}
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
    </Card>
  );
}

