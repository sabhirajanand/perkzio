'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Card from '@/components/ui/card';
import PlanOptionCard from '@/components/register/steps/plan/PlanOptionCard';
import { pricing } from '@/lib/pricing';

type PlanCode = 'LITE' | 'GROWTH' | 'PRO';

type MerchantMe =
  | {
      ok: true;
      merchant: {
        plan: { code: PlanCode; name: string } | null;
        status: string;
      };
      user: { role: string };
    }
  | { message?: string };

function toTierLabel(code: PlanCode): 'Standard' | 'Scaling' | 'Advanced' {
  if (code === 'GROWTH') return 'Scaling';
  if (code === 'PRO') return 'Advanced';
  return 'Standard';
}

export default function SubscriptionPlanWorkspace() {
  const [me, setMe] = useState<MerchantMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlanCode: PlanCode | null = useMemo(() => {
    if (!me || typeof me !== 'object' || !('merchant' in me)) return null;
    const c = me.merchant.plan?.code;
    return c === 'LITE' || c === 'GROWTH' || c === 'PRO' ? c : null;
  }, [me]);

  const [selected, setSelected] = useState<PlanCode>('GROWTH');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/merchant/me')
      .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as MerchantMe | null) : null))
      .then((json) => {
        if (cancelled) return;
        setMe(json);
        const code =
          json && typeof json === 'object' && 'merchant' in json
            ? ((json as { merchant?: { plan?: { code?: unknown } | null } }).merchant?.plan?.code as unknown)
            : null;
        if (code === 'LITE' || code === 'GROWTH' || code === 'PRO') setSelected(code);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const planCards = useMemo(() => pricing.plans, []);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/merchant/subscription-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode: selected }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message = json && typeof json === 'object' && 'message' in json ? String((json as { message?: unknown }).message) : null;
        throw new Error(message || 'Unable to update subscription plan');
      }
      await fetch('/api/merchant/me')
        .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as MerchantMe | null) : null))
        .then((next) => setMe(next))
        .catch(() => null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update subscription plan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Loading subscription plan…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Subscription plan
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">{pricing.gstNote}</p>
        </div>
        <Link
          href="/compare-plans"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-b-2 border-primary/25 pb-1 text-base font-extrabold text-primary hover:border-primary"
        >
          Compare Plans
        </Link>
      </div>

      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">
          Current plan: <span className="text-primary">{currentPlanCode ?? '—'}</span>
        </p>
        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {planCards.map((p) => (
            <PlanOptionCard
              key={p.code}
              title={p.title}
              tierLabel={toTierLabel(p.code)}
              price={p.priceMonthly}
              trialNote={'trialNote' in p ? p.trialNote : undefined}
              annualNote={'annual' in p ? p.annual : undefined}
              highlights={[...p.highlights]}
              isActive={p.code === selected}
              isRecommended={p.code === 'GROWTH'}
              onSelect={() => setSelected(p.code)}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving || selected === currentPlanCode}
            className={
              saving || selected === currentPlanCode
                ? 'h-[55px] rounded-full bg-zinc-200 px-10 text-sm font-bold text-zinc-500'
                : 'h-[55px] rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-10 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95'
            }
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </Card>
    </div>
  );
}

