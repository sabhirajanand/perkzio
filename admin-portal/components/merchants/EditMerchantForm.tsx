'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '@/components/ui/button';

export interface EditMerchantFormProps {
  merchantId: string;
  initial: {
    legalName: string;
    primaryBusinessEmail: string | null;
    status: string;
    kycStatus: string;
  };
}

export default function EditMerchantForm({ merchantId, initial }: EditMerchantFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => ({
    legalName: initial.legalName,
    primaryBusinessEmail: initial.primaryBusinessEmail ?? '',
    status: initial.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    kycStatus: initial.kycStatus,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/platform/merchants/${merchantId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              legalName: values.legalName,
              primaryBusinessEmail: values.primaryBusinessEmail.trim().length > 0 ? values.primaryBusinessEmail.trim() : null,
              status: values.status,
              kycStatus: values.kycStatus,
            }),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok) {
            const msg = json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
            throw new Error(msg || 'Unable to update merchant');
          }
          router.push(`/merchants/${merchantId}`);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to update merchant');
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Legal name</span>
        <input
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-black/20"
          value={values.legalName}
          onChange={(e) => setValues((v) => ({ ...v, legalName: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Primary business email</span>
        <input
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-black/20"
          value={values.primaryBusinessEmail}
          onChange={(e) => setValues((v) => ({ ...v, primaryBusinessEmail: e.target.value }))}
        />
      </label>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
            <label
              key={s}
              className={
                values.status === s
                  ? 'flex items-center gap-2 rounded-full border border-[#F11E69]/30 bg-[#F11E69]/10 px-4 py-2 text-sm font-semibold text-[#F11E69]'
                  : 'flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700'
              }
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={values.status === s}
                onChange={() => setValues((v) => ({ ...v, status: s }))}
              />
              {s === 'ACTIVE' ? 'Active' : 'Inactive'}
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">KYC status</span>
        <input
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-black/20"
          value={values.kycStatus}
          onChange={(e) => setValues((v) => ({ ...v, kycStatus: e.target.value }))}
        />
      </label>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

