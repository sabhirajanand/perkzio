'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import type { PlatformPermissionDto } from '@/lib/platform/platformServer';

export interface NewRoleFormProps {
  permissions: PlatformPermissionDto[];
}

export default function NewRoleForm({ permissions }: NewRoleFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCodes = useMemo(
    () => permissions.filter((p) => selected[p.code]).map((p) => p.code),
    [permissions, selected],
  );

  async function submit() {
    if (name.trim().length < 2) {
      toast.error('Role name is required');
      return;
    }
    if (selectedCodes.length === 0) {
      toast.error('Select at least one permission');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/platform/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() ? description.trim() : null,
          permissionCodes: selectedCodes,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to create role');
      }
      toast.success('Role created');
      window.location.href = '/roles';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to create role');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roleName">Role name</Label>
          <Input id="roleName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support Manager" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="roleDesc">Description</Label>
          <Input
            id="roleDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Permissions</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {permissions.map((p) => (
            <label key={p.id} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={Boolean(selected[p.code])}
                onChange={(e) => setSelected((s) => ({ ...s, [p.code]: e.target.checked }))}
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{p.code}</p>
                {p.description ? <p className="mt-1 text-sm text-zinc-600">{p.description}</p> : null}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => (window.location.href = '/roles')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={isSubmitting}>
          Create role
        </Button>
      </div>
    </div>
  );
}

