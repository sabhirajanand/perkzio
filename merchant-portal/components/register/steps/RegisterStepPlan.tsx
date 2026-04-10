'use client';

import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import CustomMerchantCardDesign from '@/components/register/steps/plan/CustomMerchantCardDesign';
import OrderSummaryCard from '@/components/register/steps/plan/OrderSummaryCard';
import PaymentSection from '@/components/register/steps/plan/PaymentSection';
import PlanOptionCard from '@/components/register/steps/plan/PlanOptionCard';
import Spinner from '@/components/ui/spinner';
import { pricing } from '@/lib/pricing';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

export interface RegisterStepPlanProps {
  onBack: () => void;
  onSubmitted: () => void;
}

export default function RegisterStepPlan({ onBack, onSubmitted }: RegisterStepPlanProps) {
  const { watch, setValue, getValues, trigger } = useFormContext<RegisterApplicationInput>();
  const plan = watch('plan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planCards = useMemo(() => pricing.plans, []);
  const activePlan = useMemo(() => planCards.find((p) => p.code === plan) ?? planCards[0], [plan, planCards]);

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
              highlights={
                p.code === 'GROWTH'
                  ? [...p.highlights, 'Priority 24/7 Support', 'Advanced Analytics', 'Custom Domain']
                  : [...p.highlights]
              }
              isActive={p.code === plan}
              isRecommended={p.code === 'GROWTH'}
              onSelect={() => setValue('plan', p.code, { shouldValidate: true })}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[13fr_7fr] lg:items-start">
          <div className="space-y-6">
            <PaymentSection disabled={isSubmitting} />
            <CustomMerchantCardDesign priceLabel="+$49" onAdd={() => {}} />
          </div>
          <OrderSummaryCard
            planLabel={`${activePlan.title} Plan\n(Monthly)`}
            lines={[
              { label: 'Plan', value: '$79.00', muted: true },
              { label: 'Merchant Verification Fee', value: '$0.00', muted: true },
              { label: 'Taxes & GST (18%)', value: '$14.22', muted: true },
            ]}
            totalLabel="$93.22"
            ctaLabel="Complete Payment"
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
