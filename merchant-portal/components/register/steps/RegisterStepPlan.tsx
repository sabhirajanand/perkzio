'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import { ExternalLink } from 'lucide-react';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import RegisterStepNav from '@/components/register/RegisterStepNav';
import PlanOptionCard from '@/components/register/steps/plan/PlanOptionCard';
import { pricing } from '@/lib/pricing';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

function parseInrAmount(value: string): number | null {
  const m = value.match(/₹\s*([0-9][0-9,]*)/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export interface RegisterStepPlanProps {
  onBack: () => void;
  onNext: () => void;
}

export default function RegisterStepPlan({ onBack, onNext }: RegisterStepPlanProps) {
  const { watch, setValue, trigger } = useFormContext<RegisterApplicationInput>();
  const plan = watch('plan');
  const billingCycle = watch('billingCycle') || 'MONTHLY';

  const planCards = useMemo(() => pricing.plans, []);
  const activePlan = useMemo(() => planCards.find((p) => p.code === plan) ?? planCards[0], [plan, planCards]);

  const baseAmount = useMemo(() => {
    if (billingCycle === 'ANNUAL') {
      return activePlan.annual ? parseInrAmount(activePlan.annual) : null;
    }
    return parseInrAmount(activePlan.priceMonthly);
  }, [activePlan, billingCycle]);

  const gstAmount = useMemo(() => (baseAmount == null ? null : baseAmount * 0.18), [baseAmount]);
  void gstAmount;

  async function continueToReview() {
    const valid = await trigger(['plan', 'billingCycle']);
    if (!valid) return;
    onNext();
  }

  return (
    <div className="space-y-[30px]">
      <RegisterStepHeader
        stepIndex={3}
        title={
          <>
            Flexible <span className="text-primary">Plans</span> for Growth.
          </>
        }
        description="Select a plan that fits your business scale. You can always upgrade as your empire grows."
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-6">
        <RegisterStepNav onBack={onBack} onContinue={undefined} className="justify-start" />
        <Link
          href="/compare-plans"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-b-2 border-primary/25 pb-1 text-base font-extrabold text-primary hover:border-primary"
        >
          Compare Plans
          <ExternalLink className="h-4 w-4" aria-hidden />
        </Link>
      </div>

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

        <div className="mt-10 flex justify-center">
          <RegisterStepNav onBack={undefined} onContinue={continueToReview} />
        </div>
      </RegisterFormCard>
    </div>
  );
}
