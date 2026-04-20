'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import type { BranchRow } from '@/components/branches/types';

interface EditBranchFormProps {
  branch: BranchRow;
  canEdit: boolean;
}

export default function EditBranchForm({ branch, canEdit }: EditBranchFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const addr = branch.address && typeof branch.address === 'object' ? (branch.address as Record<string, unknown>) : {};

  const [line1, setLine1] = useState(typeof addr.line1 === 'string' ? addr.line1 : '');
  const [city, setCity] = useState(typeof addr.city === 'string' ? addr.city : '');
  const [state, setState] = useState(typeof addr.state === 'string' ? addr.state : '');
  const [pinCode, setPinCode] = useState(typeof addr.pinCode === 'string' ? addr.pinCode : '');
  const [mapsUrl, setMapsUrl] = useState(typeof addr.mapsUrl === 'string' ? addr.mapsUrl : '');

  async function onSave() {
    if (!canEdit) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/merchant/branches/${branch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: { line1, city, state, pinCode, mapsUrl },
        }),
      });
      const json = (await res.json().catch(() => null)) as { message?: string; ok?: boolean } | null;
      if (!res.ok) {
        toast.error(typeof json?.message === 'string' ? json.message : 'Update failed');
        return;
      }
      toast.success('Branch updated.');
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Branch name</Label>
          <Input value={branch.name} disabled />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Address line 1</Label>
          <Input value={line1} onChange={(e) => setLine1(e.target.value)} disabled={!canEdit} />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} disabled={!canEdit} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input value={state} onChange={(e) => setState(e.target.value)} disabled={!canEdit} />
        </div>
        <div className="space-y-2">
          <Label>PIN code</Label>
          <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} disabled={!canEdit} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Google Maps URL</Label>
          <Input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} disabled={!canEdit} />
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={!canEdit || saving}
        className="inline-flex h-[55px] w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95 disabled:opacity-60 sm:w-auto sm:px-14"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

