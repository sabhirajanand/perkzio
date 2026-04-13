'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/button';

export interface MerchantApplicationActionsProps {
  applicationId: string;
  disabled?: boolean;
}

async function postJson(path: string) {
  const res = await fetch(path, { method: 'POST' });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
    throw new Error(message || 'Request failed');
  }
  return json;
}

export default function MerchantApplicationActions({ applicationId, disabled }: MerchantApplicationActionsProps) {
  const router = useRouter();
  const [modal, setModal] = useState<null | 'approve' | 'reject'>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const title = useMemo(() => (modal === 'approve' ? 'Approve application?' : 'Reject application?'), [modal]);
  const description = useMemo(() => {
    if (modal === 'approve') return 'Approving will provision the merchant and email login details to the applicant.';
    if (modal === 'reject') return 'Rejecting will prevent the merchant from logging in. The applicant will be notified.';
    return '';
  }, [modal]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => setModal('reject')} disabled={disabled || isSubmitting}>
          Reject
        </Button>
        <Button onClick={() => setModal('approve')} disabled={disabled || isSubmitting}>
          Approve
        </Button>
      </div>

      <ConfirmModal
        open={modal !== null}
        title={title}
        description={description}
        confirmLabel={modal === 'approve' ? 'Approve' : 'Reject'}
        onClose={() => (isSubmitting ? null : setModal(null))}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          if (!modal) return;
          setIsSubmitting(true);
          try {
            await postJson(`/api/platform/merchant-applications/${applicationId}/${modal}`);
            setModal(null);
            router.refresh();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
}

