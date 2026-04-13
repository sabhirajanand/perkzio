'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/button';

export interface DeleteStaffButtonProps {
  staffId: string;
  disabled?: boolean;
  buttonLabel?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export default function DeleteStaffButton({
  staffId,
  disabled,
  buttonLabel = 'Delete user',
  title = 'Delete user?',
  description = 'This will deactivate the user and remove their role access. They will no longer be able to log in.',
  confirmLabel = 'Delete user',
}: DeleteStaffButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/platform/staff/${staffId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to delete user');
      }
      toast.success('User deactivated');
      window.location.href = '/staff';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to delete user');
    } finally {
      setIsSubmitting(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
        disabled={disabled || isSubmitting}
      >
        {buttonLabel}
      </Button>
      <ConfirmModal
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel="Cancel"
        isSubmitting={isSubmitting}
        onClose={() => (isSubmitting ? null : setOpen(false))}
        onConfirm={onDelete}
      />
    </>
  );
}

