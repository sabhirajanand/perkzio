'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';

export interface EditMerchantSubmissionFormProps {
  applicationId: string;
  initialBusinessPayload: Record<string, unknown> | null;
  disabled?: boolean;
}

function readStr(payload: Record<string, unknown> | null, key: string): string {
  if (!payload) return '';
  const v = payload[key];
  return typeof v === 'string' ? v : '';
}

export default function EditMerchantSubmissionForm({
  applicationId,
  initialBusinessPayload,
  disabled = false,
}: EditMerchantSubmissionFormProps) {
  const router = useRouter();
  const payload = useMemo(() => initialBusinessPayload, [initialBusinessPayload]);

  const [values, setValues] = useState(() => ({
    businessName: readStr(payload, 'businessName'),
    contactName: readStr(payload, 'contactName'),
    category: readStr(payload, 'category'),
    contactEmail: readStr(payload, 'contactEmail'),
    contactPhone: readStr(payload, 'contactPhone'),

    logoUrl: readStr(payload, 'logoUrl'),
    logoFileName: readStr(payload, 'logoFileName'),
    insideViewUrl: readStr(payload, 'insideViewUrl'),
    insideViewFileName: readStr(payload, 'insideViewFileName'),
    outsideViewUrl: readStr(payload, 'outsideViewUrl'),
    outsideViewFileName: readStr(payload, 'outsideViewFileName'),

    addressLine1: readStr(payload, 'addressLine1'),
    city: readStr(payload, 'city'),
    state: readStr(payload, 'state'),
    pinCode: readStr(payload, 'pinCode'),
    mapsUrl: readStr(payload, 'mapsUrl'),

    plan: readStr(payload, 'plan'),
    billingCycle: readStr(payload, 'billingCycle'),

    pan: readStr(payload, 'pan'),
    gstin: readStr(payload, 'gstin'),

    website: readStr(payload, 'website'),
    googleBusinessUrl: readStr(payload, 'googleBusinessUrl'),
    instagram: readStr(payload, 'instagram'),
    facebook: readStr(payload, 'facebook'),
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (disabled) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/platform/merchant-applications/${applicationId}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          contactEmail: values.contactEmail.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === 'object' && 'message' in (json as object)
            ? String((json as { message?: unknown }).message)
            : null;
        throw new Error(msg || 'Unable to update submission payload');
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update submission payload');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Business details (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.businessName} onChange={(e) => setValues((v) => ({ ...v, businessName: e.target.value }))} placeholder="Business name" />
          <Input disabled={disabled} value={values.contactName} onChange={(e) => setValues((v) => ({ ...v, contactName: e.target.value }))} placeholder="Admin name" />
          <Input disabled={disabled} value={values.category} onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))} placeholder="Category" />
          <Input disabled={disabled} value={values.contactEmail} onChange={(e) => setValues((v) => ({ ...v, contactEmail: e.target.value }))} placeholder="Email" />
          <Input disabled={disabled} value={values.contactPhone} onChange={(e) => setValues((v) => ({ ...v, contactPhone: e.target.value }))} placeholder="Phone" />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Shop photos (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.logoUrl} onChange={(e) => setValues((v) => ({ ...v, logoUrl: e.target.value }))} placeholder="Logo URL" />
          <Input disabled={disabled} value={values.logoFileName} onChange={(e) => setValues((v) => ({ ...v, logoFileName: e.target.value }))} placeholder="Logo filename" />
          <Input disabled={disabled} value={values.insideViewUrl} onChange={(e) => setValues((v) => ({ ...v, insideViewUrl: e.target.value }))} placeholder="Inside view URL" />
          <Input disabled={disabled} value={values.insideViewFileName} onChange={(e) => setValues((v) => ({ ...v, insideViewFileName: e.target.value }))} placeholder="Inside view filename" />
          <Input disabled={disabled} value={values.outsideViewUrl} onChange={(e) => setValues((v) => ({ ...v, outsideViewUrl: e.target.value }))} placeholder="Outside view URL" />
          <Input disabled={disabled} value={values.outsideViewFileName} onChange={(e) => setValues((v) => ({ ...v, outsideViewFileName: e.target.value }))} placeholder="Outside view filename" />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Registered address (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.addressLine1} onChange={(e) => setValues((v) => ({ ...v, addressLine1: e.target.value }))} placeholder="Address line 1" />
          <Input disabled={disabled} value={values.city} onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))} placeholder="City" />
          <Input disabled={disabled} value={values.state} onChange={(e) => setValues((v) => ({ ...v, state: e.target.value }))} placeholder="State" />
          <Input disabled={disabled} value={values.pinCode} onChange={(e) => setValues((v) => ({ ...v, pinCode: e.target.value }))} placeholder="PIN code" />
          <div className="md:col-span-2">
            <Input disabled={disabled} value={values.mapsUrl} onChange={(e) => setValues((v) => ({ ...v, mapsUrl: e.target.value }))} placeholder="Google Maps URL" />
          </div>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Subscription plan (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.plan} onChange={(e) => setValues((v) => ({ ...v, plan: e.target.value }))} placeholder="Requested plan" />
          <Input disabled={disabled} value={values.billingCycle} onChange={(e) => setValues((v) => ({ ...v, billingCycle: e.target.value }))} placeholder="Billing cycle" />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Tax identifiers (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.pan} onChange={(e) => setValues((v) => ({ ...v, pan: e.target.value }))} placeholder="PAN" />
          <Input disabled={disabled} value={values.gstin} onChange={(e) => setValues((v) => ({ ...v, gstin: e.target.value }))} placeholder="GSTIN" />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Online presence (submission)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input disabled={disabled} value={values.website} onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))} placeholder="Website" />
          <Input disabled={disabled} value={values.googleBusinessUrl} onChange={(e) => setValues((v) => ({ ...v, googleBusinessUrl: e.target.value }))} placeholder="Google Business URL" />
          <Input disabled={disabled} value={values.instagram} onChange={(e) => setValues((v) => ({ ...v, instagram: e.target.value }))} placeholder="Instagram" />
          <Input disabled={disabled} value={values.facebook} onChange={(e) => setValues((v) => ({ ...v, facebook: e.target.value }))} placeholder="Facebook" />
        </div>
      </Card>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit} disabled={disabled || isSubmitting}>
          Save submission changes
        </Button>
      </div>
    </div>
  );
}

