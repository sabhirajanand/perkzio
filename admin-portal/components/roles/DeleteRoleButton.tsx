'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/button';

export interface DeleteRoleButtonProps {
  roleId: string;
  disabled?: boolean;
}

export default function DeleteRoleButton({ roleId, disabled }: DeleteRoleButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/platform/roles/${roleId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to delete role');
      }
      toast.success('Role deleted');
      window.location.href = '/roles';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to delete role');
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
        Delete role
      </Button>
      <ConfirmModal
        open={open}
        title="Delete role?"
        description="This will permanently delete the role. Staff users currently assigned to this role may lose access."
        confirmLabel="Delete role"
        cancelLabel="Cancel"
        isSubmitting={isSubmitting}
        onClose={() => (isSubmitting ? null : setOpen(false))}
        onConfirm={onDelete}
      />
    </>
  );
}

