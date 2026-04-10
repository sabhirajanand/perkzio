'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';

export interface DeleteRoleButtonProps {
  roleId: string;
  disabled?: boolean;
}

export default function DeleteRoleButton({ roleId, disabled }: DeleteRoleButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    const ok = window.confirm('Delete this role? This cannot be undone.');
    if (!ok) return;

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
    }
  }

  return (
    <Button
      variant="outline"
      className="border-red-200 text-red-700 hover:bg-red-50"
      onClick={onDelete}
      disabled={disabled || isSubmitting}
    >
      Delete role
    </Button>
  );
}

