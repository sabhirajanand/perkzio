'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import Button from '@/components/ui/button';

export interface EditMerchantApplicationFormProps {
  applicationId: string;
  initial: Record<string, unknown>;
}

function readStr(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === 'string' ? v : '';
}

export default function EditMerchantApplicationForm({ applicationId, initial }: EditMerchantApplicationFormProps) {
  const router = useRouter();
  const payload = useMemo(
    () => (initial.businessPayload && typeof initial.businessPayload === 'object' ? (initial.businessPayload as Record<string, unknown>) : {}),
    [initial.businessPayload],
  );

  const [values, setValues] = useState(() => ({
    businessName: readStr(payload, 'businessName'),
    category: readStr(payload, 'category'),
    contactName: readStr(payload, 'contactName'),
    contactEmail: readStr(payload, 'contactEmail'),
    contactPhone: readStr(payload, 'contactPhone'),
    pan: readStr(payload, 'pan'),
    gstin: readStr(payload, 'gstin'),
    addressLine1: readStr(payload, 'addressLine1'),
    city: readStr(payload, 'city'),
    state: readStr(payload, 'state'),
    pinCode: readStr(payload, 'pinCode'),
    mapsUrl: readStr(payload, 'mapsUrl'),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/platform/merchant-applications/${applicationId}/edit`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          const json = await res.json().catch(() => null);
          if (!res.ok) {
            const msg = json && typeof json === 'object' && 'message' in (json as object) ? String((json as { message?: unknown }).message) : null;
            throw new Error(msg || 'Unable to update');
          }
          router.push(`/merchants/registrations/${applicationId}`);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to update');
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ['businessName', 'Business name'],
            ['category', 'Category'],
            ['contactName', 'Contact name'],
            ['contactEmail', 'Contact email'],
            ['contactPhone', 'Contact phone'],
            ['pan', 'PAN'],
            ['gstin', 'GSTIN'],
            ['addressLine1', 'Address line 1'],
            ['city', 'City'],
            ['state', 'State'],
            ['pinCode', 'Pin code'],
            ['mapsUrl', 'Maps URL'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
            <input
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none ring-0 focus:border-black/20"
            />
          </label>
        ))}
      </div>

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

