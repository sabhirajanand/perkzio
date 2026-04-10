'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';

export interface DeleteStaffButtonProps {
  staffId: string;
  disabled?: boolean;
}

export default function DeleteStaffButton({ staffId, disabled }: DeleteStaffButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    const ok = window.confirm('Deactivate this user? They will no longer be able to log in.');
    if (!ok) return;

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
    }
  }

  return (
    <Button
      variant="outline"
      className="border-red-200 text-red-700 hover:bg-red-50"
      onClick={onDelete}
      disabled={disabled || isSubmitting}
    >
      Deactivate user
    </Button>
  );
}

