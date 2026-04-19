'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/button';

export interface BranchRegistrationActionsProps {
  requestId: string;
  status: string;
  disabled?: boolean;
  /** Called after a successful approve/reject (e.g. refetch client-side lists). */
  onCompleted?: () => void;
}

async function postApprove(requestId: string) {
  const res = await fetch(`/api/platform/merchant-branch-requests/${requestId}/approve`, { method: 'POST' });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
    throw new Error(message || 'Request failed');
  }
  return json;
}

async function postReject(requestId: string, reason?: string) {
  const res = await fetch(`/api/platform/merchant-branch-requests/${requestId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
    throw new Error(message || 'Request failed');
  }
  return json;
}

export default function BranchRegistrationActions({ requestId, status, disabled, onCompleted }: BranchRegistrationActionsProps) {
  const router = useRouter();
  const [modal, setModal] = useState<null | 'approve' | 'reject'>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const title = useMemo(() => (modal === 'approve' ? 'Approve branch request?' : 'Reject branch request?'), [modal]);
  const description = useMemo(() => {
    if (modal === 'approve')
      return 'Approving provisions the branch, saves the submitted details, and activates the Branch Admin login.';
    if (modal === 'reject') return 'Rejecting keeps the branch and Branch Admin inactive (not provisioned).';
    return '';
  }, [modal]);

  if (status !== 'PENDING') return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => setModal('reject')} disabled={disabled || isSubmitting}>
          Reject
        </Button>
        <Button size="sm" onClick={() => setModal('approve')} disabled={disabled || isSubmitting}>
          Approve
        </Button>
      </div>

      <ConfirmModal
        open={modal !== null}
        title={title}
        description={description}
        confirmLabel={modal === 'approve' ? 'Approve' : 'Reject'}
        onClose={() => {
          if (!isSubmitting) setModal(null);
        }}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          if (!modal) return;
          setIsSubmitting(true);
          try {
            if (modal === 'approve') {
              await postApprove(requestId);
            } else {
              await postReject(requestId, rejectReason);
            }
            setModal(null);
            setRejectReason('');
            router.refresh();
            onCompleted?.();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {modal === 'reject' ? (
        <div className="mt-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Rejection reason (optional)</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-black/10"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Reason shown to merchant admins"
          />
        </div>
      ) : null}
    </>
  );
}

