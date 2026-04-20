'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import ConfirmModal from '@/components/ui/ConfirmModal';

import type { MerchantBranchRequestDto } from '@/lib/platform/platformServer';

export interface MerchantBranchRequestsPanelProps {
  merchantId: string;
  requests: MerchantBranchRequestDto[];
  canEdit: boolean;
}

function statusPillClass(status: string) {
  if (status === 'PENDING') return 'bg-amber-100 text-amber-950';
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-900';
  if (status === 'REJECTED') return 'bg-red-100 text-red-900';
  return 'bg-zinc-100 text-zinc-800';
}

export default function MerchantBranchRequestsPanel({ merchantId, requests, canEdit }: MerchantBranchRequestsPanelProps) {
  void merchantId;
  const router = useRouter();
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postApprove(requestId: string) {
    const res = await fetch(`/api/platform/merchant-branch-requests/${requestId}/approve`, { method: 'POST' });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        json && typeof json === 'object' && 'message' in json ? String((json as { message?: unknown }).message) : null;
      throw new Error(message || 'Approve failed');
    }
  }

  async function postReject(requestId: string, reason: string) {
    const res = await fetch(`/api/platform/merchant-branch-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() || undefined }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        json && typeof json === 'object' && 'message' in json ? String((json as { message?: unknown }).message) : null;
      throw new Error(message || 'Reject failed');
    }
  }

  return (
    <>
      <Card className="rounded-[32px] p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">Branch requests</h2>
          <p className="text-sm text-zinc-600">
            Approving creates the branch, attaches photos from the request, and activates a{' '}
            <span className="font-semibold text-zinc-800">Branch Admin</span> login (same moment as approval). Rejecting
            leaves no branch user.
          </p>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-semibold text-zinc-700">Branch</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Admin</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Submitted</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Status</th>
                {canEdit ? <th className="px-4 py-3 font-semibold text-zinc-700">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-4 py-8 text-center text-zinc-600">
                    No branch requests for this merchant.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-zinc-900">{r.branchName}</p>
                      {r.resolvedBranchId ? (
                        <p className="mt-1 text-xs text-zinc-500">Branch id: {r.resolvedBranchId}</p>
                      ) : null}
                      {r.status === 'REJECTED' && r.rejectionReason ? (
                        <p className="mt-2 text-xs text-red-700">{r.rejectionReason}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-800">
                      <p>{r.adminName}</p>
                      <p className="text-xs text-zinc-500">{r.adminEmail}</p>
                      <p className="text-xs text-zinc-500">{r.adminPhone}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-600">
                      {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {canEdit ? (
                      <td className="px-4 py-3 align-top">
                        {r.status === 'PENDING' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => setApproveId(r.id)} disabled={isSubmitting}>
                              Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setRejectId(r.id)} disabled={isSubmitting}>
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        open={approveId !== null}
        title="Approve branch request?"
        description="This provisions the branch, saves outlet details from the request, and creates the Branch Admin user with the password they submitted. They can sign in immediately after."
        confirmLabel="Approve"
        onClose={() => {
          if (!isSubmitting) setApproveId(null);
        }}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          if (!approveId) return;
          setError(null);
          setIsSubmitting(true);
          try {
            await postApprove(approveId);
            setApproveId(null);
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Approve failed');
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {rejectId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reject branch request"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setRejectId(null);
          }}
        >
          <Card className="w-full max-w-lg rounded-[32px] p-6">
            <p className="text-lg font-semibold text-zinc-900">Reject branch request?</p>
            <p className="mt-2 text-sm text-zinc-600">Optional note for the merchant (stored on the request).</p>
            <textarea
              className="mt-4 min-h-[100px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => !isSubmitting && setRejectId(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white shadow-none hover:bg-red-700"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!rejectId) return;
                  setError(null);
                  setIsSubmitting(true);
                  try {
                    await postReject(rejectId, rejectReason);
                    setRejectId(null);
                    setRejectReason('');
                    router.refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Reject failed');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Reject
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
