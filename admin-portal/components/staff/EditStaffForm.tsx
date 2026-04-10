'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import type { PlatformRoleDto, StaffDetailDto } from '@/lib/platform/platformServer';

export interface EditStaffFormProps {
  staffId: string;
  initial: StaffDetailDto;
  roles: PlatformRoleDto[];
}

export default function EditStaffForm({ staffId, initial, roles }: EditStaffFormProps) {
  const [fullName, setFullName] = useState(initial.staff.fullName ?? '');
  const [status, setStatus] = useState(initial.staff.status);
  const [roleId, setRoleId] = useState(initial.roleId ?? roles[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = useMemo(() => roles.map((r) => ({ id: r.id, name: r.name })), [roles]);

  async function submit() {
    if (!roleId) return toast.error('Role is required');
    if (!status.trim()) return toast.error('Status is required');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/platform/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() ? fullName.trim() : null,
          status: status.trim(),
          roleId,
        }),
      });
      if (!res.ok) throw new Error('Unable to update user');
      toast.success('User updated');
      window.location.href = '/staff';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to update user');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={initial.staff.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="ACTIVE" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-[55px] w-full rounded-full bg-[#F3F4F6] px-6 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
          >
            {roleOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => (window.location.href = '/staff')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={isSubmitting}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

