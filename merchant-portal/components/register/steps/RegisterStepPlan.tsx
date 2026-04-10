'use client';

import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import CustomMerchantCardDesign from '@/components/register/steps/plan/CustomMerchantCardDesign';
import OrderSummaryCard from '@/components/register/steps/plan/OrderSummaryCard';
import PaymentSection from '@/components/register/steps/plan/PaymentSection';
import PlanOptionCard from '@/components/register/steps/plan/PlanOptionCard';
import { pricing } from '@/lib/pricing';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

function parseInrAmount(value: string): number | null {
  const m = value.match(/₹\s*([0-9][0-9,]*)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatInr(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Unable to load payments')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'checkout';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load payments'));
    document.body.appendChild(script);
  });
}

export interface RegisterStepPlanProps {
  onBack: () => void;
  onSubmitted: () => void;
}

export default function RegisterStepPlan({ onBack, onSubmitted }: RegisterStepPlanProps) {
  const { watch, setValue, getValues, trigger } = useFormContext<RegisterApplicationInput>();
  const plan = watch('plan');
  const billingCycle = watch('billingCycle') || 'MONTHLY';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planCards = useMemo(() => pricing.plans, []);
  const activePlan = useMemo(() => planCards.find((p) => p.code === plan) ?? planCards[0], [plan, planCards]);
  const isGrowthTrial = activePlan.code === 'GROWTH';

  const baseAmount = useMemo(() => {
    if (billingCycle === 'ANNUAL') {
      return activePlan.annual ? parseInrAmount(activePlan.annual) : null;
    }
    return parseInrAmount(activePlan.priceMonthly);
  }, [activePlan, billingCycle]);

  const gstAmount = useMemo(() => (baseAmount == null ? null : baseAmount * 0.18), [baseAmount]);
  const totalAmount = useMemo(() => (baseAmount == null || gstAmount == null ? null : baseAmount + gstAmount), [baseAmount, gstAmount]);

  async function submit() {
    const valid = await trigger();
    if (!valid) return;
    setIsSubmitting(true);
    try {
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
        await loadRazorpay();
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
        stepIndex={3}
        title={
          <>
            Choose Your <span className="text-primary">Plans</span>
          </>
        }
        description="Select a plan that fits your business scale. You can always upgrade as your empire grows."
      />

      <RegisterFormCard className="rounded-[32px] shadow-none">
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {planCards.map((p) => (
            <PlanOptionCard
              key={p.code}
              title={p.title}
              tierLabel={p.code === 'GROWTH' ? 'Scaling' : p.code === 'PRO' ? 'Advanced' : 'Standard'}
              price={p.priceMonthly}
              trialNote={'trialNote' in p ? p.trialNote : undefined}
              annualNote={'annual' in p ? p.annual : undefined}
              highlights={[...p.highlights]}
              isActive={p.code === plan}
              isRecommended={p.code === 'GROWTH'}
              onSelect={() => setValue('plan', p.code, { shouldValidate: true })}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[13fr_7fr] lg:items-start">
          <div className="space-y-6">
            <PaymentSection disabled={isSubmitting} />
            <CustomMerchantCardDesign priceLabel="Included (free)" />
          </div>
          <OrderSummaryCard
            planLabel={`${activePlan.title} Plan\n(${billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'})`}
            lines={[
              {
                label: 'Plan',
                value: isGrowthTrial ? formatInr(0) : baseAmount == null ? '—' : formatInr(baseAmount),
                muted: true,
              },
              { label: 'Merchant Verification Fee', value: formatInr(0), muted: true },
              {
                label: 'Taxes & GST (18%)',
                value: isGrowthTrial ? formatInr(0) : gstAmount == null ? '—' : formatInr(gstAmount),
                muted: true,
              },
              ...(isGrowthTrial
                ? [{ label: 'Trial', value: '30 days (pay method by day 21)', muted: true }]
                : []),
            ]}
            totalLabel={
              isGrowthTrial ? formatInr(0) : totalAmount == null ? '—' : formatInr(totalAmount)
            }
            ctaLabel={isSubmitting ? 'Submitting' : 'Submit application'}
            onCta={submit}
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-base font-extrabold text-primary hover:brightness-95"
            aria-label="Back to Business Location & Verification"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Business Location & Verification
          </button>
        </div>
      </RegisterFormCard>
    </div>
  );
}
