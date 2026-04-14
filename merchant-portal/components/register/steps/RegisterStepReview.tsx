'use client';

import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import RegisterStepNav from '@/components/register/RegisterStepNav';
import { ensureRazorpayLoaded } from '@/lib/payments/razorpayCheckout';
import { pricing } from '@/lib/pricing';
import type { RegisterApplicationInput } from '@/lib/schemas/register';
import type { RegisterSelectedFiles } from '@/components/register/RegisterWizard';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export interface RegisterStepReviewProps {
  onBack: () => void;
  onEditStep: (step: 1 | 2 | 3) => void;
  onSubmitted: () => void;
  selectedFiles: RegisterSelectedFiles;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-black/5 py-3 last:border-b-0">
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
      <p className="text-sm font-semibold text-zinc-900">{value ? value : '—'}</p>
    </div>
  );
}

export default function RegisterStepReview({ onBack, onEditStep, onSubmitted, selectedFiles }: RegisterStepReviewProps) {
  const { getValues, setValue, trigger, watch } = useFormContext<RegisterApplicationInput>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const v = watch();
  const selectedPlan = useMemo(() => pricing.plans.find((p) => p.code === v.plan) ?? null, [v.plan]);

  async function submit() {
    if (!confirmed) {
      toast.error('Please confirm the details and accept the terms before submitting.');
      return;
    }
    const valid = await trigger();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      if (!selectedFiles.inside || !selectedFiles.outside || !selectedFiles.logo) {
        toast.error('Please upload inside view, outside view, and logo before submitting.');
        return;
      }

      const uploadOne = async (kind: 'inside' | 'outside' | 'logo', file: File) => {
        const form = new FormData();
        form.append('file', file);
        form.append('kind', kind);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const body = (await res.json().catch(() => null)) as
          | { success?: boolean; data?: { url?: string; key?: string }; message?: string }
          | null;
        if (!res.ok || !body?.data?.url) throw new Error(body?.message || 'Upload failed');
        return String(body.data.url);
      };

      const [insideUrl, outsideUrl, logoUrl] = await Promise.all([
        uploadOne('inside', selectedFiles.inside),
        uploadOne('outside', selectedFiles.outside),
        uploadOne('logo', selectedFiles.logo),
      ]);

      setValue('insideViewUrl', insideUrl, { shouldValidate: true });
      setValue('outsideViewUrl', outsideUrl, { shouldValidate: true });
      setValue('logoUrl', logoUrl, { shouldValidate: true });

      const payload = getValues();
      const res = await fetch('/api/onboarding/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Submission failed');
      }
      const body = (await res.json().catch(() => null)) as
        | {
            applicationId?: string;
            checkout?: { provider: 'RAZORPAY'; keyId: string; orderId: string; amount: number; currency: string };
          }
        | null;

      if (body?.checkout?.provider === 'RAZORPAY' && body.applicationId) {
        await ensureRazorpayLoaded();
        if (!window.Razorpay) throw new Error('Payments unavailable');

        const options = {
          key: body.checkout.keyId,
          amount: body.checkout.amount,
          currency: body.checkout.currency,
          order_id: body.checkout.orderId,
          name: 'Perkzio',
          prefill: {
            name: payload.contactName,
            email: payload.contactEmail,
            contact: payload.contactPhone,
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const confirmRes = await fetch('/api/onboarding/payment/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: body.applicationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            if (!confirmRes.ok) {
              toast.error('Payment captured but confirmation failed');
              return;
            }
            onSubmitted();
          },
        };

        new window.Razorpay(options).open();
        return;
      }

      onSubmitted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-[30px]">
      <RegisterStepHeader
        stepIndex={4}
        title={
          <>
            Review &amp; <span className="text-primary">Submit</span>
          </>
        }
        description="Review your details carefully before proceeding. You can always make changes later if needed."
      />
      <RegisterStepNav onBack={onBack} onContinue={undefined} backLabel="Back" className="justify-start" disabled={isSubmitting} />

      <RegisterFormCard className="rounded-[32px] shadow-none">
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[18px] font-extrabold leading-7 text-black">Business Information</p>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                disabled={isSubmitting}
                className="text-base font-extrabold text-primary underline underline-offset-4 disabled:opacity-60"
              >
                Edit
              </button>
            </div>
            <div className="mt-4">
              <Row label="BUSINESS NAME" value={v.businessName} />
              <Row label="CATEGORY" value={v.category} />
              <Row label="Contact Person" value={v.contactName} />
              <Row label="CONTACT EMAIL" value={v.contactEmail} />
              <Row label="MOBILE NUMBER" value={v.contactPhone ? `+91 ${v.contactPhone}` : ''} />
              <Row label="PAN" value={v.pan} />
              <Row label="GSTIN" value={v.gstin} />
              <Row label="Outlets" value={String(v.outletsCount ?? '')} />
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[18px] font-extrabold leading-7 text-black">Business Location &amp; Verification</p>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                disabled={isSubmitting}
                className="text-base font-extrabold text-primary underline underline-offset-4 disabled:opacity-60"
              >
                Edit
              </button>
            </div>
            <div className="mt-4">
              <Row label="Registered Business Address" value={v.addressLine1} />
              <Row label="City" value={v.city} />
              <Row label="State" value={v.state} />
              <Row label="PIN Code" value={v.pinCode} />
              <Row label="Set location on map" value={v.mapsUrl} />
              <Row label="Inside view" value={v.insideViewFileName} />
              <Row label="Outside view" value={v.outsideViewFileName} />
              <Row label="Logo" value={v.logoFileName} />
              <Row label="GST Certificate" value={v.gstCertFileName} />
              <Row label="PAN Card" value={v.panCardFileName} />
              <Row label="Address Proof" value={v.addressProofFileName} />
              <Row label="Shop Photo" value={v.shopPhotoFileName} />
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[18px] font-extrabold leading-7 text-black">Selected Plan</p>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                disabled={isSubmitting}
                className="text-base font-extrabold text-primary underline underline-offset-4 disabled:opacity-60"
              >
                Change Plan
              </button>
            </div>
            <div className="mt-4">
              <Row label="Plan" value={selectedPlan?.title ?? v.plan} />
              <Row label="Billing cycle" value={v.billingCycle ?? 'MONTHLY'} />
              <Row label="Summary" value={selectedPlan ? selectedPlan.highlights.join(' • ') : ''} />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white px-6 py-5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-5 w-5 rounded border-zinc-300 text-primary focus:ring-primary/30 disabled:opacity-60"
            />
            <span className="text-base font-semibold leading-6 text-zinc-900">
              I confirm that the above information is accurate and I agree to Perkzio&apos;s Terms of Service and Merchant Agreement.
            </span>
          </label>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting || !confirmed}
              className="h-14 rounded-full bg-gradient-to-r from-primary to-[#E91E8C] px-12 text-lg font-extrabold text-white shadow-[0_15px_30px_-8px_rgba(241,30,105,0.45)] hover:brightness-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting' : 'Review & Submit'}
            </button>
          </div>
        </div>
      </RegisterFormCard>
    </div>
  );
}

