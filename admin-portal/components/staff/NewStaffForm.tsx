'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import type { PlatformRoleDto } from '@/lib/platform/platformServer';

export interface NewStaffFormProps {
  roles: PlatformRoleDto[];
}

export default function NewStaffForm({ roles }: NewStaffFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = useMemo(() => roles.map((r) => ({ id: r.id, name: r.name })), [roles]);

  async function submit() {
    if (!email.trim()) return toast.error('Email is required');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!roleId) return toast.error('Role is required');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/platform/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim() ? fullName.trim() : null,
          status: 'ACTIVE',
          roleId,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to create user');
      }
      toast.success('Admin user created');
      window.location.href = '/staff';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to create user');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@perkzio.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
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
          Create user
        </Button>
      </div>
    </div>
  );
}

