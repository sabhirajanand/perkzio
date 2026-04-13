'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/button';

export interface DeleteMerchantButtonProps {
  merchantId: string;
  disabled?: boolean;
}

export default function DeleteMerchantButton({ merchantId, disabled }: DeleteMerchantButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-700 shadow-none hover:bg-red-100"
        disabled={disabled || isSubmitting}
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>

      <ConfirmModal
        open={open}
        title="Delete merchant?"
        description="This merchant will be deactivated and will no longer be able to log in."
        confirmLabel="Delete merchant"
        isSubmitting={isSubmitting}
        onClose={() => (isSubmitting ? null : setOpen(false))}
        onConfirm={async () => {
          setIsSubmitting(true);
          try {
            const res = await fetch(`/api/platform/merchants/${merchantId}`, { method: 'DELETE' });
            if (!res.ok) {
              const json = await res.json().catch(() => null);
              const msg = json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
              throw new Error(msg || 'Unable to delete merchant');
            }
            setOpen(false);
            router.refresh();
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
}

