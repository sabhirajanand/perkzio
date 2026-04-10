'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { pricing } from '@/lib/pricing';
import type { OnboardingApplicationInput } from '@/lib/schemas/onboarding';

export default function PlanPaymentForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingApplicationInput | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'LITE' | 'GROWTH' | 'PRO'>('GROWTH');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('onboardingDraft');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as OnboardingApplicationInput;
      setDraft(parsed);
      setSelectedPlan(parsed.plan);
      setBillingCycle(parsed.billingCycle || 'MONTHLY');
    } catch {
      setDraft(null);
    }
  }, []);

  const planCards = useMemo(() => pricing.plans, []);

  async function submit() {
    if (!draft) {
      toast.error('Please complete the previous step');
      router.replace('/onboarding/location-documents');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OnboardingApplicationInput = { ...draft, plan: selectedPlan, billingCycle };
      const res = await fetch('/api/onboarding/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Submission failed');
      }
      sessionStorage.removeItem('onboardingDraft');
      router.replace('/onboarding/success');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Choose your plan</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{pricing.gstNote}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {planCards.map((p) => {
          const active = p.code === selectedPlan;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => setSelectedPlan(p.code)}
              className={[
                'text-left rounded-2xl p-5 ring-1 transition-colors',
                active ? 'bg-white ring-primary/30' : 'bg-zinc-50 ring-black/5 hover:bg-white',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900">{p.title}</div>
                {'badge' in p && p.badge ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 text-lg font-semibold text-zinc-900">{p.priceMonthly}</div>
              {'trialNote' in p && p.trialNote ? (
                <div className="mt-2 text-xs font-semibold text-zinc-600">{p.trialNote}</div>
              ) : null}
              {'annual' in p && p.annual ? (
                <div className="mt-1 text-xs font-semibold text-zinc-600">{p.annual}</div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm font-semibold text-zinc-900">Billing cycle</div>
        <button
          type="button"
          className={[
            'h-10 rounded-full px-5 text-sm font-semibold ring-1',
            billingCycle === 'MONTHLY' ? 'bg-primary text-white ring-primary/30' : 'bg-white ring-black/5',
          ].join(' ')}
          onClick={() => setBillingCycle('MONTHLY')}
        >
          Monthly
        </button>
        <button
          type="button"
          className={[
            'h-10 rounded-full px-5 text-sm font-semibold ring-1',
            billingCycle === 'ANNUAL' ? 'bg-primary text-white ring-primary/30' : 'bg-white ring-black/5',
          ].join(' ')}
          onClick={() => setBillingCycle('ANNUAL')}
        >
          Annual
        </button>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/onboarding/location-documents"
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
        >
          Back
        </Link>
        <Button onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Submitting
            </span>
          ) : (
            'Submit application'
          )}
        </Button>
      </div>
    </div>
  );
}

